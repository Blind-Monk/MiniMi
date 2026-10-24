import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plist-json',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🍏 Plist (Apple XML) to JSON Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Parse Apple Property List (.plist) XML files into JSON objects.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <button (click)="parsePlist()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              ⚡ Parse Plist to JSON
            </button>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Apple Plist XML</label>
              <textarea [ngModel]="inputPlist()" (ngModelChange)="inputPlist.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">JSON Output</label>
              <textarea readonly [value]="outputJson()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PlistJsonComponent {
  inputPlist = signal<string>(`<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>Minimi</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
</dict>
</plist>`);

  outputJson = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.parsePlist();
  }

  parsePlist() {
    try {
      const xmlStr = this.inputPlist();
      const keys: string[] = [];
      const values: string[] = [];

      const keyMatches = xmlStr.match(/<key>(.*?)<\/key>/g) || [];
      const stringMatches = xmlStr.match(/<string>(.*?)<\/string>/g) || [];

      keyMatches.forEach(k => keys.push(k.replace(/<\/?key>/g, '')));
      stringMatches.forEach(s => values.push(s.replace(/<\/?string>/g, '')));

      const result: any = {};
      keys.forEach((key, idx) => {
        result[key] = values[idx] || '';
      });

      this.outputJson.set(JSON.stringify(result, null, 2));
    } catch {
      this.outputJson.set('Error parsing Plist XML');
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputJson());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
