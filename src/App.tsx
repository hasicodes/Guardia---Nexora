import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Users, 
  HeartPulse, 
  Flame, 
  Shield, 
  Layers, 
  Radio, 
  CheckCircle2, 
  Search, 
  FileText, 
  Copy, 
  BarChart3, 
  RefreshCw,
  Clock,
  ArrowRight,
  Truck,
  HeartHandshake,
  Eye,
  Sparkles
} from 'lucide-react';
import { 
  Incident, 
  User, 
  EmergencyResource, 
  CrisisCluster, 
  DuplicateSuggestion, 
  PlatformNotification, 
  DepartmentType, 
  PriorityLevel, 
  IncidentStatus 
} from './types/index.ts';
import { Language, TRANSLATIONS } from './translations/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { IndiaMap } from './components/IndiaMap.tsx';
import { LifeFirstQueue } from './components/LifeFirstQueue.tsx';
import { IncidentManagementTable } from './components/IncidentManagementTable.tsx';
import { RescueBridgeCoordination } from './components/RescueBridgeCoordination.tsx';
import { DepartmentPortal } from './components/DepartmentPortal.tsx';
import { CrisisPulseViewer } from './components/CrisisPulseViewer.tsx';
import { ResourceManagement } from './components/ResourceManagement.tsx';
import { HumanImpactRadar } from './components/HumanImpactRadar.tsx';
import { EmergencyReportModal } from './components/EmergencyReportModal.tsx';
import { CitizenTrackerModal } from './components/CitizenTrackerModal.tsx';
import { DuplicateDetectionModal } from './components/DuplicateDetectionModal.tsx';
import { NotificationDrawer } from './components/NotificationDrawer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { DemoBanner } from './components/DemoBanner.tsx';
import { Footer } from './components/Footer.tsx';
import { ResponseTeamManager } from './components/ResponseTeamManager.tsx';
import { SosNowModal } from './components/SosNowModal.tsx';
import { FamilyLinkModule } from './components/FamilyLinkModule.tsx';
import { FinderMissingPersons } from './components/FinderMissingPersons.tsx';
import { RealityCheckDashboard } from './components/RealityCheckDashboard.tsx';

export default function App() {
  // Navigation & User State
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'USR-ADMIN-1',
    name: 'Aditya Vardhan',
    email: 'admin@guardia.gov.in',
    role: 'admin',
    badgeNumber: 'GUA-DIR-001'
  });

  // Settings
  const [language, setLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  // Data Store
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [clusters, setClusters] = useState<CrisisCluster[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateSuggestion[]>([]);
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stats computed from DB
  const [overviewStats, setOverviewStats] = useState({
    totalIncidents: 0,
    criticalP1: 0,
    totalAffected: 0,
    totalInjured: 0,
    availableResources: 0,
    ackRate: 0
  });

  // Fetch all live database records
  const fetchAllData = useCallback(async () => {
    try {
      const [incRes, resRes, clsRes, dupRes, notifRes, statsRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/resources'),
        fetch('/api/clusters'),
        fetch('/api/duplicates'),
        fetch('/api/notifications'),
        fetch('/api/analytics/overview')
      ]);

      const [incData, resData, clsData, dupData, notifData, statsData] = await Promise.all([
        incRes.json(),
        resRes.json(),
        clsRes.json(),
        dupRes.json(),
        notifRes.json(),
        statsRes.json()
      ]);

      if (incData.incidents) setIncidents(incData.incidents);
      if (resData.resources) setResources(resData.resources);
      if (clsData.clusters) setClusters(clsData.clusters);
      if (dupData.duplicates) setDuplicates(dupData.duplicates);
      if (notifData.notifications) setNotifications(notifData.notifications);
      if (statsData) {
        setOverviewStats({
          totalIncidents: statsData.totalIncidents || 0,
          criticalP1: statsData.criticalP1 || 0,
          totalAffected: statsData.totalAffected || 0,
          totalInjured: statsData.totalInjured || 0,
          availableResources: statsData.availableResources || 0,
          ackRate: statsData.ackRate || 0
        });
      }
    } catch (err) {
      console.error('Error fetching GUARDIA data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // 10s live sync
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Dark mode class sync on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Actions
  const handleSelectIncident = (incident: Incident) => {
    setCurrentTab('lifeFirst');
  };

  const handleOverridePriority = async (incidentId: string, newPriority: PriorityLevel, reason: string) => {
    await fetch(`/api/incidents/${incidentId}/update-priority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: newPriority, reason, actor: currentUser.name })
    });
    fetchAllData();
  };

  const handleDynamicReassess = async (incidentId: string, newInfo: Partial<Incident>) => {
    await fetch(`/api/incidents/${incidentId}/reassess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newInfo, actor: `${currentUser.name} (Reassessment Signal)` })
    });
    fetchAllData();
  };

  const handleVerifyIncident = async (id: string, verified: boolean, reason?: string) => {
    await fetch(`/api/incidents/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified, reason, actor: currentUser.name })
    });
    fetchAllData();
  };

  const handleUpdateStatus = async (id: string, status: IncidentStatus) => {
    await fetch(`/api/incidents/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, actor: currentUser.name })
    });
    fetchAllData();
  };

  const handleDeleteIncident = async (id: string) => {
    await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleAcknowledgeNotification = async (notifId: string, responderName: string, notes?: string) => {
    await fetch(`/api/departments/notifications/${notifId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responderName, notes })
    });
    fetchAllData();
  };

  const handleUpdateDepartmentStatus = async (notifId: string, status: 'response_initiated' | 'completed', responderName: string, notes?: string) => {
    await fetch(`/api/departments/notifications/${notifId}/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, responderName, notes })
    });
    fetchAllData();
  };

  const handleAssignResource = async (resourceId: string, incidentId: string) => {
    await fetch(`/api/resources/${resourceId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId })
    });
    fetchAllData();
  };

  const handleReleaseResource = async (resourceId: string) => {
    await fetch(`/api/resources/${resourceId}/release`, {
      method: 'POST'
    });
    fetchAllData();
  };

  const handleVerifyCluster = async (clusterId: string, verified: boolean) => {
    await fetch(`/api/clusters/${clusterId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified })
    });
    fetchAllData();
  };

  const handleResolveDuplicate = async (id: string, action: 'linked' | 'confirmed_duplicate' | 'dismissed') => {
    await fetch(`/api/duplicates/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    fetchAllData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    fetchAllData();
  };

  const handleMarkAllNotificationsRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    fetchAllData();
  };

  const handleResetDemoData = async () => {
    await fetch('/api/demo/reset', { method: 'POST' });
    fetchAllData();
  };

  const handleSelectPersona = (role: 'citizen' | 'admin' | 'department', dept?: DepartmentType) => {
    if (role === 'admin') {
      setCurrentUser({
        id: 'USR-ADMIN-1',
        name: 'Aditya Vardhan',
        email: 'admin@guardia.gov.in',
        role: 'admin',
        badgeNumber: 'GUA-DIR-001'
      });
    } else if (role === 'citizen') {
      setCurrentUser({
        id: 'USR-CITIZEN-1',
        name: 'Kavitha Ramesh',
        email: 'citizen@example.com',
        role: 'citizen'
      });
    } else {
      const depts: Record<DepartmentType, { name: string; email: string; badge: string }> = {
        police: { name: 'Inspector R. Selvakumar', email: 'police@guardia.gov.in', badge: 'TN-POL-4412' },
        fire: { name: 'Chief Officer M. Banerjee', email: 'fire@guardia.gov.in', badge: 'FRS-HQ-902' },
        ambulance: { name: 'Dr. Priya Nambiar (EMS 108)', email: 'medical@guardia.gov.in', badge: 'EMS-DOC-108' },
        disaster: { name: 'Commander K. Rathore (NDRF)', email: 'ndrf@guardia.gov.in', badge: 'NDRF-BN-04' },
        search_and_rescue: { name: 'Capt. S. Alagappan (SAR)', email: 'sar@guardia.gov.in', badge: 'SAR-COAST-11' }
      };
      const d = dept || 'police';
      setCurrentUser({
        id: `USR-${d.toUpperCase()}-1`,
        name: depts[d].name,
        email: depts[d].email,
        role: 'department',
        department: d,
        badgeNumber: depts[d].badge
      });
      setCurrentTab('departmentPortal');
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#071426] text-slate-100 font-sans selection:bg-[#268BFF]/30 selection:text-white transition-colors">
      
      {/* Demonstration Banner */}
      <DemoBanner
        currentUser={currentUser}
        onSelectPersona={handleSelectPersona}
        onResetDemoData={handleResetDemoData}
        language={language}
      />

      {/* Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenTrackerModal={() => setIsTrackerModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'ta' : 'en')}
        onSelectPersona={handleSelectPersona}
      />

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        {currentTab === 'overview' && (
          <div className="space-y-10 pb-12">
            
            {/* Hero Section */}
            <HeroSection
              language={language}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onNavigateToMap={() => setCurrentTab('map')}
              onOpenTrackerModal={() => setIsTrackerModalOpen(true)}
              stats={overviewStats}
            />

            {/* Quick Access Innovations Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: LIFE-FIRST Engine */}
                <div 
                  onClick={() => setCurrentTab('lifeFirst')}
                  className="p-6 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF] rounded-2xl shadow-xl space-y-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#142B46] rounded-xl border border-[#1A365D] group-hover:border-[#268BFF]/60 transition-colors">
                      <AlertTriangle className="w-5 h-5 text-[#E63946]" />
                    </div>
                    <span className="text-[11px] font-mono text-[#268BFF] font-bold">8 CRITERIA</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#268BFF] transition-colors">
                    LIFE-FIRST Prioritisation
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Evaluates immediate threat to human life, trapped casualties, and trauma severity. Dynamically re-evaluates as new signals arrive.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#268BFF] flex items-center gap-1">
                    <span>Inspect Priority Queue ({incidents.filter(i => i.finalPriority === 'P1').length} P1 Active)</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 2: CRISIS PULSE */}
                <div 
                  onClick={() => setCurrentTab('crisisPulse')}
                  className="p-6 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF] rounded-2xl shadow-xl space-y-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#142B46] rounded-xl border border-[#1A365D] group-hover:border-[#268BFF]/60 transition-colors">
                      <Layers className="w-5 h-5 text-[#268BFF]" />
                    </div>
                    <span className="text-[11px] font-mono text-sky-400 font-bold">GEOSPATIAL CLUSTERS</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#268BFF] transition-colors">
                    CRISIS PULSE Intelligence
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Automated spatial proximity and multi-hazard correlation engine detecting compounding regional disasters in real-time.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#268BFF] flex items-center gap-1">
                    <span>View Detected Clusters ({clusters.length} Active)</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 3: RESCUE BRIDGE */}
                <div 
                  onClick={() => setCurrentTab('rescueBridge')}
                  className="p-6 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF] rounded-2xl shadow-xl space-y-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#142B46] rounded-xl border border-[#1A365D] group-hover:border-[#268BFF]/60 transition-colors">
                      <Radio className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">MULTI-AGENCY SYNC</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#268BFF] transition-colors">
                    RESCUE BRIDGE Protocol
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Unified dispatch lifecycle connecting Police, Fire & Rescue, and Ambulance EMS with verifiable timestamp acknowledgements.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#268BFF] flex items-center gap-1">
                    <span>Coordinate Departments ({overviewStats.ackRate}% Ack Rate)</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 4: Response Team Fleet & Location-Based Assignment */}
                <div 
                  onClick={() => setCurrentTab('teams')}
                  className="p-6 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF] rounded-2xl shadow-xl space-y-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#142B46] rounded-xl border border-[#1A365D] group-hover:border-[#268BFF]/60 transition-colors">
                      <Truck className="w-5 h-5 text-[#268BFF]" />
                    </div>
                    <span className="text-[11px] font-mono text-[#268BFF] font-bold">SMART ASSIGNMENT</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#268BFF] transition-colors">
                    Response Teams Fleet
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Haversine proximity and capability matching engine. Recommends best-fit Police, Fire & EMS units with route waypoints and ETA.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#268BFF] flex items-center gap-1">
                    <span>Manage Active Fleet & Dispatches</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 5: Family Link */}
                <div 
                  onClick={() => setCurrentTab('familyLink')}
                  className="p-6 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF] rounded-2xl shadow-xl space-y-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#142B46] rounded-xl border border-[#1A365D] group-hover:border-[#268BFF]/60 transition-colors">
                      <HeartHandshake className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">REUNIFICATION</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#268BFF] transition-colors">
                    Family Link & Shelters
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Private invite codes, instant safety check-ins (Safe, Evacuating, Sheltered), and official relief shelter directory.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#268BFF] flex items-center gap-1">
                    <span>Access Family Circles</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Card 6: Finder & Reality Check */}
                <div 
                  onClick={() => setCurrentTab('finder')}
                  className="p-6 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF] rounded-2xl shadow-xl space-y-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#142B46] rounded-xl border border-[#1A365D] group-hover:border-[#268BFF]/60 transition-colors">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-[11px] font-mono text-purple-400 font-bold">AI FORENSICS</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#268BFF] transition-colors">
                    FINDER & Reality Check
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Missing person registry, UNVERIFIED sighting alerts with AI facial similarity, and cryptographic SHA-256 image verification.
                  </p>
                  <div className="pt-2 text-xs font-semibold text-[#268BFF] flex items-center gap-1">
                    <span>Track Missing & Verify Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

              {/* Duplicate Detection Alert Widget */}
              {duplicates.filter(d => d.status === 'pending').length > 0 && (
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Copy className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Duplicate Reports Detected ({duplicates.filter(d => d.status === 'pending').length} Candidates)
                      </div>
                      <div className="text-[11px] text-slate-300">
                        High semantic and geographic overlap flagged. Review duplicate suggestions to streamline dispatch.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDuplicateModalOpen(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    Resolve Duplicates
                  </button>
                </div>
              )}

              {/* Priority Queue Sneak Peek */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono uppercase text-[#268BFF]">Active National Triage</span>
                    <h3 className="text-lg font-bold text-white">Top Human Impact Emergencies</h3>
                  </div>
                  <button
                    onClick={() => setCurrentTab('lifeFirst')}
                    className="text-xs font-semibold text-[#268BFF] hover:underline flex items-center gap-1"
                  >
                    <span>View All {incidents.length} Records</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incidents.slice(0, 3).map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => setCurrentTab('lifeFirst')}
                      className="p-4 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF]/60 rounded-xl space-y-2.5 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-[#268BFF]">{inc.incidentReference}</span>
                        <span className="font-mono font-bold text-[#E63946] bg-[#E63946]/10 px-2 py-0.5 rounded">
                          {inc.finalPriority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{inc.title}</h4>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{inc.locality}, {inc.district}</span>
                      </div>
                      <div className="pt-2 border-t border-[#1A365D] flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Score: {inc.assessment.score}/100</span>
                        <span>{inc.peopleAffected} Affected</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {currentTab === 'map' && (
          <IndiaMap
            incidents={incidents}
            clusters={clusters}
            onSelectIncident={handleSelectIncident}
            language={language}
          />
        )}

        {currentTab === 'lifeFirst' && (
          <LifeFirstQueue
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onOverridePriority={handleOverridePriority}
            onDynamicReassess={handleDynamicReassess}
            language={language}
          />
        )}

        {currentTab === 'incidents' && (
          <IncidentManagementTable
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onVerifyIncident={handleVerifyIncident}
            onUpdateStatus={handleUpdateStatus}
            onDeleteIncident={handleDeleteIncident}
            language={language}
          />
        )}

        {currentTab === 'rescueBridge' && (
          <RescueBridgeCoordination
            incidents={incidents}
            onAcknowledgeNotification={handleAcknowledgeNotification}
            onUpdateDepartmentStatus={handleUpdateDepartmentStatus}
            onSwitchToDepartmentPortal={(dept) => {
              handleSelectPersona('department', dept);
              setCurrentTab('departmentPortal');
            }}
            language={language}
          />
        )}

        {currentTab === 'departmentPortal' && (
          <DepartmentPortal
            department={currentUser.department || 'police'}
            currentUser={currentUser}
            incidents={incidents}
            onAcknowledgeNotification={handleAcknowledgeNotification}
            onUpdateStatus={handleUpdateDepartmentStatus}
            language={language}
          />
        )}

        {currentTab === 'crisisPulse' && (
          <CrisisPulseViewer
            clusters={clusters}
            incidents={incidents}
            onVerifyCluster={handleVerifyCluster}
            onSelectIncident={handleSelectIncident}
            language={language}
          />
        )}

        {currentTab === 'resources' && (
          <ResourceManagement
            resources={resources}
            incidents={incidents}
            onAssignResource={handleAssignResource}
            onReleaseResource={handleReleaseResource}
            language={language}
          />
        )}

        {currentTab === 'teams' && (
          <ResponseTeamManager
            incidents={incidents}
            onTeamUpdated={fetchAllData}
            language={language}
          />
        )}

        {currentTab === 'familyLink' && (
          <FamilyLinkModule
            language={language}
          />
        )}

        {currentTab === 'finder' && (
          <FinderMissingPersons
            language={language}
          />
        )}

        {currentTab === 'realityCheck' && (
          <RealityCheckDashboard
            language={language}
          />
        )}

        {currentTab === 'analytics' && (
          <HumanImpactRadar
            incidents={incidents}
            language={language}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <EmergencyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitSuccess={(newInc) => {
          fetchAllData();
          setCurrentTab('overview');
        }}
        language={language}
      />

      <SosNowModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        language={language}
      />

      <CitizenTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        incidents={incidents}
        language={language}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          if (u.role === 'department') {
            setCurrentTab('departmentPortal');
          }
        }}
        language={language}
      />

      <DuplicateDetectionModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        duplicates={duplicates}
        incidents={incidents}
        onResolveDuplicate={handleResolveDuplicate}
        language={language}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectIncidentById={(id) => {
          setCurrentTab('lifeFirst');
        }}
        language={language}
      />

      {/* Footer */}
      <Footer language={language} />

    </div>
  );
}
