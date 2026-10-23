import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-url-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔗 URL Encoder / Decoder</span>
        </h3>
        <p class="text-xs text-slate-400">
          Encode parameters safely into percent-encoded URL strings and decode query parameters.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="encodeUrl()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                🔒 Encode URL
              </button>
              <button (click)="decodeUrl()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow">
                🔓 Decode URL
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input String / URL</label>
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
export class UrlEncoderComponent {
  inputText = signal<string>('https://minimi.app/search?query=hello world & category=tools');
  outputText = signal<string>('https%3A%2F%2Fminimi.app%2Fsearch%3Fquery%3Dhello%20world%20%26%20category%3Dtools');
  copyStatus = signal<string>('Copy Output');

  encodeUrl() {
    try {
      this.outputText.set(encodeURIComponent(this.inputText()));
    } catch {
      this.outputText.set('Error encoding URL');
    }
  }

  decodeUrl() {
    try {
      this.outputText.set(decodeURIComponent(this.inputText()));
    } catch {
      this.outputText.set('Error decoding URL');
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
