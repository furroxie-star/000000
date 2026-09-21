import { useEffect, useRef } from 'react';
import { drumAudio } from '../utils/audioEngine';

interface AudioVisualizerProps {
  activePadCount: number;
}

export function AudioVisualizer({ activePadCount }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const analyser = drumAudio.getAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.6)');
      bgGradient.addColorStop(1, 'rgba(10, 15, 30, 0.9)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Center baseline rule
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        // Calculate average energy
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += Math.abs(timeData[i] - 128);
        }
        const energy = sum / bufferLength;

        // Render frequency bar meters in the background
        const barWidth = (width / bufferLength) * 2.2;
        let barX = 0;
        for (let i = 0; i < bufferLength; i += 2) {
          const barHeight = (freqData[i] / 255) * (height * 0.75);
          const barGrad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          barGrad.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
          barGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
          barGrad.addColorStop(1, 'rgba(244, 63, 94, 0.28)');

          ctx.fillStyle = barGrad;
          ctx.fillRect(barX, height - barHeight, barWidth - 1, barHeight);
          barX += barWidth;
        }

        // Render Oscilloscope Line Waveform
        ctx.lineWidth = energy > 2 ? 2.5 : 1.5;
        const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
        strokeGrad.addColorStop(0, '#06b6d4');
        strokeGrad.addColorStop(0.5, energy > 6 ? '#f43f5e' : '#a855f7');
        strokeGrad.addColorStop(1, '#06b6d4');

        ctx.strokeStyle = strokeGrad;
        ctx.shadowColor = energy > 4 ? '#06b6d4' : 'transparent';
        ctx.shadowBlur = energy > 4 ? 12 : 0;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      id="audio-visualizer-container" 
      className="relative w-full overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/70 p-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
    >
      <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5 font-mono uppercase text-slate-400">
          <span className={`inline-block h-2 w-2 rounded-full transition-colors duration-200 ${activePadCount > 0 ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]' : 'bg-slate-600'}`} />
          Real-Time Audio Spectrum & Oscilloscope
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          Stereo Visualizer
        </span>
      </div>
      <canvas
        ref={canvasRef}
        id="audio-visualizer-canvas"
        width={640}
        height={68}
        className="h-16 w-full rounded-lg bg-[#070b12]"
      />
    </div>
  );
}
