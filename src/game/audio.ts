// Procedural Web Audio engine for Run Ninja Run
// Synthesizes retro-modern feudal ninja SFX and dynamic background rhythms without external assets.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying = false;
  private invincibilityMode = false;
  private bgmGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ninja_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    }
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getReadyContext(): AudioContext | null {
    if (this.muted) return null;
    return this.initCtx();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): boolean {
    this.muted = mute;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ninja_muted', String(mute));
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(mute ? 0 : 0.18, this.ctx.currentTime);
    }
    return this.muted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.muted);
  }

  // --- Sound Effects ---

  // Gravity flip swoosh with pitch sweep
  public playFlip() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, t);
    filter.Q.setValueAtTime(2.5, t);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);

    this.playNoiseWhoosh(0.12, 0.12);
  }

  private playNoiseWhoosh(duration: number, volume: number) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter).connect(gain).connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + duration);
  }

  // Footstep landing impact
  public playLand() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Scroll pickup chime (pentatonic flourish + deep temple gong)
  public playScrollPickup() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    // Japanese pentatonic flourish: D, F, G, A, C, D
    const freqs = [293.66, 349.23, 392.0, 440.0, 523.25, 587.33];
    freqs.forEach((freq, idx) => {
      const noteTime = t + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain).connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.35);
    });

    // Low temple gong resonance
    const gong = ctx.createOscillator();
    const gongGain = ctx.createGain();
    gong.type = 'triangle';
    gong.frequency.setValueAtTime(146.83, t);
    gongGain.gain.setValueAtTime(0.4, t);
    gongGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    gong.connect(gongGain).connect(ctx.destination);
    gong.start(t);
    gong.stop(t + 1.2);
  }

  // Jade coin collection chime
  public playCoin() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.06); // E6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Katana slash sound during invincibility slice
  public playSlash() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.12);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);

    this.playNoiseWhoosh(0.15, 0.25);
  }

  // Player takes damage
  public playHit() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Defeat sting
  public playDefeat() {
    const ctx = this.getReadyContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [220, 196, 174.61, 146.83];
    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.6);

      osc.connect(gain).connect(ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.6);
    });
  }

  // --- Dynamic Procedural BGM (Taiko Beat & Arpeggios) ---

  public startBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.isBgmPlaying = true;
    let step = 0;

    // Pulse every 16th note at ~138 BPM (~108ms)
    const intervalMs = 108;
    this.bgmInterval = window.setInterval(() => {
      if (!this.isBgmPlaying || !this.ctx || this.muted) return;

      const t = this.ctx.currentTime;
      const beat = step % 16;
      const isInvincible = this.invincibilityMode;

      // Taiko kick on downbeats (0, 8) + syncopations in invincibility
      if (beat === 0 || beat === 8 || (isInvincible && (beat === 4 || beat === 12 || beat === 14))) {
        this.synthKick(t, isInvincible ? 0.35 : 0.22);
      }

      // Shaker/hi-hat tick on even beats
      if (beat % 2 === 0) {
        this.synthHihat(t, beat % 4 === 2 ? 0.08 : 0.04);
      }

      // Bass synth note in pentatonic minor scale
      if (beat % 4 === 0) {
        const bassNotes = [73.42, 82.41, 98.0, 110.0]; // D2, E2, G2, A2
        const freq = bassNotes[Math.floor(beat / 4) % bassNotes.length];
        this.synthBass(t, freq, isInvincible);
      }

      // Fast energetic arpeggio when in Invincible Scroll Phase
      if (isInvincible && beat % 2 === 1) {
        const arpNotes = [440, 523.25, 587.33, 659.25, 783.99, 880];
        const freq = arpNotes[(step / 2) % arpNotes.length];
        this.synthArp(t, freq);
      }

      step++;
    }, intervalMs);
  }

  public setInvincibleBgm(active: boolean) {
    this.invincibilityMode = active;
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  private synthKick(t: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.1);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  private synthHihat(t: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, t);

    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(filter).connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  private synthBass(t: number, freq: number, heavy: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = heavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    const dur = heavy ? 0.28 : 0.22;
    gain.gain.setValueAtTime(heavy ? 0.18 : 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  private synthArp(t: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }
}

export const audio = new SoundEngine();
