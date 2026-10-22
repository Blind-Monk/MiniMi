import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base64',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-3xl mx-auto space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-teal-400">🔐 Base64 Encoder / Decoder</h3>
        <div class="flex space-x-2">
          <button (click)="encode()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold">Encode</button>
          <button (click)="decode()" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-semibold">Decode</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-mono text-slate-400 mb-1">Plain Text</label>
          <textarea
            [(ngModel)]="plainText"
            (ngModelChange)="encode()"
            placeholder="Type text to encode..."
            class="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none">
          </textarea>
        </div>

        <div>
          <label class="block text-xs font-mono text-slate-400 mb-1">Base64 Encoded Output</label>
          <textarea
            [(ngModel)]="base64Text"
            (ngModelChange)="decode()"
            placeholder="Type Base64 to decode..."
            class="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-teal-300 focus:outline-none">
          </textarea>
        </div>
      </div>
    </div>
  `
})
export class Base64Component {
  plainText = 'Hello Minimi!';
  base64Text = '';

  constructor() {
    this.encode();
  }

  encode() {
    try {
      this.base64Text = btoa(this.plainText);
    } catch {
      // Ignored on invalid string
    }
  }

  decode() {
    try {
      this.plainText = atob(this.base64Text);
    } catch {
      // Ignored on invalid base64
    }
  }
}
