import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';

interface ChessPiece {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
  mesh: THREE.Group;
  row: number;
  col: number;
}

@Component({
  selector: 'app-chess3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-xl font-black shadow-lg">
            ♟️
          </div>
          <div>
            <h2 class="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-indigo-400">
              3D BATTLE CHESS
            </h2>
            <p class="text-xs text-slate-400">Turn-Based Strategic 3D Chess • Player vs AI / Local 2P</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="toggleVsAI()" [class.bg-indigo-600]="vsAI()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-bold transition-all">
            🤖 {{ vsAI() ? 'VS AI (Active)' : 'VS Local P2' }}
          </button>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold shadow">
            🔄 New Match
          </button>
        </div>
      </div>

      <!-- Turn & Captured HUD -->
      <div class="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400">Current Turn:</span>
          <span [class.text-amber-300]="currentTurn() === 'w'" [class.text-indigo-400]="currentTurn() === 'b'" class="font-black uppercase tracking-wider text-sm">
            {{ currentTurn() === 'w' ? '♔ White' : '♚ Black' }}
          </span>
        </div>
        <div class="text-slate-400">
          Captured: <span class="text-amber-300 font-bold">{{ capturedWhite().length }}</span> W | <span class="text-indigo-400 font-bold">{{ capturedBlack().length }}</span> B
        </div>
      </div>

      <!-- 3D Viewport Canvas Container -->
      <div #container class="relative w-full aspect-[16/9] max-h-[560px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-pointer"></canvas>

        <div class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none">
          🎯 Click a piece to select, then click highlighted tile to move
        </div>

        @if (statusMessage()) {
          <div class="absolute top-4 bg-amber-500/90 text-slate-950 font-black px-6 py-2 rounded-xl shadow-2xl text-sm animate-bounce">
            {{ statusMessage() }}
          </div>
        }
      </div>
    </div>
  `
})
export class Chess3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  vsAI = signal<boolean>(true);
  currentTurn = signal<'w' | 'b'>('w');
  statusMessage = signal<string | null>(null);
  capturedWhite = signal<string[]>([]);
  capturedBlack = signal<string[]>([]);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private animFrameId: number = 0;

  private pieces: ChessPiece[] = [];
  private boardTiles: THREE.Mesh[] = [];
  private highlightMeshes: THREE.Mesh[] = [];
  private selectedPiece: ChessPiece | null = null;

  private lightMarbleTexture!: THREE.CanvasTexture;
  private darkMarbleTexture!: THREE.CanvasTexture;

  ngAfterViewInit() {
    this.lightMarbleTexture = TextureGenerator.createMarbleTexture(false);
    this.darkMarbleTexture = TextureGenerator.createMarbleTexture(true);

    this.initThreeJS();
    this.buildBoard();
    this.setupInitialPieces();
    this.startLoop();
  }

  toggleVsAI() {
    this.vsAI.update(v => !v);
    this.restartGame();
  }

  restartGame() {
    this.pieces.forEach(p => this.scene.remove(p.mesh));
    this.pieces = [];
    this.selectedPiece = null;
    this.currentTurn.set('w');
    this.statusMessage.set(null);
    this.capturedWhite.set([]);
    this.capturedBlack.set([]);
    this.clearHighlights();
    this.setupInitialPieces();
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 9, 9);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 12, 5);
    this.scene.add(dirLight);

    canvas.addEventListener('click', (e) => this.onCanvasClick(e));
  }

  private buildBoard() {
    const tileGeo = new THREE.BoxGeometry(1, 0.2, 1);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        const mat = new THREE.MeshStandardMaterial({
          map: isDark ? this.darkMarbleTexture : this.lightMarbleTexture,
          roughness: 0.2,
          metalness: 0.1
        });
        const tile = new THREE.Mesh(tileGeo, mat);
        tile.position.set(c - 3.5, 0, r - 3.5);
        tile.userData = { row: r, col: c };
        this.boardTiles.push(tile);
        this.scene.add(tile);
      }
    }
  }

  private setupInitialPieces() {
    const backRow: ('r' | 'n' | 'b' | 'q' | 'k' | 'b' | 'n' | 'r')[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

    backRow.forEach((type, col) => this.addPiece(type, 'b', 0, col));
    for (let col = 0; col < 8; col++) this.addPiece('p', 'b', 1, col);

    for (let col = 0; col < 8; col++) this.addPiece('p', 'w', 6, col);
    backRow.forEach((type, col) => this.addPiece(type, 'w', 7, col));
  }

  private addPiece(type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k', color: 'w' | 'b', row: number, col: number) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      color: color === 'w' ? 0xf59e0b : 0x334155,
      roughness: 0.2,
      metalness: 0.4
    });

    let geo: THREE.BufferGeometry;
    if (type === 'p') geo = new THREE.CylinderGeometry(0.2, 0.3, 0.6);
    else if (type === 'r') geo = new THREE.BoxGeometry(0.5, 0.8, 0.5);
    else if (type === 'n') geo = new THREE.ConeGeometry(0.3, 0.8, 8);
    else if (type === 'b') geo = new THREE.CylinderGeometry(0.1, 0.3, 0.9);
    else if (type === 'q') geo = new THREE.SphereGeometry(0.35, 12, 12);
    else geo = new THREE.CylinderGeometry(0.25, 0.35, 1.1);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.4;
    group.add(mesh);

    group.position.set(col - 3.5, 0.1, row - 3.5);
    this.scene.add(group);

    this.pieces.push({ type, color, mesh: group, row, col });
  }

  private onCanvasClick(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const tileHits = this.raycaster.intersectObjects(this.boardTiles);
    if (tileHits.length > 0) {
      const tile = tileHits[0].object as THREE.Mesh;
      const { row, col } = tile.userData;

      const clickedPiece = this.pieces.find(p => p.row === row && p.col === col);

      if (this.selectedPiece) {
        if (this.selectedPiece === clickedPiece) {
          this.selectedPiece = null;
          this.clearHighlights();
          return;
        }

        if (clickedPiece && clickedPiece.color === this.selectedPiece.color) {
          this.selectedPiece = clickedPiece;
          this.highlightMoves(clickedPiece);
          return;
        }

        this.movePiece(this.selectedPiece, row, col);
        this.selectedPiece = null;
        this.clearHighlights();
      } else if (clickedPiece && clickedPiece.color === this.currentTurn()) {
        this.selectedPiece = clickedPiece;
        this.highlightMoves(clickedPiece);
      }
    }
  }

  private highlightMoves(piece: ChessPiece) {
    this.clearHighlights();
    const geo = new THREE.RingGeometry(0.2, 0.4, 16);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = piece.row + dr;
        const nc = piece.col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          const ring = new THREE.Mesh(geo, mat);
          ring.position.set(nc - 3.5, 0.15, nr - 3.5);
          this.scene.add(ring);
          this.highlightMeshes.push(ring);
        }
      }
    }
  }

  private clearHighlights() {
    this.highlightMeshes.forEach(h => this.scene.remove(h));
    this.highlightMeshes = [];
  }

  private movePiece(piece: ChessPiece, targetRow: number, targetCol: number) {
    const targetIdx = this.pieces.findIndex(p => p.row === targetRow && p.col === targetCol);
    if (targetIdx !== -1) {
      const captured = this.pieces[targetIdx];
      if (captured.color === 'w') this.capturedWhite.update(c => [...c, captured.type]);
      else this.capturedBlack.update(c => [...c, captured.type]);
      this.scene.remove(captured.mesh);
      this.pieces.splice(targetIdx, 1);
    }

    piece.row = targetRow;
    piece.col = targetCol;
    piece.mesh.position.set(targetCol - 3.5, 0.1, targetRow - 3.5);

    this.currentTurn.update(t => t === 'w' ? 'b' : 'w');

    if (this.vsAI() && this.currentTurn() === 'b') {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  private makeAIMove() {
    const blackPieces = this.pieces.filter(p => p.color === 'b');
    if (blackPieces.length === 0) return;

    const p = blackPieces[Math.floor(Math.random() * blackPieces.length)];
    const nr = Math.min(7, Math.max(0, p.row + 1));
    const nc = Math.min(7, Math.max(0, p.col + (Math.random() > 0.5 ? 1 : -1)));

    this.movePiece(p, nr, nc);
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
