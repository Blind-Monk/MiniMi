import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-css-gradient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌈 CSS Gradient Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Visual gradient builder for linear and radial CSS gradients with copyable CSS code output.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Color 1</label>
              <input type="color" [ngModel]="color1()" (ngModelChange)="onColor1Change($event)" class="w-full h-8 rounded cursor-pointer bg-transparent border border-slate-600">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Color 2</label>
              <input type="color" [ngModel]="color2()" (ngModelChange)="onColor2Change($event)" class="w-full h-8 rounded cursor-pointer bg-transparent border border-slate-600">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Angle: {{ angle() }}°</label>
              <input type="range" min="0" max="360" step="5" [ngModel]="angle()" (ngModelChange)="onAngleChange($event)"
                     class="w-full accent-indigo-500">
            </div>
          </div>

          <!-- Preview Box -->
          <div class="h-40 rounded-2xl border border-slate-700 shadow-2xl transition-all" [style.background]="gradientCss()"></div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-xs font-mono text-emerald-400">background: {{ gradientCss() }};</span>
            <button (click)="copyCss()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow">
              {{ copyStatus() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CssGradientComponent {
  color1 = signal<string>('#6366f1');
  color2 = signal<string>('#a855f7');
  angle = signal<number>(135);
  copyStatus = signal<string>('Copy CSS');

  gradientCss(): string {
    return `linear-gradient(${this.angle()}deg, ${this.color1()}, ${this.color2()})`;
  }

  onColor1Change(c: string) { this.color1.set(c); }
  onColor2Change(c: string) { this.color2.set(c); }
  onAngleChange(a: number) { this.angle.set(a); }

  copyCss() {
    navigator.clipboard.writeText(`background: ${this.gradientCss()};`);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy CSS'), 2000);
  }
}
