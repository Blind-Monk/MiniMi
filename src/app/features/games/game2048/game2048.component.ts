import { Component, OnInit, OnDestroy, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-game2048',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-lg mx-auto space-y-4 shadow-2xl font-sans select-none">
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
            Score: <strong class="text-amber-300">{{ score() }}</strong>
          </div>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Grid Container -->
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl aspect-square grid grid-cols-4 gap-3 relative">
        @for (row of grid(); track $index) {
          @for (val of row; track $index) {
            <div [class]="getTileClass(val)" class="rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black transition-all duration-150 shadow-inner">
              {{ val > 0 ? val : '' }}
            </div>
          }
        }
      </div>

      <!-- Controls Note -->
      <p class="text-center text-xs text-slate-500">
        Use Arrow Keys or Swipe on mobile to slide tiles.
      </p>
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

  ngOnInit() {
    this.audioService.startPlaylist('chill-lofi');
    this.restartGame();
  }

  restartGame() {
    this.score.set(0);
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

  private move(direction: string) {
    this.audioService.playClickSound();
    let current = this.grid().map(row => [...row]);
    let moved = false;

    // Simple 2048 slide logic
    if (direction === 'ArrowLeft') {
      for (let r = 0; r < 4; r++) {
        const row = current[r].filter(v => v !== 0);
        for (let c = 0; c < row.length - 1; c++) {
          if (row[c] === row[c + 1]) {
            row[c] *= 2;
            this.score.update(s => s + row[c]);
            row.splice(c + 1, 1);
          }
        }
        while (row.length < 4) row.push(0);
        current[r] = row;
      }
    }

    this.addRandomTile(current);
    this.grid.set(current);
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
      default: return 'bg-emerald-500 text-slate-950';
    }
  }

  ngOnDestroy() {
    this.audioService.stopMusic();
  }
}
