import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SchemaColumn {
  name: string;
  type: string;
  isPk?: boolean;
}

interface SchemaTable {
  name: string;
  columns: SchemaColumn[];
}

@Component({
  selector: 'app-sql-schema-visualizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📐 SQL Schema Visualizer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Render database CREATE TABLE DDL statements into interactive ER diagram tables.
        </p>

        <div class="mt-4 space-y-4">
          <button (click)="parseSchema()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
            ✨ Render Visual ERD Schema
          </button>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">SQL CREATE TABLE DDL Statements</label>
              <textarea [ngModel]="inputSql()" (ngModelChange)="inputSql.set($event)"
                        class="w-full h-72 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div class="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 max-h-72 overflow-y-auto">
              <h4 class="text-xs font-semibold text-slate-300">Visual Tables Diagram ({{ tables().length }})</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @for (t of tables(); track t.name) {
                  <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                    <div class="bg-indigo-600/30 px-3 py-2 border-b border-slate-700 flex items-center justify-between">
                      <span class="text-xs font-mono font-bold text-indigo-300">🗄️ {{ t.name }}</span>
                      <span class="text-[10px] font-mono text-slate-400">{{ t.columns.length }} cols</span>
                    </div>
                    <div class="p-2 space-y-1">
                      @for (col of t.columns; track col.name) {
                        <div class="flex items-center justify-between text-[11px] font-mono py-0.5 px-2 bg-slate-900/60 rounded">
                          <span class="text-slate-200 flex items-center space-x-1">
                            @if (col.isPk) { <span class="text-amber-400 text-[10px]">🔑</span> }
                            <span>{{ col.name }}</span>
                          </span>
                          <span class="text-slate-400 text-[10px]">{{ col.type }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SqlSchemaVisualizerComponent {
  inputSql = signal<string>(`CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT,
  total DECIMAL(10, 2),
  status VARCHAR(20)
);`);

  tables = signal<SchemaTable[]>([]);

  constructor() {
    this.parseSchema();
  }

  parseSchema() {
    const raw = this.inputSql();
    const tableBlocks = raw.split(/CREATE TABLE/i).filter(Boolean);
    const parsedTables: SchemaTable[] = [];

    tableBlocks.forEach(block => {
      const nameMatch = block.match(/^\s*([a-zA-Z0-9_]+)\s*\(/);
      if (!nameMatch) return;

      const tableName = nameMatch[1];
      const bodyMatch = block.match(/\(([\s\S]*?)\);/);
      if (!bodyMatch) return;

      const lines = bodyMatch[1].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));
      const columns: SchemaColumn[] = [];

      lines.forEach(line => {
        const parts = line.replace(',', '').split(/\s+/);
        if (parts.length >= 2) {
          const name = parts[0];
          const type = parts[1];
          const isPk = line.toUpperCase().includes('PRIMARY KEY');
          columns.push({ name, type, isPk });
        }
      });

      parsedTables.push({ name: tableName, columns });
    });

    this.tables.set(parsedTables);
  }
}
