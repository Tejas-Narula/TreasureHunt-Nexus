import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Cpu } from 'lucide-react';

interface QRScannerModalProps {
  onScan: (text: string) => void;
  onClose: () => void;
  isScanning: boolean;
  scanComplete: boolean;
}

export function QRScannerModal({ onScan, onClose, isScanning, scanComplete }: QRScannerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm">
      <div className="nexus-panel p-5 lg:p-6 max-w-sm lg:max-w-md w-full border-[#ff0033] shadow-[0_0_40px_rgba(255,0,51,0.6)] text-center space-y-3">
        <div className="flex items-center justify-between border-b border-[#ff0033]/30 pb-2">
          <span className="font-digital text-xs sm:text-sm text-[#ff4d6d] font-bold">
            {scanComplete ? 'TRANSMISSION UNLOCKED' : 'SCAN NEXT QR CODE'}
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
          ) : isScanning ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4">
              <Cpu className="w-12 h-12 text-[#ff0033] animate-spin" />
              <span className="font-digital text-lg text-[#ff0033]">VERIFYING...</span>
            </div>
          ) : (
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  onScan(result[0].rawValue);
                }
              }}
              options={{ delayBetweenScanAttempts: 1000 }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
