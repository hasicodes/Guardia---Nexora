import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ShieldAlert,
  ArrowUpDown,
  X
} from 'lucide-react';
import { Incident, PriorityLevel, IncidentStatus, VerificationStatus } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface IncidentManagementTableProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onVerifyIncident: (id: string, verified: boolean, reason?: string) => Promise<void>;
  onUpdateStatus: (id: string, status: IncidentStatus) => Promise<void>;
  onDeleteIncident: (id: string) => Promise<void>;
  language: Language;
}

const PRIORITY_BADGE_STYLE: Record<PriorityLevel, { bg: string; text: string; border: string }> = {
  P1: { bg: 'bg-[#E63946]/20', text: 'text-[#E63946]', border: 'border-[#E63946]' },
  P2: { bg: 'bg-[#F28C28]/20', text: 'text-[#F28C28]', border: 'border-[#F28C28]' },
  P3: { bg: 'bg-[#E9B949]/20', text: 'text-[#E9B949]', border: 'border-[#E9B949]' },
  P4: { bg: 'bg-[#2EAD72]/20', text: 'text-[#2EAD72]', border: 'border-[#2EAD72]' }
};

export const IncidentManagementTable: React.FC<IncidentManagementTableProps> = ({
  incidents,
  onSelectIncident,
  onVerifyIncident,
  onUpdateStatus,
  onDeleteIncident,
  language
}) => {
  const t = TRANSLATIONS[language];

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'priority' | 'time' | 'affected'>('priority');

  // Rejection reason modal
  const [rejectModalIncident, setRejectModalIncident] = useState<Incident | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Selected Incident Detail Drawer
  const [inspectIncident, setInspectIncident] = useState<Incident | null>(null);

  // Filtered & Sorted Incidents
  const filtered = incidents.filter(i => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && i.finalPriority !== priorityFilter) return false;
    if (statusFilter !== 'all' && i.incidentStatus !== statusFilter) return false;
    if (verificationFilter !== 'all' && i.verificationStatus !== verificationFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        i.incidentReference.toLowerCase().includes(q) ||
        i.locality.toLowerCase().includes(q) ||
        i.district.toLowerCase().includes(q) ||
        i.state.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'priority') {
      const rank: Record<PriorityLevel, number> = { P1: 4, P2: 3, P3: 2, P4: 1 };
      return rank[b.finalPriority] - rank[a.finalPriority];
    } else if (sortBy === 'time') {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    } else {
      return b.peopleAffected - a.peopleAffected;
    }
  });

  // Export filtered incidents to CSV
  const handleExportCSV = () => {
    const headers = [
      'Incident Reference',
      'Title',
      'Category',
      'Priority',
      'Status',
      'Verification',
      'State',
      'District',
      'Locality',
      'People Affected',
      'Injuries',
      'People Trapped',
      'LIFE-FIRST Score',
      'Submitted At'
    ];

    const rows = filtered.map(i => [
      `"${i.incidentReference}"`,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      `"${i.finalPriority}"`,
      `"${i.incidentStatus}"`,
      `"${i.verificationStatus}"`,
      `"${i.state}"`,
      `"${i.district}"`,
      `"${i.locality.replace(/"/g, '""')}"`,
      i.peopleAffected,
      i.peopleInjured,
      i.peopleTrapped ? 'YES' : 'NO',
      i.assessment.score,
      `"${i.submittedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guardia_incidents_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalIncident || !rejectionReason.trim()) return;
    await onVerifyIncident(rejectModalIncident.id, false, rejectionReason.trim());
    setRejectModalIncident(null);
    setRejectionReason('');
  };

  const handleDeleteWithPrompt = async (inc: Incident) => {
    if (window.confirm(`Are you sure you want to delete demonstration incident record ${inc.incidentReference}? This action cannot be undone.`)) {
      await onDeleteIncident(inc.id);
      if (inspectIncident?.id === inc.id) {
        setInspectIncident(null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <span>National Incident Registry</span>
            <span aria-hidden="true">·</span>
            <span>Live Command Management</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Emergency Incident Management
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Comprehensive audit registry of all citizen reports, verification statuses, and department dispatches.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#10233C] hover:bg-[#142B46] border border-[#1A365D] rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#268BFF]" />
            <span>Export CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#10233C] border border-[#1A365D] rounded-xl flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search reference, location, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Categories</option>
            <option value="fire">Fire Emergency</option>
            <option value="road_accident">Road Accident</option>
            <option value="medical">Medical Emergency</option>
            <option value="flood">Flood</option>
            <option value="building_collapse">Building Collapse</option>
            <option value="other">Other</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1 - Life-Threatening</option>
            <option value="P2">P2 - Urgent</option>
            <option value="P3">P3 - Moderate</option>
            <option value="P4">P4 - Low Urgency</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Operational Statuses</option>
            <option value="reported">Reported</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => {
              setCategoryFilter('all');
              setPriorityFilter('all');
              setStatusFilter('all');
              setVerificationFilter('all');
              setSearchQuery('');
            }}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white bg-[#071426] border border-[#1A365D] rounded-lg"
          >
            Reset
          </button>

        </div>

      </div>

      {/* Incident Table */}
      <div className="bg-[#10233C] border border-[#1A365D] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            <thead>
              <tr className="bg-[#071426] border-b border-[#1A365D] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Reference</th>
                <th className="py-3.5 px-4 font-semibold">Incident Details</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Location</th>
                <th className="py-3.5 px-4 font-semibold">Priority</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Verification</th>
                <th className="py-3.5 px-4 font-semibold">Departments</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1A365D]/60 text-slate-200">
              {filtered.map(inc => {
                const badge = PRIORITY_BADGE_STYLE[inc.finalPriority];

                return (
                  <tr key={inc.id} className="hover:bg-[#142B46]/70 transition-colors">
                    
                    {/* Reference */}
                    <td className="py-3 px-4 font-mono font-bold text-[#268BFF] whitespace-nowrap">
                      {inc.incidentReference}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(inc.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span aria-hidden="true">·</span>
                        <span>{inc.peopleAffected} Affected</span>
                        {inc.peopleTrapped && (
                          <span className="text-[#E63946] font-bold">· TRAPPED</span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap capitalize text-slate-300">
                      {inc.category.replace('_', ' ')}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-white">{inc.district}</div>
                      <div className="text-[11px] text-slate-400">{inc.state}</div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {inc.finalPriority}
                      </span>
                    </td>

                    {/* Operational Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={inc.incidentStatus}
                        onChange={(e) => onUpdateStatus(inc.id, e.target.value as IncidentStatus)}
                        className="px-2 py-1 text-xs bg-[#071426] border border-[#1A365D] rounded text-slate-200 focus:outline-none focus:border-[#268BFF]"
                      >
                        <option value="reported">Reported</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>

                    {/* Verification */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {inc.verificationStatus === 'verified' ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : inc.verificationStatus === 'rejected' ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Assigned Departments */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {inc.notifications.map(n => (
                          <span
                            key={n.id}
                            title={`${n.departmentName}: ${n.status}`}
                            className="px-1.5 py-0.5 text-[10px] font-mono bg-[#142B46] border border-[#1A365D] rounded uppercase text-slate-300"
                          >
                            {n.department.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Inspect Drawer */}
                        <button
                          onClick={() => setInspectIncident(inc)}
                          title="View Incident Record & Timeline"
                          className="p-1.5 text-slate-300 hover:text-white bg-[#142B46] hover:bg-[#1A365D] rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-[#268BFF]" />
                        </button>

                        {/* Quick Verify */}
                        {inc.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => onVerifyIncident(inc.id, true)}
                            title="Verify Report"
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 bg-[#142B46] rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Reject */}
                        {inc.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => {
                              setRejectModalIncident(inc);
                              setRejectionReason('');
                            }}
                            title="Reject Invalid Report"
                            className="p-1.5 text-rose-400 hover:text-rose-300 bg-[#142B46] rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Demo */}
                        {inc.isDemo && (
                          <button
                            onClick={() => handleDeleteWithPrompt(inc)}
                            title="Delete Demo Incident"
                            className="p-1.5 text-slate-400 hover:text-rose-400 bg-[#142B46] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No incident records match the active filter criteria.
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      {rejectModalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#10233C] border border-rose-500/40 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">
                Reject Emergency Report
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                State the operational justification for rejecting {rejectModalIncident.incidentReference}. This will be permanently recorded in the audit trail.
              </p>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reason for Invalidation
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., False report / hoax call verified by local patrol."
                  className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRejectModalIncident(null)}
                  className="px-4 py-2 text-xs text-slate-300 bg-[#142B46] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectionReason.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Incident Details Drawer */}
      {inspectIncident && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-full bg-[#10233C] border-l border-[#1A365D] shadow-2xl p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#1A365D]">
              <div>
                <div className="text-xs font-mono text-[#268BFF] uppercase font-bold">
                  {inspectIncident.incidentReference}
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {inspectIncident.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectIncident(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#142B46] rounded-xl border border-[#1A365D]">
                <div className="text-slate-400">LIFE-FIRST Score</div>
                <div className="text-xl font-bold text-white font-mono">{inspectIncident.assessment.score}/100</div>
              </div>
              <div className="p-3 bg-[#142B46] rounded-xl border border-[#E63946]/30">
                <div className="text-slate-400">Assigned Priority</div>
                <div className="text-xl font-bold text-[#E63946] font-mono">{inspectIncident.finalPriority}</div>
              </div>
              <div className="p-3 bg-[#142B46] rounded-xl border border-[#1A365D]">
                <div className="text-slate-400">People Affected</div>
                <div className="text-xl font-bold text-amber-300 font-mono">{inspectIncident.peopleAffected}</div>
              </div>
              <div className="p-3 bg-[#142B46] rounded-xl border border-[#1A365D]">
                <div className="text-slate-400">Reported Injured</div>
                <div className="text-xl font-bold text-orange-400 font-mono">{inspectIncident.peopleInjured}</div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase text-[#268BFF]">Situational Description</div>
              <p className="text-xs text-slate-300 bg-[#071426] p-4 rounded-xl border border-[#1A365D] leading-relaxed">
                {inspectIncident.description}
              </p>
            </div>

            {/* Attached Photo if available */}
            {inspectIncident.photoUrl && (
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase text-[#268BFF]">Photographic Telemetry</div>
                <div className="h-48 rounded-xl overflow-hidden border border-[#1A365D]">
                  <img 
                    src={inspectIncident.photoUrl} 
                    alt="Scene evidence" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {/* Immutable Timeline & Audit Trail */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-[#268BFF]">
                Chronological Audit Trail ({inspectIncident.timeline.length} Events)
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1A365D]">
                {inspectIncident.timeline.map((audit) => (
                  <div key={audit.id} className="relative text-xs">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#268BFF] border-2 border-[#10233C]" />
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span className="font-bold text-slate-200">{audit.action}</span>
                      <span>{new Date(audit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[11px] text-[#268BFF] font-mono mt-0.5">
                      Actor: {audit.actor} ({audit.actorRole})
                    </div>
                    {audit.notes && (
                      <div className="mt-1 text-slate-300 bg-[#071426] p-2 rounded border border-[#1A365D]/60 text-[11px]">
                        {audit.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
