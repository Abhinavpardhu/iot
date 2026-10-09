import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import SensorCard from '../components/common/SensorCard';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Eye, 
  Sun, 
  Flame, 
  Clock, 
  FlaskConical, 
  Radio, 
  LineChart as LineChartIcon,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function SensorsPage() {
  const { sensors, settings, formatTemp, refreshData } = useHome();
  const isDemo = settings?.systemMode === 'demo';

  // Select sensor for the deep telemetry chart
  const [selectedSensorId, setSelectedSensorId] = useState('temp_living_room');

  const selectedSensor = sensors.find(s => s.id === selectedSensorId) || sensors[0];

  // Prepare chart data with readable timestamps
  const chartData = (selectedSensor?.history || []).map((pt, idx) => {
    let label = `T-${(selectedSensor.history.length - 1 - idx) * 3}m`;
    try {
      const d = new Date(pt.timestamp);
      label = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {}

    let val = pt.value;
    if (selectedSensor?.type === 'temperature' && settings?.tempUnit === 'F') {
      val = parseFloat(((pt.value * 9/5) + 32).toFixed(1));
    }

    return {
      time: label,
      value: val,
    };
  });

  // Calculate statistics (Min, Max, Avg)
  const values = chartData.map(d => d.value).filter(v => typeof v === 'number');
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 0;
  const avgVal = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Environmental & Telemetry Sensor Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry stream from DHT22, DHT11, PIR HC-SR501, LDR, and MQ-2 Gas sensor modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sensors.map((sensor) => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>

      {/* Historical Telemetry Deep Analysis Chart */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-cyan-400" />
              High-Precision Historical Telemetry Stream
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous sampling rate buffer with mathematical moving average
            </p>
          </div>

          {/* Sensor Select Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {sensors.filter(s => s.type !== 'motion').map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSensorId(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  selectedSensorId === s.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {s.name.split(' ')[0]} ({s.room.split('-')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Sensor Overview Metrics */}
        {selectedSensor && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Currently Sampled</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {selectedSensor.type === 'temperature' ? formatTemp(selectedSensor.value) : `${selectedSensor.value} ${selectedSensor.unit}`}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Minimum Observed</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-0.5 block">
                {minVal} {selectedSensor.type === 'temperature' ? (settings?.tempUnit === 'F' ? '°F' : '°C') : selectedSensor.unit}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Maximum Observed</span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-0.5 block">
                {maxVal} {selectedSensor.type === 'temperature' ? (settings?.tempUnit === 'F' ? '°F' : '°C') : selectedSensor.unit}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Running Average</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                {avgVal} {selectedSensor.type === 'temperature' ? (settings?.tempUnit === 'F' ? '°F' : '°C') : selectedSensor.unit}
              </span>
            </div>
          </div>
        )}

        {/* Big Interactive Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="sensorAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickMargin={8} />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                unit={` ${selectedSensor?.type === 'temperature' ? (settings?.tempUnit === 'F' ? '°F' : '°C') : (selectedSensor?.unit || '')}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#06b6d4',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name={selectedSensor?.name || 'Reading'}
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#sensorAreaGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Clear Hardware vs Demo stream disclosure */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
          {isDemo ? (
            <>
              <FlaskConical className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300">DEMO MODE ACTIVE:</strong> These sensor readings are dynamically generated via numerical models simulating ambient heating, thermal inertia, and room occupancy. They provide a full test harness without requiring physical microcontroller breadboards.
              </span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-emerald-300">HARDWARE MODE ACTIVE:</strong> Listening for real telemetry published by the ESP32/ESP8266 microcontroller over MQTT. Topic: <code className="text-cyan-300 font-mono">{selectedSensor?.mqttTopic}</code>.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
