import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-meta-tags-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🏷️ HTML Meta Tags Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate SEO-friendly HTML meta title, description, viewport, robots, and social share tags.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Page Title</label>
              <input type="text" [ngModel]="pageTitle()" (ngModelChange)="onTitleChange($event)"
                     class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-white">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Page Description</label>
              <input type="text" [ngModel]="pageDesc()" (ngModelChange)="onDescChange($event)"
                     class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs font-mono text-white">
            </div>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-slate-300">Generated Meta Header Tags</label>
              <button (click)="copyCode()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded">
                {{ copyStatus() }}
              </button>
            </div>
            <textarea readonly [value]="generatedTags()"
                      class="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none">
            </textarea>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MetaTagsGenComponent {
  pageTitle = signal<string>('Minimi — All-in-One Developer Tools');
  pageDesc = signal<string>('Comprehensive client-side utility suite for developers and media creators.');
  generatedTags = signal<string>('');
  copyStatus = signal<string>('Copy Meta Tags');

  constructor() {
    this.generate();
  }

  onTitleChange(t: string) {
    this.pageTitle.set(t);
    this.generate();
  }

  onDescChange(d: string) {
    this.pageDesc.set(d);
    this.generate();
  }

  generate() {
    const code = `<title>${this.pageTitle()}</title>
<meta name="description" content="${this.pageDesc()}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta property="og:title" content="${this.pageTitle()}">
<meta property="og:description" content="${this.pageDesc()}">
<meta name="twitter:card" content="summary_large_image">`;
    this.generatedTags.set(code);
  }

  copyCode() {
    navigator.clipboard.writeText(this.generatedTags());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Meta Tags'), 2000);
  }
}
