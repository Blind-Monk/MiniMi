export class TurboSpeedAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;

  private bgmPlaying = false;
  private bgmIntervalId: number | null = null;

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
    }
  }

  resumeCtx() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Dynamic Algorithmic 90s Retro Techno/Rock Synthesizer (100% Non-Copyright) ---
  // High-energy 150 BPM synth track with arpeggiated lead, driving bassline, drum fills & filter sweeps
  startMusic() {
    this.init();
    if (!this.ctx || this.bgmPlaying || this.isMuted) return;
    this.bgmPlaying = true;

    // Jeff van Dyck / Saki Kaskas Need for Speed SE inspired synth progression
    const bassNotes = [110, 110, 130.81, 110, 146.83, 130.81, 110, 97.99]; // A2, A2, C3, A2, D3, C3, A2, G2
    const leadNotes = [440, 523.25, 659.25, 587.33, 659.25, 783.99, 659.25, 523.25]; // A4, C5, E5, D5, E5, G5, E5, C5
    let step = 0;

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.ctx || this.isMuted || !this.bgmPlaying) return;
      try {
        const now = this.ctx.currentTime;

        // 1. Driving Sawtooth Bassline with Resonant Lowpass Filter Sweep
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sawtooth';
        const bassNote = bassNotes[step % bassNotes.length];
        bassOsc.frequency.setValueAtTime(bassNote, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(400 + Math.sin(step * 0.2) * 250, now);
        bassFilter.Q.setValueAtTime(4, now);

        bassGain.gain.setValueAtTime(0.08, now);
        bassGain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.2);

        // 2. High Octave 90s Techno Lead Synth Arpeggio
        if (step % 2 === 0 || step % 3 === 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();

          leadOsc.type = 'square';
          const leadNote = leadNotes[(step * 3) % leadNotes.length];
          leadOsc.frequency.setValueAtTime(leadNote, now);

          leadGain.gain.setValueAtTime(0.035, now);
          leadGain.gain.exponentialRampToValueAtTime(0.002, now + 0.14);

          leadOsc.connect(leadGain);
          leadGain.connect(this.ctx.destination);
          leadOsc.start(now);
          leadOsc.stop(now + 0.15);
        }

        // 3. Techno Kick Drum on beats 0, 2, 4, 6
        if (step % 2 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();
          kickOsc.frequency.setValueAtTime(150, now);
          kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.1);

          kickGain.gain.setValueAtTime(0.18, now);
          kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

          kickOsc.connect(kickGain);
          kickGain.connect(this.ctx.destination);
          kickOsc.start(now);
          kickOsc.stop(now + 0.1);
        }

        // 4. Crisp Hi-Hat / Snare Drum on off-beats
        if (step % 2 === 1) {
          const hatBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.05), this.ctx.sampleRate);
          const data = hatBuffer.getChannelData(0);
          for (let i = 0; i < hatBuffer.length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.04;
          }
          const hatSource = this.ctx.createBufferSource();
          hatSource.buffer = hatBuffer;
          hatSource.connect(this.ctx.destination);
          hatSource.start(now);
        }

        step++;
      } catch {}
    }, 180); // ~166 BPM Retro Euro-Techno Pace
  }

  stopMusic() {
    this.bgmPlaying = false;
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  // --- Engine Audio Synthesis ---
  startEngineSound() {
    this.init();
    if (!this.ctx || this.engineOsc) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime); // Low idle RPM
      this.engineGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch {}
  }

  updateEngineRPM(speedRatio: number, gear: number) {
    if (!this.ctx || !this.engineOsc || !this.engineGain) return;
    try {
      const baseFreq = 55 + (gear * 25);
      const rpmFreq = baseFreq + Math.abs(speedRatio) * 210;
      this.engineOsc.frequency.setTargetAtTime(rpmFreq, this.ctx.currentTime, 0.04);
      const gainVal = this.isMuted ? 0 : 0.05 + Math.abs(speedRatio) * 0.12;
      this.engineGain.gain.setTargetAtTime(gainVal, this.ctx.currentTime, 0.04);
    } catch {}
  }

  stopEngineSound() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
    }
  }

  // --- Sound Effects ---
  playCountdownTone(isGo: boolean) {
    this.init();
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, this.ctx.currentTime); // High pitch A5 for GO, A4 for 3..2..1

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (isGo ? 0.4 : 0.2));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (isGo ? 0.4 : 0.2));
    } catch {}
  }

  playGearShift() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  startPoliceSiren() {
    this.init();
    if (!this.ctx || this.sirenOsc) return;
    try {
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();

      this.sirenOsc.type = 'sine';
      this.sirenGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(2.2, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(350, this.ctx.currentTime);

      this.sirenOsc.frequency.setValueAtTime(750, this.ctx.currentTime);
      lfo.connect(this.sirenOsc.frequency);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      lfo.start();
      this.sirenOsc.start();
    } catch {}
  }

  stopPoliceSiren() {
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {}
      this.sirenOsc = null;
    }
  }

  playRadarBeep() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playCollision() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {}
  }

  playMenuClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1300, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  playTireScreech() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1100, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {}
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEngineSound();
      this.stopPoliceSiren();
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }
}
