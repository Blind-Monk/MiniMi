import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📝 Markdown Live Preview Editor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Split-pane Markdown notes editor with live side-by-side HTML preview and full Markdown / HTML export.
        </p>

        <div class="mt-4 space-y-4">
          <!-- Actions Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
            <span class="text-xs text-slate-300 font-semibold">Live Editor</span>
            <div class="flex flex-wrap gap-2">
              <button (click)="downloadMarkdown()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1.5">
                <span>⬇️ Download Markdown (.md)</span>
              </button>
              <button (click)="downloadHtml()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1.5">
                <span>🌐 Download Compiled HTML (.html)</span>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Markdown Source</label>
              <textarea [ngModel]="markdownText()" (ngModelChange)="onMarkdownChange($event)"
                        class="w-full h-80 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Live Compiled Preview</label>
              <div [innerHTML]="htmlPreview()"
                   class="w-full h-80 bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-sans text-slate-200 overflow-y-auto prose prose-invert">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MarkdownEditorComponent {
  markdownText = signal<string>('# Hello Minimi\n\nThis is a **live Markdown** editor.\n\n- Feature 1: Live Split View\n- Feature 2: Download Raw Markdown\n- Feature 3: Download Compiled HTML\n\n> "Simplicity is the soul of efficiency."');

  htmlPreview = signal<string>('');

  constructor() {
    this.updatePreview();
  }

  onMarkdownChange(val: string) {
    this.markdownText.set(val);
    this.updatePreview();
  }

  updatePreview() {
    let md = this.markdownText();
    md = md.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-2 text-indigo-400">$1</h1>');
    md = md.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-1 text-slate-100">$1</h2>');
    md = md.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mb-1 text-slate-200">$1</h3>');
    md = md.replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-indigo-300">$1</strong>');
    md = md.replace(/\*(.*)\*/gim, '<em class="italic">$1</em>');
    md = md.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-3 italic text-slate-400 my-2">$1</blockquote>');
    md = md.replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
    md = md.replace(/\n/g, '<br>');

    this.htmlPreview.set(md);
  }

  downloadMarkdown() {
    const blob = new Blob([this.markdownText()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadHtml() {
    const fullDoc = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Compiled Markdown</title>\n  <style>body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: auto; line-height: 1.6; color: #333; }</style>\n</head>\n<body>\n${this.htmlPreview()}\n</body>\n</html>`;
    const blob = new Blob([fullDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compiled-document.html';
    a.click();
    URL.revokeObjectURL(url);
  }
}
