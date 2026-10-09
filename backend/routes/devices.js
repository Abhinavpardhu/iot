import express from 'express';
import storage from '../services/storageService.js';
import iotService from '../services/iotService.js';

const router = express.Router();

// GET /api/devices - Get all devices
router.get('/', (req, res) => {
  try {
    const devices = storage.getDevices();
    const activeCount = devices.filter(d => d.state === 'ON').length;
    const onlineCount = devices.filter(d => d.isOnline).length;
    
    // Calculate total real-time power (Watts)
    const currentPowerWatts = devices
      .filter(d => d.state === 'ON')
      .reduce((acc, d) => acc + (d.powerWatts || 0), 0);

    res.json({
      success: true,
      data: devices,
      stats: {
        total: devices.length,
        active: activeCount,
        offline: devices.length - onlineCount,
        online: onlineCount,
        currentPowerWatts,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/devices/:id - Single device
router.get('/:id', (req, res) => {
  const device = storage.getDeviceById(req.params.id);
  if (!device) {
    return res.status(404).json({ success: false, error: 'Device not found' });
  }
  res.json({ success: true, data: device });
});

// POST /api/devices/:id/command - Send ON/OFF command
router.post('/:id/command', async (req, res) => {
  try {
    const { state } = req.body;
    if (!state || (state !== 'ON' && state !== 'OFF')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid state specified. Must be "ON" or "OFF".'
      });
    }

    const device = storage.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const result = await iotService.sendCommand(device.id, state, {
      source: 'web_dashboard'
    });

    res.json({
      success: true,
      message: result.message || `Device switched to ${state}.`,
      data: result.device,
      mode: result.mode,
      isSimulated: result.isSimulated,
    });
  } catch (err) {
    console.error(`[DeviceRoute] Command failed for ${req.params.id}:`, err.message);
    res.status(502).json({
      success: false,
      error: err.message,
      hint: 'Ensure MQTT broker and hardware are reachable, or switch to Demo Mode in Settings.'
    });
  }
});

// POST /api/devices - Add a new device
router.post('/', (req, res) => {
  try {
    const { name, room, type, pin, powerWatts } = req.body;
    if (!name || !room) {
      return res.status(400).json({ success: false, error: 'Name and room are required fields.' });
    }

    const newDevice = storage.addDevice({
      name,
      room,
      type: type || 'light',
      pin: pin || 'D0',
      powerWatts: powerWatts || 20
    });

    res.status(201).json({ success: true, data: newDevice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/devices/:id - Remove a device
router.delete('/:id', (req, res) => {
  try {
    const deleted = storage.deleteDevice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }
    res.json({ success: true, message: 'Device removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
