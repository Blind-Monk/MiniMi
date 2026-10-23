import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, HostListener, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

interface TilePos {
  x: number;
  y: number;
}

interface Ghost {
  id: 'blinky' | 'pinky' | 'inky' | 'clyde';
  name: string;
  color: string;
  x: number;
  y: number;
  dir: Direction;
  targetX: number;
  targetY: number;
  homeX: number;
  homeY: number;
  scatterX: number;
  scatterY: number;
  isFrightened: boolean;
  isEaten: boolean;
  speed: number;
}

interface LevelConfig {
  id: number;
  name: string;
  grid: number[][]; // 0: empty, 1: wall, 2: pellet, 3: power pellet, 4: ghost house door/inside, 5: fruit
  ghostSpeed: number;
  frightenedDuration: number; // in seconds
  scatterDuration: number;
  chaseDuration: number;
}

const TILE_SIZE = 20; // 19 cols x 21 rows = 380 x 420 px canvas

const MAZE_LEVEL_1: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0], // Row 10 col 0 & 18 are tunnel wrapping
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,5,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const MAZE_LEVEL_2: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,3,1],
  [1,2,1,1,2,1,2,1,2,1,2,1,2,1,2,1,1,2,1],
  [1,2,1,1,2,2,2,1,2,2,2,1,2,2,2,1,1,2,1],
  [1,2,2,2,2,1,1,1,2,1,2,1,1,1,2,2,2,2,1],
  [1,1,1,1,2,1,2,2,2,1,2,2,2,1,2,1,1,1,1],
  [1,2,2,2,2,1,2,1,1,1,1,1,2,1,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,0,0,0,1,2,1,2,1,1,2,1],
  [0,0,0,1,2,2,2,1,0,0,0,1,2,2,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,1,0,1,4,4,4,1,0,1,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,2,2,0,0,5,0,0,2,2,2,1,0,0,0],
  [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const MAZE_LEVEL_3: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,5,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const MAZE_LEVEL_4: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,1,2,2,2,2,2,1,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,2,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,0,0,0,1,2,2,2,2,2,2,1],
  [1,1,1,1,2,1,2,1,0,0,0,1,2,1,2,1,1,1,1],
  [0,0,0,1,2,1,2,1,1,4,1,1,2,1,2,1,0,0,0],
  [0,0,0,1,2,1,0,1,4,4,4,1,0,1,2,1,0,0,0],
  [0,0,0,0,2,0,0,1,1,1,1,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,0,0,5,0,0,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,1,1,2,1,2,1,1,1,2,1,0,0,0],
  [1,1,1,1,2,2,2,2,2,1,2,2,2,2,2,1,1,1,1],
  [1,2,2,2,2,1,1,1,2,1,2,1,1,1,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

@Component({
  selector: 'app-maze-muncher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-xl mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- Top Header HUD -->
      <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center space-x-3">
          <span class="text-2xl animate-pulse">🟡</span>
          <div>
            <h2 class="text-lg font-black text-amber-400 tracking-wider">MAZE MUNCHER</h2>
            <p class="text-xs text-slate-400">Classic Grid AI • Multi-Level Arcade</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">
            Score: <strong class="text-amber-300">{{ score() }}</strong>
          </div>
          <div class="bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">
            High: <strong class="text-emerald-400">{{ highScore() }}</strong>
          </div>
          <button (click)="togglePause()" *ngIf="gameState() === 'PLAYING' || gameState() === 'PAUSED'" class="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition">
            {{ gameState() === 'PAUSED' ? '▶️ Resume' : '⏸️ Pause' }}
          </button>
        </div>
      </div>

      <!-- Main Game Container -->
      <div class="relative bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center overflow-hidden">

        <!-- Live HUD Bar (Lives & Level) -->
        <div *ngIf="gameState() === 'PLAYING' || gameState() === 'PAUSED'" class="w-full flex items-center justify-between px-2 pb-2 text-xs font-mono text-slate-300">
          <div class="flex items-center space-x-1">
            <span>Lives:</span>
            <span *ngFor="let life of getLivesArray()" class="text-amber-400 text-base">🟡</span>
          </div>
          <div class="text-amber-300 font-bold">
            Level {{ currentLevelIndex() + 1 }}: {{ getCurrentLevelName() }}
          </div>
          <div class="text-cyan-300">
            Dots Remaining: <strong>{{ remainingPellets() }}</strong>
          </div>
        </div>

        <!-- Canvas Display -->
        <canvas #gameCanvas width="380" height="420" class="bg-black rounded-xl border-2 border-indigo-900/60 shadow-inner">
        </canvas>

        <!-- Overlay 1: MENU -->
        <div *ngIf="gameState() === 'MENU'" class="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-5xl mb-1 animate-bounce">🟡 👻</span>
          <h1 class="text-2xl font-black text-amber-400 tracking-wider">MAZE MUNCHER</h1>
          <p class="text-xs text-slate-300 max-w-xs leading-relaxed">
            Navigate classic mazes, eat all dots, collect power pellets to hunt ghosts, and master 4 classic AI ghost targeting behaviors!
          </p>

          <div class="flex flex-col space-y-2.5 w-48">
            <button (click)="startGame(0)" class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-lg transform active:scale-95 transition">
              🎮 Start Game
            </button>

            <button (click)="openLevelSelect()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-xl text-xs border border-indigo-500/30 transition">
              🗺️ Level Select
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[10px] text-slate-400 text-left bg-slate-900/80 p-3 rounded-xl border border-slate-800 w-full max-w-xs mt-2">
            <div>🔴 <strong>Blinky:</strong> Direct Chaser</div>
            <div>🩷 <strong>Pinky:</strong> 4-Tile Ambusher</div>
            <div>🩵 <strong>Inky:</strong> Vector Flanker</div>
            <div>🧡 <strong>Clyde:</strong> Scatter Wimp</div>
          </div>
        </div>

        <!-- Overlay 2: LEVEL SELECT -->
        <div *ngIf="gameState() === 'LEVEL_SELECT'" class="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h2 class="text-xl font-black text-amber-400">SELECT LEVEL</h2>

          <div class="grid grid-cols-1 gap-2.5 w-full max-w-xs">
            <button *ngFor="let level of levels; let i = index" (click)="startGame(i)" class="p-3 bg-slate-900 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500 rounded-xl flex items-center justify-between text-left transition group">
              <div>
                <div class="text-sm font-bold text-white group-hover:text-amber-300">Level {{ i + 1 }}: {{ level.name }}</div>
                <div class="text-[10px] text-slate-400">Ghost Speed: {{ Math.round(level.ghostSpeed * 100) }}% • Frightened: {{ level.frightenedDuration }}s</div>
              </div>
              <span class="text-lg text-indigo-400 group-hover:translate-x-1 transition">▶</span>
            </button>
          </div>

          <button (click)="setGameState('MENU')" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold">
            ⬅️ Back to Menu
          </button>
        </div>

        <!-- Overlay 3: PAUSED -->
        <div *ngIf="gameState() === 'PAUSED'" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
          <h2 class="text-2xl font-black text-amber-400">GAME PAUSED</h2>
          <div class="flex flex-col space-y-2 w-40">
            <button (click)="togglePause()" class="py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs">
              ▶️ Resume
            </button>
            <button (click)="restartCurrentLevel()" class="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs border border-slate-700">
              🔄 Restart Level
            </button>
            <button (click)="setGameState('MENU')" class="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs border border-slate-700">
              🏠 Main Menu
            </button>
          </div>
        </div>

        <!-- Overlay 4: LEVEL COMPLETE -->
        <div *ngIf="gameState() === 'LEVEL_COMPLETE'" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-5xl animate-bounce">🎉</span>
          <h2 class="text-2xl font-black text-emerald-400">LEVEL CLEAR!</h2>
          <p class="text-xs text-slate-300">Great job! All pellets devoured.</p>

          <button (click)="nextLevel()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-lg">
            {{ currentLevelIndex() < levels.length - 1 ? 'Next Level ➔' : '🏆 Complete Game!' }}
          </button>
        </div>

        <!-- Overlay 5: GAME OVER -->
        <div *ngIf="gameState() === 'GAME_OVER'" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-5xl animate-pulse">💀</span>
          <h2 class="text-2xl font-black text-red-500">GAME OVER</h2>
          <p class="text-xs text-slate-300">Final Score: <strong class="text-amber-300 text-sm">{{ score() }}</strong></p>

          <div class="flex space-x-3">
            <button (click)="restartCurrentLevel()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs">
              🔄 Retry
            </button>
            <button (click)="setGameState('MENU')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700">
              🏠 Main Menu
            </button>
          </div>
        </div>

      </div>

      <!-- Virtual D-Pad Touch Controls for Mobile / On-Screen -->
      <div class="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-mono">D-PAD CONTROLS</div>
        <div class="grid grid-cols-3 gap-1.5 w-36">
          <div></div>
          <button (click)="setPlayerDirection('UP')" class="p-3 bg-slate-800 active:bg-amber-500 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">
            ▲
          </button>
          <div></div>

          <button (click)="setPlayerDirection('LEFT')" class="p-3 bg-slate-800 active:bg-amber-500 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">
            ◀
          </button>
          <button (click)="setPlayerDirection('DOWN')" class="p-3 bg-slate-800 active:bg-amber-500 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">
            ▼
          </button>
          <button (click)="setPlayerDirection('RIGHT')" class="p-3 bg-slate-800 active:bg-amber-500 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center text-sm border border-slate-700 shadow">
            ▶
          </button>
        </div>
      </div>

    </div>
  `
})
export class MazeMuncherComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private audioService = inject(AudioService);
  private cdr = inject(ChangeDetectorRef);

  Math = Math;

  // Signals
  score = signal<number>(0);
  highScore = signal<number>(0);
  lives = signal<number>(3);
  gameState = signal<'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER'>('MENU');
  currentLevelIndex = signal<number>(0);
  remainingPellets = signal<number>(0);

  // Levels configuration
  levels: LevelConfig[] = [
    { id: 1, name: 'Classic Arena', grid: MAZE_LEVEL_1, ghostSpeed: 0.08, frightenedDuration: 8, scatterDuration: 7, chaseDuration: 20 },
    { id: 2, name: 'Twin Corridors', grid: MAZE_LEVEL_2, ghostSpeed: 0.09, frightenedDuration: 6, scatterDuration: 5, chaseDuration: 25 },
    { id: 3, name: 'Tunnel Cross', grid: MAZE_LEVEL_3, ghostSpeed: 0.10, frightenedDuration: 5, scatterDuration: 4, chaseDuration: 30 },
    { id: 4, name: 'The Gauntlet', grid: MAZE_LEVEL_4, ghostSpeed: 0.11, frightenedDuration: 4, scatterDuration: 3, chaseDuration: 35 }
  ];

  // Game Engine State Variables
  private ctx!: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private currentGrid: number[][] = [];

  // Player state
  private playerPos = { x: 9.5, y: 16 }; // Center grid pos
  private playerDir: Direction = 'NONE';
  private playerNextDir: Direction = 'NONE';
  private playerSpeed = 0.10;
  private mouthAngle = 0.2;
  private mouthSpeed = 0.02;

  // Ghosts
  private ghosts: Ghost[] = [];

  // Mode Timers
  private frightenedTimer = 0;
  private ghostsEatenMultiplier = 1;
  private fruitActive = false;

  ngOnInit() {
    this.audioService.startPlaylist('arcade-retro');
    const savedHighScore = localStorage.getItem('maze_muncher_highscore');
    if (savedHighScore) {
      this.highScore.set(parseInt(savedHighScore, 10));
    }
  }

  ngOnDestroy() {
    this.stopGameLoop();
    this.audioService.stopMusic();
  }

  getLivesArray(): number[] {
    return Array(Math.max(0, this.lives())).fill(0);
  }

  getCurrentLevelName(): string {
    return this.levels[this.currentLevelIndex()]?.name || 'Maze';
  }

  setGameState(state: 'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER') {
    this.gameState.set(state);
    if (state === 'PLAYING') {
      this.startGameLoop();
    } else {
      this.stopGameLoop();
    }
  }

  openLevelSelect() {
    this.gameState.set('LEVEL_SELECT');
  }

  togglePause() {
    if (this.gameState() === 'PLAYING') {
      this.setGameState('PAUSED');
    } else if (this.gameState() === 'PAUSED') {
      this.setGameState('PLAYING');
    }
  }

  startGame(levelIdx: number) {
    this.currentLevelIndex.set(levelIdx);
    this.score.set(0);
    this.lives.set(3);
    this.initLevel(levelIdx);
    this.setGameState('PLAYING');
  }

  restartCurrentLevel() {
    this.initLevel(this.currentLevelIndex());
    this.setGameState('PLAYING');
  }

  nextLevel() {
    const nextIdx = this.currentLevelIndex() + 1;
    if (nextIdx < this.levels.length) {
      this.currentLevelIndex.set(nextIdx);
      this.initLevel(nextIdx);
      this.setGameState('PLAYING');
    } else {
      this.setGameState('MENU');
    }
  }

  private initLevel(levelIdx: number) {
    const lvl = this.levels[levelIdx];
    // Clone grid
    this.currentGrid = lvl.grid.map(row => [...row]);

    // Count dots
    let dots = 0;
    for (let r = 0; r < this.currentGrid.length; r++) {
      for (let c = 0; c < this.currentGrid[r].length; c++) {
        if (this.currentGrid[r][c] === 2 || this.currentGrid[r][c] === 3) {
          dots++;
        }
      }
    }
    this.remainingPellets.set(dots);

    // Reset player position
    this.playerPos = { x: 9.5, y: 16 };
    this.playerDir = 'NONE';
    this.playerNextDir = 'NONE';

    // Init ghosts
    this.ghosts = [
      {
        id: 'blinky',
        name: 'Blinky',
        color: '#ef4444', // Red
        x: 9.5, y: 8,
        dir: 'LEFT',
        targetX: 9, targetY: 16,
        homeX: 9.5, homeY: 8,
        scatterX: 18, scatterY: 0,
        isFrightened: false, isEaten: false, speed: lvl.ghostSpeed
      },
      {
        id: 'pinky',
        name: 'Pinky',
        color: '#f472b6', // Pink
        x: 8.5, y: 10,
        dir: 'UP',
        targetX: 9, targetY: 16,
        homeX: 8.5, homeY: 10,
        scatterX: 0, scatterY: 0,
        isFrightened: false, isEaten: false, speed: lvl.ghostSpeed * 0.95
      },
      {
        id: 'inky',
        name: 'Inky',
        color: '#22d3ee', // Cyan
        x: 9.5, y: 10,
        dir: 'UP',
        targetX: 9, targetY: 16,
        homeX: 9.5, homeY: 10,
        scatterX: 18, scatterY: 20,
        isFrightened: false, isEaten: false, speed: lvl.ghostSpeed * 0.90
      },
      {
        id: 'clyde',
        name: 'Clyde',
        color: '#fb923c', // Orange
        x: 10.5, y: 10,
        dir: 'UP',
        targetX: 9, targetY: 16,
        homeX: 10.5, homeY: 10,
        scatterX: 0, scatterY: 20,
        isFrightened: false, isEaten: false, speed: lvl.ghostSpeed * 0.85
      }
    ];

    this.frightenedTimer = 0;
    this.ghostsEatenMultiplier = 1;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.gameState() !== 'PLAYING') return;

    switch (event.key) {
      case 'ArrowUp': case 'w': case 'W':
        this.setPlayerDirection('UP');
        event.preventDefault();
        break;
      case 'ArrowDown': case 's': case 'S':
        this.setPlayerDirection('DOWN');
        event.preventDefault();
        break;
      case 'ArrowLeft': case 'a': case 'A':
        this.setPlayerDirection('LEFT');
        event.preventDefault();
        break;
      case 'ArrowRight': case 'd': case 'D':
        this.setPlayerDirection('RIGHT');
        event.preventDefault();
        break;
      case 'p': case 'P': case 'Escape':
        this.togglePause();
        event.preventDefault();
        break;
    }
  }

  setPlayerDirection(dir: Direction) {
    this.playerNextDir = dir;
  }

  private startGameLoop() {
    this.stopGameLoop();
    const render = () => {
      if (this.gameState() === 'PLAYING') {
        this.updateGameLogic();
        this.drawScene();
      }
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  private stopGameLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private updateGameLogic() {
    // Try turning to buffered next dir
    if (this.canMoveInDir(this.playerPos.x, this.playerPos.y, this.playerNextDir)) {
      this.playerDir = this.playerNextDir;
    }

    // Move player in playerDir
    if (this.canMoveInDir(this.playerPos.x, this.playerPos.y, this.playerDir)) {
      const delta = this.getDirectionDelta(this.playerDir);
      this.playerPos.x += delta.dx * this.playerSpeed;
      this.playerPos.y += delta.dy * this.playerSpeed;

      // Wrap around tunnel at row 10 (col 0 <-> col 18)
      if (this.playerPos.x < 0) this.playerPos.x = 18.5;
      if (this.playerPos.x > 18.5) this.playerPos.x = 0;
    }

    // Eat dots/power pellets
    const tileX = Math.floor(this.playerPos.x);
    const tileY = Math.floor(this.playerPos.y);

    if (tileY >= 0 && tileY < this.currentGrid.length && tileX >= 0 && tileX < this.currentGrid[0].length) {
      const tileVal = this.currentGrid[tileY][tileX];
      if (tileVal === 2) { // Standard pellet
        this.currentGrid[tileY][tileX] = 0;
        this.score.update(s => s + 10);
        this.remainingPellets.update(r => Math.max(0, r - 1));
        this.audioService.playSfx('eatDot');
      } else if (tileVal === 3) { // Power pellet
        this.currentGrid[tileY][tileX] = 0;
        this.score.update(s => s + 50);
        this.remainingPellets.update(r => Math.max(0, r - 1));
        this.triggerFrightenedMode();
        this.audioService.playSfx('eatPower');
      } else if (tileVal === 5) { // Fruit
        this.currentGrid[tileY][tileX] = 0;
        this.score.update(s => s + 200);
        this.audioService.playSfx('eatFruit');
      }
    }

    // Check High Score
    if (this.score() > this.highScore()) {
      this.highScore.set(this.score());
      localStorage.setItem('maze_muncher_highscore', this.score().toString());
    }

    // Check level complete
    if (this.remainingPellets() <= 0) {
      this.setGameState('LEVEL_COMPLETE');
      return;
    }

    // Frightened timer countdown
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= 1 / 60;
      if (this.frightenedTimer <= 0) {
        this.ghosts.forEach(g => {
          g.isFrightened = false;
        });
      }
    }

    // Update Ghost AI
    this.updateGhostAI();

    // Check collisions with ghosts
    for (const ghost of this.ghosts) {
      const dist = Math.hypot(ghost.x - this.playerPos.x, ghost.y - this.playerPos.y);
      if (dist < 0.8) {
        if (ghost.isFrightened && !ghost.isEaten) {
          // Eat ghost
          ghost.isEaten = true;
          ghost.isFrightened = false;
          const points = 200 * this.ghostsEatenMultiplier;
          this.score.update(s => s + points);
          this.ghostsEatenMultiplier *= 2;
          this.audioService.playSfx('eatGhost');
        } else if (!ghost.isFrightened && !ghost.isEaten) {
          // Player hit by ghost!
          this.audioService.playSfx('death');
          this.lives.update(l => l - 1);
          if (this.lives() <= 0) {
            this.setGameState('GAME_OVER');
          } else {
            // Reset player and ghost positions
            this.playerPos = { x: 9.5, y: 16 };
            this.playerDir = 'NONE';
            this.playerNextDir = 'NONE';
            this.ghosts.forEach(g => {
              g.x = g.homeX;
              g.y = g.homeY;
              g.isFrightened = false;
              g.isEaten = false;
            });
          }
          break;
        }
      }
    }
  }

  private triggerFrightenedMode() {
    const duration = this.levels[this.currentLevelIndex()].frightenedDuration;
    this.frightenedTimer = duration;
    this.ghostsEatenMultiplier = 1;
    this.ghosts.forEach(g => {
      if (!g.isEaten) {
        g.isFrightened = true;
      }
    });
  }

  private updateGhostAI() {
    const pX = Math.floor(this.playerPos.x);
    const pY = Math.floor(this.playerPos.y);
    const blinky = this.ghosts.find(g => g.id === 'blinky');

    this.ghosts.forEach(ghost => {
      // Eaten ghost returning home
      if (ghost.isEaten) {
        ghost.targetX = ghost.homeX;
        ghost.targetY = ghost.homeY;
        if (Math.hypot(ghost.x - ghost.homeX, ghost.y - ghost.homeY) < 0.5) {
          ghost.isEaten = false;
          ghost.isFrightened = false;
        }
      } else if (ghost.isFrightened) {
        // Target random direction
        ghost.targetX = Math.floor(Math.random() * 19);
        ghost.targetY = Math.floor(Math.random() * 21);
      } else {
        // Classic AI Rules
        switch (ghost.id) {
          case 'blinky': // Chaser: Target Pacman directly
            ghost.targetX = pX;
            ghost.targetY = pY;
            break;
          case 'pinky': // Ambusher: Target 4 tiles ahead of Pacman
            const pDelta = this.getDirectionDelta(this.playerDir);
            ghost.targetX = pX + pDelta.dx * 4;
            ghost.targetY = pY + pDelta.dy * 4;
            break;
          case 'inky': // Flanker: Vector from Blinky to 2 tiles ahead of Pacman, doubled
            const p2Delta = this.getDirectionDelta(this.playerDir);
            const midX = pX + p2Delta.dx * 2;
            const midY = pY + p2Delta.dy * 2;
            const bX = blinky ? blinky.x : pX;
            const bY = blinky ? blinky.y : pY;
            ghost.targetX = midX + (midX - bX);
            ghost.targetY = midY + (midY - bY);
            break;
          case 'clyde': // Wimp: If dist > 8 tiles target Pacman, else target scatter corner
            const dist = Math.hypot(ghost.x - pX, ghost.y - pY);
            if (dist > 8) {
              ghost.targetX = pX;
              ghost.targetY = pY;
            } else {
              ghost.targetX = ghost.scatterX;
              ghost.targetY = ghost.scatterY;
            }
            break;
        }
      }

      // Ghost movement at intersections
      const currentGridX = Math.round(ghost.x);
      const currentGridY = Math.round(ghost.y);
      const isNearTileCenter = Math.hypot(ghost.x - currentGridX, ghost.y - currentGridY) < 0.12;

      if (isNearTileCenter) {
        ghost.x = currentGridX;
        ghost.y = currentGridY;

        // Determine best available direction towards target
        const validDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => {
          // Cannot turn 180 degrees back
          if (d === this.getOppositeDirection(ghost.dir)) return false;
          return this.canMoveInDir(currentGridX, currentGridY, d as Direction);
        }) as Direction[];

        if (validDirs.length > 0) {
          let bestDir = validDirs[0];
          let bestDist = Infinity;

          validDirs.forEach(dir => {
            const d = this.getDirectionDelta(dir);
            const nextX = currentGridX + d.dx;
            const nextY = currentGridY + d.dy;
            const distToTarget = Math.hypot(nextX - ghost.targetX, nextY - ghost.targetY);

            if (distToTarget < bestDist) {
              bestDist = distToTarget;
              bestDir = dir;
            }
          });

          ghost.dir = bestDir;
        }
      }

      // Move ghost
      const delta = this.getDirectionDelta(ghost.dir);
      const speed = ghost.isFrightened ? ghost.speed * 0.6 : (ghost.isEaten ? ghost.speed * 1.5 : ghost.speed);
      ghost.x += delta.dx * speed;
      ghost.y += delta.dy * speed;

      // Tunnel wrap for ghost
      if (ghost.x < 0) ghost.x = 18.5;
      if (ghost.x > 18.5) ghost.x = 0;
    });
  }

  private canMoveInDir(x: number, y: number, dir: Direction): boolean {
    if (dir === 'NONE') return false;
    const delta = this.getDirectionDelta(dir);
    const targetX = Math.floor(x + delta.dx * 0.55);
    const targetY = Math.floor(y + delta.dy * 0.55);

    if (targetY < 0 || targetY >= this.currentGrid.length || targetX < 0 || targetX >= this.currentGrid[0].length) {
      // Check tunnel wrap at row 10
      return targetY === 10;
    }

    const tileVal = this.currentGrid[targetY][targetX];
    return tileVal !== 1; // 1 is wall
  }

  private getDirectionDelta(dir: Direction): { dx: number, dy: number } {
    switch (dir) {
      case 'UP': return { dx: 0, dy: -1 };
      case 'DOWN': return { dx: 0, dy: 1 };
      case 'LEFT': return { dx: -1, dy: 0 };
      case 'RIGHT': return { dx: 1, dy: 0 };
      default: return { dx: 0, dy: 0 };
    }
  }

  private getOppositeDirection(dir: Direction): Direction {
    switch (dir) {
      case 'UP': return 'DOWN';
      case 'DOWN': return 'UP';
      case 'LEFT': return 'RIGHT';
      case 'RIGHT': return 'LEFT';
      default: return 'NONE';
    }
  }

  private drawScene() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) return;

    // Clear background
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Map Walls & Pellets
    for (let r = 0; r < this.currentGrid.length; r++) {
      for (let c = 0; c < this.currentGrid[r].length; c++) {
        const tile = this.currentGrid[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === 1) { // Blue Wall
          this.ctx.fillStyle = '#1e40af';
          this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          this.ctx.strokeStyle = '#3b82f6';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else if (tile === 2) { // Pellet
          this.ctx.fillStyle = '#fde047';
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === 3) { // Power Pellet
          this.ctx.fillStyle = '#facc15';
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === 4) { // Ghost House Gate
          this.ctx.fillStyle = '#ec4899';
          this.ctx.fillRect(x + 2, y + TILE_SIZE / 2 - 1, TILE_SIZE - 4, 3);
        } else if (tile === 5) { // Cherry / Fruit Bonus
          this.ctx.fillStyle = '#ef4444';
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE / 2 - 2, y + TILE_SIZE / 2 + 2, 3.5, 0, Math.PI * 2);
          this.ctx.arc(x + TILE_SIZE / 2 + 3, y + TILE_SIZE / 2 + 2, 3.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    // Draw Pac-Man Player
    this.mouthAngle += this.mouthSpeed;
    if (this.mouthAngle > 0.4 || this.mouthAngle < 0.05) this.mouthSpeed = -this.mouthSpeed;

    const pX = this.playerPos.x * TILE_SIZE + TILE_SIZE / 2;
    const pY = this.playerPos.y * TILE_SIZE + TILE_SIZE / 2;
    let rotation = 0;
    if (this.playerDir === 'RIGHT') rotation = 0;
    if (this.playerDir === 'DOWN') rotation = Math.PI / 2;
    if (this.playerDir === 'LEFT') rotation = Math.PI;
    if (this.playerDir === 'UP') rotation = -Math.PI / 2;

    this.ctx.fillStyle = '#facc15';
    this.ctx.beginPath();
    this.ctx.arc(pX, pY, 8.5, rotation + this.mouthAngle, rotation + Math.PI * 2 - this.mouthAngle);
    this.ctx.lineTo(pX, pY);
    this.ctx.fill();

    // Draw Ghosts
    this.ghosts.forEach(ghost => {
      const gX = ghost.x * TILE_SIZE + TILE_SIZE / 2;
      const gY = ghost.y * TILE_SIZE + TILE_SIZE / 2;

      if (ghost.isEaten) {
        // Draw eyes only
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(gX - 3, gY - 1, 2.5, 0, Math.PI * 2);
        this.ctx.arc(gX + 3, gY - 1, 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#1e3a8a';
        this.ctx.beginPath();
        this.ctx.arc(gX - 3, gY - 1, 1, 0, Math.PI * 2);
        this.ctx.arc(gX + 3, gY - 1, 1, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Body color
        this.ctx.fillStyle = ghost.isFrightened ? '#2563eb' : ghost.color;

        // Head arc
        this.ctx.beginPath();
        this.ctx.arc(gX, gY - 2, 8, Math.PI, 0, false);
        // Skirt tentacles
        this.ctx.lineTo(gX + 8, gY + 8);
        this.ctx.lineTo(gX + 4, gY + 5);
        this.ctx.lineTo(gX, gY + 8);
        this.ctx.lineTo(gX - 4, gY + 5);
        this.ctx.lineTo(gX - 8, gY + 8);
        this.ctx.closePath();
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = ghost.isFrightened ? '#fef08a' : '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(gX - 3, gY - 3, 2.5, 0, Math.PI * 2);
        this.ctx.arc(gX + 3, gY - 3, 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = ghost.isFrightened ? '#ef4444' : '#1e293b';
        this.ctx.beginPath();
        this.ctx.arc(gX - 3, gY - 3, 1, 0, Math.PI * 2);
        this.ctx.arc(gX + 3, gY - 3, 1, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }
}
