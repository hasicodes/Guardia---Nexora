import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  MapPin, 
  Users, 
  Radio, 
  AlertTriangle,
  ChevronRight,
  Truck
} from 'lucide-react';
import { Incident, PriorityLevel } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface CitizenTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  language: Language;
}

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  P1: '#E63946',
  P2: '#F28C28',
  P3: '#E9B949',
  P4: '#2EAD72'
};

export const CitizenTrackerModal: React.FC<CitizenTrackerModalProps> = ({
  isOpen,
  onClose,
  incidents,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [searchRef, setSearchRef] = useState('');
  const [trackedIncident, setTrackedIncident] = useState<Incident | null>(incidents[0] || null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchRef.trim().toUpperCase();
    if (!query) return;

    const match = incidents.find(i => 
      i.incidentReference.toUpperCase() === query || 
      i.id.toUpperCase() === query
    );

    if (match) {
      setTrackedIncident(match);
      setNotFound(false);
    } else {
      setNotFound(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl text-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#071426] border-b border-[#1A365D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#268BFF] animate-pulse" />
            <div>
              <h3 className="text-base font-bold text-white">
                {t.tracker.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Official real-time situational tracking for Indian citizens
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 pb-2 border-b border-[#1A365D]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t.tracker.placeholder}
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono uppercase bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-xl transition-colors whitespace-nowrap"
            >
              {t.tracker.trackBtn}
            </button>
          </form>

          {notFound && (
            <div className="mt-2 text-xs text-[#E63946] font-mono">
              Reference code not found in national registry. Please check your reference code (e.g., GUA-TN-2026-8821).
            </div>
          )}
        </div>

        {/* Incident Tracking Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {trackedIncident ? (
            <>
              {/* Summary Header */}
              <div className="p-4 bg-[#142B46] rounded-xl border border-[#1A365D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#268BFF]">
                      {trackedIncident.incidentReference}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-300 capitalize">{trackedIncident.category.replace('_', ' ')}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-1">
                    {trackedIncident.title}
                  </h4>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                    <span>{trackedIncident.locality}, {trackedIncident.district}, {trackedIncident.state}</span>
                  </div>
                </div>

                <div className="text-right sm:border-l sm:border-[#1A365D] sm:pl-4">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Operational Status</div>
                  <div className="text-sm font-bold text-white uppercase mt-0.5">
                    {trackedIncident.incidentStatus.replace('_', ' ')}
                  </div>
                  <div className="mt-1 text-xs font-mono font-bold" style={{ color: PRIORITY_COLORS[trackedIncident.finalPriority] }}>
                    {trackedIncident.finalPriority} Priority
                  </div>
                </div>
              </div>

              {/* Response Pipeline Progression */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {t.tracker.pipelineHeader}
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1A365D]">
                  
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#10233C] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#10233C]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Emergency Report Received</div>
                      <div className="text-[11px] text-slate-400">
                        Logged in central database at {new Date(trackedIncident.submittedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#10233C] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-[#10233C]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">LIFE-FIRST Algorithmic Triage</div>
                      <div className="text-[11px] text-slate-400">
                        Assessed Severity Score {trackedIncident.assessment.score}/100. Assigned {trackedIncident.finalPriority}.
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-[#10233C] flex items-center justify-center ${
                      trackedIncident.verificationStatus === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}>
                      <CheckCircle2 className="w-3 h-3 text-[#10233C]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Incident Command Verification</div>
                      <div className="text-[11px] text-slate-400">
                        Status: <span className="uppercase text-slate-200">{trackedIncident.verificationStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-[#10233C] flex items-center justify-center ${
                      trackedIncident.notifications.some(n => n.status === 'response_initiated' || n.status === 'completed') 
                        ? 'bg-emerald-500' 
                        : (trackedIncident.notifications.some(n => n.status === 'acknowledged') ? 'bg-[#268BFF]' : 'bg-slate-600')
                    }`}>
                      <Truck className="w-2.5 h-2.5 text-[#10233C]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Emergency Services Deployment</div>
                      <div className="text-[11px] text-slate-400">
                        {trackedIncident.notifications.map(n => `${n.department.toUpperCase()} (${n.status.replace('_', ' ')})`).join(' · ')}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Assigned Department Communications */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  {t.tracker.dispatchHeader}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {trackedIncident.notifications.map(notif => (
                    <div key={notif.id} className="p-3 bg-[#071426] rounded-xl border border-[#1A365D] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{notif.departmentName}</span>
                        <span className="text-[10px] font-mono text-[#268BFF] uppercase">{notif.status.replace('_', ' ')}</span>
                      </div>
                      {notif.acknowledgedAt && (
                        <div className="text-[11px] text-slate-400">
                          Acknowledged at {new Date(notif.acknowledgedAt).toLocaleTimeString()}
                        </div>
                      )}
                      {notif.responseNotes && (
                        <div className="text-[11px] text-slate-300 italic bg-[#10233C] p-2 rounded border border-[#1A365D]">
                          "{notif.responseNotes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              {t.tracker.noIncident}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
