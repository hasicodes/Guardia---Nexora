import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Maximize2, 
  RotateCcw, 
  Filter, 
  MapPin, 
  Layers, 
  AlertTriangle, 
  Activity, 
  X, 
  ChevronRight, 
  Search,
  CheckCircle2,
  Clock,
  Shield
} from 'lucide-react';
import { Incident, CrisisCluster, EmergencyCategory, PriorityLevel, IncidentStatus } from '../types/index.ts';
import { INDIA_STATES, INDIA_NATIONAL_CENTER, IndianState } from '../data/indiaGeoData.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface IndiaMapProps {
  incidents: Incident[];
  clusters: CrisisCluster[];
  onSelectIncident: (incident: Incident) => void;
  language: Language;
}

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  P1: '#E63946',
  P2: '#F28C28',
  P3: '#E9B949',
  P4: '#2EAD72'
};

export const IndiaMap: React.FC<IndiaMapProps> = ({
  incidents,
  clusters,
  onSelectIncident,
  language
}) => {
  const t = TRANSLATIONS[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clustersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedState, setSelectedState] = useState<IndianState | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showClusterLayer, setShowClusterLayer] = useState<boolean>(true);
  const [activeIncidentPreview, setActiveIncidentPreview] = useState<Incident | null>(null);

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (selectedState && inc.state.toLowerCase() !== selectedState.name.toLowerCase()) return false;
    if (selectedDistrict !== 'all' && inc.district.toLowerCase() !== selectedDistrict.toLowerCase()) return false;
    if (selectedCategory !== 'all' && inc.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && inc.finalPriority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && inc.incidentStatus !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.title.toLowerCase().includes(q) ||
        inc.incidentReference.toLowerCase().includes(q) ||
        inc.locality.toLowerCase().includes(q) ||
        inc.district.toLowerCase().includes(q) ||
        inc.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate state stats
  const stateStats = selectedState ? {
    name: selectedState.name,
    total: incidents.filter(i => i.state.toLowerCase() === selectedState.name.toLowerCase()).length,
    criticalP1: incidents.filter(i => i.state.toLowerCase() === selectedState.name.toLowerCase() && i.finalPriority === 'P1').length,
    urgentP2: incidents.filter(i => i.state.toLowerCase() === selectedState.name.toLowerCase() && i.finalPriority === 'P2').length,
    pending: incidents.filter(i => i.state.toLowerCase() === selectedState.name.toLowerCase() && i.incidentStatus === 'reported').length,
    resolved: incidents.filter(i => i.state.toLowerCase() === selectedState.name.toLowerCase() && (i.incidentStatus === 'resolved' || i.incidentStatus === 'closed')).length,
    affected: incidents.filter(i => i.state.toLowerCase() === selectedState.name.toLowerCase()).reduce((sum, i) => sum + i.peopleAffected, 0),
    injured: incidents.filter(i => i.state.toLowerCase() === selectedState.name.toLowerCase()).reduce((sum, i) => sum + i.peopleInjured, 0)
  } : null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create map with India bounds
    const map = L.map(mapContainerRef.current, {
      center: [INDIA_NATIONAL_CENTER.lat, INDIA_NATIONAL_CENTER.lng],
      zoom: INDIA_NATIONAL_CENTER.zoom,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false
    });

    // Add zoom controls to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dark tile layer (CartoDB Dark Matter / OpenStreetMap)
   L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=cb1_5608_1_3354a44c755a3fba8071e43c', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    clustersLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and Clusters
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !clustersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    clustersLayerRef.current.clearLayers();

    // Render Crisis Pulse Clusters if enabled
    if (showClusterLayer) {
      clusters.forEach(cluster => {
        const clusterColor = PRIORITY_COLORS[cluster.primaryPriority] || '#268BFF';
        const circle = L.circle([cluster.centerLatitude, cluster.centerLongitude], {
          radius: cluster.radiusKm * 1000,
          color: clusterColor,
          fillColor: clusterColor,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 6'
        });

        circle.bindTooltip(`
          <div class="p-2 text-xs font-sans">
            <div class="font-bold text-amber-300">CRISIS PULSE CLUSTER</div>
            <div class="text-white">${cluster.name}</div>
            <div class="text-slate-300">${cluster.incidentIds.length} Linked Emergencies</div>
          </div>
        `, { sticky: true, className: 'leaflet-popup-dark' });

        cluster.incidentIds.forEach(id => {
          // highlight link
        });

        circle.addTo(clustersLayerRef.current!);
      });
    }

    // Render Incident Markers
    filteredIncidents.forEach(inc => {
      const color = PRIORITY_COLORS[inc.finalPriority] || '#268BFF';
      const isCritical = inc.finalPriority === 'P1';

      // Custom SVG Marker Icon
      const markerHtml = `
        <div class="relative cursor-pointer group">
          ${isCritical ? `<div class="absolute -inset-1.5 rounded-full bg-[${color}]/40 animate-ping"></div>` : ''}
          <div class="w-7 h-7 rounded-full bg-[#10233C] border-2 border-[${color}] shadow-lg flex items-center justify-center text-[10px] font-bold text-white font-mono">
            ${inc.finalPriority}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-emergency-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      marker.on('click', () => {
        setActiveIncidentPreview(inc);
      });

      marker.addTo(markersLayerRef.current!);
    });

  }, [filteredIncidents, clusters, showClusterLayer]);

  const handleStateSelect = (state: IndianState) => {
    setSelectedState(state);
    setSelectedDistrict('all');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([state.lat, state.lng], state.zoom, { duration: 1.2 });
    }
  };

  const handleResetNationalView = () => {
    setSelectedState(null);
    setSelectedDistrict('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSearchQuery('');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [INDIA_NATIONAL_CENTER.lat, INDIA_NATIONAL_CENTER.lng], 
        INDIA_NATIONAL_CENTER.zoom, 
        { duration: 1.2 }
      );
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] flex flex-col bg-[#071426] overflow-hidden">
      
      {/* Top Filter & Command Bar */}
      <div className="z-10 p-3 sm:p-4 bg-[#10233C]/90 backdrop-blur-md border-b border-[#1A365D] flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search state, district, or incident reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
          />
        </div>

        {/* State Select Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedState?.code || 'all'}
            onChange={(e) => {
              if (e.target.value === 'all') {
                handleResetNationalView();
              } else {
                const st = INDIA_STATES.find(s => s.code === e.target.value);
                if (st) handleStateSelect(st);
              }
            }}
            className="px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">🇮🇳 All India (National View)</option>
            {INDIA_STATES.map(st => (
              <option key={st.code} value={st.code}>{st.name}</option>
            ))}
          </select>

          {/* District Dropdown (when state selected) */}
          {selectedState && (
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
            >
              <option value="all">All {selectedState.name} Districts</option>
              {selectedState.districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1 - Life-Threatening</option>
            <option value="P2">P2 - Urgent</option>
            <option value="P3">P3 - Moderate</option>
            <option value="P4">P4 - Low Urgency</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-slate-200 focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Categories</option>
            <option value="fire">Fire Emergency</option>
            <option value="road_accident">Road Accident</option>
            <option value="medical">Medical Emergency</option>
            <option value="flood">Flood</option>
            <option value="building_collapse">Building Collapse</option>
            <option value="other">Other</option>
          </select>

          {/* Toggle Crisis Pulse Clusters */}
          <button
            onClick={() => setShowClusterLayer(!showClusterLayer)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              showClusterLayer ? 'bg-[#268BFF]/20 border-[#268BFF] text-[#268BFF]' : 'bg-[#071426] border-[#1A365D] text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Crisis Pulse</span>
          </button>

          {/* Reset Map */}
          <button
            onClick={handleResetNationalView}
            title="Reset to National View"
            className="p-1.5 text-slate-300 hover:text-white bg-[#071426] border border-[#1A365D] rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Main Map Viewport & Overlays */}
      <div className="relative flex-1 w-full h-full">
        
        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Map Legend */}
        <div className="absolute bottom-6 left-6 z-10 p-3 bg-[#071426]/90 backdrop-blur-md border border-[#1A365D] rounded-xl shadow-2xl text-xs space-y-2 pointer-events-auto">
          <div className="font-semibold text-slate-200 font-mono tracking-wider text-[11px] uppercase">
            LIFE-FIRST Priority Legend
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E63946] animate-pulse"></span>
              <span className="text-slate-300">P1 - Life-Threatening ({incidents.filter(i => i.finalPriority === 'P1').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F28C28]"></span>
              <span className="text-slate-300">P2 - Urgent ({incidents.filter(i => i.finalPriority === 'P2').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E9B949]"></span>
              <span className="text-slate-300">P3 - Moderate ({incidents.filter(i => i.finalPriority === 'P3').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2EAD72]"></span>
              <span className="text-slate-300">P4 - Lower Urgency ({incidents.filter(i => i.finalPriority === 'P4').length})</span>
            </div>
            {showClusterLayer && (
              <div className="pt-1 border-t border-[#1A365D] flex items-center gap-2 text-[11px] text-sky-400">
                <span className="w-3 h-3 rounded-full border border-dashed border-[#268BFF]"></span>
                <span>Crisis Pulse Cluster Zone</span>
              </div>
            )}
          </div>
        </div>

        {/* State Statistics Drawer (When a state is selected) */}
        {stateStats && (
          <div className="absolute top-6 left-6 z-10 w-80 p-4 bg-[#10233C]/95 backdrop-blur-md border border-[#1A365D] rounded-xl shadow-2xl space-y-3 pointer-events-auto animate-in fade-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A365D]">
              <div>
                <span className="text-[10px] font-mono text-[#268BFF] uppercase tracking-wider">State Intelligence</span>
                <h3 className="text-base font-bold text-white">{stateStats.name}</h3>
              </div>
              <button
                onClick={() => setSelectedState(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[#142B46] rounded-lg">
                <div className="text-slate-400">Total Emergencies</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums">{stateStats.total}</div>
              </div>
              <div className="p-2 bg-[#142B46] rounded-lg border border-[#E63946]/30">
                <div className="text-[#E63946]">Critical (P1)</div>
                <div className="text-lg font-bold text-[#E63946] font-mono tabular-nums">{stateStats.criticalP1}</div>
              </div>
              <div className="p-2 bg-[#142B46] rounded-lg">
                <div className="text-slate-400">People Affected</div>
                <div className="text-lg font-bold text-amber-300 font-mono tabular-nums">{stateStats.affected}</div>
              </div>
              <div className="p-2 bg-[#142B46] rounded-lg">
                <div className="text-slate-400">Injuries Reported</div>
                <div className="text-lg font-bold text-orange-400 font-mono tabular-nums">{stateStats.injured}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Showing active signals in {stateStats.name}. Click an incident marker on the map to inspect situational assessment.
            </div>
          </div>
        )}

        {/* Selected Incident Preview Drawer */}
        {activeIncidentPreview && (
          <div className="absolute top-6 right-6 z-10 w-96 max-h-[85vh] overflow-y-auto p-5 bg-[#10233C]/95 backdrop-blur-md border border-[#268BFF]/40 rounded-xl shadow-2xl space-y-4 pointer-events-auto animate-in fade-in slide-in-from-right duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1A365D]">
              <div>
                <span className="text-[10px] font-mono text-[#268BFF] uppercase tracking-wider">
                  {activeIncidentPreview.incidentReference}
                </span>
                <h3 className="text-base font-bold text-white leading-snug">
                  {activeIncidentPreview.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveIncidentPreview(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Priority & Status Header */}
            <div className="flex items-center justify-between gap-2 p-2.5 bg-[#142B46] rounded-lg text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[activeIncidentPreview.finalPriority] }}
                />
                <span className="font-bold text-white">
                  {activeIncidentPreview.finalPriority} · {activeIncidentPreview.assessment.score}/100
                </span>
              </div>
              <span className="text-slate-300 uppercase">
                {activeIncidentPreview.incidentStatus.replace('_', ' ')}
              </span>
            </div>

            {/* Situational Details */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#268BFF] shrink-0" />
                <span>{activeIncidentPreview.locality}, {activeIncidentPreview.district}, {activeIncidentPreview.state}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {activeIncidentPreview.peopleAffected} Affected · {activeIncidentPreview.peopleInjured} Injured ({activeIncidentPreview.injurySeverity.toUpperCase()})
                </span>
              </div>
              {activeIncidentPreview.peopleTrapped && (
                <div className="p-2 bg-[#E63946]/15 border border-[#E63946]/40 rounded text-[#E63946] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Immediate Danger: People reported trapped!</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#071426] p-3 rounded-lg border border-[#1A365D]">
              {activeIncidentPreview.description}
            </p>

            {/* Department Sync Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Assigned Emergency Services
              </div>
              <div className="flex flex-wrap gap-1.5">
                {activeIncidentPreview.notifications.map(notif => (
                  <span
                    key={notif.id}
                    className="px-2.5 py-1 text-[11px] font-medium bg-[#142B46] border border-[#1A365D] rounded text-slate-200"
                  >
                    {notif.department.toUpperCase()}: <span className="text-[#268BFF]">{notif.status.replace('_', ' ')}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action to open full triage assessment */}
            <button
              onClick={() => {
                onSelectIncident(activeIncidentPreview);
                setActiveIncidentPreview(null);
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Full LIFE-FIRST Triage & Audit Trail</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
