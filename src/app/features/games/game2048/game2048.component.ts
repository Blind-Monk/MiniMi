import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game2048',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-sm mx-auto text-center space-y-4">
      <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
        <span class="text-lg font-bold text-amber-400">🧩 Score: {{ score() }}</span>
        <button (click)="restart()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-xs">
          New Game
        </button>
      </div>

      <!-- 2048 Grid -->
      <div class="grid grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 aspect-square">
        @for (row of board; track $index) {
          @for (val of row; track $index) {
            <div
              [class.bg-slate-900]="val === 0"
              [class.bg-amber-800]="val === 2"
              [class.bg-amber-700]="val === 4"
              [class.bg-orange-600]="val === 8"
              [class.bg-orange-500]="val === 16"
              [class.bg-red-600]="val === 32 || val === 64"
              [class.bg-yellow-500]="val >= 128"
              class="w-full h-full rounded-lg flex items-center justify-center font-bold text-xl sm:text-2xl transition-all shadow-inner">
              {{ val > 0 ? val : '' }}
            </div>
          }
        }
      </div>

      <!-- Controls for Touch -->
      <div class="grid grid-cols-3 gap-2 w-48 mx-auto sm:hidden pt-2">
        <div></div>
        <button (click)="move('UP')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬆️</button>
        <div></div>
        <button (click)="move('LEFT')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬅️</button>
        <button (click)="move('DOWN')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬇️</button>
        <button (click)="move('RIGHT')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">➡️</button>
      </div>
    </div>
  `
})
export class Game2048Component {
  board: number[][] = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
  score = signal<number>(0);

  constructor() {
    this.restart();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') this.move('UP');
    if (e.key === 'ArrowDown') this.move('DOWN');
    if (e.key === 'ArrowLeft') this.move('LEFT');
    if (e.key === 'ArrowRight') this.move('RIGHT');
  }

  restart() {
    this.board = Array.from({ length: 4 }, () => [0, 0, 0, 0]);
    this.score.set(0);
    this.spawnTile();
    this.spawnTile();
  }

  move(dir: string) {
    let moved = false;
    if (dir === 'LEFT') {
      for (let r = 0; r < 4; r++) {
        let row = this.board[r].filter(v => v !== 0);
        for (let c = 0; c < row.length - 1; c++) {
          if (row[c] === row[c + 1]) {
            row[c] *= 2;
            this.score.update(s => s + row[c]);
            row.splice(c + 1, 1);
          }
        }
        while (row.length < 4) row.push(0);
        if (JSON.stringify(this.board[r]) !== JSON.stringify(row)) moved = true;
        this.board[r] = row;
      }
    }
    if (moved) this.spawnTile();
  }

  private spawnTile() {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const idx = Math.floor(Math.random() * emptyCells.length);
      const cell = emptyCells[idx];
      this.board[cell.r][cell.c] = Math.random() > 0.1 ? 2 : 4;
    }
  }
}
