import React from 'react';
import { useHome } from '../../context/HomeContext';
import { FlaskConical, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

export default function DemoModeBanner({ onNavigateToSettings, onNavigateToDocs }) {
  const { settings } = useHome();
  const isDemo = settings?.systemMode === 'demo';

  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-cyan-950/40 to-blue-950/40 border-b border-amber-500/30 px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5 text-amber-300 font-medium text-center sm:text-left">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex-shrink-0 animate-pulse">
            <FlaskConical className="w-3 h-3" />
          </span>
          <span>
            <strong className="tracking-wide uppercase text-amber-200">DEMO MODE — SIMULATED DATA ACTIVE:</strong>{' '}
            <span className="text-slate-300 hidden md:inline">
              Sensor readings & device states are mathematically generated for evaluation. No physical hardware is connected.
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToDocs && (
            <button
              onClick={onNavigateToDocs}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 transition-all font-medium text-[11px]"
            >
              <Cpu className="w-3 h-3" />
              <span>Connect ESP32 / ESP8266</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all font-medium text-[11px]"
            >
              Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
