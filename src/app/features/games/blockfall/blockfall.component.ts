import { Component, signal, HostListener, OnDestroy, OnInit, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';
import { ResponsiveUtil } from '../../../core/utils/responsive.util';

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Piece {
  type: TetrominoType;
  matrix: number[][];
  color: string;
  borderColor: string;
  x: number;
  y: number;
}

const TETROMINOES: Record<TetrominoType, { matrix: number[][]; color: string; borderColor: string }> = {
  I: {
    matrix: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: '#06b6d4', // Cyan
    borderColor: '#67e8f9'
  },
  J: {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#2563eb', // Blue
    borderColor: '#93c5fd'
  },
  L: {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#f97316', // Orange
    borderColor: '#fdba74'
  },
  O: {
    matrix: [
      [1, 1],
      [1, 1]
    ],
    color: '#eab308', // Yellow
    borderColor: '#fef08a'
  },
  S: {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: '#22c55e', // Green
    borderColor: '#86efac'
  },
  T: {
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: '#a855f7', // Purple
    borderColor: '#d8b4fe'
  },
  Z: {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: '#ef4444', // Red
    borderColor: '#fca5a5'
  }
};

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24; // 240 x 480 px Canvas

@Component({
  selector: 'app-blockfall',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-md mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- Top Header HUD -->
      <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center space-x-2">
          <span class="text-2xl animate-pulse">🧱</span>
          <div>
            <h2 class="text-base font-black text-amber-400 tracking-wider">BLOCKFALL</h2>
            <p class="text-[10px] text-slate-400">Classic Arcade Block Stacker</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button (click)="toggleFullscreen()" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs border border-slate-700" title="Toggle Fullscreen">
            ⛶
          </button>
          <button (click)="togglePause()" *ngIf="!isGameOver()" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg text-xs font-bold border border-slate-700">
            {{ isPaused() ? '▶️' : '⏸️' }}
          </button>
          <button (click)="restart()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-xs shadow">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Main Game Board & Side Preview Stats Layout -->
      <div class="grid grid-cols-12 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl relative">

        <!-- Left 8-Cols: Main Canvas Arena -->
        <div class="col-span-8 flex justify-center items-center relative">
          <canvas #boardCanvas width="240" height="480" class="bg-slate-950 rounded-xl border-2 border-indigo-900/60 shadow-inner">
          </canvas>

          <!-- Pause Overlay -->
          <div *ngIf="isPaused()" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-2">
            <h3 class="text-xl font-black text-amber-400">PAUSED</h3>
            <button (click)="togglePause()" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow">
              ▶️ Resume
            </button>
          </div>

          <!-- Game Over Overlay -->
          <div *ngIf="isGameOver()" class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-4 text-center space-y-3">
            <span class="text-4xl animate-bounce">💀</span>
            <h3 class="text-xl font-black text-red-500">GAME OVER</h3>
            <p class="text-xs text-slate-300">Final Score: <strong class="text-amber-300 text-sm">{{ score() }}</strong></p>
            <button (click)="restart()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg">
              🔄 Play Again
            </button>
          </div>
        </div>

        <!-- Right 4-Cols: Next Piece HUD & Score Dashboard -->
        <div class="col-span-4 flex flex-col justify-between space-y-2 font-mono">

          <!-- Next Piece Box -->
          <div class="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 text-center space-y-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NEXT</div>
            <div class="flex justify-center items-center h-16">
              <canvas #nextCanvas width="64" height="64" class="bg-transparent"></canvas>
            </div>
          </div>

          <!-- Stats Dashboard -->
          <div class="space-y-2">
            <div class="bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-center">
              <div class="text-[9px] text-slate-400 uppercase">SCORE</div>
              <div class="text-sm font-black text-amber-300">{{ score() }}</div>
            </div>

            <div class="bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-center">
              <div class="text-[9px] text-slate-400 uppercase">HIGH SCORE</div>
              <div class="text-sm font-black text-emerald-400">{{ highScore() }}</div>
            </div>

            <div class="bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-center">
              <div class="text-[9px] text-slate-400 uppercase">LINES</div>
              <div class="text-xs font-bold text-indigo-300">{{ lines() }}</div>
            </div>

            <div class="bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-center">
              <div class="text-[9px] text-slate-400 uppercase">LEVEL</div>
              <div class="text-xs font-bold text-teal-300">{{ level() }}</div>
            </div>
          </div>

        </div>

      </div>

      <!-- Controls for Mobile & On-Screen Touch -->
      <div class="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest text-center font-mono">TOUCH CONTROLS</div>

        <div class="grid grid-cols-5 gap-1.5 max-w-xs mx-auto">
          <button (click)="moveLeft()" class="p-2.5 bg-slate-800 active:bg-amber-500 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-sm shadow">
            ◀
          </button>
          <button (click)="rotate()" class="p-2.5 bg-slate-800 active:bg-amber-500 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-sm shadow">
            🔄
          </button>
          <button (click)="softDrop()" class="p-2.5 bg-slate-800 active:bg-amber-500 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 text-sm shadow">
            ▼
          </button>
          <button (click)="hardDrop()" class="p-2.5 bg-indigo-600 active:bg-indigo-400 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow col-span-2">
            ⚡ HARD DROP
          </button>
        </div>
      </div>

    </div>
  `
})
export class BlockfallComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;
  @ViewChild('boardCanvas') boardCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('nextCanvas') nextCanvasRef!: ElementRef<HTMLCanvasElement>;

  private audioService = inject(AudioService);

  // Engine Signals
  score = signal<number>(0);
  highScore = signal<number>(0);
  lines = signal<number>(0);
  level = signal<number>(1);
  isGameOver = signal<boolean>(false);
  isPaused = signal<boolean>(false);

  // Board Matrix: 20 rows x 10 cols
  private grid: { color: string; borderColor: string }[][] = [];
  private activePiece!: Piece;
  private nextPiece!: Piece;
  private timer: any = null;
  private dropInterval = 600; // ms

  private ctx!: CanvasRenderingContext2D;
  private nextCtx!: CanvasRenderingContext2D;

  ngOnInit() {
    const saved = localStorage.getItem('blockfall_highscore');
    if (saved) this.highScore.set(parseInt(saved, 10));
    this.resetGrid();
  }

  ngAfterViewInit() {
    this.audioService.startPlaylist('arcade-retro');
    this.ctx = this.boardCanvasRef.nativeElement.getContext('2d')!;
    this.nextCtx = this.nextCanvasRef.nativeElement.getContext('2d')!;
    this.restart();
  }

  ngOnDestroy() {
    this.stopTimer();
    this.audioService.stopMusic();
  }

  toggleFullscreen() {
    if (this.containerRef) {
      ResponsiveUtil.toggleFullscreen(this.containerRef.nativeElement);
    }
  }

  togglePause() {
    if (this.isGameOver()) return;
    this.isPaused.set(!this.isPaused());
    if (this.isPaused()) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  restart() {
    this.audioService.playClickSound();
    this.resetGrid();
    this.score.set(0);
    this.lines.set(0);
    this.level.set(1);
    this.dropInterval = 600;
    this.isGameOver.set(false);
    this.isPaused.set(false);

    this.nextPiece = this.generateRandomPiece();
    this.spawnPiece();
    this.startTimer();
    this.draw();
  }

  private resetGrid() {
    this.grid = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ color: '', borderColor: '' }))
    );
  }

  private generateRandomPiece(): Piece {
    const keys: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const type = keys[Math.floor(Math.random() * keys.length)];
    const data = TETROMINOES[type];
    const matrix = data.matrix.map(row => [...row]);

    return {
      type,
      matrix,
      color: data.color,
      borderColor: data.borderColor,
      x: Math.floor((COLS - matrix[0].length) / 2),
      y: 0
    };
  }

  private spawnPiece() {
    this.activePiece = this.nextPiece;
    this.nextPiece = this.generateRandomPiece();

    // Check game over on spawn collision
    if (this.checkCollision(this.activePiece.x, this.activePiece.y, this.activePiece.matrix)) {
      this.isGameOver.set(true);
      this.stopTimer();
      this.audioService.playSfx('death');
    }

    this.drawNextPiece();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (this.isGameOver() || this.isPaused()) return;

    switch (e.key) {
      case 'ArrowLeft': case 'a': case 'A':
        this.moveLeft();
        e.preventDefault();
        break;
      case 'ArrowRight': case 'd': case 'D':
        this.moveRight();
        e.preventDefault();
        break;
      case 'ArrowDown': case 's': case 'S':
        this.softDrop();
        e.preventDefault();
        break;
      case 'ArrowUp': case 'w': case 'W':
        this.rotate();
        e.preventDefault();
        break;
      case ' ':
        this.hardDrop();
        e.preventDefault();
        break;
      case 'p': case 'P': case 'Escape':
        this.togglePause();
        e.preventDefault();
        break;
    }
  }

  moveLeft() {
    if (!this.checkCollision(this.activePiece.x - 1, this.activePiece.y, this.activePiece.matrix)) {
      this.activePiece.x--;
      this.audioService.playClickSound();
      this.draw();
    }
  }

  moveRight() {
    if (!this.checkCollision(this.activePiece.x + 1, this.activePiece.y, this.activePiece.matrix)) {
      this.activePiece.x++;
      this.audioService.playClickSound();
      this.draw();
    }
  }

  rotate() {
    const rotatedMatrix = this.rotateMatrix(this.activePiece.matrix);
    // Wall kick attempts (x offset: 0, -1, +1, -2, +2)
    const kicks = [0, -1, 1, -2, 2];

    for (const offset of kicks) {
      if (!this.checkCollision(this.activePiece.x + offset, this.activePiece.y, rotatedMatrix)) {
        this.activePiece.x += offset;
        this.activePiece.matrix = rotatedMatrix;
        this.audioService.playClickSound();
        this.draw();
        return;
      }
    }
  }

  private rotateMatrix(matrix: number[][]): number[][] {
    const N = matrix.length;
    const result = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        result[c][N - 1 - r] = matrix[r][c];
      }
    }
    return result;
  }

  softDrop() {
    if (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.matrix)) {
      this.activePiece.y++;
      this.score.update(s => s + 1);
      this.draw();
    } else {
      this.lockPiece();
    }
  }

  hardDrop() {
    let dropDistance = 0;
    while (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.matrix)) {
      this.activePiece.y++;
      dropDistance++;
    }
    this.score.update(s => s + dropDistance * 2);
    this.audioService.playBoingSound();
    this.lockPiece();
  }

  private checkCollision(x: number, y: number, matrix: number[][]): boolean {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const boardX = x + c;
          const boardY = y + r;

          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
            return true; // Wall/Floor hit
          }

          if (boardY >= 0 && this.grid[boardY][boardX].color !== '') {
            return true; // Settled block hit
          }
        }
      }
    }
    return false;
  }

  private lockPiece() {
    for (let r = 0; r < this.activePiece.matrix.length; r++) {
      for (let c = 0; c < this.activePiece.matrix[r].length; c++) {
        if (this.activePiece.matrix[r][c] !== 0) {
          const boardX = this.activePiece.x + c;
          const boardY = this.activePiece.y + r;
          if (boardY >= 0 && boardY < ROWS) {
            this.grid[boardY][boardX] = {
              color: this.activePiece.color,
              borderColor: this.activePiece.borderColor
            };
          }
        }
      }
    }

    this.clearFullLines();
    this.spawnPiece();
    this.draw();
  }

  private clearFullLines() {
    let clearedLines = 0;

    for (let r = ROWS - 1; r >= 0; r--) {
      const isFull = this.grid[r].every(cell => cell.color !== '');
      if (isFull) {
        clearedLines++;
        this.grid.splice(r, 1);
        this.grid.unshift(Array.from({ length: COLS }, () => ({ color: '', borderColor: '' })));
        r++; // Recheck same index after shift
      }
    }

    if (clearedLines > 0) {
      const linePoints = [0, 100, 300, 500, 800]; // 1, 2, 3, or 4 lines (Tetris)
      const points = (linePoints[clearedLines] || 100) * this.level();
      this.score.update(s => s + points);
      this.lines.update(l => l + clearedLines);
      this.audioService.playExplosionSound();

      // Update level every 10 lines
      const newLevel = Math.floor(this.lines() / 10) + 1;
      if (newLevel !== this.level()) {
        this.level.set(newLevel);
        this.dropInterval = Math.max(100, 600 - (newLevel - 1) * 50);
        this.startTimer();
      }

      if (this.score() > this.highScore()) {
        this.highScore.set(this.score());
        localStorage.setItem('blockfall_highscore', this.score().toString());
      }
    }
  }

  private getGhostY(): number {
    let ghostY = this.activePiece.y;
    while (!this.checkCollision(this.activePiece.x, ghostY + 1, this.activePiece.matrix)) {
      ghostY++;
    }
    return ghostY;
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (!this.isGameOver() && !this.isPaused()) {
        this.softDrop();
      }
    }, this.dropInterval);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private draw() {
    if (!this.ctx) return;

    // Clear Board Canvas
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, 240, 480);

    // Draw Settled Grid
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = this.grid[r][c];
        if (cell.color !== '') {
          this.drawBlock(this.ctx, c * BLOCK_SIZE, r * BLOCK_SIZE, cell.color, cell.borderColor);
        } else {
          // Empty grid lines
          this.ctx.strokeStyle = '#0f172a';
          this.ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
      }
    }

    if (this.activePiece) {
      // Draw Ghost Piece Projection
      const ghostY = this.getGhostY();
      for (let r = 0; r < this.activePiece.matrix.length; r++) {
        for (let c = 0; c < this.activePiece.matrix[r].length; c++) {
          if (this.activePiece.matrix[r][c] !== 0) {
            const x = (this.activePiece.x + c) * BLOCK_SIZE;
            const y = (ghostY + r) * BLOCK_SIZE;
            this.ctx.strokeStyle = this.activePiece.borderColor;
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
          }
        }
      }

      // Draw Active Piece
      for (let r = 0; r < this.activePiece.matrix.length; r++) {
        for (let c = 0; c < this.activePiece.matrix[r].length; c++) {
          if (this.activePiece.matrix[r][c] !== 0) {
            const x = (this.activePiece.x + c) * BLOCK_SIZE;
            const y = (this.activePiece.y + r) * BLOCK_SIZE;
            this.drawBlock(this.ctx, x, y, this.activePiece.color, this.activePiece.borderColor);
          }
        }
      }
    }
  }

  private drawNextPiece() {
    if (!this.nextCtx || !this.nextPiece) return;

    this.nextCtx.clearRect(0, 0, 64, 64);
    const size = 14;
    const matrix = this.nextPiece.matrix;
    const offsetX = (64 - matrix[0].length * size) / 2;
    const offsetY = (64 - matrix.length * size) / 2;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const x = offsetX + c * size;
          const y = offsetY + r * size;
          this.nextCtx.fillStyle = this.nextPiece.color;
          this.nextCtx.fillRect(x + 1, y + 1, size - 2, size - 2);
          this.nextCtx.strokeStyle = this.nextPiece.borderColor;
          this.nextCtx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        }
      }
    }
  }

  private drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, borderColor: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
  }
}
