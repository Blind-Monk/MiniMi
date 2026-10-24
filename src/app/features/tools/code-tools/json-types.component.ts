import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🏷️ JSON to Type Definitions</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate TypeScript interfaces, Go structs, Python Pydantic models, or Java POJOs from JSON objects.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              @for (lang of ['TypeScript', 'Go', 'Python', 'Java']; track lang) {
                <button
                  (click)="setLang(lang)"
                  [class.bg-indigo-600]="selectedLang() === lang"
                  [class.text-white]="selectedLang() === lang"
                  [class.bg-slate-700]="selectedLang() !== lang"
                  [class.text-slate-300]="selectedLang() !== lang"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all">
                  {{ lang }}
                </button>
              }
            </div>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input JSON Payload</label>
              <textarea [ngModel]="inputJson()" (ngModelChange)="onJsonChange($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Generated {{ selectedLang() }} Types</label>
              <textarea readonly [value]="outputCode()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JsonTypesComponent {
  inputJson = signal<string>(JSON.stringify({
    userId: 101,
    username: 'jules_dev',
    email: 'jules@example.com',
    isVIP: true,
    roles: ['admin', 'developer']
  }, null, 2));

  selectedLang = signal<string>('TypeScript');
  outputCode = signal<string>('');
  copyStatus = signal<string>('Copy Code');

  constructor() {
    this.generateTypes();
  }

  onJsonChange(val: string) {
    this.inputJson.set(val);
    this.generateTypes();
  }

  setLang(lang: string) {
    this.selectedLang.set(lang);
    this.generateTypes();
  }

  generateTypes() {
    try {
      const obj = JSON.parse(this.inputJson());
      const lang = this.selectedLang();

      if (lang === 'TypeScript') {
        let code = 'export interface RootObject {\n';
        for (const [k, v] of Object.entries(obj)) {
          const type = Array.isArray(v) ? `${typeof v[0] || 'any'}[]` : typeof v;
          code += `  ${k}: ${type};\n`;
        }
        code += '}';
        this.outputCode.set(code);
      } else if (lang === 'Go') {
        let code = 'type RootObject struct {\n';
        for (const [k, v] of Object.entries(obj)) {
          const capKey = k.charAt(0).toUpperCase() + k.slice(1);
          let goType = 'string';
          if (typeof v === 'number') goType = 'int';
          if (typeof v === 'boolean') goType = 'bool';
          if (Array.isArray(v)) goType = '[]string';
          code += `\t${capKey} ${goType} \`json:"${k}"\`\n`;
        }
        code += '}';
        this.outputCode.set(code);
      } else if (lang === 'Python') {
        let code = 'from pydantic import BaseModel\nfrom typing import List\n\nclass RootModel(BaseModel):\n';
        for (const [k, v] of Object.entries(obj)) {
          let pyType = 'str';
          if (typeof v === 'number') pyType = 'int';
          if (typeof v === 'boolean') pyType = 'bool';
          if (Array.isArray(v)) pyType = 'List[str]';
          code += `    ${k}: ${pyType}\n`;
        }
        this.outputCode.set(code);
      } else {
        let code = 'public class RootObject {\n';
        for (const [k, v] of Object.entries(obj)) {
          let jType = 'String';
          if (typeof v === 'number') jType = 'int';
          if (typeof v === 'boolean') jType = 'boolean';
          if (Array.isArray(v)) jType = 'List<String>';
          code += `    private ${jType} ${k};\n`;
        }
        code += '}';
        this.outputCode.set(code);
      }
    } catch {
      this.outputCode.set('Invalid JSON payload');
    }
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputCode());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Code'), 2000);
  }
}
