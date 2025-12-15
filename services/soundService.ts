class SoundManager {
  private ctx: AudioContext | null = null;

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playScaryTypewriter() {
    this.playTypewriter(true);
  }

  playTypewriter(isScary: boolean = false) {
    const ctx = this.init();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Mechanical Click (High frequency transient)
    const highOsc = ctx.createOscillator();
    const highGain = ctx.createGain();
    highOsc.type = isScary ? 'square' : 'sine';
    highOsc.frequency.setValueAtTime(1800 + Math.random() * 400, now);
    highOsc.frequency.exponentialRampToValueAtTime(800, now + 0.03);
    highGain.gain.setValueAtTime(0.04, now);
    highGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    highOsc.connect(highGain);
    highGain.connect(ctx.destination);
    highOsc.start();
    highOsc.stop(now + 0.04);

    // Noise burst for the "thud" of the key
    const bufferSize = ctx.sampleRate * 0.02;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isScary ? 100 : 1200, now);
    
    noiseGain.gain.setValueAtTime(isScary ? 0.05 : 0.02, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start();

    if (isScary) {
      // Add a low thud for the "scary" version
      const lowOsc = ctx.createOscillator();
      const lowGain = ctx.createGain();
      lowOsc.frequency.setValueAtTime(60, now);
      lowGain.gain.setValueAtTime(0.05, now);
      lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      lowOsc.connect(lowGain);
      lowGain.connect(ctx.destination);
      lowOsc.start();
      lowOsc.stop(now + 0.11);
    }
  }

  playType() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const transientOsc = this.ctx.createOscillator();
    const transientGain = this.ctx.createGain();
    transientOsc.type = 'sine';
    transientOsc.frequency.setValueAtTime(3200, now);
    transientOsc.frequency.exponentialRampToValueAtTime(1600, now + 0.015);
    transientGain.gain.setValueAtTime(0.2, now);
    transientGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    transientOsc.connect(transientGain);
    transientGain.connect(this.ctx.destination);
    transientOsc.start();
    transientOsc.stop(now + 0.03);

    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(120, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
    bodyGain.gain.setValueAtTime(0.15, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.ctx.destination);
    bodyOsc.start();
    bodyOsc.stop(now + 0.06);
  }

  playEdgeType() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const rimOsc = this.ctx.createOscillator();
    const rimGain = this.ctx.createGain();
    rimOsc.type = 'sine';
    rimOsc.frequency.setValueAtTime(4500, now);
    rimGain.gain.setValueAtTime(0.15, now);
    rimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    rimOsc.connect(rimGain);
    rimGain.connect(this.ctx.destination);
    rimOsc.start();
    rimOsc.stop(now + 0.02);
  }

  playUISound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(now + 0.1);
  }

  playFairySpawn() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [880, 1100, 1320, 1760];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.06 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [659.25, 830.61].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.3);
    });
  }
}

export const sounds = new SoundManager();