import React, { useState } from 'react';
import { 
  Info, 
  RotateCcw, 
  ShieldCheck, 
  UserCheck, 
  Shield, 
  Flame, 
  HeartPulse 
} from 'lucide-react';
import { User, DepartmentType } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface DemoBannerProps {
  currentUser: User;
  onSelectPersona: (role: 'citizen' | 'admin' | 'department', dept?: DepartmentType) => void;
  onResetDemoData: () => Promise<void>;
  language: Language;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({
  currentUser,
  onSelectPersona,
  onResetDemoData,
  language
}) => {
  const t = TRANSLATIONS[language];
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (window.confirm(t.demo.resetConfirm)) {
      setIsResetting(true);
      try {
        await onResetDemoData();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="bg-[#10233C] border-b border-[#1A365D] text-slate-300 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Notice */}
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#268BFF]/20 text-[#268BFF] border border-[#268BFF]/40 uppercase shrink-0">
            SIMULATED DEMO
          </span>
          <span className="text-[11px] text-slate-300 truncate">
            {t.demo.bannerText}
          </span>
        </div>

        {/* Quick Persona Buttons & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          
          <div className="hidden sm:flex items-center gap-1 bg-[#071426] p-1 rounded-lg border border-[#1A365D]">
            <button
              onClick={() => onSelectPersona('admin')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                currentUser.role === 'admin' 
                  ? 'bg-[#268BFF] text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.demo.personaAdmin}
            </button>
            <button
              onClick={() => onSelectPersona('citizen')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                currentUser.role === 'citizen' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.demo.personaCitizen}
            </button>
            <button
              onClick={() => onSelectPersona('department', 'police')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                currentUser.role === 'department' && currentUser.department === 'police' 
                  ? 'bg-sky-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.demo.personaPolice}
            </button>
            <button
              onClick={() => onSelectPersona('department', 'fire')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                currentUser.role === 'department' && currentUser.department === 'fire' 
                  ? 'bg-orange-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.demo.personaFire}
            </button>
            <button
              onClick={() => onSelectPersona('department', 'ambulance')}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                currentUser.role === 'department' && currentUser.department === 'ambulance' 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.demo.personaAmbulance}
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset database to initial simulated scenario"
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-[#071426] hover:bg-[#142B46] border border-[#1A365D] rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <RotateCcw className={`w-3 h-3 text-[#268BFF] ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : t.demo.resetBtn}</span>
          </button>

        </div>

      </div>
    </div>
  );
};
