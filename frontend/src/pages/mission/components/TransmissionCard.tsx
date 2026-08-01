import { CharacterCard } from './CharacterCard';

interface TransmissionCardProps {
  senderName: string;
  channel: string;
  time: string;
  introLines: string[];
  clueText: string;
  avatarUrl?: string;
}

/** "TRANSMISSION RECEIVED" panel: sender block, message body, and the red clue inset. */
export function TransmissionCard({
  senderName,
  channel,
  time,
  introLines,
  clueText,
  avatarUrl,
}: TransmissionCardProps) {
  return (
    <div className="nexus-panel p-3.5 sm:p-4 lg:p-5 w-full lg:flex lg:flex-col lg:h-full">
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
          {clueText}
        </div>
        <div className="mt-2 text-right font-digital text-zinc-500 text-[9px] sm:text-[9.5px] tracking-[0.1em]">
          // END TRANSMISSION
        </div>
      </div>
    </div>
  );
}

export default TransmissionCard;
