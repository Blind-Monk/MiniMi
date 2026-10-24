import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sql-formatter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🗄️ SQL Formatter & Minifier</span>
        </h3>
        <p class="text-xs text-slate-400">
          Beautify, indent, uppercase keywords, and minify complex database queries.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="formatSql()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                ✨ Beautify SQL
              </button>
              <button (click)="minifySql()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl">
                ⚡ Minify SQL
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input SQL Query</label>
              <textarea [ngModel]="inputSql()" (ngModelChange)="inputSql.set($event)"
                        placeholder="SELECT id, name FROM users WHERE active = 1 ORDER BY created_at DESC;"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Formatted Output</label>
              <textarea readonly [value]="outputSql()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SqlFormatterComponent {
  inputSql = signal<string>('select id, name, email from users where status = \'active\' and role = \'admin\' order by created_at desc;');
  outputSql = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.formatSql();
  }

  formatSql() {
    const raw = this.inputSql();
    const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];

    let formatted = raw;
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, `\n${kw}`);
    });

    formatted = formatted.split('\n').map(line => line.trim()).filter(Boolean).join('\n');
    this.outputSql.set(formatted);
  }

  minifySql() {
    const min = this.inputSql().replace(/\s+/g, ' ').trim();
    this.outputSql.set(min);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputSql());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
