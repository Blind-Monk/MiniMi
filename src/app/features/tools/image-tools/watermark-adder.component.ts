import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-watermark-adder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🏷️ Watermark Adder</span>
        </h3>
        <p class="text-xs text-slate-400">
          Stamp custom text or copyright label across images with position, opacity, and size controls.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🏷️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Image to Watermark</p>
        </div>

        @if (originalSrc()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Watermark Text</label>
                <input type="text" [ngModel]="watermarkText()" (ngModelChange)="onTextChange($event)"
                       class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Font Size: {{ fontSize() }}px</label>
                <input type="range" min="12" max="120" step="4" [ngModel]="fontSize()" (ngModelChange)="onSizeChange($event)"
                       class="w-full accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Opacity: {{ opacity() * 100 }}%</label>
                <input type="range" min="0.1" max="1" step="0.05" [ngModel]="opacity()" (ngModelChange)="onOpacityChange($event)"
                       class="w-full accent-indigo-500">
              </div>
            </div>

            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-center min-h-[250px]">
              @if (watermarkedSrc()) {
                <img [src]="watermarkedSrc()" class="max-h-80 object-contain rounded-lg shadow-xl">
              }
            </div>

            @if (watermarkedSrc()) {
              <div class="flex justify-end">
                <a [href]="watermarkedSrc()" download="watermarked-image.png"
                   class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2">
                  <span>⬇️ Download Watermarked Image</span>
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class WatermarkAdderComponent {
  originalSrc = signal<string | null>(null);
  watermarkedSrc = signal<string | null>(null);
  watermarkText = signal<string>('© CONFIDENTIAL 2025');
  fontSize = signal<number>(36);
  opacity = signal<number>(0.6);

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
        this.renderWatermark();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onTextChange(text: string) {
    this.watermarkText.set(text);
    this.renderWatermark();
  }

  onSizeChange(sz: number) {
    this.fontSize.set(sz);
    this.renderWatermark();
  }

  onOpacityChange(op: number) {
    this.opacity.set(op);
    this.renderWatermark();
  }

  renderWatermark() {
    if (!this.loadedImg) return;

    const img = this.loadedImg;
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    ctx.save();
    ctx.globalAlpha = this.opacity();
    ctx.font = `bold ${this.fontSize()}px sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.fillText(this.watermarkText(), 0, 0);

    ctx.restore();

    this.watermarkedSrc.set(canvas.toDataURL('image/png'));
  }
}
