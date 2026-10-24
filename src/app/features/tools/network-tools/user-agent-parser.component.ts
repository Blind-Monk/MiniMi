import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-agent-parser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>💻 User-Agent Parser</span>
        </h3>
        <p class="text-xs text-slate-400">
          Decode browser user-agent strings to identify browser family, operating system, device type, and engine.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">User Agent String</label>
            <textarea [ngModel]="uaInput()" (ngModelChange)="onUaChange($event)"
                      class="w-full h-24 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none">
            </textarea>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 font-mono text-xs">
            <div class="flex justify-between border-b border-slate-700/50 py-1.5"><span class="text-slate-400">Browser Family:</span><span class="text-emerald-400">{{ browser() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1.5"><span class="text-slate-400">Operating System:</span><span class="text-amber-400">{{ os() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1.5"><span class="text-slate-400">Device Category:</span><span class="text-purple-300">{{ device() }}</span></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserAgentParserComponent {
  uaInput = signal<string>(navigator.userAgent);
  browser = signal<string>('Chrome / Edge / Safari');
  os = signal<string>('macOS / Linux / Windows');
  device = signal<string>('Desktop / Mobile');

  constructor() {
    this.parseUa();
  }

  onUaChange(ua: string) {
    this.uaInput.set(ua);
    this.parseUa();
  }

  parseUa() {
    const ua = this.uaInput();
    if (ua.includes('Chrome')) this.browser.set('Google Chrome');
    else if (ua.includes('Firefox')) this.browser.set('Mozilla Firefox');
    else if (ua.includes('Safari')) this.browser.set('Apple Safari');

    if (ua.includes('Macintosh')) this.os.set('macOS');
    else if (ua.includes('Windows')) this.os.set('Windows');
    else if (ua.includes('Linux')) this.os.set('Linux');

    this.device.set(ua.includes('Mobile') ? 'Mobile Device' : 'Desktop Computer');
  }
}
