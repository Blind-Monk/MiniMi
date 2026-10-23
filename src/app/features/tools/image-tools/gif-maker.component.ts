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
          <span>🎞️ GIF Maker & Frame Sequencer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Upload multi-frame images, adjust frame speed/delays, and view animated sequence preview.
        </p>

        <!-- Multi-file Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" multiple class="hidden" (change)="onFilesSelected($event)">
          <div class="text-3xl mb-2">🎞️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Frame Images (Select Multiple Files)</p>
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
              </div>
            </div>

            <!-- Animated Preview Canvas -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
              <span class="text-xs font-mono text-indigo-400 mb-2">Frame {{ currentFrameIndex() + 1 }} of {{ frames().length }}</span>
              <img [src]="frames()[currentFrameIndex()]" class="max-h-64 object-contain rounded-lg">
            </div>

            <!-- Frame List -->
            <div class="flex space-x-2 overflow-x-auto pb-2">
              @for (f of frames(); track $index) {
                <div [class.border-indigo-500]="$index === currentFrameIndex()"
                     class="w-16 h-16 rounded bg-slate-950 border-2 border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                  <img [src]="f" class="max-h-full object-contain">
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
          this.frames.set(newFrames.filter(Boolean));
          this.currentFrameIndex.set(0);
          this.startAnimation();
        }
      };
      reader.readAsDataURL(file);
    });
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
}
