import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flexbox-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🧱 CSS Flexbox & Grid Playground</span>
        </h3>
        <p class="text-xs text-slate-400">
          Interactive visual layout builder to test CSS Flexbox alignments and CSS Grid template columns.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
              <label class="text-xs font-semibold text-slate-300">Justify Content:</label>
              <select [ngModel]="justify()" (ngModelChange)="justify.set($event)" class="bg-slate-900 border border-slate-700 rounded text-xs p-2 text-white">
                <option value="flex-start">flex-start</option>
                <option value="center">center</option>
                <option value="flex-end">flex-end</option>
                <option value="space-between">space-between</option>
                <option value="space-around">space-around</option>
              </select>
            </div>

            <div class="flex items-center space-x-3">
              <label class="text-xs font-semibold text-slate-300">Align Items:</label>
              <select [ngModel]="align()" (ngModelChange)="align.set($event)" class="bg-slate-900 border border-slate-700 rounded text-xs p-2 text-white">
                <option value="stretch">stretch</option>
                <option value="center">center</option>
                <option value="flex-start">flex-start</option>
                <option value="flex-end">flex-end</option>
              </select>
            </div>
          </div>

          <!-- Flexbox Container Sandbox -->
          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex h-60 gap-3 transition-all"
               [style.justifyContent]="justify()" [style.alignItems]="align()">
            <div class="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow">1</div>
            <div class="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-white shadow">2</div>
            <div class="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center font-bold text-white shadow">3</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FlexboxGridComponent {
  justify = signal<string>('center');
  align = signal<string>('center');
}
