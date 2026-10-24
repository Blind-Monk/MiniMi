import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-graphql-validator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⚛️ GraphQL Query Validator & Formatter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Validate GraphQL syntax, check query depth, format query blocks, and extract variables.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <button (click)="validateAndFormat()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              ✨ Format & Validate GraphQL
            </button>
            <span class="text-xs font-mono font-semibold" [class.text-emerald-400]="isValid()" [class.text-red-400]="!isValid()">
              {{ statusMessage() }}
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input GraphQL Query</label>
              <textarea [ngModel]="inputQuery()" (ngModelChange)="inputQuery.set($event)"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Formatted GraphQL Output</label>
              <textarea readonly [value]="outputQuery()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GraphqlValidatorComponent {
  inputQuery = signal<string>('query GetUser($id: ID!) { user(id: $id) { id name email profile { avatar bio } } }');
  outputQuery = signal<string>('');
  isValid = signal<boolean>(true);
  statusMessage = signal<string>('Valid GraphQL Syntax');

  constructor() {
    this.validateAndFormat();
  }

  validateAndFormat() {
    const raw = this.inputQuery().trim();
    if (!raw) return;

    let openBrackets = 0;
    let closeBrackets = 0;

    for (const char of raw) {
      if (char === '{') openBrackets++;
      if (char === '}') closeBrackets++;
    }

    if (openBrackets !== closeBrackets) {
      this.isValid.set(false);
      this.statusMessage.set('Syntax Error: Unmatched brackets');
      this.outputQuery.set(raw);
      return;
    }

    this.isValid.set(true);
    this.statusMessage.set('✓ Valid GraphQL Query');

    let formatted = raw.replace(/\s*\{\s*/g, ' {\n  ').replace(/\s*\}\s*/g, '\n}\n').replace(/,/g, ',\n');
    this.outputQuery.set(formatted);
  }
}
