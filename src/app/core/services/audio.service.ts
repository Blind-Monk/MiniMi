import { Injectable } from '@angular/core';

export type MusicPlaylistType = 'high-energy' | 'chill-lofi' | 'funny-quirky' | 'arcade-retro' | 'horror-dissonant';

export interface TrackInfo {
  id: string;
  title: string;
  genre: MusicPlaylistType;
  bpm: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private ctx: AudioContext | null = null;

  // Volume & Master Buses
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMuted = false;
  private musicVolume = 0.6;
  private sfxVolume = 0.8;

  // Active Music State
  private currentPlaylist: MusicPlaylistType | null = null;
  private shuffleBag: number[] = [];
  private currentTrackIndex = -1;
  private isPlaying = false;
  private timerId: number | null = null;
  private currentTrackTitle = '';

  // Catalog of Tracks per Playlist
  private playlistTracks: Record<MusicPlaylistType, TrackInfo[]> = {
    'high-energy': [
      { id: 'he_1', title: 'Neon Horizon', genre: 'high-energy', bpm: 150, description: 'High-octane synthwave bassline & eurobeat lead' },
      { id: 'he_2', title: 'Turbo Overdrive', genre: 'high-energy', bpm: 156, description: 'Driving sawtooth bass & resonant filter sweeps' },
      { id: 'he_3', title: 'Apex Predator', genre: 'high-energy', bpm: 148, description: 'Aggressive techno rhythm with arpeggiated synth' }
    ],
    'chill-lofi': [
      { id: 'cl_1', title: 'Midnight Coffee', genre: 'chill-lofi', bpm: 82, description: 'Warm electric piano chord progression with soft rimshot beat' },
      { id: 'cl_2', title: 'Rainy Rooftop', genre: 'chill-lofi', bpm: 78, description: 'Relaxed jazz chords & subtle vinyl ambient hum' },
      { id: 'cl_3', title: 'Zen Meditation', genre: 'chill-lofi', bpm: 85, description: 'Spacious ambient synthesizer pads & peaceful melody' }
    ],
    'funny-quirky': [
      { id: 'fq_1', title: 'Plumber Stomp', genre: 'funny-quirky', bpm: 132, description: 'Upbeat cartoon ragtime with bouncy staccato bassline' },
      { id: 'fq_2', title: 'Zombie Hoedown', genre: 'funny-quirky', bpm: 138, description: 'Quirky synth kazoo melody & silly slide whistle accents' },
      { id: 'fq_3', title: 'Banana Peel Shuffle', genre: 'funny-quirky', bpm: 126, description: 'Playful upbeat bouncy funk rhythm with comedic pops' }
    ],
    'arcade-retro': [
      { id: 'ar_1', title: 'Pixel Powerup', genre: 'arcade-retro', bpm: 140, description: 'Classic 8-bit chiptune square wave arpeggios' },
      { id: 'ar_2', title: '8-Bit Odyssey', genre: 'arcade-retro', bpm: 144, description: 'Retro arcade fast bassline & pulsing triangle melody' },
      { id: 'ar_3', title: 'Ghost Chaser', genre: 'arcade-retro', bpm: 135, description: 'Snappy chiptune arcade loop with noise snares' }
    ],
    'horror-dissonant': [
      { id: 'hd_1', title: 'Asylum Echoes', genre: 'horror-dissonant', bpm: 60, description: 'Dissonant sub-drone with haunting reverberating tones' },
      { id: 'hd_2', title: 'Dark Corridor', genre: 'horror-dissonant', bpm: 65, description: 'Eerie heartbeat pulse and metallic ambient swells' },
      { id: 'hd_3', title: 'Shadow Stalker', genre: 'horror-dissonant', bpm: 70, description: 'Tense low-frequency rumble & creepy synth pad' }
    ]
  };

  constructor() {
    // Lazy AudioContext initialization
  }

  private initCtx() {
    if (this.ctx) return;
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      this.ctx = new AudioCtxClass();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);

      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
  }

  public ensureContextResumed() {
    this.initCtx();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // --- Volume Control Getters & Setters ---
  public setMusicVolume(val: number) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.musicGain && !this.isMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.sfxGain && !this.isMuted) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  // --- Fisher-Yates Shuffle Bag Non-Repeating Logic ---
  private refillShuffleBag(playlist: MusicPlaylistType) {
    const tracks = this.playlistTracks[playlist];
    this.shuffleBag = tracks.map((_, index) => index);
    for (let i = this.shuffleBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffleBag[i], this.shuffleBag[j]] = [this.shuffleBag[j], this.shuffleBag[i]];
    }
    if (this.shuffleBag.length > 1 && this.shuffleBag[0] === this.currentTrackIndex) {
      const first = this.shuffleBag.shift()!;
      this.shuffleBag.push(first);
    }
  }

  private getNextTrackIndex(playlist: MusicPlaylistType): number {
    if (this.shuffleBag.length === 0) {
      this.refillShuffleBag(playlist);
    }
    return this.shuffleBag.shift()!;
  }

  // --- Playback Controls ---
  public startPlaylist(playlist: MusicPlaylistType) {
    this.ensureContextResumed();

    if (this.currentPlaylist === playlist && this.isPlaying) {
      return;
    }

    this.stopMusic();
    this.currentPlaylist = playlist;
    this.isPlaying = true;

    this.playNextTrackInBag();
  }

  private playNextTrackInBag() {
    if (!this.currentPlaylist || !this.isPlaying || !this.ctx) return;

    this.currentTrackIndex = this.getNextTrackIndex(this.currentPlaylist);
    const track = this.playlistTracks[this.currentPlaylist][this.currentTrackIndex];
    this.currentTrackTitle = `${track.title} (${track.genre.toUpperCase()})`;

    this.renderProceduralTrack(track);
  }

  public nextTrack() {
    if (!this.currentPlaylist) return;
    this.stopMusic();
    this.isPlaying = true;
    this.playNextTrackInBag();
  }

  public stopMusic() {
    this.isPlaying = false;
    this.currentPlaylist = null;
    this.currentTrackTitle = 'Stopped';
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.ctx && this.musicGain) {
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ctx && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, now);
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, now);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getCurrentTrackTitle(): string {
    return this.currentTrackTitle || 'No Track Playing';
  }

  // --- Real Multi-Track Procedural Synthesizers ---
  private renderProceduralTrack(track: TrackInfo) {
    if (!this.ctx || !this.musicGain) return;

    // Restore music gain if unmuted
    if (!this.isMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }

    const intervalMs = (60 / track.bpm) * 1000 / 2; // Eighth note step
    let step = 0;

    let bassNotes: number[] = [];
    let leadNotes: number[] = [];
    let chordFreqs: number[][] = [];

    if (track.genre === 'high-energy') {
      bassNotes = [110, 110, 130.81, 110, 146.83, 130.81, 110, 97.99];
      leadNotes = [440, 523.25, 659.25, 587.33, 659.25, 783.99, 659.25, 523.25];
    } else if (track.genre === 'chill-lofi') {
      bassNotes = [65.41, 65.41, 73.42, 87.31];
      chordFreqs = [
        [261.63, 329.63, 392.00, 493.88],
        [293.66, 349.23, 440.00, 523.25],
        [349.23, 440.00, 523.25, 659.25]
      ];
    } else if (track.genre === 'funny-quirky') {
      bassNotes = [130.81, 164.81, 196.00, 220.00];
      leadNotes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
    } else if (track.genre === 'arcade-retro') {
      bassNotes = [98.00, 123.47, 146.83, 164.81];
      leadNotes = [392.00, 493.88, 587.33, 659.25, 783.99];
    } else { // horror-dissonant
      bassNotes = [41.20, 43.65, 38.89];
      leadNotes = [220.00, 233.08, 207.65];
    }

    this.timerId = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted || !this.isPlaying) return;

      try {
        const now = this.ctx.currentTime;

        // 1. Bass Channel
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = track.genre === 'arcade-retro' ? 'square' : (track.genre === 'high-energy' ? 'sawtooth' : 'triangle');

        const bNote = bassNotes[step % bassNotes.length];
        bassOsc.frequency.setValueAtTime(bNote, now);

        const bassVol = track.genre === 'horror-dissonant' ? 0.12 : 0.07;
        bassGain.gain.setValueAtTime(bassVol, now);
        bassGain.gain.exponentialRampToValueAtTime(0.002, now + (intervalMs / 1000) * 0.9);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + (intervalMs / 1000) * 0.95);

        // 2. Lead Channel
        if (leadNotes.length > 0 && (step % 2 === 0 || track.genre === 'high-energy')) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = track.genre === 'funny-quirky' ? 'sawtooth' : (track.genre === 'arcade-retro' ? 'square' : 'sine');

          const lNote = leadNotes[(step * 3 + (track.id.charCodeAt(0) % 5)) % leadNotes.length];
          leadOsc.frequency.setValueAtTime(lNote, now);

          if (track.genre === 'funny-quirky' && step % 4 === 0) {
            leadOsc.frequency.exponentialRampToValueAtTime(lNote * 1.2, now + 0.1);
          }

          leadGain.gain.setValueAtTime(0.035, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 0.8);

          leadOsc.connect(leadGain);
          leadGain.connect(this.musicGain);
          leadOsc.start(now);
          leadOsc.stop(now + (intervalMs / 1000) * 0.85);
        }

        // 3. Chord Pads
        if (chordFreqs.length > 0 && step % 4 === 0) {
          const chord = chordFreqs[(step / 4) % chordFreqs.length];
          chord.forEach(freq => {
            const padOsc = this.ctx!.createOscillator();
            const padGain = this.ctx!.createGain();
            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(freq, now);

            padGain.gain.setValueAtTime(0.015, now);
            padGain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 3.5);

            padOsc.connect(padGain);
            padOsc.connect(this.musicGain!);
            padOsc.start(now);
            padOsc.stop(now + (intervalMs / 1000) * 3.6);
          });
        }

        // 4. Rhythm & Percussion
        if (track.genre !== 'horror-dissonant') {
          if (step % 2 === 0) {
            const kickOsc = this.ctx.createOscillator();
            const kickGain = this.ctx.createGain();
            kickOsc.frequency.setValueAtTime(140, now);
            kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

            kickGain.gain.setValueAtTime(0.12, now);
            kickGain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);

            kickOsc.connect(kickGain);
            kickGain.connect(this.musicGain);
            kickOsc.start(now);
            kickOsc.stop(now + 0.08);
          } else {
            const hatBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.04), this.ctx.sampleRate);
            const data = hatBuffer.getChannelData(0);
            for (let i = 0; i < hatBuffer.length; i++) {
              data[i] = (Math.random() * 2 - 1) * 0.03;
            }
            const hatSource = this.ctx.createBufferSource();
            hatSource.buffer = hatBuffer;
            hatSource.connect(this.musicGain);
            hatSource.start(now);
          }
        }

        step++;
      } catch {}
    }, intervalMs);
  }

  // --- Sound Effects ---
  public playSfx(type: 'eatDot' | 'eatPower' | 'eatFruit' | 'eatGhost' | 'death' | string) {
    this.ensureContextResumed();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'eatDot') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'eatPower') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'eatFruit') {
        this.playCoinSound();
      } else if (type === 'eatGhost') {
        this.playBoingSound();
      } else if (type === 'death') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        this.playClickSound();
      }
    } catch {}
  }

  public playJumpSound() {
    this.ensureContextResumed();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 180 + (Math.random() * 40 - 20);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.8, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playClickSound() {
    this.ensureContextResumed();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 800 + Math.random() * 200;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public playCoinSound() {
    this.ensureContextResumed();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  public playExplosionSound() {
    this.ensureContextResumed();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.3);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
    } catch {}
  }

  public playCardSound() {
    this.ensureContextResumed();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  public playBoingSound() {
    this.ensureContextResumed();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const startPitch = 150 + Math.random() * 50;
      osc.frequency.setValueAtTime(startPitch, now);
      osc.frequency.exponentialRampToValueAtTime(startPitch * 4, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }
}
