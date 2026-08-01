import React, { useState } from 'react';
import type { OperativeUser } from '../types';
import { soundFx } from '../utils/audio';
import { Users, Lock, Eye, EyeOff, Atom, Key, AlertTriangle, Cpu } from 'lucide-react';

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
    <div className="relative min-h-[100dvh] w-full bg-[#070204] flex flex-col justify-between items-center p-3 sm:p-6 overflow-y-auto overflow-x-hidden touch-manipulation select-none">
      {/* 
        Full Poster Background Image 
        Using bg-contain on mobile & bg-top bg-no-repeat so NEXUS logo (top left) 
        and MANIPAL UNIVERSITY JAIPUR logo (top right) are 100% inside the viewport frame!
      */}
      <div 
        className="fixed inset-0 bg-contain sm:bg-cover bg-top sm:bg-center bg-no-repeat z-0 bg-[#070204]"
        style={{ backgroundImage: `url('/poster.jpg')` }}
      />
      
      {/* Ambient dark bottom vignette gradient overlay to enhance text readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#070204] via-[#070204]/40 to-transparent z-0 pointer-events-none" />

      {/* Flexible top spacer so top logos and Stranger Things artwork remain framed */}
      <div className="h-44 sm:h-56 md:h-64 w-full z-10 shrink-0 pointer-events-none" />

      {/* Interactive Form Card matching the exact poster design */}
      <div className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto space-y-3 sm:space-y-4 my-auto shrink-0 pb-4">
        
        {/* Section Title Header: — ENTER HAWKINS — */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 font-digital text-[#ff3355] tracking-widest text-xs sm:text-base font-bold uppercase drop-shadow-[0_0_12px_#ff0033]">
          <span className="w-6 sm:w-8 h-[1px] bg-[#ff0033]/70" />
          <span>ENTER HAWKINS</span>
          <span className="w-6 sm:w-8 h-[1px] bg-[#ff0033]/70" />
        </div>

        {/* Form Container */}
        <form 
          onSubmit={handleSubmit} 
          className="space-y-3 sm:space-y-4 bg-[#090205]/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-[#ff0033]/50 shadow-[0_0_40px_rgba(255,0,51,0.45)]"
        >
          
          {/* Team Name Input (16px font prevents iOS auto-zoom) */}
          <div className="relative">
            <Users className="absolute left-3.5 sm:left-4 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[#ff0033]" />
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-[#0d0206]/95 border border-[#ff0033]/60 focus:border-[#ff0033] rounded-lg text-white font-digital tracking-widest text-[16px] placeholder-zinc-500 outline-none transition-all shadow-[inset_0_0_10px_rgba(255,0,51,0.1)] focus:shadow-[0_0_15px_rgba(255,0,51,0.6)]"
              placeholder="TEAM ID (e.g. T1)"
              autoFocus
            />
          </div>

          {/* Phone Number Input (16px font prevents iOS auto-zoom) */}
          <div className="relative">
            <Lock className="absolute left-3.5 sm:left-4 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-[#ff0033]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-11 sm:pr-12 py-3 bg-[#0d0206]/95 border border-[#ff0033]/60 focus:border-[#ff0033] rounded-lg text-white font-digital tracking-widest text-[16px] placeholder-zinc-500 outline-none transition-all shadow-[inset_0_0_10px_rgba(255,0,51,0.1)] focus:shadow-[0_0_15px_rgba(255,0,51,0.6)]"
              placeholder="PHONE NUMBER"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 sm:right-4 top-3.5 text-zinc-400 hover:text-[#ff0033] transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-2.5 sm:p-3 rounded border border-red-500/50 bg-red-950/90 text-red-300 font-digital text-[11px] sm:text-xs flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 sm:p-3 rounded border border-[#00ff66]/50 bg-[#00ff66]/10 text-[#00ff66] font-digital text-[11px] sm:text-xs flex items-center gap-2">
              <Key className="w-4 h-4 shrink-0 animate-spin" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ENTER HAWKINS Primary Mobile Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3 rounded-xl border-2 border-[#ff0033] bg-[#ff0033]/25 active:bg-[#ff0033] hover:bg-[#ff0033] text-white font-digital font-bold text-base sm:text-lg tracking-widest uppercase transition-all duration-200 shadow-[0_0_25px_rgba(255,0,51,0.6)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-5 h-5 animate-spin" />
                CONNECTING...
              </span>
            ) : (
              <span>ENTER HAWKINS</span>
            )}
          </button>
        </form>

        {/* Bottom Atom / D&D Icon matching poster design */}
        <div className="flex justify-center pt-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#ff0033]/50 bg-[#120308]/90 flex items-center justify-center text-[#ff0033] shadow-[0_0_12px_rgba(255,0,51,0.5)]">
            <Atom className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
        </div>

      </div>

      <div className="h-2 w-full z-10 shrink-0 pointer-events-none" />
    </div>
  );
};
