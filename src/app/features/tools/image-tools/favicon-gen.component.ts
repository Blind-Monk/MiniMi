import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FaviconSize {
  name: string;
  size: number;
  dataUrl?: string;
}

@Component({
  selector: 'app-favicon-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌐 Favicon Generator</span>
        </h3>
        <p class="text-xs text-slate-400">
          Generate multi-resolution web icons (16x16, 32x32, 180x180, 512x512) and copy HTML header tags.
        </p>

        <!-- File Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🌐</div>
          <p class="text-sm font-semibold text-slate-200">Upload Icon or Logo Image</p>
        </div>

        @if (imageLoaded()) {
          <div class="mt-6 space-y-6">
            <!-- Icon Grids -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              @for (item of faviconList(); track item.size) {
                <div class="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center space-y-2">
                  <span class="text-[10px] font-mono font-bold text-slate-400 uppercase block">{{ item.name }} ({{ item.size }}×{{ item.size }})</span>
                  <div class="h-20 bg-slate-950 rounded-lg flex items-center justify-center p-2 border border-slate-800">
                    @if (item.dataUrl) {
                      <img [src]="item.dataUrl" [style.width.px]="Math.min(item.size, 64)" class="object-contain">
                    }
                  </div>
                  @if (item.dataUrl) {
                    <a [href]="item.dataUrl" [download]="'favicon-' + item.size + 'x' + item.size + '.png'"
                       class="text-[10px] font-bold text-indigo-400 hover:underline block">
                      Download PNG
                    </a>
                  }
                </div>
              }
            </div>

            <!-- Copyable HTML Snippet -->
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-300">HTML Web Snippet Tags</label>
                <button (click)="copyCode()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded">
                  {{ copyStatus() }}
                </button>
              </div>
              <textarea readonly [value]="htmlSnippet" class="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-emerald-400 focus:outline-none"></textarea>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class FaviconGenComponent {
  imageLoaded = signal<boolean>(false);
  copyStatus = signal<string>('Copy Code');

  Math = Math;

  faviconList = signal<FaviconSize[]>([
    { name: 'Standard Favicon', size: 16 },
    { name: 'Retina Favicon', size: 32 },
    { name: 'Apple Touch Icon', size: 180 },
    { name: 'Android / PWA Icon', size: 512 }
  ]);

  htmlSnippet = `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">`;

  private loadedImg: HTMLImageElement | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        this.loadedImg = img;
        this.imageLoaded.set(true);
        this.generateIcons();
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  generateIcons() {
    if (!this.loadedImg) return;

    const img = this.loadedImg;
    const updated = this.faviconList().map(item => {
      const canvas = document.createElement('canvas');
      canvas.width = item.size;
      canvas.height = item.size;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, item.size, item.size);
      }
      return { ...item, dataUrl: canvas.toDataURL('image/png') };
    });

    this.faviconList.set(updated);
  }

  copyCode() {
    navigator.clipboard.writeText(this.htmlSnippet);
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Code'), 2000);
  }
}
