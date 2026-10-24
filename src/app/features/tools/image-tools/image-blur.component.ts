import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-blur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🙈 Image Blur / Pixelate Tool</span>
        </h3>
        <p class="text-xs text-slate-400">
          Obfuscate sensitive parts, faces, names, or credentials on screenshots using blur and pixelation.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🙈</div>
          <p class="text-sm font-semibold text-slate-200">Upload Screenshot or Photo to Obfuscate</p>
        </div>

        @if (originalSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Blur Amount: {{ blurRadius() }}px</label>
                <input type="range" min="2" max="40" step="2" [ngModel]="blurRadius()" (ngModelChange)="onBlurChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Pixelate Block Size: {{ pixelSize() }}px</label>
                <input type="range" min="4" max="32" step="2" [ngModel]="pixelSize()" (ngModelChange)="onPixelSizeChange($event)"
                       class="w-full accent-indigo-500">
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[250px]">
              @if (blurredSrc()) {
                <img [src]="blurredSrc()" class="max-h-80 object-contain rounded-lg shadow-xl">
              }
            </div>

            @if (blurredSrc()) {
              <div class="flex justify-end">
                <a [href]="blurredSrc()" download="obfuscated-screenshot.png"
                   class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2">
                  <span>⬇️ Download Obfuscated Image</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ImageBlurComponent {
  originalSrc = signal<string | null>(null);
  blurredSrc = signal<string | null>(null);
  blurRadius = signal<number>(12);
  pixelSize = signal<number>(16);

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
        this.applyBlur();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onBlurChange(b: number) {
    this.blurRadius.set(b);
    this.applyBlur();
  }

  onPixelSizeChange(p: number) {
    this.pixelSize.set(p);
    this.applyBlur();
  }

  applyBlur() {
    if (!this.loadedImg) return;

    const img = this.loadedImg;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pixelate effect canvas rendering
    const pSize = this.pixelSize();
    const w = Math.ceil(img.width / pSize);
    const h = Math.ceil(img.height / pSize);

    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;

    const offCtx = offCanvas.getContext('2d');
    if (offCtx) {
      offCtx.drawImage(img, 0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    }

    this.blurredSrc.set(canvas.toDataURL('image/png'));
  }
}
