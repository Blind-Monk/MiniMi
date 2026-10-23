import { Component, OnInit, OnDestroy, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-game2048',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-lg mx-auto space-y-4 shadow-2xl font-sans select-none"
         (touchstart)="handleTouchStart($event)" (touchend)="handleTouchEnd($event)">
      <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🧱</span>
          <div>
            <h2 class="text-lg font-black text-amber-400">2048 ZEN</h2>
            <p class="text-xs text-slate-400">Slide matching tiles to reach 2048</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">
            Score: <strong class="text-amber-300 text-sm">{{ score() }}</strong>
          </div>
          <div class="bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">
            Best: <strong class="text-emerald-400 text-sm">{{ bestScore() }}</strong>
          </div>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Grid Container -->
      <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl aspect-square grid grid-cols-4 gap-2.5 relative">
        @for (row of grid(); track $index) {
          @for (val of row; track $index) {
            <div [class]="getTileClass(val)" class="rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-150 shadow-inner">
              {{ val > 0 ? val : '' }}
            </div>
          }
        }

        <!-- Game Over Overlay -->
        @if (isGameOver()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 z-10 animate-fadeIn">
            <span class="text-5xl animate-bounce">💀</span>
            <h3 class="text-2xl font-black text-red-500">NO MORE MOVES!</h3>
            <p class="text-xs text-slate-300">Final Score: <strong class="text-amber-300 text-sm">{{ score() }}</strong></p>
            <button (click)="restartGame()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transform active:scale-95 transition">
              🔄 Try Again
            </button>
          </div>
        }
      </div>

      <!-- Touch / Arrow Buttons for mobile/desktop -->
      <div class="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-mono">SWIPE OR USE ARROW BUTTONS</div>
        <div class="grid grid-cols-3 gap-2 w-44">
          <div></div>
          <button (click)="move('ArrowUp')" class="p-2.5 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">▲</button>
          <div></div>

          <button (click)="move('ArrowLeft')" class="p-2.5 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">◀</button>
          <button (click)="move('ArrowDown')" class="p-2.5 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">▼</button>
          <button (click)="move('ArrowRight')" class="p-2.5 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">▶</button>
        </div>
      </div>
    </div>
  `
})
export class Game2048Component implements OnInit, OnDestroy {
  private audioService = inject(AudioService);

  grid = signal<number[][]>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]);
  score = signal<number>(0);
  bestScore = signal<number>(0);
  isGameOver = signal<boolean>(false);

  private touchStartX = 0;
  private touchStartY = 0;

  ngOnInit() {
    this.audioService.startPlaylist('chill-lofi');
    const savedBest = localStorage.getItem('2048_best_score');
    if (savedBest) this.bestScore.set(parseInt(savedBest, 10));
    this.restartGame();
  }

  restartGame() {
    this.score.set(0);
    this.isGameOver.set(false);
    const newGrid = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ];
    this.addRandomTile(newGrid);
    this.addRandomTile(newGrid);
    this.grid.set(newGrid);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      this.move(event.key);
    }
  }

  handleTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartY = event.touches[0].clientY;
    }
  }

  handleTouchEnd(event: TouchEvent) {
    if (event.changedTouches.length === 0) return;
    const dx = event.changedTouches[0].clientX - this.touchStartX;
    const dy = event.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) {
        if (dx > 0) this.move('ArrowRight');
        else this.move('ArrowLeft');
      }
    } else {
      if (Math.abs(dy) > 30) {
        if (dy > 0) this.move('ArrowDown');
        else this.move('ArrowUp');
      }
    }
  }

  move(direction: string) {
    if (this.isGameOver()) return;

    const current = this.grid().map(row => [...row]);
    let moved = false;

    // Slide function for 1D array
    const slideAndMerge = (line: number[]): { newLine: number[]; points: number; changed: boolean } => {
      let nonZero = line.filter(v => v !== 0);
      let points = 0;
      let changed = false;

      for (let i = 0; i < nonZero.length - 1; i++) {
        if (nonZero[i] === nonZero[i + 1]) {
          nonZero[i] *= 2;
          points += nonZero[i];
          nonZero.splice(i + 1, 1);
          changed = true;
        }
      }

      while (nonZero.length < 4) nonZero.push(0);

      for (let i = 0; i < 4; i++) {
        if (nonZero[i] !== line[i]) changed = true;
      }

      return { newLine: nonZero, points, changed };
    };

    let totalPoints = 0;

    if (direction === 'ArrowLeft') {
      for (let r = 0; r < 4; r++) {
        const res = slideAndMerge(current[r]);
        current[r] = res.newLine;
        totalPoints += res.points;
        if (res.changed) moved = true;
      }
    } else if (direction === 'ArrowRight') {
      for (let r = 0; r < 4; r++) {
        const reversed = [...current[r]].reverse();
        const res = slideAndMerge(reversed);
        current[r] = res.newLine.reverse();
        totalPoints += res.points;
        if (res.changed) moved = true;
      }
    } else if (direction === 'ArrowUp') {
      for (let c = 0; c < 4; c++) {
        const col = [current[0][c], current[1][c], current[2][c], current[3][c]];
        const res = slideAndMerge(col);
        for (let r = 0; r < 4; r++) current[r][c] = res.newLine[r];
        totalPoints += res.points;
        if (res.changed) moved = true;
      }
    } else if (direction === 'ArrowDown') {
      for (let c = 0; c < 4; c++) {
        const col = [current[3][c], current[2][c], current[1][c], current[0][c]];
        const res = slideAndMerge(col);
        for (let r = 0; r < 4; r++) current[3 - r][c] = res.newLine[r];
        totalPoints += res.points;
        if (res.changed) moved = true;
      }
    }

    if (moved) {
      this.audioService.playClickSound();
      this.score.update(s => s + totalPoints);
      if (this.score() > this.bestScore()) {
        this.bestScore.set(this.score());
        localStorage.setItem('2048_best_score', this.score().toString());
      }

      this.addRandomTile(current);
      this.grid.set(current);

      if (this.checkGameOver(current)) {
        this.isGameOver.set(true);
      }
    }
  }

  private addRandomTile(g: number[][]) {
    const empty: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) empty.push({ r, c });
      }
    }
    if (empty.length > 0) {
      const spot = empty[Math.floor(Math.random() * empty.length)];
      g[spot.r][spot.c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  private checkGameOver(g: number[][]): boolean {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return false;
        if (c < 3 && g[r][c] === g[r][c + 1]) return false;
        if (r < 3 && g[r][c] === g[r + 1][c]) return false;
      }
    }
    return true;
  }

  getTileClass(val: number): string {
    switch (val) {
      case 0: return 'bg-slate-950/50';
      case 2: return 'bg-slate-800 text-slate-200';
      case 4: return 'bg-slate-700 text-slate-100';
      case 8: return 'bg-amber-600 text-white';
      case 16: return 'bg-orange-600 text-white';
      case 32: return 'bg-red-600 text-white';
      case 64: return 'bg-rose-600 text-white';
      case 128: return 'bg-yellow-500 text-slate-950';
      case 256: return 'bg-amber-400 text-slate-950';
      case 512: return 'bg-emerald-500 text-slate-950';
      case 1024: return 'bg-cyan-400 text-slate-950';
      case 2048: return 'bg-purple-500 text-white font-black animate-pulse';
      default: return 'bg-indigo-600 text-white';
    }
  }

  ngOnDestroy() {
    this.audioService.stopMusic();
  }
}
