import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'cyan', 
  badge = null 
}) {
  const colorMap = {
    cyan: {
      iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      borderGlow: 'hover:border-cyan-500/30',
      textAccent: 'text-cyan-400'
    },
    blue: {
      iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      borderGlow: 'hover:border-blue-500/30',
      textAccent: 'text-blue-400'
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      borderGlow: 'hover:border-emerald-500/30',
      textAccent: 'text-emerald-400'
    },
    amber: {
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      borderGlow: 'hover:border-amber-500/30',
      textAccent: 'text-amber-400'
    },
  };

  const theme = colorMap[color] || colorMap.cyan;

  return (
    <div className={`glass-card rounded-2xl p-5 border border-slate-800/80 transition-all duration-300 ${theme.borderGlow} flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-medium text-slate-400 block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${theme.iconBg} flex-shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate">
          {subtitle}
        </span>
        {badge && (
          <span className="ml-2 flex-shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
