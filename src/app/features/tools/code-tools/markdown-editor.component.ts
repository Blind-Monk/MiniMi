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
          Split-pane Markdown notes editor with live side-by-side HTML preview.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Markdown Source</label>
              <textarea [ngModel]="markdownText()" (ngModelChange)="markdownText.set($event)"
                        class="w-full h-72 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Live HTML Preview</label>
              <div [innerHTML]="htmlPreview()"
                   class="w-full h-72 bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs font-sans text-slate-200 overflow-y-auto prose prose-invert">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MarkdownEditorComponent {
  markdownText = signal<string>('# Hello Minimi\n\nThis is a **live Markdown** editor.\n\n- Feature 1\n- Feature 2\n- Feature 3\n\n> "Simplicity is the soul of efficiency."');

  htmlPreview = signal<string>('');

  constructor() {
    this.updatePreview();
  }

  updatePreview() {
    let md = this.markdownText();
    md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    md = md.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
    md = md.replace(/\*(.*)\*/gim, '<em>$1</em>');
    md = md.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    md = md.replace(/^\- (.*$)/gim, '<li>$1</li>');
    md = md.replace(/\n/g, '<br>');

    this.htmlPreview.set(md);
  }
}
