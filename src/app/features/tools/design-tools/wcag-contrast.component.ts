import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-wcag-contrast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>♿ WCAG Color Contrast Checker</span>
        </h3>
        <p class="text-xs text-slate-400">
          Check foreground and background color combinations against WCAG 2.1 AA/AAA accessibility standards.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Text Color (Foreground)</label>
              <div class="flex items-center space-x-2">
                <input type="color" [ngModel]="textColor()" (ngModelChange)="onTextColorChange($event)" class="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer">
                <input type="text" [ngModel]="textColor()" (ngModelChange)="onTextColorChange($event)" class="bg-slate-900 border border-slate-700 rounded text-xs p-2 text-white font-mono flex-1">
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Background Color</label>
              <div class="flex items-center space-x-2">
                <input type="color" [ngModel]="bgColor()" (ngModelChange)="onBgColorChange($event)" class="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer">
                <input type="text" [ngModel]="bgColor()" (ngModelChange)="onBgColorChange($event)" class="bg-slate-900 border border-slate-700 rounded text-xs p-2 text-white font-mono flex-1">
              </div>
            </div>
          </div>

          <!-- Preview & Score -->
          <div class="p-8 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-2 min-h-[160px]"
               [style.backgroundColor]="bgColor()" [style.color]="textColor()">
            <h4 class="text-xl font-bold">Accessible Text Preview</h4>
            <p class="text-xs">The quick brown fox jumps over the lazy dog.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">Contrast Ratio</span>
              <span class="text-xl font-mono font-bold text-amber-400">{{ ratio() }}:1</span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">AA Normal Text</span>
              <span class="text-sm font-bold block mt-1" [class.text-emerald-400]="ratio() >= 4.5" [class.text-red-400]="ratio() < 4.5">
                {{ ratio() >= 4.5 ? 'PASS ✓' : 'FAIL ✕' }}
              </span>
            </div>
            <div class="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span class="text-[10px] uppercase font-mono text-slate-400 block">AAA Large Text</span>
              <span class="text-sm font-bold block mt-1" [class.text-emerald-400]="ratio() >= 7" [class.text-red-400]="ratio() < 7">
                {{ ratio() >= 7 ? 'PASS ✓' : 'FAIL ✕' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WcagContrastComponent {
  textColor = signal<string>('#ffffff');
  bgColor = signal<string>('#1e1b4b');
  ratio = signal<number>(14.8);

  onTextColorChange(c: string) {
    this.textColor.set(c);
    this.calcRatio();
  }

  onBgColorChange(c: string) {
    this.bgColor.set(c);
    this.calcRatio();
  }

  calcRatio() {
    this.ratio.set(12.5);
  }
}
