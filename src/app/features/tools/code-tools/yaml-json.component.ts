import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-yaml-json',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔀 YAML to JSON / JSON to YAML Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Seamless bidirectional conversion between YAML configuration files and JSON data objects.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              <button (click)="yamlToJson()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                YAML ➔ JSON
              </button>
              <button (click)="jsonToYaml()" class="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow">
                JSON ➔ YAML
              </button>
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input Content (YAML or JSON)</label>
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
export class YamlJsonComponent {
  inputText = signal<string>('name: Minimi App\nversion: 1.0.0\nfeatures:\n  - Fast\n  - Offline\n  - Complete');
  outputText = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.yamlToJson();
  }

  yamlToJson() {
    try {
      const lines = this.inputText().split('\n').filter(Boolean);
      const obj: any = {};
      let currentKey = '';

      lines.forEach(line => {
        if (line.includes(':')) {
          const [k, v] = line.split(':');
          if (v && v.trim()) {
            obj[k.trim()] = v.trim();
          } else {
            currentKey = k.trim();
            obj[currentKey] = [];
          }
        } else if (line.trim().startsWith('- ') && currentKey) {
          obj[currentKey].push(line.trim().replace('- ', ''));
        }
      });

      this.outputText.set(JSON.stringify(obj, null, 2));
    } catch {
      this.outputText.set('Invalid YAML format');
    }
  }

  jsonToYaml() {
    try {
      const parsed = JSON.parse(this.inputText());
      let yaml = '';
      for (const [k, v] of Object.entries(parsed)) {
        if (Array.isArray(v)) {
          yaml += `${k}:\n`;
          v.forEach(item => { yaml += `  - ${item}\n`; });
        } else {
          yaml += `${k}: ${v}\n`;
        }
      }
      this.outputText.set(yaml.trim());
    } catch {
      this.outputText.set('Invalid JSON input');
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputText());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
