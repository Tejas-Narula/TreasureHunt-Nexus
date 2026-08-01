import { User } from 'lucide-react';

interface CharacterCardProps {
  senderName: string;
  channel: string;
  time: string;
  avatarUrl?: string;
}

/** Avatar + FROM/CHANNEL/TIME block shown at the top of the transmission panel. */
export function CharacterCard({ senderName, channel, time, avatarUrl }: CharacterCardProps) {
  return (
    <div className="flex gap-3 items-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] shrink-0 rounded-md border border-[#ff0033]/80 bg-gradient-to-br from-[#1a0308] to-[#300810] flex items-center justify-center text-[#ff3355] shadow-[0_0_10px_rgba(255,0,51,0.35)] overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
        ) : (
          <User size={26} className="lg:w-[30px] lg:h-[30px]" />
        )}
      </div>
      <div className="flex flex-col gap-0.5 font-digital text-[11px] sm:text-xs lg:text-[13px]">
        <div className="text-zinc-300">
          FROM: <strong className="text-white tracking-[0.04em]">{senderName}</strong>
        </div>
        <div className="text-zinc-500">CHANNEL: {channel}</div>
        <div className="text-zinc-500">TIME: {time}</div>
      </div>
    </div>
  );
}

export default CharacterCard;
