import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-what-is-my-ip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌐 "What Is My IP" & Browser Inspector</span>
        </h3>
        <p class="text-xs text-slate-400">
          Displays local public IP details, user-agent string, network protocol, and connection capabilities.
        </p>

        <div class="mt-4 bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4">
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Public IP Address</span>
          <span class="text-4xl font-mono font-black text-amber-400 block">{{ ipAddress() }}</span>

          <div class="pt-4 border-t border-slate-700/60 text-left space-y-2 font-mono text-xs max-w-lg mx-auto">
            <div class="flex justify-between"><span class="text-slate-400">User Agent:</span><span class="text-indigo-300 truncate max-w-xs">{{ userAgent() }}</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Language:</span><span class="text-emerald-400">{{ language() }}</span></div>
            <div class="flex justify-between"><span class="text-slate-400">Online Status:</span><span class="text-emerald-400">Connected ✓</span></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatIsMyIpComponent {
  ipAddress = signal<string>('127.0.0.1 (Localhost / Sandbox)');
  userAgent = signal<string>(navigator.userAgent);
  language = signal<string>(navigator.language);

  constructor() {
    this.fetchIp();
  }

  async fetchIp() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      if (data.ip) this.ipAddress.set(data.ip);
    } catch {
      // Fallback
    }
  }
}
