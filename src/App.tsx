/**
 * Interactive Drum Pad / Beat Maker
 * Student of the Month Challenge Solution
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { DRUM_PADS } from './data/drumKits';
import { DrumPad } from './components/DrumPad';
import { VolumeControl } from './components/VolumeControl';
import { KitSelector } from './components/KitSelector';
import { AudioVisualizer } from './components/AudioVisualizer';
import { BeatLooper } from './components/BeatLooper';
import { SaveAsModal } from './components/SaveAsModal';
import { SavedBeatsLibrary } from './components/SavedBeatsLibrary';
import { drumAudio } from './utils/audioEngine';
import { getSavedBeats } from './utils/savedBeatsStorage';
import { BeatRecordStep, KeyboardLayout, SavedBeat, SoundId, SoundKitId } from './types';
import { HelpCircle } from 'lucide-react';

export default function App() {
  const [activePads, setActivePads] = useState<Record<SoundId, boolean>>({
    kick: false,
    snare: false,
    hihat: false,
    openhat: false,
    clap: false,
    tom_low: false,
    tom_high: false,
    crash: false,
    perc: false,
  });

  const [currentKit, setCurrentKit] = useState<SoundKitId>('neon-cyber');
  const [layout, setLayout] = useState<KeyboardLayout>('homeRow');
  const [volume, setVolume] = useState<number>(0.85);
  const [lastTriggeredName, setLastTriggeredName] = useState<string>('Ready to play');

  // Beat Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSteps, setRecordedSteps] = useState<BeatRecordStep[]>([]);
  const [recordDuration, setRecordDuration] = useState<number>(4000);
  const recordStartTimeRef = useRef<number>(0);

  // Saved Beats & Library State
  const [savedBeats, setSavedBeats] = useState<SavedBeat[]>(() => getSavedBeats());
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [activePlayingBeatId, setActivePlayingBeatId] = useState<string | null>(null);
  const [isLoopPlaying, setIsLoopPlaying] = useState<boolean>(false);

  // Audio trigger function
  const triggerPad = useCallback(
    (soundId: SoundId) => {
      // 1. Play sound instantly with 0ms latency
      drumAudio.playSound(soundId);

      // 2. Set active visual state
      setActivePads((prev) => ({ ...prev, [soundId]: true }));

      // Find pad name for status display
      const padConfig = DRUM_PADS.find((p) => p.id === soundId);
      if (padConfig) {
        setLastTriggeredName(`${padConfig.name} (${padConfig.keyLabels[layout]})`);
      }

      // 3. Record step if recording is running
      if (isRecording) {
        const elapsed = Date.now() - recordStartTimeRef.current;
        setRecordedSteps((prev) => [...prev, { soundId, timestamp: elapsed }]);
      }
    },
    [layout, isRecording]
  );

  const releasePad = useCallback((soundId: SoundId) => {
    setActivePads((prev) => ({ ...prev, [soundId]: false }));
  }, []);

  // Handle pointer click trigger (also sets temporary release timer for click interaction)
  const handlePadPointerTrigger = useCallback(
    (soundId: SoundId) => {
      triggerPad(soundId);
    },
    [triggerPad]
  );

  const handlePadPointerRelease = useCallback(
    (soundId: SoundId) => {
      releasePad(soundId);
    },
    [releasePad]
  );

  // Global Keyboard Listener (Level 2 & 3 requirement)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is interacting with an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ignore held-down key repeats for drum hits
      if (e.repeat) return;

      const pressedKey = e.key.toUpperCase();

      // Find pad matching the key in active layout OR alternative layouts
      const matchedPad = DRUM_PADS.find(
        (pad) =>
          pad.keyLabels[layout].toUpperCase() === pressedKey ||
          pad.keyLabels.homeRow.toUpperCase() === pressedKey ||
          pad.keyLabels.mpcGrid.toUpperCase() === pressedKey ||
          pad.keyLabels.numpad === pressedKey
      );

      if (matchedPad) {
        e.preventDefault();
        triggerPad(matchedPad.id);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const releasedKey = e.key.toUpperCase();

      const matchedPad = DRUM_PADS.find(
        (pad) =>
          pad.keyLabels[layout].toUpperCase() === releasedKey ||
          pad.keyLabels.homeRow.toUpperCase() === releasedKey ||
          pad.keyLabels.mpcGrid.toUpperCase() === releasedKey ||
          pad.keyLabels.numpad === releasedKey
      );

      if (matchedPad) {
        e.preventDefault();
        releasePad(matchedPad.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [layout, triggerPad, releasePad]);

  // Handle Kit Change
  const handleKitChange = (kitId: SoundKitId) => {
    setCurrentKit(kitId);
    drumAudio.setKit(kitId);
  };

  // Handle Volume Change (Bonus Challenge / Tie-Breaker)
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    drumAudio.setVolume(newVol);
  };

  // Recording Handlers
  const handleStartRecord = () => {
    setRecordedSteps([]);
    setIsRecording(true);
    recordStartTimeRef.current = Date.now();
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    const totalTime = Date.now() - recordStartTimeRef.current;
    setRecordDuration(Math.max(1000, totalTime));
  };

  const handleClearRecord = () => {
    setIsRecording(false);
    setRecordedSteps([]);
    setRecordDuration(4000);
  };

  const handleLoadDemoBeat = (steps: BeatRecordStep[], loopDuration: number) => {
    setIsRecording(false);
    setRecordedSteps(steps);
    setRecordDuration(loopDuration);
  };

  const handleRefreshSavedBeats = () => {
    setSavedBeats(getSavedBeats());
  };

  const handleLoadBeat = (beat: SavedBeat, autoPlay = false) => {
    setIsRecording(false);
    setRecordedSteps(beat.steps);
    setRecordDuration(beat.durationMs);

    // Switch to beat's kit
    if (beat.kitId && beat.kitId !== currentKit) {
      setCurrentKit(beat.kitId);
      drumAudio.setKit(beat.kitId);
    }

    setLastTriggeredName(`Loaded: ${beat.name}`);

    if (autoPlay) {
      setActivePlayingBeatId(beat.id);
      setIsLoopPlaying(true);
    } else {
      setActivePlayingBeatId(null);
      setIsLoopPlaying(false);
    }
  };

  const handleStopLoop = () => {
    setActivePlayingBeatId(null);
    setIsLoopPlaying(false);
  };

  const handleSavedBeat = (newBeat: SavedBeat) => {
    handleRefreshSavedBeats();
    setLastTriggeredName(`Saved: ${newBeat.name}`);
  };

  const handleLoadPresetIfEmpty = () => {
    const loopLen = 3428;
    const steps: BeatRecordStep[] = [
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
    ];
    setRecordedSteps(steps);
    setRecordDuration(loopLen);
    setLastTriggeredName('Preset loaded for saving');
  };

  const activeCount = Object.values(activePads).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center justify-between p-3 sm:p-5 md:p-8 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Neon Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Interactive Drum Pad <span className="text-cyan-400">/</span> Beat Maker
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Tap pads or use your keyboard to jam, record custom loops, and save beats
            </p>
          </div>

          {/* Real-time Status Pill */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className={`h-2 w-2 rounded-full ${activeCount > 0 ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
              <span className="font-mono text-slate-400">Status:</span>
              <span className="font-mono font-semibold text-cyan-300">{lastTriggeredName}</span>
            </div>
          </div>
        </header>

        {/* Global Controls Row: Sound Kit & Volume Slider (Tie-Breaker) */}
        <section aria-label="Drum Kit Settings and Volume Controls" className="flex flex-col gap-3">
          <KitSelector
            currentKit={currentKit}
            onKitChange={handleKitChange}
            layout={layout}
            onLayoutChange={setLayout}
          />

          <VolumeControl
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />

          <AudioVisualizer activePadCount={activeCount} />
        </section>

        {/* Main 3x3 Center-Aligned Drum Pad Grid */}
        <main
          id="drum-grid-container"
          aria-label="3x3 Interactive Drum Pads"
          className="w-full my-1 sm:my-2"
        >
          <div
            id="drum-pad-grid"
            className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 w-full max-w-2xl mx-auto"
          >
            {DRUM_PADS.map((pad) => (
              <DrumPad
                key={pad.id}
                pad={pad}
                isActive={!!activePads[pad.id]}
                layout={layout}
                onTrigger={handlePadPointerTrigger}
                onRelease={handlePadPointerRelease}
              />
            ))}
          </div>
        </main>

        {/* Beat Looper & Metronome Section (Advanced Feature) */}
        <section aria-label="Beat Looper and Recording">
          <BeatLooper
            onTriggerSound={triggerPad}
            recordedSteps={recordedSteps}
            isRecording={isRecording}
            onStartRecord={handleStartRecord}
            onStopRecord={handleStopRecord}
            onClearRecord={handleClearRecord}
            onLoadDemoBeat={handleLoadDemoBeat}
            recordDuration={recordDuration}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
            isPlayingExternal={isLoopPlaying}
            onTogglePlayExternal={(playing) => {
              setIsLoopPlaying(playing);
              if (!playing) setActivePlayingBeatId(null);
            }}
          />
        </section>

        {/* Saved Beats Library Section */}
        <SavedBeatsLibrary
          savedBeats={savedBeats}
          onRefreshBeats={handleRefreshSavedBeats}
          onLoadBeat={handleLoadBeat}
          activePlayingBeatId={activePlayingBeatId}
          onStopLoop={handleStopLoop}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
        />

        {/* How to Play Guide */}
        <footer className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-xs text-slate-400 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm border-b border-slate-800/70 pb-2">
            <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>How to Play</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Simple Level */}
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 p-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shrink-0 mt-0.5">
                Simple Level
              </span>
              <p className="text-slate-300 leading-relaxed">
                Click or tap any pad on screen, or press the matching keys on your keyboard ({layout === 'homeRow' ? 'A, S, D, F, G, H, J, K, L' : 'Q, W, E, A, S, D, Z, X, C'}). Each key press triggers instant, polyphonic drum audio.
              </p>
            </div>

            {/* Medium Level */}
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 p-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 shrink-0 mt-0.5">
                Medium Level
              </span>
              <p className="text-slate-300 leading-relaxed">
                Hit <strong>Record Beat</strong> in the Looper to layer rhythms in real time. Use the metronome and BPM controls to stay in time, swap sound kits, and hit <strong>Save As...</strong> to classify and store your beats.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Save As Type Modal */}
      <SaveAsModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        recordedSteps={recordedSteps}
        recordDuration={recordDuration}
        currentKit={currentKit}
        onSaved={handleSavedBeat}
        onLoadPresetIfEmpty={handleLoadPresetIfEmpty}
      />
    </div>
  );
}
