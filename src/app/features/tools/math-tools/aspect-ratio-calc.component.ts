import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-aspect-ratio-calc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📐 Aspect Ratio Calculator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Calculate missing dimensions for 16:9, 4:3, 1:1, or custom aspect ratio dimensions for design and video.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Ratio Preset</label>
              <select [ngModel]="ratioPreset()" (ngModelChange)="onPresetChange($event)"
                      class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-white font-mono">
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="21:9">21:9 (Ultrawide)</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Width (px)</label>
              <input type="number" [ngModel]="width()" (ngModelChange)="onWidthChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-white font-mono">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Height (px)</label>
              <input type="number" [ngModel]="height()" (ngModelChange)="onHeightChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-indigo-300 font-mono">
            </div>
          </div>

          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono">
            <span class="text-sm font-bold text-emerald-400">Resolution: {{ width() }} × {{ height() }} px ({{ ratioPreset() }})</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AspectRatioCalcComponent {
  ratioPreset = signal<string>('16:9');
  width = signal<number>(1920);
  height = signal<number>(1080);

  onPresetChange(p: string) {
    this.ratioPreset.set(p);
    this.recalculateHeight();
  }

  onWidthChange(w: number) {
    this.width.set(w);
    this.recalculateHeight();
  }

  onHeightChange(h: number) {
    this.height.set(h);
  }

  recalculateHeight() {
    const w = this.width();
    const p = this.ratioPreset();
    let r = 16 / 9;
    if (p === '4:3') r = 4 / 3;
    if (p === '1:1') r = 1;
    if (p === '21:9') r = 21 / 9;

    this.height.set(Math.round(w / r));
  }
}
