import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toml-json',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📄 TOML to JSON / JSON to TOML Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert TOML config files (Cargo.toml, pyproject.toml) to JSON and back instantly.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="tomlToJson()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                TOML ➔ JSON
              </button>
              <button (click)="jsonToToml()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow">
                JSON ➔ TOML
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Content (TOML or JSON)</label>
              <textarea [ngModel]="inputText()" (ngModelChange)="inputText.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Converted Output</label>
              <textarea readonly [value]="outputText()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TomlJsonComponent {
  inputText = signal<string>('[package]\nname = "minimi-app"\nversion = "0.1.0"\n\n[dependencies]\nserde = "1.0"');
  outputText = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.tomlToJson();
  }

  tomlToJson() {
    try {
      const lines = this.inputText().split('\n');
      const result: any = {};
      let currentSection = '';

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          currentSection = trimmed.substring(1, trimmed.length - 1);
          result[currentSection] = {};
        } else if (trimmed.includes('=')) {
          const [k, v] = trimmed.split('=').map(s => s.trim().replace(/^"(.*)"$/, '$1'));
          if (currentSection) {
            result[currentSection][k] = v;
          } else {
            result[k] = v;
          }
        }
      });

      this.outputText.set(JSON.stringify(result, null, 2));
    } catch {
      this.outputText.set('Invalid TOML content');
    }
  }

  jsonToToml() {
    try {
      const obj = JSON.parse(this.inputText());
      let toml = '';

      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'object' && !Array.isArray(v)) {
          toml += `\n[${k}]\n`;
          for (const [sk, sv] of Object.entries(v as any)) {
            toml += `${sk} = "${sv}"\n`;
          }
        } else {
          toml += `${k} = "${v}"\n`;
        }
      }

      this.outputText.set(toml.trim());
    } catch {
      this.outputText.set('Invalid JSON content');
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
