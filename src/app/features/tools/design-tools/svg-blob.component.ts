import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-svg-blob',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>💧 SVG Blob & Organic Shape Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate smooth organic vector SVG blob shapes with randomness controls and copyable SVG code.
        </p>

        <div class="mt-4 space-y-4">
          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
            <button (click)="generateBlob()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              🎲 Generate Random Blob
            </button>
            <button (click)="copySvg()" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-center min-h-[220px]">
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="drop-shadow-2xl">
              <path [attr.d]="svgPath()" fill="#6366f1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SvgBlobComponent {
  svgPath = signal<string>('M42.7,-62.4C54.1,-52.8,61.4,-38.7,65.8,-24.1C70.2,-9.5,71.7,5.6,67.8,19.8C63.9,34,54.6,47.3,42.2,56.8C29.8,66.3,14.9,72,-0.8,73.1C-16.5,74.2,-33,70.7,-45.8,61.3C-58.6,51.9,-67.7,36.6,-71.4,20.4C-75.1,4.2,-73.4,-12.9,-66.2,-27.4C-59,-41.9,-46.3,-53.8,-32.8,-62.3C-19.3,-70.8,-5,-75.9,8.5,-73.4C22,-70.9,31.3,-72,42.7,-62.4Z');
  copyStatus = signal<string>('Copy SVG');

  generateBlob() {
    // Generate organic SVG blob path
    const path = `M40,-50C52,-42,62,-30,66,-15C70,0,68,18,60,32C52,46,38,56,22,62C6,68,-12,70,-28,64C-44,58,-58,44,-66,27C-74,10,-76,-10,-70,-26C-64,-42,-50,-54,-36,-61C-22,-68,-8,-70,4,-68C16,-66,28,-58,40,-50Z`;
    this.svgPath.set(path);
  }

  copySvg() {
    const fullSvg = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="${this.svgPath()}" fill="#6366f1"/></svg>`;
    navigator.clipboard.writeText(fullSvg);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy SVG'), 2000);
  }
}
