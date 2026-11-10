import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Flame, 
  HeartPulse, 
  Radio, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Navigation, 
  Sparkles, 
  Compass, 
  RefreshCw, 
  Activity,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { 
  ResponseTeam, 
  TeamAvailabilityStatus, 
  ResponseCategory, 
  Incident, 
  TeamRecommendation 
} from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface ResponseTeamManagerProps {
  incidents: Incident[];
  onTeamUpdated?: () => void;
  language: Language;
}

export const ResponseTeamManager: React.FC<ResponseTeamManagerProps> = ({
  incidents,
  onTeamUpdated,
  language
}) => {
  const [teams, setTeams] = useState<ResponseTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState<Incident | null>(null);
  const [recommendation, setRecommendation] = useState<TeamRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [assigningTeamId, setAssigningTeamId] = useState<string | null>(null);

  // New Team Form State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCategory, setNewTeamCategory] = useState<ResponseCategory>('fire_rescue');
  const [newTeamDept, setNewTeamDept] = useState('Fire and Rescue Department');
  const [newTeamLeader, setNewTeamLeader] = useState('');
  const [newTeamMembers, setNewTeamMembers] = useState(6);
  const [newTeamLocation, setNewTeamLocation] = useState('Central Fire Station, Egmore');
  const [newTeamLat, setNewTeamLat] = useState(13.0827);
  const [newTeamLng, setNewTeamLng] = useState(80.2707);
  const [newTeamEquipment, setNewTeamEquipment] = useState('Water Bowser, Hydraulic Cutter, Breathing Apparatus');

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/teams');
      const data = await res.json();
      if (data.teams) {
        setTeams(data.teams);
      }
    } catch (err) {
      console.error('Failed to load response teams', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleStatusChange = async (teamId: string, newStatus: TeamAvailabilityStatus) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actor: 'Operations Command' })
      });
      if (res.ok) {
        fetchTeams();
        if (onTeamUpdated) onTeamUpdated();
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSimulateGPSMove = async (team: ResponseTeam) => {
    // Nudge latitude & longitude by a small delta to simulate GPS beacon updates
    const latNudge = (Math.random() - 0.5) * 0.005;
    const lngNudge = (Math.random() - 0.5) * 0.005;
    const updatedLat = parseFloat((team.latitude + latNudge).toFixed(4));
    const updatedLng = parseFloat((team.longitude + lngNudge).toFixed(4));

    try {
      await fetch(`/api/teams/${team.id}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: updatedLat,
          longitude: updatedLng,
          location: `${team.location} (Telemetry Beacon)`
        })
      });
      fetchTeams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssign = async (incident: Incident) => {
    setSelectedIncidentForAssign(incident);
    setIsAssignModalOpen(true);
    setRecommendationLoading(true);
    try {
      const res = await fetch(`/api/incidents/${incident.id}/recommend-teams`);
      const data = await res.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecommendationLoading(false);
    }
  };

  const handleConfirmAssignment = async (teamId: string) => {
    if (!selectedIncidentForAssign) return;
    setAssigningTeamId(teamId);
    try {
      const res = await fetch(`/api/incidents/${selectedIncidentForAssign.id}/assign-team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          assignedBy: 'Duty Commander'
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsAssignModalOpen(false);
        fetchTeams();
        if (onTeamUpdated) onTeamUpdated();
      } else {
        alert(data.error || 'Failed to dispatch team');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigningTeamId(null);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamLeader.trim()) return;

    try {
      const equipArr = newTeamEquipment.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName.trim(),
          category: newTeamCategory,
          department: newTeamDept.trim(),
          leader: newTeamLeader.trim(),
          memberCount: Number(newTeamMembers) || 4,
          location: newTeamLocation.trim(),
          latitude: Number(newTeamLat),
          longitude: Number(newTeamLng),
          equipment: equipArr
        })
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setNewTeamName('');
        setNewTeamLeader('');
        fetchTeams();
        if (onTeamUpdated) onTeamUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered teams
  const filteredTeams = teams.filter(t => {
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesSearch;
  });

  const getStatusColor = (status: TeamAvailabilityStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'assigned': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'en_route': return 'bg-sky-500/20 text-sky-400 border-sky-500/40';
      case 'on_scene': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'returning': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      case 'unavailable': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getCategoryBadge = (category: ResponseCategory) => {
    switch (category) {
      case 'fire_rescue':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30"><Flame className="w-3 h-3" /> Fire & Rescue</span>;
      case 'medical_ambulance':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30"><HeartPulse className="w-3 h-3" /> Medical / EMS</span>;
      case 'police':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30"><ShieldCheck className="w-3 h-3" /> Police Command</span>;
      case 'disaster_response':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"><Layers className="w-3 h-3" /> Disaster Response</span>;
      case 'search_and_rescue':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30"><Compass className="w-3 h-3" /> Search & Rescue</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30"><Radio className="w-3 h-3" /> Emergency Services</span>;
    }
  };

  const availableCount = teams.filter(t => t.status === 'available').length;
  const activeCount = teams.filter(t => ['assigned', 'en_route', 'on_scene', 'in_progress'].includes(t.status)).length;
  const unassignedIncidents = incidents.filter(i => !i.assignedTeamId && i.incidentStatus !== 'resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <Truck className="w-4 h-4" />
            <span>Emergency Fleet & Responder Force</span>
            <span>·</span>
            <span>Intelligent Dispatch Hub</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Emergency Response Team Management
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Real-time command of Police, Fire, Ambulance, and Disaster Response fleets. Live GPS telemetry, capability matching, and automated nearest-team dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-xl shadow-lg shadow-[#268BFF]/20 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Team</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#10233C] rounded-2xl border border-[#1A365D]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#268BFF]" />
            <span>Total Registered Teams</span>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono tabular-nums mt-2">
            {teams.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across Fire, Police, EMS & SAR</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-emerald-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Ready for Instant Dispatch</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums mt-2">
            {availableCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Available status</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-sky-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-400" />
            <span>Active Deployments</span>
          </div>
          <div className="text-2xl font-extrabold text-sky-400 font-mono tabular-nums mt-2">
            {activeCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">En route, on scene, or in progress</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-orange-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>Unassigned Emergencies</span>
          </div>
          <div className="text-2xl font-extrabold text-orange-400 font-mono tabular-nums mt-2">
            {unassignedIncidents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Require immediate unit assignment</div>
        </div>
      </div>

      {/* Unassigned Emergencies Callout / Quick Dispatch Strip */}
      {unassignedIncidents.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-[#10233C] border border-orange-500/30 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-lg">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  High-Priority Emergencies Awaiting Response Team Assignment ({unassignedIncidents.length})
                </h4>
                <p className="text-xs text-slate-300">
                  Select an incident to calculate best-fit nearby team using Haversine distance, road speed factor, and capability matching.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {unassignedIncidents.slice(0, 3).map(inc => (
                <button
                  key={inc.id}
                  onClick={() => handleOpenAssign(inc)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#142B46] hover:bg-[#268BFF] border border-[#1A365D] hover:border-[#268BFF] rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assign {inc.incidentReference}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded">{inc.finalPriority}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 bg-[#10233C] border border-[#1A365D] rounded-2xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search teams by name, ID, leader, or base location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Categories</option>
            <option value="fire_rescue">Fire and Rescue</option>
            <option value="medical_ambulance">Medical / Ambulance</option>
            <option value="police">Police Command</option>
            <option value="disaster_response">Disaster Response</option>
            <option value="search_and_rescue">Search & Rescue</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="en_route">En Route</option>
            <option value="on_scene">On Scene</option>
            <option value="in_progress">In Progress</option>
            <option value="returning">Returning</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <button
            onClick={fetchTeams}
            className="p-2 text-slate-300 hover:text-white bg-[#071426] border border-[#1A365D] rounded-xl transition-colors"
            title="Refresh Fleet Telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className="p-5 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF]/50 rounded-2xl shadow-xl space-y-4 transition-all flex flex-col justify-between"
          >
            {/* Card Header */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#268BFF]">
                    {team.id}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {team.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {team.department}
                  </div>
                </div>

                <div className="shrink-0">
                  {getCategoryBadge(team.category)}
                </div>
              </div>

              {/* Status and Location */}
              <div className="mt-3 pt-3 border-t border-[#1A365D]/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status:</span>
                  <select
                    value={team.status}
                    onChange={(e) => handleStatusChange(team.id, e.target.value as TeamAvailabilityStatus)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border focus:outline-none uppercase ${getStatusColor(team.status)}`}
                  >
                    <option value="available" className="bg-[#10233C] text-emerald-400">Available</option>
                    <option value="assigned" className="bg-[#10233C] text-blue-400">Assigned</option>
                    <option value="en_route" className="bg-[#10233C] text-sky-400">En Route</option>
                    <option value="on_scene" className="bg-[#10233C] text-amber-400">On Scene</option>
                    <option value="in_progress" className="bg-[#10233C] text-purple-400">In Progress</option>
                    <option value="returning" className="bg-[#10233C] text-indigo-400">Returning</option>
                    <option value="unavailable" className="bg-[#10233C] text-rose-400">Unavailable</option>
                  </select>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-[#268BFF] shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{team.location}</span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Coords: {team.latitude}, {team.longitude}</span>
                  <button
                    onClick={() => handleSimulateGPSMove(team)}
                    className="text-[#268BFF] hover:underline flex items-center gap-1 text-[10px]"
                    title="Simulate GPS movement beacon"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Nudge GPS</span>
                  </button>
                </div>
              </div>

              {/* Personnel & Capabilities */}
              <div className="mt-3 p-3 bg-[#071426] rounded-xl border border-[#1A365D]/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Leader:</span>
                  <span className="font-semibold text-white">{team.leader}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Personnel:</span>
                  <span className="font-mono text-slate-200">{team.memberCount} Responders</span>
                </div>
                {team.assignedIncidentId && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#1A365D]">
                    <span className="text-slate-400">Active Incident:</span>
                    <span className="font-mono font-bold text-amber-400">{team.assignedIncidentId}</span>
                  </div>
                )}
              </div>

              {/* Equipment Tags */}
              <div className="mt-3">
                <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Equipment Manifest</div>
                <div className="flex flex-wrap gap-1">
                  {team.equipment.slice(0, 3).map((eq, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#142B46] text-slate-300 rounded border border-[#1A365D]">
                      {eq}
                    </span>
                  ))}
                  {team.equipment.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#142B46] text-slate-400 rounded">
                      +{team.equipment.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#1A365D] flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                {team.assignmentHistoryCount} Missions
              </span>

              {team.status === 'available' ? (
                <button
                  onClick={() => {
                    if (unassignedIncidents.length > 0) {
                      handleOpenAssign(unassignedIncidents[0]);
                    } else if (incidents.length > 0) {
                      handleOpenAssign(incidents[0]);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-lg transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Assign to Incident</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStatusChange(team.id, 'available')}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 rounded-lg transition-colors"
                >
                  Release to Available
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Smart Team Assignment Modal */}
      {isAssignModalOpen && selectedIncidentForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-6">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#1A365D]">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#268BFF]">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Intelligent Location-Based Recommendation Engine</span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Dispatch Unit to {selectedIncidentForAssign.incidentReference}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedIncidentForAssign.title} — {selectedIncidentForAssign.locality}, {selectedIncidentForAssign.district}
                </p>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {recommendationLoading ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#268BFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-300 font-mono">
                  Calculating Haversine distances, road travel time, and equipment capability suitability...
                </p>
              </div>
            ) : recommendation ? (
              <div className="space-y-6">
                
                {/* Recommended Team Highlight */}
                <div className="p-5 bg-gradient-to-r from-blue-900/30 via-[#10233C] to-emerald-900/20 border-2 border-[#268BFF] rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-[#268BFF] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider font-mono">
                        BEST-FIT RECOMMENDATION
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-bold">
                        Score: {recommendation.suitabilityScore}/100
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-300 flex items-center gap-3">
                      <span>Distance: <strong className="text-white">{recommendation.distanceKm} km</strong></span>
                      <span>ETA: <strong className="text-white">{recommendation.etaMinutes} mins</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-bold text-white flex items-center gap-2">
                        <span>{recommendation.team.name}</span>
                        <span className="text-xs font-mono text-slate-400">({recommendation.team.id})</span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        Leader: {recommendation.team.leader} · {recommendation.team.memberCount} members · Base: {recommendation.team.location}
                      </div>
                      <div className="text-xs text-emerald-300/90 mt-2 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
                        {recommendation.suitabilityReason}
                      </div>
                    </div>

                    <button
                      onClick={() => handleConfirmAssignment(recommendation.team.id)}
                      disabled={assigningTeamId === recommendation.team.id}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>{assigningTeamId === recommendation.team.id ? 'Dispatching...' : 'Dispatch Recommended Unit'}</span>
                    </button>
                  </div>

                  {/* Route Waypoints Visualization */}
                  <div className="pt-3 border-t border-[#1A365D] space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Simulated Route Waypoints ({recommendation.routeCoordinates.length} nodes)</span>
                      <span>Speed Factor: {recommendation.team.speedKmh} km/h</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto py-1 text-[11px] font-mono text-slate-300">
                      <span className="px-2 py-1 bg-[#071426] rounded border border-[#1A365D]">Team Base [{recommendation.routeCoordinates[0]?.join(', ')}]</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#268BFF] shrink-0" />
                      <span className="px-2 py-1 bg-[#071426] rounded border border-[#1A365D]">Waypoints En Route</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#268BFF] shrink-0" />
                      <span className="px-2 py-1 bg-[#071426] rounded border border-red-500/40 text-red-300">Target Scene [{recommendation.routeCoordinates[recommendation.routeCoordinates.length - 1]?.join(', ')}]</span>
                    </div>
                  </div>
                </div>

                {/* Alternative Teams */}
                {recommendation.alternativeTeams && recommendation.alternativeTeams.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                      Alternative Ready Teams
                    </h4>
                    <div className="space-y-2">
                      {recommendation.alternativeTeams.map(alt => (
                        <div
                          key={alt.team.id}
                          className="p-3 bg-[#071426] border border-[#1A365D] hover:border-slate-500 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{alt.team.name}</span>
                              <span className="text-[11px] font-mono text-slate-400">({alt.team.id})</span>
                              {getCategoryBadge(alt.team.category)}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {alt.distanceKm} km away · ETA ~{alt.etaMinutes} mins · {alt.suitabilityReason}
                            </div>
                          </div>

                          <button
                            onClick={() => handleConfirmAssignment(alt.team.id)}
                            disabled={assigningTeamId === alt.team.id}
                            className="px-3 py-1.5 bg-[#142B46] hover:bg-[#268BFF] text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
                          >
                            Assign Alternative
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No suitable recommendation could be calculated. Check team availability status.
              </div>
            )}

          </div>
        </div>
      )}

      {/* Register New Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1A365D]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#268BFF]" />
                <span>Register Emergency Response Unit</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TNFRS Bravo Heavy Rescue Unit"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Category</label>
                  <select
                    value={newTeamCategory}
                    onChange={(e) => setNewTeamCategory(e.target.value as ResponseCategory)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  >
                    <option value="fire_rescue">Fire and Rescue</option>
                    <option value="medical_ambulance">Medical / Ambulance</option>
                    <option value="police">Police Command</option>
                    <option value="disaster_response">Disaster Response</option>
                    <option value="search_and_rescue">Search & Rescue</option>
                    <option value="other">Other Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Department</label>
                  <input
                    type="text"
                    value={newTeamDept}
                    onChange={(e) => setNewTeamDept(e.target.value)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Team Leader *</label>
                  <input
                    type="text"
                    required
                    placeholder="Commander / Officer name"
                    value={newTeamLeader}
                    onChange={(e) => setNewTeamLeader(e.target.value)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Number of Members</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newTeamMembers}
                    onChange={(e) => setNewTeamMembers(parseInt(e.target.value, 10) || 4)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Base Location Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mylapore Fire Station, Chennai"
                  value={newTeamLocation}
                  onChange={(e) => setNewTeamLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Base Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newTeamLat}
                    onChange={(e) => setNewTeamLat(parseFloat(e.target.value) || 13.0827)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Base Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newTeamLng}
                    onChange={(e) => setNewTeamLng(parseFloat(e.target.value) || 80.2707)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Equipment (Comma separated)</label>
                <input
                  type="text"
                  value={newTeamEquipment}
                  onChange={(e) => setNewTeamEquipment(e.target.value)}
                  placeholder="Water tender, breathing gear, cutting torch..."
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="pt-3 border-t border-[#1A365D] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#142B46] text-slate-300 rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#268BFF] text-white font-bold rounded-xl hover:bg-[#1D7AE8]"
                >
                  Register Team
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
