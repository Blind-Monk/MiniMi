import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-find-replace-regex',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔍 Find and Replace Regex Tool</span>
        </h3>
        <p class="text-xs text-slate-400">
          Perform search and replace operations across multiline text blocks using Regular Expressions.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Find Pattern (Regex)</label>
              <input type="text" [ngModel]="findPattern()" (ngModelChange)="onPatternChange($event)"
                     placeholder="\\d+"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Replace With</label>
              <input type="text" [ngModel]="replacePattern()" (ngModelChange)="onReplaceChange($event)"
                     placeholder="[NUM]"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Text</label>
              <textarea [ngModel]="inputText()" (ngModelChange)="onInputTextChange($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Replaced Output</label>
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
export class FindReplaceRegexComponent {
  inputText = signal<string>('Item 1: $100\nItem 2: $250\nItem 3: $500');
  findPattern = signal<string>('\\$\\d+');
  replacePattern = signal<string>('$99.99');
  outputText = signal<string>('');

  constructor() {
    this.executeReplace();
  }

  onInputTextChange(t: string) {
    this.inputText.set(t);
    this.executeReplace();
  }

  onPatternChange(p: string) {
    this.findPattern.set(p);
    this.executeReplace();
  }

  onReplaceChange(r: string) {
    this.replacePattern.set(r);
    this.executeReplace();
  }

  executeReplace() {
    try {
      const reg = new RegExp(this.findPattern(), 'g');
      const res = this.inputText().replace(reg, this.replacePattern());
      this.outputText.set(res);
    } catch {
      this.outputText.set('Invalid Regex Pattern');
    }
  }
}
