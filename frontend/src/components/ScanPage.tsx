import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audio';
import { QrCode, ShieldAlert, CheckCircle2, Home } from 'lucide-react';

interface ScanPageProps {
  onNavigateHome: () => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({ onNavigateHome }) => {
  const [scanState, setScanState] = useState<'scanning' | 'success' | 'error'>('scanning');
  const [message, setMessage] = useState('ANALYZING LOCATION SIGNATURE...');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    const processScan = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      
      const teamId = sessionStorage.getItem('nexus_team_id');
      const teamDocId = sessionStorage.getItem('nexus_team_doc_id');
      const playerId = sessionStorage.getItem('nexus_player_id');

      if (!teamId || !playerId || !teamDocId) {
        // Not logged in
        setScanState('error');
        setMessage('AUTHENTICATION REQUIRED');
        setErrorDetails('Please log into your operative terminal first.');
        return;
      }

      if (!code) {
        setScanState('error');
        setMessage('INVALID TRANSMISSION');
        setErrorDetails('No location code detected in the link.');
        return;
      }

      // Play scanning sound
      soundFx.playRadioStatic();

      try {
        // Simulate scanning delay
        await new Promise(r => setTimeout(r, 1500));

        let url = '/api/player/scan';
        if (import.meta.env.VITE_API_BASE_URL) {
           url = `${import.meta.env.VITE_API_BASE_URL}/api/player/scan`;
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            team_id: teamDocId, // Using the document ID as the backend expects it
            player_id: playerId,
            qr_token: code
          })
        });

        // Dev Fallback
        if (!res.ok && url === '/api/player/scan') {
           const fallbackRes = await fetch('http://127.0.0.1:8000/api/player/scan', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ team_id: teamDocId, player_id: playerId, qr_token: code })
           });
           if (fallbackRes.ok) {
             const data = await fallbackRes.json();
             handleSuccess(data);
             return;
           } else {
             const errData = await fallbackRes.json().catch(() => ({ detail: 'Scan Failed' }));
             throw new Error(errData.detail || 'Location mismatch or unauthorized.');
           }
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ detail: 'Scan Failed' }));
          throw new Error(errData.detail || 'Location mismatch or unauthorized.');
        }

        const data = await res.json();
        handleSuccess(data);

      } catch (err: any) {
        soundFx.playAccessDenied();
        setScanState('error');
        setMessage('LOCATION MISMATCH');
        setErrorDetails(err.message || 'This is not the correct location for your current step.');
      }
    };

    processScan();
  }, []);

  const handleSuccess = (data: any) => {
    soundFx.playAccessGranted();
    setScanState('success');
    setMessage('LOCATION SECURED');
    setErrorDetails(`Moved to step ${data.team.current_step}`);
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#070204] flex flex-col items-center justify-center p-4">
      {/* Background Poster */}
      <div 
        className="fixed inset-0 bg-contain sm:bg-cover bg-top sm:bg-center bg-no-repeat z-0 bg-[#070204] opacity-30"
        style={{ backgroundImage: `url('/poster.jpg')` }}
      />
      <div className="fixed inset-0 bg-[#070204]/80 z-0 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-[#090205]/95 p-6 sm:p-8 rounded-2xl border shadow-2xl flex flex-col items-center text-center transition-all duration-300">
        
        {scanState === 'scanning' && (
          <div className="border-[#00ff66]/50 shadow-[0_0_30px_rgba(0,255,102,0.15)] rounded-2xl p-6 w-full flex flex-col items-center">
            <div className="relative mb-6">
              <QrCode className="w-20 h-20 text-[#00ff66] animate-pulse" />
              <div className="absolute inset-0 border-t-2 border-[#00ff66] animate-bounce opacity-70" />
            </div>
            <h2 className="font-digital text-lg text-[#00ff66] tracking-widest uppercase animate-pulse">{message}</h2>
            <p className="font-digital text-zinc-400 text-xs mt-2">DO NOT CLOSE THIS FREQUENCY...</p>
          </div>
        )}

        {scanState === 'success' && (
          <div className="border-[#00ff66]/60 shadow-[0_0_40px_rgba(0,255,102,0.3)] rounded-2xl p-6 w-full flex flex-col items-center bg-[#00ff66]/5">
            <CheckCircle2 className="w-24 h-24 text-[#00ff66] mb-4 drop-shadow-[0_0_12px_#00ff66]" />
            <h2 className="font-digital text-xl text-[#00ff66] tracking-widest font-bold uppercase">{message}</h2>
            <p className="font-digital text-zinc-300 text-sm mt-3">{errorDetails}</p>
            
            <button 
              onClick={() => window.location.href = '/'}
              className="mt-8 w-full py-3 bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66] font-digital font-bold tracking-widest uppercase hover:bg-[#00ff66]/30 transition rounded"
            >
              RETURN TO HUB
            </button>
          </div>
        )}

        {scanState === 'error' && (
          <div className="border-[#ff0033]/60 shadow-[0_0_40px_rgba(255,0,51,0.3)] rounded-2xl p-6 w-full flex flex-col items-center bg-[#ff0033]/5">
            <ShieldAlert className="w-24 h-24 text-[#ff0033] mb-4 drop-shadow-[0_0_12px_#ff0033]" />
            <h2 className="font-digital text-xl text-[#ff0033] tracking-widest font-bold uppercase">{message}</h2>
            <p className="font-digital text-red-200 text-sm mt-3 px-2">{errorDetails}</p>
            
            <div className="mt-8 flex flex-col gap-3 w-full">
               <button 
                 onClick={() => window.location.href = '/'}
                 className="w-full py-3 bg-[#ff0033]/20 border border-[#ff0033] text-[#ff0033] font-digital font-bold tracking-widest uppercase hover:bg-[#ff0033]/30 transition rounded flex items-center justify-center gap-2"
               >
                 <Home className="w-4 h-4" /> RETURN TO HUB
               </button>
               {errorDetails.includes('AUTHENTICATION REQUIRED') && (
                 <button 
                   onClick={() => window.location.href = '/'}
                   className="w-full py-3 bg-zinc-800 border border-zinc-700 text-white font-digital font-bold tracking-widest uppercase hover:bg-zinc-700 transition rounded"
                 >
                   GO TO LOGIN
                 </button>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
