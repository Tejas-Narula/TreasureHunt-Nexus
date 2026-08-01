import { X, CheckCircle2, Lock, Radio } from 'lucide-react';

interface TrailNode {
  id: number;
  label: string;
}

interface TrailMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: TrailNode[];
  /** 1-based index of the clue the team is currently on. */
  currentIndex: number;
  trail: string;
}

// Hand-placed points so the trail reads like a winding path rather than a
// straight line. Extend this array if a real event ever has more stops.
const POSITIONS = [
  { x: 55, y: 440 },
  { x: 160, y: 360 },
  { x: 85, y: 250 },
  { x: 225, y: 175 },
  { x: 150, y: 60 },
];

/** Full-screen trail map — shows every clue location and how far the team has gotten. */
export function TrailMapModal({ isOpen, onClose, nodes, currentIndex, trail }: TrailMapModalProps) {
  if (!isOpen) return null;

  const points = nodes.map((_, i) => POSITIONS[i] ?? POSITIONS[POSITIONS.length - 1]);
  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Trail map"
      onClick={onClose}
    >
      <div
        className="nexus-panel w-full max-w-md p-4 sm:p-5 border-[#ff0033] shadow-[0_0_40px_rgba(255,0,51,0.5)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#ff0033]/30 pb-2.5 mb-4">
          <span className="font-digital text-xs sm:text-sm text-[#ff4d6d] font-bold tracking-[0.12em]">
            TRAIL {trail} · MAP
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close map"
            className="text-zinc-400 hover:text-white p-1 -m-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <svg viewBox="0 0 300 500" className="w-full h-auto max-h-[45vh]">
          <path d={pathD} fill="none" stroke="rgba(255,0,51,0.35)" strokeWidth="2" strokeDasharray="6 6" />
          {points.map((p, i) => {
            const nodeNumber = i + 1;
            const isComplete = nodeNumber < currentIndex;
            const isCurrent = nodeNumber === currentIndex;
            return (
              <g key={nodes[i].id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isCurrent ? 16 : 12}
                  fill={isComplete ? '#00ff66' : isCurrent ? '#ff0033' : '#1a0308'}
                  stroke={isCurrent ? '#ff3355' : 'rgba(255,0,51,0.5)'}
                  strokeWidth="2"
                  className={isCurrent ? 'pulse-beacon' : ''}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="var(--font-digital)"
                  fill={isComplete || isCurrent ? '#070204' : '#888'}
                >
                  {nodeNumber}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="mt-4 space-y-2">
          {nodes.map((n, i) => {
            const nodeNumber = i + 1;
            const isComplete = nodeNumber < currentIndex;
            const isCurrent = nodeNumber === currentIndex;
            return (
              <div
                key={n.id}
                className={`flex items-center gap-2 font-digital text-[11px] sm:text-xs px-2 py-1.5 rounded transition-colors ${
                  isCurrent
                    ? 'bg-[#ff0033]/10 border border-[#ff0033]/40 text-[#ff4d6d]'
                    : 'text-zinc-500'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00ff66] shrink-0" />
                ) : isCurrent ? (
                  <Radio className="w-3.5 h-3.5 text-[#ff0033] shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{n.label}</span>
                {isCurrent && (
                  <span className="ml-auto text-[9px] tracking-wider text-[#ff4d6d]">
                    YOU ARE HERE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TrailMapModal;
