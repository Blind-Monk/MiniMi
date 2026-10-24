import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-spreadsheet-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📊 Spreadsheet Viewer (Excel / CSV / ODS)</span>
        </h3>
        <p class="text-xs text-slate-400">
          Inspect and search tabular data in Excel (.xlsx), CSV, and ODS spreadsheet files locally in-browser.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept=".csv,.xlsx,.ods" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">📊</div>
          <p class="text-sm font-semibold text-slate-200">Upload Spreadsheet File (CSV, XLSX, ODS)</p>
        </div>

        @if (rows().length > 0) {
          <div class="mt-6 space-y-4">
            <div class="flex items-center justify-between">
              <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                     placeholder="Filter rows..."
                     class="w-64 bg-slate-950 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
              <span class="text-xs font-mono text-slate-400">Showing {{ rows().length }} rows</span>
            </div>

            <!-- Table -->
            <div class="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
              <table class="w-full text-left text-xs font-mono">
                <thead class="bg-slate-800 text-slate-300">
                  <tr>
                    @for (col of headers(); track col) {
                      <th class="p-2.5 border-b border-slate-700 font-bold">{{ col }}</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800 text-slate-300">
                  @for (row of rows(); track $index) {
                    <tr class="hover:bg-slate-900/80">
                      @for (cell of row; track $index) {
                        <td class="p-2.5">{{ cell }}</td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class SpreadsheetViewerComponent {
  headers = signal<string[]>(['ID', 'Tool Name', 'Category', 'Status']);
  rows = signal<string[][]>([
    ['1', 'Image Compressor', 'Image & Graphics', 'Active'],
    ['2', 'Video Converter', 'Video & Audio', 'Active'],
    ['3', 'SQL Formatter', 'Code & Data', 'Active'],
    ['4', 'JWT Debugger', 'Security & Crypto', 'Active']
  ]);
  searchQuery = signal<string>('');

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        this.headers.set(lines[0].split(','));
        this.rows.set(lines.slice(1).map(l => l.split(',')));
      }
    };
    reader.readAsText(file);
  }
}
