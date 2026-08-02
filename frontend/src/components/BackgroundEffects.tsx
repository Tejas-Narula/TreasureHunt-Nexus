import React, { useEffect, useRef } from 'react';
import type { ThemeMode } from '../types';

interface BackgroundEffectsProps {
  themeMode: ThemeMode;
}

export const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ themeMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      render();
    };

    window.addEventListener('resize', handleResize);

      const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background ambient dark vortex glow
      const centerX = width / 2;
      const centerY = height * 0.4;
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        50,
        centerX,
        centerY,
        Math.max(width, height) * 0.7
      );

      if (themeMode === 'upsidedown') {
        gradient.addColorStop(0, 'rgba(255, 0, 51, 0.35)');
        gradient.addColorStop(0.4, 'rgba(120, 0, 25, 0.2)');
        gradient.addColorStop(1, 'rgba(5, 1, 3, 0.95)');
      } else {
        gradient.addColorStop(0, 'rgba(200, 0, 40, 0.22)');
        gradient.addColorStop(0.5, 'rgba(80, 0, 15, 0.12)');
        gradient.addColorStop(1, 'rgba(7, 2, 4, 0.95)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [themeMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Vignette border frame */}
      <div 
        className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.9)]"
        style={{
          boxShadow: themeMode === 'upsidedown' 
            ? 'inset 0 0 150px rgba(0,0,0,0.95), inset 0 0 60px rgba(255,0,51,0.2)' 
            : 'inset 0 0 120px rgba(0,0,0,0.9)'
        }}
      />
      {/* Retro CRT Scanlines Overlay */}
      <div className="crt-overlay" />
    </div>
  );
};
