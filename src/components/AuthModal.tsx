import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Flame, 
  HeartPulse, 
  Shield, 
  Lock, 
  Mail,
  UserCircle2,
  CheckCircle2
} from 'lucide-react';
import { User, DepartmentType } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [emailInput, setEmailInput] = useState('');
  const [roleTab, setRoleTab] = useState<'citizen' | 'admin' | 'department'>('admin');
  const [selectedDept, setSelectedDept] = useState<DepartmentType>('police');

  if (!isOpen) return null;

  // Preset Authorized Personas for demonstration
  const personas: User[] = [
    {
      id: 'USR-ADMIN-1',
      name: 'Aditya Vardhan',
      email: 'admin@guardia.gov.in',
      role: 'admin',
      badgeNumber: 'GUA-DIR-001'
    },
    {
      id: 'USR-POLICE-1',
      name: 'Inspector R. Selvakumar',
      email: 'police@guardia.gov.in',
      role: 'department',
      department: 'police',
      badgeNumber: 'TN-POL-4412'
    },
    {
      id: 'USR-FIRE-1',
      name: 'Chief Officer M. Banerjee',
      email: 'fire@guardia.gov.in',
      role: 'department',
      department: 'fire',
      badgeNumber: 'FRS-HQ-902'
    },
    {
      id: 'USR-AMB-1',
      name: 'Dr. Priya Nambiar (EMS 108)',
      email: 'medical@guardia.gov.in',
      role: 'department',
      department: 'ambulance',
      badgeNumber: 'EMS-DOC-108'
    },
    {
      id: 'USR-CITIZEN-1',
      name: 'Kavitha Ramesh',
      email: 'citizen@example.com',
      role: 'citizen'
    }
  ];

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const matched = personas.find(p => p.email.toLowerCase() === emailInput.trim().toLowerCase());
    if (matched) {
      onSelectUser(matched);
    } else {
      onSelectUser({
        id: `USR-${Date.now()}`,
        name: emailInput.split('@')[0],
        email: emailInput.trim(),
        role: roleTab,
        department: roleTab === 'department' ? selectedDept : undefined
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#10233C] border border-[#268BFF]/40 rounded-2xl shadow-2xl p-6 space-y-6 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1A365D]">
          <div>
            <div className="text-xs font-mono text-[#268BFF] uppercase tracking-wider font-bold">
              Secure Access Gate
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Role-Based Authentication
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Persona Switcher for Hackathon Demonstrations */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            One-Click Verified Demo Personas
          </div>

          <div className="space-y-2">
            {personas.map(p => {
              const isCurrent = currentUser.id === p.id;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectUser(p);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isCurrent 
                      ? 'bg-[#142B46] border-[#268BFF] shadow-md shadow-[#268BFF]/10' 
                      : 'bg-[#071426] border-[#1A365D] hover:bg-[#142B46]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#10233C] rounded-lg border border-[#1A365D]">
                      {p.role === 'admin' && <ShieldCheck className="w-4 h-4 text-[#268BFF]" />}
                      {p.role === 'citizen' && <UserCheck className="w-4 h-4 text-emerald-400" />}
                      {p.role === 'department' && p.department === 'police' && <Shield className="w-4 h-4 text-sky-400" />}
                      {p.role === 'department' && p.department === 'fire' && <Flame className="w-4 h-4 text-orange-400" />}
                      {p.role === 'department' && p.department === 'ambulance' && <HeartPulse className="w-4 h-4 text-emerald-400" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.role.toUpperCase()} {p.department ? `· ${p.department.toUpperCase()}` : ''}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-xs font-mono text-[#268BFF] font-bold">ACTIVE</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Email Login Form */}
        <div className="pt-2 border-t border-[#1A365D] space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Or Sign In with Official Email
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-3">
            <div>
              <input
                type="email"
                required
                placeholder="officer@guardia.gov.in"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-[#268BFF]"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleTab}
                onChange={(e) => setRoleTab(e.target.value as any)}
                className="flex-1 px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
              >
                <option value="admin">Administrator</option>
                <option value="department">Emergency Department</option>
                <option value="citizen">Citizen</option>
              </select>

              {roleTab === 'department' && (
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value as any)}
                  className="flex-1 px-3 py-2 text-xs bg-[#071426] border border-[#1A365D] rounded-xl text-white focus:outline-none focus:border-[#268BFF]"
                >
                  <option value="police">Police</option>
                  <option value="fire">Fire & Rescue</option>
                  <option value="ambulance">EMS 108</option>
                </select>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-bold text-white bg-[#268BFF] hover:bg-[#1D7AE8] rounded-xl transition-colors"
            >
              Authenticate & Enter
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
