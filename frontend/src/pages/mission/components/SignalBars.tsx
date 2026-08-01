import { useEffect, useState } from 'react';

interface SignalBarsProps {
  /** Number of active bars, 0-7. */
  strength?: number;
  totalBars?: number;
  /** Pause the live flicker (e.g. while the screen is frozen). */
  paused?: boolean;
}

const HEIGHTS = ['h-[5px]', 'h-[8px]', 'h-[11px]', 'h-[14px]', 'h-[17px]', 'h-[17px]', 'h-[17px]'];

/** The "SIGNAL" indicator, top-right of the transmission header. Bars gently flicker to feel alive. */
export function SignalBars({ strength = 5, totalBars = 7, paused = false }: SignalBarsProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [paused]);

  const dimBarIndex = paused ? -1 : tick % Math.max(strength, 1);

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-digital text-zinc-500 text-[9px] sm:text-[10px] tracking-[0.12em]">
        SIGNAL
      </span>
      <div className="flex items-end gap-[2px]">
        {Array.from({ length: totalBars }).map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-[1px] transition-opacity duration-500 ${HEIGHTS[i] ?? 'h-[17px]'} ${
              i < strength
                ? 'bg-[#ff0033] shadow-[0_0_4px_rgba(255,0,51,0.7)]'
                : 'bg-[#ff0033]/20'
            } ${i === dimBarIndex ? 'opacity-35' : 'opacity-100'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default SignalBars;
