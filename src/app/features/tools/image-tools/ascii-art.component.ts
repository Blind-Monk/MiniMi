import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ascii-art',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔤 ASCII Art Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Turn graphics and photos into text-based character pixel art with width controls.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🔤</div>
          <p class="text-sm font-semibold text-slate-200">Upload Image to Convert to ASCII Text</p>
        </div>

        @if (asciiText()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Character Width: {{ width() }} cols</label>
                <input type="range" min="40" max="120" step="5" [ngModel]="width()" (ngModelChange)="onWidthChange($event)"
                       class="w-48 accent-indigo-500">
              </div>

              <button (click)="copyText()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                {{ copyStatus() }}
              </button>
            </div>

            <!-- Monospace Output -->
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
              <pre class="font-mono text-[8px] leading-[7px] text-emerald-400 whitespace-pre tracking-tighter">{{ asciiText() }}</pre>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AsciiArtComponent {
  asciiText = signal<string | null>(null);
  width = signal<number>(80);
  copyStatus = signal<string>('Copy ASCII Art');

  private loadedImg: HTMLImageElement | null = null;
  private charset = '@%#*+=-:. ';

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        this.loadedImg = img;
        this.generateAscii();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  onWidthChange(w: number) {
    this.width.set(w);
    this.generateAscii();
  }

  generateAscii() {
    if (!this.loadedImg) return;

    const img = this.loadedImg;
    const w = this.width();
    const h = Math.round((img.height / img.width) * w * 0.5);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h).data;

    let ascii = '';
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];

        const avg = (r + g + b) / 3;
        const charIdx = Math.floor((avg / 255) * (this.charset.length - 1));
        ascii += this.charset[charIdx];
      }
      ascii += '\n';
    }

    this.asciiText.set(ascii);
  }

  copyText() {
    if (!this.asciiText()) return;
    navigator.clipboard.writeText(this.asciiText()!);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy ASCII Art'), 2000);
  }
}
