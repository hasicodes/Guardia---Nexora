import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Edit3, 
  Zap, 
  ChevronRight, 
  ArrowUpRight, 
  HelpCircle,
  Activity,
  Flame,
  Radio,
  RefreshCw
} from 'lucide-react';
import { Incident, PriorityLevel } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface LifeFirstQueueProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOverridePriority: (incidentId: string, newPriority: PriorityLevel, reason: string) => Promise<void>;
  onDynamicReassess: (incidentId: string, newInfo: Partial<Incident>) => Promise<void>;
  language: Language;
}

const PRIORITY_BADGE_STYLE: Record<PriorityLevel, { bg: string; text: string; border: string }> = {
  P1: { bg: 'bg-[#E63946]/20', text: 'text-[#E63946]', border: 'border-[#E63946]' },
  P2: { bg: 'bg-[#F28C28]/20', text: 'text-[#F28C28]', border: 'border-[#F28C28]' },
  P3: { bg: 'bg-[#E9B949]/20', text: 'text-[#E9B949]', border: 'border-[#E9B949]' },
  P4: { bg: 'bg-[#2EAD72]/20', text: 'text-[#2EAD72]', border: 'border-[#2EAD72]' }
};

export const LifeFirstQueue: React.FC<LifeFirstQueueProps> = ({
  incidents,
  onSelectIncident,
  onOverridePriority,
  onDynamicReassess,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>('P1');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Sorting strictly by Human Life Impact Rules:
  // 1. Urgent review flags
  // 2. P1, P2, P3, P4
  // 3. Waiting time / elapsed time
  const sortedIncidents = [...incidents].sort((a, b) => {
    if (a.assessment.urgentReviewOverride && !b.assessment.urgentReviewOverride) return -1;
    if (!a.assessment.urgentReviewOverride && b.assessment.urgentReviewOverride) return 1;

    const rank: Record<PriorityLevel, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
    const diff = rank[b.finalPriority] - rank[a.finalPriority];
    if (diff !== 0) return diff;

    return b.assessment.score - a.assessment.score;
  });

  const handleOpenOverride = (inc: Incident) => {
    setSelectedIncident(inc);
    setOverridePriority(inc.finalPriority);
    setOverrideReason('');
    setIsOverrideModalOpen(true);
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !overrideReason.trim()) return;

    try {
      setIsSubmittingOverride(true);
      await onOverridePriority(selectedIncident.id, overridePriority, overrideReason.trim());
      setIsOverrideModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Demonstrate Dynamic Reassessment
  const handleTriggerSimulatedReassessment = async (inc: Incident) => {
    // Simulate newly reported trapped people and life danger
    await onDynamicReassess(inc.id, {
      peopleTrapped: true,
      immediateDanger: true,
      injurySeverity: 'life_threatening',
      isSituationEscalating: true,
      medicalConditionNotes: 'LATEST INTEL: Multiple trapped casualties calling out from collapsed zone. Critical asphyxiation hazard.'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <span>Human-Centric Prioritisation Engine</span>
            <span aria-hidden="true">·</span>
            <span>8-Factor Algorithmic Triage</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            National Human Impact Priority Queue
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Prioritises emergencies based on reported threats to human life, trapped casualties, and injury severity rather than arbitrary report timestamps.
          </p>
        </div>

        {/* Quick Triage Metric */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-[#142B46] border border-[#E63946]/40 rounded-xl">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Immediate Life Threat</div>
            <div className="text-xl font-bold text-[#E63946] font-mono tabular-nums">
              {incidents.filter(i => i.finalPriority === 'P1').length} Active P1s
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Queue List + Detailed Explanation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Priority Queue List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {sortedIncidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            const badge = PRIORITY_BADGE_STYLE[incident.finalPriority];
            const isOverridden = incident.finalPriority !== incident.suggestedPriority;

            return (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#142B46] border-[#268BFF] shadow-lg shadow-[#268BFF]/10' 
                    : 'bg-[#10233C]/90 hover:bg-[#142B46]/70 border-[#1A365D]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Priority Badge & Reference */}
                  <div className="flex items-center gap-2.5">
                    <div className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {incident.finalPriority}
                    </div>
                    <div>
                      <span className="text-xs font-mono text-slate-400">
                        {incident.incidentReference}
                      </span>
                      {incident.assessment.urgentReviewOverride && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-[#E63946] text-white rounded font-mono uppercase">
                          Urgent Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score & Time */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-white font-mono tabular-nums">
                      {incident.assessment.score}<span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(incident.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h4 className="mt-2 text-sm font-semibold text-white leading-snug">
                  {incident.title}
                </h4>

                {/* Situational Footnotes */}
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                    {incident.locality}, {incident.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    {incident.peopleAffected} Affected ({incident.peopleInjured} Injured)
                  </span>
                  {incident.peopleTrapped && (
                    <span className="text-[#E63946] font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Trapped Casualties
                    </span>
                  )}
                </div>

                {/* Override notice if present */}
                {isOverridden && (
                  <div className="mt-2 text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Administrator Override: Suggested {incident.suggestedPriority} → Final {incident.finalPriority} ({incident.priorityOverrideReason})
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Selected Incident LIFE-FIRST Explanation Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-[#10233C] rounded-2xl border border-[#1A365D] p-5 space-y-5 sticky top-20">
          
          {selectedIncident ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#1A365D]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#268BFF] uppercase tracking-wider">
                      {selectedIncident.incidentReference}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-300 capitalize">{selectedIncident.category.replace('_', ' ')}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">
                    {selectedIncident.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleOpenOverride(selectedIncident)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-[#142B46] hover:bg-[#1A365D] border border-[#1A365D] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#268BFF]" />
                  <span>Override</span>
                </button>
              </div>

              {/* Assessment Score Card */}
              <div className="p-4 bg-[#142B46] rounded-xl border border-[#1A365D]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-slate-400 uppercase">LIFE-FIRST Score</div>
                    <div className="text-3xl font-extrabold text-white font-mono tabular-nums mt-0.5">
                      {selectedIncident.assessment.score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400 uppercase">Assigned Priority</div>
                    <div className="text-2xl font-black font-mono mt-0.5 text-[#E63946]">
                      {selectedIncident.finalPriority}
                    </div>
                  </div>
                </div>

                {selectedIncident.assessment.urgentReviewOverride && (
                  <div className="mt-3 p-2 bg-[#E63946]/15 border border-[#E63946]/30 rounded-lg text-xs text-[#E63946]">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>URGENT REVIEW OVERRIDE TRIGGERED</span>
                    </div>
                    <ul className="mt-1 space-y-0.5 pl-5 list-disc text-[11px]">
                      {selectedIncident.assessment.urgentReasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 8-Criteria Weighting Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>8 Evaluation Factors</span>
                  <span>Weights</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {Object.entries(selectedIncident.assessment.factors).map(([key, f]) => (
                    <div key={key} className="p-2 bg-[#071426] rounded-lg border border-[#1A365D]/60 flex items-center justify-between gap-2">
                      <div className="flex-1 truncate">
                        <span className="font-semibold text-slate-200 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="text-[11px] text-slate-400 truncate">{f.label}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-slate-300 font-bold">{f.contribution} pts</span>
                        <span className="text-[10px] text-slate-500 ml-1">({f.weight}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Information Flags (Critical safety logic) */}
              {selectedIncident.assessment.missingInformation.length > 0 && (
                <div className="p-3 bg-[#071426] rounded-xl border border-amber-500/30 text-xs text-amber-300">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Unconfirmed / Missing Data</span>
                  </div>
                  <ul className="pl-5 list-disc text-[11px] space-y-0.5 text-slate-300">
                    {selectedIncident.assessment.missingInformation.map((info, idx) => (
                      <li key={idx}>{info}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-[10px] text-slate-400 italic">
                    Safety Rule: Incomplete telemetry is never assumed safe. Precautionary score applied.
                  </div>
                </div>
              )}

              {/* Dynamic Reassessment Simulator (Hackathon Feature) */}
              <div className="p-3 bg-gradient-to-r from-[#142B46] to-[#10233C] rounded-xl border border-[#268BFF]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#268BFF]" />
                    <span>Dynamic Reassessment Test</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Simulate arrival of new critical reports (e.g. trapped staff, escalating blaze) to demonstrate automated dynamic priority escalation.
                </p>
                <button
                  onClick={() => handleTriggerSimulatedReassessment(selectedIncident)}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Simulate Life-Threat Escalation Signal</span>
                </button>
              </div>

            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              Select an incident from the queue to view LIFE-FIRST triage explanation.
            </div>
          )}

        </div>

      </div>

      {/* Administrator Override Modal */}
      {isOverrideModalOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="text-xs font-mono text-[#268BFF] uppercase">Administrative Governance</div>
              <h3 className="text-lg font-bold text-white mt-1">
                Override LIFE-FIRST Recommendation
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                You are modifying the algorithmic priority recommendation for {selectedIncident.incidentReference}. This action will be permanently recorded in the immutable audit log.
              </p>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Priority Designation
                </label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white focus:outline-none focus:border-[#268BFF]"
                >
                  <option value="P1">P1 - Life-Threatening (Immediate urgent review)</option>
                  <option value="P2">P2 - Urgent Assistance Required</option>
                  <option value="P3">P3 - Moderate Urgency</option>
                  <option value="P4">P4 - Lower Urgency / Staged Response</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Justification Reason (Mandatory for Audit Trail)
                </label>
                <textarea
                  required
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., On-scene commander confirmed extrication completed; danger stabilized."
                  className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#142B46] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride || !overrideReason.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-lg disabled:opacity-50"
                >
                  {isSubmittingOverride ? 'Recording Audit...' : 'Confirm Priority Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
