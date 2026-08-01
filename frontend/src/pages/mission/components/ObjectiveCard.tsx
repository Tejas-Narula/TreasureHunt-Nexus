import { QRCode } from './QRCode';

interface ObjectiveCardProps {
  title: string;
  description: string;
  qrValue: string;
  onScanClick?: () => void;
  isFrozen?: boolean;
}

/** "YOUR OBJECTIVE" panel with the real QR code button on the right. */
export function ObjectiveCard({ title, description, qrValue, onScanClick, isFrozen }: ObjectiveCardProps) {
  return (
    <div className="nexus-panel p-3.5 sm:p-4 lg:p-5 flex flex-col min-[420px]:flex-row gap-3 sm:gap-3.5 items-center min-[420px]:items-start justify-between text-center min-[420px]:text-left">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-center min-[420px]:justify-start gap-1.5 text-[#ff0033] font-digital font-bold text-[10.5px] sm:text-[11px] lg:text-xs tracking-[0.12em] mb-1.5">
          <span className="w-2.5 h-px bg-[#ff0033] hidden min-[420px]:inline-block" />
          <span>YOUR OBJECTIVE</span>
        </div>
        <div className="font-stranger text-white text-base sm:text-[17px] lg:text-[19px] tracking-[0.03em] font-bold mb-1.5">
          {title}
        </div>
        <div className="font-digital text-zinc-500 text-[10.5px] sm:text-[11px] lg:text-[11.5px] leading-relaxed">
          {description}
        </div>
        {isFrozen && (
          <div className="mt-2 font-digital text-amber-400 text-[10px] sm:text-[10.5px] tracking-wider">
            LOCKED — WAITING FOR COORDINATOR
          </div>
        )}
      </div>
      <QRCode value={qrValue} onClick={onScanClick} disabled={isFrozen} size={240} />
    </div>
  );
}

export default ObjectiveCard;
