import React from 'react';
import { useHome } from '../../context/HomeContext';
import { 
  Lightbulb, 
  Fan, 
  Plug, 
  Tv, 
  Lamp, 
  AirVent, 
  Power, 
  Clock, 
  Wifi, 
  WifiOff, 
  Cpu, 
  FlaskConical, 
  Loader2 
} from 'lucide-react';

const iconMap = {
  light: Lightbulb,
  lamp: Lamp,
  fan: Fan,
  climate: AirVent,
  plug: Plug,
  tv: Tv,
};

export default function DeviceCard({ device }) {
  const { toggleDevice, pendingToggles, settings } = useHome();
  const isPending = pendingToggles.has(device.id);
  const isDemo = settings?.systemMode === 'demo';

  const IconComponent = iconMap[device.type] || Lightbulb;
  const isOn = device.state === 'ON';

  const handleToggle = () => {
    if (isPending) return;
    toggleDevice(device.id, isOn ? 'OFF' : 'ON');
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 transition-all duration-300 relative overflow-hidden group ${
        isOn 
          ? 'border-cyan-500/40 shadow-lg shadow-cyan-950/40 bg-gradient-to-b from-slate-900/90 to-slate-900/60' 
          : 'border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Background Glow when ON */}
      {isOn && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Card Header: Icon & Toggle Switch */}
      <div className="flex items-start justify-between gap-3 mb-4">
        {/* Device Icon Circle */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isOn
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/20'
              : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-300 group-hover:bg-slate-800'
          }`}
        >
          <IconComponent className={`w-6 h-6 ${isOn ? 'animate-pulse' : ''}`} />
        </div>

        {/* Optimistic Switch Button */}
        <button
          onClick={handleToggle}
          disabled={isPending || !device.isOnline}
          aria-label={`Toggle ${device.name}`}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            isOn ? 'bg-cyan-500' : 'bg-slate-700'
          }`}
        >
          {isPending ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            </span>
          ) : (
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isOn ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          )}
        </button>
      </div>

      {/* Device Information */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-md">
            {device.room.replace('-', ' ')}
          </span>
          {device.pin && (
            <span className="text-[10px] text-slate-400 font-mono">
              Pin: {device.pin}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {device.name}
        </h3>

        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-slate-400">Power Rating</span>
          <span className="font-mono text-slate-200 font-medium">
            {device.powerWatts} W
          </span>
        </div>
      </div>

      {/* Card Footer: Status Pills & Time */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        {/* Status indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              device.isOnline
                ? isOn
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-emerald-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="font-medium text-slate-300">
            {isOn ? 'Active (ON)' : 'Standby (OFF)'}
          </span>
        </div>

        {/* Demo / Hardware acknowledgement label */}
        <div>
          {isDemo ? (
            <span className="text-[10px] text-amber-400/90 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
              <FlaskConical className="w-2.5 h-2.5" />
              Demo
            </span>
          ) : device.isHardwareAcknowledged ? (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono">
              <Cpu className="w-2.5 h-2.5" />
              ESP-ACK
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono">
              MQTT Synced
            </span>
          )}
        </div>
      </div>

      {/* Last updated footer line */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTime(device.lastUpdated)}
        </span>
        <span className="truncate max-w-[130px] font-mono" title={device.mqttTopic}>
          {device.mqttTopic.split('/').slice(-1)[0]}
        </span>
      </div>
    </div>
  );
}
