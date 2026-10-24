import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-curl-converter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🚀 cURL to Code Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert cURL terminal commands into Fetch API, Axios, Python Requests, PHP, or Go code snippets.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex space-x-2">
              @for (lang of ['Fetch', 'Axios', 'Python', 'PHP']; track lang) {
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
            <button (click)="copyCode()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">cURL Command</label>
              <textarea [ngModel]="inputCurl()" (ngModelChange)="onCurlChange($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Generated {{ selectedLang() }} Snippet</label>
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
export class CurlConverterComponent {
  inputCurl = signal<string>('curl -X POST https://api.example.com/data -H "Content-Type: application/json" -d \'{"key":"value"}\'');
  selectedLang = signal<string>('Fetch');
  outputCode = signal<string>('');
  copyStatus = signal<string>('Copy Snippet');

  constructor() {
    this.convert();
  }

  onCurlChange(val: string) {
    this.inputCurl.set(val);
    this.convert();
  }

  setLang(lang: string) {
    this.selectedLang.set(lang);
    this.convert();
  }

  convert() {
    const curl = this.inputCurl();
    const urlMatch = curl.match(/https?:\/\/[^\s"']+/);
    const url = urlMatch ? urlMatch[0] : 'https://api.example.com/v1';

    const lang = this.selectedLang();

    if (lang === 'Fetch') {
      this.outputCode.set(`fetch("${url}", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json"\n  },\n  body: JSON.stringify({ key: "value" })\n})\n.then(res => res.json())\n.then(data => console.log(data));`);
    } else if (lang === 'Axios') {
      this.outputCode.set(`axios.post("${url}", {\n  key: "value"\n}, {\n  headers: { "Content-Type": "application/json" }\n}).then(res => console.log(res.data));`);
    } else if (lang === 'Python') {
      this.outputCode.set(`import requests\n\nurl = "${url}"\nheaders = {"Content-Type": "application/json"}\ndata = {"key": "value"}\n\nresponse = requests.post(url, json=data, headers=headers)\nprint(response.json())`);
    } else {
      this.outputCode.set(`<?php\n$ch = curl_init("${url}");\ncurl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\ncurl_setopt($ch, CURLOPT_POST, true);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, '{"key":"value"}');\n$response = curl_exec($ch);\ncurl_close($ch);\n?>`);
    }
  }

  copyCode() {
    navigator.clipboard.writeText(this.outputCode());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Snippet'), 2000);
  }
}
