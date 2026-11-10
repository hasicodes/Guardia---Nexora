import React from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Flame, 
  Radio, 
  Users, 
  BarChart3, 
  Layers, 
  Sun, 
  Moon, 
  Languages, 
  UserCircle2, 
  Search,
  Bell
} from 'lucide-react';
import { User } from '../types/index.ts';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  onOpenReportModal: () => void;
  onOpenTrackerModal: () => void;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  onOpenSosModal: () => void;
  unreadNotificationsCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onSelectPersona: (role: 'citizen' | 'admin' | 'department', dept?: 'police' | 'fire' | 'ambulance') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenReportModal,
  onOpenTrackerModal,
  onOpenAuthModal,
  onOpenNotifications,
  onOpenSosModal,
  unreadNotificationsCount,
  isDarkMode,
  onToggleTheme,
  language,
  onToggleLanguage,
  onSelectPersona
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#071426]/95 dark:bg-[#071426]/95 backdrop-blur-md border-b border-[#1A365D] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setCurrentTab('overview')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#10233C] border border-[#268BFF]/40 flex items-center justify-center shadow-lg shadow-[#268BFF]/10 group-hover:border-[#268BFF] transition-colors">
              <ShieldAlert className="w-5 h-5 text-[#268BFF]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-wider text-white font-mono flex items-center gap-1.5">
                GUARDIA
                <span className="w-1.5 h-1.5 rounded-full bg-[#268BFF]"></span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Scrollable on smaller viewports, clean underline indicator) */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-300 overflow-x-auto py-1 max-w-[55%]">
          {[
            { id: 'overview', label: t.nav.overview },
            { id: 'map', label: t.nav.map },
            { id: 'lifeFirst', label: t.nav.lifeFirst },
            { id: 'incidents', label: t.nav.incidents },
            { id: 'teams', label: t.nav.teams || 'Response Teams' },
            { id: 'familyLink', label: t.nav.familyLink || 'Family Link' },
            { id: 'finder', label: t.nav.finder || 'Finder' },
            { id: 'realityCheck', label: t.nav.realityCheck || 'Reality Check' },
            { id: 'rescueBridge', label: t.nav.rescueBridge },
            { id: 'crisisPulse', label: t.nav.crisisPulse },
            { id: 'resources', label: t.nav.resources },
            { id: 'analytics', label: t.nav.analytics }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`whitespace-nowrap transition-colors py-1 hover:text-white px-1 ${
                currentTab === item.id ? 'text-[#268BFF] font-bold border-b-2 border-[#268BFF]' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Language, Theme, Alerts, Persona, Primary CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Quick Track Report */}
          <button
            onClick={onOpenTrackerModal}
            title={t.hero.trackBtn}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#10233C] border border-[#1A365D] rounded-lg transition-colors whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5 text-[#268BFF]" />
            <span>{t.nav.trackReport}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            title="Switch Language / மொழியை மாற்றுக"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#10233C] border border-[#1A365D] rounded-lg transition-colors whitespace-nowrap"
          >
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            className="p-2 text-slate-300 hover:text-white bg-[#10233C] border border-[#1A365D] rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            title="Alerts Center"
            className="relative p-2 text-slate-300 hover:text-white bg-[#10233C] border border-[#1A365D] rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E63946] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Active User / Persona Selector */}
          <div className="relative group">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#10233C] border border-[#268BFF]/40 rounded-lg hover:border-[#268BFF] transition-colors whitespace-nowrap"
            >
              <UserCircle2 className="w-4 h-4 text-[#268BFF]" />
              <span className="max-w-[110px] truncate">{currentUser.name}</span>
              <span className="text-[10px] font-mono text-[#268BFF] uppercase">
                [{currentUser.role === 'department' ? currentUser.department : currentUser.role}]
              </span>
            </button>
          </div>

          {/* SOS NOW Urgent Trigger Button */}
          <button
            onClick={onOpenSosModal}
            title="Trigger High-Priority SOS"
            className="px-3.5 py-2 text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg shadow-lg shadow-red-600/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 animate-pulse"
          >
            <Radio className="w-4 h-4 text-white" />
            <span>SOS NOW</span>
          </button>

          {/* Primary CTA: Report Emergency */}
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 text-xs font-bold text-white bg-[#142B46] hover:bg-[#1D3A5F] border border-[#268BFF]/40 hover:border-[#268BFF] rounded-lg shadow transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-[#268BFF]" />
            <span>{t.nav.reportEmergency}</span>
          </button>

        </div>
      </div>
    </header>
  );
};
