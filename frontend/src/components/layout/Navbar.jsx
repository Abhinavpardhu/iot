import React, { useState, useEffect } from 'react';
import { useHome } from '../../context/HomeContext';
import { 
  Wifi, 
  WifiOff, 
  Radio, 
  FlaskConical, 
  Menu, 
  Clock, 
  Zap, 
  Layers 
} from 'lucide-react';

export default function Navbar({ activeTab, onToggleSidebar }) {
  const { settings, isSocketConnected, devices } = useHome();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isDemo = settings?.systemMode === 'demo';
  const activeCount = devices.filter(d => d.state === 'ON').length;

  const tabTitles = {
    dashboard: 'Dashboard Overview',
    devices: 'Appliance & Device Control',
    sensors: 'Telemetry & Environmental Sensors',
    rooms: 'Zone & Room Management',
    automation: 'Smart Automation Engine',
    activity: 'System Logs & Audit Trail',
    settings: 'System Settings & MQTT Broker',
    docs: 'ESP32 Hardware & MQTT Wiring'
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Current View Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{tabTitles[activeTab] || 'Smart Home'}</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Centralized IoT Microcontroller Gateway & Automation Node
            </p>
          </div>
        </div>

        {/* Right: Status Indicators & Clock */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Quick Active Devices Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Zap className={`w-3.5 h-3.5 ${activeCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
            <span><strong className="text-white">{activeCount}</strong> of {devices.length} ON</span>
          </div>

          {/* Mode Pill */}
          {isDemo ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <FlaskConical className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden md:inline">DEMO MODE</span>
              <span className="md:hidden">DEMO</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span className="hidden md:inline">HARDWARE LIVE</span>
              <span className="md:hidden">HARDWARE</span>
            </div>
          )}

          {/* Real-time Socket Indicator */}
          <div 
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${
              isSocketConnected 
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300' 
                : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
            title={isSocketConnected ? 'Socket.IO Real-time Connection Active' : 'Real-time Socket Disconnected'}
          >
            <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-cyan-400 animate-ping' : 'bg-rose-500'}`} />
            <span className="hidden lg:inline">{isSocketConnected ? 'Live' : 'Offline'}</span>
          </div>

          {/* Clock */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-950/40 px-2.5 py-1 rounded-md border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{time.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
