import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-timezone-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌍 Timezone Meeting Planner</span>
        </h3>
        <p class="text-xs text-slate-400">
          Compare multiple global timezones side-by-side to find optimal cross-border meeting slots.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (tz of timezones; track tz.city) {
              <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center space-y-1">
                <span class="text-2xl block mb-1">{{ tz.flag }}</span>
                <span class="text-xs font-bold text-white block">{{ tz.city }}</span>
                <span class="text-[10px] font-mono text-slate-400 block">{{ tz.zone }}</span>
                <span class="text-lg font-mono font-bold text-amber-400 block mt-2">{{ getTime(tz.offset) }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class TimezonePlannerComponent {
  timezones = [
    { city: 'London (UTC/GMT)', zone: 'GMT+0', offset: 0, flag: '🇬🇧' },
    { city: 'New York (EST)', zone: 'UTC-5', offset: -5, flag: '🇺🇸' },
    { city: 'San Francisco (PST)', zone: 'UTC-8', offset: -8, flag: '🇺🇸' },
    { city: 'Tokyo (JST)', zone: 'UTC+9', offset: 9, flag: '🇯🇵' }
  ];

  getTime(offset: number): string {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const target = new Date(utc + (3600000 * offset));
    return target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}
