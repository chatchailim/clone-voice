import React from 'react';
import { Sparkles, ShieldCheck, Waves, Terminal, Mic2, Cpu, Volume2, HelpCircle } from 'lucide-react';
import { VoiceProfile } from '../types';

interface NavbarProps {
  activeTab: 'clone' | 'tts' | 'spectrum' | 'code';
  setActiveTab: (tab: 'clone' | 'tts' | 'spectrum' | 'code') => void;
  activeVoice: VoiceProfile | null;
  serverReady: boolean;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeVoice,
  serverReady,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Gemini 3.8 Flash TTS
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Voice Replication
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Speaker Verification &bull; Stage Directions &bull; SynthID Watermarked
              </p>
            </div>
          </div>

          {/* Quick specs / Status pill & Help Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400">Model:</span>
              <span className="font-mono font-semibold text-slate-200">gemini-3.8-flash-tts</span>
            </div>

            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>SynthID &amp; C2PA</span>
            </div>

            {activeVoice && (
              <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[130px] font-medium">{activeVoice.name.split('(')[0]}</span>
              </div>
            )}

            {/* Help & Guide Button */}
            <button
              onClick={onOpenHelp}
              className="flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-500/20 hover:from-blue-600/30 hover:to-cyan-500/30 border border-blue-500/40 text-xs font-semibold text-cyan-300 hover:text-white transition-all shadow-sm cursor-pointer hover:scale-[1.02]"
              title="เปิดคู่มือการใช้งานและผังการทำงานของระบบ"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span className="hidden xs:inline">คู่มือและวิธีใช้</span>
              <span className="xs:hidden">วิธีใช้</span>
              <span className="hidden sm:inline font-mono text-[10px] bg-blue-500/20 px-1 rounded text-cyan-200">Help</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none border-t border-slate-800/40">
          <button
            onClick={() => setActiveTab('clone')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'clone'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            <span>1. โคลนและตรวจสอบเสียง (Voice Clone &amp; Consent)</span>
          </button>

          <button
            onClick={() => setActiveTab('tts')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'tts'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. สตูดิโอสังเคราะห์เสียง (Speech &amp; Stage Directions)</span>
          </button>

          <button
            onClick={() => setActiveTab('spectrum')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'spectrum'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>3. สเปกตรัม &amp; ลายน้ำ SynthID (Audio &amp; Watermark)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'code'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>4. โค้ดตัวอย่าง &amp; API (Python &amp; Node.js SDK)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
