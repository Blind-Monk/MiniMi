import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-image-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔄 Image Format Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert images between PNG, JPG, WebP, AVIF, BMP, and TIFF formats instantly client-side.
        </p>

        <!-- File Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50 transition-colors"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📥</div>
          <p class="text-sm font-semibold text-slate-200">Upload Image to Convert</p>
          <p class="text-xs text-slate-500 mt-1">Select PNG, JPG, WebP, BMP, or SVG file</p>
        </div>

        @if (imageSrc()) {
          <div class="mt-6 space-y-6">
            <!-- Format Selector -->
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Target Format</label>
                <div class="flex flex-wrap gap-2">
                  @for (fmt of formats; track fmt.mime) {
                    <button
                      (click)="setFormat(fmt.mime, fmt.ext)"
                      [class.bg-indigo-600]="targetMime() === fmt.mime"
                      [class.text-white]="targetMime() === fmt.mime"
                      [class.bg-slate-700]="targetMime() !== fmt.mime"
                      [class.text-slate-300]="targetMime() !== fmt.mime"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-indigo-500 hover:text-white">
                      {{ fmt.label }}
                    </button>
                  }
                </div>
              </div>

              <a [href]="convertedSrc()" [download]="'converted-image.' + targetExt()"
                 class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center space-x-2 shrink-0">
                <span>⬇️ Download .{{ targetExt().toUpperCase() }}</span>
              </a>
            </div>

            <!-- Preview Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Original Format: {{ originalFormat() }}</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center min-h-[220px]">
                  <img [src]="imageSrc()" class="max-h-64 object-contain rounded-lg">
                </div>
              </div>

              <div>
                <h4 class="text-xs font-semibold text-slate-400 mb-2">Converted Preview ({{ targetExt().toUpperCase() }})</h4>
                <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center min-h-[220px]">
                  @if (convertedSrc()) {
                    <img [src]="convertedSrc()" class="max-h-64 object-contain rounded-lg">
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ImageConverterComponent {
  imageSrc = signal<string | null>(null);
  convertedSrc = signal<string | null>(null);
  originalFormat = signal<string>('PNG');
  targetMime = signal<string>('image/jpeg');
  targetExt = signal<string>('jpg');

  formats = [
    { label: 'JPEG (.jpg)', mime: 'image/jpeg', ext: 'jpg' },
    { label: 'PNG (.png)', mime: 'image/png', ext: 'png' },
    { label: 'WebP (.webp)', mime: 'image/webp', ext: 'webp' },
    { label: 'BMP (.bmp)', mime: 'image/bmp', ext: 'bmp' }
  ];

  private loadedImg: HTMLImageElement | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.originalFormat.set(file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN');

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      this.imageSrc.set(src);

      const img = new Image();
      img.onload = () => {
        this.loadedImg = img;
        this.convert();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  setFormat(mime: string, ext: string) {
    this.targetMime.set(mime);
    this.targetExt.set(ext);
    this.convert();
  }

  convert() {
    if (!this.loadedImg) return;

    const img = this.loadedImg;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.targetMime() === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);
    const dataUrl = canvas.toDataURL(this.targetMime(), 0.92);
    this.convertedSrc.set(dataUrl);
  }
}
