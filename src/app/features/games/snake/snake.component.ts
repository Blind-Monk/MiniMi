import { Component, signal, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-lg mx-auto text-center space-y-4">
      <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
        <span class="text-lg font-bold text-teal-400">🐍 Score: {{ score() }}</span>
        <button (click)="restart()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-xs">
          Restart
        </button>
      </div>

      <!-- Snake Grid -->
      <div class="grid grid-cols-20 grid-rows-20 gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800 aspect-square max-w-[360px] mx-auto">
        @for (row of grid; track $index) {
          @for (cell of row; track $index) {
            <div
              [class.bg-emerald-500]="isSnake(cell.x, cell.y)"
              [class.bg-red-500]="cell.x === food.x && cell.y === food.y"
              [class.rounded-full]="cell.x === food.x && cell.y === food.y"
              class="w-full h-full bg-slate-900/60 rounded-[2px] transition-colors">
            </div>
          }
        }
      </div>

      <!-- Touch / D-Pad Controls for Mobile -->
      <div class="grid grid-cols-3 gap-2 w-48 mx-auto sm:hidden pt-2">
        <div></div>
        <button (click)="setDir('UP')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700 active:bg-slate-700">⬆️</button>
        <div></div>
        <button (click)="setDir('LEFT')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700 active:bg-slate-700">⬅️</button>
        <button (click)="setDir('DOWN')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700 active:bg-slate-700">⬇️</button>
        <button (click)="setDir('RIGHT')" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700 active:bg-slate-700">➡️</button>
      </div>
    </div>
  `
})
export class SnakeComponent implements OnDestroy {
  gridSize = 20;
  grid = Array.from({ length: 20 }, (_, y) => Array.from({ length: 20 }, (_, x) => ({ x, y })));

  snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }];
  food = { x: 5, y: 5 };
  direction = 'UP';
  score = signal<number>(0);
  private timer: any;

  constructor() {
    this.timer = setInterval(() => this.tick(), 150);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp') this.setDir('UP');
    if (e.key === 'ArrowDown') this.setDir('DOWN');
    if (e.key === 'ArrowLeft') this.setDir('LEFT');
    if (e.key === 'ArrowRight') this.setDir('RIGHT');
  }

  setDir(dir: string) {
    if (dir === 'UP' && this.direction !== 'DOWN') this.direction = 'UP';
    if (dir === 'DOWN' && this.direction !== 'UP') this.direction = 'DOWN';
    if (dir === 'LEFT' && this.direction !== 'RIGHT') this.direction = 'LEFT';
    if (dir === 'RIGHT' && this.direction !== 'LEFT') this.direction = 'RIGHT';
  }

  isSnake(x: number, y: number): boolean {
    return this.snake.some(s => s.x === x && s.y === y);
  }

  restart() {
    this.snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }];
    this.score.set(0);
    this.direction = 'UP';
    this.spawnFood();
  }

  private tick() {
    const head = { ...this.snake[0] };
    if (this.direction === 'UP') head.y--;
    if (this.direction === 'DOWN') head.y++;
    if (this.direction === 'LEFT') head.x--;
    if (this.direction === 'RIGHT') head.x++;

    // Wrap-around borders
    if (head.x < 0) head.x = this.gridSize - 1;
    if (head.x >= this.gridSize) head.x = 0;
    if (head.y < 0) head.y = this.gridSize - 1;
    if (head.y >= this.gridSize) head.y = 0;

    // Check food
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score.update(s => s + 10);
      this.snake.unshift(head);
      this.spawnFood();
    } else {
      this.snake.unshift(head);
      this.snake.pop();
    }
  }

  private spawnFood() {
    this.food = {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize)
    };
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
