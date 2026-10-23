import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rsa-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔐 RSA Key Pair Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate 1024, 2048, or 4096-bit RSA public and private key pairs client-side via Web Crypto API.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              @for (b of [1024, 2048, 4096]; track b) {
                <button
                  (click)="keySize.set(b)"
                  [class.bg-indigo-600]="keySize() === b"
                  [class.text-white]="keySize() === b"
                  [class.bg-slate-700]="keySize() !== b"
                  [class.text-slate-300]="keySize() !== b"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all">
                  {{ b }} bits
                </button>
              }
            </div>

            <button (click)="generateKeyPair()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              🔑 Generate Key Pair
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Public Key (PEM Format)</label>
              <textarea readonly [value]="publicKeyPem()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Private Key (PEM Format)</label>
              <textarea readonly [value]="privateKeyPem()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-amber-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RsaGenComponent {
  keySize = signal<number>(2048);
  publicKeyPem = signal<string>('Click "Generate Key Pair" to compute Web Crypto RSA keys...');
  privateKeyPem = signal<string>('Click "Generate Key Pair" to compute Web Crypto RSA keys...');

  async generateKeyPair() {
    this.publicKeyPem.set('Generating cryptographic key pair...');
    this.privateKeyPem.set('Generating cryptographic key pair...');

    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSASSA-PKCS1-v1_5',
          modulusLength: this.keySize(),
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );

      const pubExported = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privExported = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      this.publicKeyPem.set(this.toPem(pubExported, 'PUBLIC KEY'));
      this.privateKeyPem.set(this.toPem(privExported, 'PRIVATE KEY'));
    } catch {
      this.publicKeyPem.set('Error generating keys');
      this.privateKeyPem.set('Error generating keys');
    }
  }

  toPem(buf: ArrayBuffer, type: string): string {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    const formatted = b64.match(/.{1,64}/g)?.join('\n') || b64;
    return `-----BEGIN ${type}-----\n${formatted}\n-----END ${type}-----`;
  }
}
