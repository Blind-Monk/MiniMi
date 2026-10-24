import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📐 Unit Converter Suite</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert length, weight, temperature, and data storage size units.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Input Value</label>
              <input type="number" [ngModel]="inputValue()" (ngModelChange)="onValueChange($event)"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">From Unit</label>
              <select [ngModel]="fromUnit()" (ngModelChange)="onFromChange($event)" class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                <option value="meters">Meters (m)</option>
                <option value="feet">Feet (ft)</option>
                <option value="inches">Inches (in)</option>
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles (mi)</option>
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">To Unit</label>
              <select [ngModel]="toUnit()" (ngModelChange)="onToChange($event)" class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
                <option value="feet">Feet (ft)</option>
                <option value="meters">Meters (m)</option>
                <option value="inches">Inches (in)</option>
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles (mi)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
                <option value="celsius">Celsius (°C)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>
          </div>

          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center font-mono">
            <span class="text-2xl font-bold text-emerald-400">{{ result() }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UnitConverterComponent {
  inputValue = signal<number>(100);
  fromUnit = signal<string>('meters');
  toUnit = signal<string>('feet');
  result = signal<string>('328.08 ft');

  constructor() {
    this.convert();
  }

  onValueChange(v: number) {
    this.inputValue.set(v);
    this.convert();
  }

  onFromChange(u: string) {
    this.fromUnit.set(u);
    this.convert();
  }

  onToChange(u: string) {
    this.toUnit.set(u);
    this.convert();
  }

  convert() {
    const val = this.inputValue();
    const f = this.fromUnit();
    const t = this.toUnit();

    let res = val;

    if (f === 'meters' && t === 'feet') res = val * 3.28084;
    else if (f === 'feet' && t === 'meters') res = val / 3.28084;
    else if (f === 'celsius' && t === 'fahrenheit') res = (val * 9/5) + 32;
    else if (f === 'fahrenheit' && t === 'celsius') res = (val - 32) * 5/9;
    else if (f === 'kg' && t === 'lbs') res = val * 2.20462;
    else if (f === 'lbs' && t === 'kg') res = val / 2.20462;

    this.result.set(`${res.toFixed(2)} ${t}`);
  }
}
