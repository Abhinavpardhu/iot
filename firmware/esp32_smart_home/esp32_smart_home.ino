/**
 * ==============================================================================
 * PROJECT: IoT-Based Smart Home Automation System
 * HARDWARE NODE: ESP32 Microcontroller Node
 * FIRMWARE: Arduino C++ / ESP32 Core
 * LIBRARIES REQUIRED (Install via Arduino Library Manager):
 *  - WiFi (Built-in to ESP32 core)
 *  - PubSubClient by Nick O'Leary (v2.8+)
 *  - DHT sensor library by Adafruit
 *  - Adafruit Unified Sensor
 *  - ArduinoJson by Benoit Blanchon (v6.x or v7.x)
 * ==============================================================================
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ==================== 1. NETWORK & MQTT CONFIGURATION ====================
// Replace with your local 2.4GHz WiFi credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT Broker (HiveMQ Public Broker, Mosquitto, EMQX, or Local Broker IP)
const char* MQTT_BROKER   = "broker.hivemq.com";
const int   MQTT_PORT     = 1883;
const char* MQTT_USER     = "";  // Leave blank if no auth
const char* MQTT_PASS     = "";  // Leave blank if no auth
const char* CLIENT_ID     = "ESP32_SmartHome_Gateway_01";

// ==================== 2. GPIO PIN DEFINITIONS ====================
// 4-Channel Relay Output Pins (Active LOW for standard optocoupled relay modules)
#define RELAY_CH1_PIN  23  // Living Room Main Chandelier
#define RELAY_CH2_PIN  22  // Living Room Cove Lamp
#define RELAY_CH3_PIN  19  // Living Room Ceiling Fan
#define RELAY_CH4_PIN  18  // Bedroom Bedside Lamp

// Sensor Input Pins
#define DHT_PIN        4   // DHT22 Temperature & Humidity Sensor (Digital Pin 4)
#define DHT_TYPE       DHT22
#define PIR_PIN        13  // HC-SR501 PIR Motion Sensor (Digital In)
#define LDR_PIN        36  // LDR Light Sensor (Analog ADC1_CH0 / VP)
#define GAS_PIN        39  // MQ-2 Gas Sensor (Analog ADC1_CH3 / VN)

// Onboard LED Indicator
#define STATUS_LED     2   // ESP32 onboard blue LED

// ==================== 3. OBJECTS & STATE VARIABLES ====================
WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastSensorPublish = 0;
const unsigned long SENSOR_INTERVAL = 5000; // Publish sensors every 5 seconds

unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 15000; // Heartbeat every 15 seconds

int lastPirState = -1;

// ==================== 4. MQTT TOPICS ====================
// Command Topics (ESP32 subscribes to these)
const char* TOPIC_CMD_LIGHT1 = "home/living-room/light1/command";
const char* TOPIC_CMD_LIGHT2 = "home/living-room/light2/command";
const char* TOPIC_CMD_FAN    = "home/living-room/fan/command";
const char* TOPIC_CMD_BR_L1  = "home/bedroom/light1/command";

// Status Acknowledgement Topics (ESP32 publishes state confirmations)
const char* TOPIC_STAT_LIGHT1 = "home/living-room/light1/status";
const char* TOPIC_STAT_LIGHT2 = "home/living-room/light2/status";
const char* TOPIC_STAT_FAN    = "home/living-room/fan/status";
const char* TOPIC_STAT_BR_L1  = "home/bedroom/light1/status";

// Telemetry Topics
const char* TOPIC_TEMP        = "home/living-room/temperature";
const char* TOPIC_HUMIDITY    = "home/living-room/humidity";
const char* TOPIC_MOTION      = "home/living-room/motion";
const char* TOPIC_LIGHT       = "home/living-room/light";
const char* TOPIC_GAS         = "home/kitchen/gas";
const char* TOPIC_HEARTBEAT   = "home/heartbeat";

// ==================== 5. WIFI SETUP ====================
void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("[WiFi] Connecting to SSID: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("[WiFi] Connected successfully!");
    Serial.print("[WiFi] Assigned IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("[WiFi] Warning: Connection timed out. Running in offline loop.");
  }
}

// ==================== 6. MQTT INCOMING MESSAGE CALLBACK ====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  // Convert payload buffer to null-terminated string
  char msg[length + 1];
  memcpy(msg, payload, length);
  msg[length] = '\0';

  Serial.print("[MQTT] Inbound message on [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(msg);

  // Parse JSON command payload: {"state":"ON"} or {"state":"OFF"}
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, msg);
  if (error) {
    Serial.print("[JSON] Parsing failed: ");
    Serial.println(error.c_str());
    return;
  }

  const char* targetState = doc["state"];
  if (!targetState) return;

  bool turnOn = (strcmp(targetState, "ON") == 0);

  // Check which device topic was targeted
  if (strcmp(topic, TOPIC_CMD_LIGHT1) == 0) {
    // Relays are active LOW: LOW = Relay energized (ON), HIGH = De-energized (OFF)
    digitalWrite(RELAY_CH1_PIN, turnOn ? LOW : HIGH);
    publishStatus(TOPIC_STAT_LIGHT1, turnOn ? "ON" : "OFF");
  } 
  else if (strcmp(topic, TOPIC_CMD_LIGHT2) == 0) {
    digitalWrite(RELAY_CH2_PIN, turnOn ? LOW : HIGH);
    publishStatus(TOPIC_STAT_LIGHT2, turnOn ? "ON" : "OFF");
  } 
  else if (strcmp(topic, TOPIC_CMD_FAN) == 0) {
    digitalWrite(RELAY_CH3_PIN, turnOn ? LOW : HIGH);
    publishStatus(TOPIC_STAT_FAN, turnOn ? "ON" : "OFF");
  } 
  else if (strcmp(topic, TOPIC_CMD_BR_L1) == 0) {
    digitalWrite(RELAY_CH4_PIN, turnOn ? LOW : HIGH);
    publishStatus(TOPIC_STAT_BR_L1, turnOn ? "ON" : "OFF");
  }
}

// Helper to publish device status acknowledgement
void publishStatus(const char* statusTopic, const char* state) {
  StaticJsonDocument<128> doc;
  doc["state"] = state;
  doc["online"] = true;
  doc["acknowledged"] = true;

  char buffer[128];
  serializeJson(doc, buffer);
  mqttClient.publish(statusTopic, buffer, true);
  Serial.print("[MQTT] Published ACK to: ");
  Serial.println(statusTopic);
}

// ==================== 7. MQTT RECONNECT ====================
void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("[MQTT] Attempting connection to broker...");
    if (mqttClient.connect(CLIENT_ID, MQTT_USER, MQTT_PASS)) {
      Serial.println(" CONNECTED!");

      // Subscribe to command topics
      mqttClient.subscribe(TOPIC_CMD_LIGHT1);
      mqttClient.subscribe(TOPIC_CMD_LIGHT2);
      mqttClient.subscribe(TOPIC_CMD_FAN);
      mqttClient.subscribe(TOPIC_CMD_BR_L1);

      // Announce online status
      mqttClient.publish("home/gateway/status", "{\"status\":\"online\",\"hardware\":\"ESP32\"}", true);
    } else {
      Serial.print(" Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(". Retrying in 4 seconds...");
      delay(4000);
    }
  }
}

// ==================== 8. SENSOR TELEMETRY READINGS ====================
void readAndPublishSensors() {
  // 1. Read DHT22
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (!isnan(temperature)) {
    StaticJsonDocument<128> doc;
    doc["value"] = round(temperature * 10) / 10.0;
    doc["unit"] = "°C";
    char buf[128];
    serializeJson(doc, buf);
    mqttClient.publish(TOPIC_TEMP, buf);
  }

  if (!isnan(humidity)) {
    StaticJsonDocument<128> doc;
    doc["value"] = round(humidity * 10) / 10.0;
    doc["unit"] = "%";
    char buf[128];
    serializeJson(doc, buf);
    mqttClient.publish(TOPIC_HUMIDITY, buf);
  }

  // 2. Read LDR (0 - 4095 mapped roughly to 0 - 1000 lux)
  int rawLdr = analogRead(LDR_PIN);
  int lux = map(rawLdr, 0, 4095, 0, 1000);
  StaticJsonDocument<128> ldrDoc;
  ldrDoc["value"] = lux;
  ldrDoc["unit"] = "lux";
  char ldrBuf[128];
  serializeJson(ldrDoc, ldrBuf);
  mqttClient.publish(TOPIC_LIGHT, ldrBuf);

  // 3. Read MQ-2 Gas Sensor (Analog ppm estimation)
  int rawGas = analogRead(GAS_PIN);
  int gasPpm = map(rawGas, 0, 4095, 10, 300);
  StaticJsonDocument<128> gasDoc;
  gasDoc["value"] = gasPpm;
  gasDoc["unit"] = "ppm";
  char gasBuf[128];
  serializeJson(gasDoc, gasBuf);
  mqttClient.publish(TOPIC_GAS, gasBuf);
}

void checkPIRMotion() {
  int pirVal = digitalRead(PIR_PIN);
  if (pirVal != lastPirState) {
    lastPirState = pirVal;
    StaticJsonDocument<128> doc;
    doc["value"] = pirVal;
    doc["state"] = (pirVal == HIGH) ? "DETECTED" : "CLEAR";
    char buf[128];
    serializeJson(doc, buf);
    mqttClient.publish(TOPIC_MOTION, buf);
    Serial.println(pirVal == HIGH ? "[PIR] Motion Detected!" : "[PIR] Motion Cleared.");
  }
}

// ==================== 9. ARDUINO SETUP ====================
void setup() {
  Serial.begin(115200);
  Serial.println("\n--- IoT Smart Home Automation Node Starting ---");

  // Configure Relays (active LOW)
  pinMode(RELAY_CH1_PIN, OUTPUT);
  pinMode(RELAY_CH2_PIN, OUTPUT);
  pinMode(RELAY_CH3_PIN, OUTPUT);
  pinMode(RELAY_CH4_PIN, OUTPUT);

  // Default state: OFF (HIGH for active LOW relays)
  digitalWrite(RELAY_CH1_PIN, HIGH);
  digitalWrite(RELAY_CH2_PIN, HIGH);
  digitalWrite(RELAY_CH3_PIN, HIGH);
  digitalWrite(RELAY_CH4_PIN, HIGH);

  // Configure Sensor Pins
  pinMode(PIR_PIN, INPUT);
  pinMode(STATUS_LED, OUTPUT);

  // Initialize DHT
  dht.begin();

  // WiFi & MQTT Setup
  setupWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
}

// ==================== 10. MAIN EVENT LOOP ====================
void loop() {
  // Ensure WiFi is connected
  if (WiFi.status() != WL_CONNECTED) {
    setupWiFi();
  }

  // Ensure MQTT is connected
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Fast PIR motion check
  checkPIRMotion();

  // Periodic sensor readings
  unsigned long now = millis();
  if (now - lastSensorPublish >= SENSOR_INTERVAL) {
    lastSensorPublish = now;
    readAndPublishSensors();
  }

  // Periodic heartbeat
  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    lastHeartbeat = now;
    char hbMsg[100];
    snprintf(hbMsg, sizeof(hbMsg), "{\"uptime_ms\":%lu,\"rssi\":%d}", now, WiFi.RSSI());
    mqttClient.publish(TOPIC_HEARTBEAT, hbMsg);
  }
}
