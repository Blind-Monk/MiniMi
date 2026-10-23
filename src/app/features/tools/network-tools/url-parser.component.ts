import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-url-parser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔗 URL Parser & Inspector</span>
        </h3>
        <p class="text-xs text-slate-400">
          Break down complex URLs into protocol, hostname, port, pathname, search params table, and hash.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Target URL String</label>
            <input type="text" [ngModel]="urlInput()" (ngModelChange)="onUrlChange($event)"
                   class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500">
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 font-mono text-xs">
            <div class="flex justify-between border-b border-slate-700/50 py-1.5"><span class="text-slate-400">Protocol:</span><span class="text-emerald-400">{{ protocol() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1.5"><span class="text-slate-400">Hostname:</span><span class="text-amber-400">{{ host() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1.5"><span class="text-slate-400">Pathname:</span><span class="text-indigo-300">{{ pathname() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1.5"><span class="text-slate-400">Search Query:</span><span class="text-purple-300">{{ search() }}</span></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UrlParserComponent {
  urlInput = signal<string>('https://minimi.app/tools/json-formatter?theme=dark&lang=ts#section2');
  protocol = signal<string>('https:');
  host = signal<string>('minimi.app');
  pathname = signal<string>('/tools/json-formatter');
  search = signal<string>('?theme=dark&lang=ts');

  constructor() {
    this.parseUrl();
  }

  onUrlChange(url: string) {
    this.urlInput.set(url);
    this.parseUrl();
  }

  parseUrl() {
    try {
      const u = new URL(this.urlInput());
      this.protocol.set(u.protocol);
      this.host.set(u.host);
      this.pathname.set(u.pathname);
      this.search.set(u.search);
    } catch {
      // Ignore
    }
  }
}
