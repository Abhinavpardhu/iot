import React, { useState, useEffect } from 'react';
import { useHome } from '../context/HomeContext';
import api from '../services/api';
import { 
  Settings, 
  FlaskConical, 
  Radio, 
  Cpu, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, refreshData, addNotification } = useHome();
  const [systemMode, setSystemMode] = useState(settings?.systemMode || 'demo');
  const [tempUnit, setTempUnit] = useState(settings?.tempUnit || 'C');

  // MQTT form state
  const [brokerUrl, setBrokerUrl] = useState(settings?.mqtt?.brokerUrl || 'mqtt://broker.hivemq.com:1883');
  const [clientId, setClientId] = useState(settings?.mqtt?.clientId || 'esp32_gateway_station_1');
  const [username, setUsername] = useState(settings?.mqtt?.username || '');
  const [password, setPassword] = useState('');
  const [topicPrefix, setTopicPrefix] = useState(settings?.mqtt?.topicPrefix || 'home');

  // Diagnostic states
  const [diagnostics, setDiagnostics] = useState(null);
  const [isTestingMqtt, setIsTestingMqtt] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setSystemMode(settings.systemMode || 'demo');
      setTempUnit(settings.tempUnit || 'C');
      if (settings.mqtt) {
        setBrokerUrl(settings.mqtt.brokerUrl || 'mqtt://broker.hivemq.com:1883');
        setClientId(settings.mqtt.clientId || 'esp32_gateway_station_1');
        setUsername(settings.mqtt.username || '');
        setTopicPrefix(settings.mqtt.topicPrefix || 'home');
      }
    }
  }, [settings]);

  // Load diagnostics
  const loadDiagnostics = async () => {
    try {
      const res = await api.getSettings();
      if (res.diagnostics) {
        setDiagnostics(res.diagnostics);
      }
    } catch (e) {
      console.error('Failed to load diagnostics:', e);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        systemMode,
        tempUnit,
        mqtt: {
          brokerUrl,
          clientId,
          username,
          ...(password ? { password } : {}),
          topicPrefix,
        }
      };

      const res = await api.updateSettings(payload);
      addNotification('System settings saved successfully!', 'success');
      refreshData();
      loadDiagnostics();
    } catch (err) {
      addNotification(`Failed to save settings: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestBroker = async () => {
    setIsTestingMqtt(true);
    setTestResult(null);
    try {
      const res = await api.testMqtt({
        brokerUrl,
        clientId,
        username,
        password,
      });
      setTestResult({ success: true, message: res.message || 'Connection test succeeded!' });
    } catch (err) {
      setTestResult({ success: false, message: err.message || 'Connection test failed.' });
    } finally {
      setIsTestingMqtt(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            System Configuration & IoT Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle between Demo Mode and Physical Hardware Mode, configure MQTT parameters, and diagnose link latency.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Primary Mode Selection */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Operating Mode
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Demo Mode Card */}
          <div
            onClick={() => setSystemMode('demo')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
              systemMode === 'demo'
                ? 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/20 shadow-lg shadow-amber-950/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <FlaskConical className="w-4 h-4" />
                  DEMO MODE (Simulation)
                </span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${systemMode === 'demo' ? 'bg-amber-400 border-white' : 'border-slate-600'}`} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Uses realistic computational models to generate dynamic room temperatures, humidity drifts, and motion triggers without physical hardware.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-amber-300 font-mono">
              ★ Recommended for College Viva / Lab Demos
            </div>
          </div>

          {/* Hardware Mode Card */}
          <div
            onClick={() => setSystemMode('hardware')}
            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
              systemMode === 'hardware'
                ? 'bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-950/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <Radio className="w-4 h-4" />
                  HARDWARE MODE (ESP32 / ESP8266)
                </span>
                <span className={`w-3.5 h-3.5 rounded-full border-2 ${systemMode === 'hardware' ? 'bg-emerald-400 border-white' : 'border-slate-600'}`} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connects directly to an MQTT broker. Commands will only be confirmed when physical microcontrollers return acknowledgement packets.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-emerald-300 font-mono">
              Requires Active WiFi & MQTT Broker
            </div>
          </div>
        </div>
      </div>

      {/* Temperature Unit & Preferences */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Unit Preferences
        </h3>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 font-medium">Temperature Scale:</span>
          <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => setTempUnit('C')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tempUnit === 'C' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Celsius (°C)
            </button>
            <button
              type="button"
              onClick={() => setTempUnit('F')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tempUnit === 'F' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>
      </div>

      {/* MQTT Broker Settings Form */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              MQTT Broker Parameters (Hardware Communication)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure connection credentials for Mosquitto, HiveMQ, EMQX, or CloudMQTT
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestBroker}
            disabled={isTestingMqtt}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isTestingMqtt ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            <span>Test Connection</span>
          </button>
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            testResult.success
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}>
            {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Broker URL
            </label>
            <input
              type="text"
              value={brokerUrl}
              onChange={(e) => setBrokerUrl(e.target.value)}
              placeholder="e.g., mqtt://broker.hivemq.com:1883 or mqtt://192.168.1.100:1883"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Username (Optional)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Leave blank for public brokers"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password (Optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Base Topic Prefix
            </label>
            <input
              type="text"
              value={topicPrefix}
              onChange={(e) => setTopicPrefix(e.target.value)}
              placeholder="e.g. home"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Diagnostics Panel */}
      {diagnostics && (
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Gateway Diagnostics
            </h3>
            <button
              onClick={loadDiagnostics}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Metrics</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">MQTT Status</span>
              <span className={`font-mono font-bold mt-1 block ${diagnostics.mqtt?.connected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {diagnostics.mqtt?.connected ? 'Connected' : 'Standby / Inactive'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Gateway Uptime</span>
              <span className="font-mono font-bold text-white mt-1 block">
                {Math.floor(diagnostics.uptimeSeconds / 60)}m {diagnostics.uptimeSeconds % 60}s
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Packets In/Out</span>
              <span className="font-mono font-bold text-cyan-400 mt-1 block">
                RX: {diagnostics.mqtt?.messagesReceived || 0} / TX: {diagnostics.mqtt?.messagesSent || 0}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Device Nodes</span>
              <span className="font-mono font-bold text-emerald-400 mt-1 block">
                {diagnostics.registeredDevices} Devices
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
