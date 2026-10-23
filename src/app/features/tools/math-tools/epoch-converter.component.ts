import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-epoch-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⏰ Unix Epoch Timestamp Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Live current epoch counter, convert timestamps to human dates, and translate dates to Unix timestamps.
        </p>

        <div class="mt-4 space-y-4">
          <!-- Live Current Epoch -->
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Live Unix Epoch Seconds:</span>
            <span class="text-xl font-mono font-bold text-amber-400">{{ currentEpoch() }}</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Unix Timestamp (Seconds or Milliseconds)</label>
              <input type="number" [ngModel]="tsInput()" (ngModelChange)="onTsChange($event)"
                     class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-mono text-indigo-300 focus:outline-none">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Human Date Result (UTC & Local)</label>
              <textarea readonly [value]="dateResult()"
                        class="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EpochConverterComponent implements OnDestroy {
  currentEpoch = signal<number>(Math.floor(Date.now() / 1000));
  tsInput = signal<number>(Math.floor(Date.now() / 1000));
  dateResult = signal<string>('');

  private timer: any = null;

  constructor() {
    this.timer = setInterval(() => {
      this.currentEpoch.set(Math.floor(Date.now() / 1000));
    }, 1000);
    this.convertTs();
  }

  onTsChange(val: number) {
    this.tsInput.set(val);
    this.convertTs();
  }

  convertTs() {
    let ts = this.tsInput();
    if (ts > 100000000000) { // Milliseconds
      ts = Math.floor(ts / 1000);
    }
    const d = new Date(ts * 1000);
    this.dateResult.set(`UTC:   ${d.toUTCString()}\nLocal: ${d.toString()}`);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
