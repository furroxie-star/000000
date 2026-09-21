import React, { useState } from 'react';
import { X, Save, Download, Tag, Music, Layers, Check } from 'lucide-react';
import { BeatGenre, BeatRecordStep, SavedBeat, SoundKitId } from '../types';
import { GENRE_COLORS, saveBeatToStorage, exportBeatAsJson } from '../utils/savedBeatsStorage';
import { SOUND_KITS } from '../data/drumKits';

interface SaveAsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordedSteps: BeatRecordStep[];
  recordDuration: number;
  currentKit: SoundKitId;
  onSaved: (savedBeat: SavedBeat) => void;
  onLoadPresetIfEmpty?: () => void;
}

const GENRES: BeatGenre[] = [
  'Trap',
  'Hip-Hop',
  'EDM / Dance',
  'House',
  'Synthwave',
  'Lo-Fi',
  'Acoustic',
  'Custom',
];

export function SaveAsModal({
  isOpen,
  onClose,
  recordedSteps,
  recordDuration,
  currentKit,
  onSaved,
  onLoadPresetIfEmpty,
}: SaveAsModalProps) {
  const [name, setName] = useState(`My Beat #${Math.floor(Math.random() * 900 + 100)}`);
  const [selectedGenre, setSelectedGenre] = useState<BeatGenre>('Trap');
  const [selectedKit, setSelectedKit] = useState<SoundKitId>(currentKit);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const currentKitInfo = SOUND_KITS.find((k) => k.id === selectedKit) || SOUND_KITS[0];
  const hitCount = recordedSteps.length;
  const durationSec = (recordDuration / 1000).toFixed(1);

  const handleSaveToLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (hitCount === 0) return;

    const newBeat = saveBeatToStorage({
      name: name.trim() || 'Untitled Beat',
      genre: selectedGenre,
      kitId: selectedKit,
      durationMs: recordDuration,
      steps: recordedSteps,
    });

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onSaved(newBeat);
      onClose();
    }, 600);
  };

  const handleExportFile = () => {
    if (hitCount === 0) return;
    const tempBeat: SavedBeat = {
      id: `beat-${Date.now()}`,
      name: name.trim() || 'Untitled Beat',
      genre: selectedGenre,
      kitId: selectedKit,
      durationMs: recordDuration,
      steps: recordedSteps,
      createdAt: Date.now(),
    };
    exportBeatAsJson(tempBeat);
  };

  return (
    <div
      id="save-as-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        id="save-as-modal-content"
        className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#0f172a] p-5 sm:p-6 shadow-2xl text-slate-100"
      >
        {/* Close Button */}
        <button
          id="btn-close-modal"
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Save className="h-5 w-5" />
          </div>
          <div>
            <h2 id="modal-title" className="text-lg font-bold text-white flex items-center gap-2">
              Save Beat As...
            </h2>
            <p className="text-xs text-slate-400">
              Save your recorded rhythm with custom name, genre type, and kit
            </p>
          </div>
        </div>

        {/* If no steps have been recorded yet */}
        {hitCount === 0 ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center my-4">
            <p className="text-sm font-semibold text-amber-300 mb-2">
              No drum hits recorded yet!
            </p>
            <p className="text-xs text-slate-300 mb-3">
              Press "Record Beat" and tap the pads, or load a groove preset first to save it.
            </p>
            {onLoadPresetIfEmpty && (
              <button
                type="button"
                onClick={() => {
                  onLoadPresetIfEmpty();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Load Sample Groove to Save
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSaveToLibrary} className="flex flex-col gap-4">
            {/* Beat Name Input */}
            <div>
              <label
                htmlFor="input-beat-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Beat Title
              </label>
              <input
                id="input-beat-name"
                type="text"
                required
                maxLength={40}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neon Horizon Drop"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {/* Save As Type / Genre Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-cyan-400" />
                  Save As Type (Genre)
                </label>
                <span className="text-[11px] font-mono text-cyan-400">
                  {selectedGenre}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  const color = GENRE_COLORS[genre];
                  return (
                    <button
                      key={genre}
                      id={`genre-option-${genre.toLowerCase().replace(/[^a-z]/g, '')}`}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      className={`
                        px-2.5 py-2 rounded-xl text-xs font-semibold text-center transition-all border
                        ${
                          isSelected
                            ? `${color.badge} ${color.border} ring-1 ring-cyan-400 shadow-md font-bold`
                            : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }
                      `}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sound Kit Association */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-fuchsia-400" />
                Associated Sound Kit
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SOUND_KITS.map((kit) => (
                  <button
                    key={kit.id}
                    type="button"
                    onClick={() => setSelectedKit(kit.id)}
                    className={`
                      px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition-all
                      ${
                        selectedKit === kit.id
                          ? 'border-fuchsia-400 bg-fuchsia-500/15 text-white font-semibold'
                          : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700'
                      }
                    `}
                  >
                    <div className="truncate">{kit.name}</div>
                    <div className="text-[10px] opacity-60 font-mono">{kit.badge}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recorded Beat Preview Stats */}
            <div className="flex items-center justify-between rounded-xl bg-slate-900/80 border border-slate-800 px-3.5 py-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                {hitCount} drum hits
              </span>
              <span className="text-slate-400 font-mono">
                Duration: <strong className="text-cyan-300">{durationSec}s</strong> loop
              </span>
              <span className="text-slate-400 font-mono">
                Kit: <strong className="text-slate-200">{currentKitInfo.name}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-800">
              <button
                id="btn-confirm-save-library"
                type="submit"
                disabled={isSavedSuccess}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95"
              >
                {isSavedSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved to Library!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save to My Library</span>
                  </>
                )}
              </button>

              <button
                id="btn-export-json-file"
                type="button"
                onClick={handleExportFile}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
                title="Download beat configuration file"
              >
                <Download className="h-4 w-4" />
                <span>Export .beat</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
