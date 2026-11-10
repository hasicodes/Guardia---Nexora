import React, { useState } from 'react';
import { 
  Radio, 
  Shield, 
  Flame, 
  HeartPulse, 
  CheckCircle2, 
  Clock, 
  Send, 
  Activity, 
  MapPin, 
  MessageSquare,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';
import { Incident, DepartmentNotification, DepartmentType } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface RescueBridgeCoordinationProps {
  incidents: Incident[];
  onAcknowledgeNotification: (notifId: string, responderName: string, notes?: string) => Promise<void>;
  onUpdateDepartmentStatus: (notifId: string, status: 'response_initiated' | 'completed', responderName: string, notes?: string) => Promise<void>;
  onSwitchToDepartmentPortal: (dept: DepartmentType) => void;
  language: Language;
}

export const RescueBridgeCoordination: React.FC<RescueBridgeCoordinationProps> = ({
  incidents,
  onAcknowledgeNotification,
  onUpdateDepartmentStatus,
  onSwitchToDepartmentPortal,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [simulatingId, setSimulatingId] = useState<string | null>(null);

  // Collect all department notifications across active incidents
  const allNotifications = incidents.flatMap(inc => 
    inc.notifications.map(notif => ({
      ...notif,
      incidentReference: inc.incidentReference,
      incidentTitle: inc.title,
      incidentLocation: `${inc.locality}, ${inc.district}`,
      incidentPriority: inc.finalPriority,
      incidentCategory: inc.category,
      incidentId: inc.id
    }))
  ).filter(n => selectedDeptFilter === 'all' || n.department === selectedDeptFilter);

  // Department icon mapper
  const getDeptIcon = (dept: DepartmentType | string) => {
    switch (dept) {
      case 'police':
        return <Shield className="w-4 h-4 text-sky-400" />;
      case 'fire':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'ambulance':
        return <HeartPulse className="w-4 h-4 text-emerald-400" />;
      default:
        return <Radio className="w-4 h-4 text-amber-400" />;
    }
  };

  // Simulate quick acknowledgement test for demo
  const handleSimulateAcknowledgement = async (notifId: string, dept: string) => {
    setSimulatingId(notifId);
    try {
      const names: Record<string, string> = {
        police: 'Inspector R. Selvakumar',
        fire: 'Chief Officer M. Banerjee',
        ambulance: 'Dr. Priya Nambiar (EMS 108)',
        disaster: 'Commander K. Rathore (NDRF)',
        search_and_rescue: 'Capt. S. Alagappan (SAR)'
      };
      await onAcknowledgeNotification(
        notifId, 
        names[dept] || 'Duty Commander', 
        `[SIMULATED DISPATCH] Unit mobilized. Expected ETA on scene 6 minutes.`
      );
    } finally {
      setSimulatingId(null);
    }
  };

  // Simulate deployment progress
  const handleSimulateResponseInitiated = async (notifId: string, dept: string) => {
    setSimulatingId(notifId);
    try {
      const names: Record<string, string> = {
        police: 'Inspector R. Selvakumar',
        fire: 'Chief Officer M. Banerjee',
        ambulance: 'Dr. Priya Nambiar (EMS 108)',
        disaster: 'Commander K. Rathore (NDRF)',
        search_and_rescue: 'Capt. S. Alagappan (SAR)'
      };
      await onUpdateDepartmentStatus(
        notifId, 
        'response_initiated', 
        names[dept] || 'Lead Responder', 
        `[SIMULATED DISPATCH] Responders arrived at location. Perimeter secured, extrication commenced.`
      );
    } finally {
      setSimulatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <span>RESCUE BRIDGE Protocol</span>
            <span aria-hidden="true">·</span>
            <span>Inter-Agency Coordination Core</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Emergency Services Coordination & Acknowledgements
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Synchronizes police commands, fire rescue tenders, and ambulance EMS dispatchers with verified timestamps.
          </p>
        </div>

        {/* Quick Portal Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSwitchToDepartmentPortal('police')}
            className="px-3 py-1.5 text-xs font-medium bg-[#142B46] hover:bg-[#1A365D] border border-[#1A365D] rounded-lg text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Police Portal</span>
          </button>
          <button
            onClick={() => onSwitchToDepartmentPortal('fire')}
            className="px-3 py-1.5 text-xs font-medium bg-[#142B46] hover:bg-[#1A365D] border border-[#1A365D] rounded-lg text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Fire Portal</span>
          </button>
          <button
            onClick={() => onSwitchToDepartmentPortal('ambulance')}
            className="px-3 py-1.5 text-xs font-medium bg-[#142B46] hover:bg-[#1A365D] border border-[#1A365D] rounded-lg text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ambulance Portal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#10233C] border border-[#1A365D] rounded-xl w-fit">
        {[
          { id: 'all', label: 'All Agencies' },
          { id: 'police', label: 'Police Command' },
          { id: 'fire', label: 'Fire & Rescue' },
          { id: 'ambulance', label: 'Medical EMS (108)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedDeptFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedDeptFilter === tab.id
                ? 'bg-[#268BFF] text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allNotifications.map(notif => {
          const isAcked = Boolean(notif.acknowledgedAt);
          const isDeployed = notif.status === 'response_initiated' || notif.status === 'completed';

          return (
            <div
              key={notif.id}
              className="p-5 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF]/40 rounded-2xl shadow-xl space-y-4 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1A365D]">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#142B46] rounded-lg border border-[#1A365D]">
                    {getDeptIcon(notif.department)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#268BFF] uppercase">
                      {notif.departmentName}
                    </span>
                    <div className="text-xs font-mono text-slate-400">
                      Ref: {notif.incidentReference}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    notif.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : notif.status === 'response_initiated'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : notif.status === 'acknowledged'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-700/40 text-slate-300 border border-slate-600'
                  }`}>
                    {notif.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Title & Location */}
              <div>
                <h4 className="text-sm font-bold text-white line-clamp-2">
                  {notif.incidentTitle}
                </h4>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#268BFF] shrink-0" />
                  <span className="truncate">{notif.incidentLocation}</span>
                </div>
              </div>

              {/* Timing Audit Telemetry */}
              <div className="p-3 bg-[#071426] rounded-xl border border-[#1A365D] text-xs space-y-1.5 font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transmitted:</span>
                  <span>{notif.sentAt ? new Date(notif.sentAt).toLocaleTimeString() : 'Queued'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Acknowledged:</span>
                  <span className={notif.acknowledgedAt ? 'text-emerald-400' : 'text-amber-400'}>
                    {notif.acknowledgedAt ? new Date(notif.acknowledgedAt).toLocaleTimeString() : 'Pending Receipt'}
                  </span>
                </div>
                {notif.acknowledgedBy && (
                  <div className="text-[11px] text-slate-400 truncate pt-1 border-t border-[#1A365D]">
                    Sign-off: {notif.acknowledgedBy}
                  </div>
                )}
              </div>

              {/* Responder Notes */}
              {notif.responseNotes && (
                <div className="p-2.5 bg-[#142B46] rounded-lg border border-[#1A365D] text-[11px] text-slate-200 italic">
                  "{notif.responseNotes}"
                </div>
              )}

              {/* Interactive Simulation Controls for Demo */}
              <div className="pt-2 border-t border-[#1A365D] flex items-center gap-2">
                {!isAcked ? (
                  <button
                    onClick={() => handleSimulateAcknowledgement(notif.id, notif.department)}
                    disabled={simulatingId === notif.id}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{simulatingId === notif.id ? 'Processing...' : 'Simulate Acknowledgement'}</span>
                  </button>
                ) : !isDeployed ? (
                  <button
                    onClick={() => handleSimulateResponseInitiated(notif.id, notif.department)}
                    disabled={simulatingId === notif.id}
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>{simulatingId === notif.id ? 'Mobilizing...' : 'Simulate Units On Scene'}</span>
                  </button>
                ) : (
                  <div className="w-full py-1.5 text-center text-xs text-emerald-400 font-mono font-semibold">
                    ✓ Operational Response Synchronized
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
