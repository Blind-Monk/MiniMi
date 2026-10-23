import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-resume-parser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>👔 Resume / CV Builder Text Parser</span>
        </h3>
        <p class="text-xs text-slate-400">
          Parse resume text, analyze keyword matches against job descriptions, and extract ATS suggestions.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Resume / CV Text</label>
              <textarea [ngModel]="resumeText()" (ngModelChange)="onTextChange($event)"
                        placeholder="Paste CV text here..."
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Job Description Keywords Target</label>
              <textarea [ngModel]="jobDesc()" (ngModelChange)="onJobDescChange($event)"
                        placeholder="Paste target job description..."
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none">
              </textarea>
            </div>
          </div>

          <!-- ATS Score Summary -->
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-300">Keyword Match Score:</span>
            <span class="text-xl font-mono font-bold text-emerald-400">{{ matchScore() }}%</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResumeParserComponent {
  resumeText = signal<string>('Senior Software Engineer skilled in Angular, TypeScript, Tailwind CSS, Node.js, Web APIs, and Performance Optimization.');
  jobDesc = signal<string>('Seeking Senior Engineer proficient in Angular, TypeScript, Tailwind CSS, and Web Workers.');
  matchScore = signal<number>(85);

  onTextChange(text: string) {
    this.resumeText.set(text);
    this.analyze();
  }

  onJobDescChange(desc: string) {
    this.jobDesc.set(desc);
    this.analyze();
  }

  analyze() {
    const cv = this.resumeText().toLowerCase();
    const jobWords = this.jobDesc().toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (jobWords.length === 0) return;

    let matches = 0;
    jobWords.forEach(w => {
      if (cv.includes(w)) matches++;
    });

    const score = Math.round((matches / jobWords.length) * 100);
    this.matchScore.set(Math.min(100, Math.max(20, score)));
  }
}
