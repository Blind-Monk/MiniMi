import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cps-reaction-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⚡ Clicks Per Second (CPS) & Reaction Time Test</span>
        </h3>
        <p class="text-xs text-slate-400">
          Benchmark your mouse click speed (CPS) and visual reaction time in milliseconds.
        </p>

        <div class="mt-4 space-y-6">
          <!-- CPS Test Box -->
          <div (click)="onClickTarget()"
               class="bg-indigo-600 hover:bg-indigo-500 p-8 rounded-2xl border border-indigo-400 text-center cursor-pointer select-none transition-all shadow-xl">
            <span class="text-3xl block mb-1">⚡</span>
            <p class="text-xl font-bold text-white">Click Here Fast!</p>
            <p class="text-xs text-indigo-200 mt-1">Clicks: {{ clickCount() }} | Time Remaining: {{ timeLeft() }}s</p>
          </div>

          <div class="grid grid-cols-2 gap-4 text-center font-mono">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase text-slate-400 block">CPS Score</span>
              <span class="text-2xl font-bold text-emerald-400">{{ cpsScore().toFixed(1) }} CPS</span>
            </div>

            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase text-slate-400 block">Total Clicks</span>
              <span class="text-2xl font-bold text-amber-400">{{ clickCount() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CpsReactionTestComponent {
  clickCount = signal<number>(0);
  timeLeft = signal<number>(5);
  cpsScore = signal<number>(0);
  isTesting = signal<boolean>(false);

  private timer: any = null;

  onClickTarget() {
    if (!this.isTesting()) {
      this.isTesting.set(true);
      this.clickCount.set(1);
      this.timeLeft.set(5);

      this.timer = setInterval(() => {
        if (this.timeLeft() > 1) {
          this.timeLeft.set(this.timeLeft() - 1);
        } else {
          clearInterval(this.timer);
          this.isTesting.set(false);
          this.cpsScore.set(this.clickCount() / 5);
        }
      }, 1000);
    } else {
      this.clickCount.set(this.clickCount() + 1);
    }
  }
}
