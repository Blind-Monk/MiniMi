import { Component, signal, HostListener, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-xl mx-auto space-y-4">
      <!-- Header / Metrics -->
      <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
        <div class="flex items-center gap-4">
          <span class="text-lg font-bold text-teal-400">🐍 Score: {{ score() }}</span>
          <span class="text-xs text-amber-400 font-medium">🏆 Best: {{ highScore() }}</span>
        </div>
        <div class="flex gap-2">
          <button (click)="togglePause()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-xs border border-slate-600">
            {{ isPaused() ? '▶ Resume' : '⏸ Pause' }}
          </button>
          <button (click)="restart()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-xs shadow">
            🔄 New Game
          </button>
        </div>
      </div>

      <!-- Game Canvas Container -->
      <div class="relative w-full aspect-square max-w-[400px] mx-auto bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-pointer" (click)="canvasClick()"></canvas>

        <!-- Overlay Menu -->
        @if (gameOver()) {
          <div class="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center animate-fade-in">
            <span class="text-4xl">💥</span>
            <h3 class="text-2xl font-black text-red-400 tracking-wide">GAME OVER</h3>
            <p class="text-slate-300 text-sm">Final Score: <span class="font-bold text-teal-300">{{ score() }}</span></p>
            <button (click)="restart()" class="mt-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-lg shadow-lg hover:scale-105 transition-all">
              PLAY AGAIN
            </button>
          </div>
        } @else if (isPaused()) {
          <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
            <span class="text-3xl">⏸</span>
            <span class="text-lg font-bold text-slate-200">GAME PAUSED</span>
            <p class="text-xs text-slate-400">Press Space or tap Resume</p>
          </div>
        }
      </div>

      <!-- Touch / D-Pad Controls for Mobile -->
      <div class="flex flex-col items-center gap-2 pt-2">
        <div class="grid grid-cols-3 gap-2 w-48 mx-auto">
          <div></div>
          <button (click)="setDir('UP')" class="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-xl border border-slate-700 active:bg-slate-600 shadow-sm">⬆️</button>
          <div></div>
          <button (click)="setDir('LEFT')" class="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-xl border border-slate-700 active:bg-slate-600 shadow-sm">⬅️</button>
          <button (click)="setDir('DOWN')" class="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-xl border border-slate-700 active:bg-slate-600 shadow-sm">⬇️</button>
          <button (click)="setDir('RIGHT')" class="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg text-xl border border-slate-700 active:bg-slate-600 shadow-sm">➡️</button>
        </div>
        <p class="text-[11px] text-slate-400 hidden sm:block">Use Arrow Keys or WASD to turn • Space to Pause</p>
      </div>
    </div>
  `
})
export class SnakeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly gridSize = 20;
  score = signal<number>(0);
  highScore = signal<number>(0);
  gameOver = signal<boolean>(false);
  isPaused = signal<boolean>(false);

  private snake: { x: number; y: number }[] = [];
  private food = { x: 5, y: 5 };
  private direction = 'RIGHT';
  private nextDirection = 'RIGHT';
  private timer: any = null;
  private ctx!: CanvasRenderingContext2D;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = 400;
    canvas.height = 400;
    this.ctx = canvas.getContext('2d')!;

    const savedBest = localStorage.getItem('minimi_snake_best');
    if (savedBest) this.highScore.set(parseInt(savedBest, 10));

    this.restart();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === ' ') {
      this.togglePause();
      return;
    }

    if (this.gameOver() || this.isPaused()) return;

    if ((e.key === 'ArrowUp' || e.key === 'w') && this.direction !== 'DOWN') this.nextDirection = 'UP';
    if ((e.key === 'ArrowDown' || e.key === 's') && this.direction !== 'UP') this.nextDirection = 'DOWN';
    if ((e.key === 'ArrowLeft' || e.key === 'a') && this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
    if ((e.key === 'ArrowRight' || e.key === 'd') && this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
  }

  setDir(dir: string) {
    if (this.gameOver() || this.isPaused()) return;
    if (dir === 'UP' && this.direction !== 'DOWN') this.nextDirection = 'UP';
    if (dir === 'DOWN' && this.direction !== 'UP') this.nextDirection = 'DOWN';
    if (dir === 'LEFT' && this.direction !== 'RIGHT') this.nextDirection = 'LEFT';
    if (dir === 'RIGHT' && this.direction !== 'LEFT') this.nextDirection = 'RIGHT';
  }

  togglePause() {
    if (this.gameOver()) return;
    this.isPaused.update(p => !p);
  }

  restart() {
    this.snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ];
    this.direction = 'RIGHT';
    this.nextDirection = 'RIGHT';
    this.score.set(0);
    this.gameOver.set(false);
    this.isPaused.set(false);
    this.spawnFood();

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 120);
    this.draw();
  }

  canvasClick() {
    if (this.gameOver()) {
      this.restart();
    }
  }

  private spawnFood() {
    let valid = false;
    while (!valid) {
      const fx = Math.floor(Math.random() * this.gridSize);
      const fy = Math.floor(Math.random() * this.gridSize);
      if (!this.snake.some(segment => segment.x === fx && segment.y === fy)) {
        this.food = { x: fx, y: fy };
        valid = true;
      }
    }
  }

  private tick() {
    if (this.gameOver() || this.isPaused()) return;

    this.direction = this.nextDirection;
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

    // Self-collision check
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver.set(true);
      if (this.score() > this.highScore()) {
        this.highScore.set(this.score());
        localStorage.setItem('minimi_snake_best', this.score().toString());
      }
      this.draw();
      return;
    }

    // Check food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score.update(s => s + 10);
      this.snake.unshift(head);
      this.spawnFood();
    } else {
      this.snake.unshift(head);
      this.snake.pop();
    }

    this.draw();
  }

  private draw() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    const cellSize = canvas.width / this.gridSize;

    // Background grid
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridSize; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * cellSize, 0);
      this.ctx.lineTo(i * cellSize, canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * cellSize);
      this.ctx.lineTo(canvas.width, i * cellSize);
      this.ctx.stroke();
    }

    // Draw Food (Luminous Orb)
    const foodX = this.food.x * cellSize + cellSize / 2;
    const foodY = this.food.y * cellSize + cellSize / 2;
    const radius = cellSize / 2 - 2;

    this.ctx.save();
    this.ctx.shadowColor = '#ef4444';
    this.ctx.shadowBlur = 10;
    this.ctx.fillStyle = '#f87171';
    this.ctx.beginPath();
    this.ctx.arc(foodX, foodY, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Draw Snake
    this.snake.forEach((seg, idx) => {
      const x = seg.x * cellSize + 1;
      const y = seg.y * cellSize + 1;
      const size = cellSize - 2;

      this.ctx.save();
      if (idx === 0) {
        // Head
        this.ctx.fillStyle = '#10b981';
        this.ctx.shadowColor = '#34d399';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, size, size, 6);
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#0f172a';
        if (this.direction === 'RIGHT' || this.direction === 'LEFT') {
          this.ctx.fillRect(x + (this.direction === 'RIGHT' ? size - 5 : 3), y + 3, 3, 3);
          this.ctx.fillRect(x + (this.direction === 'RIGHT' ? size - 5 : 3), y + size - 6, 3, 3);
        } else {
          this.ctx.fillRect(x + 3, y + (this.direction === 'DOWN' ? size - 5 : 3), 3, 3);
          this.ctx.fillRect(x + size - 6, y + (this.direction === 'DOWN' ? size - 5 : 3), 3, 3);
        }
      } else {
        // Body segment gradient
        const alpha = Math.max(0.4, 1 - idx / (this.snake.length + 5));
        this.ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, size, size, 4);
        this.ctx.fill();
      }
      this.ctx.restore();
    });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
