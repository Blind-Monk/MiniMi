import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-maze-muncher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-sm mx-auto text-center space-y-4">
      <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
        <span class="text-lg font-bold text-yellow-400">🟡 Dots Left: {{ dotsLeft() }}</span>
        <button (click)="restart()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-xs">
          Restart
        </button>
      </div>

      <!-- Maze Screen Placeholder -->
      <div class="relative bg-slate-950 p-4 rounded-xl border border-slate-800 aspect-square flex flex-col items-center justify-center space-y-4">
        <div class="text-5xl animate-bounce">🟡</div>
        <div class="flex space-x-3 text-3xl">
          <span class="animate-pulse">👻</span>
          <span class="animate-pulse">👻</span>
          <span class="animate-pulse">👻</span>
        </div>
        <p class="text-xs text-slate-400">Eat pellets, evade ghosts!</p>
      </div>
    </div>
  `
})
export class MazeMuncherComponent {
  dotsLeft = signal<number>(120);

  restart() {
    this.dotsLeft.set(120);
  }
}
