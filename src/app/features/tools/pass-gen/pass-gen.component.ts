import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pass-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-md mx-auto space-y-4">
      <h3 class="text-lg font-bold text-teal-400">🔑 Password & Entropy Generator</h3>

      <div class="flex items-center space-x-2">
        <input
          readonly
          [value]="password"
          class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-teal-300">
        <button (click)="generate()" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-xs">
          Generate
        </button>
      </div>

      <div class="space-y-3 text-xs text-slate-300 text-left">
        <div class="flex justify-between items-center">
          <span>Length: {{ length }}</span>
          <input type="range" min="8" max="32" [(ngModel)]="length" (ngModelChange)="generate()" class="w-32">
        </div>
      </div>
    </div>
  `
})
export class PassGenComponent {
  password = '';
  length = 16;

  constructor() {
    this.generate();
  }

  generate() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let res = '';
    for (let i = 0; i < this.length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.password = res;
  }
}
