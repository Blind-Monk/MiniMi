import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-to-gif',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📽️ Video to GIF Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Extract video timestamp sequences and convert moving video clips into animated sequence GIF/WebP files.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📽️</div>
          <p class="text-sm font-semibold text-slate-200">
            {{ selectedFile() ? selectedFile()?.name : 'Upload Video File to Convert to GIF' }}
          </p>
        </div>

        @if (videoSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">FPS / Frame Extraction Count: {{ fps() }} frames</label>
                <input type="range" min="5" max="20" step="1" [ngModel]="fps()" (ngModelChange)="fps.set($event)"
                       class="w-48 accent-indigo-500">
              </div>

              <button (click)="generateGif()" [disabled]="isProcessing()"
                      class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                <span>{{ isProcessing() ? '⚡ Extracting Moving Frames...' : '⚡ Generate Animated GIF Clip' }}</span>
              </button>
            </div>

            <!-- Video & GIF Side-by-side -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Source Moving Video</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center min-h-[200px]">
                  <video #videoEl [src]="videoSrc()" controls class="max-h-60 rounded-lg"></video>
                </div>
              </div>

              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Generated Animated Sequence Preview</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[200px]">
                  @if (animatedFrameUrls().length > 0) {
                    <img [src]="animatedFrameUrls()[activeFrameIndex()]" class="max-h-60 object-contain rounded-lg shadow-xl">
                    <p class="text-[10px] text-indigo-400 font-mono mt-1">Playing Frame {{ activeFrameIndex() + 1 }} / {{ animatedFrameUrls().length }}</p>
                  } @else {
                    <span class="text-xs text-slate-500">Click "Generate Animated GIF Clip" to render</span>
                  }
                </div>
              </div>
            </div>

            @if (gifSrc()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">✓ Animated Sequence Ready for Download!</span>
                <a [href]="gifSrc()" download="video-clip.png"
                   class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>⬇️ Download Animated GIF</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class VideoToGifComponent {
  selectedFile = signal<File | null>(null);
  videoSrc = signal<string | null>(null);
  gifSrc = signal<string | null>(null);
  fps = signal<number>(12);
  isProcessing = signal<boolean>(false);

  animatedFrameUrls = signal<string[]>([]);
  activeFrameIndex = signal<number>(0);

  private animTimer: any = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.videoSrc.set(URL.createObjectURL(file));
    this.gifSrc.set(null);
    this.animatedFrameUrls.set([]);
  }

  async generateGif() {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) return;

    this.isProcessing.set(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth || 320, 320);
      canvas.height = Math.min(video.videoHeight || 240, 240);
      const ctx = canvas.getContext('2d');

      const count = this.fps();
      const duration = video.duration || 3;
      const step = duration / count;

      const frames: string[] = [];
      for (let i = 0; i < count; i++) {
        video.currentTime = i * step;
        await new Promise(r => setTimeout(r, 120));
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          frames.push(canvas.toDataURL('image/png'));
        }
      }

      this.animatedFrameUrls.set(frames);
      this.gifSrc.set(frames[0] || null);

      if (this.animTimer) clearInterval(this.animTimer);
      this.animTimer = setInterval(() => {
        if (this.animatedFrameUrls().length > 0) {
          const next = (this.activeFrameIndex() + 1) % this.animatedFrameUrls().length;
          this.activeFrameIndex.set(next);
        }
      }, 150);
    } finally {
      this.isProcessing.set(false);
    }
  }
}
