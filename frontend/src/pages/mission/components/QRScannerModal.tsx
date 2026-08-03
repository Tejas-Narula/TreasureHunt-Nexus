import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerModalProps {
  onScan: (text: string) => void;
  onClose: () => void;
  isScanning: boolean;
  scanComplete: boolean;
  scanError: string | null;
  onClearError: () => void;
}

export function QRScannerModal({ onScan, onClose, isScanning, scanComplete, scanError, onClearError }: QRScannerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm">
      <div className="nexus-panel p-5 lg:p-6 max-w-sm lg:max-w-md w-full border-[#ff0033] shadow-[0_0_40px_rgba(255,0,51,0.6)] text-center space-y-3">
        <div className="flex items-center justify-between border-b border-[#ff0033]/30 pb-2">
          <span className="font-digital text-xs sm:text-sm text-[#ff4d6d] font-bold">
            {scanComplete ? 'TRANSMISSION UNLOCKED' : scanError ? 'ACCESS DENIED' : 'SCAN NEXT QR CODE'}
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white font-digital p-1 cursor-pointer"
          >
            [X]
          </button>
        </div>

        <div className="relative p-2 border-2 border-dashed border-[#ff0033] rounded bg-black min-h-[300px] overflow-hidden">
          {scanComplete ? (
            <div className="flex items-center justify-center h-full min-h-[300px]">
              <span className="font-digital text-[#00ff66] text-xl">✓ ACCESS GRANTED</span>
            </div>
          ) : scanError ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
              <span className="font-digital text-xl text-[#ff0033] animate-pulse">✗ ACCESS DENIED</span>
              <span className="font-digital text-sm text-zinc-400 uppercase tracking-widest">{scanError}</span>
              <button
                onClick={onClearError}
                className="mt-6 font-digital border border-[#ff0033]/50 text-[#ff0033] bg-[#ff0033]/10 hover:bg-[#ff0033]/25 px-5 py-2 text-xs tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer rounded"
              >
                [ RESET SCANNER ]
              </button>
            </div>
          ) : isScanning ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
              <span className="font-digital text-lg text-[#ff0033] animate-pulse">VERIFYING...</span>
            </div>
          ) : (
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  onScan(result[0].rawValue);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
