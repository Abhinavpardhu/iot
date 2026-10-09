import React from 'react';
import { 
  LayoutDashboard, 
  Power, 
  Activity, 
  Home, 
  Sparkles, 
  Clock, 
  Settings, 
  Cpu, 
  ShieldCheck, 
  ChevronRight,
  Radio,
  X
} from 'lucide-react';
import { useHome } from '../../context/HomeContext';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const { settings, devices, sensors, rules } = useHome();
  const isDemo = settings?.systemMode === 'demo';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Appliance Control', icon: Power, badge: devices.length },
    { id: 'sensors', label: 'Sensors & Metrics', icon: Activity, badge: sensors.length },
    { id: 'rooms', label: 'Rooms & Zones', icon: Home },
    { id: 'automation', label: 'Automation Rules', icon: Sparkles, badge: rules.filter(r => r.isEnabled).length },
    { id: 'activity', label: 'Activity Logs', icon: Clock },
    { id: 'settings', label: 'Settings & MQTT', icon: Settings },
    { id: 'docs', label: 'Hardware & ESP32', icon: Cpu, isHighlight: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                IoT HOME
              </span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Automation System
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? 'text-cyan-400' 
                        : item.isHighlight
                          ? 'text-amber-400 group-hover:text-amber-300'
                          : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer / System Status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Mode Status
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isDemo
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isDemo ? 'Demo Mode' : 'Hardware'}
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              {isDemo 
                ? 'Simulated environment running with mathematical data.' 
                : 'Physical MQTT broker listening for ESP32/ESP8266 telemetry.'}
            </p>

            <button
              onClick={() => {
                setActiveTab('settings');
                setIsOpen(false);
              }}
              className="mt-1 w-full text-center py-1 rounded-md text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 transition-colors border border-slate-700"
            >
              Switch Mode / Config
            </button>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              College FSWD IoT Project v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
