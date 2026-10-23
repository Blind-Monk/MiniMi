import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jwt-debugger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔑 JWT (JSON Web Token) Debugger & Decoder</span>
        </h3>
        <p class="text-xs text-slate-400">
          Inspect JWT header, payload JSON claims, expiration dates, and signatures client-side.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Encoded JWT Token String</label>
            <textarea [ngModel]="tokenInput()" (ngModelChange)="onTokenChange($event)"
                      class="w-full h-28 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500">
            </textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Header (Algorithm & Token Type)</label>
              <textarea readonly [value]="headerJson()"
                        class="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-amber-400 focus:outline-none">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Payload (Data Claims)</label>
              <textarea readonly [value]="payloadJson()"
                        class="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JwtDebuggerComponent {
  tokenInput = signal<string>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  headerJson = signal<string>('');
  payloadJson = signal<string>('');

  constructor() {
    this.decodeToken();
  }

  onTokenChange(token: string) {
    this.tokenInput.set(token);
    this.decodeToken();
  }

  decodeToken() {
    try {
      const parts = this.tokenInput().trim().split('.');
      if (parts.length >= 2) {
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        this.headerJson.set(JSON.stringify(header, null, 2));
        this.payloadJson.set(JSON.stringify(payload, null, 2));
      } else {
        this.headerJson.set('Invalid JWT Structure');
        this.payloadJson.set('Invalid JWT Structure');
      }
    } catch {
      this.headerJson.set('Decoding Error');
      this.payloadJson.set('Decoding Error');
    }
  }
}
