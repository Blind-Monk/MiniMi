import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-csv-markdown-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📋 CSV to Markdown Table Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert raw CSV comma-delimited data into formatted Markdown table syntax.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <button (click)="convertCsvToMd()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              ✨ Convert to Markdown Table
            </button>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input CSV Data</label>
              <textarea [ngModel]="inputCsv()" (ngModelChange)="inputCsv.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Markdown Table Syntax</label>
              <textarea readonly [value]="outputMd()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CsvMarkdownTableComponent {
  inputCsv = signal<string>('Name, Category, Status\nJSON Formatter, Developer, Active\nBase64 Encoder, Security, Active\nPDF Tools, Documents, Active');
  outputMd = signal<string>('');
  copyStatus = signal<string>('Copy Markdown');

  constructor() {
    this.convertCsvToMd();
  }

  convertCsvToMd() {
    const lines = this.inputCsv().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(l => l.split(',').map(cell => cell.trim()));

    let md = `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

    rows.forEach(r => {
      md += `| ${r.join(' | ')} |\n`;
    });

    this.outputMd.set(md);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputMd());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Markdown'), 2000);
  }
}
