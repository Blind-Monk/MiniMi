import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { AudioService } from '../../../core/services/audio.service';
import { ResponsiveUtil } from '../../../core/utils/responsive.util';

@Component({
  selector: 'app-mario3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- Top HUD Header -->
      <div class="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🍄</span>
          <div>
            <h2 class="text-base font-extrabold text-red-500">SUPER PLUMBER 3D (PLATFORMER)</h2>
            <p class="text-xs text-slate-400">Jump, Collect Coins & Avoid Enemy Obstacles</p>
          </div>
        </div>

        <div class="flex items-center gap-4 text-xs font-bold">
          <div class="text-amber-400 text-sm">🪙 Coins: {{ coins() }}</div>
          <button (click)="toggleFullscreen()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold shadow">
            ⛶
          </button>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold shadow">
            🔄 Restart
          </button>
        </div>
      </div>

      <!-- 3D Viewport Canvas -->
      <div #container class="relative w-full aspect-[16/9] max-h-[520px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-pointer"></canvas>

        <div class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-300 pointer-events-none">
          🎮 Controls: WASD or Arrow Keys to Move • Spacebar to Jump
        </div>

        <!-- Touch Controls for Mobile Devices -->
        <div class="absolute bottom-4 right-4 flex gap-2 sm:hidden z-10">
          <button (touchstart)="movePlayer('w')" class="w-12 h-12 bg-slate-800/80 active:bg-red-600 text-white font-black rounded-xl border border-slate-600">⬆️</button>
          <button (touchstart)="movePlayer('s')" class="w-12 h-12 bg-slate-800/80 active:bg-red-600 text-white font-black rounded-xl border border-slate-600">⬇️</button>
          <button (touchstart)="movePlayer('a')" class="w-12 h-12 bg-slate-800/80 active:bg-red-600 text-white font-black rounded-xl border border-slate-600">⬅️</button>
          <button (touchstart)="movePlayer('d')" class="w-12 h-12 bg-slate-800/80 active:bg-red-600 text-white font-black rounded-xl border border-slate-600">➡️</button>
          <button (click)="jump()" class="w-14 h-12 bg-red-600 active:bg-red-500 text-white font-black rounded-xl shadow-lg border border-red-400">🦘</button>
        </div>

        @if (gameOver()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center z-20">
            <span class="text-5xl">💥</span>
            <h2 class="text-3xl font-black text-red-500">GAME OVER</h2>
            <p class="text-slate-300 text-sm">Total Coins Collected: <span class="text-amber-400 font-bold">{{ coins() }}</span></p>
            <button (click)="restartGame()" class="px-6 py-2.5 bg-red-600 hover:bg-red-500 font-black rounded-xl shadow-lg">
              TRY AGAIN
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class Mario3dComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  private audioService = inject(AudioService);

  coins = signal<number>(0);
  gameOver = signal<boolean>(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private playerMesh!: THREE.Mesh;

  private posX = 0;
  private posY = 0.5;
  private posZ = 0;
  private velY = 0;
  private isGrounded = true;

  private coinsMeshes: THREE.Mesh[] = [];
  private activeKeys = new Set<string>();
  private animFrameId: number = 0;

  ngAfterViewInit() {
    this.audioService.startPlaylist('funny-quirky');
    this.initThreeJS();
    this.buildLevel();
    this.startLoop();
  }

  toggleFullscreen() {
    if (this.containerRef) {
      ResponsiveUtil.toggleFullscreen(this.containerRef.nativeElement);
    }
  }

  restartGame() {
    this.audioService.playClickSound();
    this.coins.set(0);
    this.gameOver.set(false);
    this.posX = 0;
    this.posY = 0.5;
    this.posZ = 0;
    this.velY = 0;
    this.isGrounded = true;
    if (this.playerMesh) this.playerMesh.position.set(0, 0.5, 0);
  }

  jump() {
    if (this.isGrounded) {
      this.velY = 0.25;
      this.isGrounded = false;
      this.audioService.playJumpSound();
    }
  }

  movePlayer(dir: string) {
    const speed = 0.4;
    if (dir === 'w') this.posZ -= speed;
    if (dir === 's') this.posZ += speed;
    if (dir === 'a') this.posX -= speed;
    if (dir === 'd') this.posX += speed;
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
    this.scene.background = new THREE.Color(0x38bdf8); // Sky blue

    this.camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(ResponsiveUtil.getClampedPixelRatio());

    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);

    const sun = new THREE.DirectionalLight(0xfff5ea, 1.0);
    sun.position.set(10, 20, 10);
    this.scene.add(sun);

    // Player (Red Plumber Sphere)
    const pGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    this.playerMesh = new THREE.Mesh(pGeo, pMat);
    this.playerMesh.position.set(0, 0.5, 0);
    this.scene.add(this.playerMesh);

    ResponsiveUtil.setupCanvasResizeObserver(container, (w, h) => {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private buildLevel() {
    // Floating Grass Platforms
    const platGeo = new THREE.BoxGeometry(4, 0.4, 4);
    const platMat = new THREE.MeshStandardMaterial({ color: 0x15803d });

    const coinGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 12);
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });

    for (let i = 0; i < 15; i++) {
      const px = (i % 5) * 5 - 10;
      const pz = -i * 6;
      const plat = new THREE.Mesh(platGeo, platMat);
      plat.position.set(px, 0, pz);
      this.scene.add(plat);

      // Add Coin
      const coin = new THREE.Mesh(coinGeo, coinMat);
      coin.position.set(px, 0.8, pz);
      coin.rotation.x = Math.PI / 2;
      this.coinsMeshes.push(coin);
      this.scene.add(coin);
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
    if (this.gameOver()) return;

    // Movement Controls
    const speed = 0.12;
    if (this.activeKeys.has('ArrowLeft') || this.activeKeys.has('a')) this.posX -= speed;
    if (this.activeKeys.has('ArrowRight') || this.activeKeys.has('d')) this.posX += speed;
    if (this.activeKeys.has('ArrowUp') || this.activeKeys.has('w')) this.posZ -= speed;
    if (this.activeKeys.has('ArrowDown') || this.activeKeys.has('s')) this.posZ += speed;

    // Jump Logic
    if (this.activeKeys.has(' ')) {
      this.jump();
    }

    // Gravity
    this.posY += this.velY;
    this.velY -= 0.015;

    if (this.posY <= 0.5) {
      this.posY = 0.5;
      this.velY = 0;
      this.isGrounded = true;
    }

    // Fall death check
    if (this.posY < -5) {
      this.gameOver.set(true);
      this.audioService.playExplosionSound();
    }

    this.playerMesh.position.set(this.posX, this.posY, this.posZ);

    // Camera follow
    this.camera.position.set(this.posX, this.posY + 3, this.posZ + 8);
    this.camera.lookAt(this.posX, this.posY, this.posZ);

    // Coin collection
    this.coinsMeshes.forEach((coin) => {
      if (coin.visible && Math.hypot(coin.position.x - this.posX, coin.position.z - this.posZ) < 0.8) {
        coin.visible = false;
        this.coins.update(c => c + 1);
        this.audioService.playCoinSound();
      }
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
