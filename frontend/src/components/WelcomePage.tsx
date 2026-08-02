import React from 'react';
import { soundFx } from '../utils/audio';

interface WelcomePageProps {
  onEnter: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ onEnter }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playAccessGranted();
    onEnter();
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#070204] flex flex-col justify-between items-center p-3 sm:p-6 overflow-y-auto overflow-x-hidden touch-manipulation select-none">
      {/* 
        Full Background Image 
      */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 bg-[#070204]"
        style={{ backgroundImage: `url('/loginbg.webp')` }}
      />
      
      {/* Ambient dark bottom vignette gradient overlay to enhance text readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-[#070204] via-[#070204]/40 to-transparent z-0 pointer-events-none" />

      {/* Centered Large Logo Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center my-auto shrink-0 overflow-visible">
        <img 
          src="/logo.png" 
          alt="Treasure hunt Logo" 
          className="h-auto object-contain drop-shadow-[0_0_35px_rgba(255,0,51,0.85)] transition-transform duration-200 pointer-events-none"
          style={{ 
            width: '360px',
            maxWidth: '70vw',
            transform: 'translateY(-140px) scale(1.05)'
          }}
        />
      </div>

      {/* Bottom Button Container */}
      <div className="relative z-10 w-full max-w-[280px] sm:max-w-xs mx-auto mb-4 sm:mb-8 shrink-0">
        <form onSubmit={handleSubmit} className="w-full space-y-2">
          
          {/* Primary Action Button - Custom enter.png */}
          <button
            type="submit"
            className="w-full flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-[1.04] active:scale-[0.96] focus:outline-none"
          >
            <img 
              src="/enter.png" 
              alt="ENTER HAWKINS" 
              className="w-full max-w-[210px] sm:max-w-[250px] h-auto object-contain brightness-85 transition-all duration-300 hover:brightness-100 group-hover:scale-105"
            />
          </button>
        </form>
      </div>

      <div className="h-2 w-full z-10 shrink-0 pointer-events-none" />
    </div>
  );
};
