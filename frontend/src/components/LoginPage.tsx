import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { OperativeUser } from '../types';
import { soundFx } from '../utils/audio';
import { Users, Lock, Eye, EyeOff, Key, AlertTriangle, Cpu } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: OperativeUser) => void;
  onNavigateHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const executeLogin = (targetTeamName: string) => {
    soundFx.playClick();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (!targetTeamName.trim()) {
        soundFx.playAccessDenied();
        setErrorMsg('CLEARANCE DENIED: TEAM NAME REQUIRED');
        setIsLoading(false);
        return;
      }

      // Successful login
      soundFx.playAccessGranted();
      const userObj: OperativeUser = {
        agentId: 'NX7Q',
        codename: targetTeamName.trim().toUpperCase(),
        clearance: 'OPERATIVE TEAM',
      };

      setSuccessMsg(`CLEARANCE GRANTED FOR ${targetTeamName.trim().toUpperCase()}! ENTERING HAWKINS...`);

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(userObj);
        onNavigateHome();
      }, 900);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(teamName || 'TEAM NEXUS');
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#070204] flex flex-col justify-between items-center p-3 sm:p-6 overflow-y-auto overflow-x-hidden touch-manipulation select-none">
      
      {/* 
        Full Poster Background Image 
        100% clean poster image rendering bright and full-screen!
      */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed inset-0 bg-contain sm:bg-cover bg-top sm:bg-center bg-no-repeat z-0 bg-[#070204] pointer-events-none filter brightness-[1.15] contrast-[1.1] saturate-[1.2]"
        style={{ backgroundImage: `url('/poster.jpg')` }}
      />
      
      {/* Soft ambient vignette overlay */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#070204] via-[#070204]/40 to-transparent z-0 pointer-events-none" />

      {/* Flexible Top Spacer to frame top logos, Stranger Things title, and moon artwork perfectly */}
      <div className="h-56 sm:h-72 md:h-[380px] w-full z-10 shrink-0 pointer-events-none" />

      {/* 
        EXACT INTERACTIVE FORM CARD 
        Matching the reference layout image directly below the moon artwork!
      */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 110 }}
        className="relative z-10 w-full max-w-[340px] sm:max-w-md mx-auto space-y-3 sm:space-y-4 my-auto shrink-0 pb-4"
      >
        
        {/* Section Title Header: — ENTER HAWKINS — with dot line accents matching reference */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 font-digital text-[#ff3355] tracking-widest text-xs sm:text-base font-bold uppercase drop-shadow-[0_0_12px_#ff0033]">
          <span className="w-8 sm:w-12 h-[1px] bg-[#ff0033]/70 relative flex items-center justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] shadow-[0_0_6px_#ff0033]" />
          </span>
          <span className="hover:text-white transition-colors cursor-default tracking-[0.25em]">ENTER HAWKINS</span>
          <span className="w-8 sm:w-12 h-[1px] bg-[#ff0033]/70 relative flex items-center justify-start">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff0033] shadow-[0_0_6px_#ff0033]" />
          </span>
        </div>

        {/* Form Container */}
        <form 
          onSubmit={handleSubmit} 
          className="space-y-3 sm:space-y-4 bg-[#090205]/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-[#ff0033]/50 shadow-[0_0_40px_rgba(255,0,51,0.45)] hover:border-[#ff0033]/80 hover:shadow-[0_0_55px_rgba(255,0,51,0.65)] transition-all duration-500"
        >
          
          {/* Team Name Input */}
          <div className="relative group">
            <Users className="absolute left-3.5 sm:left-4 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-[#ff3355] group-focus-within:text-[#ff0033] transition-colors" />
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-3 bg-[#0d0206]/95 border border-[#ff0033]/50 focus:border-[#ff0033] hover:border-[#ff0033] rounded-lg text-white font-digital tracking-widest text-[16px] placeholder-zinc-500 outline-none transition-all duration-300 shadow-[inset_0_0_10px_rgba(255,0,51,0.08)] hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] focus:shadow-[0_0_25px_rgba(255,0,51,0.7)]"
              placeholder="TEAM NAME"
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <Lock className="absolute left-3.5 sm:left-4 top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 group-hover:text-[#ff3355] group-focus-within:text-[#ff0033] transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-11 sm:pr-12 py-3 bg-[#0d0206]/95 border border-[#ff0033]/50 focus:border-[#ff0033] hover:border-[#ff0033] rounded-lg text-white font-digital tracking-widest text-[16px] placeholder-zinc-500 outline-none transition-all duration-300 shadow-[inset_0_0_10px_rgba(255,0,51,0.08)] hover:shadow-[0_0_20px_rgba(255,0,51,0.4)] focus:shadow-[0_0_25px_rgba(255,0,51,0.7)]"
              placeholder="PASSWORD"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 sm:right-4 top-3.5 text-zinc-400 hover:text-[#ff0033] hover:scale-125 active:scale-95 transition-all duration-200 p-1 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

          {/* Alert Banners */}
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

          {/* ENTER HAWKINS Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[48px] py-3 rounded-lg border border-[#ff0033] bg-[#ff0033]/20 hover:bg-[#ff0033] active:bg-[#e6002e] text-[#ff3355] hover:text-white font-digital font-bold text-base sm:text-lg tracking-widest hover:tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,0,51,0.5)] hover:shadow-[0_0_35px_rgba(255,0,51,0.9)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
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
      </motion.div>

      <div className="h-2 w-full z-10 shrink-0 pointer-events-none" />
    </div>
  );
};
