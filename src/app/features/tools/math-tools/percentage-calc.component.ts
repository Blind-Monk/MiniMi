import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-percentage-calc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔢 Percentage & Ratio Calculator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Calculate percentage changes, margins, discounts, tax additions, and proportion ratios.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Base Amount</label>
              <input type="number" [ngModel]="amount()" (ngModelChange)="onAmountChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-white font-mono">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Percentage Rate (%)</label>
              <input type="number" [ngModel]="percent()" (ngModelChange)="onPercentChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2.5 text-white font-mono">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">{{ percent() }}% of {{ amount() }}</span>
              <span class="text-lg font-bold text-indigo-400 font-mono">{{ percentVal() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Amount + {{ percent() }}% (Tax/Tip)</span>
              <span class="text-lg font-bold text-emerald-400 font-mono">{{ addedVal() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Amount - {{ percent() }}% (Discount)</span>
              <span class="text-lg font-bold text-amber-400 font-mono">{{ discountedVal() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PercentageCalcComponent {
  amount = signal<number>(200);
  percent = signal<number>(15);

  percentVal = signal<number>(30);
  addedVal = signal<number>(230);
  discountedVal = signal<number>(170);

  constructor() {
    this.calc();
  }

  onAmountChange(a: number) {
    this.amount.set(a);
    this.calc();
  }

  onPercentChange(p: number) {
    this.percent.set(p);
    this.calc();
  }

  calc() {
    const a = this.amount() || 0;
    const p = this.percent() || 0;

    const val = (a * p) / 100;
    this.percentVal.set(parseFloat(val.toFixed(2)));
    this.addedVal.set(parseFloat((a + val).toFixed(2)));
    this.discountedVal.set(parseFloat((a - val).toFixed(2)));
  }
}
