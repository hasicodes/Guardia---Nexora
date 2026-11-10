import React, { useState } from 'react';
import { 
  Shield, 
  Flame, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Radio, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Incident, DepartmentType, User } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface DepartmentPortalProps {
  department: DepartmentType;
  currentUser: User;
  incidents: Incident[];
  onAcknowledgeNotification: (notifId: string, responderName: string, notes?: string) => Promise<void>;
  onUpdateStatus: (notifId: string, status: 'response_initiated' | 'completed', responderName: string, notes?: string) => Promise<void>;
  language: Language;
}

export const DepartmentPortal: React.FC<DepartmentPortalProps> = ({
  department,
  currentUser,
  incidents,
  onAcknowledgeNotification,
  onUpdateStatus,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [activeNoteNotifId, setActiveNoteNotifId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter incidents for this department
  const deptIncidents = incidents.filter(inc => 
    inc.notifications.some(n => n.department === department)
  );

  const getHeaderIcon = () => {
    switch (department) {
      case 'police': return <Shield className="w-6 h-6 text-sky-400" />;
      case 'fire': return <Flame className="w-6 h-6 text-orange-400" />;
      case 'ambulance': return <HeartPulse className="w-6 h-6 text-emerald-400" />;
    }
  };

  const getDeptTitle = () => {
    switch (department) {
      case 'police': return 'Police Command & Rapid Response Center';
      case 'fire': return 'Fire & Rescue Services Operations Portal';
      case 'ambulance': return 'Emergency Medical Services (108) Trauma Command';
    }
  };

  const handleAcknowledge = async (notifId: string) => {
    try {
      setIsUpdating(true);
      await onAcknowledgeNotification(
        notifId, 
        currentUser.name || 'Duty Commander', 
        'Direct command receipt acknowledged via Department Mobile Gateway.'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusTransition = async (notifId: string, newStatus: 'response_initiated' | 'completed') => {
    try {
      setIsUpdating(true);
      await onUpdateStatus(
        notifId, 
        newStatus, 
        currentUser.name || 'Field Officer', 
        noteText.trim() || undefined
      );
      setActiveNoteNotifId(null);
      setNoteText('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-[#10233C] via-[#142B46] to-[#10233C] border border-[#1A365D] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#071426] rounded-xl border border-[#1A365D]">
            {getHeaderIcon()}
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#268BFF]">
              Authorised Department Portal · Badge {currentUser.badgeNumber || 'AUTH-SEC-10'}
            </div>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {getDeptTitle()}
            </h2>
            <div className="text-xs text-slate-300 mt-0.5">
              Logged in as <span className="font-semibold text-white">{currentUser.name}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#071426] rounded-xl border border-[#1A365D] text-xs font-mono">
            <span className="text-slate-400">Assigned Missions: </span>
            <span className="font-bold text-white tabular-nums">{deptIncidents.length}</span>
          </div>
        </div>
      </div>

      {/* Incident Notifications Grid */}
      <div className="space-y-4">
        {deptIncidents.map(inc => {
          const notif = inc.notifications.find(n => n.department === department);
          if (!notif) return null;

          const isAcked = Boolean(notif.acknowledgedAt);
          const isDeployed = notif.status === 'response_initiated';
          const isDone = notif.status === 'completed';

          return (
            <div
              key={inc.id}
              className="p-6 bg-[#10233C] border border-[#1A365D] rounded-2xl shadow-xl space-y-4 hover:border-[#268BFF]/40 transition-all"
            >
              {/* Row 1: Badges & Timing */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1A365D]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#268BFF]">
                    {inc.incidentReference}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs text-slate-300 capitalize">{inc.category.replace('_', ' ')}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-xs font-mono font-bold text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded">
                    {inc.finalPriority} PRIORITY
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Received: {new Date(inc.submittedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Row 2: Title & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8 space-y-2">
                  <h3 className="text-base font-bold text-white">
                    {inc.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                      {inc.locality}, {inc.district}, {inc.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      {inc.peopleAffected} Affected ({inc.peopleInjured} Injured)
                    </span>
                    {inc.peopleTrapped && (
                      <span className="text-[#E63946] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Victims Trapped
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 bg-[#071426] p-3 rounded-xl border border-[#1A365D] leading-relaxed">
                    {inc.description}
                  </p>
                </div>

                {/* Response Controls */}
                <div className="lg:col-span-4 bg-[#142B46] p-4 rounded-xl border border-[#1A365D] flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Current Response Status
                    </div>
                    <div className="text-sm font-bold text-white uppercase mt-0.5 font-mono">
                      {notif.status.replace('_', ' ')}
                    </div>
                    {notif.acknowledgedAt && (
                      <div className="text-[11px] text-emerald-400 mt-1 font-mono">
                        Ack: {new Date(notif.acknowledgedAt).toLocaleTimeString()} ({notif.acknowledgedBy})
                      </div>
                    )}
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="space-y-2">
                    {!isAcked ? (
                      <button
                        onClick={() => handleAcknowledge(notif.id)}
                        disabled={isUpdating}
                        className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Acknowledge Dispatch Receipt</span>
                      </button>
                    ) : !isDeployed && !isDone ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleStatusTransition(notif.id, 'response_initiated')}
                          disabled={isUpdating}
                          className="w-full py-2.5 px-4 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Radio className="w-4 h-4" />
                          <span>Mobilize / Arrived On Scene</span>
                        </button>
                      </div>
                    ) : !isDone ? (
                      <button
                        onClick={() => handleStatusTransition(notif.id, 'completed')}
                        disabled={isUpdating}
                        className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Mission Completed</span>
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs font-bold text-emerald-400 font-mono">
                        ✓ Mission Accomplished
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Responder Field Notes Section */}
              {notif.responseNotes && (
                <div className="p-3 bg-[#071426] rounded-xl border border-[#1A365D] text-xs text-slate-300 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-[#268BFF] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">Field Telemetry Log: </span>
                    <span className="italic">"{notif.responseNotes}"</span>
                  </div>
                </div>
              )}

            </div>
          );
        })}

        {deptIncidents.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-sm">
            No active emergencies assigned to this department at this time.
          </div>
        )}
      </div>

    </div>
  );
};
