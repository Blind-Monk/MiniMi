import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hash-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-xl mx-auto space-y-4">
      <h3 class="text-lg font-bold text-teal-400">🛡️ Cryptographic Hash Generator</h3>

      <textarea
        [(ngModel)]="inputText"
        (ngModelChange)="computeHashes()"
        placeholder="Type text to calculate hashes..."
        class="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none">
      </textarea>

      <div class="space-y-2 text-left font-mono text-xs">
        <div>
          <label class="text-slate-400">SHA-256 Digest</label>
          <input readonly [value]="sha256" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-emerald-400">
        </div>
        <div>
          <label class="text-slate-400">SHA-512 Digest</label>
          <input readonly [value]="sha512" class="w-full bg-slate-950 border border-slate-800 rounded p-2 text-emerald-400">
        </div>
      </div>
    </div>
  `
})
export class HashGenComponent {
  inputText = 'Minimi FrontEnd App';
  sha256 = '';
  sha512 = '';

  constructor() {
    this.computeHashes();
  }

  async computeHashes() {
    const encoder = new TextEncoder();
    const data = encoder.encode(this.inputText);

    const hash256 = await crypto.subtle.digest('SHA-256', data);
    this.sha256 = this.bufToHex(hash256);

    const hash512 = await crypto.subtle.digest('SHA-512', data);
    this.sha512 = this.bufToHex(hash512);
  }

  private bufToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
