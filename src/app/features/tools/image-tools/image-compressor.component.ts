import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-compressor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🖼️ Image Compressor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Compress JPEG, PNG, and WebP images client-side with target quality sliders and size reduction stats.
        </p>

        <!-- File Input -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50 transition-colors"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📁</div>
          <p class="text-sm font-semibold text-slate-200">Click or drag an image here to compress</p>
          <p class="text-xs text-slate-500 mt-1">Supports PNG, JPG, WebP, BMP</p>
        </div>

        @if (originalImageSrc()) {
          <div class="mt-6 space-y-6">
            <!-- Controls -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">
                  Compression Quality: {{ quality() * 100 }}%
                </label>
                <input type="range" min="0.05" max="1" step="0.05" [ngModel]="quality()" (ngModelChange)="onQualityChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Export Format</label>
                <select [ngModel]="exportFormat()" (ngModelChange)="onFormatChange($event)"
                        class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                  <option value="image/jpeg">JPEG (.jpg)</option>
                  <option value="image/webp">WebP (.webp)</option>
                  <option value="image/png">PNG (.png)</option>
                </select>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span class="text-[10px] uppercase text-slate-400 block font-mono">Original</span>
                <span class="text-sm font-bold text-white">{{ formatBytes(originalSize()) }}</span>
              </div>
              <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span class="text-[10px] uppercase text-slate-400 block font-mono">Compressed</span>
                <span class="text-sm font-bold text-emerald-400">{{ formatBytes(compressedSize()) }}</span>
              </div>
              <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
                <span class="text-[10px] uppercase text-slate-400 block font-mono">Saved</span>
                <span class="text-sm font-bold text-indigo-400">{{ reductionPercent() }}%</span>
              </div>
            </div>

            <!-- Preview -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Original Image</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center min-h-[200px]">
                  <img [src]="originalImageSrc()" class="max-h-64 object-contain rounded-lg">
                </div>
              </div>

              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Compressed Result</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center min-h-[200px]">
                  @if (compressedImageSrc()) {
                    <img [src]="compressedImageSrc()" class="max-h-64 object-contain rounded-lg">
                  } @else {
                    <span class="text-xs text-slate-500">Processing...</span>
                  }
                </div>
              </div>
            </div>

            <!-- Download -->
            @if (compressedImageSrc()) {
              <div class="flex justify-end">
                <a [href]="compressedImageSrc()" download="compressed-image.jpg"
                   class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center space-x-2">
                  <span>⬇️ Download Compressed Image</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class ImageCompressorComponent {
  originalImageSrc = signal<string | null>(null);
  compressedImageSrc = signal<string | null>(null);
  originalSize = signal<number>(0);
  compressedSize = signal<number>(0);
  quality = signal<number>(0.75);
  exportFormat = signal<string>('image/jpeg');

  private loadedImageElement: HTMLImageElement | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.originalSize.set(file.size);
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      this.originalImageSrc.set(src);

      const img = new Image();
      img.onload = () => {
        this.loadedImageElement = img;
        this.compressImage();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onQualityChange(val: number) {
    this.quality.set(val);
    this.compressImage();
  }

  onFormatChange(fmt: string) {
    this.exportFormat.set(fmt);
    this.compressImage();
  }

  compressImage() {
    if (!this.loadedImageElement) return;

    const img = this.loadedImageElement;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const format = this.exportFormat();
    const q = this.quality();

    const dataUrl = canvas.toDataURL(format, q);
    this.compressedImageSrc.set(dataUrl);

    // Calculate compressed bytes estimate from base64
    const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
    const byteSize = Math.floor(base64Length * 0.75);
    this.compressedSize.set(byteSize);
  }

  reductionPercent(): number {
    if (!this.originalSize() || !this.compressedSize()) return 0;
    const diff = this.originalSize() - this.compressedSize();
    const pct = Math.round((diff / this.originalSize()) * 100);
    return pct > 0 ? pct : 0;
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
