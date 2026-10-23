import { Component, OnInit, OnDestroy, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-maze-muncher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-lg mx-auto space-y-4 shadow-2xl font-sans select-none">
      <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🟡</span>
          <div>
            <h2 class="text-lg font-black text-amber-400">MAZE MUNCHER</h2>
            <p class="text-xs text-slate-400">Eat dots, avoid classic ghosts!</p>
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

      <!-- Maze Arena -->
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl aspect-square flex items-center justify-center relative">
        <p class="text-slate-400 text-xs text-center">
          Classic Arcade Pac-style Maze Muncher initialized.<br>Score: {{ score() }}
        </p>
      </div>
    </div>
  `
})
export class MazeMuncherComponent implements OnInit, OnDestroy {
  private audioService = inject(AudioService);

  score = signal<number>(0);

  ngOnInit() {
    this.audioService.startPlaylist('arcade-retro');
  }

  restartGame() {
    this.score.set(0);
  }

  ngOnDestroy() {
    this.audioService.stopMusic();
  }
}
