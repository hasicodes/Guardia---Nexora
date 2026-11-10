import React, { useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  ChevronRight, 
  Activity,
  ShieldAlert
} from 'lucide-react';
import { CrisisCluster, Incident, PriorityLevel } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface CrisisPulseViewerProps {
  clusters: CrisisCluster[];
  incidents: Incident[];
  onVerifyCluster: (clusterId: string, verified: boolean) => Promise<void>;
  onSelectIncident: (incident: Incident) => void;
  language: Language;
}

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  P1: '#E63946',
  P2: '#F28C28',
  P3: '#E9B949',
  P4: '#2EAD72'
};

export const CrisisPulseViewer: React.FC<CrisisPulseViewerProps> = ({
  clusters,
  incidents,
  onVerifyCluster,
  onSelectIncident,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [selectedCluster, setSelectedCluster] = useState<CrisisCluster | null>(clusters[0] || null);

  const getIncidentById = (id: string) => incidents.find(i => i.id === id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <span>CRISIS PULSE Geospatial Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Spatial & Multi-Hazard Correlation</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Emergency Cluster Detection
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Correlates incoming reports across geographic coordinates, categories, and time horizons to detect compounding regional disasters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-[#142B46] border border-[#268BFF]/40 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Active Clusters: </span>
            <span className="font-bold text-white tabular-nums">{clusters.length}</span>
          </div>
        </div>
      </div>

      {/* Grid: Cluster Cards + Drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {clusters.map(cluster => {
            const isSelected = selectedCluster?.id === cluster.id;

            return (
              <div
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-[#142B46] border-[#268BFF] shadow-xl shadow-[#268BFF]/10' 
                    : 'bg-[#10233C] hover:bg-[#142B46]/60 border-[#1A365D]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#1A365D]/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#268BFF] animate-ping" />
                    <span className="text-xs font-mono font-bold text-[#268BFF]">
                      {cluster.id}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    cluster.status === 'verified' 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {cluster.status}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-bold text-white">
                  {cluster.name}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                    {cluster.district}, {cluster.state}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-amber-300">
                    <Users className="w-3.5 h-3.5" />
                    {cluster.totalAffected} Affected ({cluster.totalInjured} Injured)
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#1A365D]/40 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>{cluster.incidentIds.length} Linked Emergencies</span>
                  <span className="text-[#268BFF]">~{cluster.radiusKm} km radius</span>
                </div>
              </div>
            );
          })}

          {clusters.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No geographical emergency clusters currently detected.
            </div>
          )}
        </div>

        {/* Right Detail (7 cols) */}
        <div className="lg:col-span-7 bg-[#10233C] rounded-2xl border border-[#1A365D] p-6 space-y-6">
          {selectedCluster ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1A365D]">
                <div>
                  <span className="text-xs font-mono text-[#268BFF] uppercase tracking-wider">
                    Cluster Analysis · {selectedCluster.id}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {selectedCluster.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedCluster.status !== 'verified' && (
                    <button
                      onClick={() => onVerifyCluster(selectedCluster.id, true)}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify Cluster</span>
                    </button>
                  )}
                  {selectedCluster.status !== 'dismissed' && (
                    <button
                      onClick={() => onVerifyCluster(selectedCluster.id, false)}
                      className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#142B46] border border-[#1A365D] rounded-lg transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>

              {/* Geographic Coordinates & Impact */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#142B46] rounded-xl border border-[#1A365D]">
                  <div className="text-slate-400">Centroid Lat/Lng</div>
                  <div className="text-sm font-bold text-white font-mono mt-1">
                    {selectedCluster.centerLatitude}, {selectedCluster.centerLongitude}
                  </div>
                </div>
                <div className="p-3 bg-[#142B46] rounded-xl border border-[#1A365D]">
                  <div className="text-slate-400">Total Affected</div>
                  <div className="text-xl font-bold text-amber-300 font-mono mt-1">
                    {selectedCluster.totalAffected}
                  </div>
                </div>
                <div className="p-3 bg-[#142B46] rounded-xl border border-[#1A365D]">
                  <div className="text-slate-400">Reported Injured</div>
                  <div className="text-xl font-bold text-orange-400 font-mono mt-1">
                    {selectedCluster.totalInjured}
                  </div>
                </div>
                <div className="p-3 bg-[#142B46] rounded-xl border border-[#E63946]/30">
                  <div className="text-slate-400">Dominant Priority</div>
                  <div className="text-xl font-bold text-[#E63946] font-mono mt-1">
                    {selectedCluster.primaryPriority}
                  </div>
                </div>
              </div>

              {/* Linked Incidents List */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Correlated Incident Reports ({selectedCluster.incidentIds.length})
                </div>

                <div className="space-y-2.5">
                  {selectedCluster.incidentIds.map(incId => {
                    const inc = getIncidentById(incId);
                    if (!inc) return null;

                    return (
                      <div
                        key={inc.id}
                        className="p-3.5 bg-[#071426] rounded-xl border border-[#1A365D] hover:border-[#268BFF]/40 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-[#268BFF]">
                              {inc.incidentReference}
                            </span>
                            <span className="text-[11px] text-slate-400 capitalize">
                              ({inc.category.replace('_', ' ')})
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#E63946]/20 text-[#E63946]">
                              {inc.finalPriority}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-white truncate mt-1">
                            {inc.title}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {inc.locality} · {inc.peopleAffected} Affected · {new Date(inc.submittedAt).toLocaleTimeString()}
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#142B46] rounded-lg border border-[#1A365D] shrink-0 flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </>
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              Select an emergency cluster to inspect linked reports and spatial telemetry.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
