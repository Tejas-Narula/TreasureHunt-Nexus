import { useEffect, useState } from 'react';

/**
 * Ticks up once a second from an initial number of seconds, formatted
 * HH:MM:SS. Used by TeamInfoCard for the live "Elapsed" readout.
 */
export function useElapsedTimer(initialSeconds: number, paused = false) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const hh = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(seconds % 60).toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}
