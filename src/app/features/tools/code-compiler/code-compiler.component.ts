import { Component, Input, OnInit, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

export type CompilerMode = 'html' | 'markdown' | 'script';

@Component({
  selector: 'app-code-compiler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-xl">
      <!-- Mode Selection Header & Quick Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div class="flex items-center space-x-2">
          <div class="flex bg-slate-950 p-1 rounded-xl border border-slate-700">
            <button
              (click)="setMode('html')"
              [class.bg-indigo-600]="activeMode() === 'html'"
              [class.text-white]="activeMode() === 'html'"
              [class.text-slate-400]="activeMode() !== 'html'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 hover:text-white">
              <span>🌐</span>
              <span>HTML Compiler</span>
            </button>

            <button
              (click)="setMode('markdown')"
              [class.bg-teal-600]="activeMode() === 'markdown'"
              [class.text-white]="activeMode() === 'markdown'"
              [class.text-slate-400]="activeMode() !== 'markdown'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 hover:text-white">
              <span>📝</span>
              <span>Markdown Compiler</span>
            </button>

            <button
              (click)="setMode('script')"
              [class.bg-amber-600]="activeMode() === 'script'"
              [class.text-white]="activeMode() === 'script'"
              [class.text-slate-400]="activeMode() !== 'script'"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 hover:text-white">
              <span>⚡</span>
              <span>JS / Script Runner</span>
            </button>
          </div>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <button
            (click)="loadTemplate()"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1">
            <span>📋</span>
            <span>Sample Template</span>
          </button>
          <button
            (click)="compileAndRun()"
            class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md flex items-center space-x-1">
            <span>▶</span>
            <span>Compile & Run</span>
          </button>
          <button
            (click)="downloadCode()"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1">
            <span>💾</span>
            <span>Download</span>
          </button>
          <button
            (click)="clearCode()"
            class="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-semibold border border-red-500/30 transition-colors">
            Clear
          </button>
        </div>
      </div>

      <!-- Main Editor & Preview Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Editor Column -->
        <div class="flex flex-col space-y-2">
          <div class="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span class="flex items-center space-x-1">
              <span>💻</span>
              <span class="font-bold text-slate-200 uppercase">{{ activeMode() }} Source Code</span>
            </span>
            <span>{{ codeInput().length }} chars</span>
          </div>

          <div class="relative flex-1 min-h-[380px]">
            <textarea
              [ngModel]="codeInput()"
              (ngModelChange)="onCodeInput($event)"
              placeholder="Enter or paste code here..."
              spellcheck="false"
              class="w-full h-[420px] bg-slate-950 border border-slate-700 rounded-xl p-3.5 font-mono text-xs text-indigo-200 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed shadow-inner">
            </textarea>
          </div>
        </div>

        <!-- Preview Column -->
        <div class="flex flex-col space-y-2">
          <div class="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span class="flex items-center space-x-1">
              <span>👁️</span>
              <span class="font-bold text-slate-200 uppercase">
                {{ activeMode() === 'script' ? 'Console Execution Output' : 'Compiled Live Preview' }}
              </span>
            </span>
            @if (executionTime() !== null) {
              <span class="text-emerald-400 text-[11px]">⏱️ {{ executionTime() }} ms</span>
            }
          </div>

          <!-- HTML Preview iframe -->
          @if (activeMode() === 'html') {
            <div class="w-full h-[420px] bg-white rounded-xl overflow-hidden border border-slate-700 shadow-inner">
              <iframe
                #htmlIframe
                title="HTML Compiled Preview"
                [srcdoc]="htmlSafeIframeDoc()"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                class="w-full h-full border-none">
              </iframe>
            </div>
          }

          <!-- Markdown Rendered Preview -->
          @if (activeMode() === 'markdown') {
            <div
              class="w-full h-[420px] bg-slate-950 border border-slate-700 rounded-xl p-4 overflow-y-auto text-slate-200 font-sans leading-relaxed text-sm shadow-inner markdown-preview"
              [innerHTML]="renderedMarkdownHtml()">
            </div>
          }

          <!-- Script / Console Output -->
          @if (activeMode() === 'script') {
            <div class="w-full h-[420px] bg-slate-950 border border-slate-700 rounded-xl p-3.5 overflow-y-auto font-mono text-xs space-y-2 shadow-inner">
              @if (consoleLogs().length === 0) {
                <div class="text-slate-500 italic py-4 text-center">
                  Click "Compile & Run" to execute code and see console.log output...
                </div>
              } @else {
                @for (log of consoleLogs(); track $index) {
                  <div
                    [class.text-slate-300]="log.type === 'log'"
                    [class.text-amber-300]="log.type === 'warn'"
                    [class.text-red-400]="log.type === 'error'"
                    [class.text-emerald-400]="log.type === 'return'"
                    class="py-1 px-2 rounded bg-slate-900/60 border border-slate-800/80 break-words flex items-start space-x-2">
                    <span class="text-[10px] uppercase font-bold shrink-0 px-1 py-0.5 rounded"
                          [class.bg-slate-800]="log.type === 'log'"
                          [class.bg-amber-950]="log.type === 'warn'"
                          [class.bg-red-950]="log.type === 'error'"
                          [class.bg-emerald-950]="log.type === 'return'">
                      {{ log.type }}
                    </span>
                    <span class="whitespace-pre-wrap flex-1">{{ log.message }}</span>
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .markdown-preview ::ng-deep h1 { font-size: 1.5rem; font-weight: 800; color: #38bdf8; margin-top: 0.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #334155; padding-bottom: 0.25rem; }
    .markdown-preview ::ng-deep h2 { font-size: 1.25rem; font-weight: 700; color: #2dd4bf; margin-top: 0.75rem; margin-bottom: 0.5rem; }
    .markdown-preview ::ng-deep h3 { font-size: 1.1rem; font-weight: 600; color: #f33e83; margin-top: 0.5rem; }
    .markdown-preview ::ng-deep p { margin-bottom: 0.75rem; }
    .markdown-preview ::ng-deep ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; }
    .markdown-preview ::ng-deep ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0.75rem; }
    .markdown-preview ::ng-deep blockquote { border-left: 4px solid #38bdf8; padding-left: 0.75rem; color: #94a3b8; font-style: italic; margin-bottom: 0.75rem; }
    .markdown-preview ::ng-deep code { background-color: #1e293b; color: #f472b6; padding: 0.15rem 0.35rem; rounded: 0.25rem; font-family: monospace; font-size: 0.85em; }
    .markdown-preview ::ng-deep pre { background-color: #0f172a; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #334155; overflow-x: auto; margin-bottom: 0.75rem; }
    .markdown-preview ::ng-deep pre code { background-color: transparent; color: #38bdf8; padding: 0; }
    .markdown-preview ::ng-deep a { color: #60a5fa; text-decoration: underline; }
    .markdown-preview ::ng-deep table { width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; }
    .markdown-preview ::ng-deep th, .markdown-preview ::ng-deep td { border: 1px solid #334155; padding: 0.4rem 0.6rem; text-align: left; }
    .markdown-preview ::ng-deep th { background-color: #1e293b; font-weight: 600; color: #38bdf8; }
  `]
})
export class CodeCompilerComponent implements OnInit {
  @Input() initialMode: CompilerMode = 'html';

  activeMode = signal<CompilerMode>('html');
  codeInput = signal<string>('');
  executionTime = signal<number | null>(null);

  // Script console log outputs
  consoleLogs = signal<Array<{ type: 'log' | 'warn' | 'error' | 'return'; message: string }>>([]);

  // Prepared HTML document for safe iframe rendering
  htmlIframeDoc = signal<string>('');

  // Prepared Markdown output HTML
  markdownHtml = signal<string>('');

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.activeMode.set(this.initialMode);
    this.loadTemplate();
  }

  setMode(mode: CompilerMode) {
    this.activeMode.set(mode);
    this.executionTime.set(null);
    this.loadTemplate();
  }

  onCodeInput(val: string) {
    this.codeInput.set(val);
  }

  loadTemplate() {
    const mode = this.activeMode();
    if (mode === 'html') {
      this.codeInput.set(`<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-h-screen;
      padding: 20px;
      margin: 0;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);
      text-align: center;
      max-width: 350px;
    }
    button {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 12px;
    }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🚀 HTML & Live CSS Playground</h2>
    <p>Edit HTML, CSS, and JS on the left and see instant changes here!</p>
    <button onclick="document.getElementById('counter').innerText = ++count">Clicked: <span id="counter">0</span></button>
  </div>
  <script>
    let count = 0;
  </script>
</body>
</html>`);
    } else if (mode === 'markdown') {
      this.codeInput.set(`# 📝 Markdown Compiler & Live Previewer

Welcome to **Minimi's Markdown Compiler**!

## Features
- **Fast Client-Side Parsing**
- Supports Headers, Bold, Italics, and Lists
- Code blocks & inline code snippets
- Tables and Blockquotes

### Code Snippet Example
\`\`\`javascript
function calculateFactorial(n) {
  if (n <= 1) return 1;
  return n * calculateFactorial(n - 1);
}
console.log(calculateFactorial(5)); // Output: 120
\`\`\`

> "Simplicity is prerequisite for reliability." – Edsger W. Dijkstra

### Task Progress
| Task | Status | Priority |
| --- | --- | --- |
| HTML Compiler | ✅ Completed | High |
| Markdown Compiler | ✅ Completed | High |
| Script Runner | ✅ Completed | High |
`);
    } else if (mode === 'script') {
      this.codeInput.set(`// ⚡ JavaScript / Script Compiler
// Write code below and click "Compile & Run"

function generateFibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

console.log("Generating 10 Fibonacci numbers...");
const fib = generateFibonacci(10);
console.log("Result:", fib);

// Test math calculation
const sum = fib.reduce((acc, curr) => acc + curr, 0);
console.log("Sum of Fibonacci numbers:", sum);

return { fib, sum };
`);
    }
    this.compileAndRun();
  }

  compileAndRun() {
    const startTime = performance.now();
    const mode = this.activeMode();
    const code = this.codeInput();

    if (mode === 'html') {
      this.htmlIframeDoc.set(code);
    } else if (mode === 'markdown') {
      this.markdownHtml.set(this.parseMarkdown(code));
    } else if (mode === 'script') {
      this.runJavaScript(code);
    }

    const endTime = performance.now();
    this.executionTime.set(Math.round((endTime - startTime) * 100) / 100);
  }

  htmlSafeIframeDoc() {
    return this.htmlIframeDoc();
  }

  renderedMarkdownHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.markdownHtml());
  }

  private runJavaScript(code: string) {
    const logs: Array<{ type: 'log' | 'warn' | 'error' | 'return'; message: string }> = [];

    const customConsole = {
      log: (...args: any[]) => {
        logs.push({ type: 'log', message: args.map(arg => this.formatValue(arg)).join(' ') });
      },
      warn: (...args: any[]) => {
        logs.push({ type: 'warn', message: args.map(arg => this.formatValue(arg)).join(' ') });
      },
      error: (...args: any[]) => {
        logs.push({ type: 'error', message: args.map(arg => this.formatValue(arg)).join(' ') });
      }
    };

    try {
      // Execute in isolated Function scope passing custom console
      const runner = new Function('console', code);
      const result = runner(customConsole);
      if (result !== undefined) {
        logs.push({ type: 'return', message: `Return Value: ${this.formatValue(result)}` });
      }
    } catch (err: any) {
      logs.push({ type: 'error', message: `Runtime Error: ${err?.message || err}` });
    }

    this.consoleLogs.set(logs);
  }

  private formatValue(val: any): string {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val, null, 2);
      } catch {
        return String(val);
      }
    }
    return String(val);
  }

  public parseMarkdown(md: string): string {
    if (!md) return '';
    let html = md;

    // Code blocks ```lang ... ```
    html = html.replace(/```([\s\S]*?)```/g, (_match, p1) => {
      const cleanCode = p1.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre><code>${cleanCode}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, (_match, p1) => {
      return `<code>${p1.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
    });

    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Bold and Italics
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Markdown Tables (| header | header |)
    const lines = html.split('\n');
    let inTable = false;
    let tableHtml = '';
    const outputLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHtml = '<table>';
        }
        const cells = line.slice(1, -1).split('|').map(c => c.trim());
        // Check if separator line
        if (cells.every(c => /^[-:]+$/.test(c))) {
          continue;
        }
        const isHeader = tableHtml === '<table>';
        const tag = isHeader ? 'th' : 'td';
        tableHtml += '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
      } else {
        if (inTable) {
          inTable = false;
          tableHtml += '</table>';
          outputLines.push(tableHtml);
          tableHtml = '';
        }
        outputLines.push(line);
      }
    }
    if (inTable) {
      tableHtml += '</table>';
      outputLines.push(tableHtml);
    }

    html = outputLines.join('\n');

    // Unordered list items (- or *)
    html = html.replace(/^[\-*] (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/g, '');

    // Paragraph wrapping for loose lines
    const formattedParagraphs = html.split('\n\n').map(chunk => {
      const trimmed = chunk.trim();
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<table')
      ) {
        return trimmed;
      }
      return trimmed ? `<p>${trimmed}</p>` : '';
    }).join('\n');

    return formattedParagraphs;
  }

  downloadCode() {
    const mode = this.activeMode();
    const code = this.codeInput();
    let ext = 'html';
    if (mode === 'markdown') ext = 'md';
    if (mode === 'script') ext = 'js';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minimi-compiled-code.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearCode() {
    this.codeInput.set('');
    this.htmlIframeDoc.set('');
    this.markdownHtml.set('');
    this.consoleLogs.set([]);
    this.executionTime.set(null);
  }
}
