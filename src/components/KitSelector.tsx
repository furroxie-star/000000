import { SOUND_KITS } from '../data/drumKits';
import { KeyboardLayout, SoundKitId } from '../types';
import { Sparkles, Music, Drum, Keyboard } from 'lucide-react';

interface KitSelectorProps {
  currentKit: SoundKitId;
  onKitChange: (kitId: SoundKitId) => void;
  layout: KeyboardLayout;
  onLayoutChange: (layout: KeyboardLayout) => void;
}

export function KitSelector({
  currentKit,
  onKitChange,
  layout,
  onLayoutChange,
}: KitSelectorProps) {
  const getKitIcon = (id: SoundKitId) => {
    switch (id) {
      case 'neon-cyber':
        return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case 'urban-808':
        return <Music className="h-4 w-4 text-fuchsia-400" />;
      case 'studio-acoustic':
        return <Drum className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div
      id="kit-selector-container"
      className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3"
    >
      {/* Sound Kit Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Sound Kit:
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sound Kit Options">
          {SOUND_KITS.map((kit) => {
            const isSelected = currentKit === kit.id;
            return (
              <button
                key={kit.id}
                id={`btn-kit-${kit.id}`}
                type="button"
                onClick={() => onKitChange(kit.id)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                  transition-all duration-150 border
                  ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }
                `}
              >
                {getKitIcon(kit.id)}
                <span>{kit.name}</span>
                <span className="text-[10px] opacity-60 font-mono hidden md:inline">
                  [{kit.badge}]
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard Layout Toggle */}
      <div className="flex items-center gap-2 self-start lg:self-auto">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Keyboard className="h-3.5 w-3.5 text-slate-400" />
          Key Map:
        </span>
        <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-0.5">
          <button
            id="btn-layout-homerow"
            type="button"
            onClick={() => onLayoutChange('homeRow')}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md transition-colors
              ${
                layout === 'homeRow'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }
            `}
            title="A, S, D, F, G, H, J, K, L (as highlighted in prompt requirements)"
          >
            A – L Row
          </button>
          <button
            id="btn-layout-mpc"
            type="button"
            onClick={() => onLayoutChange('mpcGrid')}
            className={`
              px-2.5 py-1 text-xs font-medium rounded-md transition-colors
              ${
                layout === 'mpcGrid'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }
            `}
            title="QWE / ASD / ZXC (Traditional 3x3 Pad Grid)"
          >
            QWE Grid
          </button>
        </div>
      </div>
    </div>
  );
}
