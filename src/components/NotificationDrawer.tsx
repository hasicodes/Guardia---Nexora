import React from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Radio, 
  Copy, 
  Layers, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { PlatformNotification, Incident } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PlatformNotification[];
  onMarkRead: (id: string) => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onSelectIncidentById: (id: string) => void;
  language: Language;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onSelectIncidentById,
  language
}) => {
  if (!isOpen) return null;

  const getIcon = (type: PlatformNotification['type']) => {
    switch (type) {
      case 'critical_priority': return <AlertTriangle className="w-4 h-4 text-[#E63946]" />;
      case 'escalation': return <ShieldAlert className="w-4 h-4 text-orange-400" />;
      case 'cluster_detected': return <Layers className="w-4 h-4 text-[#268BFF]" />;
      case 'duplicate_detected': return <Copy className="w-4 h-4 text-amber-400" />;
      case 'department_ack': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      default: return <Bell className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md h-full bg-[#10233C] border-l border-[#1A365D] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 bg-[#071426] border-b border-[#1A365D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#268BFF]" />
            <h3 className="text-base font-bold text-white">
              Command Alerts Center
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#268BFF] hover:underline font-mono"
            >
              Mark All Read
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) onMarkRead(n.id);
                if (n.incidentId) {
                  onSelectIncidentById(n.incidentId);
                  onClose();
                }
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                !n.read 
                  ? 'bg-[#142B46] border-[#268BFF]/40 shadow-sm' 
                  : 'bg-[#071426] border-[#1A365D] opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#071426] rounded-lg border border-[#1A365D] shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-white truncate">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  {n.incidentId && (
                    <div className="mt-2 text-[11px] text-[#268BFF] font-mono flex items-center gap-1 font-semibold">
                      <span>Inspect Incident Telemetry</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No alert notifications at this time.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
