import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-css-shadow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔳 CSS Box Shadow Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Build layered box shadows, drop shadows, and glow effects with live visual feedback.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Blur Radius: {{ blur() }}px</label>
              <input type="range" min="0" max="60" step="2" [ngModel]="blur()" (ngModelChange)="blur.set($event)" class="w-full accent-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Spread: {{ spread() }}px</label>
              <input type="range" min="-10" max="40" step="1" [ngModel]="spread()" (ngModelChange)="spread.set($event)" class="w-full accent-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Shadow Color</label>
              <input type="color" [ngModel]="shadowColor()" (ngModelChange)="shadowColor.set($event)" class="w-full h-8 rounded border border-slate-600 bg-transparent cursor-pointer">
            </div>
          </div>

          <div class="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[200px]">
            <div class="w-40 h-28 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-2xl transition-all"
                 [style.boxShadow]="shadowCss()">
              Shadow Box
            </div>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-xs font-mono text-emerald-400">box-shadow: {{ shadowCss() }};</span>
            <button (click)="copyCss()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow">
              {{ copyStatus() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CssShadowComponent {
  blur = signal<number>(25);
  spread = signal<number>(5);
  shadowColor = signal<string>('#6366f1');
  copyStatus = signal<string>('Copy CSS');

  shadowCss(): string {
    return `0px 10px ${this.blur()}px ${this.spread()}px ${this.shadowColor()}`;
  }

  copyCss() {
    navigator.clipboard.writeText(`box-shadow: ${this.shadowCss()};`);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy CSS'), 2000);
  }
}
