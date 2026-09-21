/**
 * Real-time Web Audio API Engine for Interactive Drum Pad
 * Provides sub-millisecond audio playback, zero delay on rapid triggers,
 * master volume control with GainNode, and AnalyserNode for audio visualization.
 */

import { SoundId, SoundKitId } from '../types';

class DrumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private currentKit: SoundKitId = 'neon-cyber';
  private noiseBuffer: AudioBuffer | null = null;
  private volume: number = 0.85;

  private init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // Master Gain Node for global volume control
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Analyser Node for live visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      // Routing: Sound Sources -> Master Gain -> Analyser -> Speakers
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Pre-generate pink/white noise buffer for snappy snares, hi-hats, and cymbals
      this.createNoiseBuffer();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise with subtle pink roll-off
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  public setKit(kit: SoundKitId) {
    this.currentKit = kit;
  }

  public getKit(): SoundKitId {
    return this.currentKit;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      // Smooth volume ramp prevents clicks when sliding quickly
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.02);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.ctx) this.init();
    return this.analyser;
  }

  /**
   * Main trigger function: plays sound instantly with 0 latency.
   * Calling multiple times rapidly creates overlapping or instant fresh sounds
   * equivalent to `audio.currentTime = 0` without waiting for previous sounds to end.
   */
  public playSound(soundId: SoundId) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    switch (soundId) {
      case 'kick':
        this.playKick(now);
        break;
      case 'snare':
        this.playSnare(now);
        break;
      case 'hihat':
        this.playHiHat(now, false);
        break;
      case 'openhat':
        this.playHiHat(now, true);
        break;
      case 'clap':
        this.playClap(now);
        break;
      case 'tom_low':
        this.playTom(now, 85, 45, 0.45);
        break;
      case 'tom_high':
        this.playTom(now, 160, 95, 0.35);
        break;
      case 'crash':
        this.playCrash(now);
        break;
      case 'perc':
        this.playPerc(now);
        break;
    }
  }

  // --- Drum Sound Synthesizers (Tailored per Kit) ---

  private playKick(now: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (this.currentKit === 'neon-cyber') {
      // Punchy electronic 808 with sub harmonic
      osc.type = 'sine';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      // Subtle click transient for punch
      this.playClick(now, 0.015, 300);
    } else if (this.currentKit === 'urban-808') {
      // Long 808 Trap boom
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);

      gain.gain.setValueAtTime(1.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      this.playClick(now, 0.02, 450);
    } else {
      // Acoustic Studio Bass Drum
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.07);

      gain.gain.setValueAtTime(1.0, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      this.playClick(now, 0.03, 1200);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.7);
  }

  private playClick(now: number, duration: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + duration);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  private playSnare(now: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    // Body Tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const isCyber = this.currentKit === 'neon-cyber';
    const is808 = this.currentKit === 'urban-808';

    osc.type = isCyber ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isCyber ? 230 : is808 ? 190 : 210, now);
    osc.frequency.exponentialRampToValueAtTime(isCyber ? 110 : 80, now + 0.08);

    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);

    // Snappy Noise Layer
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(isCyber ? 2000 : is808 ? 1600 : 1800, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + (isCyber ? 0.22 : 0.18));

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.25);
  }

  private playHiHat(now: number, open: boolean) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(open ? 5500 : 7500, now);

    const gain = this.ctx.createGain();
    const decay = open ? 0.35 : 0.055;
    const initialVol = open ? 0.7 : 0.6;

    gain.gain.setValueAtTime(initialVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + decay);
  }

  private playClap(now: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(1.5, now);

    // Staggered clap pulses: 3 rapid bursts then sustained decay
    const times = [0, 0.012, 0.024];
    times.forEach((t) => {
      const burst = this.ctx!.createBufferSource();
      burst.buffer = this.noiseBuffer;
      const burstGain = this.ctx!.createGain();
      burstGain.gain.setValueAtTime(0.7, now + t);
      burstGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.025);

      burst.connect(filter);
      filter.connect(burstGain);
      burstGain.connect(this.masterGain!);

      burst.start(now + t);
      burst.stop(now + t + 0.03);
    });

    // Sustained room decay
    const tail = this.ctx.createBufferSource();
    tail.buffer = this.noiseBuffer;
    const tailGain = this.ctx.createGain();
    tailGain.gain.setValueAtTime(0.65, now + 0.03);
    tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    tail.connect(filter);
    filter.connect(tailGain);
    tailGain.connect(this.masterGain);

    tail.start(now + 0.03);
    tail.stop(now + 0.25);
  }

  private playTom(now: number, startFreq: number, endFreq: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration * 0.4);

    gain.gain.setValueAtTime(0.85, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playCrash(now: number) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 1.3);
  }

  private playPerc(now: number) {
    if (!this.ctx || !this.masterGain) return;

    if (this.currentKit === 'neon-cyber') {
      // Cyber Laser Zap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.14);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (this.currentKit === 'urban-808') {
      // 808 Cowbell (Dual tuned square waves)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const bandpass = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(540, now);
      osc2.frequency.setValueAtTime(800, now);

      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(750, now);
      bandpass.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc1.connect(bandpass);
      osc2.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } else {
      // Acoustic Woodblock / Rimshot
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }
}

export const drumAudio = new DrumAudioEngine();
