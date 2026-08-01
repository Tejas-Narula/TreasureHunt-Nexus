import { useState } from 'react';
import { QrCode as QrIcon, Cpu } from 'lucide-react';
import { soundFx } from '../../utils/audio';
import { Header } from './components/Header';
import { TransmissionCard } from './components/TransmissionCard';
import { DecodedMessage } from './components/DecodedMessage';
import { ObjectiveCard } from './components/ObjectiveCard';
import { WarningBanner } from './components/WarningBanner';
import { FreezeOverlay } from './components/FreezeOverlay';
import { DUMMY_CLUE, DUMMY_DECODED_NOTE, DUMMY_SIGNAL_STRENGTH } from './data/dummyMission';

/**
 * MISSION PAGE — Radio Transmission / Clue Screen
 * ---------------------------------------------------------------
 * Ownership: everything under src/pages/mission/ only.
 * Nothing in src/components/, backend, or shared config is touched.
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
export function MissionPage() {
  const [isFrozen, setIsFrozen] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

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
    <div className="min-h-[100dvh] w-full bg-[#070204] flex justify-center items-start px-3 py-5 sm:px-4 sm:py-6 lg:py-10">
      {/* Base layout: single stacked column on mobile & tablet portrait.
          At lg (1024px+ — laptop, and landscape tablets) it becomes a
          horizontal two-column layout: transmission on the left spanning
          full height, everything else stacked on the right. */}
      <div className="w-full max-w-[460px] sm:max-w-[520px] md:max-w-[640px] lg:max-w-[980px] xl:max-w-[1100px] flex flex-col gap-3.5 sm:gap-4 lg:gap-5">
        <Header signalStrength={DUMMY_SIGNAL_STRENGTH} />

        <div className="text-center font-digital text-[#ff3355] font-bold text-[11px] sm:text-xs tracking-[0.25em]">
          TRANSMISSION RECEIVED
        </div>

        <div className="flex flex-col lg:flex-row gap-3.5 sm:gap-4 lg:gap-5 lg:items-stretch">
          <div className="lg:flex-[1.05] lg:flex">
            <TransmissionCard
              senderName={DUMMY_CLUE.sender}
              channel={DUMMY_CLUE.frequency}
              time={DUMMY_CLUE.timestamp}
              introLines={DUMMY_CLUE.encodedMessage.split('. ').map((s, i, arr) =>
                i < arr.length - 1 ? s + '.' : s
              )}
              clueText={DUMMY_CLUE.decodedMessage}
            />
          </div>

          <div className="lg:flex-[0.95] flex flex-col gap-3.5 sm:gap-4 lg:gap-5">
            <DecodedMessage note={DUMMY_DECODED_NOTE} />

            <div className="relative">
              <ObjectiveCard
                title={DUMMY_CLUE.objectiveTitle}
                description={DUMMY_CLUE.objectiveDesc}
                qrValue={DUMMY_CLUE.qrValue}
                onScanClick={handleOpenScan}
                isFrozen={isFrozen}
              />
              <FreezeOverlay isFrozen={isFrozen} />
            </div>

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
          <div className="nexus-panel p-5 max-w-sm w-full border-[#ff0033] shadow-[0_0_40px_rgba(255,0,51,0.6)] text-center space-y-3">
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
    </div>
  );
}

export default MissionPage;
