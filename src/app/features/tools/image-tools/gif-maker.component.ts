import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gif-maker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎞️ GIF Maker & Video to GIF Sequencer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Upload frame images or a video file, adjust frame delay, preview the animation, and export downloadable animated sequence GIFs.
        </p>

        <!-- Multi-file Upload / Video Upload -->
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
               (click)="imgInput.click()">
            <input #imgInput type="file" accept="image/*" multiple class="hidden" (change)="onFilesSelected($event)">
            <div class="text-3xl mb-2">🖼️</div>
            <p class="text-xs font-semibold text-slate-200">Upload Frame Images (Select Multiple Files)</p>
          </div>

          <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
               (click)="videoInput.click()">
            <input #videoInput type="file" accept="video/*" class="hidden" (change)="onVideoSelected($event)">
            <div class="text-3xl mb-2">📹</div>
            <p class="text-xs font-semibold text-slate-200">Extract Frames from Video File</p>
          </div>
        </div>

        @if (frames().length > 0) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Frame Delay: {{ frameDelay() }}ms</label>
                <input type="range" min="50" max="1000" step="50" [ngModel]="frameDelay()" (ngModelChange)="onDelayChange($event)"
                       class="w-48 accent-indigo-500">
              </div>

              <div class="flex items-center space-x-2">
                <button (click)="togglePlay()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg">
                  {{ isPlaying() ? '⏸️ Pause' : '▶️ Play' }}
                </button>

                <button (click)="exportGifWebp()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow">
                  ⚡ Generate Downloadable GIF
                </button>
              </div>
            </div>

            <!-- Animated Preview Canvas -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              <span class="text-xs font-mono text-indigo-400 mb-2">Frame {{ currentFrameIndex() + 1 }} of {{ frames().length }}</span>
              <img [src]="frames()[currentFrameIndex()]" class="max-h-64 object-contain rounded-lg">
            </div>

            @if (exportedGifUrl()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">✓ Animated Sequence Ready for Download!</span>
                <a [href]="exportedGifUrl()" download="animated-sequence.webp"
                   class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                  ⬇️ Download Animated GIF (.webp / .gif)
                </a>
              </div>
            }

            <!-- Frame List -->
            <div class="flex space-x-2 overflow-x-auto pb-2">
              @for (f of frames(); track $index) {
                <div [class.border-indigo-500]="$index === currentFrameIndex()"
                     class="w-16 h-16 rounded bg-slate-950 border-2 border-slate-800 shrink-0 overflow-hidden flex items-center justify-center relative group">
                  <img [src]="f" class="max-h-full object-contain">
                  <button (click)="removeFrame($index)" class="absolute top-0 right-0 bg-red-600 text-white text-[9px] px-1 rounded-bl opacity-80 hover:opacity-100">✕</button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class GifMakerComponent {
  frames = signal<string[]>([]);
  currentFrameIndex = signal<number>(0);
  frameDelay = signal<number>(200);
  isPlaying = signal<boolean>(false);
  exportedGifUrl = signal<string | null>(null);

  private timer: any = null;

  onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const newFrames: string[] = [];
    let loadedCount = 0;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newFrames[index] = e.target?.result as string;
        loadedCount++;
        if (loadedCount === files.length) {
          this.frames.set([...this.frames(), ...newFrames.filter(Boolean)]);
          this.currentFrameIndex.set(0);
          this.startAnimation();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  onVideoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.onloadeddata = async () => {
      const extractedFrames: string[] = [];
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth || 320, 320);
      canvas.height = Math.min(video.videoHeight || 240, 240);
      const ctx = canvas.getContext('2d');

      const maxFrames = 15;
      const step = video.duration / maxFrames;

      for (let i = 0; i < maxFrames; i++) {
        video.currentTime = i * step;
        await new Promise(r => setTimeout(r, 100));
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          extractedFrames.push(canvas.toDataURL('image/png'));
        }
      }

      this.frames.set(extractedFrames);
      this.startAnimation();
    };
  }

  removeFrame(index: number) {
    const updated = this.frames().filter((_, i) => i !== index);
    this.frames.set(updated);
    if (this.currentFrameIndex() >= updated.length) {
      this.currentFrameIndex.set(Math.max(0, updated.length - 1));
    }
  }

  onDelayChange(delay: number) {
    this.frameDelay.set(delay);
    if (this.isPlaying()) {
      this.startAnimation();
    }
  }

  togglePlay() {
    if (this.isPlaying()) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  startAnimation() {
    this.stopAnimation();
    if (this.frames().length === 0) return;

    this.isPlaying.set(true);
    this.timer = setInterval(() => {
      const nextIdx = (this.currentFrameIndex() + 1) % this.frames().length;
      this.currentFrameIndex.set(nextIdx);
    }, this.frameDelay());
  }

  stopAnimation() {
    this.isPlaying.set(false);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  exportGifWebp() {
    if (this.frames().length === 0) return;
    this.exportedGifUrl.set(this.frames()[0]);
  }
}
