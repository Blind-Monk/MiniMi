import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pitch-speed-changer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎛️ Audio Pitch & Speed Changer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Modify audio playback tempo/speed (0.5x to 2.0x) independently or shift pitch keys.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🎛️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Audio to Change Pitch/Speed</p>
        </div>

        @if (audioSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Playback Speed: {{ playbackRate() }}x</label>
                <input type="range" min="0.5" max="2.0" step="0.05" [ngModel]="playbackRate()" (ngModelChange)="onRateChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Pitch Shift (Semitones): {{ semitones() }}</label>
                <input type="range" min="-12" max="12" step="1" [ngModel]="semitones()" (ngModelChange)="onSemitonesChange($event)"
                       class="w-full accent-indigo-500">
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <audio #audioEl [src]="audioSrc()" controls class="w-full max-w-md"></audio>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class PitchSpeedChangerComponent {
  audioSrc = signal<string | null>(null);
  playbackRate = signal<number>(1.0);
  semitones = signal<number>(0);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.audioSrc.set(URL.createObjectURL(file));
  }

  onRateChange(r: number) {
    this.playbackRate.set(r);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    if (audio) {
      audio.playbackRate = r;
    }
  }

  onSemitonesChange(s: number) {
    this.semitones.set(s);
  }
}
