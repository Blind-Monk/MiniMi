import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📊 Text Inspector & Counter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Live character count, word count, sentence count, line count, and estimated reading time calculator.
        </p>

        <div class="mt-4 space-y-4">
          <!-- Stats Summary Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Characters</span>
              <span class="text-lg font-bold text-white font-mono">{{ charCount() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Words</span>
              <span class="text-lg font-bold text-indigo-400 font-mono">{{ wordCount() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Sentences</span>
              <span class="text-lg font-bold text-emerald-400 font-mono">{{ sentenceCount() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Lines</span>
              <span class="text-lg font-bold text-amber-400 font-mono">{{ lineCount() }}</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Reading Time</span>
              <span class="text-lg font-bold text-purple-400 font-mono">{{ readingTime() }}</span>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Text Area</label>
            <textarea [ngModel]="inputText()" (ngModelChange)="onTextChange($event)"
                      placeholder="Paste or type text to inspect..."
                      class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
            </textarea>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TextInspectorComponent {
  inputText = signal<string>('Minimi is an all-in-one developer, media, document, and security utility suite running 100% client-side in browser.');
  charCount = signal<number>(0);
  wordCount = signal<number>(0);
  sentenceCount = signal<number>(0);
  lineCount = signal<number>(0);
  readingTime = signal<string>('0s');

  constructor() {
    this.inspect();
  }

  onTextChange(text: string) {
    this.inputText.set(text);
    this.inspect();
  }

  inspect() {
    const text = this.inputText();
    this.charCount.set(text.length);

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    this.wordCount.set(words);

    const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    this.sentenceCount.set(sentences);

    const lines = text ? text.split('\n').length : 0;
    this.lineCount.set(lines);

    const minutes = words / 200; // Average 200 words per minute
    if (minutes < 1) {
      this.readingTime.set(`${Math.round(minutes * 60)}s`);
    } else {
      this.readingTime.set(`${Math.round(minutes)}m`);
    }
  }
}
