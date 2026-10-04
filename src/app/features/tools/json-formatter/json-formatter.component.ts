import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-3xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-teal-400">⚙️ JSON Formatter & Validator</h3>
        <div class="flex space-x-2">
          <button (click)="formatJSON()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold">Format</button>
          <button (click)="minifyJSON()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold">Minify</button>
          <button (click)="clearAll()" class="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-xs font-semibold">Clear</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-mono text-slate-400 mb-1">Input JSON</label>
          <textarea
            [(ngModel)]="rawInput"
            placeholder='Paste JSON here, e.g. {"name": "Minimi", "version": 1}'
            class="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500">
          </textarea>
        </div>

        <div>
          <label class="block text-xs font-mono text-slate-400 mb-1">Formatted Output</label>
          <textarea
            readonly
            [value]="formattedOutput"
            placeholder="Formatted JSON will appear here..."
            class="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-emerald-400 focus:outline-none">
          </textarea>
        </div>
      </div>

      @if (errorMsg) {
        <div class="p-2.5 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-xs font-mono">
          ❌ {{ errorMsg }}
        </div>
      }
    </div>
  `
})
export class JsonFormatterComponent {
  rawInput = '{"app":"Minimi","type":"FrontEnd","features":["Games","Tools"]}';
  formattedOutput = '';
  errorMsg = '';

  constructor() {
    this.formatJSON();
  }

  formatJSON() {
    this.errorMsg = '';
    try {
      const parsed = JSON.parse(this.rawInput);
      this.formattedOutput = JSON.stringify(parsed, null, 2);
    } catch (e: any) {
      this.errorMsg = e.message;
    }
  }

  minifyJSON() {
    this.errorMsg = '';
    try {
      const parsed = JSON.parse(this.rawInput);
      this.formattedOutput = JSON.stringify(parsed);
    } catch (e: any) {
      this.errorMsg = e.message;
    }
  }

  clearAll() {
    this.rawInput = '';
    this.formattedOutput = '';
    this.errorMsg = '';
  }
}
