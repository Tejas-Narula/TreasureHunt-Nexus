import React from 'react';

interface GameStatusPageProps {
  status: 'waiting' | 'paused' | 'ended';
}

export const GameStatusPage: React.FC<GameStatusPageProps> = ({ status }) => {
  let message = 'Waiting for mission to begin...';
  if (status === 'paused') {
    message = 'Mission Paused';
  } else if (status === 'ended') {
    message = 'Mission Ended';
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <h1 className="text-2xl font-bold text-white tracking-widest animate-pulse font-mono text-center px-4">
        {message}
      </h1>
    </div>
  );
};
