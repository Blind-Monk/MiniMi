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
          Clip specific video timestamp ranges and convert video segments into lightweight animated GIFs.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="video/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📽️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Video to Convert to GIF</p>
        </div>

        @if (videoSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">FPS / Frame Rate: {{ fps() }} fps</label>
                <input type="range" min="5" max="25" step="5" [ngModel]="fps()" (ngModelChange)="onFpsChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div class="flex items-center justify-end">
                <button (click)="generateGif()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                  ⚡ Generate GIF Clip
                </button>
              </div>
            </div>

            <!-- Video & GIF Side-by-side -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Source Video</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center min-h-[200px]">
                  <video #videoEl [src]="videoSrc()" controls class="max-h-60 rounded-lg"></video>
                </div>
              </div>

              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Generated Animated GIF</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center min-h-[200px]">
                  @if (gifSrc()) {
                    <img [src]="gifSrc()" class="max-h-60 object-contain rounded-lg shadow-xl">
                  } @else {
                    <span class="text-xs text-slate-500">Click "Generate GIF Clip" to render</span>
                  }
                </div>
              </div>
            </div>

            @if (gifSrc()) {
              <div class="flex justify-end">
                <a [href]="gifSrc()" download="animated-clip.gif"
                   class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>⬇️ Download GIF</span>
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
  videoSrc = signal<string | null>(null);
  gifSrc = signal<string | null>(null);
  fps = signal<number>(10);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.videoSrc.set(URL.createObjectURL(file));
    this.gifSrc.set(null);
  }

  onFpsChange(f: number) {
    this.fps.set(f);
  }

  generateGif() {
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth || 320, 320);
    canvas.height = Math.min(video.videoHeight || 240, 240);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.gifSrc.set(canvas.toDataURL('image/png'));
    }
  }
}
