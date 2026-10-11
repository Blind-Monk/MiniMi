import { Component, signal, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blockfall',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-sm mx-auto text-center space-y-4">
      <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
        <span class="text-lg font-bold text-indigo-400">🧱 Lines: {{ lines() }}</span>
        <button (click)="restart()" class="px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded font-semibold text-xs">
          Restart
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-10 grid-rows-20 gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800 aspect-[1/2] max-h-[380px] mx-auto">
        @for (row of grid; track $index) {
          @for (cell of row; track $index) {
            <div
              [class.bg-cyan-500]="cell === 1"
              [class.bg-blue-600]="cell === 2"
              [class.bg-amber-500]="cell === 3"
              [class.bg-yellow-400]="cell === 4"
              [class.bg-slate-900]="cell === 0"
              class="w-full h-full rounded-[1px] transition-colors border border-slate-950">
            </div>
          }
        }
      </div>

      <!-- Controls for Touch -->
      <div class="grid grid-cols-3 gap-2 w-48 mx-auto sm:hidden pt-2">
        <div></div>
        <button (click)="rotate()" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">🔄</button>
        <div></div>
        <button (click)="move(-1)" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬅️</button>
        <button (click)="drop()" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬇️</button>
        <button (click)="move(1)" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">➡️</button>
      </div>
    </div>
  `
})
export class BlockfallComponent implements OnDestroy {
  grid = Array.from({ length: 20 }, () => Array(10).fill(0));
  lines = signal<number>(0);
  private timer: any;

  constructor() {
    this.timer = setInterval(() => this.tick(), 500);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.move(-1);
    if (e.key === 'ArrowRight') this.move(1);
    if (e.key === 'ArrowDown') this.drop();
    if (e.key === 'ArrowUp') this.rotate();
  }

  restart() {
    this.grid = Array.from({ length: 20 }, () => Array(10).fill(0));
    this.lines.set(0);
  }

  move(dir: number) {}
  drop() {}
  rotate() {}

  private tick() {
    // Basic tick logic
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
