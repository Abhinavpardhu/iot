import express from 'express';
import storage from '../services/storageService.js';
import automationEngine from '../services/automationEngine.js';

const router = express.Router();

// GET /api/sensors - List all sensors
router.get('/', (req, res) => {
  try {
    const sensors = storage.getSensors();
    res.json({
      success: true,
      data: sensors,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/sensors/:id/history - Get time-series historical data
router.get('/:id/history', (req, res) => {
  try {
    const sensor = storage.getSensorById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ success: false, error: 'Sensor not found' });
    }
    res.json({
      success: true,
      sensorId: sensor.id,
      name: sensor.name,
      unit: sensor.unit,
      data: sensor.history || [],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/sensors/reading - Direct REST ingestion endpoint (useful for ESP32/ESP8266 HTTP clients)
router.post('/reading', async (req, res) => {
  try {
    const { sensorId, room, type, value } = req.body;
    let targetSensor = null;

    if (sensorId) {
      targetSensor = storage.getSensorById(sensorId);
    } else if (room && type) {
      targetSensor = storage.getSensors().find(s => s.room === room && s.type === type);
    }

    if (!targetSensor) {
      return res.status(404).json({ success: false, error: 'Target sensor not located.' });
    }

    if (value === undefined || isNaN(Number(value))) {
      return res.status(400).json({ success: false, error: 'Numeric value required.' });
    }

    const updated = storage.updateSensorReading(targetSensor.id, Number(value), { isOnline: true });

    // Evaluate rules
    await automationEngine.evaluateSensor(updated);

    res.json({
      success: true,
      message: 'Sensor reading ingested',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
