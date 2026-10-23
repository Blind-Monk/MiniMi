import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lorem-ipsum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📄 Lorem Ipsum / Placeholder Text Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate paragraphs, sentences, bullet lists, or word counts of classic placeholder text.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center space-x-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Paragraph Count: {{ count() }}</label>
                <input type="range" min="1" max="10" step="1" [ngModel]="count()" (ngModelChange)="onCountChange($event)"
                       class="w-36 accent-indigo-500">
              </div>

              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Format</label>
                <select [ngModel]="format()" (ngModelChange)="onFormatChange($event)"
                        class="bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                  <option value="paragraphs">Paragraphs</option>
                  <option value="sentences">Sentences</option>
                  <option value="bullets">Bullet List</option>
                </select>
              </div>
            </div>

            <button (click)="copyText()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto font-serif text-slate-300 text-sm space-y-3 leading-relaxed">
            @for (p of paragraphs(); track $index) {
              <p>{{ p }}</p>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoremIpsumComponent {
  count = signal<number>(3);
  format = signal<string>('paragraphs');
  paragraphs = signal<string[]>([]);
  copyStatus = signal<string>('Copy Placeholder Text');

  private baseSentences = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  ];

  constructor() {
    this.generate();
  }

  onCountChange(c: number) {
    this.count.set(c);
    this.generate();
  }

  onFormatChange(f: string) {
    this.format.set(f);
    this.generate();
  }

  generate() {
    const c = this.count();
    const result: string[] = [];

    for (let i = 0; i < c; i++) {
      if (this.format() === 'bullets') {
        result.push(`• ${this.baseSentences[i % this.baseSentences.length]}`);
      } else {
        result.push(this.baseSentences.join(' '));
      }
    }

    this.paragraphs.set(result);
  }

  copyText() {
    navigator.clipboard.writeText(this.paragraphs().join('\n\n'));
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Placeholder Text'), 2000);
  }
}
