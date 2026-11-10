import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserCheck, 
  MapPin, 
  AlertCircle, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Eye, 
  Sparkles, 
  ShieldAlert, 
  X, 
  Filter, 
  Radio, 
  FileText,
  UserX
} from 'lucide-react';
import { MissingPersonCase, MissingPersonSighting, MissingPersonStatus } from '../types/index.ts';
import { Language } from '../translations/index.ts';

interface FinderMissingPersonsProps {
  language: Language;
}

export const FinderMissingPersons: React.FC<FinderMissingPersonsProps> = ({ language }) => {
  const [cases, setCases] = useState<MissingPersonCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSightingModalOpen, setIsSightingModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<MissingPersonCase | null>(null);
  const [caseSightings, setCaseSightings] = useState<MissingPersonSighting[]>([]);
  const [isSightingsDrawerOpen, setIsSightingsDrawerOpen] = useState(false);

  // New Case Form
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState('Male');
  const [lastKnownLocation, setLastKnownLocation] = useState('');
  const [clothing, setClothing] = useState('');
  const [physicalDesc, setPhysicalDesc] = useState('');
  const [identifyingFeatures, setIdentifyingFeatures] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [casePhotoPreview, setCasePhotoPreview] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop');

  // Sighting Form
  const [sightingCaseId, setSightingCaseId] = useState('');
  const [sightingLocation, setSightingLocation] = useState('');
  const [sightingDesc, setSightingDesc] = useState('');
  const [sightingPhotoPreview, setSightingPhotoPreview] = useState<string | null>(null);
  const [sightingReporter, setSightingReporter] = useState('');
  const [sightingContact, setSightingContact] = useState('');
  const [isSubmittingSighting, setIsSubmittingSighting] = useState(false);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/finder/cases');
      const data = await res.json();
      if (data.cases) {
        setCases(data.cases);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleOpenSightings = async (c: MissingPersonCase) => {
    setSelectedCase(c);
    setIsSightingsDrawerOpen(true);
    try {
      const res = await fetch(`/api/finder/cases/${c.id}/sightings`);
      const data = await res.json();
      if (data.sightings) {
        setCaseSightings(data.sightings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !lastKnownLocation.trim()) return;

    try {
      const res = await fetch('/api/finder/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          age: Number(age) || 20,
          gender,
          photoUrl: casePhotoPreview,
          dateTimeLastSeen: new Date().toISOString(),
          lastKnownLocation: lastKnownLocation.trim(),
          lastKnownLatitude: 13.0827,
          lastKnownLongitude: 80.2707,
          clothingDescription: clothing.trim() || 'Not specified',
          physicalDescription: physicalDesc.trim() || 'Not specified',
          identifyingCharacteristics: identifyingFeatures.trim() || 'None reported',
          medicalOrAccessibilityNeeds: medicalNeeds.trim() || undefined,
          circumstances: 'Separated during emergency event',
          reportingPersonName: reporterName.trim() || 'Concerned Relative',
          reportingPersonContact: reporterContact.trim() || '+91 98400 11223'
        })
      });

      if (res.ok) {
        setIsReportModalOpen(false);
        setFullName('');
        setLastKnownLocation('');
        fetchCases();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitSighting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sightingCaseId || !sightingLocation.trim()) return;

    try {
      setIsSubmittingSighting(true);
      const res = await fetch(`/api/finder/cases/${sightingCaseId}/sightings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sightingLocation: sightingLocation.trim(),
          latitude: 13.0827,
          longitude: 80.2707,
          description: sightingDesc.trim() || 'Observed individual matching description',
          photoUrl: sightingPhotoPreview || undefined,
          reporterName: sightingReporter.trim() || 'Citizen Sighting',
          reporterContact: sightingContact.trim() || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSightingModalOpen(false);
        setSightingLocation('');
        setSightingDesc('');
        setSightingPhotoPreview(null);
        fetchCases();
        if (selectedCase && selectedCase.id === sightingCaseId) {
          handleOpenSightings(selectedCase);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSighting(false);
    }
  };

  const handleVerifySighting = async (sightingId: string) => {
    try {
      await fetch(`/api/finder/sightings/${sightingId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'Duty Investigation Officer' })
      });
      if (selectedCase) {
        handleOpenSightings(selectedCase);
      }
      fetchCases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCaseStatus = async (caseId: string, newStatus: MissingPersonStatus) => {
    try {
      await fetch(`/api/finder/cases/${caseId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchCases();
      if (selectedCase && selectedCase.id === caseId) {
        setSelectedCase({ ...selectedCase, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: MissingPersonStatus) => {
    switch (status) {
      case 'newly_reported':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">NEW REPORT</span>;
      case 'search_active':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">SEARCH ACTIVE</span>;
      case 'possible_sighting':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">SIGHTING FLAGGED</span>;
      case 'located':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">LOCATED</span>;
      case 'reunited':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">REUNITED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">CLOSED</span>;
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesStat = statusFilter === 'all' || c.status === statusFilter;
    const matchesQuery = !searchQuery || 
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastKnownLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStat && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <Search className="w-4 h-4 text-amber-400" />
            <span>FINDER</span>
            <span>·</span>
            <span>Missing Person Coordination Bureau</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Missing Persons Registry & Sighting Verification
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Centralized database for tracing separated individuals during crises. AI facial similarity matching, public sighting submissions with UNVERIFIED tags, and officer verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (cases.length > 0) {
                setSightingCaseId(cases[0].id);
              }
              setIsSightingModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white bg-[#10233C] hover:bg-[#142B46] border border-[#1A365D] rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Submit Sighting</span>
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#E63946] hover:bg-[#D62839] rounded-xl shadow-lg shadow-[#E63946]/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Report Missing Person</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-[#10233C] border border-[#1A365D] rounded-2xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, reference ID, or last seen location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
          >
            <option value="all">All Statuses</option>
            <option value="newly_reported">New Report</option>
            <option value="search_active">Search Active</option>
            <option value="possible_sighting">Sightings Flagged</option>
            <option value="located">Located</option>
            <option value="reunited">Reunited</option>
          </select>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCases.map(c => (
          <div
            key={c.id}
            className="p-5 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF]/40 rounded-2xl shadow-xl space-y-4 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Image & Basic Details */}
              <div className="flex items-start gap-4">
                <img
                  src={c.photoUrl}
                  alt={c.fullName}
                  className="w-20 h-20 rounded-xl object-cover border border-[#1A365D] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono text-[#268BFF] font-bold">{c.id}</span>
                    {getStatusBadge(c.status)}
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5 truncate">{c.fullName}</h4>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {c.age} years · {c.gender}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{c.lastKnownLocation}</span>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="mt-3 p-3 bg-[#071426] rounded-xl border border-[#1A365D]/60 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Wearing: </span>
                  <span className="text-slate-200">{c.clothingDescription}</span>
                </div>
                {c.identifyingCharacteristics && (
                  <div>
                    <span className="text-slate-400">Features: </span>
                    <span className="text-slate-200">{c.identifyingCharacteristics}</span>
                  </div>
                )}
                {c.medicalOrAccessibilityNeeds && (
                  <div className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>Needs: {c.medicalOrAccessibilityNeeds}</span>
                  </div>
                )}
              </div>

              {/* Assigned Search Team if any */}
              {c.assignedSearchTeamName && (
                <div className="mt-2 text-xs text-sky-400 flex items-center gap-1 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Assigned: {c.assignedSearchTeamName}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#1A365D] flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenSightings(c)}
                className="text-xs text-[#268BFF] hover:underline flex items-center gap-1 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Sightings ({c.sightingsCount})</span>
              </button>

              <button
                onClick={() => {
                  setSightingCaseId(c.id);
                  setIsSightingModalOpen(true);
                }}
                className="px-3 py-1.5 bg-[#142B46] hover:bg-[#268BFF] text-white font-semibold text-xs rounded-lg transition-colors"
              >
                Report Sighting
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sightings & AI Comparison Drawer / Modal */}
      {isSightingsDrawerOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-6">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#1A365D]">
              <div>
                <div className="text-xs font-mono uppercase text-[#268BFF]">
                  Case File: {selectedCase.id}
                </div>
                <h3 className="text-xl font-bold text-white mt-1">
                  Sightings for {selectedCase.fullName}
                </h3>
              </div>

              <button
                onClick={() => setIsSightingsDrawerOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Case Quick Summary Banner */}
            <div className="p-4 bg-[#071426] border border-[#1A365D] rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCase.photoUrl}
                  alt={selectedCase.fullName}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div>
                  <div className="font-bold text-white">{selectedCase.fullName} ({selectedCase.age} y/o)</div>
                  <div className="text-xs text-slate-400">Last seen: {selectedCase.lastKnownLocation}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Update Case:</span>
                <button
                  onClick={() => handleUpdateCaseStatus(selectedCase.id, 'located')}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-bold"
                >
                  Mark Located
                </button>
                <button
                  onClick={() => handleUpdateCaseStatus(selectedCase.id, 'reunited')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold"
                >
                  Mark Reunited
                </button>
              </div>
            </div>

            {/* Sightings List */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase text-slate-400">
                Logged Sightings ({caseSightings.length})
              </h4>

              {caseSightings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-[#071426] rounded-xl">
                  No public sightings reported yet for this case.
                </div>
              ) : (
                <div className="space-y-3">
                  {caseSightings.map(sighting => (
                    <div
                      key={sighting.id}
                      className="p-4 bg-[#071426] border border-[#1A365D] rounded-xl space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {/* Mandatory UNVERIFIED SIGHTING badge requirement */}
                          {sighting.status === 'unverified_sighting' ? (
                            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[11px] font-bold font-mono">
                              UNVERIFIED SIGHTING
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[11px] font-bold font-mono">
                              VERIFIED BY AUTHORITIES
                            </span>
                          )}

                          <span className="text-xs text-slate-400">ID: {sighting.id}</span>
                        </div>

                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(sighting.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-start gap-4">
                        {sighting.photoUrl && (
                          <div className="relative group shrink-0">
                            <img
                              src={sighting.photoUrl}
                              alt="Sighting capture"
                              className="w-20 h-20 rounded-lg object-cover border border-[#1A365D]"
                            />
                            <span className="absolute bottom-1 right-1 px-1 bg-black/70 text-[9px] text-white rounded font-mono">
                              Photo
                            </span>
                          </div>
                        )}

                        <div className="space-y-1 text-xs">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                            <span>{sighting.sightingLocation}</span>
                          </div>
                          <p className="text-slate-300">{sighting.description}</p>
                          <div className="text-slate-400 text-[11px]">
                            Reported by: {sighting.reporterName || 'Anonymous'}
                          </div>
                        </div>
                      </div>

                      {/* AI Facial Similarity Confidence Box */}
                      {sighting.confidenceScore > 0 && (
                        <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-lg space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-purple-300 flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              AI FACIAL SIMILARITY MATCH
                            </span>
                            <span className="text-purple-300 font-bold">{sighting.confidenceScore}% Confidence</span>
                          </div>
                          <p className="text-[11px] text-purple-200/80">
                            Automated biometric alignment indicated high keypoint resemblance with registered photo. Human officer confirmation required.
                          </p>
                        </div>
                      )}

                      {/* Officer Verification Button */}
                      {sighting.status === 'unverified_sighting' && (
                        <div className="pt-2 border-t border-[#1A365D] flex items-center justify-end">
                          <button
                            onClick={() => handleVerifySighting(sighting.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm & Verify Sighting</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Sighting Submission Modal */}
      {isSightingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A365D]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <span>Submit Citizen Sighting</span>
              </h3>
              <button
                onClick={() => setIsSightingModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
              Notice: All public sighting submissions are initially marked as <strong>UNVERIFIED SIGHTING</strong> until validated by emergency search teams.
            </div>

            <form onSubmit={handleSubmitSighting} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Target Missing Person Case</label>
                <select
                  value={sightingCaseId}
                  onChange={(e) => setSightingCaseId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.id} - {c.lastKnownLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Sighting Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Chennai Central Metro, Gate 2"
                  value={sightingLocation}
                  onChange={(e) => setSightingLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Sighting Observations / Description</label>
                <textarea
                  rows={2}
                  placeholder="Appeared disoriented, wearing yellow raincoat, carrying blue bag..."
                  value={sightingDesc}
                  onChange={(e) => setSightingDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="Citizen witness"
                    value={sightingReporter}
                    onChange={(e) => setSightingReporter(e.target.value)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Your Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={sightingContact}
                    onChange={(e) => setSightingContact(e.target.value)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#1A365D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSightingModalOpen(false)}
                  className="px-4 py-2 bg-[#142B46] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSighting}
                  className="px-5 py-2 bg-[#268BFF] text-white font-bold rounded-xl hover:bg-[#1D7AE8]"
                >
                  {isSubmittingSighting ? 'Transmitting Sighting...' : 'Submit Sighting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Missing Person Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1A365D]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#E63946]" />
                <span>Register Missing Person Case</span>
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10) || 20)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-200 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Last Known Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marina Beach Boardwalk, Chennai"
                  value={lastKnownLocation}
                  onChange={(e) => setLastKnownLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Clothing Description</label>
                <input
                  type="text"
                  placeholder="Navy polo t-shirt, blue jeans, white sneakers"
                  value={clothing}
                  onChange={(e) => setClothing(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Identifying Characteristics</label>
                <input
                  type="text"
                  placeholder="Scar on left eyebrow, silver watch, glasses"
                  value={identifyingFeatures}
                  onChange={(e) => setIdentifyingFeatures(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Medical or Accessibility Needs</label>
                <input
                  type="text"
                  placeholder="Insulin-dependent diabetic, asthma inhaler required"
                  value={medicalNeeds}
                  onChange={(e) => setMedicalNeeds(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="pt-3 border-t border-[#1A365D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-[#142B46] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E63946] text-white font-bold rounded-xl hover:bg-[#D62839]"
                >
                  Broadcast Missing Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
