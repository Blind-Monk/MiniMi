import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-js-minifier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>💻 JavaScript / TypeScript Minifier & Beautifier</span>
        </h3>
        <p class="text-xs text-slate-400">
          Minify JS/TS code by stripping comments and inline whitespace, or format obfuscated code cleanly.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="minifyJs()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                ⚡ Minify JS/TS
              </button>
              <button (click)="beautifyJs()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl">
                ✨ Beautify JS/TS
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Source Code</label>
              <textarea [ngModel]="inputJs()" (ngModelChange)="inputJs.set($event)"
                        placeholder="function add(a, b) { return a + b; }"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Output Result</label>
              <textarea readonly [value]="outputJs()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JsMinifierComponent {
  inputJs = signal<string>('// Add two numbers\nfunction calculateTotal(price, tax) {\n  const result = price + (price * tax);\n  return result;\n}');
  outputJs = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.minifyJs();
  }

  minifyJs() {
    let js = this.inputJs();
    // Remove single line comments
    js = js.replace(/\/\/.*/g, '');
    // Remove multi-line comments
    js = js.replace(/\/\*[\s\S]*?\*\//g, '');
    // Collapse white spaces
    js = js.replace(/\s+/g, ' ').trim();
    this.outputJs.set(js);
  }

  beautifyJs() {
    let js = this.inputJs();
    js = js.replace(/;(?!\s*})/g, ';\n').replace(/\{/g, ' {\n  ').replace(/\}/g, '\n}\n');
    this.outputJs.set(js);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputJs());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
