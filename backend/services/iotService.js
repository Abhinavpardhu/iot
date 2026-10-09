import mqtt from 'mqtt';
import config from '../config/config.js';
import storage from './storageService.js';

class IoTService {
  constructor() {
    this.client = null;
    this.io = null;
    this.isConnected = false;
    this.lastPing = null;
    this.messagesReceived = 0;
    this.messagesSent = 0;
    this.pendingCommands = new Map(); // For hardware ACK tracking
    this.automationEngine = null;
  }

  init(io, automationEngine) {
    this.io = io;
    this.automationEngine = automationEngine;

    const settings = storage.getSettings();
    if (settings.systemMode === 'hardware' || config.mqtt.enabled) {
      this.connectMqtt(settings.mqtt);
    } else {
      console.log('[IoTService] Starting in DEMO MODE. Physical MQTT connection inactive.');
    }
  }

  /**
   * Connect to MQTT broker for physical IoT hardware (ESP32/ESP8266)
   */
  connectMqtt(customConfig = {}) {
    if (this.client) {
      try {
        this.client.end(true);
      } catch (e) {
        // ignore
      }
    }

    const brokerUrl = customConfig.brokerUrl || config.mqtt.brokerUrl;
    const clientId = customConfig.clientId || config.mqtt.clientId;
    const username = customConfig.username || config.mqtt.username || undefined;
    const password = customConfig.password || config.mqtt.password || undefined;
    const prefix = customConfig.topicPrefix || config.mqtt.topicPrefix || 'home';

    console.log(`[IoTService] Connecting to MQTT broker: ${brokerUrl} (client: ${clientId})`);

    const options = {
      clientId,
      reconnectPeriod: 4000,
      connectTimeout: 8000,
      clean: true,
    };
    if (username) options.username = username;
    if (password) options.password = password;

    try {
      this.client = mqtt.connect(brokerUrl, options);

      this.client.on('connect', () => {
        this.isConnected = true;
        this.lastPing = new Date().toISOString();
        console.log('[IoTService] Connected to MQTT broker successfully.');
        
        storage.updateSettings({
          mqtt: {
            ...storage.getSettings().mqtt,
            connected: true,
            lastPing: this.lastPing,
          }
        });

        // Subscribe to commands, statuses, and sensors
        const subTopics = [
          `${prefix}/+/+/status`,
          `${prefix}/+/+/command`,
          `${prefix}/+/temperature`,
          `${prefix}/+/humidity`,
          `${prefix}/+/motion`,
          `${prefix}/+/light`,
          `${prefix}/+/gas`,
          `${prefix}/status`,
          `${prefix}/heartbeat`
        ];

        subTopics.forEach(t => {
          this.client.subscribe(t, { qos: 1 }, (err) => {
            if (err) console.error(`[IoTService] Error subscribing to ${t}:`, err.message);
            else console.log(`[IoTService] Subscribed to topic: ${t}`);
          });
        });

        if (this.io) {
          this.io.emit('system:mqtt_status', {
            connected: true,
            brokerUrl,
            timestamp: this.lastPing
          });
        }
      });

      this.client.on('message', (topic, messageBuffer) => {
        this.handleIncomingMessage(topic, messageBuffer.toString());
      });

      this.client.on('error', (err) => {
        console.error('[IoTService] MQTT Connection Error:', err.message);
        this.isConnected = false;
        storage.updateSettings({
          mqtt: { ...storage.getSettings().mqtt, connected: false }
        });
        if (this.io) {
          this.io.emit('system:mqtt_status', { connected: false, error: err.message });
        }
      });

      this.client.on('offline', () => {
        this.isConnected = false;
        console.log('[IoTService] MQTT Client went offline.');
        storage.updateSettings({
          mqtt: { ...storage.getSettings().mqtt, connected: false }
        });
      });
    } catch (err) {
      console.error('[IoTService] Failed to initialize MQTT client:', err.message);
      this.isConnected = false;
    }
  }

  disconnectMqtt() {
    if (this.client) {
      this.client.end(true);
      this.client = null;
      this.isConnected = false;
      storage.updateSettings({
        mqtt: { ...storage.getSettings().mqtt, connected: false }
      });
      console.log('[IoTService] MQTT client disconnected.');
    }
  }

  /**
   * Handle incoming MQTT messages from ESP32/ESP8266 or sensors
   */
  handleIncomingMessage(topic, rawMessage) {
    this.messagesReceived++;
    let payload;
    try {
      payload = JSON.parse(rawMessage);
    } catch (err) {
      console.warn(`[IoTService] Rejected malformed JSON from topic ${topic}:`, rawMessage);
      return;
    }

    const parts = topic.split('/');
    // Example: home/living-room/light1/status
    // or home/living-room/temperature
    const prefix = parts[0];
    const room = parts[1];
    const sub = parts[2];
    const action = parts[3];

    // Status message from device
    if (action === 'status') {
      this.handleDeviceStatus(room, sub, payload);
    } else if (['temperature', 'humidity', 'motion', 'light', 'gas'].includes(sub)) {
      this.handleSensorData(room, sub, payload);
    } else if (topic.endsWith('/heartbeat')) {
      console.log(`[IoTService] Heartbeat from hardware:`, payload);
      this.lastPing = new Date().toISOString();
      if (this.io) {
        this.io.emit('hardware:heartbeat', { ...payload, timestamp: this.lastPing });
      }
    }
  }

  handleDeviceStatus(room, deviceIdentifier, payload) {
    // Validate payload
    if (!payload || (payload.state !== 'ON' && payload.state !== 'OFF')) {
      console.warn(`[IoTService] Invalid device status payload:`, payload);
      return;
    }

    // Find device matching topic or room/id
    const devices = storage.getDevices();
    const device = devices.find(d => 
      d.mqttTopic.endsWith(`/${deviceIdentifier}`) || 
      d.id === deviceIdentifier ||
      (d.room === room && d.id.includes(deviceIdentifier))
    );

    if (device) {
      const updated = storage.updateDevice(device.id, {
        state: payload.state,
        isOnline: payload.online !== undefined ? Boolean(payload.online) : true,
        isHardwareAcknowledged: true,
      });

      // Resolve pending ACK if any
      const pendingKey = `${device.id}_${payload.state}`;
      if (this.pendingCommands.has(pendingKey)) {
        const resolve = this.pendingCommands.get(pendingKey);
        this.pendingCommands.delete(pendingKey);
        resolve({ success: true, device: updated });
      }

      // Log event
      const log = storage.addLog({
        type: 'DEVICE_COMMAND',
        deviceName: device.name,
        room: device.room,
        message: `Hardware status confirmed: ${payload.state}`,
        status: 'success',
        isSimulated: false,
      });

      if (this.io) {
        this.io.emit('device:updated', updated);
        this.io.emit('activity:new', log);
      }
    }
  }

  async handleSensorData(room, sensorType, payload) {
    const value = payload.value !== undefined ? payload.value : payload;
    if (typeof value !== 'number') {
      console.warn(`[IoTService] Invalid sensor value received for ${sensorType}:`, payload);
      return;
    }

    // Match sensor in room
    const sensors = storage.getSensors();
    const sensor = sensors.find(s => s.room === room && s.type === sensorType);

    if (sensor) {
      const updated = storage.updateSensorReading(sensor.id, value, {
        isOnline: true
      });

      if (this.io) {
        this.io.emit('sensor:updated', updated);
      }

      // Evaluate automation rules
      if (this.automationEngine) {
        await this.automationEngine.evaluateSensor(updated);
      }
    }
  }

  /**
   * Send command to appliance.
   * If in Demo Mode: immediately resolves with simulated response.
   * If in Hardware Mode: publishes MQTT command and awaits acknowledgment.
   */
  async sendCommand(deviceId, targetState, meta = {}) {
    const device = storage.getDeviceById(deviceId);
    if (!device) {
      throw new Error(`Device with ID "${deviceId}" not found.`);
    }

    const settings = storage.getSettings();
    const isHardwareMode = settings.systemMode === 'hardware';

    if (!isHardwareMode) {
      // --- DEMO MODE SIMULATION ---
      // Simulate realistic network delay (100-200ms)
      await new Promise(res => setTimeout(res, 120));

      const updated = storage.updateDevice(deviceId, {
        state: targetState,
        isHardwareAcknowledged: false,
      });

      const log = storage.addLog({
        type: 'DEVICE_COMMAND',
        deviceName: device.name,
        room: device.room,
        message: meta.source === 'automation' 
          ? `[Demo Rule: ${meta.ruleName}] Set state to ${targetState}`
          : `User toggled switch to ${targetState} (Simulated)`,
        status: 'success',
        isSimulated: true,
      });

      if (this.io) {
        this.io.emit('device:updated', updated);
        this.io.emit('activity:new', log);
      }

      return {
        success: true,
        device: updated,
        mode: 'demo',
        isSimulated: true,
        message: `Command simulated successfully for ${device.name}.`
      };
    }

    // --- HARDWARE MODE ---
    if (!this.isConnected || !this.client) {
      const log = storage.addLog({
        type: 'ERROR',
        deviceName: device.name,
        room: device.room,
        message: `Command failed: MQTT broker not connected in hardware mode.`,
        status: 'error',
        isSimulated: false,
      });
      if (this.io) this.io.emit('activity:new', log);

      throw new Error('MQTT broker is offline. Connect hardware or switch to Demo Mode.');
    }

    const commandTopic = `${device.mqttTopic}/command`;
    const payload = JSON.stringify({
      state: targetState,
      timestamp: new Date().toISOString(),
      source: meta.source || 'web-dashboard'
    });

    this.messagesSent++;

    return new Promise((resolve, reject) => {
      const timeoutMs = 4000;
      const pendingKey = `${device.id}_${targetState}`;

      const timer = setTimeout(() => {
        this.pendingCommands.delete(pendingKey);
        const log = storage.addLog({
          type: 'ERROR',
          deviceName: device.name,
          room: device.room,
          message: `Hardware command timed out. No ACK from ${device.name}.`,
          status: 'error',
          isSimulated: false,
        });
        if (this.io) this.io.emit('activity:new', log);

        reject(new Error(`Device "${device.name}" did not acknowledge command within ${timeoutMs / 1000}s.`));
      }, timeoutMs);

      this.pendingCommands.set(pendingKey, (res) => {
        clearTimeout(timer);
        resolve({
          ...res,
          mode: 'hardware',
          isSimulated: false,
        });
      });

      this.client.publish(commandTopic, payload, { qos: 1 }, (err) => {
        if (err) {
          clearTimeout(timer);
          this.pendingCommands.delete(pendingKey);
          reject(new Error(`Failed to publish command to MQTT broker: ${err.message}`));
        }
      });
    });
  }

  getDiagnostics() {
    const settings = storage.getSettings();
    return {
      systemMode: settings.systemMode,
      mqtt: {
        brokerUrl: settings.mqtt.brokerUrl,
        clientId: settings.mqtt.clientId,
        connected: this.isConnected,
        lastPing: this.lastPing,
        messagesReceived: this.messagesReceived,
        messagesSent: this.messagesSent,
        topicPrefix: settings.mqtt.topicPrefix,
      },
      registeredDevices: storage.getDevices().length,
      registeredSensors: storage.getSensors().length,
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }
}

export const iotService = new IoTService();
export default iotService;
