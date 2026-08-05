import { X, Skull, MapPin, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrailNode {
  id: number;
  label: string;
  type?: string;
}

interface TrailMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: TrailNode[];
  /** 1-based index of the clue the team is currently on. */
  currentIndex: number;
  trail: string;
}

export function TrailMapModal({ isOpen, onClose, nodes, currentIndex }: TrailMapModalProps) {
  if (!isOpen) return null;

  // Use a 4:3 aspect ratio coordinate system to match typical map images
  const width = 1024;
  const height = 768;
  
  const generatePoints = () => {
    const points = [];
    const count = nodes.length || 1;
    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1 || 1);
      // Winding path through the map area
      const x = 150 + (progress * (width - 300));
      // Zig zag Y to cover the map visually
      const yOffset = Math.sin(progress * Math.PI * 2.5) * 200;
      const y = height / 2 + yOffset;
      points.push({ x, y });
    }
    return points;
  };

  const points = generatePoints();
  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-8 bg-black/95 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Trail map"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl aspect-[4/3] rounded shadow-[0_0_100px_rgba(255,0,0,0.3)] flex overflow-hidden border-2 border-[#1a0509]"
        onClick={(e) => e.stopPropagation()}
      >


        {/* Map Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-85" 
          style={{ backgroundImage: "url('/map.png')" }}
        />
        
        {/* Upside Down Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-blue-900/10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] pointer-events-none" />

        <div className="relative w-full h-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-[0_0_15px_rgba(255,0,0,0.5)] z-10" preserveAspectRatio="xMidYMid slice">
            {/* Trail Path */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="rgba(255,0,51,0.6)" 
              strokeWidth="5" 
              strokeDasharray="12 12" 
              className="drop-shadow-[0_0_5px_rgba(255,0,0,1)]"
            />
            
            {points.map((p, i) => {
              const nodeNumber = i + 1;
              const isComplete = nodes[i].id < currentIndex;
              const isCurrent = nodes[i].id === currentIndex;
              const isTask = nodes[i].type === 'special_task';
              
              return (
                <g key={nodes[i].id} className="transition-all duration-700 hover:scale-125" style={{ transformOrigin: `${p.x}px ${p.y}px` }}>
                  {/* Stranger Things "Portal/Rift" Effect for nodes */}
                  {isCurrent && (
                    <>
                      <circle cx={p.x} cy={p.y} r="75" fill="rgba(255,0,51,0.15)" className="animate-ping" />
                      <circle cx={p.x} cy={p.y} r="60" fill="url(#rift-glow)" className="animate-pulse" />
                      <defs>
                        <radialGradient id="rift-glow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="rgba(255,0,51,0.6)" />
                          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </radialGradient>
                      </defs>
                    </>
                  )}
                  
                  {/* Node Shape */}
                  {isComplete ? (
                    <circle cx={p.x} cy={p.y} r="27" fill="#00ff66" opacity="0.8" stroke="#070204" strokeWidth="6" />
                  ) : isCurrent ? (
                    <path 
                      d={`M ${p.x} ${p.y-37} L ${p.x+30} ${p.y+22} L ${p.x-30} ${p.y+22} Z`} 
                      fill="#ff0033" 
                      stroke="#070204" 
                      strokeWidth="6" 
                      className="drop-shadow-[0_0_10px_rgba(255,0,51,1)]"
                    />
                  ) : (
                    <circle cx={p.x} cy={p.y} r="21" fill="#1a0509" stroke="#ff0033" strokeWidth="4" opacity="0.6" />
                  )}
                  
                  {/* Inner Icons/Numbers */}
                  {isComplete ? (
                    <path d={`M ${p.x - 9} ${p.y} L ${p.x - 3} ${p.y + 6} L ${p.x + 9} ${p.y - 6}`} fill="none" stroke="#070204" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  ) : isTask && !isCurrent ? (
                    <g transform={`translate(${p.x - 14}, ${p.y - 14}) scale(1.5)`} stroke="#ff0033" fill="none" strokeWidth="2">
                      <path d="M9 12l-5-3 5-3 5 3-5 3z" />
                      <path d="M9 12v6" />
                      <path d="M4 9v6l5 3" />
                      <path d="M14 9v6l-5 3" />
                    </g>
                  ) : !isCurrent && (
                    <text
                      x={p.x}
                      y={p.y + 7}
                      textAnchor="middle"
                      fontSize="20"
                      fontFamily="var(--font-digital)"
                      fill="#ff0033"
                      fontWeight="bold"
                    >
                      {nodeNumber}
                    </text>
                  )}

                  {/* Label (Floating Stranger Things style) */}
                  {isCurrent && (
                    <g transform={`translate(${p.x}, ${p.y + 50})`}>
                      <text
                        x="0"
                        y="20"
                        textAnchor="middle"
                        fontSize="24"
                        fontFamily="var(--font-itc)"
                        fill={isComplete ? '#00ff66' : isCurrent ? '#ff0033' : 'rgba(255,255,255,0.7)'}
                        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-widest"
                        style={{ textShadow: '2px 2px 4px black' }}
                      >
                        {nodes[i].label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

export default TrailMapModal;
