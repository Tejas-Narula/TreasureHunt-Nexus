import { useElapsedTimer } from '../hooks/useElapsedTimer';

interface TeamInfoCardProps {
  teamName: string;
  trail: string;
  missionCurrent: number;
  missionTotal: number;
  status: string;
  initialElapsedSeconds: number;
}

/** "CONNECTED TO" panel — team name, trail, mission count, status, live elapsed time. */
export function TeamInfoCard({
  teamName,
  trail,
  missionCurrent,
  missionTotal,
  status,
  initialElapsedSeconds,
}: TeamInfoCardProps) {
  const elapsed = useElapsedTimer(initialElapsedSeconds);
  const isActive = status.toUpperCase() === 'ACTIVE';

  return (
    <div className="nexus-panel p-3.5 sm:p-4 lg:p-[18px] transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,0,51,0.3)]">
      <div className="mb-2.5">
        <span className="font-digital text-[#ff0033] font-bold text-[11px] sm:text-[11.5px] lg:text-xs tracking-[0.12em]">
          CONNECTED TO
        </span>
      </div>

      <div className="font-stranger text-white text-base sm:text-[17px] lg:text-[19px] tracking-[0.03em] font-bold mb-3">
        {teamName}
      </div>

      <div className="space-y-1.5 font-digital text-[11px] sm:text-[11.5px] lg:text-xs">
        <div className="flex items-center justify-between text-zinc-500">
          <span>Trail</span>
          <span className="text-zinc-200">{trail}</span>
        </div>
        <div className="flex items-center justify-between text-zinc-500">
          <span>Mission</span>
          <span className="text-zinc-200">
            {missionCurrent} / {missionTotal}
          </span>
        </div>
        <div className="flex items-center justify-between text-zinc-500">
          <span>Status</span>
          <span
            className={`tracking-wider ${isActive ? 'text-[#00ff66]' : 'text-amber-400'}`}
          >
            {status}
          </span>
        </div>
        <div className="flex items-center justify-between text-zinc-500">
          <span>Elapsed</span>
          <span className="text-zinc-200 tabular-nums">{elapsed}</span>
        </div>
      </div>
    </div>
  );
}

export default TeamInfoCard;
