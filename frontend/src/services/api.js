const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: Request failed`);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Devices
  getDevices: () => request('/devices'),
  getDevice: (id) => request(`/devices/${id}`),
  toggleDevice: (id, state) => request(`/devices/${id}/command`, {
    method: 'POST',
    body: JSON.stringify({ state })
  }),
  createDevice: (device) => request('/devices', {
    method: 'POST',
    body: JSON.stringify(device)
  }),
  deleteDevice: (id) => request(`/devices/${id}`, {
    method: 'DELETE'
  }),

  // Sensors
  getSensors: () => request('/sensors'),
  getSensorHistory: (id) => request(`/sensors/${id}/history`),
  postSensorReading: (payload) => request('/sensors/reading', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Rooms
  getRooms: () => request('/rooms'),
  toggleRoomAll: (roomId, state) => request(`/rooms/${roomId}/toggle-all`, {
    method: 'POST',
    body: JSON.stringify({ state })
  }),

  // Automation
  getRules: () => request('/automation'),
  createRule: (rule) => request('/automation', {
    method: 'POST',
    body: JSON.stringify(rule)
  }),
  updateRule: (id, updates) => request(`/automation/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteRule: (id) => request(`/automation/${id}`, {
    method: 'DELETE'
  }),

  // Activity Logs
  getActivity: (limit = 50, type = null) => {
    const q = new URLSearchParams();
    if (limit) q.set('limit', limit);
    if (type) q.set('type', type);
    return request(`/activity?${q.toString()}`);
  },
  clearActivity: () => request('/activity', { method: 'DELETE' }),

  // Settings & Diagnostics
  getSettings: () => request('/settings'),
  updateSettings: (settings) => request('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings)
  }),
  testMqtt: (config) => request('/settings/test-mqtt', {
    method: 'POST',
    body: JSON.stringify(config)
  }),

  // Health
  getHealth: () => request('/health'),
};

export default api;
