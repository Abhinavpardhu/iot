import React from 'react';
import { useHome } from '../../context/HomeContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { notifications, dismissNotification } = useHome();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => {
        let borderClass = 'border-cyan-500/30';
        let bgClass = 'bg-slate-900/95';
        let textClass = 'text-cyan-400';
        let Icon = Info;

        if (notif.type === 'success') {
          borderClass = 'border-emerald-500/30';
          textClass = 'text-emerald-400';
          Icon = CheckCircle2;
        } else if (notif.type === 'error') {
          borderClass = 'border-rose-500/40';
          textClass = 'text-rose-400';
          Icon = AlertCircle;
        } else if (notif.type === 'warning') {
          borderClass = 'border-amber-500/30';
          textClass = 'text-amber-400';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${borderClass} ${bgClass} shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${textClass}`} />
            <div className="flex-1 text-xs font-medium text-slate-200 leading-relaxed">
              {notif.message}
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
