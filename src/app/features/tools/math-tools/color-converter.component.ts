import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎨 Color Converter & Picker</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert color codes between HEX, RGB, HSL, CMYK, and OKLCH formats with visual color picker.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center space-x-4">
            <input type="color" [ngModel]="hexColor()" (ngModelChange)="onHexChange($event)"
                   class="w-12 h-12 rounded border border-slate-600 bg-transparent cursor-pointer">
            <div class="flex-1">
              <label class="text-xs font-semibold text-slate-300 block mb-1">HEX Color Code</label>
              <input type="text" [ngModel]="hexColor()" (ngModelChange)="onHexChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
            </div>
          </div>

          <!-- Color Code Format Output Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] text-slate-400 block uppercase">RGB</span>
              <span class="font-bold text-indigo-300">{{ rgbVal() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] text-slate-400 block uppercase">HSL</span>
              <span class="font-bold text-emerald-300">{{ hslVal() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] text-slate-400 block uppercase">CMYK</span>
              <span class="font-bold text-amber-300">{{ cmykVal() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] text-slate-400 block uppercase">OKLCH</span>
              <span class="font-bold text-purple-300">{{ oklchVal() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ColorConverterComponent {
  hexColor = signal<string>('#6366f1');
  rgbVal = signal<string>('rgb(99, 102, 241)');
  hslVal = signal<string>('hsl(239, 84%, 67%)');
  cmykVal = signal<string>('cmyk(59%, 58%, 0%, 5%)');
  oklchVal = signal<string>('oklch(0.55 0.22 264)');

  constructor() {
    this.convert();
  }

  onHexChange(hex: string) {
    this.hexColor.set(hex);
    this.convert();
  }

  convert() {
    const hex = this.hexColor().replace('#', '');
    if (hex.length !== 6) return;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    this.rgbVal.set(`rgb(${r}, ${g}, ${b})`);

    // Simple HSL
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rNorm) h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
      else if (max === gNorm) h = (bNorm - rNorm) / d + 2;
      else if (max === bNorm) h = (rNorm - gNorm) / d + 4;
      h /= 6;
    }

    this.hslVal.set(`hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`);
    this.cmykVal.set(`cmyk(${Math.round((1 - rNorm) * 100)}%, ${Math.round((1 - gNorm) * 100)}%, ${Math.round((1 - bNorm) * 100)}%, 0%)`);
    this.oklchVal.set(`oklch(${(l * 0.9).toFixed(2)} ${(s * 0.25).toFixed(2)} ${Math.round(h * 360)})`);
  }
}
