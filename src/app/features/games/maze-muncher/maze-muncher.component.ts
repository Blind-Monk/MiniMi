import { Component, signal, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';
import { ResponsiveUtil } from '../../../core/utils/responsive.util';

@Component({
  selector: 'app-maze-muncher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-sm mx-auto text-center space-y-4 select-none">
      <div class="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
        <span class="text-lg font-bold text-yellow-400">🟡 Dots Left: {{ dotsLeft() }}</span>
        <div class="flex gap-2">
          <button (click)="toggleFullscreen()" class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-xs border border-slate-600">
            ⛶
          </button>
          <button (click)="restart()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold text-xs">
            Restart
          </button>
        </div>
      </div>

      <!-- Maze Screen Placeholder -->
      <div class="relative bg-slate-950 p-4 rounded-xl border border-slate-800 aspect-square flex flex-col items-center justify-center space-y-4 shadow-inner">
        <div class="text-5xl animate-bounce">🟡</div>
        <div class="flex space-x-3 text-3xl">
          <span class="animate-pulse">👻</span>
          <span class="animate-pulse text-red-500">👻</span>
          <span class="animate-pulse text-pink-400">👻</span>
          <span class="animate-pulse text-cyan-400">👻</span>
        </div>
        <p class="text-xs text-slate-400">Eat pellets, evade ghosts!</p>
      </div>

      <!-- Mobile D-Pad Controls -->
      <div class="grid grid-cols-3 gap-2 w-48 mx-auto sm:hidden pt-2">
        <div></div>
        <button (click)="munch()" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬆️</button>
        <div></div>
        <button (click)="munch()" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬅️</button>
        <button (click)="munch()" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">⬇️</button>
        <button (click)="munch()" class="bg-slate-800 p-3 rounded-lg text-lg border border-slate-700">➡️</button>
      </div>
    </div>
  `
})
export class MazeMuncherComponent implements AfterViewInit {
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  private audioService = inject(AudioService);

  dotsLeft = signal<number>(120);

  ngAfterViewInit() {
    this.audioService.startPlaylist('arcade-retro');
  }

  toggleFullscreen() {
    if (this.containerRef) {
      ResponsiveUtil.toggleFullscreen(this.containerRef.nativeElement);
    }
  }

  munch() {
    if (this.dotsLeft() > 0) {
      this.dotsLeft.update(d => d - 1);
      this.audioService.playCoinSound();
    }
  }

  restart() {
    this.audioService.playClickSound();
    this.dotsLeft.set(120);
  }
}
