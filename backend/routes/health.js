import express from 'express';
import storage from '../services/storageService.js';
import iotService from '../services/iotService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const settings = storage.getSettings();
  const devices = storage.getDevices();
  const sensors = storage.getSensors();
  const diagnostics = iotService.getDiagnostics();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    systemMode: settings.systemMode,
    isDemoMode: settings.systemMode === 'demo',
    metrics: {
      devicesCount: devices.length,
      activeDevices: devices.filter(d => d.state === 'ON').length,
      sensorsCount: sensors.length,
      onlineSensors: sensors.filter(s => s.isOnline).length,
    },
    mqtt: diagnostics.mqtt,
  });
});

export default router;
