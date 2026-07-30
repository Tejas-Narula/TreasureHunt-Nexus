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

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle Spores configuration
    const particleCount = themeMode === 'upsidedown' ? 120 : 60;
    interface Spore {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      pulseSpeed: number;
    }

    const spores: Spore[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * 0.8 + 0.2), // float upward
      speedX: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.8 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }));

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

      // Render floating spores
      spores.forEach((spore) => {
        spore.y += spore.speedY;
        spore.x += spore.speedX + Math.sin(spore.y * 0.01) * 0.3;

        // Reset if spore floats off screen
        if (spore.y < -10) {
          spore.y = height + 10;
          spore.x = Math.random() * width;
        }

        spore.opacity += Math.sin(Date.now() * spore.pulseSpeed) * 0.01;
        const currentOpacity = Math.max(0.1, Math.min(0.9, spore.opacity));

        ctx.save();
        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.size, 0, Math.PI * 2);

        // Red atmospheric spore glow
        ctx.fillStyle = themeMode === 'upsidedown' 
          ? `rgba(255, 30, 60, ${currentOpacity})`
          : `rgba(255, 80, 100, ${currentOpacity * 0.8})`;

        ctx.shadowColor = '#ff0033';
        ctx.shadowBlur = spore.size * 4;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
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
