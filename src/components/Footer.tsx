import React from 'react';
import { ShieldAlert, PhoneCall, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations/index.ts';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="bg-[#071426] border-t border-[#1A365D] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#10233C] border border-[#268BFF]/40 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-[#268BFF]" />
              </div>
              <span className="text-lg font-extrabold text-white font-mono tracking-wider">
                GUARDIA
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              "{t.tagline}"
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unified national emergency intelligence, disaster monitoring and response coordination platform for India.
            </p>
          </div>

          {/* National Helplines Col */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-slate-200 font-bold tracking-wider">
              National Emergency Helplines
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              <li className="flex justify-between">
                <span className="text-slate-400">Unified Emergency:</span>
                <span className="font-bold text-[#E63946]">112</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Medical EMS:</span>
                <span className="font-bold text-emerald-400">108</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Fire & Rescue:</span>
                <span className="font-bold text-orange-400">101</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Police Command:</span>
                <span className="font-bold text-sky-400">100</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400">Disaster NDMA:</span>
                <span className="font-bold text-amber-400">1070</span>
              </li>
            </ul>
          </div>

          {/* Architecture & Innovations */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-slate-200 font-bold tracking-wider">
              Core Innovations
            </div>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>• LIFE-FIRST: 8-Factor Human Prioritisation</li>
              <li>• Dynamic Priority Escalation Engine</li>
              <li>• CRISIS PULSE: Geospatial Cluster Detection</li>
              <li>• RESCUE BRIDGE: Multi-Agency Sync</li>
              <li>• Anti-Duplicate Incident Correlation</li>
              <li>• Offline Draft Resilient Submission</li>
            </ul>
          </div>

          {/* Privacy & Prototype Disclaimer */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase text-slate-200 font-bold tracking-wider">
              Compliance & Safety
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demonstration prototype built with simulated incident telemetry. Citizen contact information is strictly compartmentalized and never exposed publicly.
            </p>
            <div className="text-[10px] text-slate-500 font-mono">
              Designed for Hackathon & Public Safety Demonstration
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-6 border-t border-[#1A365D] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} GUARDIA Emergency Response Ecosystem. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Tamil & English Multilingual Support</span>
            <span>·</span>
            <span>Web Accessibility AA Compliant</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
