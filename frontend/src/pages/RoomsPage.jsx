import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import DeviceCard from '../components/common/DeviceCard';
import { 
  Home, 
  Sofa, 
  Bed, 
  Utensils, 
  BookOpen, 
  Power, 
  Thermometer, 
  Droplets, 
  Eye, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Flame 
} from 'lucide-react';

const roomIcons = {
  'living-room': Sofa,
  'bedroom': Bed,
  'kitchen': Utensils,
  'study': BookOpen,
};

export default function RoomsPage() {
  const { rooms, devices, sensors, toggleRoomAll, formatTemp } = useHome();
  const [expandedRoom, setExpandedRoom] = useState(rooms[0]?.id || 'living-room');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Home className="w-5 h-5 text-cyan-400" />
            Zone & Room Level Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Group appliances and sensors by architectural zones with master room switches.
          </p>
        </div>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const Icon = roomIcons[room.id] || Home;
          const roomDevices = devices.filter(d => d.room === room.id);
          const roomSensors = sensors.filter(s => s.room === room.id);
          const activeCount = roomDevices.filter(d => d.state === 'ON').length;
          const isExpanded = expandedRoom === room.id;

          const tempSensor = roomSensors.find(s => s.type === 'temperature');
          const humSensor = roomSensors.find(s => s.type === 'humidity');
          const motionSensor = roomSensors.find(s => s.type === 'motion');
          const gasSensor = roomSensors.find(s => s.type === 'gas');

          return (
            <div
              key={room.id}
              className="glass-card rounded-3xl border border-slate-800/90 overflow-hidden transition-all duration-300"
            >
              {/* Room Card Header */}
              <div className="p-6 border-b border-slate-800/80 bg-slate-900/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/40">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        {room.floor}
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {room.name}
                      </h3>
                    </div>
                  </div>

                  {/* Room Active Devices Badge */}
                  <span
                    className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
                      activeCount > 0
                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {activeCount} of {roomDevices.length} ON
                  </span>
                </div>

                {/* Environmental quick metrics */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {tempSensor && (
                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Temp</span>
                        <span className="text-xs font-bold font-mono text-white">
                          {formatTemp(tempSensor.value)}
                        </span>
                      </div>
                    </div>
                  )}

                  {humSensor && (
                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Humidity</span>
                        <span className="text-xs font-bold font-mono text-white">
                          {humSensor.value} %
                        </span>
                      </div>
                    </div>
                  )}

                  {motionSensor && (
                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Motion</span>
                        <span className={`text-xs font-bold font-mono ${motionSensor.value === 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {motionSensor.value === 1 ? 'ACTIVE' : 'CLEAR'}
                        </span>
                      </div>
                    </div>
                  )}

                  {gasSensor && (
                    <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-400 flex-shrink-0" />
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">MQ-2 Gas</span>
                        <span className="text-xs font-bold font-mono text-white">
                          {gasSensor.value} ppm
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bulk Action Buttons & Expand Toggle */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRoomAll(room.id, 'ON')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors"
                    >
                      Turn All ON
                    </button>
                    <button
                      onClick={() => toggleRoomAll(room.id, 'OFF')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      Turn All OFF
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedRoom(isExpanded ? null : room.id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Appliances' : `Show (${roomDevices.length})`}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Device Cards List */}
              {isExpanded && (
                <div className="p-5 bg-slate-950/30 space-y-3">
                  <span className="text-xs font-semibold text-slate-400 block">
                    Appliances in {room.name}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roomDevices.map(device => (
                      <DeviceCard key={device.id} device={device} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
