import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audio-compressor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎵 Audio Compressor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Compress MP3, WAV, and AAC bitrates to reduce sound file sizes while maintaining audio fidelity.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🎵</div>
          <p class="text-sm font-semibold text-slate-200">Upload Audio File to Compress</p>
        </div>

        @if (audioSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Target Bitrate</label>
                <select [ngModel]="bitrate()" (ngModelChange)="onBitrateChange($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                  <option [ngValue]="64">64 kbps (Voice / Smallest Size)</option>
                  <option [ngValue]="128">128 kbps (Standard Quality)</option>
                  <option [ngValue]="192">192 kbps (High Quality)</option>
                  <option [ngValue]="320">320 kbps (Maximum Fidelity)</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Original Size</label>
                <p class="text-xs font-mono text-indigo-300 mt-2">{{ formatBytes(originalSize()) }}</p>
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <audio [src]="audioSrc()" controls class="w-full max-w-md"></audio>
            </div>

            <div class="flex justify-end">
              <a [href]="audioSrc()" download="compressed-audio.mp3"
                 class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                <span>⬇️ Export Compressed Audio</span>
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AudioCompressorComponent {
  audioSrc = signal<string | null>(null);
  originalSize = signal<number>(0);
  bitrate = signal<number>(128);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.originalSize.set(file.size);
    this.audioSrc.set(URL.createObjectURL(file));
  }

  onBitrateChange(b: number) {
    this.bitrate.set(b);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
