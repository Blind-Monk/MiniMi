import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-latex-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📄 LaTeX Editor & Compiler with Predefined Resume Templates</span>
        </h3>
        <p class="text-xs text-slate-400">
          In-browser LaTeX document editor with predefined resume templates, live rendered preview, and export.
        </p>

        <!-- Template Selector Bar -->
        <div class="mt-4 bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <label class="text-xs font-semibold text-slate-300 block mb-1">Predefined LaTeX Resume Templates</label>
            <div class="flex flex-wrap gap-2">
              <button (click)="loadTemplate('modern')"
                      [class.bg-indigo-600]="activeTemplate() === 'modern'"
                      [class.bg-slate-700]="activeTemplate() !== 'modern'"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors">
                💼 Modern Professional
              </button>
              <button (click)="loadTemplate('academic')"
                      [class.bg-indigo-600]="activeTemplate() === 'academic'"
                      [class.bg-slate-700]="activeTemplate() !== 'academic'"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors">
                🎓 Academic CV
              </button>
              <button (click)="loadTemplate('tech')"
                      [class.bg-indigo-600]="activeTemplate() === 'tech'"
                      [class.bg-slate-700]="activeTemplate() !== 'tech'"
                      class="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors">
                ⚡ Tech Developer
              </button>
            </div>
          </div>

          <div class="flex gap-2">
            <button (click)="downloadTex()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow">
              ⬇️ Export .TEX
            </button>
            <button (click)="printDocument()" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow">
              🖨️ Print / Export PDF
            </button>
          </div>
        </div>

        <!-- Editor & Preview Grid -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">LaTeX Code Source</label>
            <textarea [ngModel]="latexCode()" (ngModelChange)="onCodeChange($event)"
                      class="w-full h-[450px] bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500">
            </textarea>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Compiled Document Preview</label>
            <div id="latex-preview-pane"
                 class="w-full h-[450px] bg-white text-slate-900 rounded-xl p-6 overflow-y-auto text-xs font-sans shadow-inner">
              <div [innerHTML]="renderedHtml()"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LatexEditorComponent {
  activeTemplate = signal<'modern' | 'academic' | 'tech'>('modern');
  latexCode = signal<string>('');
  renderedHtml = signal<string>('');

  templates = {
    modern: `\\documentclass[a4paper,10pt]{article}
\\begin{document}

\\centerline{\\Huge \\bf Alex Johnson}
\\centerline{alex.johnson@example.com | (555) 019-2834 | San Francisco, CA}

\\vspace{1em}
\\section*{Professional Summary}
Senior Full Stack Engineer with 7+ years of experience designing scalable microservices, high-performance WebGL applications, and developer tools.

\\section*{Experience}
\\textbf{Senior Software Engineer} \\hfill 2021 -- Present\\\\
\\textit{TechCorp Inc.}
\\begin{itemize}
  \\item Architected real-time client-side analytics processing 50M+ daily events.
  \\item Led a team of 6 engineers building Angular and TypeScript frontend systems.
\\end{itemize}

\\textbf{Frontend Developer} \\hfill 2018 -- 2021\\\\
\\textit{WebCraft Studios}
\\begin{itemize}
  \\item Built responsive web applications and interactive canvas tools.
\\end{itemize}

\\section*{Education}
\\textbf{B.S. in Computer Science} \\hfill 2014 -- 2018\\\\
University of California, Berkeley

\\section*{Skills}
TypeScript, Angular, Node.js, WebGL, Canvas API, RxJS, Tailwind CSS, Docker

\\end{document}`,

    academic: `\\documentclass[11pt]{article}
\\begin{document}

\\centerline{\\Huge \\bf Dr. Eleanor Vance}
\\centerline{Department of Computer Science, Stanford University}

\\section*{Education}
\\textbf{Ph.D. in Computer Science}, Stanford University \\hfill 2020\\\\
\\textbf{B.S. in Mathematics}, MIT \\hfill 2015

\\section*{Publications}
\\begin{itemize}
  \\item Vance, E. et al. (2023). "High-Throughput In-Browser WASM Execution." \\textit{Journal of Web Engineering}.
  \\item Vance, E. (2021). "Real-time Vector Path Interpolation." \\textit{ACM Transactions}.
\\end{itemize}

\\section*{Teaching Experience}
\\textbf{Associate Professor} -- Stanford University \\hfill 2021 -- Present\\\\
Courses: Advanced Algorithms, Parallel Computing

\\end{document}`,

    tech: `\\documentclass{article}
\\begin{document}

\\centerline{\\Huge \\bf Jordan Lee}
\\centerline{GitHub: github.com/jordanlee | Email: jordan@dev.io}

\\section*{Technical Skills}
\\textbf{Languages}: TypeScript, Python, Go, SQL, Rust\\\\
\\textbf{Frameworks}: Angular, Express, Node.js, PyTorch

\\section*{Projects}
\\textbf{Minimi Web Toolbox} -- Open Source Maintainer
\\begin{itemize}
  \\item Built 100+ client-side media and developer tools.
\\end{itemize}

\\section*{Work History}
\\textbf{Staff Engineer} -- CloudScale Inc. \\hfill 2022 -- Present
\\begin{itemize}
  \\item Optimized Web Audio synthesis pipelines yielding 40% reduction in CPU usage.
\\end{itemize}

\\end{document}`
  };

  constructor() {
    this.loadTemplate('modern');
  }

  loadTemplate(tpl: 'modern' | 'academic' | 'tech') {
    this.activeTemplate.set(tpl);
    const code = this.templates[tpl];
    this.latexCode.set(code);
    this.compileLatex(code);
  }

  onCodeChange(code: string) {
    this.latexCode.set(code);
    this.compileLatex(code);
  }

  private compileLatex(code: string) {
    let html = code;
    html = html.replace(/\\centerline{\\Huge \\bf (.*)}/g, '<h1 class="text-2xl font-bold text-center border-b pb-1 mb-1">$1</h1>');
    html = html.replace(/\\centerline{(.*)}/g, '<p class="text-center text-slate-600 mb-3">$1</p>');
    html = html.replace(/\\section\*{(.*)}/g, '<h2 class="text-base font-bold text-indigo-700 border-b border-indigo-200 mt-4 mb-2 pb-0.5">$1</h2>');
    html = html.replace(/\\textbf{(.*)}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit{(.*)}/g, '<em class="italic text-slate-700">$1</em>');
    html = html.replace(/\\hfill/g, '<span class="float-right text-slate-500 font-normal">');
    html = html.replace(/\\\\/g, '</span><br>');
    html = html.replace(/\\begin{itemize}/g, '<ul class="list-disc pl-5 my-1 space-y-0.5">');
    html = html.replace(/\\end{itemize}/g, '</ul>');
    html = html.replace(/\\item (.*)/g, '<li>$1</li>');
    html = html.replace(/\\vspace{.*}/g, '');
    html = html.replace(/\\documentclass.*/g, '');
    html = html.replace(/\\begin{document}/g, '');
    html = html.replace(/\\end{document}/g, '');

    this.renderedHtml.set(html);
  }

  downloadTex() {
    const blob = new Blob([this.latexCode()], { type: 'text/x-tex' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-${this.activeTemplate()}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  }

  printDocument() {
    const printContent = document.getElementById('latex-preview-pane')?.innerHTML;
    if (!printContent) return;

    const win = window.open('', '', 'width=800,height=600');
    if (win) {
      win.document.write(`<html><head><title>Print Resume</title><style>body{font-family:system-ui,sans-serif;padding:2rem;}</style></head><body>${printContent}</body></html>`);
      win.document.close();
      win.print();
    }
  }
}
