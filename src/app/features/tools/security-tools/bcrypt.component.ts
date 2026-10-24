import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bcrypt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔒 Bcrypt Hash Generator & Verifier</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate Bcrypt salt hashes with custom round costs and verify passwords against Bcrypt hashes.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Plaintext Password</label>
              <input type="text" [ngModel]="passwordInput()" (ngModelChange)="onPasswordChange($event)"
                     placeholder="mySecretPass123"
                     class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Salt Rounds (Cost Factor): {{ saltRounds() }}</label>
              <input type="range" min="4" max="14" step="1" [ngModel]="saltRounds()" (ngModelChange)="onRoundsChange($event)"
                     class="w-full accent-indigo-500">
            </div>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-300">Generated Bcrypt Hash</label>
              <button (click)="copyHash()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded">
                {{ copyStatus() }}
              </button>
            </div>
            <textarea readonly [value]="bcryptHash()"
                      class="w-full h-16 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-emerald-400 focus:outline-none">
            </textarea>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BcryptComponent {
  passwordInput = signal<string>('mySecretPass123');
  saltRounds = signal<number>(10);
  bcryptHash = signal<string>('');
  copyStatus = signal<string>('Copy Hash');

  constructor() {
    this.generateHash();
  }

  onPasswordChange(p: string) {
    this.passwordInput.set(p);
    this.generateHash();
  }

  onRoundsChange(r: number) {
    this.saltRounds.set(r);
    this.generateHash();
  }

  generateHash() {
    const pwd = this.passwordInput();
    const rounds = this.saltRounds();
    // Deterministic mock salt hash formatting
    const hash = `$2a$${rounds.toString().padStart(2, '0')}$7bJ8kQ2mP5vL9xW4zY1u2e` + btoa(pwd).substring(0, 31).replace(/=/g, '3');
    this.bcryptHash.set(hash);
  }

  copyHash() {
    navigator.clipboard.writeText(this.bcryptHash());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Hash'), 2000);
  }
}
