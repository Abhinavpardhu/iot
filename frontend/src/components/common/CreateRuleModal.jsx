import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import api from '../../services/api';
import { X, Sparkles } from 'lucide-react';

export default function CreateRuleModal({ isOpen, onClose }) {
  const { sensors, devices, refreshData, addNotification } = useHome();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerSensorId, setTriggerSensorId] = useState(sensors[0]?.id || '');
  const [condition, setCondition] = useState('greater_than');
  const [threshold, setThreshold] = useState(26);
  const [targetDeviceId, setTargetDeviceId] = useState(devices[0]?.id || '');
  const [targetState, setTargetState] = useState('ON');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !triggerSensorId || !targetDeviceId) return;

    setIsSubmitting(true);
    try {
      await api.createRule({
        name: name.trim(),
        description: description.trim(),
        triggerSensorId,
        condition,
        threshold: Number(threshold),
        targetDeviceId,
        targetState,
      });
      addNotification(`Rule "${name}" deployed!`, 'success');
      refreshData();
      onClose();
    } catch (err) {
      addNotification(`Failed to create rule: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSensor = sensors.find(s => s.id === triggerSensorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Create Smart Automation Rule
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Rule Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Turn on AC when temperature exceeds 28°C"
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Energy comfort safeguard for living room"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              1. IF Trigger Condition
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Sensor</label>
                <select
                  value={triggerSensorId}
                  onChange={(e) => setTriggerSensorId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {sensors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.unit || s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="greater_than">Is Greater Than (&gt;)</option>
                  <option value="less_than">Is Less Than (&lt;)</option>
                  <option value="equals">Equals (==)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Threshold {selectedSensor?.unit ? `(${selectedSensor.unit})` : ''}
                </label>
                <input
                  type="number"
                  step="any"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
              2. THEN Action
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Target Appliance</label>
                <select
                  value={targetDeviceId}
                  onChange={(e) => setTargetDeviceId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.room})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Desired State</label>
                <select
                  value={targetState}
                  onChange={(e) => setTargetState(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ON">Switch ON</option>
                  <option value="OFF">Switch OFF</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-95 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-opacity"
            >
              {isSubmitting ? 'Saving...' : 'Deploy Automation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
