# IoT Smart Home Gateway — REST API Documentation

This backend service provides a RESTful API and WebSocket interface to interact with appliances, read environmental sensor metrics, manage room zones, and configure automation rules.

Base URL: `http://localhost:5000/api`

---

## 1. System Health & Diagnostics

### `GET /api/health`
Checks whether the gateway is online and returns server metrics.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-09T07:10:07.493Z",
  "uptime": 45.2,
  "environment": "development",
  "systemMode": "demo",
  "isDemoMode": true,
  "metrics": {
    "devicesCount": 9,
    "activeDevices": 5,
    "sensorsCount": 7,
    "onlineSensors": 7
  },
  "mqtt": {
    "brokerUrl": "mqtt://broker.hivemq.com:1883",
    "clientId": "esp32_gateway_station_1",
    "connected": false,
    "lastPing": null,
    "messagesReceived": 0,
    "messagesSent": 0,
    "topicPrefix": "home"
  }
}
```

---

## 2. Appliance & Device Management

### `GET /api/devices`
Retrieves all registered household devices and load statistics.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "light_lr_main",
      "name": "Main Ceiling Chandelier",
      "room": "living-room",
      "type": "light",
      "state": "OFF",
      "isOnline": true,
      "powerWatts": 24,
      "lastUpdated": "2026-10-09T07:15:00.000Z",
      "pin": "D23",
      "mqttTopic": "home/living-room/light1",
      "isHardwareAcknowledged": false
    }
  ],
  "stats": {
    "total": 9,
    "active": 4,
    "offline": 0,
    "online": 9,
    "currentPowerWatts": 286
  }
}
```

### `POST /api/devices/:id/command`
Toggles an appliance state.

**Request Body:**
```json
{
  "state": "ON"
}
```

**Response `200 OK` (Demo Mode):**
```json
{
  "success": true,
  "message": "Device switched to ON.",
  "data": {
    "id": "light_lr_main",
    "state": "ON",
    "isHardwareAcknowledged": false
  },
  "mode": "demo",
  "isSimulated": true
}
```

**Response `502 Bad Gateway` (Hardware Mode when MQTT Broker is unreachable):**
```json
{
  "success": false,
  "error": "MQTT broker is offline. Connect hardware or switch to Demo Mode.",
  "hint": "Ensure MQTT broker and hardware are reachable, or switch to Demo Mode in Settings."
}
```

### `POST /api/devices`
Registers a new appliance into the home inventory.

**Request Body:**
```json
{
  "name": "Balcony Lamp",
  "room": "living-room",
  "type": "light",
  "pin": "GPIO14",
  "powerWatts": 12
}
```

### `DELETE /api/devices/:id`
Deletes a registered appliance.

---

## 3. Sensors & Telemetry

### `GET /api/sensors`
Lists all environmental sensors and their latest values.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "temp_living_room",
      "name": "DHT22 Ambient Temperature",
      "room": "living-room",
      "type": "temperature",
      "value": 24.5,
      "unit": "°C",
      "isOnline": true,
      "hardwarePin": "GPIO4",
      "mqttTopic": "home/living-room/temperature",
      "lastUpdated": "2026-10-09T07:12:30.000Z"
    }
  ]
}
```

### `GET /api/sensors/:id/history`
Returns time-series data points for telemetry charts.

### `POST /api/sensors/reading`
Allows microcontrollers without MQTT support to ingest readings via HTTP REST:
```json
{
  "sensorId": "temp_living_room",
  "value": 25.8
}
```

---

## 4. Room Management

### `GET /api/rooms`
Returns aggregated room data with grouped appliances and sensor values.

### `POST /api/rooms/:id/toggle-all`
Switches all appliances within a room zone ON or OFF:
```json
{
  "state": "OFF"
}
```

---

## 5. Automation Rules Engine

### `GET /api/automation`
Lists all automation rules with their current deployment mode (`demo_only`, `hardware_active`, `saved_inactive`).

### `POST /api/automation`
Creates a new sensor-triggered automation rule:
```json
{
  "name": "Auto Fan On High Temp",
  "description": "Turn on ceiling fan when temperature exceeds 28°C",
  "triggerSensorId": "temp_living_room",
  "condition": "greater_than",
  "threshold": 28,
  "targetDeviceId": "fan_lr_ceiling",
  "targetState": "ON"
}
```

### `PUT /api/automation/:id`
Enables, disables, or modifies a rule.

---

## 6. Settings & MQTT Configuration

### `GET /api/settings`
Returns sanitized settings (passwords masked).

### `PUT /api/settings`
Updates system mode (`demo` or `hardware`), temperature units (`C` or `F`), and MQTT broker credentials.

### `POST /api/settings/test-mqtt`
Tests broker reachability and returns connection latency without saving.
