import type { TransmissionMessage } from '../../../types';

/**
 * Dummy data for the Mission page — swap for real backend data
 * (GET /player/mission or similar) once the API is wired up.
 */

export interface MissionClue extends TransmissionMessage {
  /** Lines rendered one-per-line in the transmission body (matches the reference design). */
  introLines: string[];
  /** The value that will be encoded into the QR code for this clue, once real QR encoding is built. */
  qrValue: string;
  objectiveTitle: string;
  objectiveDesc: string;
}

export const DUMMY_SIGNAL_STRENGTH = 5; // out of 7 bars

export const DUMMY_CLUE: MissionClue = {
  id: 'clue-03',
  timestamp: '21:13:07',
  sender: 'DUSTIN HENDERSON',
  frequency: 'NEXUS-01',
  introLines: [
    'Hey, hey! You got a transmission.',
    "I've been picking up some weird readings",
    'on the shortwave. Decoding it now...',
    'Almost there...',
    "Here's what I've got for you:",
  ],
  encodedMessage:
    "Hey, hey! You got a transmission. I've been picking up some weird readings on the shortwave. Decoding it now... Almost there... Here's what I've got for you:",
  decodedMessage:
    'The next location is where knowledge is locked away in dusty silence. Look for the place where the past never stops whispering.',
  isDecoded: true,
  qrValue: 'https://intotheupsidedown.live/clue/04?team=NX7Q',
  objectiveTitle: 'FIND THE NEXT LOCATION',
  objectiveDesc: 'Head there and scan the QR code to receive the next transmission.',
};

export const DUMMY_DECODED_NOTE =
  'Transmission converted from frequency 14.235 MHz using NEXUS decoder.';

export const DUMMY_TEAM_INFO = {
  teamName: 'TEAM NEXUS',
  trail: 'B',
  missionCurrent: 2,
  missionTotal: 5,
  status: 'ACTIVE',
  initialElapsedSeconds: 42 * 60 + 18, // 00:42:18
};

export const DUMMY_TRAIL_NODES = [
  { id: 1, label: 'The Old Library' },
  { id: 2, label: 'Hawkins High Gymnasium' },
  { id: 3, label: "Melvald's General Store" },
  { id: 4, label: 'Sattler Quarry' },
  { id: 5, label: 'Hawkins National Laboratory' },
];
