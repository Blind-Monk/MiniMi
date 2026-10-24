import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule as NgFormsModule } from '@angular/forms';
import * as THREE from 'three';
import { AudioService } from '../../../core/services/audio.service';
import { ResponsiveUtil } from '../../../core/utils/responsive.util';

export interface PlayerConfig {
  id: number;
  name: string;
  isAi: boolean;
  color: string;
  hexColor: number;
  tile: number;
}

const PLAYER_COLORS = [
  { name: 'Amber Gold', hex: 0xf59e0b, css: '#f59e0b' },
  { name: 'Royal Blue', hex: 0x3b82f6, css: '#3b82f6' },
  { name: 'Emerald Green', hex: 0x10b981, css: '#10b981' },
  { name: 'Crimson Red', hex: 0xef4444, css: '#ef4444' },
  { name: 'Purple Violet', hex: 0x8b5cf6, css: '#8b5cf6' },
  { name: 'Cyan Breeze', hex: 0x06b6d4, css: '#06b6d4' },
  { name: 'Neon Pink', hex: 0xec4899, css: '#ec4899' },
  { name: 'Bright Orange', hex: 0xf97316, css: '#f97316' }
];

@Component({
  selector: 'app-snakes-ladders',
  standalone: true,
  imports: [CommonModule, NgFormsModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-6xl mx-auto space-y-4 shadow-2xl font-sans select-none relative">

      <!-- MAIN MENU OVERLAY -->
      @if (showMenu()) {
        <div class="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="bg-slate-900 border-2 border-teal-500/40 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6">

            <div class="text-center space-y-2">
              <span class="text-5xl">🐍🎲🦎</span>
              <h1 class="text-3xl md:text-4xl font-black bg-gradient-to-r from-teal-400 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
                3D MONGOOSE VS SNAKES & LADDERS
              </h1>
              <p class="text-slate-400 text-sm">Experience 3D Mongoose vs Snake clash battles, animated turns, and support up to 8 players!</p>
            </div>

            <!-- DIFFICULTY SELECTION -->
            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-wider text-teal-400">Select Difficulty</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  *ngFor="let diff of ['Easy', 'Medium', 'Hard']"
                  (click)="selectedDifficulty = diff"
                  [class.bg-teal-500]="selectedDifficulty === diff"
                  [class.text-slate-950]="selectedDifficulty === diff"
                  [class.bg-slate-800]="selectedDifficulty !== diff"
                  [class.text-slate-300]="selectedDifficulty !== diff"
                  class="py-2.5 px-4 rounded-xl font-extrabold text-sm border border-slate-700 hover:border-teal-400 transition-all">
                  {{ diff }}
                </button>
              </div>
            </div>

            <!-- NUMBER OF PLAYERS SELECTION -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-xs font-black uppercase tracking-wider text-teal-400">Number of Players (1 - 8)</label>
                <span class="text-amber-400 font-mono font-bold">{{ playerCount }} Players</span>
              </div>
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  *ngFor="let num of [1, 2, 3, 4, 5, 6, 7, 8]"
                  (click)="setPlayerCount(num)"
                  [class.bg-amber-500]="playerCount === num"
                  [class.text-slate-950]="playerCount === num"
                  [class.bg-slate-800]="playerCount !== num"
                  class="flex-1 min-w-[38px] py-2 rounded-xl font-black text-sm border border-slate-700 hover:border-amber-400 transition-all">
                  {{ num }}
                </button>
              </div>
            </div>

            <!-- PLAYER CUSTOMIZATION LIST -->
            <div class="space-y-3 max-h-56 overflow-y-auto pr-1">
              <label class="text-xs font-black uppercase tracking-wider text-teal-400">Player Names & Control</label>
              <div *ngFor="let p of playersSetup; let idx = index" class="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <span class="w-4 h-4 rounded-full flex-shrink-0 shadow-md" [style.background-color]="p.color"></span>
                <input
                  type="text"
                  [(ngModel)]="p.name"
                  placeholder="Player {{ idx + 1 }}"
                  class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white flex-1 focus:outline-none focus:border-teal-400 font-bold" />

                <button
                  (click)="p.isAi = !p.isAi"
                  [class.bg-indigo-600]="p.isAi"
                  [class.bg-emerald-600]="!p.isAi"
                  class="px-3 py-1.5 rounded-lg text-xs font-extrabold text-white min-w-[75px] shadow transition-all">
                  {{ p.isAi ? '🤖 AI' : '👤 Human' }}
                </button>
              </div>
            </div>

            <!-- START GAME BUTTON -->
            <button
              (click)="startGame()"
              class="w-full py-4 bg-gradient-to-r from-teal-400 via-emerald-500 to-amber-400 hover:scale-[1.02] text-slate-950 font-black text-lg rounded-2xl shadow-xl transition-all">
              🚀 START 3D GAME
            </button>
          </div>
        </div>
      }

      <!-- TOP HUD HEADER -->
      <div class="flex flex-wrap items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl">🎲</span>
          <div>
            <h2 class="text-lg font-black text-teal-400 tracking-wide">3D MONGOOSE VS SNAKES</h2>
            <p class="text-xs text-slate-400 font-medium">Difficulty: <span class="text-amber-400 font-bold">{{ selectedDifficulty }}</span> • {{ activePlayers.length }} Players</p>
          </div>
        </div>

        <!-- FIGHT NOTIFICATION BADGE -->
        @if (fightText()) {
          <div class="px-4 py-1.5 bg-rose-600/90 text-white rounded-full font-black text-xs animate-bounce shadow-lg border border-rose-400 flex items-center gap-2">
            <span>⚔️</span> {{ fightText() }}
          </div>
        }

        <div class="flex items-center gap-2">
          <button (click)="openMenu()" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-extrabold shadow">
            ⚙️ Menu
          </button>
          <button (click)="toggleFullscreen()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 font-bold shadow">
            ⛶
          </button>
          <button
            (click)="rollDice()"
            [disabled]="isRolling() || isAnimating() || winner() !== null || getCurrentPlayer().isAi"
            class="px-5 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black rounded-xl shadow-lg disabled:opacity-40 hover:scale-105 transition-all text-sm flex items-center gap-2">
            <span>🎲</span> Roll Dice ({{ diceValue() }})
          </button>
        </div>
      </div>

      <!-- TURN STATUS & PLAYERS SCOREBOARD -->
      <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
        <div class="flex items-center justify-between text-xs font-black">
          <div class="flex items-center gap-2">
            <span class="text-slate-400">Current Turn:</span>
            <span class="px-3 py-1 rounded-lg text-slate-950 font-extrabold shadow flex items-center gap-1.5" [style.background-color]="getCurrentPlayer().color">
              <span>{{ getCurrentPlayer().isAi ? '🤖' : '👤' }}</span>
              <span>{{ getCurrentPlayer().name }}</span>
            </span>
          </div>
          <div class="text-slate-400">Target: <span class="text-amber-400 font-mono text-sm font-bold">Tile 100</span></div>
        </div>

        <!-- PLAYER TILES CHIPS -->
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          <div
            *ngFor="let p of activePlayers; let i = index"
            [class.ring-2]="turnIndex() === i"
            [class.ring-amber-400]="turnIndex() === i"
            class="bg-slate-950/70 p-2 rounded-lg border border-slate-800 flex flex-col items-center text-center transition-all">
            <div class="flex items-center gap-1 text-[11px] font-bold truncate max-w-full" [style.color]="p.color">
              <span>{{ p.isAi ? '🤖' : '🦡' }}</span>
              <span class="truncate">{{ p.name }}</span>
            </div>
            <span class="text-amber-400 font-mono font-black text-xs mt-0.5">Tile {{ p.tile }}</span>
          </div>
        </div>
      </div>

      <!-- 3D CANVAS BOARD -->
      <div #container class="relative w-full aspect-[16/9] min-h-[420px] max-h-[580px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block"></canvas>

        <!-- WINNER OVERLAY -->
        @if (winner()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center z-30 p-6">
            <span class="text-6xl animate-bounce">🏆</span>
            <h2 class="text-4xl font-black bg-gradient-to-r from-amber-300 via-teal-300 to-emerald-300 bg-clip-text text transparent">
              {{ winner() }} WINS THE GAME!
            </h2>
            <p class="text-slate-300 text-sm max-w-md">The victorious Mongoose conquered the board and defeated all snakes!</p>
            <div class="flex gap-4">
              <button (click)="restartGame()" class="px-6 py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black rounded-xl shadow-lg hover:scale-105 transition-all">
                🔄 PLAY AGAIN
              </button>
              <button (click)="openMenu()" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700">
                ⚙️ MAIN MENU
              </button>
            </div>
          </div>
        }
      </div>

    </div>
  `
})
export class SnakesLaddersComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  private audioService = inject(AudioService);

  showMenu = signal<boolean>(true);
  selectedDifficulty: string = 'Medium';
  playerCount: number = 2;

  playersSetup: PlayerConfig[] = [];
  activePlayers: PlayerConfig[] = [];

  turnIndex = signal<number>(0);
  diceValue = signal<number>(1);
  isRolling = signal<boolean>(false);
  isAnimating = signal<boolean>(false);
  winner = signal<string | null>(null);
  fightText = signal<string | null>(null);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private playerMeshes: THREE.Group[] = [];
  private playerHighlightRings: THREE.Mesh[] = [];
  private nameSpriteLabels: THREE.Sprite[] = [];
  private animFrameId: number = 0;

  // Board Map: Snakes (Head -> Tail) & Ladders (Base -> Top)
  private ladders: Record<number, number> = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 63: 81, 71: 91 };
  private snakes: Record<number, number> = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 99: 78 };

  constructor() {
    this.initDefaultPlayers();
  }

  ngAfterViewInit() {
    this.audioService.startPlaylist('funny-quirky');
    this.initThreeJS();
    this.buildBoard();
    this.build3DLadders();
    this.build3DSnakes();
    this.startLoop();
  }

  private initDefaultPlayers() {
    this.playersSetup = [
      { id: 0, name: 'Mongoose Hero', isAi: false, color: PLAYER_COLORS[0].css, hexColor: PLAYER_COLORS[0].hex, tile: 1 },
      { id: 1, name: 'Shadow Mongoose', isAi: true, color: PLAYER_COLORS[1].css, hexColor: PLAYER_COLORS[1].hex, tile: 1 },
      { id: 2, name: 'Emerald Mongoose', isAi: true, color: PLAYER_COLORS[2].css, hexColor: PLAYER_COLORS[2].hex, tile: 1 },
      { id: 3, name: 'Crimson Mongoose', isAi: true, color: PLAYER_COLORS[3].css, hexColor: PLAYER_COLORS[3].hex, tile: 1 },
      { id: 4, name: 'Violet Mongoose', isAi: true, color: PLAYER_COLORS[4].css, hexColor: PLAYER_COLORS[4].hex, tile: 1 },
      { id: 5, name: 'Cyan Mongoose', isAi: true, color: PLAYER_COLORS[5].css, hexColor: PLAYER_COLORS[5].hex, tile: 1 },
      { id: 6, name: 'Pink Mongoose', isAi: true, color: PLAYER_COLORS[6].css, hexColor: PLAYER_COLORS[6].hex, tile: 1 },
      { id: 7, name: 'Orange Mongoose', isAi: true, color: PLAYER_COLORS[7].css, hexColor: PLAYER_COLORS[7].hex, tile: 1 }
    ];
  }

  setPlayerCount(count: number) {
    this.playerCount = count;
  }

  openMenu() {
    this.showMenu.set(true);
  }

  startGame() {
    this.audioService.playClickSound();
    this.showMenu.set(false);
    this.activePlayers = this.playersSetup.slice(0, this.playerCount).map(p => ({
      ...p,
      tile: 1
    }));

    this.turnIndex.set(0);
    this.winner.set(null);
    this.fightText.set(null);

    this.setupPlayerTokens3D();
    this.updateTokenPositions();
  }

  restartGame() {
    this.startGame();
  }

  toggleFullscreen() {
    if (this.containerRef) {
      ResponsiveUtil.toggleFullscreen(this.containerRef.nativeElement);
    }
  }

  getCurrentPlayer(): PlayerConfig {
    return this.activePlayers[this.turnIndex()] || this.playersSetup[0];
  }

  rollDice() {
    if (this.isRolling() || this.isAnimating() || this.winner()) return;
    const player = this.getCurrentPlayer();

    this.isRolling.set(true);
    let rollCount = 0;
    const interval = setInterval(() => {
      this.diceValue.set(Math.floor(Math.random() * 6) + 1);
      this.audioService.playClickSound();
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        this.isRolling.set(false);
        this.processTurn(this.diceValue());
      }
    }, 50);
  }

  private async processTurn(roll: number) {
    this.isAnimating.set(true);
    const pIdx = this.turnIndex();
    const player = this.activePlayers[pIdx];
    const startTile = player.tile;
    let targetTile = startTile + roll;

    if (targetTile > 100) {
      targetTile = startTile; // Overshoot rule
    }

    // Tile-by-tile step hop animation
    for (let t = startTile + 1; t <= targetTile; t++) {
      player.tile = t;
      this.animateTokenToTile(pIdx, t);
      this.audioService.playClickSound();
      await this.sleep(220);
    }

    // Check Ladder
    if (this.ladders[targetTile]) {
      const endTile = this.ladders[targetTile];
      this.audioService.playBoingSound();
      this.fightText.set(`🪜 ${player.name} climbed a Ladder to Tile ${endTile}!`);
      await this.sleep(400);
      player.tile = endTile;
      this.animateTokenToTile(pIdx, endTile);
      await this.sleep(600);
      this.fightText.set(null);
    }
    // Check Snake Fight
    else if (this.snakes[targetTile]) {
      const tailTile = this.snakes[targetTile];
      this.fightText.set(`⚔️ FIGHT! ${player.name} Mongoose vs Snake on Tile ${targetTile}!`);
      this.audioService.playExplosionSound();

      // Trigger Mongoose vs Snake Fight animation
      await this.animateSnakeFight(pIdx, targetTile);

      player.tile = tailTile;
      this.animateTokenToTile(pIdx, tailTile);
      this.fightText.set(`🐍 ${player.name} bit by Snake! Retreats to Tile ${tailTile}`);
      await this.sleep(800);
      this.fightText.set(null);
    }

    this.isAnimating.set(false);

    if (player.tile === 100) {
      this.winner.set(player.name);
      this.audioService.playCoinSound();
      return;
    }

    // Advance Turn
    const nextTurn = (pIdx + 1) % this.activePlayers.length;
    this.turnIndex.set(nextTurn);

    // AI Turn auto trigger
    if (this.activePlayers[nextTurn].isAi && !this.winner()) {
      setTimeout(() => this.rollDice(), 900);
    }
  }

  private animateSnakeFight(pIdx: number, tileNum: number): Promise<void> {
    return new Promise((resolve) => {
      const mesh = this.playerMeshes[pIdx];
      if (!mesh) return resolve();

      const origPos = mesh.position.clone();
      let step = 0;

      const fightInterval = setInterval(() => {
        step++;
        // Shake Mongoose back and forth aggressively
        mesh.position.x = origPos.x + (Math.random() - 0.5) * 0.4;
        mesh.position.y = origPos.y + Math.abs(Math.sin(step)) * 0.3;
        mesh.position.z = origPos.z + (Math.random() - 0.5) * 0.4;

        if (step % 2 === 0) this.audioService.playClickSound();

        if (step > 15) {
          clearInterval(fightInterval);
          mesh.position.copy(origPos);
          resolve();
        }
      }, 50);
    });
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 11, 10.5);
    this.camera.lookAt(0, -0.5, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(ResponsiveUtil.getClampedPixelRatio());

    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffd700, 1.2);
    dirLight.position.set(5, 12, 8);
    this.scene.add(dirLight);

    ResponsiveUtil.setupCanvasResizeObserver(container, (w, h) => {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private buildBoard() {
    const tileGeo = new THREE.BoxGeometry(0.85, 0.1, 0.85);

    for (let i = 1; i <= 100; i++) {
      const { x, z } = this.getTileWorldPos(i);
      const row = Math.floor((i - 1) / 10);
      const isAlt = (row + i) % 2 === 0;

      const mat = new THREE.MeshStandardMaterial({
        color: i === 100 ? 0xf59e0b : (isAlt ? 0x0f766e : 0x0284c7),
        roughness: 0.3
      });
      const tile = new THREE.Mesh(tileGeo, mat);
      tile.position.set(x, 0, z);
      this.scene.add(tile);
    }
  }

  private build3DLadders() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    const rungMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });

    Object.entries(this.ladders).forEach(([start, end]) => {
      const p1 = this.getTileWorldPos(Number(start));
      const p2 = this.getTileWorldPos(Number(end));

      const v1 = new THREE.Vector3(p1.x, 0.15, p1.z);
      const v2 = new THREE.Vector3(p2.x, 0.15, p2.z);
      const dist = v1.distanceTo(v2);

      // Rails
      const railGeo = new THREE.CylinderGeometry(0.03, 0.03, dist, 8);
      const rail1 = new THREE.Mesh(railGeo, woodMat);
      const rail2 = new THREE.Mesh(railGeo, woodMat);

      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      rail1.position.copy(mid).add(new THREE.Vector3(-0.15, 0, 0));
      rail2.position.copy(mid).add(new THREE.Vector3(0.15, 0, 0));

      rail1.lookAt(v2); rail1.rotateX(Math.PI / 2);
      rail2.lookAt(v2); rail2.rotateX(Math.PI / 2);

      this.scene.add(rail1);
      this.scene.add(rail2);

      // Ladder Rungs
      const rungCount = Math.max(3, Math.floor(dist / 0.4));
      const rungGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.32, 8);
      for (let r = 1; r < rungCount; r++) {
        const alpha = r / rungCount;
        const rungPos = new THREE.Vector3().lerpVectors(v1, v2, alpha);
        const rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.copy(rungPos);
        rung.lookAt(v2);
        rung.rotateZ(Math.PI / 2);
        this.scene.add(rung);
      }
    });
  }

  private build3DSnakes() {
    const snakeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    Object.entries(this.snakes).forEach(([start, end]) => {
      const pHead = this.getTileWorldPos(Number(start));
      const pTail = this.getTileWorldPos(Number(end));

      // Curved tube for snake body
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(pHead.x, 0.25, pHead.z),
        new THREE.Vector3((pHead.x + pTail.x) / 2 + 0.3, 0.4, (pHead.z + pTail.z) / 2),
        new THREE.Vector3(pTail.x, 0.15, pTail.z)
      ]);

      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
      const snakeBody = new THREE.Mesh(tubeGeo, snakeMat);
      this.scene.add(snakeBody);

      // Snake Head Mesh
      const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
      headGeo.scale(1, 0.6, 1.4);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(pHead.x, 0.25, pHead.z);
      this.scene.add(head);

      // Snake Eyes
      const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(pHead.x - 0.07, 0.3, pHead.z + 0.08);
      eyeR.position.set(pHead.x + 0.07, 0.3, pHead.z + 0.08);
      this.scene.add(eyeL);
      this.scene.add(eyeR);
    });
  }

  private setupPlayerTokens3D() {
    // Clear old tokens
    this.playerMeshes.forEach(m => this.scene.remove(m));
    this.playerHighlightRings.forEach(r => this.scene.remove(r));
    this.nameSpriteLabels.forEach(s => this.scene.remove(s));

    this.playerMeshes = [];
    this.playerHighlightRings = [];
    this.nameSpriteLabels = [];

    this.activePlayers.forEach((p, idx) => {
      // Build 3D Mongoose Mesh Group
      const mongooseGroup = new THREE.Group();

      const mat = new THREE.MeshStandardMaterial({ color: p.hexColor, roughness: 0.4 });
      const snoutMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

      // Body
      const bodyGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.35, 12);
      const body = new THREE.Mesh(bodyGeo, mat);
      body.position.y = 0.2;
      mongooseGroup.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.14, 12, 12);
      const head = new THREE.Mesh(headGeo, mat);
      head.position.set(0, 0.42, 0.05);
      mongooseGroup.add(head);

      // Snout
      const snoutGeo = new THREE.ConeGeometry(0.07, 0.15, 8);
      const snout = new THREE.Mesh(snoutGeo, snoutMat);
      snout.rotation.x = Math.PI / 2;
      snout.position.set(0, 0.4, 0.18);
      mongooseGroup.add(snout);

      // Tail
      const tailGeo = new THREE.CylinderGeometry(0.04, 0.01, 0.3, 8);
      const tail = new THREE.Mesh(tailGeo, mat);
      tail.rotation.x = -Math.PI / 4;
      tail.position.set(0, 0.15, -0.18);
      mongooseGroup.add(tail);

      this.scene.add(mongooseGroup);
      this.playerMeshes.push(mongooseGroup);

      // Highlight Ring
      const ringGeo = new THREE.RingGeometry(0.22, 0.28, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.08;
      this.scene.add(ring);
      this.playerHighlightRings.push(ring);

      // 3D Player Name Sprite Badge
      const sprite = this.createNameSprite(p.name, p.color);
      this.scene.add(sprite);
      this.nameSpriteLabels.push(sprite);
    });
  }

  private createNameSprite(text: string, colorCss: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.roundRect(10, 10, 236, 44, 12);
    ctx.fill();
    ctx.strokeStyle = colorCss;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.9, 0.25, 1);
    return sprite;
  }

  private updateTokenPositions() {
    this.activePlayers.forEach((p, idx) => {
      this.animateTokenToTile(idx, p.tile);
    });
  }

  private animateTokenToTile(pIdx: number, tileNum: number) {
    const mesh = this.playerMeshes[pIdx];
    const ring = this.playerHighlightRings[pIdx];
    const sprite = this.nameSpriteLabels[pIdx];

    if (!mesh) return;

    const { x, z } = this.getTileWorldPos(tileNum);

    // Spread tokens slightly if on same tile
    const offsetAngle = (pIdx / this.activePlayers.length) * Math.PI * 2;
    const offsetX = Math.cos(offsetAngle) * 0.12;
    const offsetZ = Math.sin(offsetAngle) * 0.12;

    mesh.position.set(x + offsetX, 0, z + offsetZ);
    if (ring) ring.position.set(x + offsetX, 0.08, z + offsetZ);
    if (sprite) sprite.position.set(x + offsetX, 0.75, z + offsetZ);
  }

  private getTileWorldPos(tileNum: number): { x: number; z: number } {
    const idx = tileNum - 1;
    const row = Math.floor(idx / 10);
    let col = idx % 10;
    if (row % 2 === 1) col = 9 - col; // Snake pattern zig-zag

    return {
      x: col * 0.9 - 4.05,
      z: 4.05 - row * 0.9
    };
  }

  private startLoop() {
    let clock = new THREE.Clock();

    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      const elapsed = clock.getElapsedTime();

      // Pulse active player highlight ring
      const activeIdx = this.turnIndex();
      this.playerHighlightRings.forEach((ring, idx) => {
        if (ring) {
          const isActive = idx === activeIdx;
          ring.visible = isActive;
          if (isActive) {
            const scale = 1 + Math.sin(elapsed * 6) * 0.15;
            ring.scale.set(scale, scale, scale);
          }
        }
      });

      // Gently bounce active Mongoose
      const activeMesh = this.playerMeshes[activeIdx];
      if (activeMesh && !this.isAnimating()) {
        activeMesh.position.y = Math.sin(elapsed * 4) * 0.05;
      }

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
  }

  ngOnDestroy() {
    this.audioService.stopMusic();
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
