import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  MapPin, 
  PhoneCall, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Radio, 
  Navigation, 
  HeartPulse, 
  Flame, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Users
} from 'lucide-react';
import { EmergencyCategory, SOSAlert, TeamRecommendation } from '../types/index.ts';
import { Language } from '../translations/index.ts';

interface SosNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SosNowModal: React.FC<SosNowModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('medical');
  const [citizenName, setCitizenName] = useState('Citizen (Emergency)');
  const [citizenPhone, setCitizenPhone] = useState('+91 98401 22334');
  const [locality, setLocality] = useState('Chennai Central Sector');
  const [latitude, setLatitude] = useState(13.0827);
  const [longitude, setLongitude] = useState(80.2707);
  const [contact1Name, setContact1Name] = useState('Immediate Family');
  const [contact1Phone, setContact1Phone] = useState('+91 94441 55667');
  const [isLocating, setIsLocating] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  
  // Activated SOS State
  const [activeSos, setActiveSos] = useState<SOSAlert | null>(null);
  const [recommendedTeam, setRecommendedTeam] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && !activeSos) {
      if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
            setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
            setIsLocating(false);
          },
          () => {
            setIsLocating(false);
          },
          { timeout: 5000 }
        );
      }
    }
  }, [isOpen, activeSos]);

  const handleTriggerSos = async () => {
    try {
      setIsTransmitting(true);
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenName: citizenName.trim() || 'Urgent Citizen SOS',
          citizenPhone: citizenPhone.trim() || undefined,
          emergencyCategory: selectedCategory,
          latitude,
          longitude,
          locality: locality.trim() || 'Detected GPS Location',
          emergencyContacts: [
            { name: contact1Name.trim() || 'Primary Contact', phone: contact1Phone.trim() || '+91 98400 00000' }
          ],
          notes: 'One-Tap SOS NOW signal generated from GUARDIA client application'
        })
      });

      const data = await res.json();
      if (data.success && data.sosAlert) {
        setActiveSos(data.sosAlert);
        if (data.recommendedTeam) {
          setRecommendedTeam(data.recommendedTeam);
        }
      } else {
        alert(data.error || 'Failed to dispatch SOS signal.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while broadcasting SOS.');
    } finally {
      setIsTransmitting(false);
    }
  };

  const handleCancelSos = async () => {
    if (!activeSos) return;
    try {
      await fetch(`/api/sos/${activeSos.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', notes: 'Citizen marked self as safe.' })
      });
      setActiveSos(null);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#10233C] border-2 border-[#E63946] rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#1A365D]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#E63946] animate-ping"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#E63946] font-bold">
                GUARDIA High-Urgency Dispatch
              </span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              <span>SOS NOW — Emergency Broadcast</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Activated State View */}
        {activeSos ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-6 bg-red-950/40 border-2 border-[#E63946] rounded-2xl text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#E63946]/20 border border-[#E63946] flex items-center justify-center mx-auto text-[#E63946] animate-pulse">
                <Radio className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase text-[#E63946] font-bold">LIVE EMERGENCY BROADCAST ACTIVE</span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Alert ID: {activeSos.id}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Your coordinates ({activeSos.latitude}, {activeSos.longitude}) have been locked and broadcasted to National Emergency Response dispatch.
                </p>
              </div>
            </div>

            {/* Recommended Response Team Card */}
            {recommendedTeam && (
              <div className="p-4 bg-[#142B46] border border-[#268BFF]/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-[#268BFF]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    NEAREST UNIT DISPATCH RECOMMENDATION
                  </span>
                  <span>ETA ~{recommendedTeam.etaMinutes} MINS</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{recommendedTeam.team.name}</h4>
                    <p className="text-xs text-slate-300">
                      {recommendedTeam.team.department} · {recommendedTeam.distanceKm} km away
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-lg border border-emerald-500/40">
                    Suitability {recommendedTeam.suitabilityScore}%
                  </span>
                </div>
              </div>
            )}

            {/* Emergency Contacts Notification Log */}
            <div className="p-4 bg-[#071426] border border-[#1A365D] rounded-2xl space-y-2">
              <div className="text-xs font-mono text-slate-400 uppercase">Emergency Contact Alerts Transmitted</div>
              {activeSos.notificationsSent.map((notif, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#1A365D]/40 last:border-0">
                  <span className="text-white font-medium">{notif.contactName} ({notif.phone})</span>
                  <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> SMS Dispatched
                  </span>
                </div>
              ))}
            </div>

            {/* Direct Helplines */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href="tel:112"
                className="p-3 bg-[#10233C] hover:bg-[#1A365D] border border-[#1A365D] rounded-xl flex items-center justify-center gap-2 text-white font-bold text-xs"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call National 112</span>
              </a>
              <a
                href="tel:108"
                className="p-3 bg-[#10233C] hover:bg-[#1A365D] border border-[#1A365D] rounded-xl flex items-center justify-center gap-2 text-white font-bold text-xs"
              >
                <PhoneCall className="w-4 h-4 text-rose-400" />
                <span>Call Medical 108</span>
              </a>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">Are you in safety now?</span>
              <button
                onClick={handleCancelSos}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Cancel / Mark Resolved
              </button>
            </div>
          </div>
        ) : (
          /* Form & 1-Tap Trigger View */
          <div className="space-y-6">
            
            {/* Situation Selection */}
            <div>
              <label className="block text-xs font-mono uppercase text-[#268BFF] mb-2 font-bold">
                01. Select Emergency Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'medical', label: 'Medical Emergency', icon: HeartPulse, color: 'text-rose-400' },
                  { id: 'fire', label: 'Fire / Explosion', icon: Flame, color: 'text-orange-400' },
                  { id: 'road_accident', label: 'Major Accident', icon: AlertTriangle, color: 'text-amber-400' },
                  { id: 'flood', label: 'Flood / Disaster', icon: ShieldAlert, color: 'text-sky-400' },
                  { id: 'other', label: 'Personal Threat', icon: ShieldCheck, color: 'text-blue-400' }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedCategory(item.id as EmergencyCategory)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedCategory === item.id
                          ? 'bg-[#E63946]/20 border-[#E63946] text-white shadow-lg shadow-[#E63946]/10'
                          : 'bg-[#071426] border-[#1A365D] text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color} mb-1`} />
                      <div className="text-xs font-bold">{item.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GPS Telemetry */}
            <div className="p-3.5 bg-[#071426] border border-[#1A365D] rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E63946]" />
                <div>
                  <div className="font-bold text-white">Live GPS Location Coordinates</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    {latitude}, {longitude} {isLocating && '(Calibrating...)'}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold rounded">
                High Precision
              </span>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400 font-bold">
                02. Emergency Contact Notification (Auto-SMS Broadcast)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={contact1Name}
                  onChange={(e) => setContact1Name(e.target.value)}
                  className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#E63946]"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone Number"
                  value={contact1Phone}
                  onChange={(e) => setContact1Phone(e.target.value)}
                  className="px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#E63946]"
                />
              </div>
            </div>

            {/* Giant One-Tap SOS Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerSos}
                disabled={isTransmitting}
                className="w-full py-5 bg-gradient-to-r from-[#E63946] via-red-600 to-[#E63946] hover:from-red-600 hover:to-red-700 text-white text-base font-black uppercase tracking-wider rounded-2xl shadow-2xl shadow-red-600/40 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <Radio className="w-6 h-6 animate-pulse" />
                <span>{isTransmitting ? 'Transmitting High-Priority Signal...' : 'TRIGGER EMERGENCY SOS NOW'}</span>
              </button>
            </div>

            {/* National Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              GUARDIA National Emergency Response will instantly alert the nearest Police, Fire & EMS command and your designated contact. Misuse or prank alerts are punishable under the National Disaster Management Act.
            </p>

          </div>
        )}

      </div>
    </div>
  );
};
