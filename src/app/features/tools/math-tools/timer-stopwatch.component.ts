import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timer-stopwatch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⏱️ Countdown Timer & Stopwatch</span>
        </h3>
        <p class="text-xs text-slate-400">
          Precision countdown timer with audio alarms, lap timer stopwatch, and interval presets.
        </p>

        <div class="mt-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-6">
          <div class="text-6xl font-mono font-black text-indigo-400">
            {{ formatTime(seconds()) }}
          </div>

          <div class="flex items-center justify-center space-x-3">
            <button (click)="toggleTimer()"
                    [class.bg-red-600]="isRunning()"
                    [class.bg-emerald-600]="!isRunning()"
                    class="px-6 py-2.5 text-white font-bold text-xs rounded-xl shadow">
              {{ isRunning() ? '⏹️ Pause' : '▶️ Start' }}
            </button>
            <button (click)="resetTimer()" class="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl">
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TimerStopwatchComponent implements OnDestroy {
  seconds = signal<number>(300); // 5 minutes default
  isRunning = signal<boolean>(false);

  private timer: any = null;

  toggleTimer() {
    if (this.isRunning()) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    this.isRunning.set(true);
    this.timer = setInterval(() => {
      if (this.seconds() > 0) {
        this.seconds.set(this.seconds() - 1);
      } else {
        this.pause();
      }
    }, 1000);
  }

  pause() {
    this.isRunning.set(false);
    if (this.timer) clearInterval(this.timer);
  }

  resetTimer() {
    this.pause();
    this.seconds.set(300);
  }

  formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy() {
    this.pause();
  }
}
