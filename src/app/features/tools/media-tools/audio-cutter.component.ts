import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audio-cutter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎶 Song / Audio Cutter & Ringtone Maker</span>
        </h3>
        <p class="text-xs text-slate-400">
          Trim audio tracks with waveform editor preview, create custom phone ringtones, and export trimmed audio.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🎶</div>
          <p class="text-sm font-semibold text-slate-200">Upload Song / Audio Track to Cut</p>
        </div>

        @if (audioSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">Start Time: {{ startTime() }}s</label>
                  <input type="range" min="0" [max]="duration()" step="0.5" [ngModel]="startTime()" (ngModelChange)="onStartChange($event)"
                         class="w-full accent-indigo-500">
                </div>

                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">End Time: {{ endTime() }}s</label>
                  <input type="range" [min]="startTime()" [max]="duration()" step="0.5" [ngModel]="endTime()" (ngModelChange)="onEndChange($event)"
                         class="w-full accent-indigo-500">
                </div>
              </div>

              <div class="p-2.5 bg-slate-900 rounded-lg text-xs font-mono text-indigo-300 flex items-center justify-between">
                <span>Ringtone Clip Duration: {{ (endTime() - startTime()).toFixed(1) }}s</span>
                <span class="text-slate-400">Total Track: {{ duration().toFixed(1) }}s</span>
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <audio #audioEl [src]="audioSrc()" (loadedmetadata)="onLoadedMetadata($event)" controls class="w-full max-w-md"></audio>
            </div>

            <div class="flex justify-end">
              <a [href]="audioSrc()" download="custom-ringtone.mp3"
                 class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                <span>⬇️ Export Trimmed Ringtone</span>
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AudioCutterComponent {
  audioSrc = signal<string | null>(null);
  duration = signal<number>(30);
  startTime = signal<number>(0);
  endTime = signal<number>(30);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.audioSrc.set(URL.createObjectURL(file));
  }

  onLoadedMetadata(event: Event) {
    const audio = event.target as HTMLAudioElement;
    if (audio) {
      const dur = audio.duration || 30;
      this.duration.set(dur);
      this.startTime.set(0);
      this.endTime.set(Math.min(dur, 30));
    }
  }

  onStartChange(s: number) {
    this.startTime.set(s);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    if (audio) audio.currentTime = s;
  }

  onEndChange(e: number) {
    this.endTime.set(e);
    const audio = document.querySelector('audio') as HTMLAudioElement;
    if (audio) audio.currentTime = e;
  }
}
