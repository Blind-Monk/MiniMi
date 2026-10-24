import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slugify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🏷️ Slugify Tool</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert titles and phrases into clean, lowercased, URL-safe permalink slugs.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Input Title or Headline</label>
            <input type="text" [ngModel]="inputText()" (ngModelChange)="onTextChange($event)"
                   placeholder="100 Tools Suite for Web Developers & Creators!"
                   class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm font-mono text-white focus:outline-none focus:border-indigo-500">
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-sm font-mono font-bold text-emerald-400">{{ slugResult() }}</span>
            <button (click)="copySlug()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow">
              {{ copyStatus() }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SlugifyComponent {
  inputText = signal<string>('100 Tools Suite for Web Developers & Creators!');
  slugResult = signal<string>('100-tools-suite-for-web-developers-creators');
  copyStatus = signal<string>('Copy Slug');

  onTextChange(text: string) {
    this.inputText.set(text);
    const slug = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    this.slugResult.set(slug);
  }

  copySlug() {
    navigator.clipboard.writeText(this.slugResult());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Slug'), 2000);
  }
}
