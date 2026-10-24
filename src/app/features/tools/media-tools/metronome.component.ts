import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-metronome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⏱️ Metronome Utility</span>
        </h3>
        <p class="text-xs text-slate-400">
          Visual beat pendulum and audio click track for musicians with customizable BPM and time signatures.
        </p>

        <div class="mt-6 bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-6">
          <div class="text-5xl font-mono font-black text-indigo-400">{{ bpm() }} <span class="text-sm text-slate-400 font-normal">BPM</span></div>

          <!-- BPM Slider -->
          <div class="max-w-md mx-auto">
            <input type="range" min="30" max="260" step="1" [ngModel]="bpm()" (ngModelChange)="onBpmChange($event)"
                   class="w-full accent-indigo-500">
          </div>

          <!-- Beat Dots Visualizer -->
          <div class="flex items-center justify-center space-x-4">
            @for (b of beatArray(); track $index) {
              <div [class.bg-amber-400]="$index === activeBeat()"
                   [class.scale-125]="$index === activeBeat()"
                   [class.bg-slate-700]="$index !== activeBeat()"
                   class="w-6 h-6 rounded-full border border-slate-600 transition-all duration-75">
              </div>
            }
          </div>

          <!-- Start / Stop Button -->
          <button (click)="toggleMetronome()"
                  [class.bg-red-600]="isPlaying()"
                  [class.bg-emerald-600]="!isPlaying()"
                  class="px-8 py-3 text-white font-bold text-sm rounded-xl shadow transition-colors">
            {{ isPlaying() ? '⏹️ Stop Metronome' : '▶️ Start Metronome' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class MetronomeComponent implements OnDestroy {
  bpm = signal<number>(120);
  timeSignature = signal<number>(4);
  activeBeat = signal<number>(-1);
  isPlaying = signal<boolean>(false);

  private timer: any = null;
  private audioCtx: AudioContext | null = null;

  beatArray(): number[] {
    return new Array(this.timeSignature()).fill(0);
  }

  toggleMetronome() {
    if (this.isPlaying()) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  startMetronome() {
    this.stopMetronome();
    this.isPlaying.set(true);
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const intervalMs = (60 / this.bpm()) * 1000;
    let beat = 0;

    this.timer = setInterval(() => {
      this.activeBeat.set(beat);
      this.playClick(beat === 0);
      beat = (beat + 1) % this.timeSignature();
    }, intervalMs);
  }

  stopMetronome() {
    this.isPlaying.set(false);
    this.activeBeat.set(-1);
    if (this.timer) clearInterval(this.timer);
    if (this.audioCtx) this.audioCtx.close();
  }

  onBpmChange(val: number) {
    this.bpm.set(val);
    if (this.isPlaying()) {
      this.startMetronome();
    }
  }

  playClick(accent: boolean) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.setValueAtTime(accent ? 1000 : 800, this.audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  ngOnDestroy() {
    this.stopMetronome();
  }
}
