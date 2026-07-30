import React, { useState, useEffect } from 'react';
import type { OperativeUser, MapSector, MissionStats } from '../types';
import { soundFx } from '../utils/audio';
import { 
  Radio, 
  Play, 
  Pause, 
  QrCode, 
  Lock, 
  Unlock, 
  Trophy, 
  Skull, 
  RadioTower, 
  Compass, 
  Share2,
  FileText
} from 'lucide-react';

interface HomePageProps {
  currentUser: OperativeUser | null;
  onNavigateLogin: () => void;
}

const INITIAL_SECTORS: MapSector[] = [
  {
    id: 'lab',
    name: 'HAWKINS NATIONAL LAB',
    coordinates: 'SECTOR 01',
    status: 'unlocked',
    description: 'Dr. Brenner\'s primary research facility. Massive rift energy detected in basement level 4.',
    clueHint: 'Look for tape cassette #01 in the magnetic room.',
    x: 25,
    y: 35,
  },
  {
    id: 'castle',
    name: 'CASTLE BYERS',
    coordinates: 'SECTOR 02',
    status: 'unlocked',
    description: 'Will\'s fort in Mirkwood forest. Transmission node for the Upside Down frequency.',
    clueHint: 'Morse code reads: 11-15-21-19-05.',
    x: 48,
    y: 28,
  },
  {
    id: 'starcourt',
    name: 'STARCOURT MALL',
    coordinates: 'SECTOR 03',
    status: 'corrupted',
    description: 'Russian underground bunker hidden beneath the food court.',
    clueHint: 'Requires security clearance code from Chief Hopper.',
    x: 65,
    y: 55,
  },
  {
    id: 'creel',
    name: 'CREEL HOUSE',
    coordinates: 'SECTOR 04',
    status: 'locked',
    description: 'The origin point of Vecna\'s curse. Grandfather clock chimes at 4:00.',
    clueHint: 'Solve the pendulum puzzle to unlock.',
    x: 35,
    y: 70,
  },
  {
    id: 'gate',
    name: 'THE MIND LAIR (THE GATE)',
    coordinates: 'SECTOR 05 - FINAL BOSS',
    status: 'locked',
    description: 'The core nexus connecting Hawkins to the Mind Flayer.',
    clueHint: 'Assemble all 7 clue fragments to open.',
    x: 78,
    y: 78,
  },
];

const INITIAL_STATS: MissionStats = {
  timeTaken: '2h 15m',
  finalScore: 8750,
  cluesSolved: 7,
  totalClues: 7,
  sporesSecured: 1200,
  riftsClosed: 3,
  soulsSaved: 15,
};

export const HomePage: React.FC<HomePageProps> = ({ currentUser }) => {
  // Countdown Timer state
  const [secondsLeft, setSecondsLeft] = useState(1727); // 28m 47s
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState('K _ _ _   S _ _ _');
  const [isFullyDecoded, setIsFullyDecoded] = useState(false);

  // D&D Map Selected Sector
  const [selectedSector, setSelectedSector] = useState<MapSector | null>(INITIAL_SECTORS[0]);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeClueTab, setActiveClueTab] = useState<'clue' | 'notes' | 'hints'>('clue');

  // Countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = () => {
    soundFx.playRadioStatic();
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleDecodeMessage = () => {
    soundFx.playClick();
    if (!isFullyDecoded) {
      setDecodedMessage('KEEP STAY BY THE RADIO');
      setIsFullyDecoded(true);
      soundFx.playAccessGranted();
    }
  };

  const handleSelectSector = (sec: MapSector) => {
    soundFx.playClick();
    setSelectedSector(sec);
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] p-3 sm:p-5 max-w-7xl mx-auto space-y-4 sm:space-y-6 overflow-x-hidden">
      
      {/* 1. Hero Title & Mission Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Hero Section Banner */}
        <div className="lg:col-span-8 nexus-panel p-4 sm:p-6 border-l-4 border-l-[#ff0033] flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 font-digital text-[11px] sm:text-xs text-[#ff4d6d] uppercase tracking-widest mb-1">
              <RadioTower className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff0033] animate-pulse" />
              <span>NEXUS OPERATIVE DASHBOARD</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl stranger-title font-extrabold tracking-wider leading-none mb-2 sm:mb-3">
              INTO THE UPSIDE DOWN
            </h1>

            <p className="font-digital text-zinc-300 text-xs sm:text-base max-w-2xl">
              HAWKINS, INDIANA • AUTHORIZED OPERATIVE TERMINAL. 
              {currentUser ? (
                <span> WELCOME BACK, <strong className="text-[#ff3355]">{currentUser.codename}</strong> [{currentUser.clearance}].</span>
              ) : (
                <span> STAY SHARP. TRUST NO ONE. THE UPSIDE DOWN IS CLOSER THAN YOU THINK.</span>
              )}
            </p>
          </div>

          {/* Connection Status Box matching Reference Design */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#ff0033]/20 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 rounded border border-[#ff0033]/30 bg-[#120307]/80 font-digital text-xs space-y-1">
              <div className="text-zinc-400">CONNECTED TO:</div>
              <div className="text-sm sm:text-base text-[#ff3355] font-bold tracking-widest">TEAM NEXUS</div>
              <div className="flex items-center gap-1.5 text-[#00ff66] text-[10px] sm:text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping" />
                <span>TEAM CODE: NX7Q • CONNECTION STABLE</span>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="p-3 rounded border border-[#ff0033]/30 bg-[#120307]/80 font-digital text-xs space-y-1 text-center sm:text-left">
              <div className="text-zinc-400 uppercase tracking-wider text-[10px] sm:text-xs">STATUS: WAITING FOR MISSION...</div>
              <div className="text-[11px] text-[#ff4d6d]">MISSION STARTS IN</div>
              <div className="text-xl sm:text-2xl font-bold text-[#ff0033] tracking-widest animate-pulse font-mono">
                {formatCountdown(secondsLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Clue Media Cassettes & Radio Transmission Card */}
        <div className="lg:col-span-4 nexus-panel p-4 sm:p-5 flex flex-col justify-between border-[#ff0033]/40">
          <div>
            <div className="flex items-center justify-between border-b border-[#ff0033]/20 pb-2.5 mb-3 font-digital text-xs">
              <span className="text-[#ff4d6d] font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#ff0033]" />
                <span>CLUE MEDIA & TRANSMISSIONS</span>
              </span>
              <span className="text-amber-400 font-bold">14.235 MHz</span>
            </div>

            {/* Cassette Tapes Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {['TAPE #1', 'TAPE #2', 'TAPE #3'].map((tape, idx) => (
                <button
                  key={idx}
                  onClick={() => soundFx.playRadioStatic()}
                  className="p-1.5 sm:p-2 rounded border border-[#ff0033]/30 bg-[#1a040b] text-center font-digital text-[9px] sm:text-[10px] text-zinc-300 hover:border-[#ff0033] hover:text-[#ff3355] transition-all"
                >
                  <div className="w-full h-4 sm:h-5 bg-zinc-900 rounded border border-[#ff0033]/20 mb-1 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full border border-[#ff0033]" />
                  </div>
                  {tape}
                </button>
              ))}
            </div>

            {/* Clue Tabs (Clue / Notes / Hints) */}
            <div className="flex border-b border-[#ff0033]/30 font-digital text-xs mb-3">
              {(['clue', 'notes', 'hints'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveClueTab(tab);
                  }}
                  className={`flex-1 py-1.5 text-center uppercase tracking-wider transition-colors text-[11px] sm:text-xs ${
                    activeClueTab === tab
                      ? 'bg-[#ff0033] text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Decoded Message Player */}
            <div className="p-3 rounded border border-[#ff0033]/30 bg-black/80 font-digital text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>DECODED MESSAGE</span>
                <span className="text-[10px] text-[#00ff66] animate-pulse">● LIVE</span>
              </div>

              <div className="text-sm sm:text-base text-[#ff0033] font-bold tracking-widest text-center py-2 bg-[#170308] rounded border border-[#ff0033]/20">
                {decodedMessage}
              </div>

              {/* Waveform Equalizer */}
              <div className="flex justify-between items-end h-5 sm:h-6 gap-1 px-1.5 py-1 bg-zinc-950 rounded">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t transition-all ${
                      isPlayingAudio ? 'bg-[#ff0033] eq-bar' : 'bg-[#ff0033]/30 h-1'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  onClick={handlePlayAudio}
                  className="px-2.5 py-1 rounded bg-[#ff0033] text-white text-[11px] font-bold hover:bg-[#ff3355] flex items-center gap-1 shrink-0"
                >
                  {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlayingAudio ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button
                  onClick={handleDecodeMessage}
                  disabled={isFullyDecoded}
                  className={`text-[11px] px-2 py-1 rounded border shrink-0 ${
                    isFullyDecoded 
                      ? 'border-zinc-700 text-zinc-500 cursor-default'
                      : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  {isFullyDecoded ? 'DECODED' : 'DECODE'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#ff0033]/20 text-[10px] font-digital text-zinc-500 text-center">
            OPERATIVE NOTE: TRUST NO ONE. THE MIND LAIR REMEMBERS...
          </div>
        </div>

      </div>

      {/* 2. Will's D&D Interactive Map & QR Code Scanner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Will's D&D Map Parchment Section */}
        <div className="lg:col-span-8 nexus-panel p-4 sm:p-5 border-[#ff0033]/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#ff0033]/30 pb-3 mb-3 gap-2 font-digital text-xs">
            <span className="text-white font-bold tracking-wider uppercase flex items-center gap-2 text-xs sm:text-sm">
              <Compass className="w-4 h-4 text-[#ff0033]" />
              <span>PROGRESS TRACKER • WILL'S D&D MAP</span>
            </span>
            <button
              onClick={() => {
                soundFx.playClick();
                setShowQrModal(true);
              }}
              className="w-full sm:w-auto px-3 py-1.5 rounded bg-[#ff0033] text-white text-xs font-bold hover:bg-[#ff3355] flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(255,0,51,0.5)] cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>SCAN NEXT QR CODE</span>
            </button>
          </div>

          {/* Styled D&D Map Container */}
          <div className="dnd-parchment rounded-lg p-4 sm:p-6 min-h-[320px] sm:min-h-[380px] relative overflow-hidden flex flex-col justify-between">
            {/* Title Header on Parchment */}
            <div className="text-center font-stranger font-bold text-lg sm:text-2xl text-[#3b200b] border-b border-[#633a18]/40 pb-2 mb-3 tracking-wider sm:tracking-widest">
              WILL'S D&D MAP OF HAWKINS
            </div>

            {/* Interactive Map Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 relative z-10">
              {INITIAL_SECTORS.map((sector) => {
                const isSelected = selectedSector?.id === sector.id;
                return (
                  <button
                    key={sector.id}
                    onClick={() => handleSelectSector(sector)}
                    className={`p-2.5 sm:p-3 rounded border text-left font-digital transition-all ${
                      isSelected
                        ? 'bg-[#2b1606] text-amber-200 border-amber-600 shadow-md ring-2 ring-amber-500/50 scale-[1.02]'
                        : sector.status === 'unlocked'
                        ? 'bg-[#d1bb92] text-[#2c1a0c] border-[#8a5d33] hover:bg-[#e0cc9f]'
                        : sector.status === 'corrupted'
                        ? 'bg-[#3d0e16] text-red-200 border-red-800 hover:bg-[#4a121c]'
                        : 'bg-[#b8a074]/60 text-zinc-700 border-zinc-500/40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                        {sector.coordinates}
                      </span>
                      {sector.status === 'unlocked' && <Unlock className="w-3.5 h-3.5 text-emerald-700" />}
                      {sector.status === 'corrupted' && <Skull className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
                      {sector.status === 'locked' && <Lock className="w-3.5 h-3.5 text-zinc-600" />}
                    </div>
                    <div className="font-bold text-xs truncate">
                      {sector.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Sector Details Box */}
            {selectedSector && (
              <div className="mt-3 p-3 sm:p-4 rounded bg-[#211005] border border-[#5e3514] text-amber-100 font-digital text-xs space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold border-b border-[#5e3514] pb-1 text-xs">
                  <span className="truncate">{selectedSector.name}</span>
                  <span className="uppercase text-[10px] text-emerald-400 shrink-0">{selectedSector.status}</span>
                </div>
                <p className="text-zinc-300 pt-1 text-[11px] sm:text-xs">{selectedSector.description}</p>
                {selectedSector.clueHint && (
                  <div className="text-amber-300 text-[10px] sm:text-[11px] pt-1">
                    💡 CLUE HINT: {selectedSector.clueHint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Final Mission Review Statistics Card matching Reference Design */}
        <div className="lg:col-span-4 nexus-panel p-4 sm:p-5 border-[#ff0033]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#ff0033]/30 pb-2.5 mb-3 font-digital text-xs">
              <span className="text-[#ff0033] font-bold tracking-wider uppercase flex items-center gap-1.5 text-xs sm:text-sm">
                <Trophy className="w-4 h-4 text-[#ff0033]" />
                <span>FINAL MISSION REVIEW</span>
              </span>
              <span className="text-[#00ff66] text-xs">COMPLETE</span>
            </div>

            {/* Stats Key-Value Table */}
            <div className="space-y-2 font-digital text-xs">
              
              <div className="p-2 sm:p-2.5 rounded border border-[#ff0033]/20 bg-[#140308] flex items-center justify-between">
                <span className="text-zinc-400">TIME TAKEN:</span>
                <span className="text-sm sm:text-base text-amber-400 font-bold">{INITIAL_STATS.timeTaken}</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded border border-[#ff0033]/30 bg-[#1e040c] flex items-center justify-between">
                <span className="text-zinc-400">FINAL SCORE:</span>
                <span className="text-lg sm:text-xl text-[#ff0033] font-bold tracking-widest">{INITIAL_STATS.finalScore.toLocaleString()} PTS</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded border border-[#ff0033]/20 bg-[#140308] flex items-center justify-between">
                <span className="text-zinc-400">CLUES SOLVED:</span>
                <span className="text-sm sm:text-base text-white font-bold">{INITIAL_STATS.cluesSolved} / {INITIAL_STATS.totalClues}</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded border border-[#ff0033]/20 bg-[#140308] flex items-center justify-between">
                <span className="text-zinc-400">SPORES SECURED:</span>
                <span className="text-sm sm:text-base text-[#ff3355] font-bold">{INITIAL_STATS.sporesSecured.toLocaleString()}</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded border border-[#ff0033]/20 bg-[#140308] flex items-center justify-between">
                <span className="text-zinc-400">RIFTS CLOSED:</span>
                <span className="text-sm sm:text-base text-emerald-400 font-bold">{INITIAL_STATS.riftsClosed}</span>
              </div>

              <div className="p-2 sm:p-2.5 rounded border border-[#ff0033]/20 bg-[#140308] flex items-center justify-between">
                <span className="text-zinc-400">SOULS SAVED:</span>
                <span className="text-sm sm:text-base text-purple-400 font-bold">{INITIAL_STATS.soulsSaved}</span>
              </div>

            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowLeaderboard(!showLeaderboard);
              }}
              className="w-full nexus-btn py-2.5 sm:py-3 text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>VIEW LEADERBOARD</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => soundFx.playClick()}
                className="flex-1 nexus-btn-secondary py-2 rounded text-[11px] font-digital font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>MEMORIES</span>
              </button>
              <button
                onClick={() => soundFx.playClick()}
                className="flex-1 nexus-btn-secondary py-2 rounded text-[11px] font-digital font-bold uppercase flex items-center justify-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>SHARE STORY</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Scanner Simulation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm">
          <div className="nexus-panel p-5 max-w-sm sm:max-w-md w-full border-[#ff0033] shadow-[0_0_40px_rgba(255,0,51,0.6)] text-center space-y-3">
            <div className="flex items-center justify-between border-b border-[#ff0033]/30 pb-2">
              <span className="font-digital text-xs sm:text-sm text-[#ff4d6d] font-bold">SCAN NEXT QR CODE</span>
              <button 
                onClick={() => setShowQrModal(false)}
                className="text-zinc-400 hover:text-white font-digital p-1"
              >
                [X]
              </button>
            </div>

            <div className="relative p-5 border-2 border-dashed border-[#ff0033] rounded bg-black flex flex-col items-center justify-center">
              <QrCode className="w-24 h-24 sm:w-32 sm:h-32 text-[#ff0033] animate-pulse" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#00ff66] shadow-[0_0_10px_#00ff66] animate-ping" />
              <span className="font-digital text-[11px] sm:text-xs text-zinc-400 mt-2">ALIGN CAMERA WITH CLUE QR CODE</span>
            </div>

            <button
              onClick={() => {
                soundFx.playAccessGranted();
                setShowQrModal(false);
              }}
              className="w-full nexus-btn py-2.5 text-xs font-bold cursor-pointer"
            >
              SIMULATE SCAN SUCCESS
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="nexus-panel p-5 max-w-md sm:max-w-lg w-full border-[#ff0033] shadow-[0_0_50px_rgba(255,0,51,0.5)] space-y-3">
            <div className="flex items-center justify-between border-b border-[#ff0033]/30 pb-2">
              <span className="font-digital text-sm sm:text-base text-amber-400 font-bold flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>OPERATIVE LEADERBOARD</span>
              </span>
              <button 
                onClick={() => setShowLeaderboard(false)}
                className="text-zinc-400 hover:text-white font-digital p-1"
              >
                [CLOSE]
              </button>
            </div>

            <div className="space-y-2 font-digital text-xs max-h-72 sm:max-h-80 overflow-y-auto pr-1">
              {[
                { rank: 1, name: 'DUSTIN HENDERSON', score: '9,850 PTS', rifts: '4 CLOSED', time: '1h 45m' },
                { rank: 2, name: 'ELEVEN (011)', score: '9,420 PTS', rifts: '4 CLOSED', time: '1h 52m' },
                { rank: 3, name: 'JIM HOPPER', score: '8,750 PTS', rifts: '3 CLOSED', time: '2h 15m' },
                { rank: 4, name: 'NANCY WHEELER', score: '8,100 PTS', rifts: '3 CLOSED', time: '2h 30m' },
                { rank: 5, name: 'STEVE HARRINGTON', score: '7,950 PTS', rifts: '2 CLOSED', time: '2h 42m' },
              ].map((row) => (
                <div key={row.rank} className="p-2.5 rounded border border-[#ff0033]/20 bg-[#160309] flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-[#ff0033]/20 border border-[#ff0033]/40 flex items-center justify-center font-bold text-[#ff3355] text-xs">
                      #{row.rank}
                    </span>
                    <div>
                      <div className="font-bold text-white text-xs">{row.name}</div>
                      <div className="text-[9px] sm:text-[10px] text-zinc-500">{row.rifts} • {row.time}</div>
                    </div>
                  </div>
                  <span className="text-amber-400 font-bold text-xs sm:text-sm">{row.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
