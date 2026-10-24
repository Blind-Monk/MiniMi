import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface WorkExperience {
  company: string;
  role: string;
  dates: string;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  dates: string;
}

@Component({
  selector: 'app-resume-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>💼 Interactive Standard Resume Builder</span>
        </h3>
        <p class="text-xs text-slate-400">
          Build a professional resume with real-time preview, section customization, styled themes, and PDF print/export.
        </p>

        <div class="mt-4 flex justify-end gap-2">
          <button (click)="printResume()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5">
            <span>🖨️ Print / Download PDF</span>
          </button>
        </div>

        <div class="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Form Inputs Column (5 cols) -->
          <div class="lg:col-span-5 space-y-6 bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-[650px] overflow-y-auto">
            <!-- Theme Selection -->
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Accent Theme</label>
              <div class="flex gap-2">
                <button (click)="theme.set('indigo')" [class.ring-2]="theme() === 'indigo'" class="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold">Indigo</button>
                <button (click)="theme.set('emerald')" [class.ring-2]="theme() === 'emerald'" class="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold">Emerald</button>
                <button (click)="theme.set('slate')" [class.ring-2]="theme() === 'slate'" class="px-3 py-1 bg-slate-700 text-white rounded text-xs font-bold">Classic Slate</button>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="space-y-2">
              <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Contact Information</h4>
              <input type="text" [ngModel]="fullName()" (ngModelChange)="fullName.set($event)" placeholder="Full Name" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
              <input type="text" [ngModel]="jobTitle()" (ngModelChange)="jobTitle.set($event)" placeholder="Job Title / Headline" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
              <input type="text" [ngModel]="email()" (ngModelChange)="email.set($event)" placeholder="Email Address" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
              <input type="text" [ngModel]="phone()" (ngModelChange)="phone.set($event)" placeholder="Phone Number" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
              <input type="text" [ngModel]="location()" (ngModelChange)="location.set($event)" placeholder="Location (City, State)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
            </div>

            <!-- Professional Summary -->
            <div class="space-y-2">
              <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Professional Summary</h4>
              <textarea [ngModel]="summary()" (ngModelChange)="summary.set($event)" rows="3" placeholder="Summary..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"></textarea>
            </div>

            <!-- Skills -->
            <div class="space-y-2">
              <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Skills (Comma Separated)</h4>
              <input type="text" [ngModel]="skillsStr()" (ngModelChange)="skillsStr.set($event)" placeholder="TypeScript, Angular, Node.js..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
            </div>

            <!-- Work Experience -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Experience</h4>
                <button (click)="addExperience()" class="px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded">+ Add Role</button>
              </div>
              @for (exp of experienceList(); track $index) {
                <div class="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 relative">
                  <button (click)="removeExperience($index)" class="absolute top-2 right-2 text-slate-500 hover:text-red-400 text-xs">✕</button>
                  <input type="text" [ngModel]="exp.role" (ngModelChange)="updateExp($index, 'role', $event)" placeholder="Role Title" class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white">
                  <input type="text" [ngModel]="exp.company" (ngModelChange)="updateExp($index, 'company', $event)" placeholder="Company" class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white">
                  <input type="text" [ngModel]="exp.dates" (ngModelChange)="updateExp($index, 'dates', $event)" placeholder="Dates (e.g. 2021 - Present)" class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white">
                  <textarea [ngModel]="exp.description" (ngModelChange)="updateExp($index, 'description', $event)" rows="2" placeholder="Responsibilities..." class="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"></textarea>
                </div>
              }
            </div>
          </div>

          <!-- Live Preview Canvas Column (7 cols) -->
          <div class="lg:col-span-7 bg-white text-slate-900 p-8 rounded-xl shadow-2xl border border-slate-300 max-h-[650px] overflow-y-auto" id="resume-preview-pane">
            <header class="border-b pb-4 mb-4" [ngClass]="{'border-indigo-600': theme() === 'indigo', 'border-emerald-600': theme() === 'emerald', 'border-slate-800': theme() === 'slate'}">
              <h1 class="text-2xl font-bold" [ngClass]="{'text-indigo-700': theme() === 'indigo', 'text-emerald-700': theme() === 'emerald', 'text-slate-900': theme() === 'slate'}">{{ fullName() || 'Your Name' }}</h1>
              <p class="text-sm font-semibold text-slate-600">{{ jobTitle() || 'Job Title' }}</p>
              <div class="flex flex-wrap gap-3 text-xs text-slate-500 mt-2">
                @if (email()) { <span>📧 {{ email() }}</span> }
                @if (phone()) { <span>📞 {{ phone() }}</span> }
                @if (location()) { <span>📍 {{ location() }}</span> }
              </div>
            </header>

            @if (summary()) {
              <section class="mb-4">
                <h2 class="text-xs font-bold uppercase tracking-wider mb-1" [ngClass]="{'text-indigo-600': theme() === 'indigo', 'text-emerald-600': theme() === 'emerald', 'text-slate-800': theme() === 'slate'}">Summary</h2>
                <p class="text-xs text-slate-700 leading-relaxed">{{ summary() }}</p>
              </section>
            }

            @if (skillsList.length > 0) {
              <section class="mb-4">
                <h2 class="text-xs font-bold uppercase tracking-wider mb-1" [ngClass]="{'text-indigo-600': theme() === 'indigo', 'text-emerald-600': theme() === 'emerald', 'text-slate-800': theme() === 'slate'}">Skills</h2>
                <div class="flex flex-wrap gap-1.5">
                  @for (skill of skillsList; track skill) {
                    <span class="px-2 py-0.5 bg-slate-100 text-slate-800 font-medium text-[11px] rounded border border-slate-200">{{ skill }}</span>
                  }
                </div>
              </section>
            }

            <section class="mb-4">
              <h2 class="text-xs font-bold uppercase tracking-wider mb-2" [ngClass]="{'text-indigo-600': theme() === 'indigo', 'text-emerald-600': theme() === 'emerald', 'text-slate-800': theme() === 'slate'}">Work Experience</h2>
              <div class="space-y-3">
                @for (exp of experienceList(); track $index) {
                  <div>
                    <div class="flex justify-between items-baseline">
                      <span class="font-bold text-xs text-slate-900">{{ exp.role }} <span class="font-semibold text-slate-600">at {{ exp.company }}</span></span>
                      <span class="text-[11px] text-slate-500 font-mono">{{ exp.dates }}</span>
                    </div>
                    <p class="text-xs text-slate-600 mt-1 whitespace-pre-line">{{ exp.description }}</p>
                  </div>
                }
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ResumeBuilderComponent {
  theme = signal<'indigo' | 'emerald' | 'slate'>('indigo');
  fullName = signal<string>('Alex Johnson');
  jobTitle = signal<string>('Senior Software Engineer');
  email = signal<string>('alex.johnson@example.com');
  phone = signal<string>('(555) 019-2834');
  location = signal<string>('San Francisco, CA');
  summary = signal<string>('Versatile Senior Full Stack Engineer with 7+ years of experience designing high-throughput web applications, developer platforms, and cloud microservices.');
  skillsStr = signal<string>('TypeScript, Angular, Node.js, WebGL, RxJS, Tailwind CSS, Docker, PostgreSQL');

  experienceList = signal<WorkExperience[]>([
    {
      role: 'Senior Full Stack Engineer',
      company: 'TechCorp Inc.',
      dates: '2021 - Present',
      description: '• Architected real-time client analytics dashboard rendering 50M+ events daily.\n• Mentored 6 frontend developers and established TypeScript coding standards.'
    },
    {
      role: 'Frontend Developer',
      company: 'WebCraft Studios',
      dates: '2018 - 2021',
      description: '• Developed responsive client web portals and interactive canvas suite.'
    }
  ]);

  get skillsList(): string[] {
    return this.skillsStr().split(',').map(s => s.trim()).filter(Boolean);
  }

  addExperience() {
    this.experienceList.set([...this.experienceList(), { role: '', company: '', dates: '', description: '' }]);
  }

  removeExperience(index: number) {
    this.experienceList.set(this.experienceList().filter((_, i) => i !== index));
  }

  updateExp(index: number, field: keyof WorkExperience, value: string) {
    const updated = [...this.experienceList()];
    updated[index] = { ...updated[index], [field]: value };
    this.experienceList.set(updated);
  }

  printResume() {
    const printContent = document.getElementById('resume-preview-pane')?.innerHTML;
    if (!printContent) return;

    const win = window.open('', '', 'width=800,height=600');
    if (win) {
      win.document.write(`<html><head><title>Resume - ${this.fullName()}</title><script src="https://cdn.tailwindcss.com"></script></head><body class="p-8">${printContent}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  }
}
