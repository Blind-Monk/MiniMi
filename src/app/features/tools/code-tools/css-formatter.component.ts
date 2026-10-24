import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-css-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎨 CSS / SCSS / LESS Formatter & Minifier</span>
        </h3>
        <p class="text-xs text-slate-400">
          Structure stylesheets with clean indentation or minify CSS rulesets for maximum page speed.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="formatCss()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                ✨ Beautify CSS
              </button>
              <button (click)="minifyCss()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl">
                ⚡ Minify CSS
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Stylesheet</label>
              <textarea [ngModel]="inputCss()" (ngModelChange)="inputCss.set($event)"
                        placeholder="body { background: #0f172a; color: #fff; margin: 0; }"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Formatted / Minified Result</label>
              <textarea readonly [value]="outputCss()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CssFormatterComponent {
  inputCss = signal<string>('.card { background-color: #1e293b; padding: 1rem; border-radius: 0.75rem; } .card-title { font-weight: bold; font-size: 1.25rem; color: #f8fafc; }');
  outputCss = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.formatCss();
  }

  formatCss() {
    let css = this.inputCss();
    css = css.replace(/\s*\{\s*/g, ' {\n  ').replace(/\s*;\s*/g, ';\n  ').replace(/\s*\}\s*/g, '\n}\n\n');
    this.outputCss.set(css.trim());
  }

  minifyCss() {
    let css = this.inputCss();
    css = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim();
    this.outputCss.set(css);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputCss());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
