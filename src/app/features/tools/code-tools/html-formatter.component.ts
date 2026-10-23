import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-html-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌐 HTML Formatter & Minifier</span>
        </h3>
        <p class="text-xs text-slate-400">
          Beautify nested HTML tag structures or compress HTML markup into minified strings.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="formatHtml()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                ✨ Beautify HTML
              </button>
              <button (click)="minifyHtml()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl">
                ⚡ Minify HTML
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input HTML Markup</label>
              <textarea [ngModel]="inputHtml()" (ngModelChange)="inputHtml.set($event)"
                        placeholder="<div class='container'><h1>Title</h1><p>Text</p></div>"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Formatted / Minified Result</label>
              <textarea readonly [value]="outputHtml()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HtmlFormatterComponent {
  inputHtml = signal<string>('<div class="card"><div class="card-header"><h1>Hello Minimi</h1></div><div class="card-body"><p>Fast client-side tools.</p></div></div>');
  outputHtml = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.formatHtml();
  }

  formatHtml() {
    const raw = this.inputHtml();
    let indent = 0;
    const tokens = raw.replace(/>\s*</g, '><').replace(/</g, '\n<').split('\n').filter(Boolean);

    const formatted = tokens.map(token => {
      if (token.match(/^<\//)) {
        indent = Math.max(0, indent - 1);
      }
      const line = '  '.repeat(indent) + token;
      if (token.match(/^<[^\/!].*[^/]>$/) && !token.match(/^<(img|input|br|hr|link|meta)/i)) {
        indent++;
      }
      return line;
    }).join('\n');

    this.outputHtml.set(formatted);
  }

  minifyHtml() {
    const min = this.inputHtml().replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    this.outputHtml.set(min);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputHtml());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
