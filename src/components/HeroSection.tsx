import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Activity, 
  Clock, 
  LifeBuoy, 
  Radio, 
  TrendingUp 
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface HeroSectionProps {
  language: Language;
  onOpenReportModal: () => void;
  onNavigateToMap: () => void;
  onOpenTrackerModal: () => void;
  stats: {
    totalIncidents: number;
    criticalP1: number;
    totalAffected: number;
    totalInjured: number;
    availableResources: number;
    ackRate: number;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  onOpenReportModal,
  onNavigateToMap,
  onOpenTrackerModal,
  stats
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#071426] via-[#10233C] to-[#071426] border-b border-[#1A365D]">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#268BFF 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="max-w-3xl">
          
          {/* Natural Editorial Brand Eyebrow (No pill badge, clean text with dot separator) */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#268BFF] mb-4 font-mono">
            <span>National Emergency Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Government of India Prototype</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">Live Telemetry Active</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance">
            {t.hero.headline}
          </h1>

          {/* Supporting Text */}
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {t.hero.subhead}
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenReportModal}
              className="px-6 py-3.5 text-sm font-bold text-white bg-[#E63946] hover:bg-[#D62839] rounded-xl shadow-xl shadow-[#E63946]/30 transition-all flex items-center gap-2.5 whitespace-nowrap active:scale-95"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>{t.hero.reportBtn}</span>
            </button>

            <button
              onClick={onNavigateToMap}
              className="px-6 py-3.5 text-sm font-semibold text-white bg-[#142B46] hover:bg-[#1A365D] border border-[#268BFF]/40 hover:border-[#268BFF] rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 text-[#268BFF]" />
              <span>{t.hero.exploreBtn}</span>
            </button>

            <button
              onClick={onOpenTrackerModal}
              className="px-5 py-3.5 text-sm font-medium text-slate-300 hover:text-white bg-[#10233C] hover:bg-[#142B46] border border-[#1A365D] rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>{t.hero.trackBtn}</span>
            </button>
          </div>
        </div>

        {/* Database-Driven KPI Strip */}
        <div className="mt-12 pt-8 border-t border-[#1A365D] grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          
          <div className="p-4 bg-[#142B46]/80 rounded-xl border border-[#1A365D]/80">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#268BFF]" />
              <span>{t.hero.statsActive}</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
              {stats.totalIncidents}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Live database records
            </div>
          </div>

          <div className="p-4 bg-[#142B46]/80 rounded-xl border border-[#E63946]/30">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#E63946]" />
              <span>{t.hero.statsP1}</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#E63946] font-mono tabular-nums">
              {stats.criticalP1}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Immediate threat to life
            </div>
          </div>

          <div className="p-4 bg-[#142B46]/80 rounded-xl border border-[#1A365D]/80">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-amber-400" />
              <span>Reported Casualties & Injured</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
              {stats.totalInjured} <span className="text-xs text-slate-400 font-sans font-normal">({stats.totalAffected} affected)</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Triaged by LIFE-FIRST
            </div>
          </div>

          <div className="p-4 bg-[#142B46]/80 rounded-xl border border-[#2EAD72]/30">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2EAD72]" />
              <span>{t.hero.statsAck}</span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#2EAD72] font-mono tabular-nums">
              {stats.ackRate}%
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Emergency dept sync
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
