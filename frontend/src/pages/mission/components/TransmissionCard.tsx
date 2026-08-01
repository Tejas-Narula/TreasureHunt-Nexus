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
    <div className="nexus-panel p-3.5 sm:p-4">
      <CharacterCard senderName={senderName} channel={channel} time={time} avatarUrl={avatarUrl} />

      <div className="mt-3.5 sm:mt-4 font-digital text-[12px] sm:text-[13px] leading-relaxed text-zinc-300 space-y-0.5">
        {introLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-[#ff0033]/35 bg-[#ff0033]/5 p-3">
        <div className="font-digital text-[#ff3355] text-[12.5px] sm:text-[13px] leading-[1.7] tracking-[0.01em]">
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
