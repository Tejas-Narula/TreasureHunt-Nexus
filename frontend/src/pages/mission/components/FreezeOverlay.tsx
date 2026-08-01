import { Lock } from 'lucide-react';

interface FreezeOverlayProps {
  isFrozen: boolean;
  taskLabel?: string;
}

/**
 * Full-panel lock screen shown while the team is doing the physical task.
 * A coordinator unfreezes this (currently via the dev toggle in
 * MissionPage — swap for a real backend/socket event later) once they've
 * verified the task in person, which reveals the QR button underneath.
 */
export function FreezeOverlay({ isFrozen, taskLabel = 'COMPLETE THE TASK' }: FreezeOverlayProps) {
  if (!isFrozen) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-lg bg-[#070204]/92 backdrop-blur-sm border border-[#ff0033]/40 text-center px-6">
      <Lock className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 text-[#ff0033] animate-pulse drop-shadow-[0_0_10px_rgba(255,0,51,0.7)]" />
      <div className="font-digital text-[#ff3355] font-bold text-xs sm:text-sm lg:text-[15px] tracking-[0.15em]">
        SCREEN LOCKED
      </div>
      <div className="font-digital text-zinc-400 text-[10.5px] sm:text-xs lg:text-[12.5px] max-w-[240px] lg:max-w-[280px] leading-relaxed">
        {taskLabel}. Show your coordinator when done — they'll unlock the next transmission.
      </div>
    </div>
  );
}

export default FreezeOverlay;
