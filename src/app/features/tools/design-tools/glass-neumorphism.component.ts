import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-glass-neumorphism',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🪞 Glassmorphism & Neumorphism CSS Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate modern frosted glass and soft extruded neumorphic CSS UI component styles.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Blur Backdrop: {{ blur() }}px</label>
              <input type="range" min="2" max="30" step="2" [ngModel]="blur()" (ngModelChange)="blur.set($event)" class="w-full accent-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Glass Opacity: {{ opacity() * 100 }}%</label>
              <input type="range" min="0.05" max="0.5" step="0.05" [ngModel]="opacity()" (ngModelChange)="opacity.set($event)" class="w-full accent-indigo-500">
            </div>
          </div>

          <!-- Glass Preview -->
          <div class="relative bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 p-12 rounded-2xl flex items-center justify-center min-h-[220px]">
            <div class="p-6 rounded-2xl border border-white/20 shadow-2xl text-center space-y-2"
                 [style.backdropFilter]="'blur(' + blur() + 'px)'"
                 [style.backgroundColor]="'rgba(255, 255, 255, ' + opacity() + ')'">
              <h4 class="text-lg font-bold text-white">Frosted Glass Card</h4>
              <p class="text-xs text-slate-100">Modern Glassmorphism UI Style</p>
            </div>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-xs font-mono text-emerald-400">background: rgba(255, 255, 255, {{ opacity() }}); backdrop-filter: blur({{ blur() }}px);</span>
            <button (click)="copyCss()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow">
              {{ copyStatus() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GlassNeumorphismComponent {
  blur = signal<number>(12);
  opacity = signal<number>(0.2);
  copyStatus = signal<string>('Copy CSS');

  copyCss() {
    navigator.clipboard.writeText(`background: rgba(255, 255, 255, ${this.opacity()});\nbackdrop-filter: blur(${this.blur()}px);`);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy CSS'), 2000);
  }
}
