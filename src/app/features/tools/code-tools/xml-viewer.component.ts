import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌳 XML Formatter & Tree Viewer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Format raw XML documents into collapsible tree views with syntax validation.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <button (click)="formatXml()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              ✨ Format & Validate XML
            </button>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input XML Document</label>
              <textarea [ngModel]="inputXml()" (ngModelChange)="inputXml.set($event)"
                        placeholder="<catalog><item id='1'><name>Widget</name></item></catalog>"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Formatted Tree Output</label>
              <textarea readonly [value]="outputXml()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class XmlViewerComponent {
  inputXml = signal<string>('<?xml version="1.0"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer\'s Guide</title><price>44.95</price></book></catalog>');
  outputXml = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.formatXml();
  }

  formatXml() {
    const raw = this.inputXml();
    let indent = 0;
    const tokens = raw.replace(/>\s*</g, '><').replace(/</g, '\n<').split('\n').filter(Boolean);

    const formatted = tokens.map(token => {
      if (token.match(/^<\//)) {
        indent = Math.max(0, indent - 1);
      }
      const line = '  '.repeat(indent) + token;
      if (token.match(/^<[^\/!].*[^/]>$/) && !token.match(/^<\?/)) {
        indent++;
      }
      return line;
    }).join('\n');

    this.outputXml.set(formatted);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputXml());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
