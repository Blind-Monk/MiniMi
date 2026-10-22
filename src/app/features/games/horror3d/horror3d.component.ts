import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-horror3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top HUD Header -->
      <div class="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🔦</span>
          <div>
            <h2 class="text-base font-extrabold text-purple-400">MIDNIGHT ASYLUM (3D SURVIVAL HORROR)</h2>
            <p class="text-xs text-slate-400">Navigate Dark Corridors • Collect Keys & Evade Entity</p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-bold">
          <div class="text-amber-400 text-sm">🔑 Keys Found: {{ keysFound() }}/4</div>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold shadow">
            🔄 Restart
          </button>
        </div>
      </div>

      <!-- 3D Viewport Canvas Container -->
      <div #container class="relative w-full aspect-[16/9] max-h-[520px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-crosshair"></canvas>

        <div class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none">
          🔦 Controls: WASD to Walk • Flashlight follows camera
        </div>

        @if (escaped()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center z-20">
            <span class="text-5xl">🚪</span>
            <h2 class="text-3xl font-black text-emerald-400">YOU ESCAPED THE ASYLUM!</h2>
            <button (click)="restartGame()" class="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-lg">
              PLAY AGAIN
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class Horror3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  keysFound = signal<number>(0);
  escaped = signal<boolean>(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private flashlight!: THREE.SpotLight;
  private keysMeshes: THREE.Mesh[] = [];

  private posX = 0;
  private posZ = 0;
  private activeKeys = new Set<string>();
  private animFrameId: number = 0;

  ngAfterViewInit() {
    this.initThreeJS();
    this.buildMaze();
    this.startLoop();
  }

  restartGame() {
    this.keysFound.set(0);
    this.escaped.set(false);
    this.posX = 0;
    this.posZ = 0;
    this.keysMeshes.forEach(k => k.visible = true);
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
    this.scene.background = new THREE.Color(0x020617);
    this.scene.fog = new THREE.FogExp2(0x020617, 0.12);

    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 50);
    this.camera.position.set(0, 1.6, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    // Dim Ambient Light
    const dimAmb = new THREE.AmbientLight(0x0f172a, 0.2);
    this.scene.add(dimAmb);

    // Flashlight SpotLight attached to Camera
    this.flashlight = new THREE.SpotLight(0xffedd5, 2.5);
    this.flashlight.angle = Math.PI / 6;
    this.flashlight.penumbra = 0.5;
    this.flashlight.decay = 2;
    this.flashlight.distance = 20;
    this.scene.add(this.flashlight);
    this.scene.add(this.flashlight.target);
  }

  private buildMaze() {
    const wallGeo = new THREE.BoxGeometry(2, 3, 2);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    for (let r = -5; r <= 5; r++) {
      for (let c = -5; c <= 5; c++) {
        if (Math.random() > 0.6 && !(r === 0 && c === 0)) {
          const wall = new THREE.Mesh(wallGeo, wallMat);
          wall.position.set(c * 2, 1.5, r * 2);
          this.scene.add(wall);
        }
      }
    }

    // Spawn 4 Glowing Keys
    const keyGeo = new THREE.TorusGeometry(0.15, 0.05, 8, 16);
    const keyMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const positions = [[-6, -6], [6, -6], [-6, 6], [6, 6]];

    positions.forEach(pos => {
      const key = new THREE.Mesh(keyGeo, keyMat);
      key.position.set(pos[0], 0.8, pos[1]);
      this.scene.add(key);
      this.keysMeshes.push(key);
    });
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.updatePlayer();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private updatePlayer() {
    if (this.escaped()) return;

    const speed = 0.08;
    if (this.activeKeys.has('w') || this.activeKeys.has('ArrowUp')) this.posZ -= speed;
    if (this.activeKeys.has('s') || this.activeKeys.has('ArrowDown')) this.posZ += speed;
    if (this.activeKeys.has('a') || this.activeKeys.has('ArrowLeft')) this.posX -= speed;
    if (this.activeKeys.has('d') || this.activeKeys.has('ArrowRight')) this.posX += speed;

    this.camera.position.set(this.posX, 1.6, this.posZ);

    // Flashlight follow
    this.flashlight.position.set(this.posX, 1.6, this.posZ);
    this.flashlight.target.position.set(this.posX, 1.6, this.posZ - 5);

    // Key Collection Check
    this.keysMeshes.forEach(key => {
      if (key.visible && Math.hypot(key.position.x - this.posX, key.position.z - this.posZ) < 1.0) {
        key.visible = false;
        this.keysFound.update(k => k + 1);
        if (this.keysFound() >= 4) {
          this.escaped.set(true);
        }
      }
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
