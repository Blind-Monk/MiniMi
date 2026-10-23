import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

interface Ghost {
  id: string;
  name: string;
  emoji: string;
  frightenedEmoji: string;
  color: string;
  gridX: number;
  gridY: number;
  subX: number; // 0.0 to 1.0 within tile
  subY: number;
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
  grid: number[][]; // 0: path, 1: wall, 2: dot, 3: power pellet, 4: door, 5: fruit
  ghostSpeed: number;
  frightenedDuration: number;
}

const TILE_SIZE = 30; // 19 cols x 21 rows = 570 x 630 px canvas

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
  [0,0,0,0,2,0,0,1,4,4,4,1,0,0,2,0,0,0,0], // Tunnel Row 10
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

const MAZE_LEVEL_5: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,2,1,0,0,0,0,1,2,1,2,1,0,0,0,0,1,2,1],
  [1,2,1,0,1,1,0,1,2,1,2,1,0,1,1,0,1,2,1],
  [1,2,1,0,1,1,0,1,2,2,2,1,0,1,1,0,1,2,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
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
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

@Component({
  selector: 'app-maze-muncher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-3xl mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- Top HUD Header -->
      <div class="flex items-center justify-between bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
        <div class="flex items-center space-x-3">
          <span class="text-3xl animate-bounce">🟡</span>
          <div>
            <h2 class="text-xl font-black text-amber-400 tracking-wider">MAZE MUNCHER</h2>
            <p class="text-xs text-slate-400">Strict Tile-Grid Collision • Emoji Caricature Ghosts</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="bg-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-mono border border-slate-700">
            Score: <strong class="text-amber-300 text-sm">{{ score() }}</strong>
          </div>
          <div class="bg-slate-800 px-3.5 py-1.5 rounded-lg text-xs font-mono border border-slate-700">
            High: <strong class="text-emerald-400 text-sm">{{ highScore() }}</strong>
          </div>
          <button (click)="togglePause()" *ngIf="gameState() === 'PLAYING' || gameState() === 'PAUSED'" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition">
            {{ gameState() === 'PAUSED' ? '▶️ Resume' : '⏸️ Pause' }}
          </button>
        </div>
      </div>

      <!-- Main Game Arena -->
      <div class="relative bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center overflow-hidden">

        <!-- Live Level Status -->
        <div *ngIf="gameState() === 'PLAYING' || gameState() === 'PAUSED'" class="w-full flex items-center justify-between px-2 pb-3 text-xs font-mono text-slate-300">
          <div class="flex items-center space-x-1">
            <span>Lives:</span>
            <span *ngFor="let life of getLivesArray()" class="text-amber-400 text-lg">🟡</span>
          </div>
          <div class="text-amber-300 font-bold text-sm">
            Level {{ currentLevelIndex() + 1 }}: {{ getCurrentLevelName() }}
          </div>
          <div class="text-cyan-300">
            Dots Left: <strong>{{ remainingPellets() }}</strong>
          </div>
        </div>

        <!-- Canvas Display (570 x 630 px Big Mode) -->
        <canvas #gameCanvas width="570" height="630" class="bg-slate-950 rounded-xl border-2 border-indigo-900/60 shadow-2xl max-w-full">
        </canvas>

        <!-- Overlay 1: MAIN MENU & MAZE SELECTOR -->
        <div *ngIf="gameState() === 'MENU'" class="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-6xl mb-1 animate-pulse">🟡 👻 🤡 👾 👺</span>
          <h1 class="text-3xl font-black text-amber-400 tracking-wider">MAZE MUNCHER</h1>
          <p class="text-xs text-slate-300 max-w-md leading-relaxed">
            Strict grid-snapped arcade physics! Eat dots, collect power pellets, and outsmart 4 caricature emoji chasers!
          </p>

          <div class="w-full max-w-sm bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
            <span class="text-xs font-bold text-amber-300 uppercase tracking-widest">Select Maze Layout:</span>
            <div class="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto p-1">
              <button *ngFor="let lvl of levels; let i = index" (click)="startGame(i)" class="p-2 bg-slate-800 hover:bg-indigo-900 border border-slate-700 hover:border-indigo-500 rounded-lg flex items-center justify-between text-left text-xs transition">
                <span class="font-bold text-white">Maze {{ i + 1 }}: {{ lvl.name }}</span>
                <span class="text-amber-400 font-mono">Select ➔</span>
              </button>
            </div>
          </div>

          <button (click)="startGame(0)" class="w-48 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-xl transform active:scale-95 transition">
            🎮 Quick Start (Maze 1)
          </button>
        </div>

        <!-- Overlay 2: PAUSED -->
        <div *ngIf="gameState() === 'PAUSED'" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
          <h2 class="text-3xl font-black text-amber-400">GAME PAUSED</h2>
          <div class="flex flex-col space-y-2 w-44">
            <button (click)="togglePause()" class="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow">
              ▶️ Resume
            </button>
            <button (click)="setGameState('MENU')" class="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700">
              🏠 Main Menu
            </button>
          </div>
        </div>

        <!-- Overlay 3: LEVEL COMPLETE -->
        <div *ngIf="gameState() === 'LEVEL_COMPLETE'" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-6xl animate-bounce">🎉</span>
          <h2 class="text-3xl font-black text-emerald-400">LEVEL CLEAR!</h2>
          <p class="text-xs text-slate-300">All dots devoured without clipping walls!</p>
          <button (click)="nextLevel()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-lg">
            {{ currentLevelIndex() < levels.length - 1 ? 'Next Maze ➔' : '🏆 Master Victory!' }}
          </button>
        </div>

        <!-- Overlay 4: GAME OVER -->
        <div *ngIf="gameState() === 'GAME_OVER'" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-6xl animate-pulse">💀</span>
          <h2 class="text-3xl font-black text-red-500">GAME OVER</h2>
          <p class="text-xs text-slate-300">Final Score: <strong class="text-amber-300 text-base">{{ score() }}</strong></p>
          <div class="flex space-x-3">
            <button (click)="restartCurrentLevel()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow">
              🔄 Retry Maze
            </button>
            <button (click)="setGameState('MENU')" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700">
              🏠 Main Menu
            </button>
          </div>
        </div>

      </div>

      <!-- Touch D-Pad Controls -->
      <div class="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-mono">D-PAD TOUCH CONTROLS</div>
        <div class="grid grid-cols-3 gap-2 w-44">
          <div></div>
          <button (click)="setPlayerDirection('UP')" class="p-3 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-base border border-slate-700 shadow">▲</button>
          <div></div>

          <button (click)="setPlayerDirection('LEFT')" class="p-3 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-base border border-slate-700 shadow">◀</button>
          <button (click)="setPlayerDirection('DOWN')" class="p-3 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-base border border-slate-700 shadow">▼</button>
          <button (click)="setPlayerDirection('RIGHT')" class="p-3 bg-slate-800 active:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center text-base border border-slate-700 shadow">▶</button>
        </div>
      </div>

    </div>
  `
})
export class MazeMuncherComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private audioService = inject(AudioService);

  // Signals
  score = signal<number>(0);
  highScore = signal<number>(0);
  lives = signal<number>(3);
  gameState = signal<'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER'>('MENU');
  currentLevelIndex = signal<number>(0);
  remainingPellets = signal<number>(0);

  // 5 Distinct Maze Configurations
  levels: LevelConfig[] = [
    { id: 1, name: 'Classic Arena', grid: MAZE_LEVEL_1, ghostSpeed: 0.08, frightenedDuration: 8 },
    { id: 2, name: 'Twin Corridors', grid: MAZE_LEVEL_2, ghostSpeed: 0.09, frightenedDuration: 6 },
    { id: 3, name: 'Tunnel Cross', grid: MAZE_LEVEL_3, ghostSpeed: 0.10, frightenedDuration: 5 },
    { id: 4, name: 'The Gauntlet', grid: MAZE_LEVEL_4, ghostSpeed: 0.11, frightenedDuration: 4 },
    { id: 5, name: 'Spiral Fortress', grid: MAZE_LEVEL_5, ghostSpeed: 0.12, frightenedDuration: 3 }
  ];

  // Grid Tile Based Engine
  private ctx!: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private currentGrid: number[][] = [];

  // Player Grid Position
  private playerGridX = 9;
  private playerGridY = 16;
  private playerSubX = 0; // 0..1
  private playerSubY = 0;
  private playerDir: Direction = 'NONE';
  private playerNextDir: Direction = 'NONE';
  private playerSpeed = 0.12; // Fraction of tile per tick
  private mouthAngle = 0.2;

  // Ghosts
  private ghosts: Ghost[] = [];

  private frightenedTimer = 0;
  private ghostsEatenMultiplier = 1;

  ngOnInit() {
    this.audioService.startPlaylist('arcade-retro');
    const savedHighScore = localStorage.getItem('maze_muncher_highscore');
    if (savedHighScore) this.highScore.set(parseInt(savedHighScore, 10));
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

  setGameState(state: 'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER') {
    this.gameState.set(state);
    if (state === 'PLAYING') this.startGameLoop();
    else this.stopGameLoop();
  }

  togglePause() {
    if (this.gameState() === 'PLAYING') this.setGameState('PAUSED');
    else if (this.gameState() === 'PAUSED') this.setGameState('PLAYING');
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
    this.currentGrid = lvl.grid.map(row => [...row]);

    let dots = 0;
    for (let r = 0; r < this.currentGrid.length; r++) {
      for (let c = 0; c < this.currentGrid[r].length; c++) {
        if (this.currentGrid[r][c] === 2 || this.currentGrid[r][c] === 3) dots++;
      }
    }
    this.remainingPellets.set(dots);

    this.playerGridX = 9;
    this.playerGridY = 16;
    this.playerSubX = 0;
    this.playerSubY = 0;
    this.playerDir = 'NONE';
    this.playerNextDir = 'NONE';

    // Emoji Caricature Ghosts
    this.ghosts = [
      {
        id: 'blinky', name: 'Spook', emoji: '👻', frightenedEmoji: '🙀', color: '#ef4444',
        gridX: 9, gridY: 8, subX: 0, subY: 0, dir: 'LEFT',
        targetX: 9, targetY: 16, homeX: 9, homeY: 8, scatterX: 18, scatterY: 0,
        isFrightened: false, isEaten: false, speed: lvl.ghostSpeed
      },
      {
        id: 'pinky', name: 'Joker', emoji: '🤡', frightenedEmoji: '🙀', color: '#f472b6',
        gridX: 8, gridY: 10, subX: 0, subY: 0, dir: 'UP',
        targetX: 9, targetY: 16, homeX: 8, homeY: 10, scatterX: 0, scatterY: 0,
        isFrightened: false, isEaten: false, speed: lvl.ghostSpeed * 0.95
      },
      {
        id: 'inky', name: 'Alien', emoji: '👾', frightenedEmoji: '🙀', color: '#22d3ee',
        gridX: 9, gridY: 10, subX: 0, subY: 0, dir: 'UP',
        targetX: 9, targetY: 16, homeX: 9, homeY: 10, scatterX: 18, scatterY: 20,
        isFrightened: false, isEaten: false, speed: lvl.ghostSpeed * 0.90
      },
      {
        id: 'clyde', name: 'Goblin', emoji: '👺', frightenedEmoji: '🙀', color: '#fb923c',
        gridX: 10, gridY: 10, subX: 0, subY: 0, dir: 'UP',
        targetX: 9, targetY: 16, homeX: 10, homeY: 10, scatterX: 0, scatterY: 20,
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
      case 'ArrowUp': case 'w': case 'W': this.setPlayerDirection('UP'); event.preventDefault(); break;
      case 'ArrowDown': case 's': case 'S': this.setPlayerDirection('DOWN'); event.preventDefault(); break;
      case 'ArrowLeft': case 'a': case 'A': this.setPlayerDirection('LEFT'); event.preventDefault(); break;
      case 'ArrowRight': case 'd': case 'D': this.setPlayerDirection('RIGHT'); event.preventDefault(); break;
      case 'p': case 'P': case 'Escape': this.togglePause(); event.preventDefault(); break;
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
    // Exact Grid Tile Physics Logic
    // 1. Check if centered on current tile to turn
    const isAtTileCenter = Math.abs(this.playerSubX) < 0.05 && Math.abs(this.playerSubY) < 0.05;

    if (isAtTileCenter) {
      this.playerSubX = 0;
      this.playerSubY = 0;

      if (this.canMoveTile(this.playerGridX, this.playerGridY, this.playerNextDir)) {
        this.playerDir = this.playerNextDir;
      }
    }

    // 2. Advance player movement if direction is open
    if (this.canMoveTile(this.playerGridX, this.playerGridY, this.playerDir)) {
      if (this.playerDir === 'RIGHT') {
        this.playerSubX += this.playerSpeed;
        if (this.playerSubX >= 1.0) {
          this.playerGridX++;
          this.playerSubX = 0;
        }
      } else if (this.playerDir === 'LEFT') {
        this.playerSubX -= this.playerSpeed;
        if (this.playerSubX <= -1.0) {
          this.playerGridX--;
          this.playerSubX = 0;
        }
      } else if (this.playerDir === 'DOWN') {
        this.playerSubY += this.playerSpeed;
        if (this.playerSubY >= 1.0) {
          this.playerGridY++;
          this.playerSubY = 0;
        }
      } else if (this.playerDir === 'UP') {
        this.playerSubY -= this.playerSpeed;
        if (this.playerSubY <= -1.0) {
          this.playerGridY--;
          this.playerSubY = 0;
        }
      }

      // Tunnel Wrap
      if (this.playerGridX < 0) this.playerGridX = 18;
      if (this.playerGridX > 18) this.playerGridX = 0;
    } else {
      // Blocked by wall: stop exact sub-pixel drift
      this.playerSubX = 0;
      this.playerSubY = 0;
    }

    // Eat dots
    const currentTile = this.currentGrid[this.playerGridY]?.[this.playerGridX];
    if (currentTile === 2) {
      this.currentGrid[this.playerGridY][this.playerGridX] = 0;
      this.score.update(s => s + 10);
      this.remainingPellets.update(r => Math.max(0, r - 1));
      this.audioService.playSfx('eatDot');
    } else if (currentTile === 3) {
      this.currentGrid[this.playerGridY][this.playerGridX] = 0;
      this.score.update(s => s + 50);
      this.remainingPellets.update(r => Math.max(0, r - 1));
      this.triggerFrightenedMode();
      this.audioService.playSfx('eatPower');
    } else if (currentTile === 5) {
      this.currentGrid[this.playerGridY][this.playerGridX] = 0;
      this.score.update(s => s + 200);
      this.audioService.playSfx('eatFruit');
    }

    // Highscore
    if (this.score() > this.highScore()) {
      this.highScore.set(this.score());
      localStorage.setItem('maze_muncher_highscore', this.score().toString());
    }

    // Level Clear
    if (this.remainingPellets() <= 0) {
      this.setGameState('LEVEL_COMPLETE');
      return;
    }

    // Frightened timer
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= 1 / 60;
      if (this.frightenedTimer <= 0) {
        this.ghosts.forEach(g => g.isFrightened = false);
      }
    }

    // Update Ghost AI
    this.updateGhostAI();

    // Collision check
    for (const ghost of this.ghosts) {
      const dist = Math.hypot(
        (this.playerGridX + this.playerSubX) - (ghost.gridX + ghost.subX),
        (this.playerGridY + this.playerSubY) - (ghost.gridY + ghost.subY)
      );

      if (dist < 0.75) {
        if (ghost.isFrightened && !ghost.isEaten) {
          ghost.isEaten = true;
          ghost.isFrightened = false;
          this.score.update(s => s + 200 * this.ghostsEatenMultiplier);
          this.ghostsEatenMultiplier *= 2;
          this.audioService.playSfx('eatGhost');
        } else if (!ghost.isFrightened && !ghost.isEaten) {
          this.audioService.playSfx('death');
          this.lives.update(l => l - 1);
          if (this.lives() <= 0) {
            this.setGameState('GAME_OVER');
          } else {
            this.playerGridX = 9;
            this.playerGridY = 16;
            this.playerSubX = 0;
            this.playerSubY = 0;
            this.playerDir = 'NONE';
            this.playerNextDir = 'NONE';
            this.ghosts.forEach(g => {
              g.gridX = g.homeX; g.gridY = g.homeY;
              g.subX = 0; g.subY = 0;
              g.isFrightened = false; g.isEaten = false;
            });
          }
          break;
        }
      }
    }
  }

  private triggerFrightenedMode() {
    this.frightenedTimer = this.levels[this.currentLevelIndex()].frightenedDuration;
    this.ghostsEatenMultiplier = 1;
    this.ghosts.forEach(g => { if (!g.isEaten) g.isFrightened = true; });
  }

  private updateGhostAI() {
    this.ghosts.forEach(ghost => {
      if (ghost.isEaten) {
        ghost.targetX = ghost.homeX;
        ghost.targetY = ghost.homeY;
        if (ghost.gridX === ghost.homeX && ghost.gridY === ghost.homeY) {
          ghost.isEaten = false;
        }
      } else if (ghost.isFrightened) {
        ghost.targetX = Math.floor(Math.random() * 19);
        ghost.targetY = Math.floor(Math.random() * 21);
      } else {
        // AI Rules
        if (ghost.id === 'blinky') {
          ghost.targetX = this.playerGridX;
          ghost.targetY = this.playerGridY;
        } else if (ghost.id === 'pinky') {
          ghost.targetX = this.playerGridX + 2;
          ghost.targetY = this.playerGridY;
        } else if (ghost.id === 'inky') {
          ghost.targetX = this.playerGridX;
          ghost.targetY = this.playerGridY - 2;
        } else {
          ghost.targetX = ghost.scatterX;
          ghost.targetY = ghost.scatterY;
        }
      }

      // Ghost Grid Turning at Tile Center
      const isGhostAtCenter = Math.abs(ghost.subX) < 0.05 && Math.abs(ghost.subY) < 0.05;

      if (isGhostAtCenter) {
        ghost.subX = 0;
        ghost.subY = 0;

        const validDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => {
          if (d === this.getOppositeDirection(ghost.dir)) return false;
          return this.canMoveTile(ghost.gridX, ghost.gridY, d as Direction);
        }) as Direction[];

        if (validDirs.length > 0) {
          let bestDir = validDirs[0];
          let minDistance = Infinity;

          validDirs.forEach(d => {
            const delta = this.getDelta(d);
            const nextX = ghost.gridX + delta.dx;
            const nextY = ghost.gridY + delta.dy;
            const dist = Math.hypot(nextX - ghost.targetX, nextY - ghost.targetY);
            if (dist < minDistance) {
              minDistance = dist;
              bestDir = d;
            }
          });

          ghost.dir = bestDir;
        }
      }

      // Advance ghost sub-pixel
      const speed = ghost.isFrightened ? ghost.speed * 0.6 : ghost.speed;
      if (ghost.dir === 'RIGHT') { ghost.subX += speed; if (ghost.subX >= 1.0) { ghost.gridX++; ghost.subX = 0; } }
      else if (ghost.dir === 'LEFT') { ghost.subX -= speed; if (ghost.subX <= -1.0) { ghost.gridX--; ghost.subX = 0; } }
      else if (ghost.dir === 'DOWN') { ghost.subY += speed; if (ghost.subY >= 1.0) { ghost.gridY++; ghost.subY = 0; } }
      else if (ghost.dir === 'UP') { ghost.subY -= speed; if (ghost.subY <= -1.0) { ghost.gridY--; ghost.subY = 0; } }

      // Ghost Tunnel Wrap
      if (ghost.gridX < 0) ghost.gridX = 18;
      if (ghost.gridX > 18) ghost.gridX = 0;
    });
  }

  private canMoveTile(gx: number, gy: number, dir: Direction): boolean {
    if (dir === 'NONE') return false;
    const delta = this.getDelta(dir);
    const targetX = gx + delta.dx;
    const targetY = gy + delta.dy;

    if (targetY < 0 || targetY >= this.currentGrid.length || targetX < 0 || targetX >= this.currentGrid[0].length) {
      return targetY === 10; // Tunnel Row
    }

    return this.currentGrid[targetY][targetX] !== 1; // 1 is solid wall
  }

  private getDelta(dir: Direction): { dx: number; dy: number } {
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

    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Map Walls & Pellets
    for (let r = 0; r < this.currentGrid.length; r++) {
      for (let c = 0; c < this.currentGrid[r].length; c++) {
        const tile = this.currentGrid[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === 1) { // Solid Arcade Wall
          this.ctx.fillStyle = '#1e40af';
          this.ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          this.ctx.strokeStyle = '#3b82f6';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        } else if (tile === 2) { // Dot
          this.ctx.fillStyle = '#fde047';
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 3.5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === 3) { // Power Pellet
          this.ctx.fillStyle = '#facc15';
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 8.5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === 4) { // Door
          this.ctx.fillStyle = '#f472b6';
          this.ctx.fillRect(x + 2, y + TILE_SIZE / 2 - 2, TILE_SIZE - 4, 4);
        } else if (tile === 5) { // Cherry
          this.ctx.font = '20px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('🍒', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }
      }
    }

    // Draw Pacman
    const px = (this.playerGridX + this.playerSubX) * TILE_SIZE + TILE_SIZE / 2;
    const py = (this.playerGridY + this.playerSubY) * TILE_SIZE + TILE_SIZE / 2;

    this.ctx.fillStyle = '#facc15';
    this.ctx.beginPath();
    let angle = 0;
    if (this.playerDir === 'DOWN') angle = Math.PI / 2;
    if (this.playerDir === 'LEFT') angle = Math.PI;
    if (this.playerDir === 'UP') angle = -Math.PI / 2;

    this.ctx.arc(px, py, 12, angle + 0.2, angle + Math.PI * 2 - 0.2);
    this.ctx.lineTo(px, py);
    this.ctx.fill();

    // Draw Emoji Caricature Ghosts
    this.ctx.font = '22px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ghosts.forEach(ghost => {
      const gx = (ghost.gridX + ghost.subX) * TILE_SIZE + TILE_SIZE / 2;
      const gy = (ghost.gridY + ghost.subY) * TILE_SIZE + TILE_SIZE / 2;

      const emojiStr = ghost.isEaten ? '👀' : (ghost.isFrightened ? ghost.frightenedEmoji : ghost.emoji);
      this.ctx.fillText(emojiStr, gx, gy);
    });
  }
}
