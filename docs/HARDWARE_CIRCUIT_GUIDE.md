# IoT Hardware Circuit & Wiring Guide (ESP32 / ESP8266)

This document provides complete circuit wiring instructions, hardware pinouts, power distribution guidelines, and troubleshooting tips for building the physical IoT Smart Home node.

---

## 1. Bill of Materials (BOM)

| Component | Quantity | Purpose | Operating Voltage |
| :--- | :--- | :--- | :--- |
| **ESP32 DevKit V1 (30 or 38 pin)** | 1 | Microcontroller with WiFi & Bluetooth | 3.3V Logic / 5V Vin |
| **4-Channel Relay Module (Optocoupled)** | 1 | High-voltage AC appliance switching | 5V VCC / 3.3V Input compatible |
| **DHT22 (AM2302) or DHT11 Sensor** | 1 | Ambient Temperature & Relative Humidity | 3.3V - 5V |
| **HC-SR501 PIR Motion Sensor** | 1 | Passive Infrared Motion Detection | 5V VCC / 3.3V Output TTL |
| **LDR (Light Dependent Resistor) + 10kΩ Resistor** | 1 | Ambient Light Sensor (Voltage Divider) | 3.3V |
| **MQ-2 Gas / Smoke Sensor** | 1 | LPG / Smoke detector | 5V VCC / Analog Out |
| **5V 2A External Power Adapter** | 1 | Regulated power supply | 5V DC |
| **Breadboard & Jumper Wires** | 1 set | Circuit connections | - |

---

## 2. Pinout Connection Table

### Relay Module Wiring
> [!IMPORTANT]
> Most 4-Channel relay modules use **active-LOW** trigger logic:
> - Driving the pin `LOW` (0V) activates the relay coil.
> - Driving the pin `HIGH` (3.3V) deactivates the relay coil.

| Relay Module Pin | ESP32 GPIO Pin | Description |
| :--- | :--- | :--- |
| **VCC** | **5V (VIN)** | Powers relay coils |
| **GND** | **GND** | Common Ground |
| **IN1** | **GPIO 23** | Channel 1: Living Room Chandelier |
| **IN2** | **GPIO 22** | Channel 2: Living Room Accent Lamp |
| **IN3** | **GPIO 19** | Channel 3: Ceiling Fan |
| **IN4** | **GPIO 18** | Channel 4: Bedroom Lamp |

---

### Sensors Wiring

| Sensor | Sensor Pin | ESP32 GPIO Pin | Notes |
| :--- | :--- | :--- | :--- |
| **DHT22** | VCC | 3.3V | |
| **DHT22** | DATA | **GPIO 4** | Connect 10kΩ pull-up resistor between VCC and DATA |
| **DHT22** | GND | GND | |
| **HC-SR501 PIR** | VCC | 5V (VIN) | Needs 5V power |
| **HC-SR501 PIR** | OUT | **GPIO 13** | 3.3V TTL output signal |
| **HC-SR501 PIR** | GND | GND | |
| **LDR** | Pin 1 | 3.3V | Voltage divider circuit |
| **LDR** | Pin 2 + 10kΩ | **GPIO 36 (VP)** | Analog ADC input |
| **MQ-2 Gas** | VCC | 5V (VIN) | Heater requires 5V |
| **MQ-2 Gas** | AOUT | **GPIO 39 (VN)** | Analog ADC input |
| **MQ-2 Gas** | GND | GND | Common Ground |

---

## 3. High Voltage (AC 220V/110V) Safety Caution

> [!WARNING]
> When testing with real mains electricity (230V AC):
> 1. Never touch relay terminals while the circuit is connected to mains.
> 2. Connect the **Live (Phase)** wire through the relay **COM (Common)** and **NO (Normally Open)** screw terminals.
> 3. Connect the **Neutral** wire directly to the appliance/lamp.
> 4. For college viva demonstrations, safely use **5V/12V DC LED lamps** or buzzers instead of high-voltage AC mains.

---

## 4. Software Setup (Arduino IDE)

1. Open Arduino IDE (v2.x or v1.8.x).
2. Install ESP32 Board Support:
   - File -> Preferences -> Additional Board Manager URLs:
     `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   - Tools -> Board -> Boards Manager -> Search `esp32` -> Click **Install**.
3. Install required libraries from Library Manager:
   - `PubSubClient` by Nick O'Leary
   - `DHT sensor library` by Adafruit
   - `ArduinoJson` by Benoit Blanchon
4. Open `firmware/esp32_smart_home/esp32_smart_home.ino`.
5. Enter your local WiFi SSID and Password.
6. Select Board: **DOIT ESP32 DEVKIT V1**, select your COM port, and click **Upload**.
