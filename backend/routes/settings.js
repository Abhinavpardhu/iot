import express from 'express';
import mqtt from 'mqtt';
import storage from '../services/storageService.js';
import iotService from '../services/iotService.js';
import simulatorService from '../services/simulatorService.js';

const router = express.Router();

// GET /api/settings - Return current system settings
router.get('/', (req, res) => {
  try {
    const rawSettings = storage.getSettings();
    // Mask sensitive MQTT password if set
    const sanitizedMqtt = {
      ...rawSettings.mqtt,
      password: rawSettings.mqtt.password ? '••••••••' : '',
    };

    const diagnostics = iotService.getDiagnostics();

    res.json({
      success: true,
      data: {
        ...rawSettings,
        mqtt: sanitizedMqtt,
      },
      diagnostics
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings - Update system settings (mode, unit, MQTT parameters)
router.put('/', (req, res) => {
  try {
    const { systemMode, tempUnit, mqtt: mqttUpdates, demoSettings } = req.body;
    const currentSettings = storage.getSettings();

    const updates = {};

    if (systemMode && (systemMode === 'demo' || systemMode === 'hardware')) {
      updates.systemMode = systemMode;
    }

    if (tempUnit && (tempUnit === 'C' || tempUnit === 'F')) {
      updates.tempUnit = tempUnit;
    }

    if (demoSettings && typeof demoSettings === 'object') {
      updates.demoSettings = { ...currentSettings.demoSettings, ...demoSettings };
    }

    if (mqttUpdates && typeof mqttUpdates === 'object') {
      // Don't overwrite password with masked value
      const newPassword = (mqttUpdates.password && !mqttUpdates.password.includes('•••')) 
        ? mqttUpdates.password 
        : currentSettings.mqtt.password;

      updates.mqtt = {
        ...currentSettings.mqtt,
        brokerUrl: mqttUpdates.brokerUrl || currentSettings.mqtt.brokerUrl,
        clientId: mqttUpdates.clientId || currentSettings.mqtt.clientId,
        username: mqttUpdates.username !== undefined ? mqttUpdates.username : currentSettings.mqtt.username,
        password: newPassword,
        topicPrefix: mqttUpdates.topicPrefix || currentSettings.mqtt.topicPrefix,
      };
    }

    const saved = storage.updateSettings(updates);

    // React to mode change
    if (updates.systemMode) {
      if (updates.systemMode === 'hardware') {
        console.log('[Settings] Switching to HARDWARE MODE.');
        iotService.connectMqtt(saved.mqtt);
      } else {
        console.log('[Settings] Switching to DEMO MODE.');
        iotService.disconnectMqtt();
        simulatorService.start();
      }

      storage.addLog({
        type: 'MODE_CHANGE',
        deviceName: 'System Gateway',
        room: 'System',
        message: `Operating mode changed to ${updates.systemMode.toUpperCase()} MODE.`,
        status: 'info',
        isSimulated: updates.systemMode === 'demo'
      });
    } else if (updates.mqtt && saved.systemMode === 'hardware') {
      // Reconnect MQTT with updated configuration
      iotService.connectMqtt(saved.mqtt);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        ...saved,
        mqtt: {
          ...saved.mqtt,
          password: saved.mqtt.password ? '••••••••' : ''
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/test-mqtt - Test connection to broker without saving
router.post('/test-mqtt', (req, res) => {
  const { brokerUrl, clientId, username, password } = req.body;
  if (!brokerUrl) {
    return res.status(400).json({ success: false, error: 'brokerUrl is required' });
  }

  const testClient = mqtt.connect(brokerUrl, {
    clientId: clientId || `test_client_${Math.random().toString(16).substring(2, 8)}`,
    username: username || undefined,
    password: password || undefined,
    connectTimeout: 5000,
    reconnectPeriod: 0
  });

  let responded = false;

  const timer = setTimeout(() => {
    if (!responded) {
      responded = true;
      try { testClient.end(true); } catch(e){}
      return res.status(504).json({
        success: false,
        error: 'Connection timeout (5s). Check broker URL and network access.'
      });
    }
  }, 5000);

  testClient.on('connect', () => {
    if (!responded) {
      responded = true;
      clearTimeout(timer);
      testClient.end(true);
      return res.json({
        success: true,
        message: 'Successfully reached and authenticated with MQTT broker!'
      });
    }
  });

  testClient.on('error', (err) => {
    if (!responded) {
      responded = true;
      clearTimeout(timer);
      try { testClient.end(true); } catch(e){}
      return res.status(502).json({
        success: false,
        error: `Connection failed: ${err.message}`
      });
    }
  });
});

export default router;
