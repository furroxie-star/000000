import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (newVolume: number) => void;
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const percentage = Math.round(volume * 100);

  const toggleMute = () => {
    if (volume > 0) {
      onVolumeChange(0);
    } else {
      onVolumeChange(0.85);
    }
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="h-5 w-5 text-rose-400" />;
    if (volume < 0.5) return <Volume1 className="h-5 w-5 text-cyan-400" />;
    return <Volume2 className="h-5 w-5 text-cyan-400" />;
  };

  return (
    <div
      id="volume-control-panel"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-lg"
    >
      <div className="flex items-center gap-2.5">
        <button
          id="btn-toggle-mute"
          type="button"
          onClick={toggleMute}
          aria-label={volume === 0 ? 'Unmute master volume' : 'Mute master volume'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 transition-colors hover:border-cyan-500 hover:bg-slate-700/80 focus:outline-none"
        >
          {getVolumeIcon()}
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Master Volume
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Master Output Gain
          </span>
        </div>
      </div>

      <div className="flex w-full sm:w-64 items-center gap-3">
        {/* Native HTML input range as explicitly demanded in the prompt */}
        <input
          id="global-volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Master drum volume slider"
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        />
        <span
          id="volume-display-value"
          className="w-12 text-right font-mono text-sm font-semibold text-cyan-400"
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
}
