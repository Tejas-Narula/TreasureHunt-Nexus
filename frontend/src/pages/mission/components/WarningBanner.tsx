import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
  text?: string;
}

/** Bottom warning strip: "Stay on this page..." */
export function WarningBanner({
  text = 'Stay on this page. New transmissions will override this screen.',
}: WarningBannerProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-[#ff0033]/25 bg-[#ff0033]/[0.04] px-3 py-2.5 lg:px-3.5 lg:py-3">
      <AlertTriangle className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#ff0033] shrink-0" />
      <div className="font-digital text-[10px] sm:text-[10.5px] lg:text-[11px] text-zinc-500 leading-relaxed">
        {text}
      </div>
    </div>
  );
}

export default WarningBanner;
