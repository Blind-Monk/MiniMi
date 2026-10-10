import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-fps3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top HUD Header -->
      <div class="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎯</span>
          <div>
            <h2 class="text-base font-extrabold text-emerald-400">PROJECT VANGUARD (3D TACTICAL FPS)</h2>
            <p class="text-xs text-slate-400">Tactical First-Person Shooter • Mission Objectives & Enemy Targets</p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-bold">
          <div class="text-red-400 text-sm">❤️ Health: {{ health() }}%</div>
          <div class="text-amber-400 text-sm">🎯 Targets Eliminated: {{ score() }}/10</div>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold shadow">
            🔄 Restart
          </button>
        </div>
      </div>

      <!-- 3D Viewport Canvas Container -->
      <div #container class="relative w-full aspect-[16/9] max-h-[520px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-crosshair" (click)="fireWeapon()"></canvas>

        <!-- Crosshair HUD -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-4 h-4 border-2 border-emerald-400/80 rounded-full flex items-center justify-center">
            <div class="w-1 h-1 bg-red-500 rounded-full"></div>
          </div>
        </div>

        <div class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none">
          🎯 Controls: WASD to Walk • Click Canvas to Shoot Targets
        </div>

        @if (gameOver()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center">
            <span class="text-5xl">🎯</span>
            <h2 class="text-3xl font-black text-emerald-400">MISSION ACCOMPLISHED!</h2>
            <p class="text-slate-300 text-sm">Eliminated all enemy targets successfully.</p>
            <button (click)="restartGame()" class="px-6 py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl shadow-lg">
              PLAY AGAIN
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class Fps3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  health = signal<number>(100);
  score = signal<number>(0);
  gameOver = signal<boolean>(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private targets: THREE.Mesh[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(0, 0);

  private posX = 0;
  private posZ = 0;
  private activeKeys = new Set<string>();
  private animFrameId: number = 0;

  ngAfterViewInit() {
    this.initThreeJS();
    this.spawnTargets();
    this.startLoop();
  }

  restartGame() {
    this.health.set(100);
    this.score.set(0);
    this.gameOver.set(false);
    this.posX = 0;
    this.posZ = 0;
    this.targets.forEach(t => this.scene.remove(t));
    this.targets = [];
    this.spawnTargets();
  }

  fireWeapon() {
    if (this.gameOver()) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.targets);

    if (hits.length > 0) {
      const hitObj = hits[0].object as THREE.Mesh;
      this.scene.remove(hitObj);
      this.targets = this.targets.filter(t => t !== hitObj);
      this.score.update(s => s + 1);

      if (this.score() >= 10) {
        this.gameOver.set(true);
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    this.activeKeys.add(e.key);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    this.activeKeys.delete(e.key);
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);

    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 1.6, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);

    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(10, 20, 10);
    this.scene.add(dir);

    // Compound Wall Enclosure
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);
  }

  private spawnTargets() {
    const tGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.8);
    const tMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });

    for (let i = 0; i < 10; i++) {
      const target = new THREE.Mesh(tGeo, tMat);
      const rx = (Math.random() * 40) - 20;
      const rz = -5 - (Math.random() * 25);
      target.position.set(rx, 0.9, rz);
      this.scene.add(target);
      this.targets.push(target);
    }
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.updateMovement();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private updateMovement() {
    if (this.gameOver()) return;

    const speed = 0.1;
    if (this.activeKeys.has('w') || this.activeKeys.has('ArrowUp')) this.posZ -= speed;
    if (this.activeKeys.has('s') || this.activeKeys.has('ArrowDown')) this.posZ += speed;
    if (this.activeKeys.has('a') || this.activeKeys.has('ArrowLeft')) this.posX -= speed;
    if (this.activeKeys.has('d') || this.activeKeys.has('ArrowRight')) this.posX += speed;

    this.camera.position.set(this.posX, 1.6, this.posZ);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
