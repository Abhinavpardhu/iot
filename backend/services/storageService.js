import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'store.json');

// Initial seed data designed for rich, realistic smart home operation
const initialData = {
  settings: {
    systemMode: 'demo', // 'demo' | 'hardware'
    tempUnit: 'C', // 'C' | 'F'
    theme: 'dark',
    notificationsEnabled: true,
    mqtt: {
      brokerUrl: 'mqtt://broker.hivemq.com:1883',
      clientId: 'esp32_gateway_station_1',
      username: '',
      password: '',
      topicPrefix: 'home',
      connected: false,
      lastPing: null,
      messagesReceived: 0,
      messagesSent: 0,
    },
    demoSettings: {
      fluctuateSensors: true,
      randomMotion: true,
      simulationSpeed: 'normal',
    }
  },
  rooms: [
    { id: 'living-room', name: 'Living Room', icon: 'Sofa', floor: 'Ground Floor', color: '#06b6d4' },
    { id: 'bedroom', name: 'Master Bedroom', icon: 'Bed', floor: '1st Floor', color: '#3b82f6' },
    { id: 'kitchen', name: 'Kitchen', icon: 'Utensils', floor: 'Ground Floor', color: '#10b981' },
    { id: 'study', name: 'Study & Office', icon: 'BookOpen', floor: '1st Floor', color: '#8b5cf6' }
  ],
  devices: [
    {
      id: 'light_lr_main',
      name: 'Main Ceiling Chandelier',
      room: 'living-room',
      type: 'light',
      state: 'OFF',
      isOnline: true,
      powerWatts: 24,
      lastUpdated: new Date().toISOString(),
      pin: 'D23',
      mqttTopic: 'home/living-room/light1',
      isHardwareAcknowledged: false,
    },
    {
      id: 'light_lr_ambient',
      name: 'Cove Accent Lighting',
      room: 'living-room',
      type: 'light',
      state: 'ON',
      isOnline: true,
      powerWatts: 14,
      lastUpdated: new Date().toISOString(),
      pin: 'D22',
      mqttTopic: 'home/living-room/light2',
      isHardwareAcknowledged: false,
    },
    {
      id: 'fan_lr_ceiling',
      name: 'Smart Ceiling Fan',
      room: 'living-room',
      type: 'fan',
      state: 'ON',
      isOnline: true,
      powerWatts: 65,
      lastUpdated: new Date().toISOString(),
      pin: 'D19',
      mqttTopic: 'home/living-room/fan',
      isHardwareAcknowledged: false,
    },
    {
      id: 'light_br_main',
      name: 'Bedside Nightstand Lamp',
      room: 'bedroom',
      type: 'light',
      state: 'OFF',
      isOnline: true,
      powerWatts: 8,
      lastUpdated: new Date().toISOString(),
      pin: 'D18',
      mqttTopic: 'home/bedroom/light1',
      isHardwareAcknowledged: false,
    },
    {
      id: 'ac_br_cooling',
      name: 'Inverter Air Conditioner',
      room: 'bedroom',
      type: 'climate',
      state: 'OFF',
      isOnline: true,
      powerWatts: 950,
      lastUpdated: new Date().toISOString(),
      pin: 'D5',
      mqttTopic: 'home/bedroom/ac',
      isHardwareAcknowledged: false,
    },
    {
      id: 'plug_kt_kettle',
      name: 'Coffee Maker / Smart Plug',
      room: 'kitchen',
      type: 'plug',
      state: 'OFF',
      isOnline: true,
      powerWatts: 1200,
      lastUpdated: new Date().toISOString(),
      pin: 'D4',
      mqttTopic: 'home/kitchen/plug1',
      isHardwareAcknowledged: false,
    },
    {
      id: 'light_kt_under',
      name: 'Kitchen Counter Lights',
      room: 'kitchen',
      type: 'light',
      state: 'ON',
      isOnline: true,
      powerWatts: 18,
      lastUpdated: new Date().toISOString(),
      pin: 'D15',
      mqttTopic: 'home/kitchen/light1',
      isHardwareAcknowledged: false,
    },
    {
      id: 'light_st_desk',
      name: 'Study Task Desk Lamp',
      room: 'study',
      type: 'light',
      state: 'ON',
      isOnline: true,
      powerWatts: 12,
      lastUpdated: new Date().toISOString(),
      pin: 'D2',
      mqttTopic: 'home/study/light1',
      isHardwareAcknowledged: false,
    },
    {
      id: 'plug_st_pc',
      name: 'Workstation Surge Protector',
      room: 'study',
      type: 'plug',
      state: 'ON',
      isOnline: true,
      powerWatts: 185,
      lastUpdated: new Date().toISOString(),
      pin: 'D14',
      mqttTopic: 'home/study/plug1',
      isHardwareAcknowledged: false,
    }
  ],
  sensors: [
    {
      id: 'temp_living_room',
      name: 'DHT22 Ambient Temperature',
      room: 'living-room',
      type: 'temperature',
      value: 24.2,
      unit: '°C',
      min: 15,
      max: 40,
      isOnline: true,
      lastUpdated: new Date().toISOString(),
      hardwarePin: 'GPIO4',
      mqttTopic: 'home/living-room/temperature',
      history: generateInitialHistory(24.2, 0.5, 12)
    },
    {
      id: 'humidity_living_room',
      name: 'DHT22 Relative Humidity',
      room: 'living-room',
      type: 'humidity',
      value: 52.4,
      unit: '%',
      min: 20,
      max: 90,
      isOnline: true,
      lastUpdated: new Date().toISOString(),
      hardwarePin: 'GPIO4',
      mqttTopic: 'home/living-room/humidity',
      history: generateInitialHistory(52.4, 1.2, 12)
    },
    {
      id: 'motion_living_room',
      name: 'HC-SR501 PIR Motion Sensor',
      room: 'living-room',
      type: 'motion',
      value: 0, // 0 = Clear, 1 = Detected
      unit: '',
      isOnline: true,
      lastUpdated: new Date().toISOString(),
      hardwarePin: 'GPIO13',
      mqttTopic: 'home/living-room/motion',
      history: []
    },
    {
      id: 'light_living_room',
      name: 'LDR Ambient Illuminance',
      room: 'living-room',
      type: 'light',
      value: 385,
      unit: 'lux',
      min: 0,
      max: 1000,
      isOnline: true,
      lastUpdated: new Date().toISOString(),
      hardwarePin: 'ADC0/VP',
      mqttTopic: 'home/living-room/light',
      history: generateInitialHistory(385, 20, 12)
    },
    {
      id: 'temp_bedroom',
      name: 'DHT11 Bedroom Temperature',
      room: 'bedroom',
      type: 'temperature',
      value: 22.8,
      unit: '°C',
      min: 15,
      max: 40,
      isOnline: true,
      lastUpdated: new Date().toISOString(),
      hardwarePin: 'GPIO16',
      mqttTopic: 'home/bedroom/temperature',
      history: generateInitialHistory(22.8, 0.4, 12)
    },
    {
      id: 'humidity_bedroom',
      name: 'DHT11 Bedroom Humidity',
      room: 'bedroom',
      type: 'humidity',
      value: 48.0,
      unit: '%',
      min: 20,
      max: 90,
      isOnline: true,
      lastUpdated: new Date().toISOString(),
      hardwarePin: 'GPIO16',
      mqttTopic: 'home/bedroom/humidity',
      history: generateInitialHistory(48.0, 1.0, 12)
    },
    {
      id: 'gas_kitchen',
      name: 'MQ-2 LPG & Gas Detector',
      room: 'kitchen',
      type: 'gas',
      value: 26,
      unit: 'ppm',
      min: 0,
      max: 500,
      alertThreshold: 120,
      isOnline: true,
      lastUpdated: new Date().toISOString(),
      hardwarePin: 'ADC1/VN',
      mqttTopic: 'home/kitchen/gas',
      history: generateInitialHistory(26, 2, 12)
    }
  ],
  automationRules: [
    {
      id: 'rule_1',
      name: 'Motion-Activated Welcome Light',
      description: 'Switch on Living Room Chandelier whenever PIR motion is detected.',
      triggerSensorId: 'motion_living_room',
      condition: 'equals',
      threshold: 1,
      targetDeviceId: 'light_lr_main',
      targetState: 'ON',
      isEnabled: true,
      mode: 'demo_only', // 'demo_only' | 'saved_inactive' | 'hardware_active'
      lastTriggered: null
    },
    {
      id: 'rule_2',
      name: 'Automated Fan On Warm Climate',
      description: 'Automatically engage ceiling fan if living room temp exceeds 27.5 °C.',
      triggerSensorId: 'temp_living_room',
      condition: 'greater_than',
      threshold: 27.5,
      targetDeviceId: 'fan_lr_ceiling',
      targetState: 'ON',
      isEnabled: true,
      mode: 'demo_only',
      lastTriggered: null
    },
    {
      id: 'rule_3',
      name: 'Night Dusk Accent Illuminator',
      description: 'Turn on Living Room Accent Lamp when light falls below 150 lux.',
      triggerSensorId: 'light_living_room',
      condition: 'less_than',
      threshold: 150,
      targetDeviceId: 'light_lr_ambient',
      targetState: 'ON',
      isEnabled: false,
      mode: 'saved_inactive',
      lastTriggered: null
    },
    {
      id: 'rule_4',
      name: 'Kitchen Hazard Emergency Cutoff',
      description: 'Emergency shutdown of kitchen smart plug if gas exceeds 120 ppm.',
      triggerSensorId: 'gas_kitchen',
      condition: 'greater_than',
      threshold: 120,
      targetDeviceId: 'plug_kt_kettle',
      targetState: 'OFF',
      isEnabled: true,
      mode: 'demo_only',
      lastTriggered: null
    }
  ],
  activityLogs: [
    {
      id: 'log_boot_1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'CONNECTION',
      deviceName: 'System Gateway',
      room: 'Central',
      message: 'IoT Smart Home Gateway initialized successfully.',
      status: 'success',
      isSimulated: true
    },
    {
      id: 'log_boot_2',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      type: 'MODE_CHANGE',
      deviceName: 'Environment',
      room: 'System',
      message: 'Operating in DEMO MODE with realistic simulated sensor streams.',
      status: 'info',
      isSimulated: true
    },
    {
      id: 'log_boot_3',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      type: 'DEVICE_COMMAND',
      deviceName: 'Cove Accent Lighting',
      room: 'Living Room',
      message: 'Appliance state set to ON.',
      status: 'success',
      isSimulated: true
    },
    {
      id: 'log_boot_4',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      type: 'AUTOMATION_TRIGGER',
      deviceName: 'Smart Ceiling Fan',
      room: 'Living Room',
      message: 'Triggered by rule "Automated Fan On Warm Climate".',
      status: 'info',
      isSimulated: true
    }
  ]
};

function generateInitialHistory(baseVal, spread, points) {
  const list = [];
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now - i * 180000).toISOString();
    const noise = (Math.random() - 0.5) * spread * 2;
    list.push({
      timestamp: time,
      value: parseFloat((baseVal + noise).toFixed(1))
    });
  }
  return list;
}

class StorageService {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure required keys exist in case of partial upgrade
        this.data.settings = { ...initialData.settings, ...(this.data.settings || {}) };
        if (!this.data.rooms) this.data.rooms = initialData.rooms;
        if (!this.data.devices) this.data.devices = initialData.devices;
        if (!this.data.sensors) this.data.sensors = initialData.sensors;
        if (!this.data.automationRules) this.data.automationRules = initialData.automationRules;
        if (!this.data.activityLogs) this.data.activityLogs = initialData.activityLogs;
      } else {
        this.data = JSON.parse(JSON.stringify(initialData));
        this.save();
      }
    } catch (err) {
      console.error('[StorageService] Error loading database, falling back to initial data:', err.message);
      this.data = JSON.parse(JSON.stringify(initialData));
    }
  }

  save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[StorageService] Error saving database:', err.message);
    }
  }

  // --- Settings ---
  getSettings() {
    return { ...this.data.settings };
  }

  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.data.settings;
  }

  // --- Devices ---
  getDevices() {
    return [...this.data.devices];
  }

  getDeviceById(id) {
    return this.data.devices.find(d => d.id === id);
  }

  updateDevice(id, updates) {
    const idx = this.data.devices.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data.devices[idx] = {
      ...this.data.devices[idx],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    this.save();
    return this.data.devices[idx];
  }

  addDevice(deviceData) {
    const id = deviceData.id || `dev_${Date.now()}`;
    const newDevice = {
      id,
      name: deviceData.name || 'New Appliance',
      room: deviceData.room || 'living-room',
      type: deviceData.type || 'light',
      state: 'OFF',
      isOnline: true,
      powerWatts: Number(deviceData.powerWatts) || 20,
      lastUpdated: new Date().toISOString(),
      pin: deviceData.pin || 'D0',
      mqttTopic: deviceData.mqttTopic || `home/${deviceData.room || 'living-room'}/${id}`,
      isHardwareAcknowledged: false,
      ...deviceData
    };
    this.data.devices.push(newDevice);
    this.save();
    return newDevice;
  }

  deleteDevice(id) {
    const idx = this.data.devices.findIndex(d => d.id === id);
    if (idx === -1) return false;
    this.data.devices.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Sensors ---
  getSensors() {
    return [...this.data.sensors];
  }

  getSensorById(id) {
    return this.data.sensors.find(s => s.id === id);
  }

  updateSensorReading(id, value, options = {}) {
    const sensor = this.data.sensors.find(s => s.id === id);
    if (!sensor) return null;

    const numValue = typeof value === 'number' ? parseFloat(value.toFixed(1)) : value;
    sensor.value = numValue;
    sensor.lastUpdated = new Date().toISOString();
    if (options.isOnline !== undefined) sensor.isOnline = options.isOnline;

    if (!sensor.history) sensor.history = [];
    sensor.history.push({
      timestamp: sensor.lastUpdated,
      value: numValue
    });
    // Keep last 30 data points for performance
    if (sensor.history.length > 30) {
      sensor.history.shift();
    }

    this.save();
    return sensor;
  }

  // --- Rooms ---
  getRooms() {
    return [...this.data.rooms];
  }

  // --- Automation Rules ---
  getRules() {
    return [...this.data.automationRules];
  }

  addRule(ruleData) {
    const id = ruleData.id || `rule_${Date.now()}`;
    const newRule = {
      id,
      name: ruleData.name || 'Unnamed Rule',
      description: ruleData.description || '',
      triggerSensorId: ruleData.triggerSensorId,
      condition: ruleData.condition || 'greater_than',
      threshold: Number(ruleData.threshold),
      targetDeviceId: ruleData.targetDeviceId,
      targetState: ruleData.targetState || 'ON',
      isEnabled: ruleData.isEnabled !== false,
      mode: this.data.settings.systemMode === 'hardware' ? 'hardware_active' : 'demo_only',
      lastTriggered: null,
      ...ruleData
    };
    this.data.automationRules.push(newRule);
    this.save();
    return newRule;
  }

  updateRule(id, updates) {
    const idx = this.data.automationRules.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.automationRules[idx] = { ...this.data.automationRules[idx], ...updates };
    this.save();
    return this.data.automationRules[idx];
  }

  deleteRule(id) {
    const idx = this.data.automationRules.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.data.automationRules.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Activity Logs ---
  getLogs(limit = 50, filterType = null) {
    let list = [...this.data.activityLogs];
    if (filterType) {
      list = list.filter(l => l.type === filterType);
    }
    list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list.slice(0, limit);
  }

  addLog(entry) {
    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type: entry.type || 'INFO',
      deviceName: entry.deviceName || 'System',
      room: entry.room || 'General',
      message: entry.message || '',
      status: entry.status || 'info', // 'success' | 'warning' | 'error' | 'info'
      isSimulated: this.data.settings.systemMode === 'demo',
      ...entry
    };
    this.data.activityLogs.unshift(log);
    // Keep max 200 logs
    if (this.data.activityLogs.length > 200) {
      this.data.activityLogs.pop();
    }
    this.save();
    return log;
  }

  clearLogs() {
    this.data.activityLogs = [];
    this.save();
    return true;
  }
}

export const storage = new StorageService();
export default storage;
