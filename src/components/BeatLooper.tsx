import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Circle, RotateCcw, Activity, Save } from 'lucide-react';
import { BeatRecordStep, SoundId } from '../types';

interface BeatLooperProps {
  onTriggerSound: (soundId: SoundId) => void;
  recordedSteps: BeatRecordStep[];
  isRecording: boolean;
  onStartRecord: () => void;
  onStopRecord: () => void;
  onClearRecord: () => void;
  onLoadDemoBeat: (steps: BeatRecordStep[], loopDuration: number) => void;
  recordDuration: number;
  onOpenSaveModal: () => void;
  isPlayingExternal?: boolean;
  onTogglePlayExternal?: (shouldPlay: boolean) => void;
}

export function BeatLooper({
  onTriggerSound,
  recordedSteps,
  isRecording,
  onStartRecord,
  onStopRecord,
  onClearRecord,
  onLoadDemoBeat,
  recordDuration,
  onOpenSaveModal,
  isPlayingExternal,
  onTogglePlayExternal,
}: BeatLooperProps) {
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);
  const isPlaying = isPlayingExternal !== undefined ? isPlayingExternal : isPlayingInternal;
  const [bpm, setBpm] = useState(128);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [currentBeatPulse, setCurrentBeatPulse] = useState(0);

  const playbackTimeoutRefs = useRef<number[]>([]);
  const loopIntervalRef = useRef<number | null>(null);
  const metronomeIntervalRef = useRef<number | null>(null);

  // Metronome click generator using AudioContext
  const playMetronomeClick = useCallback((isHigh: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isHigh ? 1200 : 800, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext fallback
    }
  }, []);

  // Metronome runner
  useEffect(() => {
    if (!metronomeActive) {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      setCurrentBeatPulse(0);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    let beat = 0;

    const tick = () => {
      beat = (beat % 4) + 1;
      setCurrentBeatPulse(beat);
      playMetronomeClick(beat === 1);
    };

    tick();
    const timer = window.setInterval(tick, intervalMs);
    metronomeIntervalRef.current = timer;

    return () => {
      clearInterval(timer);
    };
  }, [metronomeActive, bpm, playMetronomeClick]);

  // Clean up playback timers
  const clearPlaybackTimers = () => {
    playbackTimeoutRefs.current.forEach((t) => clearTimeout(t));
    playbackTimeoutRefs.current = [];
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
  };

  const stopPlayback = () => {
    clearPlaybackTimers();
    setIsPlayingInternal(false);
    if (onTogglePlayExternal) {
      onTogglePlayExternal(false);
    }
  };

  const startPlayback = () => {
    if (recordedSteps.length === 0) return;
    clearPlaybackTimers();
    setIsPlayingInternal(true);
    if (onTogglePlayExternal) {
      onTogglePlayExternal(true);
    }

    const effectiveDuration = recordDuration > 0 ? recordDuration : 4000;

    const playSequence = () => {
      recordedSteps.forEach((step) => {
        const timeout = window.setTimeout(() => {
          onTriggerSound(step.soundId);
        }, step.timestamp);
        playbackTimeoutRefs.current.push(timeout);
      });
    };

    // Play first pass immediately
    playSequence();

    // Loop
    loopIntervalRef.current = window.setInterval(() => {
      playSequence();
    }, effectiveDuration);
  };

  useEffect(() => {
    if (isPlayingExternal === false && isPlayingInternal) {
      clearPlaybackTimers();
      setIsPlayingInternal(false);
    } else if (isPlayingExternal === true && !isPlayingInternal && recordedSteps.length > 0) {
      startPlayback();
    }
  }, [isPlayingExternal]);

  useEffect(() => {
    return () => {
      clearPlaybackTimers();
    };
  }, []);

  // Preset demo beats
  const loadDemoTrap = () => {
    stopPlayback();
    // 140 BPM 2-bar beat pattern (approx 3428ms loop)
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
    onLoadDemoBeat(steps, loopLen);
  };

  const loadDemoHouse = () => {
    stopPlayback();
    // Four on the floor house beat @ 124 BPM (loop: ~1935ms)
    const beatLen = 484;
    const loopLen = beatLen * 4;
    const steps: BeatRecordStep[] = [
      { soundId: 'kick', timestamp: 0 },
      { soundId: 'hihat', timestamp: beatLen / 2 },
      { soundId: 'kick', timestamp: beatLen },
      { soundId: 'clap', timestamp: beatLen },
      { soundId: 'openhat', timestamp: beatLen * 1.5 },
      { soundId: 'kick', timestamp: beatLen * 2 },
      { soundId: 'hihat', timestamp: beatLen * 2.5 },
      { soundId: 'kick', timestamp: beatLen * 3 },
      { soundId: 'clap', timestamp: beatLen * 3 },
      { soundId: 'openhat', timestamp: beatLen * 3.5 },
    ];
    onLoadDemoBeat(steps, loopLen);
  };

  return (
    <div
      id="beat-looper-panel"
      className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4 text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wider text-slate-200">
            Beat Recorder & Metronome
          </span>
          {recordedSteps.length > 0 && (
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
              {recordedSteps.length} hits recorded
            </span>
          )}
        </div>

        {/* Metronome & BPM */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-metronome"
            type="button"
            onClick={() => setMetronomeActive(!metronomeActive)}
            className={`
              flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors border
              ${
                metronomeActive
                  ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200'
              }
            `}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                metronomeActive && currentBeatPulse === 1
                  ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                  : 'bg-slate-600'
              }`}
            />
            Click ({bpm} BPM)
          </button>

          <input
            id="bpm-slider"
            type="range"
            min="60"
            max="180"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-16 sm:w-24 accent-amber-400"
            title="Adjust Metronome BPM"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Record, Play, Clear Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Record Button */}
          <button
            id="btn-record-beat"
            type="button"
            onClick={isRecording ? onStopRecord : onStartRecord}
            className={`
              flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all border
              ${
                isRecording
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300 animate-pulse'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-rose-500/50 hover:text-white'
              }
            `}
          >
            {isRecording ? (
              <>
                <Square className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                <span>Stop Rec</span>
              </>
            ) : (
              <>
                <Circle className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                <span>Record Beat</span>
              </>
            )}
          </button>

          {/* Loop Play/Stop Button */}
          <button
            id="btn-play-loop"
            type="button"
            disabled={recordedSteps.length === 0}
            onClick={isPlaying ? stopPlayback : startPlayback}
            className={`
              flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all border
              ${
                recordedSteps.length === 0
                  ? 'opacity-40 cursor-not-allowed border-slate-800 bg-slate-900 text-slate-600'
                  : isPlaying
                  ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-cyan-400 hover:text-white'
              }
            `}
          >
            {isPlaying ? (
              <>
                <Square className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400" />
                <span>Stop Loop</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400" />
                <span>Play Loop</span>
              </>
            )}
          </button>

          {/* Save As Button */}
          <button
            id="btn-save-as-type"
            type="button"
            onClick={onOpenSaveModal}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-400/80 bg-cyan-500/20 px-3 py-1.5 font-bold text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            title="Save this beat with custom title and genre type"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save As...</span>
          </button>

          {/* Reset/Clear Button */}
          {recordedSteps.length > 0 && (
            <button
              id="btn-clear-recorded"
              type="button"
              onClick={() => {
                stopPlayback();
                onClearRecord();
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
              title="Clear recorded beat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Demo Grooves buttons */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 hidden sm:inline">Presets:</span>
          <button
            id="btn-preset-trap"
            type="button"
            onClick={loadDemoTrap}
            className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-slate-400 hover:border-cyan-500 hover:text-cyan-300"
          >
            ⚡ Trap Groove
          </button>
          <button
            id="btn-preset-house"
            type="button"
            onClick={loadDemoHouse}
            className="rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-slate-400 hover:border-cyan-500 hover:text-cyan-300"
          >
            🥁 House 4-on-Floor
          </button>
        </div>
      </div>
    </div>
  );
}
