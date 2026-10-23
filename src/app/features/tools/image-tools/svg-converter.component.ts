import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-svg-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⚡ SVG to PNG/JPEG Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Rasterize scalable vector graphics (SVG) into crisp high-resolution PNG or JPEG images.
        </p>

        <!-- SVG Input: File or Text -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer bg-slate-950/50"
               (click)="fileInput.click()">
            <input #fileInput type="file" accept=".svg,image/svg+xml" class="hidden" (change)="onFileSelected($event)">
            <p class="text-xs font-semibold text-slate-300">Upload SVG File</p>
            <span class="text-2xl block my-2">⚡</span>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-300 block mb-1">Or Paste Raw SVG Markup</label>
            <textarea [ngModel]="svgMarkup()" (ngModelChange)="onMarkupChange($event)"
                      placeholder="<svg ...></svg>"
                      class="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500">
            </textarea>
          </div>
        </div>

        @if (rasterizedSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div class="flex items-center space-x-4">
                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">Scale Multiplier</label>
                  <select [ngModel]="scale()" (ngModelChange)="onScaleChange($event)"
                          class="bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                    <option [ngValue]="1">1x (Standard)</option>
                    <option [ngValue]="2">2x (High DPI)</option>
                    <option [ngValue]="4">4x (Ultra HD)</option>
                    <option [ngValue]="8">8x (Print Ready)</option>
                  </select>
                </div>

                <div>
                  <label class="text-xs font-semibold text-slate-300 block mb-1">Target Format</label>
                  <select [ngModel]="format()" (ngModelChange)="onFormatChange($event)"
                          class="bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                    <option value="image/png">PNG (.png)</option>
                    <option value="image/jpeg">JPEG (.jpg)</option>
                  </select>
                </div>
              </div>

              <a [href]="rasterizedSrc()" [download]="'rasterized-vector.' + (format() === 'image/png' ? 'png' : 'jpg')"
                 class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2">
                <span>⬇️ Download Rasterized Image</span>
              </a>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[250px]">
              <img [src]="rasterizedSrc()" class="max-h-80 object-contain rounded-lg shadow-xl">
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SvgConverterComponent {
  svgMarkup = signal<string>('');
  rasterizedSrc = signal<string | null>(null);
  scale = signal<number>(2);
  format = signal<string>('image/png');

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.svgMarkup.set(text);
      this.rasterize();
    };
    reader.readAsText(file);
  }

  onMarkupChange(text: string) {
    this.svgMarkup.set(text);
    this.rasterize();
  }

  onScaleChange(s: number) {
    this.scale.set(s);
    this.rasterize();
  }

  onFormatChange(f: string) {
    this.format.set(f);
    this.rasterize();
  }

  rasterize() {
    const markup = this.svgMarkup().trim();
    if (!markup) return;

    const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const s = this.scale();
      const canvas = document.createElement('canvas');
      canvas.width = (img.width || 300) * s;
      canvas.height = (img.height || 300) * s;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (this.format() === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      this.rasterizedSrc.set(canvas.toDataURL(this.format(), 0.95));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
}
