import express from 'express';
import storage from '../services/storageService.js';

const router = express.Router();

// GET /api/activity - Fetch activity logs with optional filtering
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const type = req.query.type || null;
    const logs = storage.getLogs(limit, type);

    res.json({
      success: true,
      data: logs,
      total: logs.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/activity - Clear logs
router.delete('/', (req, res) => {
  try {
    storage.clearLogs();
    res.json({ success: true, message: 'Activity history cleared' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
