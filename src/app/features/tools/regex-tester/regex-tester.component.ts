import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MatchGroup {
  index: number;
  fullMatch: string;
  groups: string[];
  start: number;
  end: number;
}

export interface PresetPattern {
  name: string;
  pattern: string;
  flags: string;
  testText: string;
  description: string;
}

@Component({
  selector: 'app-regex-tester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 sm:p-6 text-white max-w-4xl mx-auto space-y-6 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-700 pb-3">
        <h3 class="text-xl font-bold text-teal-400 flex items-center space-x-2">
          <span>🔍</span>
          <span>Regex Tester & Evaluator</span>
        </h3>
        <span class="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
          Client-side RegExp Engine
        </span>
      </div>

      <!-- Presets Selector -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <span class="font-semibold text-slate-300">Quick Presets:</span>
        @for (preset of presets; track preset.name) {
          <button
            (click)="applyPreset(preset)"
            class="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-lg text-teal-300 font-medium transition-all">
            {{ preset.name }}
          </button>
        }
      </div>

      <!-- Pattern & Flags Input Row -->
      <div class="space-y-2">
        <label class="block font-semibold text-xs text-slate-300">Regular Expression Pattern</label>
        <div class="flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-teal-500 transition-all font-mono text-sm">
          <span class="px-3 text-slate-500 font-bold select-none text-base">/</span>
          <input
            type="text"
            [(ngModel)]="pattern"
            (ngModelChange)="evaluate()"
            placeholder="e.g. ([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})"
            class="flex-1 bg-transparent px-2 py-2.5 text-teal-300 focus:outline-none">
          <span class="px-2 text-slate-500 font-bold select-none text-base">/</span>

          <!-- Flags Toggles -->
          <div class="flex items-center space-x-1.5 px-3 bg-slate-900 border-l border-slate-800 text-xs py-2 select-none">
            <label class="flex items-center space-x-1 cursor-pointer hover:text-teal-300" title="Global match">
              <input type="checkbox" [(ngModel)]="flagG" (ngModelChange)="evaluate()" class="accent-teal-500 rounded">
              <span class="font-mono font-bold">g</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer hover:text-teal-300" title="Case insensitive">
              <input type="checkbox" [(ngModel)]="flagI" (ngModelChange)="evaluate()" class="accent-teal-500 rounded">
              <span class="font-mono font-bold">i</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer hover:text-teal-300" title="Multiline mode">
              <input type="checkbox" [(ngModel)]="flagM" (ngModelChange)="evaluate()" class="accent-teal-500 rounded">
              <span class="font-mono font-bold">m</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer hover:text-teal-300" title="Dotall mode (. matches newline)">
              <input type="checkbox" [(ngModel)]="flagS" (ngModelChange)="evaluate()" class="accent-teal-500 rounded">
              <span class="font-mono font-bold">s</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer hover:text-teal-300" title="Unicode mode">
              <input type="checkbox" [(ngModel)]="flagU" (ngModelChange)="evaluate()" class="accent-teal-500 rounded">
              <span class="font-mono font-bold">u</span>
            </label>
          </div>
        </div>
        @if (error) {
          <div class="text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-lg p-2 font-mono">
            ⚠️ Invalid Regex Pattern: {{ error }}
          </div>
        }
      </div>

      <!-- Test String & Live Match Highlighting -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Input Test Area -->
        <div class="space-y-1">
          <div class="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Test Text Input</span>
            <span class="text-slate-400 font-normal">{{ testText.length }} chars</span>
          </div>
          <textarea
            [(ngModel)]="testText"
            (ngModelChange)="evaluate()"
            rows="7"
            placeholder="Paste text here to evaluate regex matches..."
            class="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-teal-500 resize-none">
          </textarea>
        </div>

        <!-- Live Match Highlighting Render -->
        <div class="space-y-1">
          <div class="flex justify-between items-center text-xs font-semibold text-slate-300">
            <span>Highlighted Matches</span>
            <span class="font-mono text-teal-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {{ matches.length }} {{ matches.length === 1 ? 'match' : 'matches' }}
            </span>
          </div>
          <div
            [innerHTML]="highlightedHtml"
            class="w-full h-[154px] overflow-auto bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          </div>
        </div>
      </div>

      <!-- Match Results & Capture Groups Breakdown -->
      @if (matches.length > 0) {
        <div class="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <h4 class="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Match Details & Capture Groups</span>
            <span class="text-slate-500 text-[11px]">Showing first 100 matches</span>
          </h4>
          <div class="max-h-52 overflow-y-auto space-y-2 pr-1">
            @for (match of matches; track match.index) {
              <div class="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono space-y-1">
                <div class="flex items-center justify-between text-teal-300 font-bold">
                  <span>Match #{{ match.index + 1 }}</span>
                  <span class="text-[11px] text-slate-400 font-normal">Pos: [{{ match.start }}..{{ match.end }}]</span>
                </div>
                <div class="bg-teal-950/60 text-teal-200 px-2 py-1 rounded border border-teal-800/50 break-all">
                  "{{ match.fullMatch }}"
                </div>
                @if (match.groups.length > 0) {
                  <div class="pl-3 space-y-1 pt-1 border-l-2 border-indigo-500/50 text-[11px]">
                    @for (grp of match.groups; track $index) {
                      <div class="text-slate-300 flex items-center space-x-2">
                        <span class="text-indigo-400 font-bold">Group {{$index + 1}}:</span>
                        <span class="bg-slate-950 text-slate-200 px-1.5 py-0.5 rounded border border-slate-800 break-all">
                          {{ grp || '(undefined)' }}
                        </span>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Regex Cheat Sheet Accordion -->
      <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-2">
        <span class="font-bold text-slate-300 block">💡 Quick Regex Cheat Sheet</span>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">\d</code> Any Digit (0-9)
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">\w</code> Word character
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">\s</code> Whitespace
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">.</code> Any character
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">*</code> 0 or more
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">+</code> 1 or more
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">?</code> Optional (0 or 1)
          </div>
          <div class="bg-slate-900 p-1.5 rounded border border-slate-800">
            <code class="text-teal-400 font-bold">(...)</code> Capture group
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegexTesterComponent {
  pattern = '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})';
  flagG = true;
  flagI = true;
  flagM = false;
  flagS = false;
  flagU = false;

  testText = `Welcome to Minimi!
Contact our admin at dev.team@minimi.app or support@online.org.
You can also reach hello_user123@domain.co.uk for assistance.`;

  matches: MatchGroup[] = [];
  highlightedHtml = '';
  error: string | null = null;

  presets: PresetPattern[] = [
    {
      name: 'Email Address',
      pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})',
      flags: 'gi',
      testText: 'Send email to admin@minimi.app or user.test@online.org.',
      description: 'Matches standard email formats with username and domain.'
    },
    {
      name: 'URL / Web Link',
      pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-10]{1,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)',
      flags: 'gi',
      testText: 'Visit https://github.com/areyouroot/online or http://minimi.app/docs.',
      description: 'Matches HTTP and HTTPS URLs.'
    },
    {
      name: 'IPv4 Address',
      pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
      flags: 'g',
      testText: 'Host IP is 192.168.1.1 and Gateway is 10.0.0.254.',
      description: 'Matches IPv4 address numbers 0.0.0.0 to 255.255.255.255.'
    },
    {
      name: 'Hex Color Code',
      pattern: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b',
      flags: 'gi',
      testText: 'Colors used: #6C5CE7 (indigo), #00CEC9 (teal), and #FFF (white).',
      description: 'Matches 3 or 6 digit CSS Hex color codes.'
    },
    {
      name: 'ISO Date (YYYY-MM-DD)',
      pattern: '\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
      flags: 'g',
      testText: 'Project launched on 2026-10-05 and updated on 2026-10-10.',
      description: 'Matches ISO dates in YYYY-MM-DD format.'
    }
  ];

  constructor() {
    this.evaluate();
  }

  applyPreset(preset: PresetPattern) {
    this.pattern = preset.pattern;
    this.flagG = preset.flags.includes('g');
    this.flagI = preset.flags.includes('i');
    this.flagM = preset.flags.includes('m');
    this.flagS = preset.flags.includes('s');
    this.flagU = preset.flags.includes('u');
    this.testText = preset.testText;
    this.evaluate();
  }

  evaluate() {
    this.error = null;
    this.matches = [];
    this.highlightedHtml = this.escapeHtml(this.testText);

    if (!this.pattern) {
      return;
    }

    let flags = '';
    if (this.flagG) flags += 'g';
    if (this.flagI) flags += 'i';
    if (this.flagM) flags += 'm';
    if (this.flagS) flags += 's';
    if (this.flagU) flags += 'u';

    let rx: RegExp;
    try {
      rx = new RegExp(this.pattern, flags);
    } catch (e: any) {
      this.error = e.message || 'Invalid regular expression';
      return;
    }

    const matchesList: MatchGroup[] = [];
    const text = this.testText;

    if (this.flagG) {
      let match: RegExpExecArray | null;
      let count = 0;
      while ((match = rx.exec(text)) !== null) {
        if (match[0].length === 0) {
          rx.lastIndex++; // Prevent infinite loop on empty match
        }
        matchesList.push({
          index: count++,
          fullMatch: match[0],
          groups: match.slice(1),
          start: match.index,
          end: match.index + match[0].length
        });
        if (count >= 100) break; // Limit safety
      }
    } else {
      const match = rx.exec(text);
      if (match) {
        matchesList.push({
          index: 0,
          fullMatch: match[0],
          groups: match.slice(1),
          start: match.index,
          end: match.index + match[0].length
        });
      }
    }

    this.matches = matchesList;

    // Build highlighted HTML string
    if (matchesList.length > 0) {
      let lastIndex = 0;
      let html = '';

      for (const m of matchesList) {
        if (m.start < lastIndex) continue; // Skip overlapping
        // Before match
        html += this.escapeHtml(text.substring(lastIndex, m.start));
        // Matched text wrapped in styled mark tag
        html += `<mark class="bg-teal-500/30 text-teal-200 border-b-2 border-teal-400 px-0.5 rounded font-bold" title="Match #${m.index + 1}">${this.escapeHtml(m.fullMatch)}</mark>`;
        lastIndex = m.end;
      }
      // Remaining text
      html += this.escapeHtml(text.substring(lastIndex));
      this.highlightedHtml = html;
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
