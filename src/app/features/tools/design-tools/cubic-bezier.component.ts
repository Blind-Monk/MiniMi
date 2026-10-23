import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cubic-bezier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📈 Cubic-Bezier Easing Animation Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Interactive cubic-bezier easing curve handle editor with transition preview and cubic-bezier CSS snippet.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap gap-2">
            @for (p of presets; track p.name) {
              <button (click)="setBezier(p.val)" class="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-indigo-300 rounded font-mono text-xs font-bold border border-slate-700">
                {{ p.name }}
              </button>
            }
          </div>

          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <label class="text-xs font-semibold text-slate-400 block">Transition Preview</label>
            <div class="h-12 bg-slate-900 rounded-xl relative overflow-hidden border border-slate-800">
              <div class="w-10 h-10 bg-indigo-600 rounded-lg absolute top-1 left-1 animate-pulse"
                   [style.transition]="'all 1s cubic-bezier(' + cubicVal() + ')'">
              </div>
            </div>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-xs font-mono text-emerald-400">transition-timing-function: cubic-bezier({{ cubicVal() }});</span>
            <button (click)="copyCss()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow">
              {{ copyStatus() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CubicBezierComponent {
  cubicVal = signal<string>('0.25, 0.1, 0.25, 1.0');
  copyStatus = signal<string>('Copy CSS');

  presets = [
    { name: 'ease', val: '0.25, 0.1, 0.25, 1.0' },
    { name: 'ease-in', val: '0.42, 0, 1.0, 1.0' },
    { name: 'ease-out', val: '0, 0, 0.58, 1.0' },
    { name: 'ease-in-out', val: '0.42, 0, 0.58, 1.0' },
    { name: 'bounce', val: '0.68, -0.55, 0.265, 1.55' }
  ];

  setBezier(val: string) {
    this.cubicVal.set(val);
  }

  copyCss() {
    navigator.clipboard.writeText(`transition-timing-function: cubic-bezier(${this.cubicVal()});`);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy CSS'), 2000);
  }
}
