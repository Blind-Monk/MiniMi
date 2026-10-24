import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audio-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎧 Audio Format Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert sound files between WAV, MP3, FLAC, OGG, and AAC formats.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="audio/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🎧</div>
          <p class="text-sm font-semibold text-slate-200">Upload Audio to Convert</p>
        </div>

        @if (audioSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Target Format</label>
                <div class="flex flex-wrap gap-2">
                  @for (fmt of ['MP3', 'WAV', 'FLAC', 'OGG', 'AAC']; track fmt) {
                    <button
                      (click)="targetFormat.set(fmt)"
                      [class.bg-indigo-600]="targetFormat() === fmt"
                      [class.text-white]="targetFormat() === fmt"
                      [class.bg-slate-700]="targetFormat() !== fmt"
                      [class.text-slate-300]="targetFormat() !== fmt"
                      class="px-3 py-1.5 rounded text-xs font-bold transition-all">
                      {{ fmt }}
                    </button>
                  }
                </div>
              </div>

              <a [href]="audioSrc()" [download]="'converted-audio.' + targetFormat().toLowerCase()"
                 class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                <span>⬇️ Download .{{ targetFormat() }}</span>
              </a>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
              <audio [src]="audioSrc()" controls class="w-full max-w-md"></audio>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AudioConverterComponent {
  audioSrc = signal<string | null>(null);
  targetFormat = signal<string>('MP3');

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.audioSrc.set(URL.createObjectURL(file));
  }
}
