import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-case-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔤 String Case Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Transform strings into camelCase, snake_case, PascalCase, kebab-case, UPPERCASE, and lowercase.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Input Text</label>
            <input type="text" [ngModel]="inputText()" (ngModelChange)="onTextChange($event)"
                   placeholder="hello minimi application suite"
                   class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (c of cases(); track c.label) {
              <div (click)="copyValue(c.val, c.label)"
                   class="bg-slate-800 p-3 rounded-xl border border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors group">
                <span class="text-[10px] font-mono text-slate-400 uppercase block font-semibold">{{ c.label }}</span>
                <span class="text-xs font-mono font-bold text-emerald-400 block mt-1 truncate">{{ c.val }}</span>
              </div>
            }
          </div>

          @if (copiedStatus()) {
            <div class="p-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-mono rounded-lg text-center">
              {{ copiedStatus() }}
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class CaseConverterComponent {
  inputText = signal<string>('hello minimi application suite');
  copiedStatus = signal<string | null>(null);

  cases = signal<{ label: string; val: string }[]>([]);

  constructor() {
    this.convert();
  }

  onTextChange(text: string) {
    this.inputText.set(text);
    this.convert();
  }

  convert() {
    const raw = this.inputText();
    const words = raw.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]+|[0-9]+/g) || [raw];

    const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    const pascal = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    const snake = words.map(w => w.toLowerCase()).join('_');
    const kebab = words.map(w => w.toLowerCase()).join('-');
    const upper = raw.toUpperCase();
    const lower = raw.toLowerCase();

    this.cases.set([
      { label: 'camelCase', val: camel },
      { label: 'PascalCase', val: pascal },
      { label: 'snake_case', val: snake },
      { label: 'kebab-case', val: kebab },
      { label: 'UPPERCASE', val: upper },
      { label: 'lowercase', val: lower }
    ]);
  }

  copyValue(val: string, label: string) {
    navigator.clipboard.writeText(val);
    this.copiedStatus.set(`Copied ${label}: "${val}"`);
    setTimeout(() => this.copiedStatus.set(null), 2000);
  }
}
