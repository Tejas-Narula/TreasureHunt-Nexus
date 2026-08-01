import { RadioTower, ChevronLeft } from 'lucide-react';
import { SignalBars } from './SignalBars';

interface HeaderProps {
  signalStrength?: number;
  /** Pauses the live signal flicker, e.g. while the mission screen is frozen. */
  signalPaused?: boolean;
  /** Shows a back button on the left, before the radio tower icon, when provided. */
  onBack?: () => void;
}

/** Top bar: back button + radio tower icon + title/subtitle on the left, signal bars on the right. */
export function Header({ signalStrength, signalPaused, onBack }: HeaderProps) {
  return (
    <div className="flex items-start justify-between pb-3 sm:pb-3.5 lg:pb-4 border-b border-[#ff0033]/35">
      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-[#ff0033]/40 text-[#ff4d6d] hover:text-white hover:border-[#ff0033] hover:bg-[#ff0033]/10 transition-colors cursor-pointer -ml-1"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        <RadioTower className="w-5 h-5 sm:w-[26px] sm:h-[26px] lg:w-[30px] lg:h-[30px] text-[#ff0033] shrink-0 drop-shadow-[0_0_6px_rgba(255,0,51,0.7)]" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-digital font-bold text-[#ff0033] text-[13px] sm:text-[15px] lg:text-[17px] tracking-[0.08em] drop-shadow-[0_0_8px_rgba(255,0,51,0.6)]">
            RADIO TRANSMISSION
          </span>
          <span className="font-digital text-zinc-500 text-[9px] sm:text-[10px] lg:text-[11px] tracking-[0.1em]">
            NEXUS ENCRYPTED CHANNEL
          </span>
        </div>
      </div>
      <SignalBars strength={signalStrength} paused={signalPaused} />
    </div>
  );
}

export default Header;
