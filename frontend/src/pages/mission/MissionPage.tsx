import { useState } from 'react';
import { QrCode as QrIcon, Cpu, Map as MapIcon } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { Header } from './components/Header';
import { TransmissionCard } from './components/TransmissionCard';
import { DecodedMessage } from './components/DecodedMessage';
import { TeamInfoCard } from './components/TeamInfoCard';
import { ProgressCard } from './components/ProgressCard';
import { ObjectiveCard } from './components/ObjectiveCard';
import { WarningBanner } from './components/WarningBanner';
import { FreezeOverlay } from './components/FreezeOverlay';
import { TrailMapModal } from './components/TrailMapModal';
import {
  DUMMY_CLUE,
  DUMMY_DECODED_NOTE,
  DUMMY_SIGNAL_STRENGTH,
  DUMMY_TEAM_INFO,
  DUMMY_TRAIL_NODES,
} from './data/dummyMission';

/**
 * MISSION PAGE — Radio Transmission / Clue Screen
 * ---------------------------------------------------------------
 *
 * Flow this models:
 *  1. Team arrives at a location, sees the clue (unfrozen state).
 *  2. They do the physical task -> screen freezes (FreezeOverlay).
 *  3. Coordinator verifies in person -> unfreezes (dev toggle for now,
 *     swap for a real backend/socket event later).
 *  4. QR button becomes tappable -> opens scan modal -> simulate scan
 *     for now (matches the same pattern HomePage.tsx already uses).
 * ---------------------------------------------------------------
 */
interface MissionPageProps {
  /** Called when the back button is tapped. Left undefined = no back button shown. */
  onBack?: () => void;
}

export function MissionPage({ onBack }: MissionPageProps) {
  const [isFrozen, setIsFrozen] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const handleOpenMap = () => {
    soundFx.playClick();
    setShowMapModal(true);
  };

  const handleOpenScan = () => {
    if (isFrozen) return;
    soundFx.playClick();
    setShowScanModal(true);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      soundFx.playAccessGranted();
      setIsScanning(false);
      setScanComplete(true);
    }, 900);
  };

  const closeModal = () => {
    setShowScanModal(false);
    setScanComplete(false);
    setIsScanning(false);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#070204]">
      {/* Same shell pattern as HomePage: max-w-7xl mx-auto + responsive
          padding, so this page actually expands to fill laptop/desktop
          screens instead of sitting in a small centered card. */}
      <div className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
        <Header signalStrength={DUMMY_SIGNAL_STRENGTH} signalPaused={isFrozen} onBack={onBack} />

        <div className="text-center font-digital text-[#ff3355] font-bold text-[11px] sm:text-xs tracking-[0.25em]">
          TRANSMISSION RECEIVED
        </div>

        {/* Row 1: transmission (wide) + decoded message (narrow) — mirrors
            HomePage's hero (col-span-8) / clue media (col-span-4) split.
            Grid rows stretch both columns to equal height automatically. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
          <div className="lg:col-span-8">
            <TransmissionCard
              senderName={DUMMY_CLUE.sender}
              channel={DUMMY_CLUE.frequency}
              time={DUMMY_CLUE.timestamp}
              introLines={DUMMY_CLUE.encodedMessage.split('. ').map((s, i, arr) =>
                i < arr.length - 1 ? s + '.' : s
              )}
              clueText={DUMMY_CLUE.decodedMessage}
              onViewOnMap={handleOpenMap}
            />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <DecodedMessage note={DUMMY_DECODED_NOTE} />
            <TeamInfoCard
              teamName={DUMMY_TEAM_INFO.teamName}
              trail={DUMMY_TEAM_INFO.trail}
              missionCurrent={DUMMY_TEAM_INFO.missionCurrent}
              missionTotal={DUMMY_TEAM_INFO.missionTotal}
              status={isFrozen ? 'VERIFYING' : DUMMY_TEAM_INFO.status}
              initialElapsedSeconds={DUMMY_TEAM_INFO.initialElapsedSeconds}
            />
            <ProgressCard
              current={DUMMY_TEAM_INFO.missionCurrent}
              total={DUMMY_TEAM_INFO.missionTotal}
            />
          </div>
        </div>

        {/* Row 2: objective/QR (wide) + warning & dev controls (narrow) —
            mirrors HomePage's map (col-span-8) / stats (col-span-4) split. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
          <div className="lg:col-span-8 relative">
            <ObjectiveCard
              title={DUMMY_CLUE.objectiveTitle}
              description={DUMMY_CLUE.objectiveDesc}
              qrValue={DUMMY_CLUE.qrValue}
              onScanClick={handleOpenScan}
              isFrozen={isFrozen}
            />
            <FreezeOverlay isFrozen={isFrozen} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 lg:gap-6">
            <WarningBanner />

            {/* --- DEV CONTROLS (remove once real coordinator/backend unlock exists) --- */}
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsFrozen((f) => !f);
              }}
              className="self-center lg:self-start font-digital text-[10px] tracking-wider text-zinc-600 hover:text-zinc-400 border border-zinc-800 hover:border-zinc-600 rounded px-3 py-1.5 transition-colors cursor-pointer"
            >
              [DEV] {isFrozen ? 'SIMULATE COORDINATOR UNLOCK' : 'RE-LOCK SCREEN'}
            </button>
          </div>
        </div>
      </div>

      {/* Scan Simulation Modal — mirrors the pattern already used in HomePage.tsx */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm">
          <div className="nexus-panel p-5 lg:p-6 max-w-sm lg:max-w-md w-full border-[#ff0033] shadow-[0_0_40px_rgba(255,0,51,0.6)] text-center space-y-3">
            <div className="flex items-center justify-between border-b border-[#ff0033]/30 pb-2">
              <span className="font-digital text-xs sm:text-sm text-[#ff4d6d] font-bold">
                {scanComplete ? 'TRANSMISSION UNLOCKED' : 'SCAN NEXT QR CODE'}
              </span>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-white font-digital p-1 cursor-pointer"
              >
                [X]
              </button>
            </div>

            <div className="relative p-5 border-2 border-dashed border-[#ff0033] rounded bg-black flex flex-col items-center justify-center min-h-[140px]">
              {scanComplete ? (
                <span className="font-digital text-[#00ff66] text-sm">✓ ACCESS GRANTED</span>
              ) : (
                <>
                  <QrIcon
                    className={`w-24 h-24 text-[#ff0033] ${isScanning ? 'animate-spin' : 'animate-pulse'}`}
                  />
                  {isScanning && (
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-[#00ff66] shadow-[0_0_10px_#00ff66] animate-ping" />
                  )}
                  <span className="font-digital text-[11px] text-zinc-400 mt-2">
                    {isScanning ? 'DECODING...' : 'ALIGN CAMERA WITH CLUE QR CODE'}
                  </span>
                </>
              )}
            </div>

            {!scanComplete && (
              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full nexus-btn py-2.5 text-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <Cpu className="w-4 h-4 animate-spin" />
                    SCANNING...
                  </span>
                ) : (
                  'SIMULATE SCAN SUCCESS'
                )}
              </button>
            )}
          </div>
        </div>
      )}
      {/* Trail Map Modal */}
      <TrailMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        nodes={DUMMY_TRAIL_NODES}
        currentIndex={DUMMY_TEAM_INFO.missionCurrent}
        trail={DUMMY_TEAM_INFO.trail}
      />

      {/* Floating map button — always reachable regardless of scroll position */}
      <button
        type="button"
        onClick={handleOpenMap}
        aria-label="Open trail map"
        className="fixed z-40 bottom-[max(16px,env(safe-area-inset-bottom))] right-[max(16px,env(safe-area-inset-right))] w-12 h-12 sm:w-14 sm:h-14 rounded-full nexus-btn shadow-[0_0_20px_rgba(255,0,51,0.6)] flex items-center justify-center cursor-pointer"
      >
        <MapIcon className="w-11 h-11 sm:w-12 sm:h-12" strokeWidth={2.25} />
      </button>
    </div>
  );
}

export default MissionPage;
