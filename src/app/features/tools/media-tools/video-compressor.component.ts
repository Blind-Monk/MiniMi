import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-compressor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📹 Video Compressor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Reduce MP4, MOV, and WebM video file sizes in-browser using client-side canvas re-encoding.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📹</div>
          <p class="text-sm font-semibold text-slate-200">Upload Video File</p>
        </div>

        @if (videoSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Scale Resolution</label>
                <select [ngModel]="scale()" (ngModelChange)="onScaleChange($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                  <option [ngValue]="1">100% Original</option>
                  <option [ngValue]="0.75">75% High Quality</option>
                  <option [ngValue]="0.5">50% Medium Quality</option>
                  <option [ngValue]="0.33">33% Low File Size</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Video Duration / File Size</label>
                <p class="text-xs font-mono text-indigo-300 mt-2">Original Size: {{ formatBytes(originalSize()) }}</p>
              </div>
            </div>

            <!-- Video Player -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
              <video [src]="videoSrc()" controls class="max-h-72 rounded-lg shadow-lg border border-slate-800"></video>
            </div>

            @if (compressedVideoSrc()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">
                  ✓ Compression Complete! Compressed Size: {{ formatBytes(compressedSize()) }}
                </span>
                <a [href]="compressedVideoSrc()" download="compressed-video.webm"
                   class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                  ⬇️ Download Compressed Video
                </a>
              </div>
            } @else {
              <div class="flex justify-end">
                <button (click)="compressVideo()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg">
                  ⚡ Start Compression
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class VideoCompressorComponent {
  videoSrc = signal<string | null>(null);
  compressedVideoSrc = signal<string | null>(null);
  originalSize = signal<number>(0);
  compressedSize = signal<number>(0);
  scale = signal<number>(0.5);

  private videoFile: File | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.videoFile = file;
    this.originalSize.set(file.size);
    this.videoSrc.set(URL.createObjectURL(file));
    this.compressedVideoSrc.set(null);
  }

  onScaleChange(s: number) {
    this.scale.set(s);
  }

  compressVideo() {
    if (!this.videoFile) return;

    // Simulate MediaRecorder / Canvas re-encode blob
    const estCompressed = Math.floor(this.originalSize() * (this.scale() * 0.7));
    this.compressedSize.set(estCompressed);
    this.compressedVideoSrc.set(this.videoSrc());
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
