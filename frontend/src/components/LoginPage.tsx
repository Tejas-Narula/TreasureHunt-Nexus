import React, { useState } from 'react';
import type { OperativeUser } from '../types';
import { soundFx } from '../utils/audio';
import { Users, Lock, Eye, EyeOff, Key, AlertTriangle, Cpu, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: OperativeUser) => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [teamName, setTeamName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const executeLogin = async (targetTeamId: string, phone: string) => {
    soundFx.playClick();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/player/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: targetTeamId.trim(), phone_number: phone.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      soundFx.playAccessGranted();
      const userObj: OperativeUser = {
        agentId: data.member.id.substring(0, 8),
        codename: data.member.player_name.toUpperCase(),
        clearance: data.member.character_role?.toUpperCase() || 'OPERATIVE',
        teamId: data.team.team_id,
        teamDocId: data.team.id,
        playerId: data.member.id,
        phoneNumber: data.member.phone_number,
      };

      setSuccessMsg(`CLEARANCE GRANTED FOR ${data.team.team_name.toUpperCase()}! ENTERING HAWKINS...`);

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(userObj);
        onNavigateHome();
      }, 900);
    } catch (err: any) {
      soundFx.playAccessDenied();
      setErrorMsg(`CLEARANCE DENIED: ${err.message.toUpperCase()}`);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(teamName, phoneNumber);
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-black flex flex-col justify-center items-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden touch-manipulation select-none">
      
      {/* Back Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onNavigateHome();
        }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50 p-2 sm:p-2.5 flex items-center gap-2 rounded-lg border border-[#ff0033]/30 bg-[#090205]/80 text-zinc-400 hover:bg-[#ff0033]/20 hover:text-[#ff3355] transition-all duration-300 font-digital text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(255,0,51,0.15)] hover:shadow-[0_0_20px_rgba(255,0,51,0.4)]"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">BACK</span>
      </button>

      {/* Centered Form Container */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto">
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4 sm:space-y-6 bg-[#090205]/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-[#ff0033]/50 shadow-[0_0_40px_rgba(255,0,51,0.45)] hover:border-[#ff0033]/80 hover:shadow-[0_0_55px_rgba(255,0,51,0.65)] transition-all duration-500"
        >
          {/* Section Title Header: — ENTER HAWKINS — with dot line accents matching reference */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 font-digital text-[#ff3355] tracking-widest text-sm sm:text-lg font-bold uppercase drop-shadow-[0_0_12px_#ff0033] mb-4">
            <span className="w-8 sm:w-12 h-[1px] bg-[#ff0033]/70 relative flex items-center justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] shadow-[0_0_6px_#ff0033]" />
            </span>
            <span className="hover:text-white transition-colors cursor-default tracking-[0.25em]">LOGIN TO NEXUS</span>
            <span className="w-8 sm:w-12 h-[1px] bg-[#ff0033]/70 relative flex items-center justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] shadow-[0_0_6px_#ff0033]" />
            </span>
          </div>
          
          {/* Team Name Input */}
          <div className="relative group">
            <Users className="absolute left-4 sm:left-5 top-4 w-5 h-5 text-zinc-400 group-hover:text-[#ff3355] group-focus-within:text-[#ff0033] transition-colors" />
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full pl-12 sm:pl-14 pr-4 py-3.5 bg-[#0d0206]/95 border border-[#ff0033]/60 focus:border-[#ff0033] hover:border-[#ff0033] rounded-lg text-white font-digital tracking-widest text-[16px] placeholder-zinc-500 outline-none transition-all duration-300 shadow-[inset_0_0_10px_rgba(255,0,51,0.08)] hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] focus:shadow-[0_0_25px_rgba(255,0,51,0.7)]"
              placeholder="TEAM ID (e.g. T1)"
              autoFocus
            />
          </div>

          {/* Phone Number Input */}
          <div className="relative group">
            <Lock className="absolute left-4 sm:left-5 top-4 w-5 h-5 text-[#ff0033]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3.5 bg-[#0d0206]/95 border border-[#ff0033]/60 focus:border-[#ff0033] hover:border-[#ff0033] rounded-lg text-white font-digital tracking-widest text-[16px] placeholder-zinc-500 outline-none transition-all duration-300 shadow-[inset_0_0_10px_rgba(255,0,51,0.08)] hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] focus:shadow-[0_0_25px_rgba(255,0,51,0.7)]"
              placeholder="PHONE NUMBER"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 sm:right-5 top-4 text-zinc-400 hover:text-[#ff0033] hover:scale-125 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded border border-red-500/50 bg-red-950/90 text-red-300 font-digital text-[12px] sm:text-[13px] flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded border border-[#00ff66]/50 bg-[#00ff66]/10 text-[#00ff66] font-digital text-[12px] sm:text-[13px] flex items-center gap-2">
              <Key className="w-4 h-4 shrink-0 animate-spin" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[56px] py-4 rounded-lg border border-[#ff0033] bg-[#ff0033]/20 hover:bg-[#ff0033] active:bg-[#e6002e] text-[#ff3355] hover:text-white font-digital font-bold text-lg sm:text-xl tracking-widest hover:tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,0,51,0.5)] hover:shadow-[0_0_35px_rgba(255,0,51,0.9)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-6 h-6 animate-spin" />
                CONNECTING...
              </span>
            ) : (
              <span>ACCESS NEXUS</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
