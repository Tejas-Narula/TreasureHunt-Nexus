import { MapPin } from 'lucide-react';
import { CharacterCard } from './CharacterCard';
import { useTypewriter } from '../hooks/useTypewriter';

interface TransmissionCardProps {
  senderName: string;
  channel: string;
  time: string;
  introLines: string[];
  clueText: string;
  avatarUrl?: string;
  /** Opens the trail map, focused on this clue's location. */
  onViewOnMap?: () => void;
}

/** "TRANSMISSION RECEIVED" panel: sender block, message body, and the red clue inset. */
export function TransmissionCard({
  senderName,
  channel,
  time,
  introLines,
  clueText,
  avatarUrl,
  onViewOnMap,
}: TransmissionCardProps) {
  const { displayedText, isDone } = useTypewriter(clueText);

  return (
    <div className="nexus-panel p-3.5 sm:p-4 lg:p-5 w-full lg:flex lg:flex-col lg:h-full transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,0,51,0.3)]">
      <CharacterCard senderName={senderName} channel={channel} time={time} avatarUrl={avatarUrl} />

      <div className="mt-3.5 sm:mt-4 font-digital text-[12px] sm:text-[13px] lg:text-[13.5px] leading-relaxed text-zinc-300 space-y-0.5">
        {introLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* On laptop this card stretches full height (see MissionPage), so
          push the clue box down toward the bottom instead of leaving a
          visual gap — keeps the card balanced next to the right column. */}
      <div className="mt-3 lg:mt-auto lg:pt-3 rounded-md border border-[#ff0033]/35 bg-[#ff0033]/5 p-3 lg:p-4">
        <div className="font-digital text-[#ff3355] text-[12.5px] sm:text-[13px] lg:text-[14px] leading-[1.7] tracking-[0.01em]">
          {displayedText}
          {!isDone && <span className="animate-pulse">▍</span>}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-digital text-zinc-500 text-[9px] sm:text-[9.5px] tracking-[0.1em]">
            // END TRANSMISSION
          </span>
          {onViewOnMap && (
            <button
              type="button"
              onClick={onViewOnMap}
              className="flex items-center gap-1 font-digital text-[9px] sm:text-[9.5px] tracking-[0.08em] text-[#ff4d6d] hover:text-white border border-[#ff0033]/40 hover:border-[#ff0033] rounded px-2 py-1 transition-colors cursor-pointer"
            >
              <MapPin className="w-3 h-3" />
              LOCATE ON MAP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransmissionCard;
