import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import api from '../services/api';
import { 
  Clock, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  FlaskConical, 
  Cpu, 
  Zap, 
  RefreshCw 
} from 'lucide-react';

export default function ActivityPage() {
  const { activityLogs, refreshData, addNotification } = useHome();
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all activity logs?')) return;
    try {
      await api.clearActivity();
      addNotification('Activity logs cleared', 'info');
      refreshData();
    } catch (err) {
      addNotification(`Failed to clear logs: ${err.message}`, 'error');
    }
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesType = selectedType === 'ALL' || log.type === selectedType;
    const matchesSearch = 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            System Audit & Telemetry Activity Log
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit trail of hardware toggles, sensor updates, and automation rule events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshData}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleClearLogs}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs by keyword, device, or room..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DEVICE_COMMAND', label: 'Commands' },
            { id: 'SENSOR_UPDATE', label: 'Sensors' },
            { id: 'AUTOMATION_TRIGGER', label: 'Automation' },
            { id: 'CONNECTION', label: 'Network' },
            { id: 'ERROR', label: 'Errors' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedType === type.id
                  ? 'bg-cyan-500 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5 flex-shrink-0">
                    {getStatusIcon(log.status)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-white">
                        {log.deviceName}
                      </span>
                      <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
                        {log.room}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {log.type}
                      </span>
                      {log.isSimulated && (
                        <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                          <FlaskConical className="w-2.5 h-2.5" />
                          Simulated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {log.message}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono self-end sm:self-center whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              No activity logs match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
