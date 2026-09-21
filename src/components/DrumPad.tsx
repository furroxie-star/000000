import React from 'react';
import { KeyboardLayout, PadConfig } from '../types';

interface DrumPadProps {
  pad: PadConfig;
  isActive: boolean;
  layout: KeyboardLayout;
  onTrigger: (padId: PadConfig['id']) => void;
  onRelease: (padId: PadConfig['id']) => void;
}

export function DrumPad({
  pad,
  isActive,
  layout,
  onTrigger,
  onRelease,
}: DrumPadProps) {
  const currentKey = pad.keyLabels[layout];
  const altKey = layout === 'homeRow' ? pad.keyLabels.mpcGrid : pad.keyLabels.homeRow;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onTrigger(pad.id);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onRelease(pad.id);
  };

  const handlePointerLeave = () => {
    if (isActive) {
      onRelease(pad.id);
    }
  };

  return (
    <button
      id={`pad-${pad.id}`}
      type="button"
      role="button"
      aria-label={`${pad.name}, shortcut key ${currentKey}`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onTrigger(pad.id);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onRelease(pad.id);
        }
      }}
      style={{
        boxShadow: isActive
          ? `0 0 28px ${pad.color.glow}, inset 0 0 16px ${pad.color.glow}`
          : '0 4px 12px rgba(0, 0, 0, 0.4)',
      }}
      className={`
        relative group select-none touch-manipulation cursor-pointer
        aspect-square w-full rounded-2xl border p-3 sm:p-4 md:p-5
        flex flex-col justify-between items-stretch
        transition-all duration-100 ease-out outline-none
        ${pad.color.border}
        ${
          isActive
            ? `${pad.color.activeBg} scale-[0.96] border-white/80`
            : `bg-gradient-to-br ${pad.color.base} bg-slate-900/80 hover:bg-slate-800/90 hover:scale-[1.02]`
        }
      `}
    >
      {/* Top Bar: Key Badge & LED Indicator */}
      <div className="flex items-center justify-between pointer-events-none">
        {/* Primary Keyboard Key Badge */}
        <div
          className={`
            flex items-center justify-center font-mono font-bold
            h-9 w-9 sm:h-11 sm:w-11 rounded-xl text-lg sm:text-2xl shadow-inner
            transition-colors duration-100
            ${
              isActive
                ? 'bg-slate-950/80 text-white shadow-black/60'
                : 'bg-slate-950/70 border border-slate-700/60 text-slate-100'
            }
          `}
        >
          {currentKey}
        </div>

        {/* LED Indicator and Secondary Key Hint */}
        <div className="flex items-center gap-1.5">
          <span
            className={`
              hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded
              ${isActive ? 'bg-black/30 text-white/90' : 'bg-slate-800/60 text-slate-400'}
            `}
            title={`Alternative shortcut: ${altKey}`}
          >
            {altKey}
          </span>
          <span
            className={`
              h-2.5 w-2.5 rounded-full transition-all duration-75
              ${
                isActive
                  ? `${pad.color.led} scale-125`
                  : 'bg-slate-700'
              }
            `}
          />
        </div>
      </div>

      {/* Middle Acoustic Ripple Ring Effect (Visual feedback when triggered) */}
      <div className="pointer-events-none my-auto flex justify-center items-center">
        <div
          className={`
            rounded-full transition-all duration-200
            ${
              isActive
                ? 'h-10 w-10 sm:h-14 sm:w-14 border-2 border-white/60 animate-ping opacity-75'
                : 'h-6 w-6 opacity-0'
            }
          `}
        />
      </div>

      {/* Bottom Bar: Sound Name & Category Description */}
      <div className="pointer-events-none flex flex-col text-left">
        <span
          className={`
            text-xs sm:text-base md:text-lg font-bold tracking-tight line-clamp-1
            transition-colors duration-75
            ${isActive ? 'text-white' : 'text-slate-100'}
          `}
        >
          {pad.name}
        </span>
        <span
          className={`
            text-[10px] sm:text-xs font-medium tracking-wide uppercase line-clamp-1
            ${isActive ? 'text-white/80' : 'text-slate-400'}
          `}
        >
          {pad.description}
        </span>
      </div>
    </button>
  );
}
