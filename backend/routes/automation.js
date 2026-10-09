import express from 'express';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/automation - List all rules
router.get('/', (req, res) => {
  try {
    const rules = storage.getRules();
    const isHardware = storage.getSettings().systemMode === 'hardware';

    // Enrich with human-readable labels
    const enriched = rules.map(rule => {
      const sensor = storage.getSensorById(rule.triggerSensorId);
      const device = storage.getDeviceById(rule.targetDeviceId);
      return {
        ...rule,
        sensorName: sensor ? sensor.name : 'Unknown Sensor',
        sensorUnit: sensor ? sensor.unit : '',
        deviceName: device ? device.name : 'Unknown Device',
        currentModeStatus: !rule.isEnabled 
          ? 'saved_inactive' 
          : isHardware 
            ? 'hardware_active' 
            : 'demo_only'
      };
    });

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/automation - Create a new rule
router.post('/', (req, res) => {
  try {
    const { name, description, triggerSensorId, condition, threshold, targetDeviceId, targetState } = req.body;
    if (!name || !triggerSensorId || !condition || threshold === undefined || !targetDeviceId) {
      return res.status(400).json({
        success: false,
        error: 'Required fields: name, triggerSensorId, condition, threshold, targetDeviceId'
      });
    }

    const newRule = storage.addRule({
      name,
      description,
      triggerSensorId,
      condition,
      threshold,
      targetDeviceId,
      targetState: targetState || 'ON',
      isEnabled: true
    });

    res.status(201).json({ success: true, data: newRule });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/automation/:id - Update or toggle rule
router.put('/:id', (req, res) => {
  try {
    const updated = storage.updateRule(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/automation/:id - Delete rule
router.delete('/:id', (req, res) => {
  try {
    const deleted = storage.deleteRule(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Rule not found' });
    }
    res.json({ success: true, message: 'Rule deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
