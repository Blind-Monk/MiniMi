import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-resizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📐 Resolution & Image Resizer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Resize pixel dimensions or percentage scale while preserving smooth image scaling and aspect ratio lock.
        </p>

        <!-- File Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50 transition-colors"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🖼️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Image to Resize</p>
        </div>

        @if (originalSrc()) {
          <div class="mt-6 space-y-6">
            <!-- Dimension Controls -->
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-center space-x-4">
                  <div>
                    <label class="text-[11px] font-semibold text-slate-400 block mb-1">Width (px)</label>
                    <input type="number" [ngModel]="targetWidth()" (ngModelChange)="onWidthChange($event)"
                           class="w-28 bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
                  </div>
                  <span class="text-slate-500 font-bold">×</span>
                  <div>
                    <label class="text-[11px] font-semibold text-slate-400 block mb-1">Height (px)</label>
                    <input type="number" [ngModel]="targetHeight()" (ngModelChange)="onHeightChange($event)"
                           class="w-28 bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
                  </div>
                </div>

                <div class="flex items-center space-x-3">
                  <label class="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" [ngModel]="lockAspect()" (ngModelChange)="toggleAspect($event)" class="rounded accent-indigo-500">
                    <span>Lock Aspect Ratio</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Scale Percentage: {{ scalePercent() }}%</label>
                <input type="range" min="10" max="200" step="5" [ngModel]="scalePercent()" (ngModelChange)="onScaleChange($event)"
                       class="w-full accent-indigo-500">
              </div>
            </div>

            <!-- Resized Result -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3 min-h-[250px]">
              <span class="text-xs font-mono text-indigo-400">
                Original: {{ originalWidth() }}×{{ originalHeight() }}px → Resized: {{ targetWidth() }}×{{ targetHeight() }}px
              </span>
              @if (resizedSrc()) {
                <img [src]="resizedSrc()" class="max-h-80 object-contain rounded-lg border border-slate-800">
              }
            </div>

            @if (resizedSrc()) {
              <div class="flex justify-end">
                <a [href]="resizedSrc()" download="resized-image.png"
                   class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center space-x-2">
                  <span>⬇️ Download Resized Image</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ImageResizerComponent {
  originalSrc = signal<string | null>(null);
  resizedSrc = signal<string | null>(null);
  originalWidth = signal<number>(0);
  originalHeight = signal<number>(0);
  targetWidth = signal<number>(0);
  targetHeight = signal<number>(0);
  scalePercent = signal<number>(100);
  lockAspect = signal<boolean>(true);

  private loadedImg: HTMLImageElement | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      this.originalSrc.set(src);

      const img = new Image();
      img.onload = () => {
        this.loadedImg = img;
        this.originalWidth.set(img.width);
        this.originalHeight.set(img.height);
        this.targetWidth.set(img.width);
        this.targetHeight.set(img.height);
        this.scalePercent.set(100);
        this.resize();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onWidthChange(val: number) {
    if (!val || val <= 0) return;
    this.targetWidth.set(val);
    if (this.lockAspect() && this.originalWidth()) {
      const ratio = this.originalHeight() / this.originalWidth();
      this.targetHeight.set(Math.round(val * ratio));
    }
    this.resize();
  }

  onHeightChange(val: number) {
    if (!val || val <= 0) return;
    this.targetHeight.set(val);
    if (this.lockAspect() && this.originalHeight()) {
      const ratio = this.originalWidth() / this.originalHeight();
      this.targetWidth.set(Math.round(val * ratio));
    }
    this.resize();
  }

  onScaleChange(pct: number) {
    this.scalePercent.set(pct);
    if (this.originalWidth() && this.originalHeight()) {
      this.targetWidth.set(Math.round(this.originalWidth() * (pct / 100)));
      this.targetHeight.set(Math.round(this.originalHeight() * (pct / 100)));
      this.resize();
    }
  }

  toggleAspect(val: boolean) {
    this.lockAspect.set(val);
  }

  resize() {
    if (!this.loadedImg || !this.targetWidth() || !this.targetHeight()) return;

    const canvas = document.createElement('canvas');
    canvas.width = this.targetWidth();
    canvas.height = this.targetHeight();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.loadedImg, 0, 0, canvas.width, canvas.height);

    this.resizedSrc.set(canvas.toDataURL('image/png'));
  }
}
