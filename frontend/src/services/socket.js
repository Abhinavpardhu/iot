import { io } from 'socket.io-client';

// Connect to current host, Vite proxies /socket.io to backend port 5000
const socket = io({
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export default socket;
