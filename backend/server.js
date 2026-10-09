import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import storage from './services/storageService.js';
import iotService from './services/iotService.js';
import automationEngine from './services/automationEngine.js';
import simulatorService from './services/simulatorService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../frontend/dist');

// Route imports
import devicesRouter from './routes/devices.js';
import sensorsRouter from './routes/sensors.js';
import roomsRouter from './routes/rooms.js';
import automationRouter from './routes/automation.js';
import activityRouter from './routes/activity.js';
import settingsRouter from './routes/settings.js';
import healthRouter from './routes/health.js';

const app = express();
const server = http.createServer(app);

// CORS configuration - allow Vite dev server and specified origins
const corsOptions = {
  origin: (origin, callback) => {
    // allow localhost, 127.0.0.1, or specified clientOrigin
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize subsystems
automationEngine.init(io, iotService);
iotService.init(io, automationEngine);
simulatorService.init(io, automationEngine);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial state synchronization to new client
  socket.emit('init:state', {
    settings: storage.getSettings(),
    devices: storage.getDevices(),
    sensors: storage.getSensors(),
    rooms: storage.getRooms(),
    rules: storage.getRules(),
    recentLogs: storage.getLogs(15),
  });

  socket.on('device:command', async (data, callback) => {
    try {
      const { deviceId, state } = data;
      const result = await iotService.sendCommand(deviceId, state, { source: 'socket' });
      if (typeof callback === 'function') {
        callback({ success: true, result });
      }
    } catch (err) {
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.use('/api/devices', devicesRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/automation', automationRouter);
app.use('/api/activity', activityRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/health', healthRouter);

// Serve static frontend files if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  // Fallback API directory
  app.get('/', (req, res) => {
    res.json({
      name: 'IoT Smart Home Automation Gateway API',
      version: '1.0.0',
      mode: storage.getSettings().systemMode,
      endpoints: {
        health: '/api/health',
        devices: '/api/devices',
        sensors: '/api/sensors',
        rooms: '/api/rooms',
        automation: '/api/automation',
        activity: '/api/activity',
        settings: '/api/settings',
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 IoT Smart Home Gateway Server running on port ${PORT}`);
  console.log(`📊 Mode: [${storage.getSettings().systemMode.toUpperCase()}]`);
  console.log(`🌐 API: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Clean shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down IoT Server...');
  simulatorService.stop();
  iotService.disconnectMqtt();
  server.close(() => {
    process.exit(0);
  });
});
