import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-csv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📊 JSON to CSV / CSV to JSON Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert JSON arrays to tabular CSV files and flatten structured CSV rows into JSON objects.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="jsonToCsv()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                JSON ➔ CSV
              </button>
              <button (click)="csvToJson()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow">
                CSV ➔ JSON
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Data (JSON Array or CSV)</label>
              <textarea [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Converted Output</label>
              <textarea readonly [value]="outputText()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JsonCsvComponent {
  inputText = signal<string>(JSON.stringify([
    { id: 1, name: 'Alice', role: 'Developer' },
    { id: 2, name: 'Bob', role: 'Designer' }
  ], null, 2));

  outputText = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.jsonToCsv();
  }

  jsonToCsv() {
    try {
      const data = JSON.parse(this.inputText());
      if (!Array.isArray(data) || data.length === 0) {
        this.outputText.set('JSON must be a non-empty array of objects');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];

      data.forEach(row => {
        const values = headers.map(h => JSON.stringify(row[h] ?? ''));
        csvRows.push(values.join(','));
      });

      this.outputText.set(csvRows.join('\n'));
    } catch {
      this.outputText.set('Invalid JSON input');
    }
  }

  csvToJson() {
    try {
      const lines = this.inputText().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        this.outputText.set('CSV must contain at least headers and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.replace(/^"(.*)"$/, '$1'));
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/^"(.*)"$/, '$1'));
        const obj: any = {};
        headers.forEach((h, idx) => {
          obj[h] = values[idx] ?? '';
        });
        result.push(obj);
      }

      this.outputText.set(JSON.stringify(result, null, 2));
    } catch {
      this.outputText.set('Error parsing CSV');
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
