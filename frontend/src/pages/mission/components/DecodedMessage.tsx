import { FileText } from 'lucide-react';

interface DecodedMessageProps {
  note: string;
}

/** "DECODED MESSAGE" panel — shows how the transmission was decoded. */
export function DecodedMessage({ note }: DecodedMessageProps) {
  return (
    <div className="nexus-panel p-3.5 sm:p-4">
      <div className="flex items-center gap-2 text-[#ff0033] font-digital font-bold text-[11px] sm:text-[11.5px] tracking-[0.12em] mb-1.5">
        <FileText className="w-3.5 h-3.5 sm:w-[15px] sm:h-[15px] shrink-0" />
        <span>DECODED MESSAGE</span>
      </div>
      <div className="font-digital text-[11px] sm:text-[11.5px] text-zinc-400 leading-relaxed">
        {note}
      </div>
    </div>
  );
}

export default DecodedMessage;
