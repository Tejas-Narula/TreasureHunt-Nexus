export type ThemeMode = 'hawkins' | 'upsidedown';

export interface OperativeUser {
  agentId: string;
  codename: string;
  clearance: string;
  avatarUrl?: string;
}

export interface MapSector {
  id: string;
  name: string;
  coordinates: string;
  status: 'locked' | 'unlocked' | 'corrupted';
  description: string;
  clueHint?: string;
  x: number; // percentage on map
  y: number; // percentage on map
}

export interface TransmissionMessage {
  id: string;
  timestamp: string;
  sender: string;
  frequency: string;
  encodedMessage: string;
  decodedMessage: string;
  isDecoded: boolean;
}

export interface MissionStats {
  timeTaken: string;
  finalScore: number;
  cluesSolved: number;
  totalClues: number;
  sporesSecured: number;
  riftsClosed: number;
  soulsSaved: number;
}
