import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-snakes-ladders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top HUD Header -->
      <div class="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎲</span>
          <div>
            <h2 class="text-base font-extrabold text-teal-400">3D SNAKES & LADDERS</h2>
            <p class="text-xs text-slate-400">10x10 Board • 3D Dice Roll & Token Animations</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="rollDice()" [disabled]="isRolling() || winner() !== null" class="px-5 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg disabled:opacity-40 hover:scale-105 transition-all">
            🎲 Roll Dice ({{ diceValue() }})
          </button>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-bold">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Turn HUD -->
      <div class="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs font-bold">
        <div>Current Turn: <span [class.text-amber-400]="turn() === 0" [class.text-indigo-400]="turn() === 1" class="text-sm font-black">{{ turn() === 0 ? 'P1 (Yellow)' : 'P2 (Blue AI)' }}</span></div>
        <div>P1 Tile: <span class="text-amber-400 font-mono text-sm">{{ p1Tile() }}</span> | P2 Tile: <span class="text-indigo-400 font-mono text-sm">{{ p2Tile() }}</span></div>
      </div>

      <!-- 3D Canvas -->
      <div #container class="relative w-full aspect-[16/9] max-h-[520px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block"></canvas>

        @if (winner()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center">
            <span class="text-5xl">🏆</span>
            <h2 class="text-3xl font-black text-amber-400">{{ winner() }} WON THE GAME!</h2>
            <button (click)="restartGame()" class="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl shadow-lg">
              PLAY AGAIN
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class SnakesLaddersComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  p1Tile = signal<number>(1);
  p2Tile = signal<number>(1);
  turn = signal<number>(0);
  diceValue = signal<number>(1);
  isRolling = signal<boolean>(false);
  winner = signal<string | null>(null);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private p1Mesh!: THREE.Mesh;
  private p2Mesh!: THREE.Mesh;
  private animFrameId: number = 0;

  // Snakes & Ladders Map (Start -> End)
  private ladders: Record<number, number> = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 63: 81, 71: 91 };
  private snakes: Record<number, number> = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 99: 78 };

  ngAfterViewInit() {
    this.initThreeJS();
    this.buildBoard();
    this.setupTokens();
    this.startLoop();
  }

  restartGame() {
    this.p1Tile.set(1);
    this.p2Tile.set(1);
    this.turn.set(0);
    this.winner.set(null);
    this.updateTokenPositions();
  }

  rollDice() {
    if (this.isRolling() || this.winner()) return;
    this.isRolling.set(true);

    let rollCount = 0;
    const interval = setInterval(() => {
      this.diceValue.set(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) {
        clearInterval(interval);
        this.isRolling.set(false);
        this.processMove(this.diceValue());
      }
    }, 50);
  }

  private processMove(roll: number) {
    const isP1 = this.turn() === 0;
    const currentSig = isP1 ? this.p1Tile : this.p2Tile;
    let nextTile = currentSig() + roll;

    if (nextTile > 100) nextTile = currentSig(); // Must land exactly on 100

    // Snake / Ladder check
    if (this.ladders[nextTile]) nextTile = this.ladders[nextTile];
    else if (this.snakes[nextTile]) nextTile = this.snakes[nextTile];

    currentSig.set(nextTile);
    this.updateTokenPositions();

    if (nextTile === 100) {
      this.winner.set(isP1 ? 'PLAYER 1' : 'PLAYER 2 (AI)');
      return;
    }

    // Switch turn
    const nextTurn = isP1 ? 1 : 0;
    this.turn.set(nextTurn);

    if (nextTurn === 1) {
      setTimeout(() => this.rollDice(), 1000); // AI Turn
    }
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 10, 10);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);
  }

  private buildBoard() {
    const tileGeo = new THREE.BoxGeometry(0.8, 0.1, 0.8);
    for (let i = 1; i <= 100; i++) {
      const { x, z } = this.getTileWorldPos(i);
      const isAlt = i % 2 === 0;
      const mat = new THREE.MeshStandardMaterial({ color: isAlt ? 0x0f766e : 0x0284c7 });
      const tile = new THREE.Mesh(tileGeo, mat);
      tile.position.set(x, 0, z);
      this.scene.add(tile);
    }
  }

  private setupTokens() {
    const geo = new THREE.SphereGeometry(0.3, 16, 16);

    this.p1Mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    this.p2Mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));

    this.scene.add(this.p1Mesh);
    this.scene.add(this.p2Mesh);

    this.updateTokenPositions();
  }

  private updateTokenPositions() {
    const pos1 = this.getTileWorldPos(this.p1Tile());
    this.p1Mesh.position.set(pos1.x - 0.15, 0.3, pos1.z);

    const pos2 = this.getTileWorldPos(this.p2Tile());
    this.p2Mesh.position.set(pos2.x + 0.15, 0.3, pos2.z);
  }

  private getTileWorldPos(tileNum: number): { x: number; z: number } {
    const idx = tileNum - 1;
    const row = Math.floor(idx / 10);
    let col = idx % 10;
    if (row % 2 === 1) col = 9 - col; // Snake pattern zig-zag

    return {
      x: col * 0.9 - 4,
      z: 4 - row * 0.9
    };
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
