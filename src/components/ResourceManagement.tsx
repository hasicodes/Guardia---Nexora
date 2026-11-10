import React, { useState } from 'react';
import { 
  Truck, 
  Shield, 
  Flame, 
  HeartPulse, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Clock, 
  RotateCcw,
  Plus,
  Send,
  LifeBuoy,
  Radio
} from 'lucide-react';
import { EmergencyResource, Incident, DepartmentType } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface ResourceManagementProps {
  resources: EmergencyResource[];
  incidents: Incident[];
  onAssignResource: (resourceId: string, incidentId: string) => Promise<void>;
  onReleaseResource: (resourceId: string) => Promise<void>;
  language: Language;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  resources,
  incidents,
  onAssignResource,
  onReleaseResource,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignModalResource, setAssignModalResource] = useState<EmergencyResource | null>(null);
  const [targetIncidentId, setTargetIncidentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active unassigned incidents that need resources
  const activeIncidents = incidents.filter(i => 
    i.incidentStatus !== 'resolved' && i.incidentStatus !== 'closed'
  );

  const filteredResources = resources.filter(r => {
    if (departmentFilter !== 'all' && r.department !== departmentFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const getDeptIcon = (dept: DepartmentType | string) => {
    switch (dept) {
      case 'police': return <Shield className="w-4 h-4 text-sky-400" />;
      case 'fire': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'ambulance': return <HeartPulse className="w-4 h-4 text-emerald-400" />;
      default: return <Radio className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleConfirmAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalResource || !targetIncidentId) return;

    try {
      setIsSubmitting(true);
      await onAssignResource(assignModalResource.id, targetIncidentId);
      setAssignModalResource(null);
      setTargetIncidentId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <span>National Logistics Command</span>
            <span aria-hidden="true">·</span>
            <span>Emergency Fleet & Asset Allocations</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Emergency Fleet & Resource Management
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Live deployment telemetry for ambulances, fire tenders, police interceptors, and rescue gear.
          </p>
        </div>

        {/* Quick Fleet Counter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 bg-[#142B46] border border-emerald-500/40 rounded-lg text-emerald-400">
            Available: {resources.filter(r => r.status === 'available').length}
          </div>
          <div className="px-3 py-1.5 bg-[#142B46] border border-[#268BFF]/40 rounded-lg text-[#268BFF]">
            Deployed: {resources.filter(r => r.status === 'assigned' || r.status === 'in_use').length}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#10233C] border border-[#1A365D] rounded-xl">
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Departments</option>
            <option value="police">Police Command</option>
            <option value="fire">Fire & Rescue</option>
            <option value="ambulance">Medical EMS (108)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available (Ready)</option>
            <option value="assigned">Assigned / Dispatched</option>
            <option value="in_use">On Scene / In Use</option>
            <option value="unavailable">Maintenance / Offline</option>
          </select>

        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredResources.length} of {resources.length} registered assets
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(res => {
          const assignedIncident = incidents.find(i => i.id === res.assignedIncidentId);
          const isAssigned = res.status === 'assigned' || res.status === 'in_use';

          return (
            <div
              key={res.id}
              className="p-5 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF]/40 rounded-2xl shadow-xl space-y-4 transition-all"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1A365D]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#142B46] rounded-xl border border-[#1A365D]">
                    {getDeptIcon(res.department)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#268BFF] uppercase font-bold">
                      {res.id}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {res.name}
                    </h4>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  res.status === 'available'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : res.status === 'assigned'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {res.status.replace('_', ' ')}
                </span>
              </div>

              {/* Station & Crew */}
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{res.location}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Crew: {res.crewCount} Certified Personnel</span>
                </div>
              </div>

              {/* Assignment Notice */}
              {assignedIncident && (
                <div className="p-2.5 bg-[#071426] rounded-xl border border-[#1A365D] text-xs space-y-1">
                  <div className="text-[10px] font-mono text-[#268BFF] uppercase">
                    Active Deployment: {assignedIncident.incidentReference}
                  </div>
                  <div className="font-semibold text-white truncate">
                    {assignedIncident.title}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 border-t border-[#1A365D] flex items-center justify-between gap-2">
                {isAssigned ? (
                  <button
                    onClick={() => onReleaseResource(res.id)}
                    className="w-full py-2 px-3 text-xs font-semibold text-amber-300 hover:text-white bg-[#142B46] hover:bg-amber-600/30 border border-amber-500/40 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Demobilize / Return to Fleet</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAssignModalResource(res);
                      setTargetIncidentId(activeIncidents[0]?.id || '');
                    }}
                    disabled={res.status === 'unavailable'}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Deploy to Emergency Scene</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Deployment Assignment Modal */}
      {assignModalResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#10233C] border border-[#268BFF]/40 rounded-2xl p-6 space-y-4">
            <div>
              <div className="text-xs font-mono text-[#268BFF] uppercase font-bold">
                Logistics Dispatch Command
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Deploy {assignModalResource.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Select an active emergency scene to assign this unit.
              </p>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target Emergency Incident
                </label>
                <select
                  required
                  value={targetIncidentId}
                  onChange={(e) => setTargetIncidentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white focus:outline-none focus:border-[#268BFF]"
                >
                  {activeIncidents.map(inc => (
                    <option key={inc.id} value={inc.id}>
                      [{inc.finalPriority}] {inc.incidentReference} - {inc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalResource(null)}
                  className="px-4 py-2 text-xs text-slate-300 bg-[#142B46] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetIncidentId}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Deploying...' : 'Confirm Mobilization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
