interface ProgressCardProps {
  current: number;
  total: number;
}

/** "MISSION PROGRESS" panel — clue progress bar + X / total complete. */
export function ProgressCard({ current, total }: ProgressCardProps) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="nexus-panel p-3.5 sm:p-4 lg:p-[18px] transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,0,51,0.3)]">
      <div className="mb-3">
        <span className="font-digital text-[#ff0033] font-bold text-[11px] sm:text-[11.5px] lg:text-xs tracking-[0.12em]">
          MISSION PROGRESS
        </span>
      </div>

      <div className="w-full h-3 rounded-full overflow-hidden border border-[#ff0033]/40 bg-[repeating-linear-gradient(45deg,rgba(255,0,51,0.12)_0px,rgba(255,0,51,0.12)_4px,rgba(255,0,51,0.03)_4px,rgba(255,0,51,0.03)_8px)]">
        <div
          className="h-full bg-[#ff0033] shadow-[0_0_8px_rgba(255,0,51,0.7)] transition-[width] duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 font-digital text-zinc-400 text-[11px] sm:text-[11.5px] lg:text-xs tracking-wider">
        {current} / {total} COMPLETE
      </div>
    </div>
  );
}

export default ProgressCard;
