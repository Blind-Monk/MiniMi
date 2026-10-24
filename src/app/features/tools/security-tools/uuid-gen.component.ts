import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-uuid-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🎲 UUID / ULID / NanoID Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Bulk generate cryptographically secure UUID v4, ULID time-sortable IDs, and NanoIDs.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center space-x-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">ID Type</label>
                <select [ngModel]="idType()" (ngModelChange)="onTypeChange($event)"
                        class="bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                  <option value="uuid">UUID v4</option>
                  <option value="ulid">ULID (Time-sortable)</option>
                  <option value="nanoid">NanoID (21 char)</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Quantity: {{ count() }}</label>
                <input type="range" min="1" max="50" step="1" [ngModel]="count()" (ngModelChange)="onCountChange($event)"
                       class="w-36 accent-indigo-500">
              </div>
            </div>

            <button (click)="generateIds()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              🎲 Generate New IDs
            </button>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-300">Generated Identifiers List</label>
              <button (click)="copyOutput()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded">
                {{ copyStatus() }}
              </button>
            </div>
            <textarea readonly [value]="generatedList().join('\n')"
                      class="w-full h-64 bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none">
            </textarea>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UuidGenComponent {
  idType = signal<string>('uuid');
  count = signal<number>(10);
  generatedList = signal<string[]>([]);
  copyStatus = signal<string>('Copy All IDs');

  constructor() {
    this.generateIds();
  }

  onTypeChange(t: string) {
    this.idType.set(t);
    this.generateIds();
  }

  onCountChange(c: number) {
    this.count.set(c);
    this.generateIds();
  }

  generateIds() {
    const list: string[] = [];
    const type = this.idType();
    const qty = this.count();

    for (let i = 0; i < qty; i++) {
      if (type === 'uuid') {
        list.push(crypto.randomUUID());
      } else if (type === 'ulid') {
        const time = Date.now().toString(36).toUpperCase().padStart(10, '0');
        const rand = Array.from(crypto.getRandomValues(new Uint8Array(10)))
          .map(b => b.toString(36).toUpperCase()).join('').substring(0, 16);
        list.push(`${time}${rand}`);
      } else {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
        const bytes = crypto.getRandomValues(new Uint8Array(21));
        let id = '';
        for (let j = 0; j < 21; j++) {
          id += chars[bytes[j] % chars.length];
        }
        list.push(id);
      }
    }

    this.generatedList.set(list);
  }

  copyOutput() {
    navigator.clipboard.writeText(this.generatedList().join('\n'));
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy All IDs'), 2000);
  }
}
