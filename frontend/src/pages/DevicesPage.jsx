import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import DeviceCard from '../components/common/DeviceCard';
import AddDeviceModal from '../components/common/AddDeviceModal';
import { 
  Power, 
  Plus, 
  Search, 
  Filter, 
  Lightbulb, 
  Fan, 
  Plug, 
  AirVent, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function DevicesPage() {
  const { devices, rooms } = useHome();
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter devices
  const filteredDevices = devices.filter((device) => {
    const matchesRoom = selectedRoom === 'all' || device.room === selectedRoom;
    const matchesType = selectedType === 'all' || device.type === selectedType;
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          device.room.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesType && matchesSearch;
  });

  const activeCount = devices.filter(d => d.state === 'ON').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Power className="w-5 h-5 text-cyan-400" />
            Appliance Management & Micro-Relays
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Toggle high-voltage loads and low-voltage lights via ESP32 optocoupled relay modules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="text-xs text-slate-400 block">System Load Status</span>
            <span className="text-sm font-bold text-cyan-400 font-mono">
              {activeCount} of {devices.length} Switched ON
            </span>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Appliance</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appliances by name or room..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Room Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedRoom('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedRoom === 'all'
                  ? 'bg-cyan-500 text-white font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              All Rooms
            </button>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  selectedRoom === room.id
                    ? 'bg-cyan-500 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>

        {/* Device Category Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 overflow-x-auto">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Type:
          </span>
          {[
            { id: 'all', label: 'All Types' },
            { id: 'light', label: 'Lighting' },
            { id: 'fan', label: 'Fans' },
            { id: 'climate', label: 'Climate / AC' },
            { id: 'plug', label: 'Smart Plugs' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedType(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedType === cat.id
                  ? 'bg-slate-700 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-300 bg-slate-900/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appliances Grid */}
      {filteredDevices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-md mx-auto">
          <RotateCcw className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Appliances Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            No appliances match your current room or type filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedRoom('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add Device Modal */}
      <AddDeviceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
