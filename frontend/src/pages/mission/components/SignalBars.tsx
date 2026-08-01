interface SignalBarsProps {
  /** Number of active bars, 0-7. */
  strength?: number;
  totalBars?: number;
}

const HEIGHTS = ['h-[5px]', 'h-[8px]', 'h-[11px]', 'h-[14px]', 'h-[17px]', 'h-[17px]', 'h-[17px]'];

/** The "SIGNAL" indicator, top-right of the transmission header. */
export function SignalBars({ strength = 5, totalBars = 7 }: SignalBarsProps) {
  return (
    <div className="flex flex-col items-end gap-1">
      <span className="font-digital text-zinc-500 text-[9px] sm:text-[10px] tracking-[0.12em]">
        SIGNAL
      </span>
      <div className="flex items-end gap-[2px]">
        {Array.from({ length: totalBars }).map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-[1px] ${HEIGHTS[i] ?? 'h-[17px]'} ${
              i < strength
                ? 'bg-[#ff0033] shadow-[0_0_4px_rgba(255,0,51,0.7)]'
                : 'bg-[#ff0033]/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default SignalBars;
