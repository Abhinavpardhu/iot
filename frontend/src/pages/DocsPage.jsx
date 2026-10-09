import React, { useState } from 'react';
import { 
  Cpu, 
  Terminal, 
  Radio, 
  Layers, 
  Check, 
  Copy, 
  Zap, 
  BookOpen, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function DocsPage() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const samplePayloadCommand = `// Topic: home/living-room/light1/command
{
  "state": "ON",
  "timestamp": "2026-10-09T12:00:00Z"
}`;

  const samplePayloadStatus = `// Topic: home/living-room/light1/status
{
  "state": "ON",
  "online": true
}`;

  const samplePayloadSensor = `// Topic: home/living-room/temperature
{
  "value": 24.5,
  "unit": "°C",
  "timestamp": "2026-10-09T12:00:00Z"
}`;

  const esp32Snippet = `/*
 * ESP32 Smart Home Node Firmware (Snippet)
 * Connects to WiFi, HiveMQ/Mosquitto MQTT, and handles relays & DHT22
 */
#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

#define DHTPIN 4
#define DHTTYPE DHT22
#define PIR_PIN 13
#define RELAY_1 23 // Living Room Light
#define RELAY_2 22 // Living Room Accent
#define RELAY_3 19 // Ceiling Fan
#define RELAY_4 18 // Bedroom Light

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_1, OUTPUT);
  pinMode(RELAY_2, OUTPUT);
  pinMode(RELAY_3, OUTPUT);
  pinMode(RELAY_4, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  
  // Relays are typically active LOW
  digitalWrite(RELAY_1, HIGH);
  digitalWrite(RELAY_2, HIGH);
  digitalWrite(RELAY_3, HIGH);
  digitalWrite(RELAY_4, HIGH);

  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, payload, length);
  const char* state = doc["state"];

  if (strcmp(topic, "home/living-room/light1/command") == 0) {
    if (strcmp(state, "ON") == 0) {
      digitalWrite(RELAY_1, LOW); // Turn ON
      client.publish("home/living-room/light1/status", "{\\"state\\":\\"ON\\",\\"online\\":true}");
    } else {
      digitalWrite(RELAY_1, HIGH); // Turn OFF
      client.publish("home/living-room/light1/status", "{\\"state\\":\\"OFF\\",\\"online\\":true}");
    }
  }
}
// Full sketch located in: firmware/esp32_smart_home/esp32_smart_home.ino`;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          IoT Hardware Integration & Circuit Architecture Guide
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete engineering reference for connecting an ESP32 or ESP8266 microcontroller board with sensors, relays, and MQTT message brokers.
        </p>
      </div>

      {/* System Architecture Block Flow */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          System Data Flow Architecture
        </h3>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full md:w-auto flex-1">
            <span className="text-cyan-400 font-bold block mb-1">React 19 Frontend</span>
            <span className="text-slate-400 text-[11px]">Vite + Tailwind + Recharts</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full md:w-auto flex-1">
            <span className="text-blue-400 font-bold block mb-1">Node.js Express Gateway</span>
            <span className="text-slate-400 text-[11px]">Socket.IO + REST + Rules Engine</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full md:w-auto flex-1">
            <span className="text-amber-400 font-bold block mb-1">MQTT Message Broker</span>
            <span className="text-slate-400 text-[11px]">HiveMQ / Mosquitto (Port 1883)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full md:w-auto flex-1">
            <span className="text-emerald-400 font-bold block mb-1">ESP32 Hardware Node</span>
            <span className="text-slate-400 text-[11px]">4-Ch Relays + DHT22 + PIR + LDR</span>
          </div>
        </div>
      </div>

      {/* Pinout Wiring Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          ESP32 GPIO Pin Assignment
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-mono">
              <tr>
                <th className="p-3 rounded-l-lg">ESP32 Pin</th>
                <th className="p-3">Component</th>
                <th className="p-3">Interface</th>
                <th className="p-3">Direction</th>
                <th className="p-3 rounded-r-lg">Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 23</td>
                <td className="p-3 text-white">Relay Channel 1</td>
                <td className="p-3 text-slate-400">Digital Out</td>
                <td className="p-3 text-amber-400">Output</td>
                <td className="p-3 text-slate-300">Living Room Main Chandelier</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 22</td>
                <td className="p-3 text-white">Relay Channel 2</td>
                <td className="p-3 text-slate-400">Digital Out</td>
                <td className="p-3 text-amber-400">Output</td>
                <td className="p-3 text-slate-300">Living Room Cove Accent Lamp</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 19</td>
                <td className="p-3 text-white">Relay Channel 3</td>
                <td className="p-3 text-slate-400">Digital Out</td>
                <td className="p-3 text-amber-400">Output</td>
                <td className="p-3 text-slate-300">Ceiling Fan Speed Motor</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 18</td>
                <td className="p-3 text-white">Relay Channel 4</td>
                <td className="p-3 text-slate-400">Digital Out</td>
                <td className="p-3 text-amber-400">Output</td>
                <td className="p-3 text-slate-300">Bedroom Nightstand Light</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 4</td>
                <td className="p-3 text-white">DHT22 / AM2302</td>
                <td className="p-3 text-slate-400">1-Wire Digital</td>
                <td className="p-3 text-emerald-400">Input</td>
                <td className="p-3 text-slate-300">Living Room Temperature & Humidity</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 13</td>
                <td className="p-3 text-white">HC-SR501 PIR</td>
                <td className="p-3 text-slate-400">Digital In (TTL)</td>
                <td className="p-3 text-emerald-400">Input</td>
                <td className="p-3 text-slate-300">Infrared Motion Detection</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 36 (VP)</td>
                <td className="p-3 text-white">LDR Voltage Divider</td>
                <td className="p-3 text-slate-400">ADC 12-bit</td>
                <td className="p-3 text-emerald-400">Input</td>
                <td className="p-3 text-slate-300">Ambient Lux Light Level</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-3 text-cyan-400 font-bold">GPIO 39 (VN)</td>
                <td className="p-3 text-white">MQ-2 Gas Sensor</td>
                <td className="p-3 text-slate-400">ADC 12-bit</td>
                <td className="p-3 text-emerald-400">Input</td>
                <td className="p-3 text-slate-300">Kitchen Smoke & LPG Leakage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MQTT Topic Specification */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          Standard MQTT Topic Structure & JSON Payloads
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Appliance Command Payload</span>
              <button
                onClick={() => copyToClipboard(samplePayloadCommand, 'cmd')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedKey === 'cmd' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-3 rounded-xl overflow-x-auto">
              {samplePayloadCommand}
            </pre>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Appliance Status ACK Payload</span>
              <button
                onClick={() => copyToClipboard(samplePayloadStatus, 'ack')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedKey === 'ack' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-300 bg-slate-900 p-3 rounded-xl overflow-x-auto">
              {samplePayloadStatus}
            </pre>
          </div>
        </div>
      </div>

      {/* Arduino Firmware Sketch */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            ESP32 Production Firmware Sketch
          </h3>

          <button
            onClick={() => copyToClipboard(esp32Snippet, 'sketch')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'sketch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'sketch' ? 'Copied' : 'Copy Arduino Sketch'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Ready to upload via Arduino IDE or PlatformIO. The full complete source file is also located inside the project directory at <code className="text-cyan-300 font-mono">firmware/esp32_smart_home/esp32_smart_home.ino</code>.
        </p>

        <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-4 rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed max-h-80">
          {esp32Snippet}
        </pre>
      </div>
    </div>
  );
}
