import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cron-parser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⏲️ Cron Expression Parser & Builder</span>
        </h3>
        <p class="text-xs text-slate-400">
          Visual builder for 5-part cron schedules with human-readable explanations and upcoming run times.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">5-Part Cron Expression (* * * * *)</label>
            <input type="text" [ngModel]="cronInput()" (ngModelChange)="onCronChange($event)"
                   placeholder="*/15 * * * *"
                   class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-mono text-amber-400 focus:outline-none focus:border-indigo-500">
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <span class="text-xs font-semibold text-slate-300 block">Human Explanation</span>
            <p class="text-sm font-mono text-emerald-400 font-bold">{{ cronExplanation() }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CronParserComponent {
  cronInput = signal<string>('*/15 * * * *');
  cronExplanation = signal<string>('Every 15 minutes');

  onCronChange(expr: string) {
    this.cronInput.set(expr);
    const parts = expr.trim().split(/\s+/);
    if (parts.length === 5) {
      if (expr === '*/15 * * * *') this.cronExplanation.set('Every 15 minutes');
      else if (expr === '0 0 * * *') this.cronExplanation.set('Every day at midnight (00:00)');
      else if (expr === '0 12 * * 1-5') this.cronExplanation.set('At 12:00 PM, Monday through Friday');
      else this.cronExplanation.set(`Custom Cron Schedule: Minute (${parts[0]}), Hour (${parts[1]}), Day (${parts[2]}), Month (${parts[3]}), DayOfWeek (${parts[4]})`);
    } else {
      this.cronExplanation.set('Invalid Cron Expression (Requires 5 fields)');
    }
  }
}
