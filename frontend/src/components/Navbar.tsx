import React from 'react';
import type { ThemeMode, OperativeUser } from '../types';
import { soundFx } from '../utils/audio';
import { Radio, Volume2, VolumeX, Shield, Skull, LogOut, Terminal, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activeTab: 'login' | 'home';
  setActiveTab: (tab: 'login' | 'home') => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  currentUser: OperativeUser | null;
  setCurrentUser: (user: OperativeUser | null) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  themeMode,
  setThemeMode,
  currentUser,
  setCurrentUser,
  isMuted,
  setIsMuted,
}) => {
  const handleToggleTheme = () => {
    soundFx.playClick();
    const nextMode = themeMode === 'hawkins' ? 'upsidedown' : 'hawkins';
    setThemeMode(nextMode);
  };

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundFx.startAmbient();
      soundFx.playClick();
    }
  };

  const handleNav = (tab: 'login' | 'home') => {
    soundFx.playClick();
    setActiveTab(tab);
  };

  return (
    <header className="relative z-50 w-full bg-[#0a0205]/95 border-b border-[#ff0033]/30 backdrop-blur-md px-3 sm:px-5 py-2.5 sm:py-3 shadow-[0_4px_20px_rgba(255,0,51,0.15)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Top Header Row: Logo & Brand Title */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#ff0033] bg-[#1f040a] flex items-center justify-center text-[#ff0033] shadow-[0_0_12px_rgba(255,0,51,0.5)]">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] text-[#ff4d6d] font-digital font-bold uppercase">
                  NEXUS TERMINAL
                </span>
                <span className="text-[8px] sm:text-[9px] px-1 py-0.2 rounded border border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66] font-digital">
                  v4.1.9
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl stranger-title font-bold tracking-wider leading-none">
                INTO THE UPSIDE DOWN
              </h1>
            </div>
          </div>

          {/* User Codename Badge on Mobile */}
          {currentUser && (
            <div className="md:hidden flex items-center gap-1.5">
              <span className="text-[11px] font-digital text-[#ff3355] font-bold truncate max-w-[100px]">
                {currentUser.codename}
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCurrentUser(null);
                  setActiveTab('login');
                }}
                className="p-1 text-zinc-400 hover:text-[#ff0033]"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Telemetry Bar (Desktop & Mobile Compact Readout) */}
        <div className="flex items-center justify-center gap-3 px-3 py-1 rounded border border-[#ff0033]/20 bg-[#140308]/60 font-digital text-[11px] w-full md:w-auto">
          <div className="flex items-center gap-1 text-zinc-300">
            <span className="text-zinc-500">TEAM:</span>
            <span className="text-[#ff3355] font-bold tracking-widest">NX7Q</span>
          </div>
          <div className="h-3 w-[1px] bg-[#ff0033]/30" />
          <div className="flex items-center gap-1 text-[#00ff66]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping" />
            <span>STABLE</span>
          </div>
          <div className="h-3 w-[1px] bg-[#ff0033]/30" />
          <div className="text-zinc-400">
            <span className="text-amber-400 font-bold">14.235 MHz</span>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 flex-wrap justify-center w-full md:w-auto">
          {/* Dual Mode Switcher */}
          <button
            onClick={handleToggleTheme}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded border text-[11px] font-digital font-bold uppercase transition-all duration-300 flex items-center gap-1.5 ${
              themeMode === 'upsidedown'
                ? 'border-[#ff0033] bg-[#33000b] text-[#ff3355] shadow-[0_0_15px_rgba(255,0,51,0.6)]'
                : 'border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-[#ff0033]/60 hover:text-[#ff3355]'
            }`}
            title="Toggle Hawkins / Upside Down Mode"
          >
            {themeMode === 'upsidedown' ? (
              <>
                <Skull className="w-3.5 h-3.5 text-[#ff0033] animate-spin" style={{ animationDuration: '8s' }} />
                <span>UPSIDE DOWN</span>
              </>
            ) : (
              <>
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                <span>HAWKINS WORLD</span>
              </>
            )}
          </button>

          {/* Sound Ambient Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 sm:p-2 rounded border border-[#ff0033]/30 bg-[#150308] text-[#ff4d6d] hover:bg-[#2b0510] hover:text-[#ff0033] transition-colors"
            title={isMuted ? 'Enable Ambient Synth & Sound Effects' : 'Mute Sound Effects'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
          </button>

          {/* Nav Tabs */}
          <button
            onClick={() => handleNav('login')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded text-[11px] font-digital font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-[#ff0033] text-white shadow-[0_0_12px_rgba(255,0,51,0.6)]'
                : 'border border-[#ff0033]/30 bg-[#120308] text-zinc-300 hover:border-[#ff0033]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>LOGIN</span>
          </button>

          <button
            onClick={() => handleNav('home')}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded text-[11px] font-digital font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'home'
                ? 'bg-[#ff0033] text-white shadow-[0_0_12px_rgba(255,0,51,0.6)]'
                : 'border border-[#ff0033]/30 bg-[#120308] text-zinc-300 hover:border-[#ff0033]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>HOME HUB</span>
          </button>

          {/* Current Logged User on Desktop */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[#ff0033]/30">
              <span className="text-xs font-digital text-[#ff3355] uppercase">
                {currentUser.codename}
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCurrentUser(null);
                  setActiveTab('login');
                }}
                className="p-1.5 text-zinc-400 hover:text-[#ff0033] transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
