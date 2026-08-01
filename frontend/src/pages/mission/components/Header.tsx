import { RadioTower } from 'lucide-react';
import { SignalBars } from './SignalBars';

interface HeaderProps {
  signalStrength?: number;
}

/** Top bar: radio tower icon + title/subtitle on the left, signal bars on the right. */
export function Header({ signalStrength }: HeaderProps) {
  return (
    <div className="flex items-start justify-between pb-3 sm:pb-3.5 lg:pb-4 border-b border-[#ff0033]/35">
      <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
        <RadioTower className="w-5 h-5 sm:w-[26px] sm:h-[26px] lg:w-[30px] lg:h-[30px] text-[#ff0033] shrink-0 drop-shadow-[0_0_6px_rgba(255,0,51,0.7)]" />
        <div className="flex flex-col gap-0.5">
          <span className="font-digital font-bold text-[#ff0033] text-[13px] sm:text-[15px] lg:text-[17px] tracking-[0.08em] drop-shadow-[0_0_8px_rgba(255,0,51,0.6)]">
            RADIO TRANSMISSION
          </span>
          <span className="font-digital text-zinc-500 text-[9px] sm:text-[10px] lg:text-[11px] tracking-[0.1em]">
            NEXUS ENCRYPTED CHANNEL
          </span>
        </div>
      </div>
      <SignalBars strength={signalStrength} />
    </div>
  );
}

export default Header;
