import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-line-sort-dedupe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📑 Line Sort & Deduplicator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Sort lines alphabetically or numerically, remove duplicate entries, and scrub empty lines.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap gap-2">
              <button (click)="sortAlpha(false)" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg">
                Sort A ➔ Z
              </button>
              <button (click)="sortAlpha(true)" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg">
                Sort Z ➔ A
              </button>
              <button (click)="dedupeLines()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg">
                🧹 Remove Duplicates
              </button>
              <button (click)="scrubEmpty()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg">
                Scrub Empty Lines
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Text Lines</label>
              <textarea [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Processed Lines</label>
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
export class LineSortDedupeComponent {
  inputText = signal<string>('banana\napple\ncherry\nbanana\napple\ndate\n');
  outputText = signal<string>('apple\nbanana\ncherry\ndate');
  copyStatus = signal<string>('Copy Output');

  sortAlpha(reverse: boolean) {
    const lines = this.inputText().split('\n');
    lines.sort((a, b) => reverse ? b.localeCompare(a) : a.localeCompare(b));
    this.outputText.set(lines.join('\n'));
  }

  dedupeLines() {
    const lines = this.inputText().split('\n');
    const unique = Array.from(new Set(lines));
    this.outputText.set(unique.join('\n'));
  }

  scrubEmpty() {
    const lines = this.inputText().split('\n').filter(l => l.trim() !== '');
    this.outputText.set(lines.join('\n'));
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
