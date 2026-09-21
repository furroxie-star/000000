import { BeatGenre, SavedBeat, SoundKitId } from '../types';

const STORAGE_KEY = 'interactive_drum_pad_saved_beats_v1';

export const GENRE_COLORS: Record<BeatGenre, { badge: string; border: string; glow: string }> = {
  'Trap': {
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    border: 'border-rose-500/30',
    glow: 'rgba(244, 63, 94, 0.4)',
  },
  'Hip-Hop': {
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    border: 'border-fuchsia-500/30',
    glow: 'rgba(217, 70, 239, 0.4)',
  },
  'EDM / Dance': {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    border: 'border-cyan-500/30',
    glow: 'rgba(6, 182, 212, 0.4)',
  },
  'House': {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    border: 'border-amber-500/30',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  'Synthwave': {
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    border: 'border-purple-500/30',
    glow: 'rgba(168, 85, 247, 0.4)',
  },
  'Lo-Fi': {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    border: 'border-emerald-500/30',
    glow: 'rgba(16, 185, 129, 0.4)',
  },
  'Acoustic': {
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    border: 'border-orange-500/30',
    glow: 'rgba(249, 115, 22, 0.4)',
  },
  'Custom': {
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    border: 'border-slate-500/30',
    glow: 'rgba(148, 163, 184, 0.4)',
  },
};

const DEFAULT_SAMPLE_BEATS: SavedBeat[] = [
  {
    id: 'beat-preset-1',
    name: 'Cyberpunk Neon Rush',
    genre: 'Synthwave',
    kitId: 'neon-cyber',
    durationMs: 3428,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    bpm: 140,
    steps: [
      { soundId: 'kick', timestamp: 0 },
      { soundId: 'hihat', timestamp: 0 },
      { soundId: 'hihat', timestamp: 214 },
      { soundId: 'snare', timestamp: 857 },
      { soundId: 'hihat', timestamp: 857 },
      { soundId: 'hihat', timestamp: 1071 },
      { soundId: 'kick', timestamp: 1285 },
      { soundId: 'hihat', timestamp: 1285 },
      { soundId: 'kick', timestamp: 1500 },
      { soundId: 'hihat', timestamp: 1500 },
      { soundId: 'snare', timestamp: 1714 },
      { soundId: 'clap', timestamp: 1714 },
      { soundId: 'hihat', timestamp: 1714 },
      { soundId: 'hihat', timestamp: 1928 },
      { soundId: 'perc', timestamp: 2142 },
      { soundId: 'hihat', timestamp: 2142 },
      { soundId: 'hihat', timestamp: 2356 },
      { soundId: 'snare', timestamp: 2571 },
      { soundId: 'hihat', timestamp: 2571 },
      { soundId: 'hihat', timestamp: 2785 },
      { soundId: 'kick', timestamp: 3000 },
      { soundId: 'openhat', timestamp: 3214 },
    ],
  },
  {
    id: 'beat-preset-2',
    name: 'Midnight 808 Trap Stomp',
    genre: 'Trap',
    kitId: 'urban-808',
    durationMs: 3200,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    bpm: 130,
    steps: [
      { soundId: 'kick', timestamp: 0 },
      { soundId: 'hihat', timestamp: 0 },
      { soundId: 'hihat', timestamp: 200 },
      { soundId: 'hihat', timestamp: 400 },
      { soundId: 'hihat', timestamp: 600 },
      { soundId: 'snare', timestamp: 800 },
      { soundId: 'clap', timestamp: 800 },
      { soundId: 'hihat', timestamp: 800 },
      { soundId: 'hihat', timestamp: 1000 },
      { soundId: 'kick', timestamp: 1200 },
      { soundId: 'hihat', timestamp: 1200 },
      { soundId: 'hihat', timestamp: 1400 },
      { soundId: 'kick', timestamp: 1500 },
      { soundId: 'snare', timestamp: 1600 },
      { soundId: 'hihat', timestamp: 1600 },
      { soundId: 'hihat', timestamp: 1800 },
      { soundId: 'perc', timestamp: 2000 },
      { soundId: 'hihat', timestamp: 2000 },
      { soundId: 'hihat', timestamp: 2200 },
      { soundId: 'snare', timestamp: 2400 },
      { soundId: 'clap', timestamp: 2400 },
      { soundId: 'hihat', timestamp: 2400 },
      { soundId: 'kick', timestamp: 2700 },
      { soundId: 'kick', timestamp: 2900 },
      { soundId: 'openhat', timestamp: 3000 },
    ],
  },
  {
    id: 'beat-preset-3',
    name: 'Club Four-on-the-Floor',
    genre: 'House',
    kitId: 'neon-cyber',
    durationMs: 1936,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    bpm: 124,
    steps: [
      { soundId: 'kick', timestamp: 0 },
      { soundId: 'hihat', timestamp: 242 },
      { soundId: 'kick', timestamp: 484 },
      { soundId: 'clap', timestamp: 484 },
      { soundId: 'openhat', timestamp: 726 },
      { soundId: 'kick', timestamp: 968 },
      { soundId: 'hihat', timestamp: 1210 },
      { soundId: 'kick', timestamp: 1452 },
      { soundId: 'clap', timestamp: 1452 },
      { soundId: 'openhat', timestamp: 1694 },
    ],
  },
];

export function getSavedBeats(): SavedBeat[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial high-quality beats so the user has immediate access
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAMPLE_BEATS));
      return DEFAULT_SAMPLE_BEATS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SAMPLE_BEATS;
  } catch {
    return DEFAULT_SAMPLE_BEATS;
  }
}

export function saveBeatToStorage(beat: Omit<SavedBeat, 'id' | 'createdAt'> & { id?: string }): SavedBeat {
  const currentBeats = getSavedBeats();
  const newBeat: SavedBeat = {
    ...beat,
    id: beat.id || `beat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };

  const updated = [newBeat, ...currentBeats.filter((b) => b.id !== newBeat.id)];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
  return newBeat;
}

export function deleteSavedBeat(beatId: string): SavedBeat[] {
  const currentBeats = getSavedBeats();
  const updated = currentBeats.filter((b) => b.id !== beatId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update localStorage after delete:', err);
  }
  return updated;
}

export function exportBeatAsJson(beat: SavedBeat) {
  const jsonStr = JSON.stringify(beat, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = beat.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  a.href = url;
  a.download = `${safeName || 'drum_beat'}.beat.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importBeatFromJson(jsonString: string): SavedBeat {
  const parsed = JSON.parse(jsonString);
  if (!parsed.steps || !Array.isArray(parsed.steps)) {
    throw new Error('Invalid beat file structure: missing drum steps array.');
  }

  const importedBeat: SavedBeat = {
    id: `beat-imported-${Date.now()}`,
    name: parsed.name ? `${parsed.name} (Imported)` : 'Imported Beat',
    genre: parsed.genre || 'Custom',
    kitId: parsed.kitId || 'neon-cyber',
    durationMs: parsed.durationMs || 4000,
    steps: parsed.steps,
    createdAt: Date.now(),
    bpm: parsed.bpm || 128,
  };

  saveBeatToStorage(importedBeat);
  return importedBeat;
}
