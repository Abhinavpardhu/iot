import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import api from '../services/api';
import CreateRuleModal from '../components/common/CreateRuleModal';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap, 
  Cpu, 
  FlaskConical, 
  ShieldAlert, 
  Play, 
  PowerOff 
} from 'lucide-react';

export default function AutomationPage() {
  const { rules, settings, refreshData, addNotification } = useHome();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const isDemo = settings?.systemMode === 'demo';

  const handleToggleRule = async (rule) => {
    try {
      const nextEnabled = !rule.isEnabled;
      await api.updateRule(rule.id, { isEnabled: nextEnabled });
      addNotification(
        `Rule "${rule.name}" is now ${nextEnabled ? 'Enabled' : 'Disabled'}`,
        'info'
      );
      refreshData();
    } catch (err) {
      addNotification(`Failed to update rule: ${err.message}`, 'error');
    }
  };

  const handleDeleteRule = async (ruleId, ruleName) => {
    if (!window.confirm(`Delete automation rule "${ruleName}"?`)) return;
    try {
      await api.deleteRule(ruleId);
      addNotification(`Rule "${ruleName}" deleted`, 'info');
      refreshData();
    } catch (err) {
      addNotification(`Failed to delete rule: ${err.message}`, 'error');
    }
  };

  const formatLastTriggered = (ts) => {
    if (!ts) return 'Never triggered yet';
    try {
      return new Date(ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return 'Never';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Smart Automation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Condition-action triggers evaluated dynamically on incoming telemetry streams.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Automation Rule</span>
        </button>
      </div>

      {/* Mode & Status Legend */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300">Rule Deployment Status:</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
            <FlaskConical className="w-3.5 h-3.5" />
            Demo Mode Active
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-medium">
            <Cpu className="w-3.5 h-3.5" />
            Hardware Deployed
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
            <PowerOff className="w-3.5 h-3.5" />
            Saved & Inactive
          </span>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => {
          // Status tag determination
          let statusBadge;
          if (!rule.isEnabled) {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <PowerOff className="w-3 h-3" />
                Saved & Inactive
              </span>
            );
          } else if (isDemo) {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <FlaskConical className="w-3 h-3 text-cyan-400" />
                Demo Simulation
              </span>
            );
          } else {
            statusBadge = (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Hardware Deployed
              </span>
            );
          }

          const conditionSymbol = rule.condition === 'greater_than' ? '>' : rule.condition === 'less_than' ? '<' : '==';

          return (
            <div
              key={rule.id}
              className={`glass-card rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                rule.isEnabled
                  ? 'border-slate-800 bg-slate-900/80 hover:border-cyan-500/30'
                  : 'border-slate-800/40 bg-slate-900/40 opacity-70'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {statusBadge}
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {rule.name}
                    </h3>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.isEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        rule.isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {rule.description && (
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {rule.description}
                  </p>
                )}

                {/* Condition-Action Visual Pipeline */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-mono">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">IF:</span>
                    <span>{rule.triggerSensorId}</span>
                    <span className="font-bold text-amber-400">{conditionSymbol}</span>
                    <span className="font-bold text-white">{rule.threshold}</span>
                  </div>

                  <div className="flex items-center gap-2 text-blue-300 font-mono">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">THEN:</span>
                    <span>{rule.targetDeviceId}</span>
                    <span className="text-slate-400">➔</span>
                    <span className={`font-bold px-1.5 py-0.2 rounded ${rule.targetState === 'ON' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300'}`}>
                      {rule.targetState}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {formatLastTriggered(rule.lastTriggered)}
                </span>

                <button
                  onClick={() => handleDeleteRule(rule.id, rule.name)}
                  className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <CreateRuleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
