import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-http-status-guide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📚 HTTP Status Code Reference Guide</span>
        </h3>
        <p class="text-xs text-slate-400">
          Searchable directory of all HTTP status codes (2xx, 3xx, 4xx, 5xx) with descriptions and fixes.
        </p>

        <div class="mt-4 space-y-4">
          <input type="text" [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
                 placeholder="Search status codes (e.g. 404, 500, Unauthorized)..."
                 class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none">

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            @for (code of filteredCodes(); track code.code) {
              <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-bold font-mono px-2 py-0.5 rounded"
                        [class.bg-emerald-950]="code.code < 300" [class.text-emerald-400]="code.code < 300"
                        [class.bg-amber-950]="code.code >= 300 && code.code < 500" [class.text-amber-400]="code.code >= 300 && code.code < 500"
                        [class.bg-red-950]="code.code >= 500" [class.text-red-400]="code.code >= 500">
                    {{ code.code }}
                  </span>
                  <span class="text-xs font-bold text-white">{{ code.name }}</span>
                </div>
                <p class="text-[11px] text-slate-400">{{ code.desc }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class HttpStatusGuideComponent {
  searchQuery = signal<string>('');

  statusCodes = [
    { code: 200, name: 'OK', desc: 'Standard successful HTTP response for requests.' },
    { code: 201, name: 'Created', desc: 'Request succeeded and a new resource was created.' },
    { code: 301, name: 'Moved Permanently', desc: 'Resource redirected permanently to a new URI.' },
    { code: 400, name: 'Bad Request', desc: 'Server cannot process request due to client error.' },
    { code: 401, name: 'Unauthorized', desc: 'Authentication required or invalid credentials.' },
    { code: 403, name: 'Forbidden', desc: 'Server understood request but refuses to authorize it.' },
    { code: 404, name: 'Not Found', desc: 'Requested resource could not be found on server.' },
    { code: 429, name: 'Too Many Requests', desc: 'Client rate limit exceeded.' },
    { code: 500, name: 'Internal Server Error', desc: 'Generic error message when server encounters unexpected condition.' },
    { code: 502, name: 'Bad Gateway', desc: 'Invalid response from upstream gateway server.' },
    { code: 503, name: 'Service Unavailable', desc: 'Server down for maintenance or overloaded.' }
  ];

  filteredCodes() {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.statusCodes;
    return this.statusCodes.filter(c => c.code.toString().includes(q) || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
  }
}
