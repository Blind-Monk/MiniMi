import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-diff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⚖️ Text Diff / Compare Checker</span>
        </h3>
        <p class="text-xs text-slate-400">
          Side-by-side text comparison highlighting insertions, deletions, and line changes.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Original Text (A)</label>
              <textarea [ngModel]="textA()" (ngModelChange)="onTextAChange($event)"
                        class="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Modified Text (B)</label>
              <textarea [ngModel]="textB()" (ngModelChange)="onTextBChange($event)"
                        class="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>
          </div>

          <!-- Highlighted Diff Result -->
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 font-mono text-xs overflow-x-auto max-h-60">
            <h4 class="text-xs font-semibold text-slate-400 mb-2">Diff Highlighting Breakdown</h4>
            @for (line of diffLines(); track $index) {
              <div [class.bg-emerald-950/60]="line.type === 'add'"
                   [class.text-emerald-400]="line.type === 'add'"
                   [class.bg-red-950/60]="line.type === 'remove'"
                   [class.text-red-400]="line.type === 'remove'"
                   [class.text-slate-300]="line.type === 'same'"
                   class="px-2 py-0.5 rounded font-mono">
                <span class="inline-block w-6 text-slate-600 select-none">{{ line.prefix }}</span>
                <span>{{ line.text }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class TextDiffComponent {
  textA = signal<string>('Hello Minimi\nClient-side suite\nFast tools');
  textB = signal<string>('Hello Minimi App\nClient-side suite\nSuper Fast tools\nNew Line Added');

  diffLines = signal<{ prefix: string; text: string; type: 'add' | 'remove' | 'same' }[]>([]);

  constructor() {
    this.computeDiff();
  }

  onTextAChange(t: string) {
    this.textA.set(t);
    this.computeDiff();
  }

  onTextBChange(t: string) {
    this.textB.set(t);
    this.computeDiff();
  }

  computeDiff() {
    const linesA = this.textA().split('\n');
    const linesB = this.textB().split('\n');

    const result: { prefix: string; text: string; type: 'add' | 'remove' | 'same' }[] = [];
    const max = Math.max(linesA.length, linesB.length);

    for (let i = 0; i < max; i++) {
      const a = linesA[i];
      const b = linesB[i];

      if (a === b) {
        if (a !== undefined) result.push({ prefix: '  ', text: a, type: 'same' });
      } else {
        if (a !== undefined) result.push({ prefix: '- ', text: a, type: 'remove' });
        if (b !== undefined) result.push({ prefix: '+ ', text: b, type: 'add' });
      }
    }

    this.diffLines.set(result);
  }
}
