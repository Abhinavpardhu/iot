import React from 'react';
import { useHome } from '../../context/HomeContext';
import { 
  Thermometer, 
  Droplets, 
  Eye, 
  Sun, 
  Flame, 
  Activity, 
  Radio, 
  FlaskConical, 
  Clock 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  YAxis 
} from 'recharts';

const sensorIconMap = {
  temperature: Thermometer,
  humidity: Droplets,
  motion: Eye,
  light: Sun,
  gas: Flame,
};

const sensorColors = {
  temperature: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', text: 'text-cyan-400' },
  humidity: { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.15)', text: 'text-blue-400' },
  motion: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', text: 'text-emerald-400' },
  light: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', text: 'text-amber-400' },
  gas: { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.15)', text: 'text-rose-400' },
};

export default function SensorCard({ sensor }) {
  const { formatTemp, settings } = useHome();
  const isDemo = settings?.systemMode === 'demo';

  const IconComponent = sensorIconMap[sensor.type] || Activity;
  const colorTheme = sensorColors[sensor.type] || sensorColors.temperature;

  // Format value display
  let displayValue = sensor.value;
  let displayUnit = sensor.unit;

  if (sensor.type === 'temperature') {
    displayValue = formatTemp(sensor.value);
    displayUnit = '';
  } else if (sensor.type === 'motion') {
    displayValue = sensor.value === 1 ? 'DETECTED' : 'CLEAR';
    displayUnit = '';
  }

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const hasHistory = sensor.history && sensor.history.length > 2 && sensor.type !== 'motion';

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-slate-800/90 flex items-center justify-center ${colorTheme.text} border border-slate-700/60`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {sensor.room.replace('-', ' ')}
              </span>
              <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                {sensor.name}
              </h3>
            </div>
          </div>

          {/* Mode stream label */}
          <div>
            {isDemo ? (
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FlaskConical className="w-2.5 h-2.5" />
                Simulated
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-2.5 h-2.5" />
                Hardware
              </span>
            )}
          </div>
        </div>

        {/* Primary Value Display */}
        <div className="my-3 flex items-baseline gap-2">
          {sensor.type === 'motion' ? (
            <span
              className={`text-2xl font-black tracking-tight px-3 py-1 rounded-xl font-mono ${
                sensor.value === 1
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {displayValue}
            </span>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {displayValue}
              </span>
              {displayUnit && (
                <span className="text-sm font-medium text-slate-400 font-mono">
                  {displayUnit}
                </span>
              )}
            </>
          )}
        </div>

        {/* Real-time mini sparkline chart if history is present */}
        {hasHistory && (
          <div className="h-14 w-full mt-2 -mb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensor.history}>
                <defs>
                  <linearGradient id={`grad_${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorTheme.stroke} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colorTheme.stroke} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colorTheme.stroke}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#grad_${sensor.id})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-cyan-400" />
          {formatTime(sensor.lastUpdated)}
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          Pin: {sensor.hardwarePin || 'GPIO'}
        </span>
      </div>
    </div>
  );
}
