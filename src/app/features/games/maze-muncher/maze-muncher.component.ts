import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';
type GhostMode = 'CHASE' | 'SCATTER' | 'FRIGHTENED' | 'EATEN';

interface Ghost {
  id: 'blinky' | 'pinky' | 'inky' | 'clyde';
  name: string;
  emoji: string;
  frightenedEmoji: string;
  color: string;
  gridX: number;
  gridY: number;
  subX: number; // -0.5 to 0.5 tile offset
  subY: number;
  dir: Direction;
  targetX: number;
  targetY: number;
  homeX: number;
  homeY: number;
  scatterX: number;
  scatterY: number;
  mode: GhostMode;
  speed: number;
  exitTimer: number; // Seconds until exiting ghost house
}

const COLS = 28;
const ROWS = 31;
const TILE_SIZE = 20; // 28 x 31 tiles = 560 x 620 px canvas

// Official Arcade Pac-Man Grid Layout (28 cols x 31 rows)
// 0: empty path, 1: solid wall, 2: dot, 3: power pellet, 4: ghost house door, 5: fruit spot
const CLASSIC_PACMAN_GRID: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,1,1,1,0,1,1,0,1,1,1,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,0,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,4,4,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,0,2,0,0,0,1,0,0,0,0,0,0,1,0,0,0,2,0,0,0,0,0,0], // Tunnel Row 14
  [1,1,1,1,1,1,2,1,1,0,1,0,0,0,0,0,0,1,0,1,1,2,1,1,1,1,1,1],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,0,0,0,5,0,0,0,0,0,1,1,2,1,0,0,0,0,0],
  [0,0,0,0,0,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,0,0,0,0,0],
  [1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
  [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,1,1,2,1,1,2,1,1,2,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1,1],
  [1,2,2,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,1,1,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
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
            <h2 class="text-xl font-black text-amber-400 tracking-wider">PAC-MAN MAZE MUNCHER</h2>
            <p class="text-xs text-slate-400">Authentic 28x31 Maze • Blinky, Pinky, Inky & Clyde AI</p>
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

        <!-- Live Status Bar -->
        <div *ngIf="gameState() === 'PLAYING' || gameState() === 'PAUSED'" class="w-full flex items-center justify-between px-2 pb-3 text-xs font-mono text-slate-300">
          <div class="flex items-center space-x-1">
            <span>Lives:</span>
            <span *ngFor="let life of getLivesArray()" class="text-amber-400 text-lg">🟡</span>
          </div>
          <div class="text-amber-300 font-bold text-sm">
            Level {{ level() }}: Arcade Mode
          </div>
          <div class="text-cyan-300">
            Dots Left: <strong>{{ remainingPellets() }}</strong>
          </div>
        </div>

        <!-- Canvas Display (560 x 620 px Arcade Ratio) -->
        <canvas #gameCanvas width="560" height="620" class="bg-slate-950 rounded-xl border-2 border-indigo-900/60 shadow-2xl max-w-full">
        </canvas>

        <!-- Overlay 1: MAIN MENU -->
        <div *ngIf="gameState() === 'MENU'" class="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
          <span class="text-6xl mb-1 animate-pulse">🟡 👻 🤡 👾 👺</span>
          <h1 class="text-3xl font-black text-amber-400 tracking-wider">PAC-MAN CLONE</h1>
          <p class="text-xs text-slate-300 max-w-md leading-relaxed">
            Classic 28×31 arcade tilemap! Outsmart all 4 ghosts:
            <br>🔴 <strong>Blinky:</strong> Direct Chaser | 🩷 <strong>Pinky:</strong> Ambush Target
            <br>🩵 <strong>Inky:</strong> Vector Flanker | 🟠 <strong>Clyde:</strong> Shy Roamer
          </p>

          <button (click)="startGame()" class="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-xl transform active:scale-95 transition">
            🎮 PLAY PAC-MAN
          </button>
        </div>

        <!-- Overlay 2: PAUSED -->
        <div *ngIf="gameState() === 'PAUSED'" class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-20">
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
        <div *ngIf="gameState() === 'LEVEL_COMPLETE'" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
          <span class="text-6xl animate-bounce">🍒</span>
          <h2 class="text-3xl font-black text-emerald-400">LEVEL CLEAR!</h2>
          <p class="text-xs text-slate-300">All dots eaten! Next level speed increase!</p>
          <button (click)="nextLevel()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-lg">
            Start Level {{ level() + 1 }} ➔
          </button>
        </div>

        <!-- Overlay 4: GAME OVER -->
        <div *ngIf="gameState() === 'GAME_OVER'" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4 z-20">
          <span class="text-6xl animate-pulse">💀</span>
          <h2 class="text-3xl font-black text-red-500">GAME OVER</h2>
          <p class="text-xs text-slate-300">Final Score: <strong class="text-amber-300 text-base">{{ score() }}</strong></p>
          <div class="flex space-x-3">
            <button (click)="startGame()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow">
              🔄 Try Again
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
  level = signal<number>(1);
  gameState = signal<'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER'>('MENU');
  remainingPellets = signal<number>(0);

  private ctx!: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private currentGrid: number[][] = [];

  // Pac-Man Player
  private playerGridX = 13;
  private playerGridY = 23;
  private playerSubX = 0;
  private playerSubY = 0;
  private playerDir: Direction = 'NONE';
  private playerNextDir: Direction = 'NONE';
  private playerSpeed = 0.12;
  private mouthAngle = 0.2;
  private mouthOpening = true;

  // Ghosts
  private ghosts: Ghost[] = [];
  private frightenedTimer = 0;
  private ghostEatPoints = 200;

  // Global Mode Timer (Alternates Scatter & Chase)
  private globalModeTimer = 0;
  private globalMode: 'SCATTER' | 'CHASE' = 'SCATTER';

  ngOnInit() {
    this.audioService.startPlaylist('arcade-retro');
    const savedHighScore = localStorage.getItem('pacman_highscore');
    if (savedHighScore) this.highScore.set(parseInt(savedHighScore, 10));
  }

  ngOnDestroy() {
    this.stopGameLoop();
    this.audioService.stopMusic();
  }

  getLivesArray(): number[] {
    return Array(Math.max(0, this.lives())).fill(0);
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

  startGame() {
    this.score.set(0);
    this.lives.set(3);
    this.level.set(1);
    this.initLevel();
    this.setGameState('PLAYING');
  }

  nextLevel() {
    this.level.update(l => l + 1);
    this.initLevel();
    this.setGameState('PLAYING');
  }

  private initLevel() {
    this.currentGrid = CLASSIC_PACMAN_GRID.map(row => [...row]);

    let dots = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.currentGrid[r][c] === 2 || this.currentGrid[r][c] === 3) dots++;
      }
    }
    this.remainingPellets.set(dots);

    // Reset Player
    this.playerGridX = 13;
    this.playerGridY = 23;
    this.playerSubX = 0;
    this.playerSubY = 0;
    this.playerDir = 'NONE';
    this.playerNextDir = 'NONE';

    const lvlSpeed = 0.08 + (this.level() - 1) * 0.01;

    // Ghosts
    this.ghosts = [
      {
        id: 'blinky', name: 'Blinky', emoji: '👻', frightenedEmoji: '🙀', color: '#ef4444',
        gridX: 13, gridY: 11, subX: 0, subY: 0, dir: 'LEFT',
        targetX: 13, targetY: 23, homeX: 13, homeY: 11, scatterX: 25, scatterY: 0,
        mode: 'SCATTER', speed: lvlSpeed, exitTimer: 0
      },
      {
        id: 'pinky', name: 'Pinky', emoji: '🤡', frightenedEmoji: '🙀', color: '#f472b6',
        gridX: 13, gridY: 14, subX: 0, subY: 0, dir: 'UP',
        targetX: 13, targetY: 23, homeX: 13, homeY: 14, scatterX: 2, scatterY: 0,
        mode: 'SCATTER', speed: lvlSpeed * 0.95, exitTimer: 2
      },
      {
        id: 'inky', name: 'Inky', emoji: '👾', frightenedEmoji: '🙀', color: '#22d3ee',
        gridX: 11, gridY: 14, subX: 0, subY: 0, dir: 'UP',
        targetX: 13, targetY: 23, homeX: 11, homeY: 14, scatterX: 27, scatterY: 30,
        mode: 'SCATTER', speed: lvlSpeed * 0.90, exitTimer: 5
      },
      {
        id: 'clyde', name: 'Clyde', emoji: '👺', frightenedEmoji: '🙀', color: '#fb923c',
        gridX: 15, gridY: 14, subX: 0, subY: 0, dir: 'UP',
        targetX: 13, targetY: 23, homeX: 15, homeY: 14, scatterX: 0, scatterY: 30,
        mode: 'SCATTER', speed: lvlSpeed * 0.85, exitTimer: 8
      }
    ];

    this.frightenedTimer = 0;
    this.ghostEatPoints = 200;
    this.globalModeTimer = 0;
    this.globalMode = 'SCATTER';
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
    // 1. Mouth Animation
    if (this.mouthOpening) {
      this.mouthAngle += 0.03;
      if (this.mouthAngle >= 0.45) this.mouthOpening = false;
    } else {
      this.mouthAngle -= 0.03;
      if (this.mouthAngle <= 0.05) this.mouthOpening = true;
    }

    // 2. Tile Snapping Turn Logic
    const isAtCenter = Math.abs(this.playerSubX) < 0.06 && Math.abs(this.playerSubY) < 0.06;

    if (isAtCenter) {
      this.playerSubX = 0;
      this.playerSubY = 0;

      if (this.canMoveTile(this.playerGridX, this.playerGridY, this.playerNextDir)) {
        this.playerDir = this.playerNextDir;
      }
    }

    // 3. Advance Player Movement
    if (this.canMoveTile(this.playerGridX, this.playerGridY, this.playerDir)) {
      if (this.playerDir === 'RIGHT') {
        this.playerSubX += this.playerSpeed;
        if (this.playerSubX >= 0.5) { this.playerGridX++; this.playerSubX = -0.5; }
      } else if (this.playerDir === 'LEFT') {
        this.playerSubX -= this.playerSpeed;
        if (this.playerSubX <= -0.5) { this.playerGridX--; this.playerSubX = 0.5; }
      } else if (this.playerDir === 'DOWN') {
        this.playerSubY += this.playerSpeed;
        if (this.playerSubY >= 0.5) { this.playerGridY++; this.playerSubY = -0.5; }
      } else if (this.playerDir === 'UP') {
        this.playerSubY -= this.playerSpeed;
        if (this.playerSubY <= -0.5) { this.playerGridY--; this.playerSubY = 0.5; }
      }

      // Tunnel Wrap-Around (Row 14)
      if (this.playerGridX < 0) this.playerGridX = COLS - 1;
      if (this.playerGridX >= COLS) this.playerGridX = 0;
    } else {
      this.playerSubX = 0;
      this.playerSubY = 0;
    }

    // 4. Dot & Power Pellet Collection
    const currentTile = this.currentGrid[this.playerGridY]?.[this.playerGridX];
    if (currentTile === 2) { // Dot
      this.currentGrid[this.playerGridY][this.playerGridX] = 0;
      this.score.update(s => s + 10);
      this.remainingPellets.update(r => Math.max(0, r - 1));
      this.audioService.playSfx('eatDot');
    } else if (currentTile === 3) { // Power Pellet
      this.currentGrid[this.playerGridY][this.playerGridX] = 0;
      this.score.update(s => s + 50);
      this.remainingPellets.update(r => Math.max(0, r - 1));
      this.triggerFrightenedMode();
      this.audioService.playSfx('eatPower');
    } else if (currentTile === 5) { // Fruit
      this.currentGrid[this.playerGridY][this.playerGridX] = 0;
      this.score.update(s => s + 200);
      this.audioService.playSfx('eatFruit');
    }

    // Highscore Update
    if (this.score() > this.highScore()) {
      this.highScore.set(this.score());
      localStorage.setItem('pacman_highscore', this.score().toString());
    }

    // Level Clear
    if (this.remainingPellets() <= 0) {
      this.setGameState('LEVEL_COMPLETE');
      return;
    }

    // 5. Global Scatter/Chase Mode Timers
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= 1 / 60;
      if (this.frightenedTimer <= 0) {
        this.ghosts.forEach(g => { if (g.mode === 'FRIGHTENED') g.mode = this.globalMode; });
      }
    } else {
      this.globalModeTimer += 1 / 60;
      if (this.globalMode === 'SCATTER' && this.globalModeTimer > 7) {
        this.globalMode = 'CHASE';
        this.globalModeTimer = 0;
        this.ghosts.forEach(g => { if (g.mode !== 'EATEN') g.mode = 'CHASE'; });
      } else if (this.globalMode === 'CHASE' && this.globalModeTimer > 20) {
        this.globalMode = 'SCATTER';
        this.globalModeTimer = 0;
        this.ghosts.forEach(g => { if (g.mode !== 'EATEN') g.mode = 'SCATTER'; });
      }
    }

    // 6. Ghost AI & Pathfinding
    this.updateGhostAI();

    // 7. Collision Detection (Pac-Man vs Ghost)
    for (const ghost of this.ghosts) {
      const dist = Math.hypot(
        (this.playerGridX + this.playerSubX) - (ghost.gridX + ghost.subX),
        (this.playerGridY + this.playerSubY) - (ghost.gridY + ghost.subY)
      );

      if (dist < 0.75) {
        if (ghost.mode === 'FRIGHTENED') {
          ghost.mode = 'EATEN';
          this.score.update(s => s + this.ghostEatPoints);
          this.ghostEatPoints *= 2;
          this.audioService.playSfx('eatGhost');
        } else if (ghost.mode === 'CHASE' || ghost.mode === 'SCATTER') {
          this.audioService.playSfx('death');
          this.lives.update(l => l - 1);

          if (this.lives() <= 0) {
            this.setGameState('GAME_OVER');
          } else {
            // Respawn positions
            this.playerGridX = 13;
            this.playerGridY = 23;
            this.playerSubX = 0;
            this.playerSubY = 0;
            this.playerDir = 'NONE';
            this.playerNextDir = 'NONE';

            this.ghosts.forEach(g => {
              g.gridX = g.homeX;
              g.gridY = g.homeY;
              g.subX = 0;
              g.subY = 0;
              g.mode = 'SCATTER';
            });
          }
          break;
        }
      }
    }
  }

  private triggerFrightenedMode() {
    this.frightenedTimer = 8;
    this.ghostEatPoints = 200;
    this.ghosts.forEach(g => {
      if (g.mode !== 'EATEN') {
        g.mode = 'FRIGHTENED';
        g.dir = this.getOppositeDirection(g.dir);
      }
    });
  }

  private updateGhostAI() {
    this.ghosts.forEach(ghost => {
      // Exit timers
      if (ghost.exitTimer > 0) {
        ghost.exitTimer -= 1 / 60;
        return;
      }

      // 1. Compute Target Tile according to personality
      if (ghost.mode === 'EATEN') {
        ghost.targetX = ghost.homeX;
        ghost.targetY = ghost.homeY;
        if (ghost.gridX === ghost.homeX && ghost.gridY === ghost.homeY) {
          ghost.mode = this.globalMode;
        }
      } else if (ghost.mode === 'FRIGHTENED') {
        ghost.targetX = Math.floor(Math.random() * COLS);
        ghost.targetY = Math.floor(Math.random() * ROWS);
      } else if (ghost.mode === 'SCATTER') {
        ghost.targetX = ghost.scatterX;
        ghost.targetY = ghost.scatterY;
      } else { // CHASE PERSONALITIES
        if (ghost.id === 'blinky') { // Blinky: Direct Chaser
          ghost.targetX = this.playerGridX;
          ghost.targetY = this.playerGridY;
        } else if (ghost.id === 'pinky') { // Pinky: 4 tiles ahead
          const delta = this.getDelta(this.playerDir);
          ghost.targetX = this.playerGridX + delta.dx * 4;
          ghost.targetY = this.playerGridY + delta.dy * 4;
        } else if (ghost.id === 'inky') { // Inky: Vector from Blinky to 2 ahead of Pac-Man
          const blinky = this.ghosts.find(g => g.id === 'blinky');
          const delta = this.getDelta(this.playerDir);
          const aheadX = this.playerGridX + delta.dx * 2;
          const aheadY = this.playerGridY + delta.dy * 2;
          if (blinky) {
            ghost.targetX = aheadX + (aheadX - blinky.gridX);
            ghost.targetY = aheadY + (aheadY - blinky.gridY);
          } else {
            ghost.targetX = this.playerGridX;
            ghost.targetY = this.playerGridY;
          }
        } else if (ghost.id === 'clyde') { // Clyde: Shy Roamer
          const distToPlayer = Math.hypot(ghost.gridX - this.playerGridX, ghost.gridY - this.playerGridY);
          if (distToPlayer > 8) {
            ghost.targetX = this.playerGridX;
            ghost.targetY = this.playerGridY;
          } else {
            ghost.targetX = ghost.scatterX;
            ghost.targetY = ghost.scatterY;
          }
        }
      }

      // 2. Turning at Intersection Center
      const isGhostAtCenter = Math.abs(ghost.subX) < 0.06 && Math.abs(ghost.subY) < 0.06;

      if (isGhostAtCenter) {
        ghost.subX = 0;
        ghost.subY = 0;

        const validDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(d => {
          if (d === this.getOppositeDirection(ghost.dir)) return false;
          return this.canMoveTile(ghost.gridX, ghost.gridY, d as Direction, true);
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

      // 3. Advance Ghost Sub-Tile Position
      const speed = ghost.mode === 'FRIGHTENED' ? ghost.speed * 0.5 : (ghost.mode === 'EATEN' ? ghost.speed * 1.8 : ghost.speed);
      if (ghost.dir === 'RIGHT') { ghost.subX += speed; if (ghost.subX >= 0.5) { ghost.gridX++; ghost.subX = -0.5; } }
      else if (ghost.dir === 'LEFT') { ghost.subX -= speed; if (ghost.subX <= -0.5) { ghost.gridX--; ghost.subX = 0.5; } }
      else if (ghost.dir === 'DOWN') { ghost.subY += speed; if (ghost.subY >= 0.5) { ghost.gridY++; ghost.subY = -0.5; } }
      else if (ghost.dir === 'UP') { ghost.subY -= speed; if (ghost.subY <= -0.5) { ghost.gridY--; ghost.subY = 0.5; } }

      // Tunnel Wrap
      if (ghost.gridX < 0) ghost.gridX = COLS - 1;
      if (ghost.gridX >= COLS) ghost.gridX = 0;
    });
  }

  private canMoveTile(gx: number, gy: number, dir: Direction, isGhost = false): boolean {
    if (dir === 'NONE') return false;
    const delta = this.getDelta(dir);
    const targetX = gx + delta.dx;
    const targetY = gy + delta.dy;

    if (targetY < 0 || targetY >= ROWS || targetX < 0 || targetX >= COLS) {
      return targetY === 14; // Tunnel Row
    }

    const tile = this.currentGrid[targetY][targetX];
    if (tile === 1) return false; // Solid wall
    if (tile === 4 && !isGhost) return false; // Ghost door impassable to Pacman

    return true;
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
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = this.currentGrid[r][c];
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if (tile === 1) { // Wall
          this.ctx.fillStyle = '#1e3a8a';
          this.ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          this.ctx.strokeStyle = '#3b82f6';
          this.ctx.lineWidth = 1.5;
          this.ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else if (tile === 2) { // Dot
          this.ctx.fillStyle = '#fde047';
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === 3) { // Power Pellet
          this.ctx.fillStyle = '#facc15';
          this.ctx.beginPath();
          this.ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 6.5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === 4) { // Ghost Door
          this.ctx.fillStyle = '#f472b6';
          this.ctx.fillRect(x + 1, y + TILE_SIZE / 2 - 1, TILE_SIZE - 2, 3);
        } else if (tile === 5) { // Fruit
          this.ctx.font = '14px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('🍒', x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }
      }
    }

    // Draw Pac-Man
    const px = (this.playerGridX + this.playerSubX) * TILE_SIZE + TILE_SIZE / 2;
    const py = (this.playerGridY + this.playerSubY) * TILE_SIZE + TILE_SIZE / 2;

    this.ctx.fillStyle = '#facc15';
    this.ctx.beginPath();
    let angle = 0;
    if (this.playerDir === 'DOWN') angle = Math.PI / 2;
    if (this.playerDir === 'LEFT') angle = Math.PI;
    if (this.playerDir === 'UP') angle = -Math.PI / 2;

    this.ctx.arc(px, py, 9, angle + this.mouthAngle, angle + Math.PI * 2 - this.mouthAngle);
    this.ctx.lineTo(px, py);
    this.ctx.fill();

    // Draw Ghosts
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.ghosts.forEach(ghost => {
      const gx = (ghost.gridX + ghost.subX) * TILE_SIZE + TILE_SIZE / 2;
      const gy = (ghost.gridY + ghost.subY) * TILE_SIZE + TILE_SIZE / 2;

      let emojiStr = ghost.emoji;
      if (ghost.mode === 'EATEN') emojiStr = '👀';
      else if (ghost.mode === 'FRIGHTENED') emojiStr = ghost.frightenedEmoji;

      this.ctx.fillText(emojiStr, gx, gy);
    });
  }
}
