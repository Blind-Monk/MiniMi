import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pixel-art',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>👾 Pixel Art Maker / Editor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Draw retro 8-bit & 16-bit pixel sprites with custom grid resolution, pixel scaling size, color palettes, bucket fill, and PNG export.
        </p>

        <!-- Tool & Color Palette Controls -->
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4 mt-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Grid Resolution</label>
              <select [ngModel]="gridSize()" (ngModelChange)="setGridSize($event)" class="w-full bg-slate-900 border border-slate-700 rounded text-xs p-1.5 text-white">
                <option [ngValue]="8">8 × 8 (Micro Sprite)</option>
                <option [ngValue]="16">16 × 16 (Classic 8-bit)</option>
                <option [ngValue]="32">32 × 32 (Detailed 16-bit)</option>
                <option [ngValue]="64">64 × 64 (High Res Pixel Art)</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Pixel Scale Size: {{ pixelScale() }}px</label>
              <input type="range" min="4" max="32" step="2" [ngModel]="pixelScale()" (ngModelChange)="pixelScale.set($event)"
                     class="w-full accent-indigo-500">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Active Tool</label>
              <div class="flex gap-1.5">
                <button (click)="activeTool.set('pencil')" [class.bg-indigo-600]="activeTool() === 'pencil'" class="px-2.5 py-1 bg-slate-700 text-white rounded text-xs font-bold">✏️ Pencil</button>
                <button (click)="activeTool.set('fill')" [class.bg-indigo-600]="activeTool() === 'fill'" class="px-2.5 py-1 bg-slate-700 text-white rounded text-xs font-bold">🪣 Bucket</button>
                <button (click)="activeTool.set('eraser')" [class.bg-indigo-600]="activeTool() === 'eraser'" class="px-2.5 py-1 bg-slate-700 text-white rounded text-xs font-bold">🧹 Eraser</button>
              </div>
            </div>
          </div>

          <!-- Color Swatches Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-semibold text-slate-300">Palette:</span>
              @for (c of swatches; track c) {
                <div (click)="selectedColor.set(c)"
                     [class.ring-2]="selectedColor() === c"
                     class="w-6 h-6 rounded cursor-pointer border border-slate-700 ring-indigo-400 transition-transform hover:scale-110"
                     [style.backgroundColor]="c">
                </div>
              }
              <input type="color" [ngModel]="selectedColor()" (ngModelChange)="selectedColor.set($event)" class="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent">
            </div>

            <div class="flex items-center space-x-2">
              <button (click)="clearGrid()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded">
                Clear Grid
              </button>
              <button (click)="exportPng()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow">
                ⬇️ Export PNG
              </button>
            </div>
          </div>
        </div>

        <!-- Pixel Grid Canvas -->
        <div class="bg-slate-950 p-6 rounded-xl border border-slate-800 flex items-center justify-center min-h-[320px] overflow-auto">
          <div class="grid gap-px bg-slate-800 p-1 rounded shadow-2xl select-none"
               [style.grid-template-columns]="'repeat(' + gridSize() + ', minmax(0, 1fr))'">
            @for (cell of grid(); track $index) {
              <div (mousedown)="handlePixelClick($index)"
                   (mouseenter)="onHover($index, $event)"
                   class="cursor-pointer transition-colors border border-slate-900/30 hover:opacity-80"
                   [style.width.px]="pixelScale()"
                   [style.height.px]="pixelScale()"
                   [style.backgroundColor]="cell || '#1e293b'">
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class PixelArtComponent {
  gridSize = signal<number>(16);
  pixelScale = signal<number>(20);
  grid = signal<string[]>(new Array(16 * 16).fill(''));
  selectedColor = signal<string>('#6366f1');
  activeTool = signal<'pencil' | 'fill' | 'eraser'>('pencil');

  swatches = ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#ffffff', '#000000'];

  setGridSize(size: number) {
    this.gridSize.set(size);
    this.grid.set(new Array(size * size).fill(''));
    if (size === 8) this.pixelScale.set(28);
    else if (size === 16) this.pixelScale.set(20);
    else if (size === 32) this.pixelScale.set(12);
    else if (size === 64) this.pixelScale.set(6);
  }

  handlePixelClick(index: number) {
    if (this.activeTool() === 'pencil') {
      this.drawPixel(index, this.selectedColor());
    } else if (this.activeTool() === 'eraser') {
      this.drawPixel(index, '');
    } else if (this.activeTool() === 'fill') {
      this.floodFill(index);
    }
  }

  drawPixel(index: number, color: string) {
    const newGrid = [...this.grid()];
    newGrid[index] = color;
    this.grid.set(newGrid);
  }

  onHover(index: number, event: MouseEvent) {
    if (event.buttons === 1 && this.activeTool() !== 'fill') {
      const color = this.activeTool() === 'pencil' ? this.selectedColor() : '';
      this.drawPixel(index, color);
    }
  }

  floodFill(startIndex: number) {
    const targetColor = this.grid()[startIndex];
    const fillColor = this.selectedColor();
    if (targetColor === fillColor) return;

    const size = this.gridSize();
    const newGrid = [...this.grid()];
    const queue = [startIndex];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const idx = queue.pop()!;
      if (visited.has(idx)) continue;
      visited.add(idx);

      if (newGrid[idx] === targetColor) {
        newGrid[idx] = fillColor;
        const row = Math.floor(idx / size);
        const col = idx % size;

        if (row > 0) queue.push(idx - size);
        if (row < size - 1) queue.push(idx + size);
        if (col > 0) queue.push(idx - 1);
        if (col < size - 1) queue.push(idx + 1);
      }
    }
    this.grid.set(newGrid);
  }

  clearGrid() {
    this.grid.set(new Array(this.gridSize() * this.gridSize()).fill(''));
  }

  exportPng() {
    const size = this.gridSize();
    const scale = Math.max(1, Math.floor(512 / size));
    const canvas = document.createElement('canvas');
    canvas.width = size * scale;
    canvas.height = size * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixels = this.grid();
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const color = pixels[r * size + c] || '#1e293b';
        ctx.fillStyle = color;
        ctx.fillRect(c * scale, r * scale, scale, scale);
      }
    }

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'pixel-art.png';
    a.click();
  }
}
