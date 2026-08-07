import { useState, useEffect } from 'react';
import { soundFx } from '../../utils/audio';
import { TransmissionCard } from './components/TransmissionCard';
import { TeamInfoCard } from './components/TeamInfoCard';
import { ProgressCard } from './components/ProgressCard';
import { TrailMapModal } from './components/TrailMapModal';
import { QRScannerModal } from './components/QRScannerModal';
import type { OperativeUser } from '../../types';

interface MissionPageProps {
  onBack?: () => void;
  currentUser: OperativeUser;
}

export function MissionPage({ currentUser }: MissionPageProps) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const [teamData, setTeamData] = useState<any>(null);
  const [trailData, setTrailData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialElapsedSeconds, setInitialElapsedSeconds] = useState(0);

  const fetchGameState = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/player/state`);
      if (res.ok) {
        const data = await res.json();
        if (data.start_time) {
          const startMs = new Date(data.start_time).getTime();
          const diff = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
          setInitialElapsedSeconds(diff);
        }
      }
    } catch (err) {
      console.error('Failed to fetch game state:', err);
    }
  };

  const fetchTeamData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/player/team/${currentUser.teamId}`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token || ''}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTeamData(data.team);
        setTrailData(data.trail);
      }
    } catch (err) {
      console.error('Failed to fetch team data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
    fetchGameState();

    // Listen for live admin overrides or team updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/^https?:\/\//, '')
      : window.location.host;

    const wsUrl = import.meta.env.VITE_API_BASE_URL
      ? `${protocol}//${host}/ws/game`
      : `ws://localhost:8000/ws/game`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'teams_updated' || (data.type === 'team_updated' && data.team_id === currentUser.teamId)) {
          fetchTeamData();
        }
      } catch (err) {
        console.error('Error parsing websocket message:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [currentUser.teamId]);

  const handleOpenMap = () => {
    soundFx.playClick();
    setShowMapModal(true);
  };

  const handleOpenScan = () => {
    soundFx.playClick();
    setShowScanModal(true);
  };

  const handleScan = async (qrText: string) => {
    if (isScanning || scanComplete) return;
    setIsScanning(true);
    setScanError(null);
    soundFx.playClick();

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/player/scan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token || ''}`,
        },
        body: JSON.stringify({
          team_id: currentUser.teamId,
          player_id: currentUser.playerId,
          qr_token: qrText,
        }),
      });

      if (res.ok) {
        soundFx.playAccessGranted();
        setScanComplete(true);
        setTimeout(() => {
          closeModal();
          fetchTeamData(); // Refresh UI to next step
        }, 2000);
      } else {
        soundFx.playAccessDenied();
        const errData = await res.json().catch(() => ({}));
        setScanError(errData.detail || 'INVALID QR CODE');
      }
    } catch (err: any) {
      console.error(err);
      soundFx.playAccessDenied();
      setScanError(err.message || 'CONNECTION ERROR');
    } finally {
      setIsScanning(false);
    }
  };

  const closeModal = () => {
    setShowScanModal(false);
    setScanComplete(false);
    setIsScanning(false);
    setScanError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#070204] flex items-center justify-center">
        <span className="font-digital text-red-500 animate-pulse">LOADING NEXUS DATA...</span>
      </div>
    );
  }

  // Derive current mission step info
  const currentStepNum = teamData?.current_step ?? 0;
  const currentStepConfig = trailData?.steps?.find((s: any) => s.step_number === currentStepNum);
  const totalSteps = trailData?.total_steps || trailData?.steps?.length || 1;

  // Avatar logic
  const validAvatars = ['dustin', 'eleven', 'lucas', 'max', 'mike', 'steve', 'will'];
  const trailNameStr = (trailData?.name || '').toLowerCase();
  const avatarUrl = validAvatars.includes(trailNameStr) ? `/${trailNameStr}.png` : '/dustin.png';

  // Format trail nodes for map (excluding tasks)
  const trailNodes = (trailData?.steps || [])
    .filter((s: any) => s.step_type !== 'special_task')
    .map((s: any) => ({
      id: s.step_number,
      label: `Node ${s.step_number}`,
      type: s.step_type,
    }));

  if (teamData?.completed) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#070204] flex flex-col items-center justify-center p-6 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,255,102,0.15)]" />
        <h1 className="text-[#00ff66] font-creepster text-5xl sm:text-6xl md:text-7xl uppercase drop-shadow-[0_0_20px_rgba(0,255,102,0.8)] relative z-10 animate-pulse">
          MISSION ACCOMPLISHED
        </h1>
        <p className="font-digital text-zinc-300 text-lg sm:text-xl tracking-widest relative z-10 max-w-lg">
          GATE CLOSED. THE UPSIDE DOWN HAS BEEN CONTAINED.
        </p>
        <div className="mt-8 p-4 border border-[#00ff66]/30 bg-[#00ff66]/10 rounded-lg relative z-10 inline-block">
          <p className="font-digital text-[#00ff66] text-xl tracking-[0.1em]">
            FINAL CLEARANCE TIME: {teamData.completed_at ? new Date(teamData.completed_at).toLocaleTimeString() : 'UNKNOWN'}
          </p>
        </div>
      </div>
    );
  }

  if (currentStepConfig?.step_type === 'special_task') {
    return (
      <div className="min-h-[100dvh] w-full bg-[#070204] flex flex-col justify-between items-center p-6 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 blur-[2px] pointer-events-none"
          style={{ backgroundImage: "url('/vecna.png')" }}
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex flex-col items-center mt-24 sm:mt-28 gap-2 shrink-0">
          <h2 className="text-red-500 font-creepster text-3xl sm:text-4xl md:text-5xl tracking-widest drop-shadow-[0_0_15px_rgba(255,0,0,0.8)]">
            VECNA HAS GIVEN YOU A TASK
          </h2>
          <p className="text-zinc-300 font-digital text-sm sm:text-base tracking-[0.2em] uppercase mt-2">
            TEAM ID: {teamData?.team_id || teamData?.team_name || 'UNKNOWN'}
          </p>
        </div>

        {/* Bottom Task Content */}
        <div className="relative z-10 flex flex-col items-center gap-4 w-full mb-[10vh] max-h-[50vh] overflow-y-auto px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h1 className="text-white font-itc text-2xl sm:text-3xl md:text-4xl uppercase leading-snug">
            {currentStepConfig.task_description || 'AWAITING INSTRUCTIONS'}
          </h1>
          <p className="text-white/70 font-digital text-[10px] sm:text-xs tracking-widest uppercase max-w-lg mt-2 shrink-0">
            Show proof of task completion to nexus command member to move ahead
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#070204] relative">

      {/* Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-[1px]"
        >
          <source src="/bgMissionPage.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#070204]/70 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">

        {/* Stylized Header replacing old Header component */}
        <div className="flex flex-col items-center justify-center mt-24 sm:mt-28 lg:mt-32 mb-8">
          <h1 className="text-[rgb(253,242,229)] font-itc text-3xl sm:text-6xl lg:text-8xl tracking-normal uppercase whitespace-nowrap">
            INTO THE UPSIDE DOWN
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
          <div className="lg:col-span-8">
            <TransmissionCard
              senderName="HQ"
              channel="11.8.3"
              time={new Date().toISOString()}
              introLines={["INCOMING CLUE FROM NEXUS COMMAND."]}
              clueText={currentStepConfig?.step_type === 'special_task'
                ? (currentStepConfig?.task_description || 'Perform physical task.')
                : (currentStepConfig?.clue_text || "Awaiting transmission...")}
              storyText={currentStepConfig?.story_text}
              hintText={currentStepConfig?.hint_text}
              avatarUrl={avatarUrl}
              onViewOnMap={handleOpenMap}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <TeamInfoCard
              teamName={teamData?.team_name || "UNKNOWN"}
              trail={trailData?.name || "UNKNOWN"}
              missionCurrent={currentStepNum}
              missionTotal={totalSteps}
              status={'ACTIVE'}
              initialElapsedSeconds={initialElapsedSeconds}
            />
            <ProgressCard
              current={currentStepNum}
              total={totalSteps}
            />
          </div>
        </div>
      </div>

      {showScanModal && (
        <QRScannerModal
          onScan={handleScan}
          onClose={closeModal}
          isScanning={isScanning}
          scanComplete={scanComplete}
          scanError={scanError}
          onClearError={() => setScanError(null)}
        />
      )}

      {/* Trail Map Modal */}
      <TrailMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        nodes={trailNodes}
        currentIndex={currentStepNum}
        trail={trailData?.name || "UNKNOWN"}
      />

      {/* Floating map button (Refined styling without circle) */}
      <button
        type="button"
        onClick={handleOpenMap}
        aria-label="Open trail map"
        className="fixed z-40 bottom-[max(16px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 bg-transparent border-none"
      >
        <img src="/map_button.png" alt="Map Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,0,51,0.5)]" />
      </button>

      {/* Floating camera button */}
      <button
        type="button"
        onClick={handleOpenScan}
        aria-label="Open camera scanner"
        className="fixed z-40 bottom-[max(16px,env(safe-area-inset-bottom))] left-[max(16px,env(safe-area-inset-left))] w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center cursor-pointer bg-transparent border-none transition-transform hover:scale-110 active:scale-95"
      >
        <img src="/camera.png" alt="Camera Scanner" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,0,51,0.5)]" />
      </button>
    </div>
  );
}

export default MissionPage;
