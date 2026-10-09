import React from 'react';
import { useHome } from '../context/HomeContext';
import StatCard from '../components/common/StatCard';
import DeviceCard from '../components/common/DeviceCard';
import SensorCard from '../components/common/SensorCard';
import { 
  Power, 
  Zap, 
  Activity, 
  Wifi, 
  Thermometer, 
  Droplets, 
  Eye, 
  Flame, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

export default function DashboardPage({ onNavigate }) {
  const { devices, sensors, rules, activityLogs, settings, formatTemp } = useHome();
  const isDemo = settings?.systemMode === 'demo';

  const activeDevices = devices.filter(d => d.state === 'ON');
  const onlineDevices = devices.filter(d => d.isOnline);
  const activeRules = rules.filter(r => r.isEnabled);

  // Calculate live power draw (Watts)
  const totalPowerWatts = activeDevices.reduce((sum, d) => sum + (d.powerWatts || 0), 0);
  const totalPowerKW = (totalPowerWatts / 1000).toFixed(2);
  // Estimated daily energy consumption in kWh
  const estimatedDailyKWh = (totalPowerWatts * 0.016).toFixed(2);

  // Quick appliances (first 4)
  const quickDevices = devices.slice(0, 4);

  // Living Room temp sensor for main environmental widget
  const lrTempSensor = sensors.find(s => s.id === 'temp_living_room');
  const lrHumSensor = sensors.find(s => s.id === 'humidity_living_room');
  const motionSensor = sensors.find(s => s.type === 'motion');

  // Chart data: 24h simulated energy profile
  const energyTrend = [
    { hour: '00:00', kw: 0.35 },
    { hour: '04:00', kw: 0.22 },
    { hour: '08:00', kw: 1.45 },
    { hour: '12:00', kw: 1.10 },
    { hour: '16:00', kw: 0.95 },
    { hour: '20:00', kw: Math.max(0.6, parseFloat(totalPowerKW) || 0.8) },
    { hour: 'Now', kw: parseFloat(totalPowerKW) || 0.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & System Summary Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">
              Smart IoT Command Center
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Welcome to Smart Home System
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Real-time appliance telemetrics, environmental monitoring, and automated relay control engine for ESP32/ESP8266.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('devices')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Manage All Appliances</span>
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>ESP32 Circuit Pinout</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Devices"
          value={devices.length}
          subtitle={`${onlineDevices.length} Online & Ready`}
          icon={Power}
          color="cyan"
          badge={
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/40">
              {devices.length} Nodes
            </span>
          }
        />

        <StatCard
          title="Appliance States"
          value={`${activeDevices.length} ON`}
          subtitle={`${devices.length - activeDevices.length} in Standby (OFF)`}
          icon={Zap}
          color="amber"
          badge={
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${activeDevices.length > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {activeDevices.length > 0 ? 'Active Load' : 'Idle'}
            </span>
          }
        />

        <StatCard
          title="Active Telemetry Sensors"
          value={`${sensors.length} Sensors`}
          subtitle={isDemo ? 'Running Simulated Feeds' : 'Listening on MQTT'}
          icon={Activity}
          color="blue"
          badge={
            <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-800/40">
              100% Online
            </span>
          }
        />

        <StatCard
          title="Live Power Consumption"
          value={`${totalPowerWatts} W`}
          subtitle={`${totalPowerKW} kW (Sample calculation)`}
          icon={TrendingUp}
          color="emerald"
          badge={
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
              ~{estimatedDailyKWh} kWh/day
            </span>
          }
        />
      </div>

      {/* Main Grid: Environmental Overview & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Environmental Gauges & Energy Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Environment Cards */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-cyan-400" />
                  Primary Environmental Telemetry
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time ambient conditions streamed from Living Room & Bedroom micro-nodes
                </p>
              </div>
              <button
                onClick={() => onNavigate('sensors')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>View All Sensors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Temperature Metric */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Living Room Temp</span>
                  <Thermometer className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {lrTempSensor ? formatTemp(lrTempSensor.value) : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-cyan-400/90 flex items-center gap-1">
                  <span>Sensor: DHT22 (GPIO4)</span>
                </div>
              </div>

              {/* Humidity Metric */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Relative Humidity</span>
                  <Droplets className="w-4 h-4 text-blue-400" />
                </div>
                <div className="my-2">
                  <span className="text-3xl font-extrabold text-white font-mono">
                    {lrHumSensor ? `${lrHumSensor.value} %` : '--'}
                  </span>
                </div>
                <div className="text-[11px] text-blue-400/90 flex items-center gap-1">
                  <span>Optimum: 40% - 60%</span>
                </div>
              </div>

              {/* PIR Motion Status */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Motion Detection</span>
                  <Eye className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="my-2">
                  <span
                    className={`text-xl font-bold font-mono px-2.5 py-1 rounded-lg inline-block ${
                      motionSensor?.value === 1
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {motionSensor?.value === 1 ? 'DETECTED' : 'CLEAR'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  <span>Sensor: HC-SR501 PIR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Usage Section (with clear simulated/sample data labeling) */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Estimated Energy Consumption Profile
                </h3>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full inline-block mt-1">
                  SAMPLE MEASUREMENT / SIMULATED CALCULATION
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Instantaneous Load</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {totalPowerKW} kW
                </span>
              </div>
            </div>

            <div className="h-52 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyTrend}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" kW" domain={[0, 2]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="kw"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#energyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Power demand is computed proportionally from the active appliances (Lights: ~15W, Fans: ~65W, Plugs: ~1200W).
            </p>
          </div>
        </div>

        {/* Right 1 Col: Quick Appliance Controls & Live Activity */}
        <div className="space-y-6">
          {/* Quick Appliances Controls */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Quick Controls
                </h3>
                <p className="text-xs text-slate-400">One-touch appliance toggles</p>
              </div>
              <button
                onClick={() => onNavigate('devices')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                All ({devices.length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              {quickDevices.map(device => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigate('activity')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                View Log
              </button>
            </div>

            <div className="space-y-2.5">
              {activityLogs.slice(0, 4).map(log => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-cyan-400">{log.deviceName}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-300 line-clamp-2 leading-relaxed">
                    {log.message}
                  </p>
                  {log.isSimulated && (
                    <span className="text-[9px] font-mono text-amber-400/80">
                      [Demo Simulated Log]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
