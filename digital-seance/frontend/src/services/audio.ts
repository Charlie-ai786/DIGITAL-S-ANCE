// Web Audio API Procedural Ambient Sound Generator for Digital Séance

class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = true;
  private oscillators: OscillatorNode[] = [];

  constructor() {
    // Audio context is lazily initialized on user interaction
    const saved = localStorage.getItem('seance_audio_enabled');
    this.isMuted = saved !== 'true';
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Create subtle dark drone chords (D minor harmonic)
    const freqs = [55.0, 73.42, 110.0, 164.81]; // D1, D2, A2, E3
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass filter for muffled supernatural timbre
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start();
      this.oscillators.push(osc);
    });
  }

  public toggleMute(): boolean {
    if (!this.ctx) {
      this.initContext();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    localStorage.setItem('seance_audio_enabled', String(!this.isMuted));

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.08;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.5);
    }

    return !this.isMuted;
  }

  public getStatus(): boolean {
    return !this.isMuted;
  }

  public playSummonChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 1.5);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.5);
    } catch {
      // Ignore audio interaction restriction errors
    }
  }
}

export const soundService = new SoundService();

