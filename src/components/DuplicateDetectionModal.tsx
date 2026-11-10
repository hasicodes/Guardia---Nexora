import React from 'react';
import { 
  X, 
  Copy, 
  AlertTriangle, 
  Link2, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { DuplicateSuggestion, Incident } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface DuplicateDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: DuplicateSuggestion[];
  incidents: Incident[];
  onResolveDuplicate: (id: string, action: 'linked' | 'confirmed_duplicate' | 'dismissed') => Promise<void>;
  language: Language;
}

export const DuplicateDetectionModal: React.FC<DuplicateDetectionModalProps> = ({
  isOpen,
  onClose,
  duplicates,
  incidents,
  onResolveDuplicate,
  language
}) => {
  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const getIncident = (id: string) => incidents.find(i => i.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#071426] border-b border-[#1A365D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Copy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Duplicate Incident Detection Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Correlates geographic proximity, submission time, and narrative similarity to prevent duplicate dispatches
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {duplicates.map(dup => {
            const incA = getIncident(dup.primaryIncidentId);
            const incB = getIncident(dup.duplicateIncidentId);
            if (!incA || !incB) return null;

            return (
              <div 
                key={dup.id} 
                className="p-5 bg-[#071426] border border-[#1A365D] rounded-2xl space-y-4"
              >
                {/* Confidence Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#1A365D]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {dup.id}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs font-bold text-white">
                      {dup.confidenceScore}% Correlation Match
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    dup.status === 'confirmed_duplicate'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : dup.status === 'linked'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {dup.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Side-by-Side Incident Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Primary Incident */}
                  <div className="p-4 bg-[#142B46] rounded-xl border border-[#1A365D] space-y-2">
                    <div className="text-[10px] font-mono text-[#268BFF] uppercase font-bold">
                      Primary Report: {incA.incidentReference}
                    </div>
                    <div className="font-bold text-white text-sm">{incA.title}</div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                      <span>{incA.locality}, {incA.district}</span>
                    </div>
                    <p className="text-slate-300 bg-[#071426] p-2.5 rounded-lg border border-[#1A365D]/60 text-[11px] leading-relaxed">
                      "{incA.description}"
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Reported: {new Date(incA.submittedAt).toLocaleTimeString()} · Reporter: {incA.submittedBy.name}
                    </div>
                  </div>

                  {/* Flagged Duplicate Candidate */}
                  <div className="p-4 bg-[#142B46] rounded-xl border border-amber-500/40 space-y-2">
                    <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">
                      Correlated Report: {incB.incidentReference}
                    </div>
                    <div className="font-bold text-white text-sm">{incB.title}</div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{incB.locality}, {incB.district}</span>
                    </div>
                    <p className="text-slate-300 bg-[#071426] p-2.5 rounded-lg border border-[#1A365D]/60 text-[11px] leading-relaxed">
                      "{incB.description}"
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Reported: {new Date(incB.submittedAt).toLocaleTimeString()} · Reporter: {incB.submittedBy.name}
                    </div>
                  </div>

                </div>

                {/* Matching Factors */}
                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                    Detected Correlation Factors:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dup.matchingFactors.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 text-[11px] bg-[#142B46] border border-[#1A365D] rounded text-slate-200">
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Administrator Decision Controls */}
                <div className="pt-3 border-t border-[#1A365D] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 italic">
                    Safety Rule: Original citizen records remain archived and are not deleted.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onResolveDuplicate(dup.id, 'dismissed')}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#142B46] rounded-lg transition-colors"
                    >
                      Dismiss (Distinct Incident)
                    </button>
                    <button
                      onClick={() => onResolveDuplicate(dup.id, 'linked')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Link as Related Incident</span>
                    </button>
                    <button
                      onClick={() => onResolveDuplicate(dup.id, 'confirmed_duplicate')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#D62839] rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm Duplicate</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

          {duplicates.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-xs">
              No potential duplicate reports currently flagged by proximity scan.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
