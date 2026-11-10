import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Activity, 
  Users, 
  HeartPulse, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Download, 
  Printer, 
  MapPin,
  Clock,
  Radio,
  Search,
  Truck,
  HeartHandshake
} from 'lucide-react';
import { Incident, PriorityLevel, EmergencyCategory } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface HumanImpactRadarProps {
  incidents: Incident[];
  language: Language;
}

export const HumanImpactRadar: React.FC<HumanImpactRadarProps> = ({
  incidents,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const [platformOverview, setPlatformOverview] = useState({
    activeSOS: 0,
    activeMissingPersons: 0,
    familyCases: 0,
    availableTeams: 0,
    busyTeams: 0,
    ackRate: 0
  });

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setPlatformOverview({
            activeSOS: data.activeSOS || 0,
            activeMissingPersons: data.activeMissingPersons || 0,
            familyCases: data.familyCases || 0,
            availableTeams: data.availableTeams || 0,
            busyTeams: data.busyTeams || 0,
            ackRate: data.ackRate || 0
          });
        }
      })
      .catch(err => console.error(err));
  }, [incidents]);

  const filtered = incidents.filter(i => {
    const matchesState = selectedStateFilter === 'all' || i.state.toLowerCase() === selectedStateFilter.toLowerCase();
    const matchesPriority = selectedPriorityFilter === 'all' || i.finalPriority === selectedPriorityFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || i.category === selectedCategoryFilter;
    return matchesState && matchesPriority && matchesCategory;
  });

  // Aggregated Database Metrics
  const totalAffected = filtered.reduce((acc, i) => acc + (i.peopleAffected || 0), 0);
  const totalInjured = filtered.reduce((acc, i) => acc + (i.peopleInjured || 0), 0);
  const totalTrapped = filtered.filter(i => i.peopleTrapped).reduce((acc, i) => acc + (i.peopleAffected || 0), 0);
  const lifeThreatCount = filtered.filter(i => i.immediateDanger || i.finalPriority === 'P1').length;
  const pendingAssistance = filtered.filter(i => i.incidentStatus === 'reported' || i.incidentStatus === 'pending').length;

  // Category Breakdown
  const categoryCounts: Record<string, number> = {
    fire: 0,
    road_accident: 0,
    medical: 0,
    flood: 0,
    building_collapse: 0,
    other: 0
  };
  filtered.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // Priority Breakdown
  const priorityCounts: Record<PriorityLevel, number> = {
    P1: filtered.filter(i => i.finalPriority === 'P1').length,
    P2: filtered.filter(i => i.finalPriority === 'P2').length,
    P3: filtered.filter(i => i.finalPriority === 'P3').length,
    P4: filtered.filter(i => i.finalPriority === 'P4').length
  };

  // State Breakdown
  const stateCounts: Record<string, number> = {};
  filtered.forEach(i => {
    stateCounts[i.state] = (stateCounts[i.state] || 0) + 1;
  });

  // Unique states
  const allStates = Array.from(new Set(incidents.map(i => i.state)));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <span>Human Impact Intelligence Radar</span>
            <span aria-hidden="true">·</span>
            <span>National Telemetry Analytics</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Casualty & Situational Analytics
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Real-time statistical synthesis of reported casualties, triage urgency distribution, and emergency agency operational performance across India.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedStateFilter}
            onChange={(e) => setSelectedStateFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#10233C] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All States</option>
            {allStates.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#10233C] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1 - Life-Threatening</option>
            <option value="P2">P2 - Urgent</option>
            <option value="P3">P3 - Moderate</option>
            <option value="P4">P4 - Lower</option>
          </select>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#10233C] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Hazards</option>
            <option value="fire">Fire</option>
            <option value="road_accident">Road Accident</option>
            <option value="medical">Medical</option>
            <option value="flood">Flood</option>
            <option value="building_collapse">Building Collapse</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-[#10233C] hover:bg-[#142B46] border border-[#1A365D] rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-[#268BFF]" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Casualty Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="p-4 bg-[#10233C] rounded-2xl border border-[#1A365D]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#268BFF]" />
            <span>Reported Affected</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums mt-2">
            {totalAffected}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Citizen & responder reports</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-orange-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-orange-400" />
            <span>Casualties Injured</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-mono tabular-nums mt-2">
            {totalInjured}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">EMS / Trauma care routed</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-[#E63946]/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#E63946]" />
            <span>Casualties Trapped</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#E63946] font-mono tabular-nums mt-2">
            {totalTrapped}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Immediate extrication target</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-[#1A365D]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Life-Threat Incidents</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono tabular-nums mt-2">
            {lifeThreatCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">P1 critical status</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-[#1A365D]">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Awaiting Response</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums mt-2">
            {pendingAssistance}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In dispatch pipeline</div>
        </div>

      </div>

      {/* Secondary Operational Ecosystem KPIs (SOS, Finder, Family Link, Units) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 bg-[#10233C] rounded-2xl border border-red-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#E63946] animate-pulse" />
            <span>Active SOS Signals</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#E63946] font-mono tabular-nums mt-2">
            {platformOverview.activeSOS}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Real-time citizen SOS broadcasts</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-purple-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-purple-400" />
            <span>Active Missing Persons</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono tabular-nums mt-2">
            {platformOverview.activeMissingPersons}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Finder bureau search targets</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-emerald-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Family Circles Tracked</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums mt-2">
            {platformOverview.familyCases}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Family Link safety networks</div>
        </div>

        <div className="p-4 bg-[#10233C] rounded-2xl border border-sky-500/30">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>Ready Response Units</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono tabular-nums mt-2">
            {platformOverview.availableTeams}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Police, Fire, EMS available</div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: LIFE-FIRST Priority Distribution */}
        <div className="p-6 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A365D]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#268BFF]" />
              <span>LIFE-FIRST Priority Distribution</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: {filtered.length} Incidents</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { level: 'P1', label: 'CRITICAL — P1 (Immediate Life Threat)', count: priorityCounts.P1, color: '#E63946' },
              { level: 'P2', label: 'HIGH — P2 (Urgent Response)', count: priorityCounts.P2, color: '#F28C28' },
              { level: 'P3', label: 'MEDIUM — P3 (Assistance Needed)', count: priorityCounts.P3, color: '#E9B949' },
              { level: 'P4', label: 'LOW — P4 (Lower Urgency)', count: priorityCounts.P4, color: '#2EAD72' }
            ].map(item => {
              const pct = filtered.length > 0 ? Math.round((item.count / filtered.length) * 100) : 0;

              return (
                <div key={item.level} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.label}</span>
                    <span className="font-mono text-slate-300 font-bold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#071426] rounded-full overflow-hidden border border-[#1A365D]/60">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="p-6 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A365D]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#268BFF]" />
              <span>Incidents by Emergency Category</span>
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { id: 'fire', label: 'Fire Emergency', count: categoryCounts.fire, color: '#F28C28' },
              { id: 'road_accident', label: 'Road Accident', count: categoryCounts.road_accident, color: '#E63946' },
              { id: 'medical', label: 'Medical Emergency', count: categoryCounts.medical, color: '#268BFF' },
              { id: 'flood', label: 'Flood / Inundation', count: categoryCounts.flood, color: '#38BDF8' },
              { id: 'building_collapse', label: 'Building Collapse', count: categoryCounts.building_collapse, color: '#A855F7' },
              { id: 'other', label: 'Other Hazards', count: categoryCounts.other, color: '#94A3B8' }
            ].map(item => {
              const pct = filtered.length > 0 ? Math.round((item.count / filtered.length) * 100) : 0;

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{item.label}</span>
                    <span className="font-mono text-slate-300 font-bold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#071426] rounded-full overflow-hidden border border-[#1A365D]/60">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Geographic Distribution by State */}
        <div className="p-6 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A365D]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#268BFF]" />
              <span>State-Wise Incident Distribution</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Live Telemetry Mapping</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {Object.entries(stateCounts).map(([st, count]) => (
              <div key={st} className="p-3 bg-[#071426] rounded-xl border border-[#1A365D] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{st}</div>
                  <div className="text-[11px] text-slate-400">Active State Feed</div>
                </div>
                <div className="text-lg font-bold text-[#268BFF] font-mono tabular-nums">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
