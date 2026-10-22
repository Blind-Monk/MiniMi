import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-city-sprint',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top HUD Header -->
      <div class="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🌆</span>
          <div>
            <h2 class="text-base font-extrabold text-amber-400">CITY SPRINT (3D OPEN-WORLD PARKOUR)</h2>
            <p class="text-xs text-slate-400">Rooftop Parkour & Urban Exploration Challenge</p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-bold">
          <div class="text-teal-400 text-sm">⭐ Stunt Score: {{ score() }}</div>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold shadow">
            🔄 Restart
          </button>
        </div>
      </div>

      <!-- 3D Viewport Canvas Container -->
      <div #container class="relative w-full aspect-[16/9] max-h-[520px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-pointer"></canvas>

        <div class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none">
          🎮 Controls: WASD to Run • Spacebar to Jump Across Rooftops
        </div>
      </div>
    </div>
  `
})
export class CitySprintComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  score = signal<number>(0);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private playerMesh!: THREE.Mesh;

  private posX = 0;
  private posY = 2;
  private posZ = 0;
  private velY = 0;
  private isGrounded = true;

  private activeKeys = new Set<string>();
  private animFrameId: number = 0;

  ngAfterViewInit() {
    this.initThreeJS();
    this.buildCity();
    this.startLoop();
  }

  restartGame() {
    this.score.set(0);
    this.posX = 0;
    this.posY = 2;
    this.posZ = 0;
    this.velY = 0;
    this.isGrounded = true;
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
    this.scene.background = new THREE.Color(0x0284c7); // Sunset sky
    this.scene.fog = new THREE.FogExp2(0x0284c7, 0.015);

    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);

    const sun = new THREE.DirectionalLight(0xfba518, 1.2);
    sun.position.set(20, 40, 20);
    this.scene.add(sun);

    // Player Mesh
    const pGeo = new THREE.CapsuleGeometry(0.3, 1, 8, 16);
    const pMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    this.playerMesh = new THREE.Mesh(pGeo, pMat);
    this.scene.add(this.playerMesh);
  }

  private buildCity() {
    const bGeo = new THREE.BoxGeometry(6, 12, 6);
    const bMat = new THREE.MeshStandardMaterial({ color: 0x334155 });

    for (let x = -30; x <= 30; x += 10) {
      for (let z = -30; z <= 30; z += 10) {
        const building = new THREE.Mesh(bGeo, bMat);
        building.position.set(x, 6, z);
        this.scene.add(building);
      }
    }
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.updatePhysics();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private updatePhysics() {
    const speed = 0.15;
    if (this.activeKeys.has('w') || this.activeKeys.has('ArrowUp')) this.posZ -= speed;
    if (this.activeKeys.has('s') || this.activeKeys.has('ArrowDown')) this.posZ += speed;
    if (this.activeKeys.has('a') || this.activeKeys.has('ArrowLeft')) this.posX -= speed;
    if (this.activeKeys.has('d') || this.activeKeys.has('ArrowRight')) this.posX += speed;

    if (this.activeKeys.has(' ') && this.isGrounded) {
      this.velY = 0.3;
      this.isGrounded = false;
      this.score.update(s => s + 50);
    }

    this.posY += this.velY;
    this.velY -= 0.018;

    if (this.posY <= 12.5) {
      this.posY = 12.5;
      this.velY = 0;
      this.isGrounded = true;
    }

    this.playerMesh.position.set(this.posX, this.posY, this.posZ);
    this.camera.position.set(this.posX, this.posY + 2, this.posZ + 6);
    this.camera.lookAt(this.posX, this.posY, this.posZ);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
