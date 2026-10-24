import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ColorSample {
  hex: string;
  rgb: string;
  count: number;
}

@Component({
  selector: 'app-palette-extractor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎨 Color Palette Extracted from Image</span>
        </h3>
        <p class="text-xs text-slate-400">
          Extract dominant color schemes, HEX codes, and RGB values with 1-click clipboard copying.
        </p>

        <!-- File Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🎨</div>
          <p class="text-sm font-semibold text-slate-200">Upload Image to Extract Colors</p>
        </div>

        @if (imageSrc()) {
          <div class="mt-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Uploaded Image -->
              <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center">
                <img [src]="imageSrc()" class="max-h-60 object-contain rounded-lg">
              </div>

              <!-- Color Palette Swatches -->
              <div class="md:col-span-2 space-y-3">
                <h4 class="text-xs font-semibold text-slate-300">Extracted Dominant Color Swatches</h4>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  @for (c of palette(); track c.hex) {
                    <div (click)="copyHex(c.hex)"
                         class="bg-slate-800 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-indigo-500 transition-all group">
                      <div class="h-14 rounded-lg shadow-inner mb-2 border border-slate-700/50" [style.backgroundColor]="c.hex"></div>
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-mono font-bold text-white">{{ c.hex }}</span>
                        <span class="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                      </div>
                      <span class="text-[10px] font-mono text-slate-400 block mt-0.5">{{ c.rgb }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            @if (copiedMessage()) {
              <div class="p-2.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-mono rounded-lg text-center">
                {{ copiedMessage() }}
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PaletteExtractorComponent {
  imageSrc = signal<string | null>(null);
  palette = signal<ColorSample[]>([]);
  copiedMessage = signal<string | null>(null);

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      this.imageSrc.set(src);

      const img = new Image();
      img.onload = () => this.extractColors(img);
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  extractColors(img: HTMLImageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);

    const imgData = ctx.getImageData(0, 0, 100, 100).data;
    const colorCounts: Record<string, { r: number; g: number; b: number; count: number }> = {};

    for (let i = 0; i < imgData.length; i += 16) { // sample every 4th pixel
      const r = Math.round(imgData[i] / 32) * 32;
      const g = Math.round(imgData[i + 1] / 32) * 32;
      const b = Math.round(imgData[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;

      if (!colorCounts[key]) {
        colorCounts[key] = { r, g, b, count: 0 };
      }
      colorCounts[key].count++;
    }

    const sorted = Object.values(colorCounts).sort((a, b) => b.count - a.count).slice(0, 8);

    const result: ColorSample[] = sorted.map(c => {
      const hex = '#' + [c.r, c.g, c.b].map(x => Math.min(255, x).toString(16).padStart(2, '0')).join('');
      return {
        hex: hex.toUpperCase(),
        rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
        count: c.count
      };
    });

    this.palette.set(result);
  }

  copyHex(hex: string) {
    navigator.clipboard.writeText(hex);
    this.copiedMessage.set(`Copied ${hex} to clipboard!`);
    setTimeout(() => this.copiedMessage.set(null), 2000);
  }
}
