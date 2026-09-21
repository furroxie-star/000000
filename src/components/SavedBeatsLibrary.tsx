import React, { useState, useRef } from 'react';
import {
  FolderHeart,
  Play,
  Square,
  Upload,
  Download,
  Trash2,
  Search,
  Sliders,
  Music,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BeatGenre, BeatRecordStep, SavedBeat, SoundKitId } from '../types';
import {
  GENRE_COLORS,
  deleteSavedBeat,
  exportBeatAsJson,
  importBeatFromJson,
  saveBeatToStorage,
} from '../utils/savedBeatsStorage';
import { SOUND_KITS } from '../data/drumKits';

interface SavedBeatsLibraryProps {
  savedBeats: SavedBeat[];
  onRefreshBeats: () => void;
  onLoadBeat: (beat: SavedBeat, autoPlay?: boolean) => void;
  activePlayingBeatId: string | null;
  onStopLoop: () => void;
  onOpenSaveModal: () => void;
}

export function SavedBeatsLibrary({
  savedBeats,
  onRefreshBeats,
  onLoadBeat,
  activePlayingBeatId,
  onStopLoop,
  onOpenSaveModal,
}: SavedBeatsLibraryProps) {
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const genresList: string[] = [
    'All',
    'Trap',
    'Hip-Hop',
    'EDM / Dance',
    'House',
    'Synthwave',
    'Lo-Fi',
    'Acoustic',
    'Custom',
  ];

  const filteredBeats = savedBeats.filter((beat) => {
    const matchesGenre =
      selectedGenreFilter === 'All' || beat.genre === selectedGenreFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      beat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  const handleDelete = (e: React.MouseEvent, beatId: string) => {
    e.stopPropagation();
    if (activePlayingBeatId === beatId) {
      onStopLoop();
    }
    deleteSavedBeat(beatId);
    onRefreshBeats();
  };

  const handleExport = (e: React.MouseEvent, beat: SavedBeat) => {
    e.stopPropagation();
    exportBeatAsJson(beat);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importBeatFromJson(text);
        onRefreshBeats();
        onLoadBeat(imported, false);
      } catch (err) {
        console.error('Failed to import beat:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section
      id="saved-beats-library"
      aria-label="Saved Beats and Rhythm Library"
      className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 shadow-xl"
    >
      {/* Top Header Row with Expand Toggle and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <FolderHeart className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                My Saved Beats Library
              </h2>
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
                {savedBeats.length} {savedBeats.length === 1 ? 'beat' : 'beats'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Access, audition, loop, or export your saved drum rhythms
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Save As Trigger Button */}
          <button
            id="btn-open-save-modal-header"
            type="button"
            onClick={onOpenSaveModal}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Save As...</span>
          </button>

          {/* Import JSON button */}
          <button
            id="btn-import-beat-json"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
            title="Import a saved .beat.json file"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          {/* Toggle Expand/Collapse */}
          <button
            id="btn-toggle-library-collapse"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg border border-slate-800 bg-slate-800/80 p-1.5 text-slate-400 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse library' : 'Expand library'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3">
          {/* Filters & Search Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Genre Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" role="tablist">
              {genresList.map((g) => {
                const isActive = selectedGenreFilter === g;
                return (
                  <button
                    key={g}
                    id={`filter-tab-${g.toLowerCase().replace(/[^a-z]/g, '')}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedGenreFilter(g)}
                    className={`
                      whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border
                      ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }
                    `}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <input
                id="input-search-beats"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search beats..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900/90 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Beats Grid */}
          {filteredBeats.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 py-8 px-4 text-center">
              <Music className="h-8 w-8 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No beats found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {searchQuery
                  ? 'No beats match your search query. Try another keyword or clear filter.'
                  : 'You have not saved any beats under this type yet. Record a beat and click "Save As..."!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBeats.map((beat) => {
                const isPlayingThis = activePlayingBeatId === beat.id;
                const genreStyle = GENRE_COLORS[beat.genre] || GENRE_COLORS.Custom;
                const kitObj = SOUND_KITS.find((k) => k.id === beat.kitId);
                const durationSec = (beat.durationMs / 1000).toFixed(1);

                return (
                  <div
                    key={beat.id}
                    id={`beat-card-${beat.id}`}
                    className={`
                      relative group flex flex-col justify-between rounded-xl border p-3.5
                      transition-all duration-150 bg-slate-900/70
                      ${
                        isPlayingThis
                          ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_18px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                      }
                    `}
                  >
                    <div>
                      {/* Top Meta: Genre Badge & Kit Badge */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${genreStyle.badge}`}
                        >
                          {beat.genre}
                        </span>

                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          {kitObj?.name || 'Drum Kit'}
                        </span>
                      </div>

                      {/* Beat Title */}
                      <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
                        {beat.name}
                      </h3>

                      {/* Quick Stats: Hits, Duration, Date */}
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-3">
                        <span>{beat.steps.length} hits</span>
                        <span>•</span>
                        <span>{durationSec}s loop</span>
                        {beat.bpm && (
                          <>
                            <span>•</span>
                            <span>{beat.bpm} BPM</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="flex items-center justify-between gap-1.5 border-t border-slate-800/80 pt-2.5 mt-auto">
                      {/* Primary Audition/Loop Button */}
                      <button
                        id={`btn-play-beat-${beat.id}`}
                        type="button"
                        onClick={() => {
                          if (isPlayingThis) {
                            onStopLoop();
                          } else {
                            onLoadBeat(beat, true);
                          }
                        }}
                        className={`
                          flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all border
                          ${
                            isPlayingThis
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                              : 'bg-slate-800 border-slate-700 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/20'
                          }
                        `}
                      >
                        {isPlayingThis ? (
                          <>
                            <Square className="h-3 w-3 fill-current" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Play & Loop</span>
                          </>
                        )}
                      </button>

                      {/* Load only */}
                      <button
                        id={`btn-load-beat-${beat.id}`}
                        type="button"
                        onClick={() => onLoadBeat(beat, false)}
                        className="rounded-lg border border-slate-800 bg-slate-800/60 px-2 py-1 text-[11px] font-medium text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                        title="Load into Beat Looper without autoplay"
                      >
                        Load
                      </button>

                      {/* Export JSON */}
                      <button
                        id={`btn-export-beat-${beat.id}`}
                        type="button"
                        onClick={(e) => handleExport(e, beat)}
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                        title="Download as file"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        id={`btn-delete-beat-${beat.id}`}
                        type="button"
                        onClick={(e) => handleDelete(e, beat.id)}
                        className="rounded-lg p-1 text-slate-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                        title="Delete beat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
