import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hmac-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🛡️ HMAC Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Compute Hash-based Message Authentication Codes (HMAC-SHA256, HMAC-SHA512) with custom secret keys via Web Crypto API.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Secret Key</label>
              <input type="text" [ngModel]="secretKey()" (ngModelChange)="onSecretChange($event)"
                     placeholder="super-secret-key"
                     class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Hash Algorithm</label>
              <select [ngModel]="algorithm()" (ngModelChange)="onAlgoChange($event)"
                      class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none">
                <option value="SHA-256">HMAC-SHA256</option>
                <option value="SHA-512">HMAC-SHA512</option>
                <option value="SHA-1">HMAC-SHA1</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Message Data</label>
            <textarea [ngModel]="messageText()" (ngModelChange)="onMessageChange($event)"
                      class="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
            </textarea>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-300">Calculated HMAC Digest</label>
              <button (click)="copyHmac()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded">
                {{ copyStatus() }}
              </button>
            </div>
            <textarea readonly [value]="hmacResult()"
                      class="w-full h-20 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-emerald-400 focus:outline-none">
            </textarea>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HmacGenComponent {
  secretKey = signal<string>('secret-key-123');
  messageText = signal<string>('{"user":"jules","action":"auth"}');
  algorithm = signal<string>('SHA-256');
  hmacResult = signal<string>('');
  copyStatus = signal<string>('Copy Digest');

  constructor() {
    this.calculateHmac();
  }

  onSecretChange(k: string) {
    this.secretKey.set(k);
    this.calculateHmac();
  }

  onMessageChange(m: string) {
    this.messageText.set(m);
    this.calculateHmac();
  }

  onAlgoChange(a: string) {
    this.algorithm.set(a);
    this.calculateHmac();
  }

  async calculateHmac() {
    try {
      const enc = new TextEncoder();
      const keyData = enc.encode(this.secretKey() || 'key');
      const msgData = enc.encode(this.messageText());

      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: this.algorithm() } },
        false,
        ['sign']
      );

      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      this.hmacResult.set(hex);
    } catch {
      this.hmacResult.set('Error computing HMAC');
    }
  }

  copyHmac() {
    navigator.clipboard.writeText(this.hmacResult());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Digest'), 2000);
  }
}
