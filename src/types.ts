export type SoundId = 
  | 'kick'
  | 'snare'
  | 'hihat'
  | 'openhat'
  | 'clap'
  | 'tom_low'
  | 'tom_high'
  | 'crash'
  | 'perc';

export type KeyboardLayout = 'homeRow' | 'mpcGrid' | 'numpad';

export interface PadConfig {
  id: SoundId;
  name: string;
  category: 'kick' | 'snare' | 'hihat' | 'cymbal' | 'percussion';
  keyLabels: {
    homeRow: string;
    mpcGrid: string;
    numpad: string;
  };
  color: {
    base: string;
    glow: string;
    border: string;
    activeBg: string;
    text: string;
    led: string;
  };
  description: string;
}

export type SoundKitId = 'neon-cyber' | 'urban-808' | 'studio-acoustic';

export interface SoundKit {
  id: SoundKitId;
  name: string;
  badge: string;
  description: string;
}

export interface BeatRecordStep {
  soundId: SoundId;
  timestamp: number;
}

export type BeatGenre = 
  | 'Trap'
  | 'Hip-Hop'
  | 'EDM / Dance'
  | 'House'
  | 'Synthwave'
  | 'Lo-Fi'
  | 'Acoustic'
  | 'Custom';

export interface SavedBeat {
  id: string;
  name: string;
  genre: BeatGenre;
  kitId: SoundKitId;
  durationMs: number;
  steps: BeatRecordStep[];
  createdAt: number;
  bpm?: number;
}
