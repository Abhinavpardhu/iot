import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  systemMode: process.env.SYSTEM_MODE || 'demo', // 'demo' | 'hardware'
  
  // MQTT Settings (used when in hardware mode)
  mqtt: {
    enabled: process.env.MQTT_ENABLED === 'true',
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883',
    clientId: process.env.MQTT_CLIENT_ID || `smarthome_srv_${Math.random().toString(16).substring(2, 8)}`,
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    topicPrefix: process.env.MQTT_TOPIC_PREFIX || 'home',
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  },

  // Simulation parameters for Demo Mode
  simulator: {
    intervalMs: parseInt(process.env.SIMULATOR_INTERVAL_MS || '3500', 10),
    fluctuationRange: 0.4,
    motionProbability: 0.15,
  },

  // Security / Rate limits
  apiPrefix: '/api',
};

export default config;
