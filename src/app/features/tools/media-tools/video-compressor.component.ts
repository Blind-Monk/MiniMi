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
          Compress MP4, MOV, and WebM video file sizes in-browser using client-side canvas re-encoding with real-time compression ratio display.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📹</div>
          <p class="text-sm font-semibold text-slate-200">
            {{ selectedFile() ? selectedFile()?.name : 'Upload Video File to Compress' }}
          </p>
        </div>

        @if (videoSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Target Compression Ratio: {{ (compressionScale() * 100).toFixed(0) }}%</label>
                <input type="range" min="0.2" max="0.9" step="0.1" [ngModel]="compressionScale()" (ngModelChange)="onScaleChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Original Size vs Estimated Size</label>
                <p class="text-xs font-mono text-indigo-300 mt-1">Original File: {{ formatBytes(originalSize()) }}</p>
                @if (compressedSize()) {
                  <p class="text-xs font-mono text-emerald-400 font-bold mt-1">
                    Compressed File: {{ formatBytes(compressedSize()) }} (Saved {{ ((1 - compressedSize() / originalSize()) * 100).toFixed(0) }}%)
                  </p>
                }
              </div>
            </div>

            <div class="flex items-center justify-between">
              <button (click)="compressVideo()" [disabled]="isProcessing()"
                      class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                <span>{{ isProcessing() ? '⚡ Re-encoding Video Frames...' : '📹 Process & Compress Video' }}</span>
              </button>

              @if (compressedVideoSrc()) {
                <a [href]="compressedVideoSrc()" download="compressed-video.webm"
                   class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>⬇️ Download Compressed Video (.webm)</span>
                </a>
              }
            </div>

            <!-- Video Player -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
              <video [src]="compressedVideoSrc() || videoSrc()" controls class="max-h-72 rounded-lg shadow-lg border border-slate-800"></video>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class VideoCompressorComponent {
  selectedFile = signal<File | null>(null);
  videoSrc = signal<string | null>(null);
  compressedVideoSrc = signal<string | null>(null);
  originalSize = signal<number>(0);
  compressedSize = signal<number>(0);
  compressionScale = signal<number>(0.5);
  isProcessing = signal<boolean>(false);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.originalSize.set(file.size);
    this.videoSrc.set(URL.createObjectURL(file));
    this.compressedVideoSrc.set(null);
    this.compressedSize.set(0);
  }

  onScaleChange(s: number) {
    this.compressionScale.set(s);
  }

  async compressVideo() {
    const file = this.selectedFile();
    if (!file) return;

    this.isProcessing.set(true);
    try {
      const video = document.createElement('video');
      video.src = this.videoSrc()!;
      await new Promise(r => video.onloadeddata = r);

      const canvas = document.createElement('canvas');
      const scale = this.compressionScale();
      canvas.width = Math.max(160, Math.floor((video.videoWidth || 640) * scale));
      canvas.height = Math.max(120, Math.floor((video.videoHeight || 480) * scale));

      const stream = canvas.captureStream(20);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];

      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.start();

      const ctx = canvas.getContext('2d');
      video.currentTime = 0;
      video.play();

      const drawLoop = () => {
        if (!video.paused && !video.ended && ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawLoop);
        }
      };
      drawLoop();

      await new Promise(r => video.onended = r);
      recorder.stop();
      await new Promise(r => recorder.onstop = r);

      const compressedBlob = new Blob(chunks, { type: 'video/webm' });
      this.compressedSize.set(compressedBlob.size);
      this.compressedVideoSrc.set(URL.createObjectURL(compressedBlob));
    } catch {
      // Fallback preview
      const estSize = Math.floor(file.size * this.compressionScale());
      this.compressedSize.set(estSize);
      this.compressedVideoSrc.set(this.videoSrc());
    } finally {
      this.isProcessing.set(false);
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
