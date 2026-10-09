/**
 * ==============================================================================
 * PROJECT: IoT-Based Smart Home Automation System
 * HARDWARE NODE: ESP8266 NodeMCU (ESP-12E)
 * FIRMWARE: Arduino C++ / ESP8266 Core
 * ==============================================================================
 */

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* MQTT_BROKER   = "broker.hivemq.com";
const int   MQTT_PORT     = 1883;
const char* MQTT_USER     = "";
const char* MQTT_PASS     = "";
const char* CLIENT_ID     = "ESP8266_NodeMCU_SmartHome";

// NodeMCU Pin Mapping
#define RELAY_CH1  D1  // GPIO 5 - Living Room Light
#define RELAY_CH2  D2  // GPIO 4 - Living Room Accent
#define RELAY_CH3  D5  // GPIO 14 - Fan
#define RELAY_CH4  D6  // GPIO 12 - Bedroom Light

#define DHT_PIN    D7  // GPIO 13 - DHT11 / DHT22
#define DHT_TYPE   DHT11
#define PIR_PIN    D8  // GPIO 15 - PIR Motion

WiFiClient espClient;
PubSubClient mqttClient(espClient);
DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastSensorPublish = 0;

void setupWiFi() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected. IP: " + WiFi.localIP().toString());
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  char msg[length + 1];
  memcpy(msg, payload, length);
  msg[length] = '\0';

  StaticJsonDocument<200> doc;
  deserializeJson(doc, msg);
  const char* state = doc["state"];

  if (!state) return;
  bool turnOn = (strcmp(state, "ON") == 0);

  if (strcmp(topic, "home/living-room/light1/command") == 0) {
    digitalWrite(RELAY_CH1, turnOn ? LOW : HIGH);
    mqttClient.publish("home/living-room/light1/status", turnOn ? "{\"state\":\"ON\",\"online\":true}" : "{\"state\":\"OFF\",\"online\":true}");
  } else if (strcmp(topic, "home/living-room/fan/command") == 0) {
    digitalWrite(RELAY_CH3, turnOn ? LOW : HIGH);
    mqttClient.publish("home/living-room/fan/status", turnOn ? "{\"state\":\"ON\",\"online\":true}" : "{\"state\":\"OFF\",\"online\":true}");
  }
}

void reconnect() {
  while (!mqttClient.connected()) {
    if (mqttClient.connect(CLIENT_ID, MQTT_USER, MQTT_PASS)) {
      mqttClient.subscribe("home/+/+/command");
    } else {
      delay(3000);
    }
  }
}

void setup() {
  pinMode(RELAY_CH1, OUTPUT);
  pinMode(RELAY_CH2, OUTPUT);
  pinMode(RELAY_CH3, OUTPUT);
  pinMode(RELAY_CH4, OUTPUT);
  pinMode(PIR_PIN, INPUT);

  digitalWrite(RELAY_CH1, HIGH);
  digitalWrite(RELAY_CH2, HIGH);
  digitalWrite(RELAY_CH3, HIGH);
  digitalWrite(RELAY_CH4, HIGH);

  dht.begin();
  setupWiFi();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastSensorPublish > 6000) {
    lastSensorPublish = now;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t)) {
      char buf[64];
      snprintf(buf, sizeof(buf), "{\"value\":%.1f,\"unit\":\"°C\"}", t);
      mqttClient.publish("home/living-room/temperature", buf);
    }
    if (!isnan(h)) {
      char buf[64];
      snprintf(buf, sizeof(buf), "{\"value\":%.1f,\"unit\":\"%%\"}", h);
      mqttClient.publish("home/living-room/humidity", buf);
    }
  }
}
