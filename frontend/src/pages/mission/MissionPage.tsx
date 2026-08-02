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
  const [showMapModal, setShowMapModal] = useState(false);

  const [teamData, setTeamData] = useState<any>(null);
  const [trailData, setTrailData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeamData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/player/team/${currentUser.teamId}`);
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
    // In a real app, you might poll this or listen to websockets for step updates.
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
    soundFx.playClick();

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/player/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        // optionally show error message in scanner modal
      }
    } catch (err) {
      console.error(err);
      soundFx.playAccessDenied();
    } finally {
      setIsScanning(false);
    }
  };

  const closeModal = () => {
    setShowScanModal(false);
    setScanComplete(false);
    setIsScanning(false);
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
  const totalSteps = trailData?.steps?.length || 1;
  
  // Format trail nodes for map
  const trailNodes = trailData?.steps?.map((s: any) => ({
    id: s.step_number,
    label: s.location_name
  })) || [];

  return (
    <div className="min-h-[100dvh] w-full bg-[#070204]">
      <div className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
        
        {/* Stylized Header replacing old Header component */}
        <div className="flex flex-col items-center justify-center mt-4 sm:mt-6 mb-8">
          <h1 className="text-[#ff0033] font-creepster text-4xl sm:text-5xl lg:text-6xl tracking-widest uppercase drop-shadow-[0_0_15px_#ff0033]">
            INTO THE UPSIDE DOWN
          </h1>
        </div>

        <div className="text-center font-digital text-[#ff3355] font-bold text-[11px] sm:text-xs tracking-[0.25em]">
          TRANSMISSION RECEIVED
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
              initialElapsedSeconds={0} // Can be calculated based on game start time if needed
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
        className="fixed z-40 bottom-[max(16px,env(safe-area-inset-bottom))] left-[max(16px,env(safe-area-inset-left))] w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center cursor-pointer bg-transparent border-none transition-transform hover:scale-110 active:scale-95"
      >
        <img src="/camera.png" alt="Camera Scanner" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,0,51,0.5)]" />
      </button>
    </div>
  );
}

export default MissionPage;
