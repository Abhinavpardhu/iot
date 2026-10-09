import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import api from '../../services/api';
import { X, Plus, Lightbulb, Fan, Plug, Tv, Lamp, AirVent } from 'lucide-react';

export default function AddDeviceModal({ isOpen, onClose }) {
  const { rooms, refreshData, addNotification } = useHome();
  const [name, setName] = useState('');
  const [room, setRoom] = useState(rooms[0]?.id || 'living-room');
  const [type, setType] = useState('light');
  const [pin, setPin] = useState('D12');
  const [powerWatts, setPowerWatts] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await api.createDevice({
        name: name.trim(),
        room,
        type,
        pin,
        powerWatts: Number(powerWatts) || 20,
      });
      addNotification(`Appliance "${name}" added successfully!`, 'success');
      refreshData();
      onClose();
    } catch (err) {
      addNotification(`Failed to add device: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" />
            Add New Appliance
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
              Appliance Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Balcony Hanging Light"
              required
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Room Zone
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Device Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="light">Light Bulb</option>
                <option value="lamp">Lamp / Accent</option>
                <option value="fan">Ceiling Fan</option>
                <option value="climate">AC / Climate</option>
                <option value="plug">Smart Plug</option>
                <option value="tv">Media / Appliance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ESP32 GPIO Pin
              </label>
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="e.g. GPIO12 or D12"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Power Draw (Watts)
              </label>
              <input
                type="number"
                value={powerWatts}
                onChange={(e) => setPowerWatts(e.target.value)}
                min="1"
                max="3500"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
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
              {isSubmitting ? 'Registering...' : 'Register Appliance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
