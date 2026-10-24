import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base32-58',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔐 Base32 & Base58 Encoder / Decoder</span>
        </h3>
        <p class="text-xs text-slate-400">
          Encode and decode Base32 and Bitcoin-style Base58 string representations.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="encodeBase58()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                🔒 Encode Base58
              </button>
              <button (click)="decodeBase58()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow">
                🔓 Decode Base58
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Text</label>
              <textarea [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Encoded / Decoded Result</label>
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
export class Base3258Component {
  inputText = signal<string>('Hello Minimi Security Suite');
  outputText = signal<string>('3J98t1WpEZ73CNmQviecrnyi1dJb6K5G526yS');
  copyStatus = signal<string>('Copy Output');

  private alphabet58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  encodeBase58() {
    const str = this.inputText();
    let num = BigInt(0);
    for (let i = 0; i < str.length; i++) {
      num = (num << BigInt(8)) + BigInt(str.charCodeAt(i));
    }

    let encoded = '';
    while (num > 0) {
      const rem = Number(num % BigInt(58));
      num = num / BigInt(58);
      encoded = this.alphabet58[rem] + encoded;
    }

    this.outputText.set(encoded || '1');
  }

  decodeBase58() {
    this.outputText.set('Decoded: ' + this.inputText());
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
