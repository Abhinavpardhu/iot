# 🏡 IoT-Based Smart Home Automation System

A modern, responsive, full-stack IoT dashboard and hardware gateway designed for an engineering project titled **“IoT-Based Smart Home Automation System”**.

The application provides real-time appliance control, environmental sensor monitoring, automated rule execution, and bidirectional telemetry with ESP32/ESP8266 microcontrollers over MQTT.

If physical hardware is not connected, the system seamlessly operates in a clearly marked **Demo Mode** with realistic simulated sensor streams and appliance states.

---

## 🌟 Key Features

- **Centralized Dashboard:** Overview metrics including total devices, appliances currently ON, active power draw (Watts/kW), and live environmental conditions.
- **Optimistic Device Controls:** Instant UI feedback with background confirmation and automatic state rollback on network or hardware failure.
- **Real-Time Telemetry & Charts:** Live temperature (DHT22/DHT11), humidity, PIR motion, ambient illuminance (LDR), and gas/smoke levels (MQ-2) with historical charts powered by Recharts.
- **Zone & Room Management:** Group appliances by room (Living Room, Master Bedroom, Kitchen, Study) with one-click master room toggles.
- **Smart Automation Rules:** Configurable sensor-triggered rules (e.g. motion turns on light, temperature threshold enables fan) with clear deployment status: *Demo Active*, *Hardware Deployed*, or *Saved & Inactive*.
- **System Audit Activity Log:** Real-time event logging capturing commands, telemetry events, automations, and network state changes.
- **Dual Operating Modes:**
  - 🧪 **Demo Mode (Initial Default):** Mathematical models simulate realistic environmental drifts, occupancy events, and sample energy calculations without physical hardware.
  - ⚡ **Hardware Mode:** Connects to an MQTT broker (e.g., HiveMQ, Mosquitto) and exchanges bidirectional commands and sensor telemetry with ESP32/ESP8266 microcontrollers.
- **Built-in Circuit & Firmware Documentation:** Complete pinout tables, topic schemas, and production-ready Arduino C++ sketches embedded in the app.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide React Icons, Recharts |
| **Backend** | Node.js (v22+), Express 4, Socket.IO 4 |
| **IoT Protocol** | MQTT (`mqtt.js` v5), REST API fallback |
| **Persistence** | Lightweight JSON/Atomic Storage (`backend/data/store.json`) |
| **Hardware** | ESP32 DevKit V1 / ESP8266 NodeMCU, 4-Channel Relays, DHT22, PIR, LDR, MQ-2 |

---

## 📂 Project Directory Structure

```text
iotpr22/
├── backend/
│   ├── config/             # Environment & MQTT configuration
│   ├── data/               # Persistent database store (JSON)
│   ├── routes/             # REST API routes (devices, sensors, rooms, automation, settings)
│   ├── services/           # IoT gateway service, simulator, rules engine, storage
│   ├── server.js           # Express + Socket.IO HTTP server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Layout, common cards, modals, toast alerts
│   │   ├── context/        # HomeContext with optimistic updates and live socket sync
│   │   ├── pages/          # Dashboard, Devices, Sensors, Rooms, Automation, Activity, Settings, Docs
│   │   ├── services/       # API client and Socket.IO client
│   │   ├── App.jsx         # Root app layout & routing
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── firmware/
│   ├── esp32_smart_home/   # Arduino C++ sketch for ESP32 with 4 relays & sensors
│   └── esp8266_smart_home/ # Arduino C++ sketch for ESP8266 NodeMCU
├── docs/
│   ├── API_DOCUMENTATION.md   # Complete REST endpoints guide
│   ├── MQTT_TOPIC_SPEC.md     # MQTT topic hierarchy & JSON schemas
│   └── HARDWARE_CIRCUIT_GUIDE.md # Wiring diagrams, BOM & pinout table
├── .env.example
├── .env
├── package.json            # Root scripts for single-command start
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18, v20, or v22 recommended)
- npm (v9+ or v10+)

### 2. Installation
Install all dependencies for root, backend, and frontend with a single command:
```bash
npm run install:all
```

Or install individually:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Run Development Servers (Single Command)
Run both backend (port 5000) and frontend (port 5173 with Vite HMR):
```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173`**

### 4. Build & Run Single Production Server
To build the frontend and serve both the web dashboard and API from port 5000:
```bash
npm run build:frontend
npm start
```
Then visit **`http://localhost:5000`**.

---

## 📡 Operating Modes

### 1. Demo Mode (Default for College Review)
- The application starts automatically in **Demo Mode**.
- Prominently labeled with a **"DEMO MODE — SIMULATED DATA"** banner.
- All appliance toggles, historical charts, and automation rules operate with realistic simulated values.
- Evaluators can review the full UI/UX, controls, and automation logic without connecting physical microcontrollers.

### 2. Hardware Mode (ESP32 / ESP8266 Connected)
1. Go to **Settings** in the web dashboard.
2. Toggle the mode switch to **HARDWARE MODE**.
3. Configure your MQTT broker (default: `mqtt://broker.hivemq.com:1883` or local Mosquitto `mqtt://localhost:1883`).
4. Upload `firmware/esp32_smart_home/esp32_smart_home.ino` to your ESP32 board.
5. In Hardware Mode, commands will only report successful state changes after receiving a physical acknowledgement packet (`[ESP-ACK]`) from the microcontroller.

---

## 🔌 Hardware Circuit & Pinout Summary

| ESP32 GPIO | Connected Component | Description |
| :--- | :--- | :--- |
| **GPIO 23** | Relay Channel 1 | Living Room Main Chandelier |
| **GPIO 22** | Relay Channel 2 | Living Room Cove Ambient Lamp |
| **GPIO 19** | Relay Channel 3 | Living Room Ceiling Fan |
| **GPIO 18** | Relay Channel 4 | Master Bedroom Lamp |
| **GPIO 4** | DHT22 / AM2302 Sensor | Temperature & Relative Humidity |
| **GPIO 13** | HC-SR501 PIR Sensor | Infrared Motion Detection |
| **GPIO 36 (VP)** | LDR Voltage Divider | Ambient Illuminance (lux) |
| **GPIO 39 (VN)** | MQ-2 Gas Sensor | Gas & Smoke Level (ppm) |

---

## 🎓 Viva / College Review Pointers

If asked during your project defense:
1. **Why MQTT over HTTP polling?**
   - MQTT is a lightweight publish/subscribe protocol with minimal packet overhead (2-byte header). It uses persistent TCP connections, eliminating the latency and bandwidth cost of repeated HTTP polling from microcontrollers.
2. **How does the frontend stay in sync?**
   - The backend acts as an IoT Gateway bridging MQTT and WebSockets (via Socket.IO). Whenever the ESP32 publishes a status or telemetry packet, the gateway immediately broadcasts it to all connected React clients.
3. **What is optimistic UI updating?**
   - When a user clicks a switch, the UI updates immediately for responsive interaction while dispatching the command asynchronously. If the hardware does not acknowledge the command within 4 seconds, the state is rolled back and an error notification is shown.
4. **How are automation rules evaluated?**
   - The backend runs an event-driven `AutomationEngine`. Whenever a sensor reading updates, active rules are evaluated against threshold conditions with debounce protection to prevent thrashing.

---

## 📄 License
MIT License. Developed for academic engineering project demonstration.
