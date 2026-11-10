import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  MapPin, 
  HeartHandshake, 
  UserPlus, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  PhoneCall, 
  Clock, 
  Compass, 
  Radio,
  Plus
} from 'lucide-react';
import { FamilyGroup, FamilySafetyStatus, ReunificationCentre } from '../types/index.ts';
import { Language } from '../translations/index.ts';

interface FamilyLinkModuleProps {
  language: Language;
}

export const FamilyLinkModule: React.FC<FamilyLinkModuleProps> = ({ language }) => {
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [centres, setCentres] = useState<ReunificationCentre[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'centres'>('groups');
  const [copiedCode, setCopiedCode] = useState(false);

  // New Group Form
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [adminName, setAdminName] = useState('Ananya Raman');
  const [meetingPoint, setMeetingPoint] = useState('Nehru Stadium Relief Centre');

  // Check-In Form
  const [checkInMemberName, setCheckInMemberName] = useState('Ananya Raman');
  const [checkInStatus, setCheckInStatus] = useState<FamilySafetyStatus>('safe');
  const [checkInNotes, setCheckInNotes] = useState('All safe at designated shelter.');
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);

  // Join Group by Code
  const [joinCode, setJoinCode] = useState('');
  const [joinMemberName, setJoinMemberName] = useState('');
  const [joinRelation, setJoinRelation] = useState('Brother');
  const [joinPhone, setJoinPhone] = useState('+91 98402 11223');

  const fetchFamilyData = async () => {
    try {
      const [grpRes, cntRes] = await Promise.all([
        fetch('/api/family-link/groups'),
        fetch('/api/family-link/centres')
      ]);
      const [grpData, cntData] = await Promise.all([
        grpRes.json(),
        cntRes.json()
      ]);
      if (grpData.groups) {
        setFamilyGroups(grpData.groups);
        if (!selectedGroup && grpData.groups.length > 0) {
          setSelectedGroup(grpData.groups[0]);
        } else if (selectedGroup) {
          const updated = grpData.groups.find((g: FamilyGroup) => g.id === selectedGroup.id);
          if (updated) setSelectedGroup(updated);
        }
      }
      if (cntData.centres) {
        setCentres(cntData.centres);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleCopyInvite = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/family-link/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          adminName: adminName.trim(),
          preferredMeetingPoint: meetingPoint.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.group) {
        setIsCreateGroupOpen(false);
        setNewGroupName('');
        fetchFamilyData();
        setSelectedGroup(data.group);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async (status: FamilySafetyStatus) => {
    if (!selectedGroup) return;
    try {
      setIsCheckInLoading(true);
      const res = await fetch(`/api/family-link/groups/${selectedGroup.id}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberName: checkInMemberName,
          safetyStatus: status,
          checkInNotes: checkInNotes,
          latitude: 13.0827,
          longitude: 80.2707,
          location: 'Chennai Relief Hub'
        })
      });
      if (res.ok) {
        fetchFamilyData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckInLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !joinMemberName.trim()) return;

    try {
      const res = await fetch('/api/family-link/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationCode: joinCode.trim(),
          member: {
            name: joinMemberName.trim(),
            relationship: joinRelation.trim(),
            phone: joinPhone.trim(),
            safetyStatus: 'safe',
            checkInNotes: 'Just joined family circle.'
          }
        })
      });
      const data = await res.json();
      if (data.success && data.group) {
        setSelectedGroup(data.group);
        setJoinCode('');
        setJoinMemberName('');
        fetchFamilyData();
      } else {
        alert(data.error || 'Invalid invitation code');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: FamilySafetyStatus) => {
    switch (status) {
      case 'safe':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SAFE</span>;
      case 'evacuating':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">EVACUATING</span>;
      case 'sheltered':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">SHELTERED</span>;
      case 'need_assistance':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">NEED HELP</span>;
      case 'injured':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">INJURED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-slate-300">UNKNOWN</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1A365D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#268BFF]">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <span>Family Link</span>
            <span>·</span>
            <span>Emergency Reunification Ecosystem</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Family Safety Circles & Reunification Centres
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Keep loved ones accounted for during catastrophic disasters. Private invite codes, real-time safety status broadcasts, and verified relief shelter directories.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'groups'
                ? 'bg-[#268BFF] text-white shadow-lg shadow-[#268BFF]/20'
                : 'bg-[#10233C] text-slate-300 hover:text-white border border-[#1A365D]'
            }`}
          >
            Family Circles ({familyGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('centres')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'centres'
                ? 'bg-[#268BFF] text-white shadow-lg shadow-[#268BFF]/20'
                : 'bg-[#10233C] text-slate-300 hover:text-white border border-[#1A365D]'
            }`}
          >
            Reunification Centres ({centres.length})
          </button>
        </div>
      </div>

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Circle Selector & Join */}
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#268BFF]" />
                <span>Your Family Circles</span>
              </h3>
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                className="text-xs text-[#268BFF] hover:underline flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Group</span>
              </button>
            </div>

            <div className="space-y-2">
              {familyGroups.map(grp => (
                <div
                  key={grp.id}
                  onClick={() => setSelectedGroup(grp)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedGroup?.id === grp.id
                      ? 'bg-[#142B46] border-[#268BFF] shadow-lg shadow-[#268BFF]/10'
                      : 'bg-[#10233C] border-[#1A365D] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{grp.name}</h4>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      {grp.members.length} Members
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Meeting Point: {grp.preferredMeetingPoint}
                  </div>
                </div>
              ))}
            </div>

            {/* Join with Invite Code Card */}
            <div className="p-4 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-3">
              <h4 className="text-xs font-mono uppercase text-[#268BFF] font-bold">
                Join Circle via Code
              </h4>
              <form onSubmit={handleJoinGroup} className="space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Invite Code (e.g. GUA-FAM-9821)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white font-mono uppercase focus:outline-none focus:border-[#268BFF]"
                />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={joinMemberName}
                  onChange={(e) => setJoinMemberName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-[#268BFF] hover:bg-[#1D7AE8] text-white font-bold rounded-xl transition-colors"
                >
                  Join Circle
                </button>
              </form>
            </div>

          </div>

          {/* Right: Circle Active Details & Check-In */}
          <div className="lg:col-span-2 space-y-6">
            {selectedGroup ? (
              <>
                {/* Circle Banner */}
                <div className="p-5 bg-[#10233C] border border-[#1A365D] rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#268BFF] font-bold">CIRCLE ID: {selectedGroup.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs text-slate-300">Admin: {selectedGroup.adminName}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mt-1">{selectedGroup.name}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-[#071426] border border-[#1A365D] rounded-xl text-xs font-mono text-slate-200 flex items-center gap-2">
                        <span>Code: <strong>{selectedGroup.invitationCode}</strong></span>
                        <button
                          onClick={() => handleCopyInvite(selectedGroup.invitationCode)}
                          className="text-[#268BFF] hover:text-white"
                          title="Copy Invite Code"
                        >
                          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1A365D] flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                      <span>Agreed Meeting Point: <strong>{selectedGroup.preferredMeetingPoint}</strong></span>
                    </span>
                    <span className="font-mono text-slate-400">Created: {new Date(selectedGroup.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Instant Status Check-In Strip */}
                <div className="p-5 bg-gradient-to-r from-blue-950/40 to-[#10233C] border border-[#268BFF]/40 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase text-[#268BFF] font-bold">
                      One-Tap Safety Check-In
                    </h4>
                    <span className="text-xs text-slate-300">Checking in as: <strong>{checkInMemberName}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleCheckIn('safe')}
                      disabled={isCheckInLoading}
                      className="p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Am Safe</span>
                    </button>

                    <button
                      onClick={() => handleCheckIn('evacuating')}
                      disabled={isCheckInLoading}
                      className="p-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Compass className="w-4 h-4" />
                      <span>Evacuating</span>
                    </button>

                    <button
                      onClick={() => handleCheckIn('sheltered')}
                      disabled={isCheckInLoading}
                      className="p-3 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Sheltered</span>
                    </button>

                    <button
                      onClick={() => handleCheckIn('need_assistance')}
                      disabled={isCheckInLoading}
                      className="p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Need Help</span>
                    </button>
                  </div>
                </div>

                {/* Member Safety Roster */}
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                    Member Safety Roster ({selectedGroup.members.length})
                  </h4>

                  <div className="space-y-2.5">
                    {selectedGroup.members.map(member => (
                      <div
                        key={member.id}
                        className="p-4 bg-[#10233C] border border-[#1A365D] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-white">{member.name}</h5>
                            <span className="text-[11px] font-mono text-slate-400">({member.relationship})</span>
                            {getStatusBadge(member.safetyStatus)}
                          </div>
                          
                          <div className="text-xs text-slate-300 mt-1 flex items-center gap-4">
                            <span className="flex items-center gap-1 text-slate-400">
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{member.phone}</span>
                            </span>
                            {member.lastSharedLocation && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-[#268BFF]" />
                                <span>{member.lastSharedLocation}</span>
                              </span>
                            )}
                          </div>

                          {member.checkInNotes && (
                            <p className="text-xs text-slate-300 italic mt-1.5 bg-[#071426] p-2 rounded-lg border border-[#1A365D]">
                              "{member.checkInNotes}"
                            </p>
                          )}
                        </div>

                        <div className="text-[11px] font-mono text-slate-400 sm:text-right shrink-0">
                          {member.locationTimestamp ? (
                            <span>Updated: {new Date(member.locationTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          ) : (
                            <span>No check-in yet</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-xs">
                Select or create a family group to view safety statuses.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Official Reunification Centres Directory */}
      {activeTab === 'centres' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-white">Designated Relief & Evacuation Centres</h3>
              <p className="text-xs text-slate-300">Government approved safe shelters with beds, clean water, medical triage, and power backup.</p>
            </div>
            <span className="text-xs font-mono text-[#268BFF] font-bold">{centres.length} Verified Facilities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centres.map(centre => (
              <div
                key={centre.id}
                className="p-5 bg-[#10233C] border border-[#1A365D] hover:border-[#268BFF]/40 rounded-2xl shadow-xl space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#268BFF] font-bold">{centre.id}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{centre.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{centre.address}, {centre.district}, {centre.state}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                    centre.operationalStatus === 'open' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    centre.operationalStatus === 'near_capacity' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {centre.operationalStatus.replace('_', ' ')}
                  </span>
                </div>

                {/* Capacity Gauge */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Available Space:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {centre.availableCapacity} / {centre.capacity} Persons
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#071426] rounded-full overflow-hidden border border-[#1A365D]">
                    <div
                      className="h-full bg-[#268BFF] rounded-full"
                      style={{ width: `${Math.round(((centre.capacity - centre.availableCapacity) / centre.capacity) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 mb-1">Available Facilities</div>
                  <div className="flex flex-wrap gap-1">
                    {centre.facilities.map((fac, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#142B46] text-slate-300 rounded border border-[#1A365D]">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1A365D] flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hotline: {centre.contact}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Coords: {centre.latitude}, {centre.longitude}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Family Circle Modal */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#10233C] border border-[#268BFF]/40 rounded-2xl p-6 text-slate-100 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#268BFF]" />
              <span>Create New Family Circle</span>
            </h3>

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Circle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raman Family Network"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin / Coordinator Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred Meeting Point</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  placeholder="e.g. Nehru Stadium Relief Camp"
                  className="w-full px-3 py-2 bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                />
              </div>

              <div className="pt-3 border-t border-[#1A365D] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(false)}
                  className="px-4 py-2 bg-[#142B46] text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#268BFF] text-white font-bold rounded-xl hover:bg-[#1D7AE8]"
                >
                  Create Circle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
