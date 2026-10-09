import express from 'express';
import storage from '../services/storageService.js';
import iotService from '../services/iotService.js';

const router = express.Router();

// GET /api/rooms - List all rooms with grouped devices and sensors
router.get('/', (req, res) => {
  try {
    const rooms = storage.getRooms();
    const allDevices = storage.getDevices();
    const allSensors = storage.getSensors();

    const result = rooms.map(room => {
      const devices = allDevices.filter(d => d.room === room.id);
      const sensors = allSensors.filter(s => s.room === room.id);
      const activeDevices = devices.filter(d => d.state === 'ON').length;

      return {
        ...room,
        devices,
        sensors,
        stats: {
          totalDevices: devices.length,
          activeDevices,
          totalSensors: sensors.length,
        }
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/rooms/:id/toggle-all - Switch all appliances in room ON or OFF
router.post('/:id/toggle-all', async (req, res) => {
  try {
    const { state } = req.body;
    if (!state || (state !== 'ON' && state !== 'OFF')) {
      return res.status(400).json({ success: false, error: 'Valid state "ON" or "OFF" required.' });
    }

    const roomId = req.params.id;
    const roomDevices = storage.getDevices().filter(d => d.room === roomId);

    if (roomDevices.length === 0) {
      return res.status(404).json({ success: false, error: 'No devices found in this room.' });
    }

    const results = [];
    for (const dev of roomDevices) {
      try {
        const res = await iotService.sendCommand(dev.id, state, { source: 'room_bulk_toggle' });
        results.push({ id: dev.id, success: true });
      } catch (e) {
        results.push({ id: dev.id, success: false, error: e.message });
      }
    }

    res.json({
      success: true,
      message: `Executed bulk switch to ${state} for room ${roomId}`,
      results
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
