import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-binary-translator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>💻 Binary Translator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Translate plain text strings to binary 01010101 streams and back.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="textToBinary()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                Text ➔ Binary
              </button>
              <button (click)="binaryToText()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow">
                Binary ➔ Text
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Content</label>
              <textarea [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Converted Output</label>
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
export class BinaryTranslatorComponent {
  inputText = signal<string>('Minimi');
  outputText = signal<string>('01001101 01101001 01101110 01101001 01101101 01101001');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.textToBinary();
  }

  textToBinary() {
    const raw = this.inputText();
    const bin = raw.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    this.outputText.set(bin);
  }

  binaryToText() {
    try {
      const bins = this.inputText().trim().split(/\s+/);
      const str = bins.map(b => String.fromCharCode(parseInt(b, 2))).join('');
      this.outputText.set(str);
    } catch {
      this.outputText.set('Invalid Binary Sequence');
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
