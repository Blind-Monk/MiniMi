import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-border-radius',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🟢 CSS Border Radius Visualizer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Interactive visualizer for complex multi-corner 8-point percentage border radius shapes.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label class="text-[10px] font-semibold text-slate-300 block mb-1">Top-Left: {{ tl() }}%</label>
              <input type="range" min="0" max="100" step="5" [ngModel]="tl()" (ngModelChange)="tl.set($event)" class="w-full accent-indigo-500">
            </div>
            <div>
              <label class="text-[10px] font-semibold text-slate-300 block mb-1">Top-Right: {{ tr() }}%</label>
              <input type="range" min="0" max="100" step="5" [ngModel]="tr()" (ngModelChange)="tr.set($event)" class="w-full accent-indigo-500">
            </div>
            <div>
              <label class="text-[10px] font-semibold text-slate-300 block mb-1">Bottom-Right: {{ br() }}%</label>
              <input type="range" min="0" max="100" step="5" [ngModel]="br()" (ngModelChange)="br.set($event)" class="w-full accent-indigo-500">
            </div>
            <div>
              <label class="text-[10px] font-semibold text-slate-300 block mb-1">Bottom-Left: {{ bl() }}%</label>
              <input type="range" min="0" max="100" step="5" [ngModel]="bl()" (ngModelChange)="bl.set($event)" class="w-full accent-indigo-500">
            </div>
          </div>

          <div class="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[220px]">
            <div class="w-48 h-36 bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-2xl transition-all"
                 [style.borderRadius]="radiusCss()">
              Organic Shape
            </div>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-xs font-mono text-emerald-400">border-radius: {{ radiusCss() }};</span>
            <button (click)="copyCss()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow">
              {{ copyStatus() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BorderRadiusComponent {
  tl = signal<number>(30);
  tr = signal<number>(70);
  br = signal<number>(70);
  bl = signal<number>(30);
  copyStatus = signal<string>('Copy CSS');

  radiusCss(): string {
    return `${this.tl()}% ${this.tr()}% ${this.br()}% ${this.bl()}%`;
  }

  copyCss() {
    navigator.clipboard.writeText(`border-radius: ${this.radiusCss()};`);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy CSS'), 2000);
  }
}
