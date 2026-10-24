import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tone-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔊 Tone / Frequency Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate continuous sine, square, sawtooth, and triangle audio frequencies with precise Hz control.
        </p>

        <div class="mt-6 bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-6">
          <div class="flex items-center justify-between">
            <span class="text-3xl font-mono font-black text-indigo-400">{{ frequency() }} Hz</span>
            <button (click)="toggleTone()"
                    [class.bg-red-600]="isPlaying()"
                    [class.hover:bg-red-500]="isPlaying()"
                    [class.bg-emerald-600]="!isPlaying()"
                    [class.hover:bg-emerald-500]="!isPlaying()"
                    class="px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center space-x-2">
              <span>{{ isPlaying() ? '⏹️ Stop Tone' : '▶️ Play Tone' }}</span>
            </button>
          </div>

          <!-- Controls -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Frequency Slider: {{ frequency() }} Hz</label>
              <input type="range" min="20" max="20000" step="5" [ngModel]="frequency()" (ngModelChange)="onFreqChange($event)"
                     class="w-full accent-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Waveform Shape</label>
              <div class="flex space-x-2">
                @for (w of ['sine', 'square', 'sawtooth', 'triangle']; track w) {
                  <button
                    (click)="setWaveform(w)"
                    [class.bg-indigo-600]="type() === w"
                    [class.text-white]="type() === w"
                    [class.bg-slate-700]="type() !== w"
                    [class.text-slate-300]="type() !== w"
                    class="px-3 py-1.5 rounded text-xs font-bold capitalize transition-all">
                    {{ w }}
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Musical Note Quick Presets -->
          <div>
            <label class="text-xs font-semibold text-slate-300 block mb-2">Note Presets</label>
            <div class="flex flex-wrap gap-2">
              @for (note of notes; track note.name) {
                <button (click)="setNote(note.freq)" class="px-3 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-indigo-300 rounded font-mono text-xs font-bold">
                  {{ note.name }} ({{ note.freq }}Hz)
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ToneGeneratorComponent implements OnDestroy {
  frequency = signal<number>(440);
  type = signal<OscillatorType>('sine');
  isPlaying = signal<boolean>(false);

  notes = [
    { name: 'C4', freq: 261.63 },
    { name: 'E4', freq: 329.63 },
    { name: 'G4', freq: 392.00 },
    { name: 'A4 (440)', freq: 440.00 },
    { name: 'C5', freq: 523.25 }
  ];

  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;

  toggleTone() {
    if (this.isPlaying()) {
      this.stopTone();
    } else {
      this.startTone();
    }
  }

  startTone() {
    this.stopTone();
    this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.osc = this.audioCtx.createOscillator();
    this.osc.type = this.type();
    this.osc.frequency.setValueAtTime(this.frequency(), this.audioCtx.currentTime);

    this.osc.connect(this.audioCtx.destination);
    this.osc.start();
    this.isPlaying.set(true);
  }

  stopTone() {
    if (this.osc) {
      this.osc.stop();
      this.osc.disconnect();
      this.osc = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.isPlaying.set(false);
  }

  onFreqChange(f: number) {
    this.frequency.set(f);
    if (this.osc && this.audioCtx) {
      this.osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);
    }
  }

  setWaveform(w: string) {
    this.type.set(w as OscillatorType);
    if (this.osc) {
      this.osc.type = w as OscillatorType;
    }
  }

  setNote(freq: number) {
    this.onFreqChange(freq);
  }

  ngOnDestroy() {
    this.stopTone();
  }
}
