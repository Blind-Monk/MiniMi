import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { ChessPieceBuilder } from './chess-piece-builder';
import { ChessEnvironmentBuilder, BoardTheme } from './chess-environment-builder';
import { ChessRulesEngine, Move, PieceColor, PieceType } from './chess-rules-engine';
import { ChessAI, AIDifficulty } from './chess-ai';
import { AudioService } from '../../../core/services/audio.service';
import { ResponsiveUtil } from '../../../core/utils/responsive.util';

export type ScreenState = 'title' | 'menu' | 'setup' | 'settings' | 'tutorial' | 'leaderboard' | 'credits' | 'game';

@Component({
  selector: 'app-chess3d',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-6xl mx-auto space-y-4 shadow-2xl font-sans relative overflow-hidden select-none">

      <!-- Screen 1: Title Screen -->
      @if (currentScreen() === 'title') {
        <div class="relative w-full aspect-[16/9] max-h-[600px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-amber-500/30 overflow-hidden flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div class="space-y-2 animate-fade-in">
            <div class="text-6xl mb-2">👑 🐘 🧙 🐴 🛡️</div>
            <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 tracking-wider">
              3D BATTLE CHESS
            </h1>
            <p class="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Reimagined 3D Chess with stylized character coins, dynamic particle battle animations, Lofi soundtrack, and Minimax AI.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button (click)="navigateTo('menu')" class="flex-1 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 font-extrabold rounded-xl text-lg shadow-xl shadow-amber-500/10 transition-all hover:scale-105">
              🎮 PLAY NOW
            </button>
            <button (click)="navigateTo('tutorial')" class="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-base border border-slate-700 transition-all">
              📖 TUTORIAL
            </button>
          </div>
        </div>
      }

      <!-- Screen 2: Main Menu -->
      @if (currentScreen() === 'menu') {
        <div class="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 max-w-2xl mx-auto">
          <div class="text-center space-y-1">
            <h2 class="text-2xl font-black text-amber-400">3D BATTLE CHESS</h2>
            <p class="text-xs text-slate-400">Main Menu</p>
          </div>

          <div class="grid grid-cols-1 gap-3">
            <button (click)="navigateTo('setup')" class="p-3.5 bg-indigo-600 hover:bg-indigo-500 font-extrabold rounded-xl text-left flex items-center justify-between text-white shadow">
              <span>► New Game</span>
              <span class="text-xs bg-indigo-800/60 px-2 py-1 rounded">Setup Match</span>
            </button>
            <button (click)="startQuickMatch()" class="p-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-left flex items-center justify-between text-slate-200 border border-slate-700">
              <span>► Quick Play vs AI</span>
              <span class="text-xs text-amber-400 font-bold">Medium AI</span>
            </button>
            <button (click)="navigateTo('settings')" class="p-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-left flex items-center justify-between text-slate-200 border border-slate-700">
              <span>⚙️ Settings</span>
              <span class="text-xs text-slate-400">Audio & Visuals</span>
            </button>
            <button (click)="navigateTo('tutorial')" class="p-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-left flex items-center justify-between text-slate-200 border border-slate-700">
              <span>🎓 Tutorial / Showcase</span>
              <span class="text-xs text-slate-400">Learn Moves & Piece Rules</span>
            </button>
            <button (click)="navigateTo('leaderboard')" class="p-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-left flex items-center justify-between text-slate-200 border border-slate-700">
              <span>🏆 Leaderboard & Stats</span>
              <span class="text-xs text-slate-400">Records</span>
            </button>
            <button (click)="navigateTo('credits')" class="p-3.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-left flex items-center justify-between text-slate-200 border border-slate-700">
              <span>📜 Credits</span>
              <span class="text-xs text-slate-400">Game Info</span>
            </button>
          </div>
        </div>
      }

      <!-- Screen 3: New Game Setup -->
      @if (currentScreen() === 'setup') {
        <div class="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 max-w-2xl mx-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 class="text-xl font-extrabold text-amber-400">New Game Setup</h2>
            <button (click)="navigateTo('menu')" class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
              ← Back
            </button>
          </div>

          <div class="space-y-4 text-xs font-semibold">
            <!-- Mode -->
            <div>
              <label class="block text-slate-400 mb-1">Game Mode</label>
              <div class="grid grid-cols-2 gap-2">
                <button (click)="vsAI.set(true)" [class.bg-indigo-600]="vsAI()" [class.bg-slate-800]="!vsAI()" class="p-2.5 rounded-lg font-bold border border-slate-700">
                  🤖 Player vs AI
                </button>
                <button (click)="vsAI.set(false)" [class.bg-indigo-600]="!vsAI()" [class.bg-slate-800]="vsAI()" class="p-2.5 rounded-lg font-bold border border-slate-700">
                  👥 Local 2 Players
                </button>
              </div>
            </div>

            <!-- AI Difficulty -->
            @if (vsAI()) {
              <div>
                <label class="block text-slate-400 mb-1">AI Difficulty</label>
                <div class="grid grid-cols-4 gap-2">
                  @for (diff of difficultyOptions; track diff) {
                    <button (click)="aiDifficulty.set(diff)" [class.bg-amber-600]="aiDifficulty() === diff" [class.bg-slate-800]="aiDifficulty() !== diff" class="p-2 rounded-lg capitalize font-bold border border-slate-700">
                      {{ diff }}
                    </button>
                  }
                </div>
              </div>
            }

            <!-- Player Side -->
            <div>
              <label class="block text-slate-400 mb-1">Your Side</label>
              <div class="grid grid-cols-2 gap-2">
                <button (click)="playerColor.set('w')" [class.bg-amber-600]="playerColor() === 'w'" [class.bg-slate-800]="playerColor() !== 'w'" class="p-2.5 rounded-lg font-bold border border-slate-700">
                  ♔ White (Moves First)
                </button>
                <button (click)="playerColor.set('b')" [class.bg-indigo-600]="playerColor() === 'b'" [class.bg-slate-800]="playerColor() !== 'b'" class="p-2.5 rounded-lg font-bold border border-slate-700">
                  ♚ Black
                </button>
              </div>
            </div>

            <!-- Board Theme -->
            <div>
              <label class="block text-slate-400 mb-1">Board Environment Theme</label>
              <div class="grid grid-cols-4 gap-2">
                @for (theme of themeOptions; track theme) {
                  <button (click)="selectedTheme.set(theme)" [class.bg-indigo-600]="selectedTheme() === theme" [class.bg-slate-800]="selectedTheme() !== theme" class="p-2 rounded-lg capitalize font-bold border border-slate-700">
                    {{ theme }}
                  </button>
                }
              </div>
            </div>

            <button (click)="startGame()" class="w-full py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 font-extrabold rounded-xl text-base shadow-xl transition-all">
              ⚔️ START GAME
            </button>
          </div>
        </div>
      }

      <!-- Screen 4: Settings -->
      @if (currentScreen() === 'settings') {
        <div class="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 max-w-xl mx-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 class="text-xl font-extrabold text-amber-400">Settings</h2>
            <button (click)="navigateTo('menu')" class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
              ← Back
            </button>
          </div>

          <div class="space-y-4 text-xs">
            <div class="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <span>Show Legal Move Hints</span>
              <input type="checkbox" [ngModel]="showHints()" (ngModelChange)="showHints.set($event)" class="w-4 h-4 accent-amber-500">
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
              <span>Cinematic Battle Animations</span>
              <input type="checkbox" [ngModel]="enableBattleAnims()" (ngModelChange)="enableBattleAnims.set($event)" class="w-4 h-4 accent-amber-500">
            </div>
          </div>
        </div>
      }

      <!-- Screen 5: Tutorial -->
      @if (currentScreen() === 'tutorial') {
        <div class="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 max-w-3xl mx-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 class="text-xl font-extrabold text-amber-400">Piece Showcase & Movement Rules</h2>
            <button (click)="navigateTo('menu')" class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
              ← Back
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1">
              <span class="text-lg">👑 <b>King</b> (Royal Monarch)</span>
              <p class="text-slate-300">Moves 1 square in any direction. Must be protected at all costs to avoid checkmate.</p>
            </div>
            <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1">
              <span class="text-lg">👸 <b>Queen</b> (Empress/Sorceress)</span>
              <p class="text-slate-300">Moves any number of squares diagonally, horizontally, or vertically. The most powerful piece.</p>
            </div>
            <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1">
              <span class="text-lg">🐘 <b>Rook</b> (War Elephant)</span>
              <p class="text-slate-300">Moves horizontally or vertically any number of squares. Participates in castling.</p>
            </div>
            <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1">
              <span class="text-lg">🧙 <b>Bishop</b> (Wizard)</span>
              <p class="text-slate-300">Moves diagonally any number of squares. Stays on its starting square color.</p>
            </div>
            <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1">
              <span class="text-lg">🐴 <b>Knight</b> (Armored Warhorse)</span>
              <p class="text-slate-300">Moves in an 'L' shape (2 steps + 1 step perpendicular). Can jump over other pieces.</p>
            </div>
            <div class="bg-slate-800/70 p-3 rounded-xl border border-slate-700 space-y-1">
              <span class="text-lg">🛡️ <b>Pawn</b> (Foot Soldier)</span>
              <p class="text-slate-300">Moves 1 step forward (2 on first move) and captures 1 step diagonally. Can promote at rank 8.</p>
            </div>
          </div>
        </div>
      }

      <!-- Screen 6: Leaderboard -->
      @if (currentScreen() === 'leaderboard') {
        <div class="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6 max-w-xl mx-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 class="text-xl font-extrabold text-amber-400">Leaderboard & Local Records</h2>
            <button (click)="navigateTo('menu')" class="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700">
              ← Back
            </button>
          </div>

          <div class="space-y-3 text-xs">
            <div class="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
              <span>Matches Played</span>
              <span class="font-bold text-amber-400">{{ matchesPlayed() }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
              <span>Wins vs AI</span>
              <span class="font-bold text-emerald-400">{{ aiWins() }}</span>
            </div>
            <div class="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
              <span>Checkmates Executed</span>
              <span class="font-bold text-indigo-400">{{ checkmates() }}</span>
            </div>
          </div>
        </div>
      }

      <!-- Screen 7: Credits -->
      @if (currentScreen() === 'credits') {
        <div class="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-4 max-w-md mx-auto text-center">
          <h2 class="text-xl font-extrabold text-amber-400">Credits</h2>
          <p class="text-xs text-slate-300 leading-relaxed">
            <b>3D Battle Chess</b> built for Minimi Web Suite using Angular standalone signals, Three.js 3D rendering, procedural materials, and Minimax AI search with Alpha-Beta pruning.
          </p>
          <button (click)="navigateTo('menu')" class="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold border border-slate-700">
            ← Back to Menu
          </button>
        </div>
      }

      <!-- Screen 8: Main 3D Game Play Viewport -->
      @if (currentScreen() === 'game') {
        <!-- Top HUD -->
        <div class="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 gap-3 text-xs">
          <div class="flex items-center gap-3">
            <button (click)="navigateTo('menu')" class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-bold border border-slate-700">
              🏠 Menu
            </button>
            <div>
              <h2 class="text-sm font-extrabold text-amber-400">3D BATTLE CHESS</h2>
              <p class="text-[10px] text-slate-400">
                {{ vsAI() ? 'vs AI (' + aiDifficulty() + ')' : 'Local 2 Players' }} • Theme: {{ selectedTheme() }}
              </p>
            </div>
          </div>

          <!-- Turn & Captured Tray -->
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
              <span class="text-slate-400 font-bold">Turn:</span>
              <span [class.text-amber-300]="currentTurn() === 'w'" [class.text-indigo-400]="currentTurn() === 'b'" class="font-black uppercase">
                {{ currentTurn() === 'w' ? '♔ White' : '♚ Black' }}
              </span>
            </div>

            <div class="text-slate-400">
              Captured: <span class="text-amber-300 font-bold">{{ capturedWhite().length }}</span> W | <span class="text-indigo-400 font-bold">{{ capturedBlack().length }}</span> B
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="toggleFullscreen()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold border border-slate-700">
              ⛶
            </button>
            <button (click)="restartGame()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold text-slate-950 shadow">
              🔄 New Match
            </button>
          </div>
        </div>

        <div #gameContainer class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <!-- 3D Canvas Viewport -->
          <div class="lg:col-span-3 relative aspect-[16/9] min-h-[420px] max-h-[580px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
            <canvas #canvas class="w-full h-full block cursor-pointer"></canvas>

            <div class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 pointer-events-none">
              🎯 Drag mouse to Orbit Camera • Scroll to Zoom • Click tile to move
            </div>

            @if (statusMessage()) {
              <div class="absolute top-4 bg-amber-500 text-slate-950 font-black px-6 py-2 rounded-xl shadow-2xl text-sm animate-bounce">
                {{ statusMessage() }}
              </div>
            }

            <!-- Promotion Modal -->
            @if (pendingPromotion()) {
              <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 space-y-4">
                <h3 class="text-lg font-black text-amber-400">Choose Pawn Promotion</h3>
                <div class="flex gap-3">
                  <button (click)="promotePawn('q')" class="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 font-extrabold rounded-xl shadow text-sm">
                    👸 Queen
                  </button>
                  <button (click)="promotePawn('r')" class="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 font-extrabold rounded-xl shadow text-sm">
                    🐘 Rook
                  </button>
                  <button (click)="promotePawn('b')" class="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 font-extrabold rounded-xl shadow text-sm">
                    🧙 Bishop
                  </button>
                  <button (click)="promotePawn('n')" class="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 font-extrabold rounded-xl shadow text-sm">
                    🐴 Knight
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Move History Side Panel -->
          <div class="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between space-y-3 h-[420px] lg:h-auto text-xs">
            <div>
              <h3 class="font-extrabold text-slate-300 border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
                <span>📜 Move Log</span>
                <span class="text-[10px] text-slate-500">Algebraic</span>
              </h3>
              <div class="overflow-y-auto max-h-[320px] space-y-1 font-mono text-[11px] text-slate-300 pr-1">
                @for (m of moveLog(); track $index) {
                  <div class="flex justify-between px-2 py-1 bg-slate-950/40 rounded border border-slate-800/50">
                    <span class="text-slate-500">{{ $index + 1 }}.</span>
                    <span class="font-bold text-amber-300">{{ m }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="pt-2 border-t border-slate-800 flex gap-2">
              <button (click)="requestHint()" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg text-center text-white">
                💡 AI Hint
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class Chess3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gameContainer') containerRef!: ElementRef<HTMLDivElement>;

  private audioService = inject(AudioService);

  readonly difficultyOptions: AIDifficulty[] = ['easy', 'medium', 'hard', 'grandmaster'];
  readonly themeOptions: BoardTheme[] = ['marble', 'battlefield', 'arcane', 'classic'];

  currentScreen = signal<ScreenState>('title');
  vsAI = signal<boolean>(true);
  aiDifficulty = signal<AIDifficulty>('medium');
  playerColor = signal<PieceColor>('w');
  selectedTheme = signal<BoardTheme>('marble');

  showHints = signal<boolean>(true);
  enableBattleAnims = signal<boolean>(true);

  matchesPlayed = signal<number>(0);
  aiWins = signal<number>(0);
  checkmates = signal<number>(0);

  currentTurn = signal<PieceColor>('w');
  statusMessage = signal<string | null>(null);
  capturedWhite = signal<string[]>([]);
  capturedBlack = signal<string[]>([]);
  moveLog = signal<string[]>([]);
  pendingPromotion = signal<Move | null>(null);

  private rulesEngine = new ChessRulesEngine();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animFrameId: number = 0;

  private boardTiles: THREE.Mesh[] = [];
  private pieceMeshMap = new Map<string, THREE.Group>();
  private highlightMeshes: THREE.Mesh[] = [];
  private selectedSquare: { row: number; col: number } | null = null;

  private activeParticles: { mesh: THREE.Points; velocity: THREE.Vector3[]; life: number }[] = [];

  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private cameraAngleX = 0;
  private cameraAngleY = 0.8;
  private cameraDistance = 11;

  ngAfterViewInit() {
    this.audioService.startPlaylist('chill-lofi');
    if (this.currentScreen() === 'game') {
      setTimeout(() => this.initGameScene(), 50);
    }
  }

  navigateTo(screen: ScreenState) {
    this.audioService.playClickSound();
    this.currentScreen.set(screen);
    if (screen === 'game') {
      setTimeout(() => this.initGameScene(), 50);
    }
  }

  toggleFullscreen() {
    if (this.containerRef) {
      ResponsiveUtil.toggleFullscreen(this.containerRef.nativeElement);
    }
  }

  startQuickMatch() {
    this.vsAI.set(true);
    this.aiDifficulty.set('medium');
    this.playerColor.set('w');
    this.navigateTo('game');
  }

  startGame() {
    this.navigateTo('game');
  }

  restartGame() {
    this.audioService.playClickSound();
    this.rulesEngine.resetBoard();
    this.currentTurn.set('w');
    this.statusMessage.set(null);
    this.capturedWhite.set([]);
    this.capturedBlack.set([]);
    this.moveLog.set([]);
    this.selectedSquare = null;
    this.clearHighlights();
    this.syncBoardMeshes();

    if (this.vsAI() && this.currentTurn() !== this.playerColor()) {
      setTimeout(() => this.makeAIMove(), 600);
    }
  }

  private initGameScene() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d16);

    this.camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.updateCameraPosition();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.setPixelRatio(ResponsiveUtil.getClampedPixelRatio());
    this.renderer.shadowMap.enabled = true;

    ChessEnvironmentBuilder.setupLighting(this.scene, this.selectedTheme());
    const { tiles, boardGroup } = ChessEnvironmentBuilder.createBoardTiles(this.selectedTheme());
    this.boardTiles = tiles;
    this.scene.add(boardGroup);

    this.syncBoardMeshes();

    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    canvas.addEventListener('mouseup', () => this.onMouseUp());
    canvas.addEventListener('wheel', (e) => this.onWheel(e));
    canvas.addEventListener('click', (e) => this.onCanvasClick(e));

    this.startLoop();
  }

  private updateCameraPosition() {
    const x = this.cameraDistance * Math.sin(this.cameraAngleX) * Math.cos(this.cameraAngleY);
    const y = this.cameraDistance * Math.sin(this.cameraAngleY);
    const z = this.cameraDistance * Math.cos(this.cameraAngleX) * Math.cos(this.cameraAngleY);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  private syncBoardMeshes() {
    this.pieceMeshMap.forEach(mesh => this.scene.remove(mesh));
    this.pieceMeshMap.clear();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.rulesEngine.getPiece(r, c);
        if (piece) {
          const mesh = ChessPieceBuilder.buildPiece(piece.type, piece.color);
          mesh.position.set(c - 3.5, 0, r - 3.5);
          this.scene.add(mesh);
          this.pieceMeshMap.set(`${r},${c}`, mesh);
        }
      }
    }
  }

  private triggerBattleCaptureAnimation(attackerType: PieceType, targetPos: THREE.Vector3) {
    if (!this.enableBattleAnims()) return;

    const particleCount = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = targetPos.x;
      positions[i * 3 + 1] = targetPos.y + 0.3;
      positions[i * 3 + 2] = targetPos.z;

      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        Math.random() * 0.2 + 0.1,
        (Math.random() - 0.5) * 0.15
      ));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: attackerType === 'b' || attackerType === 'q' ? 0xa855f7 : 0xf59e0b,
      size: 0.08,
      transparent: true,
      opacity: 1.0
    });

    const pSystem = new THREE.Points(geometry, material);
    this.scene.add(pSystem);
    this.activeParticles.push({ mesh: pSystem, velocity: velocities, life: 1.0 });
  }

  private updateParticles() {
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life -= 0.04;

      const positions = p.mesh.geometry.attributes['position'].array as Float32Array;
      for (let j = 0; j < p.velocity.length; j++) {
        positions[j * 3] += p.velocity[j].x;
        positions[j * 3 + 1] += p.velocity[j].y;
        positions[j * 3 + 2] += p.velocity[j].z;
        p.velocity[j].y -= 0.008;
      }
      p.mesh.geometry.attributes['position'].needsUpdate = true;

      (p.mesh.material as THREE.PointsMaterial).opacity = p.life;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.activeParticles.splice(i, 1);
      }
    }
  }

  private onMouseDown(e: MouseEvent) {
    if (e.button === 2 || e.shiftKey) {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    const deltaX = e.clientX - this.previousMousePosition.x;
    const deltaY = e.clientY - this.previousMousePosition.y;

    this.cameraAngleX -= deltaX * 0.008;
    this.cameraAngleY = Math.max(0.2, Math.min(Math.PI / 2 - 0.1, this.cameraAngleY + deltaY * 0.008));

    this.updateCameraPosition();
    this.previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  private onMouseUp() {
    this.isDragging = false;
  }

  private onWheel(e: WheelEvent) {
    this.cameraDistance = Math.max(5, Math.min(20, this.cameraDistance + e.deltaY * 0.01));
    this.updateCameraPosition();
  }

  private onCanvasClick(event: MouseEvent) {
    if (this.pendingPromotion() || (this.vsAI() && this.currentTurn() !== this.playerColor())) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const tileHits = this.raycaster.intersectObjects(this.boardTiles);

    if (tileHits.length > 0) {
      const tile = tileHits[0].object as THREE.Mesh;
      const { row, col } = tile.userData;
      const clickedPiece = this.rulesEngine.getPiece(row, col);

      if (this.selectedSquare) {
        if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
          this.selectedSquare = null;
          this.clearHighlights();
          return;
        }

        if (clickedPiece && clickedPiece.color === this.currentTurn()) {
          this.selectedSquare = { row, col };
          this.highlightMoves(row, col);
          return;
        }

        const legalMoves = this.rulesEngine.getLegalMoves(this.selectedSquare.row, this.selectedSquare.col, this.currentTurn());
        const move = legalMoves.find(m => m.toRow === row && m.toCol === col);

        if (move) {
          this.executeMove(move);
        } else {
          this.selectedSquare = null;
          this.clearHighlights();
        }
      } else if (clickedPiece && clickedPiece.color === this.currentTurn()) {
        this.selectedSquare = { row, col };
        this.highlightMoves(row, col);
      }
    }
  }

  private highlightMoves(r: number, c: number) {
    this.clearHighlights();
    if (!this.showHints()) return;

    const moves = this.rulesEngine.getLegalMoves(r, c, this.currentTurn());

    moves.forEach(m => {
      const isCap = !!m.capturedPiece;
      const ringGeo = new THREE.RingGeometry(0.15, 0.35, 16);
      ringGeo.rotateX(-Math.PI / 2);
      const mat = new THREE.MeshBasicMaterial({
        color: isCap ? 0xef4444 : 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, mat);
      ring.position.set(m.toCol - 3.5, 0.02, m.toRow - 3.5);
      this.scene.add(ring);
      this.highlightMeshes.push(ring);
    });
  }

  private clearHighlights() {
    this.highlightMeshes.forEach(h => this.scene.remove(h));
    this.highlightMeshes = [];
  }

  private executeMove(move: Move) {
    const piece = this.rulesEngine.getPiece(move.fromRow, move.fromCol);
    if (!piece) return;

    if (piece.type === 'p' && (move.toRow === 0 || move.toRow === 7)) {
      if (!this.vsAI() || piece.color === this.playerColor()) {
        this.pendingPromotion.set(move);
        return;
      }
    }

    this.processMoveExecution(move, 'q');
  }

  promotePawn(choice: PieceType) {
    const move = this.pendingPromotion();
    if (move) {
      this.pendingPromotion.set(null);
      this.processMoveExecution(move, choice);
    }
  }

  private processMoveExecution(move: Move, promotionChoice: PieceType = 'q') {
    const piece = this.rulesEngine.getPiece(move.fromRow, move.fromCol);
    if (!piece) return;

    if (move.capturedPiece) {
      this.triggerBattleCaptureAnimation(piece.type, new THREE.Vector3(move.toCol - 3.5, 0.1, move.toRow - 3.5));
    }

    const success = this.rulesEngine.makeMove(move, promotionChoice);
    if (!success) return;

    if (move.capturedPiece) {
      this.audioService.playExplosionSound();
    } else {
      this.audioService.playClickSound();
    }

    if (move.capturedPiece) {
      if (move.capturedPiece.color === 'w') {
        this.capturedWhite.update(c => [...c, move.capturedPiece!.type]);
      } else {
        this.capturedBlack.update(c => [...c, move.capturedPiece!.type]);
      }
    }

    this.moveLog.update(log => [...log, move.notation || '']);
    this.syncBoardMeshes();
    this.selectedSquare = null;
    this.clearHighlights();

    const nextTurn: PieceColor = this.currentTurn() === 'w' ? 'b' : 'w';
    this.currentTurn.set(nextTurn);

    if (this.rulesEngine.isCheckmate(nextTurn)) {
      this.statusMessage.set(`CHECKMATE! ${this.currentTurn() === 'w' ? 'Black' : 'White'} Wins!`);
      this.audioService.playCoinSound();
      this.matchesPlayed.update(m => m + 1);
      this.checkmates.update(c => c + 1);
      if (this.vsAI() && this.currentTurn() !== this.playerColor()) {
        this.aiWins.update(w => w + 1);
      }
      return;
    } else if (this.rulesEngine.isStalemate(nextTurn)) {
      this.statusMessage.set('STALEMATE! Game Draw!');
      return;
    } else if (this.rulesEngine.isKingInCheck(nextTurn)) {
      this.statusMessage.set('CHECK!');
      setTimeout(() => this.statusMessage.set(null), 1500);
    }

    if (this.vsAI() && this.currentTurn() !== this.playerColor()) {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  private makeAIMove() {
    const aiMove = ChessAI.getBestMove(this.rulesEngine, this.currentTurn(), this.aiDifficulty());
    if (aiMove) {
      this.executeMove(aiMove);
    }
  }

  requestHint() {
    const hintMove = ChessAI.getBestMove(this.rulesEngine, this.currentTurn(), 'hard');
    if (hintMove) {
      this.selectedSquare = { row: hintMove.fromRow, col: hintMove.fromCol };
      this.highlightMoves(hintMove.fromRow, hintMove.fromCol);
      this.statusMessage.set(`Hint: ${hintMove.notation}`);
      setTimeout(() => this.statusMessage.set(null), 2000);
    }
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.updateParticles();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
