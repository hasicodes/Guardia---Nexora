import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  X, 
  MapPin, 
  AlertTriangle, 
  Camera, 
  Navigation, 
  Users, 
  HeartPulse, 
  ShieldCheck, 
  FileCheck, 
  WifiOff, 
  Wifi, 
  CheckCircle2, 
  Info,
  Clock
} from 'lucide-react';
import { EmergencyCategory, InjurySeverity, Incident } from '../types/index.ts';
import { INDIA_STATES } from '../data/indiaGeoData.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface EmergencyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (incident: Incident) => void;
  language: Language;
}

export const EmergencyReportModal: React.FC<EmergencyReportModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  language
}) => {
  const t = TRANSLATIONS[language];
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [hasOfflineDraft, setHasOfflineDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<Incident | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EmergencyCategory>('fire');
  const [latitude, setLatitude] = useState<number>(13.0827);
  const [longitude, setLongitude] = useState<number>(80.2707);
  const [stateName, setStateName] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Chennai');
  const [locality, setLocality] = useState('');
  
  const [peopleAffected, setPeopleAffected] = useState<number>(1);
  const [peopleInjured, setPeopleInjured] = useState<number>(0);
  const [injurySeverity, setInjurySeverity] = useState<InjurySeverity>('unknown');
  const [peopleTrapped, setPeopleTrapped] = useState<boolean>(false);
  const [immediateDanger, setImmediateDanger] = useState<boolean>(true);
  const [isSituationEscalating, setIsSituationEscalating] = useState<boolean>(false);
  const [hasVulnerablePeople, setHasVulnerablePeople] = useState<boolean>(false);
  const [medicalConditionNotes, setMedicalConditionNotes] = useState('');

  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  // Connectivity monitoring & local draft management
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for existing offline draft
    const saved = localStorage.getItem('guardia_offline_draft');
    if (saved) {
      setHasOfflineDraft(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save offline draft on input changes
  useEffect(() => {
    if (!title && !locality) return;
    const draft = {
      title,
      description,
      category,
      latitude,
      longitude,
      state: stateName,
      district,
      locality,
      peopleAffected,
      peopleInjured,
      injurySeverity,
      peopleTrapped,
      immediateDanger,
      isSituationEscalating,
      hasVulnerablePeople,
      medicalConditionNotes,
      reporterName,
      reporterPhone,
      isAnonymous,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('guardia_offline_draft', JSON.stringify(draft));
  }, [
    title, description, category, latitude, longitude, stateName, district, locality,
    peopleAffected, peopleInjured, injurySeverity, peopleTrapped, immediateDanger,
    isSituationEscalating, hasVulnerablePeople, medicalConditionNotes, reporterName, reporterPhone, isAnonymous
  ]);

  // Load offline draft if user clicks restore
  const handleRestoreDraft = () => {
    const saved = localStorage.getItem('guardia_offline_draft');
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.title) setTitle(d.title);
        if (d.description) setDescription(d.description);
        if (d.category) setCategory(d.category);
        if (d.latitude) setLatitude(d.latitude);
        if (d.longitude) setLongitude(d.longitude);
        if (d.state) setStateName(d.state);
        if (d.district) setDistrict(d.district);
        if (d.locality) setLocality(d.locality);
        if (d.peopleAffected) setPeopleAffected(d.peopleAffected);
        if (d.peopleInjured !== undefined) setPeopleInjured(d.peopleInjured);
        if (d.injurySeverity) setInjurySeverity(d.injurySeverity);
        if (d.peopleTrapped !== undefined) setPeopleTrapped(d.peopleTrapped);
        if (d.immediateDanger !== undefined) setImmediateDanger(d.immediateDanger);
        if (d.isSituationEscalating !== undefined) setIsSituationEscalating(d.isSituationEscalating);
        if (d.hasVulnerablePeople !== undefined) setHasVulnerablePeople(d.hasVulnerablePeople);
        if (d.medicalConditionNotes) setMedicalConditionNotes(d.medicalConditionNotes);
        if (d.reporterName) setReporterName(d.reporterName);
        if (d.reporterPhone) setReporterPhone(d.reporterPhone);
        if (d.isAnonymous !== undefined) setIsAnonymous(d.isAnonymous);
        setHasOfflineDraft(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Mini Location Picker Map
  useEffect(() => {
    if (!isOpen || !miniMapContainerRef.current) return;

    if (!miniMapInstanceRef.current) {
      const map = L.map(miniMapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 12,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 18
      }).addTo(map);

      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setLatitude(parseFloat(pos.lat.toFixed(4)));
        setLongitude(parseFloat(pos.lng.toFixed(4)));
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        setLatitude(parseFloat(e.latlng.lat.toFixed(4)));
        setLongitude(parseFloat(e.latlng.lng.toFixed(4)));
      });

      miniMapInstanceRef.current = map;
      markerRef.current = marker;
    } else {
      miniMapInstanceRef.current.invalidateSize();
      miniMapInstanceRef.current.setView([latitude, longitude], 12);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
    }

    return () => {
      // Keep instance until modal unmounts
    };
  }, [isOpen, latitude, longitude]);

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsMessage(t.reportingForm.gpsError);
      return;
    }
    setGpsLoading(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lng);
        setGpsLoading(false);
        setGpsMessage(t.reportingForm.gpsSuccess);
        if (miniMapInstanceRef.current && markerRef.current) {
          miniMapInstanceRef.current.flyTo([lat, lng], 14);
          markerRef.current.setLatLng([lat, lng]);
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsMessage(`${t.reportingForm.gpsError} (${err.message})`);
      },
      { timeout: 8000 }
    );
  };

  // State selection sync
  const handleStateChange = (selected: string) => {
    setStateName(selected);
    const stObj = INDIA_STATES.find(s => s.name === selected);
    if (stObj && stObj.districts.length > 0) {
      setDistrict(stObj.districts[0]);
      setLatitude(stObj.lat);
      setLongitude(stObj.lng);
      if (miniMapInstanceRef.current && markerRef.current) {
        miniMapInstanceRef.current.flyTo([stObj.lat, stObj.lng], 10);
        markerRef.current.setLatLng([stObj.lat, stObj.lng]);
      }
    }
  };

  // Photo simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locality.trim()) return;

    if (!isOnline) {
      // In offline mode: preserve in localStorage and inform user
      alert('Offline Mode: Your emergency draft has been saved securely to local storage. Transmit once network connection is available.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          latitude,
          longitude,
          state: stateName,
          district,
          locality: locality.trim(),
          peopleAffected: Number(peopleAffected) || 1,
          peopleInjured: Number(peopleInjured) || 0,
          injurySeverity,
          peopleTrapped,
          immediateDanger,
          isSituationEscalating,
          hasVulnerablePeople,
          medicalConditionNotes: medicalConditionNotes.trim(),
          submittedBy: {
            name: isAnonymous ? 'Anonymous Citizen' : (reporterName.trim() || 'Citizen Reporter'),
            phone: isAnonymous ? undefined : (reporterPhone.trim() || undefined),
            isAnonymous
          },
          photoUrl: photoPreview || undefined,
          isDemo: false
        })
      });

      const data = await res.json();
      if (data.success && data.incident) {
        // Clear offline draft upon successful upload
        localStorage.removeItem('guardia_offline_draft');
        setSubmissionResult(data.incident);
        onSubmitSuccess(data.incident);
      } else {
        alert(data.error || 'Failed to submit report. Please retry.');
      }
    } catch (err) {
      console.error(err);
      alert('Network transmission failed. Report preserved as draft in local storage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl text-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 z-20 px-6 py-4 bg-[#071426] border-b border-[#1A365D] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E63946] animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#E63946] font-bold">
                Emergency Transmission Gateway
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-300">
                {isOnline ? 'Online Sync' : 'Offline Buffer Mode'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              {t.reportingForm.modalTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Banner if disconnected */}
        {!isOnline && (
          <div className="px-6 py-2.5 bg-amber-500/20 border-b border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{t.reportingForm.offlineBanner}</span>
          </div>
        )}

        {/* Restore Draft prompt if available */}
        {hasOfflineDraft && !submissionResult && (
          <div className="px-6 py-2.5 bg-[#268BFF]/20 border-b border-[#268BFF]/40 text-[#268BFF] text-xs flex items-center justify-between">
            <span>You have an unsubmitted emergency draft saved on this device.</span>
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1 bg-[#268BFF] text-white rounded font-bold hover:bg-[#1D7AE8]"
            >
              Restore Draft
            </button>
          </div>
        )}

        {/* Content View: Submission Form or Confirmation View */}
        {submissionResult ? (
          <div className="p-8 space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="max-w-lg mx-auto">
              <h3 className="text-2xl font-bold text-white">
                {t.confirmation.successTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {t.confirmation.successMessage}
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="max-w-md mx-auto p-5 bg-[#142B46] border border-[#268BFF]/40 rounded-xl space-y-3">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase">
                  {t.confirmation.refLabel}
                </div>
                <div className="text-2xl font-black text-white font-mono tracking-wider mt-1 select-all">
                  {submissionResult.incidentReference}
                </div>
              </div>

              <div className="pt-2 border-t border-[#1A365D] flex items-center justify-between text-xs">
                <span className="text-slate-400">{t.confirmation.priorityLabel}:</span>
                <span className="font-mono font-bold text-[#E63946]">
                  {submissionResult.finalPriority} ({submissionResult.assessment.score}/100)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  onClose();
                  setSubmissionResult(null);
                }}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-xl shadow-lg"
              >
                {t.confirmation.doneBtn}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Section 1: Incident Identity & Category */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-[#268BFF] border-b border-[#1A365D] pb-1">
                01. Incident Identity & Categorization
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {t.reportingForm.titleLabel} <span className="text-[#E63946]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.reportingForm.titlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: 'fire', label: t.categories.fire },
                  { id: 'road_accident', label: t.categories.road_accident },
                  { id: 'medical', label: t.categories.medical },
                  { id: 'flood', label: t.categories.flood },
                  { id: 'building_collapse', label: t.categories.building_collapse },
                  { id: 'other', label: t.categories.other }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as EmergencyCategory)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                      category === cat.id
                        ? 'bg-[#268BFF]/20 border-[#268BFF] text-white shadow-sm'
                        : 'bg-[#142B46] border-[#1A365D] text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{cat.label}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Incident Description & Situation Summary
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe visible hazard, smoke direction, landmarks, or vehicle types..."
                  className="w-full px-3.5 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
                />
              </div>
            </div>

            {/* Section 2: Geographical Coordinates & Location Picker */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A365D] pb-1">
                <span className="text-xs font-mono uppercase tracking-wider text-[#268BFF]">
                  02. Geographical Location
                </span>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={gpsLoading}
                  className="text-xs text-[#268BFF] hover:underline flex items-center gap-1 font-mono disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{gpsLoading ? 'Detecting...' : t.reportingForm.useGpsBtn}</span>
                </button>
              </div>

              {gpsMessage && (
                <div className="text-[11px] text-sky-400 font-mono">
                  {gpsMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t.reportingForm.stateLabel} <span className="text-[#E63946]">*</span>
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  >
                    {INDIA_STATES.map(s => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t.reportingForm.districtLabel} <span className="text-[#E63946]">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  >
                    {(INDIA_STATES.find(s => s.name === stateName)?.districts || ['Capital Zone']).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t.reportingForm.localityLabel} <span className="text-[#E63946]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.reportingForm.localityPlaceholder}
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
                  />
                </div>
              </div>

              {/* Interactive Location Picker Map */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Pinpoint Location (Click or drag pin to adjust coordinates)</span>
                  <span className="font-mono text-slate-300">Lat: {latitude}, Lng: {longitude}</span>
                </div>
                <div 
                  ref={miniMapContainerRef} 
                  className="w-full h-44 rounded-xl border border-[#1A365D] overflow-hidden" 
                />
              </div>
            </div>

            {/* Section 3: LIFE-FIRST Human Impact & Threat Assessment */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-[#268BFF] border-b border-[#1A365D] pb-1">
                03. LIFE-FIRST Human Impact & Risk Telemetry
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t.reportingForm.affectedLabel}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t.reportingForm.injuredLabel}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={peopleInjured}
                    onChange={(e) => setPeopleInjured(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t.reportingForm.injurySeverityLabel}
                  </label>
                  <select
                    value={injurySeverity}
                    onChange={(e) => setInjurySeverity(e.target.value as InjurySeverity)}
                    className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                  >
                    <option value="none">{t.reportingForm.injuriesNone}</option>
                    <option value="minor">{t.reportingForm.injuriesMinor}</option>
                    <option value="serious">{t.reportingForm.injuriesSerious}</option>
                    <option value="life_threatening">{t.reportingForm.injuriesLifeThreat}</option>
                    <option value="unknown">{t.reportingForm.injuriesUnknown}</option>
                  </select>
                </div>
              </div>

              {/* Critical Danger Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                <label className="p-3 bg-[#142B46] border border-[#1A365D] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#268BFF]/40">
                  <div className="pr-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>{t.reportingForm.trappedLabel}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Triggers instant search & rescue heavy equipment routing.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={peopleTrapped}
                    onChange={(e) => setPeopleTrapped(e.target.checked)}
                    className="w-5 h-5 accent-[#E63946] rounded cursor-pointer"
                  />
                </label>

                <label className="p-3 bg-[#142B46] border border-[#1A365D] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#268BFF]/40">
                  <div className="pr-2">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>{t.reportingForm.dangerLabel}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Immediately flags P1 urgent triage review.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={immediateDanger}
                    onChange={(e) => setImmediateDanger(e.target.checked)}
                    className="w-5 h-5 accent-[#E63946] rounded cursor-pointer"
                  />
                </label>

                <label className="p-3 bg-[#142B46] border border-[#1A365D] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#268BFF]/40">
                  <div className="pr-2">
                    <div className="text-xs font-bold text-white">
                      {t.reportingForm.escalatingLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Fire spreading, chemical leak expanding, water rising.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSituationEscalating}
                    onChange={(e) => setIsSituationEscalating(e.target.checked)}
                    className="w-5 h-5 accent-[#268BFF] rounded cursor-pointer"
                  />
                </label>

                <label className="p-3 bg-[#142B46] border border-[#1A365D] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#268BFF]/40">
                  <div className="pr-2">
                    <div className="text-xs font-bold text-white">
                      {t.reportingForm.vulnerableLabel}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Children, pregnant women, elderly, disabled individuals.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasVulnerablePeople}
                    onChange={(e) => setHasVulnerablePeople(e.target.checked)}
                    className="w-5 h-5 accent-[#268BFF] rounded cursor-pointer"
                  />
                </label>

              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {t.reportingForm.symptomsLabel}
                </label>
                <input
                  type="text"
                  placeholder={t.reportingForm.symptomsPlaceholder}
                  value={medicalConditionNotes}
                  onChange={(e) => setMedicalConditionNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
                />
              </div>
            </div>

            {/* Section 4: Contact & Optional Photo Upload */}
            <div className="space-y-4">
              <div className="text-xs font-mono uppercase tracking-wider text-[#268BFF] border-b border-[#1A365D] pb-1">
                04. Verification & Photographic Evidence
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 accent-[#268BFF] rounded cursor-pointer"
                    />
                    <label htmlFor="anonCheck" className="text-xs text-slate-300 cursor-pointer">
                      {t.reportingForm.anonLabel}
                    </label>
                  </div>

                  {!isAnonymous && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">{t.reportingForm.nameLabel}</label>
                        <input
                          type="text"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">{t.reportingForm.phoneLabel}</label>
                        <input
                          type="tel"
                          value={reporterPhone}
                          onChange={(e) => setReporterPhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full px-3 py-1.5 text-xs bg-[#071426] border border-[#1A365D] rounded-lg text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t.reportingForm.photoLabel}
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 bg-[#071426] border border-dashed border-[#1A365D] rounded-xl cursor-pointer hover:border-[#268BFF] transition-colors">
                    {photoPreview ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden">
                        <img 
                          src={photoPreview} 
                          alt="Evidence preview" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setPhotoPreview(null);
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-[11px] text-slate-400">Click to attach live photograph or scene image</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Reality Check forensic verification active. Rescue dispatch is never delayed.</span>
                  </p>
                </div>

              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#1A365D] flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Data handled according to national public safety protocols.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#142B46] rounded-xl"
                >
                  {t.reportingForm.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !locality.trim()}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#E63946] hover:bg-[#D62839] rounded-xl shadow-lg shadow-[#E63946]/30 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{t.reportingForm.submittingBtn}</span>
                    </>
                  ) : (
                    <span>{t.reportingForm.submitBtn}</span>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
