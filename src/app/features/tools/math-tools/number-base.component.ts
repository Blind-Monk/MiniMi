import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-number-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🧮 Number Base Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert numbers seamlessly between Decimal, Hexadecimal, Octal, and Binary representations.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label class="text-xs font-semibold text-slate-300 block mb-1">Decimal (Base 10)</label>
              <input type="text" [ngModel]="decValue()" (ngModelChange)="onDecChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-white font-mono">
            </div>

            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label class="text-xs font-semibold text-slate-300 block mb-1">Hexadecimal (Base 16)</label>
              <input type="text" [ngModel]="hexValue()" (ngModelChange)="onHexChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-amber-400 font-mono">
            </div>

            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label class="text-xs font-semibold text-slate-300 block mb-1">Binary (Base 2)</label>
              <input type="text" [ngModel]="binValue()" (ngModelChange)="onBinChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-emerald-400 font-mono">
            </div>

            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <label class="text-xs font-semibold text-slate-300 block mb-1">Octal (Base 8)</label>
              <input type="text" [ngModel]="octValue()" (ngModelChange)="onOctChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-indigo-300 font-mono">
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NumberBaseComponent {
  decValue = signal<string>('255');
  hexValue = signal<string>('FF');
  binValue = signal<string>('11111111');
  octValue = signal<string>('377');

  onDecChange(val: string) {
    const n = parseInt(val, 10);
    this.updateAll(n);
  }

  onHexChange(val: string) {
    const n = parseInt(val, 16);
    this.updateAll(n);
  }

  onBinChange(val: string) {
    const n = parseInt(val, 2);
    this.updateAll(n);
  }

  onOctChange(val: string) {
    const n = parseInt(val, 8);
    this.updateAll(n);
  }

  updateAll(n: number) {
    if (isNaN(n)) return;
    this.decValue.set(n.toString(10));
    this.hexValue.set(n.toString(16).toUpperCase());
    this.binValue.set(n.toString(2));
    this.octValue.set(n.toString(8));
  }
}
