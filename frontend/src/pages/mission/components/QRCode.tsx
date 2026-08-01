interface QRCodeProps {
  /** The actual data/URL this QR code encodes. */
  value: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: number;
}

/**
 * Real, scannable QR code — generated via a public QR image endpoint
 * (no npm dependency needed, so package.json stays untouched). Falls
 * back to a plain tappable link if the image fails to load (e.g. no
 * internet at the venue).
 *
 * Clicking it still opens the in-app "scan" modal (SIMULATE SCAN
 * SUCCESS flow) — this doesn't do camera-based decoding itself, it's
 * just what gets scanned by an actual phone camera pointed at the
 * screen, or copy-pasted as a link.
 */
export function QRCode({ value, onClick, disabled, size = 200 }: QRCodeProps) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&color=e6002e&bgcolor=ffffff&data=${encodeURIComponent(
    value
  )}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={disabled ? 'QR code locked until task is verified' : 'Open QR scanner'}
      className={`w-[92px] h-[92px] min-[420px]:w-[72px] min-[420px]:h-[72px] sm:w-[80px] sm:h-[80px] lg:w-[104px] lg:h-[104px] shrink-0 rounded-md border p-1.5 flex items-center justify-center transition-all ${
        disabled
          ? 'border-zinc-700 bg-zinc-900 opacity-40 cursor-not-allowed'
          : 'border-[#ff0033]/70 bg-white shadow-[0_0_12px_rgba(255,0,51,0.35)] hover:shadow-[0_0_20px_rgba(255,0,51,0.6)] hover:scale-[1.03] active:scale-[0.97] cursor-pointer'
      }`}
    >
      <img
        src={src}
        alt="Scan for next transmission"
        width={size}
        height={size}
        className={`w-full h-full object-contain ${disabled ? 'grayscale' : ''}`}
        onError={(e) => {
          // Fallback if the QR image endpoint is unreachable (offline venue etc.)
          (e.currentTarget as HTMLImageElement).style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <span className="hidden w-full h-full items-center justify-center text-center font-digital text-[8px] text-[#e6002e] leading-tight px-1">
        TAP TO OPEN LINK
      </span>
    </button>
  );
}

export default QRCode;
