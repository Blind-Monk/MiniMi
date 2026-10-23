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
          Draw retro 8-bit & 16-bit pixel sprites on a grid canvas with swatches, eraser, and PNG export.
        </p>

        <!-- Tool & Color Palette Controls -->
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4 mt-4">
          <div class="flex items-center space-x-3">
            <label class="text-xs font-semibold text-slate-300">Grid Size:</label>
            <select [ngModel]="gridSize()" (ngModelChange)="setGridSize($event)" class="bg-slate-900 border border-slate-700 rounded text-xs p-1.5 text-white">
              <option [ngValue]="8">8 × 8</option>
              <option [ngValue]="16">16 × 16</option>
              <option [ngValue]="32">32 × 32</option>
            </select>
          </div>

          <!-- Color Swatches -->
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold text-slate-300">Color:</span>
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
              🧹 Clear
            </button>
            <button (click)="exportPng()" class="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow">
              ⬇️ Export PNG
            </button>
          </div>
        </div>

        <!-- Pixel Grid Canvas -->
        <div class="bg-slate-950 p-6 rounded-xl border border-slate-800 flex items-center justify-center min-h-[300px]">
          <div class="grid gap-px bg-slate-800 p-1 rounded shadow-2xl"
               [style.grid-template-columns]="'repeat(' + gridSize() + ', minmax(0, 1fr))'">
            @for (cell of grid(); track $index) {
              <div (mousedown)="drawPixel($index)"
                   (mouseenter)="onHover($index, $event)"
                   class="w-6 h-6 sm:w-8 sm:h-8 cursor-pointer transition-colors border border-slate-900/40 hover:opacity-80"
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
  grid = signal<string[]>(new Array(16 * 16).fill(''));
  selectedColor = signal<string>('#6366f1');

  swatches = ['#ef4444', '#f97316', '#eab308', '#10b981', '#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#ffffff', '#000000'];

  setGridSize(size: number) {
    this.gridSize.set(size);
    this.grid.set(new Array(size * size).fill(''));
  }

  drawPixel(index: number) {
    const newGrid = [...this.grid()];
    newGrid[index] = this.selectedColor();
    this.grid.set(newGrid);
  }

  onHover(index: number, event: MouseEvent) {
    if (event.buttons === 1) { // Left mouse button dragged
      this.drawPixel(index);
    }
  }

  clearGrid() {
    this.grid.set(new Array(this.gridSize() * this.gridSize()).fill(''));
  }

  exportPng() {
    const size = this.gridSize();
    const scale = 16;
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
