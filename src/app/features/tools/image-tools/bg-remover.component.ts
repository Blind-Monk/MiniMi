import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bg-remover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🧙 Image Background Remover</span>
        </h3>
        <p class="text-xs text-slate-400">
          Client-side background isolation and cutout tool with chroma-key and magic wand color tolerance.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🧙</div>
          <p class="text-sm font-semibold text-slate-200">Upload Image to Remove Background</p>
        </div>

        @if (originalSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Color Tolerance: {{ tolerance() }}</label>
                <input type="range" min="5" max="150" step="5" [ngModel]="tolerance()" (ngModelChange)="onToleranceChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Target Background Color</label>
                <div class="flex items-center space-x-2">
                  <input type="color" [ngModel]="keyColor()" (ngModelChange)="onColorChange($event)" class="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent">
                  <span class="text-xs font-mono text-slate-300">{{ keyColor() }}</span>
                  <button (click)="autoKeyWhite()" class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded">Key White/Black</button>
                </div>
              </div>
            </div>

            <!-- Result Checkerboard -->
            <div class="bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[250px]">
              @if (processedSrc()) {
                <img [src]="processedSrc()" class="max-h-80 object-contain rounded-lg">
              }
            </div>

            @if (processedSrc()) {
              <div class="flex justify-end">
                <a [href]="processedSrc()" download="cutout-transparent.png"
                   class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2">
                  <span>⬇️ Download Transparent PNG</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class BgRemoverComponent {
  originalSrc = signal<string | null>(null);
  processedSrc = signal<string | null>(null);
  tolerance = signal<number>(40);
  keyColor = signal<string>('#FFFFFF');

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
        this.removeBg();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onToleranceChange(val: number) {
    this.tolerance.set(val);
    this.removeBg();
  }

  onColorChange(color: string) {
    this.keyColor.set(color);
    this.removeBg();
  }

  autoKeyWhite() {
    this.keyColor.set('#FFFFFF');
    this.removeBg();
  }

  removeBg() {
    if (!this.loadedImg) return;

    const img = this.loadedImg;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Convert keyColor hex to RGB
    const hex = this.keyColor().replace('#', '');
    const kr = parseInt(hex.substring(0, 2), 16) || 255;
    const kg = parseInt(hex.substring(2, 4), 16) || 255;
    const kb = parseInt(hex.substring(4, 6), 16) || 255;

    const tol = this.tolerance();

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2);
      if (dist < tol) {
        data[i + 3] = 0; // Alpha transparent
      }
    }

    ctx.putImageData(imgData, 0, 0);
    this.processedSrc.set(canvas.toDataURL('image/png'));
  }
}
