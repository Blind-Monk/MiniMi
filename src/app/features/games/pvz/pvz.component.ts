import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';

interface SeedCard {
  id: string;
  name: string;
  cost: number;
  rechargeTime: number; // in seconds
  icon: string;
  color: string;
  desc: string;
  lastUsedTime: number; // timestamp in ms
}

interface PlacedPlant3D {
  id: number;
  row: number;
  col: number;
  type: string;
  hp: number;
  maxHp: number;
  mesh: THREE.Group;
  lastAction: number;
  isArmed?: boolean; // for Potato Mine
  isDigesting?: boolean; // for Chomper
  digestEndTime?: number;
}

interface Zombie3D {
  id: number;
  row: number;
  x: number;
  type: 'shambler' | 'conehead' | 'buckethead' | 'runner';
  hp: number;
  maxHp: number;
  speed: number;
  mesh: THREE.Group;
  slowTimer: number; // frames remaining slowed
  hasVaulted?: boolean; // for Runner
}

interface Projectile3D {
  id: number;
  row: number;
  x: number;
  mesh: THREE.Mesh;
  isIce: boolean;
}

interface SunOrb3D {
  id: number;
  x: number;
  y: number;
  z: number;
  targetY: number;
  mesh: THREE.Group;
  value: number;
  spawnTime: number;
}

interface LawnMower3D {
  row: number;
  mesh: THREE.Group;
  active: boolean;
  used: boolean;
}

@Component({
  selector: 'app-pvz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- Top Bar: Resources, Waves & Game Controls -->
      <div class="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <!-- Sun Balance -->
          <div class="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-xl border border-amber-500/40 font-black text-xl shadow-inner">
            <span class="animate-bounce text-2xl">☀️</span>
            <span>{{ sun() }}</span>
          </div>

          <div class="flex flex-col text-xs text-slate-300">
            <span class="font-extrabold text-emerald-400 text-sm tracking-wide">GARDEN VS GROANERS 3D</span>
            <span>Wave: <strong class="text-amber-400">{{ wave() }}</strong> | Defeated: <strong class="text-teal-400">{{ kills() }}</strong></span>
          </div>
        </div>

        <!-- Action Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Shovel Button -->
          <button
            (click)="toggleShovel()"
            [class.ring-2]="shovelActive()"
            [class.ring-red-500]="shovelActive()"
            [class.bg-red-950]="shovelActive()"
            class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all">
            <span class="text-lg">🪣</span>
            <span>{{ shovelActive() ? 'Shovel Active' : 'Shovel' }}</span>
          </button>

          <!-- Speed Toggle -->
          <button (click)="toggleGameSpeed()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 text-xs font-bold transition-all">
            {{ gameSpeed() === 1 ? '⏩ 1x Speed' : '⚡ 2x Speed' }}
          </button>

          <!-- Pause / Resume -->
          <button (click)="togglePause()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold transition-all">
            {{ isPaused() ? '▶ Resume' : '⏸ Pause' }}
          </button>

          <!-- Fullscreen & Reset -->
          <button (click)="toggleFullscreen()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold">
            ⛶
          </button>
          <button (click)="restartGame()" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all">
            🔄 Restart
          </button>
        </div>
      </div>

      <!-- Seed Selector Bar -->
      <div class="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        @for (card of seedCards; track card.id) {
          <button
            (click)="selectSeed(card)"
            [disabled]="sun() < card.cost || isCardOnCooldown(card)"
            [class.ring-2]="selectedSeed()?.id === card.id && !shovelActive()"
            [class.ring-emerald-400]="selectedSeed()?.id === card.id && !shovelActive()"
            [class.scale-105]="selectedSeed()?.id === card.id && !shovelActive()"
            class="relative flex flex-col items-center justify-between bg-slate-900 border border-slate-700 p-2 rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-all cursor-pointer min-w-[95px] h-[75px] shrink-0 overflow-hidden">

            <div class="flex items-center gap-1.5 w-full justify-between">
              <span class="text-2xl">{{ card.icon }}</span>
              <span class="text-amber-300 font-black text-xs">{{ card.cost }}☀️</span>
            </div>

            <div class="text-center text-[11px] font-bold text-slate-200 leading-tight w-full truncate">
              {{ card.name }}
            </div>

            <!-- Cooldown Progress Overlay -->
            @if (getCooldownProgress(card) > 0) {
              <div
                class="absolute inset-0 bg-slate-950/80 flex items-center justify-center font-black text-xs text-amber-400 pointer-events-none"
                [style.height.%]="getCooldownProgress(card) * 100">
              </div>
            }
          </button>
        }
      </div>

      <!-- 3D Viewport Canvas Container -->
      <div #canvasContainer class="relative w-full aspect-[16/9] max-h-[560px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-crosshair"></canvas>

        <!-- Help Banner Overlay -->
        <div class="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
          @if (shovelActive()) {
            <span class="text-red-400 font-bold">🪣 Click any placed plant to shovel it up!</span>
          } @else if (selectedSeed()) {
            <span>🌱 Click an empty tile to plant <strong class="text-emerald-300">{{ selectedSeed()?.name }}</strong> | Click sun ☀️ to collect</span>
          } @else {
            <span>Select a seed card or collect falling sun ☀️</span>
          }
        </div>

        <!-- Pause Overlay -->
        @if (isPaused() && !gameOver()) {
          <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-20">
            <div class="bg-slate-900 border border-slate-700 p-6 rounded-2xl text-center space-y-3 shadow-2xl">
              <h2 class="text-2xl font-black text-amber-400">GAME PAUSED</h2>
              <button (click)="togglePause()" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-sm">
                Resume Game
              </button>
            </div>
          </div>
        }

        <!-- Game Over Overlay -->
        @if (gameOver()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center z-30 p-6">
            <span class="text-7xl animate-bounce">🧟‍♂️</span>
            <h2 class="text-4xl font-black text-red-500 tracking-wider drop-shadow-lg">THE ZOMBIES ATE YOUR BRAINS!</h2>
            <p class="text-slate-300 text-base max-w-md">You survived <strong class="text-amber-400">{{ wave() - 1 }}</strong> waves and vanquished <strong class="text-teal-400">{{ kills() }}</strong> groaners before your lawn was overrun.</p>
            <button (click)="restartGame()" class="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-lg rounded-xl shadow-xl hover:scale-105 transition-all">
              TRY AGAIN
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class PvzComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') containerRef!: ElementRef<HTMLDivElement>;

  // Catalog of 8 Classic Plants
  seedCards: SeedCard[] = [
    { id: 'sunbloom', name: 'Sunbloom', cost: 50, rechargeTime: 7.5, icon: '🌻', color: '#f59e0b', desc: 'Produces 25 Sun periodically', lastUsedTime: 0 },
    { id: 'peltpod', name: 'Pelt-Pod', cost: 100, rechargeTime: 7.5, icon: '🌱', color: '#10b981', desc: 'Shoots green seeds at zombies', lastUsedTime: 0 },
    { id: 'barkblock', name: 'Bark Block', cost: 50, rechargeTime: 20, icon: '🪵', color: '#885022', desc: 'Heavy wall with 120 HP', lastUsedTime: 0 },
    { id: 'frostpod', name: 'Frost Pod', cost: 175, rechargeTime: 7.5, icon: '❄️', color: '#38bdf8', desc: 'Shoots ice peas that slow enemies', lastUsedTime: 0 },
    { id: 'cherrybomb', name: 'Cherry Bomb', cost: 150, rechargeTime: 30, icon: '🍒', color: '#ef4444', desc: 'Explodes in a 3x3 area immediately', lastUsedTime: 0 },
    { id: 'twinpelt', name: 'Twin Pelt', cost: 200, rechargeTime: 7.5, icon: '🌿', color: '#059669', desc: 'Fires double seeds per burst', lastUsedTime: 0 },
    { id: 'snapplant', name: 'Snap Plant', cost: 150, rechargeTime: 7.5, icon: '🐊', color: '#16a34a', desc: 'Devours a zombie whole, then digests', lastUsedTime: 0 },
    { id: 'spudmine', name: 'Spud Mine', cost: 25, rechargeTime: 20, icon: '🥔', color: '#a16207', desc: 'Arms in 10s, explodes on contact', lastUsedTime: 0 }
  ];

  selectedSeed = signal<SeedCard | null>(this.seedCards[0]);
  sun = signal<number>(150);
  wave = signal<number>(1);
  kills = signal<number>(0);
  gameOver = signal<boolean>(false);
  isPaused = signal<boolean>(false);
  gameSpeed = signal<number>(1);
  shovelActive = signal<boolean>(false);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number = 0;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private placedPlants: PlacedPlant3D[] = [];
  private zombies: Zombie3D[] = [];
  private projectiles: Projectile3D[] = [];
  private sunOrbs: SunOrb3D[] = [];
  private lawnmowers: LawnMower3D[] = [];
  private lawnTiles: THREE.Mesh[] = [];

  private grassTexture!: THREE.CanvasTexture;
  private woodTexture!: THREE.CanvasTexture;

  private tickCount = 0;
  private nextId = 1;
  private lastSkySunTick = 0;

  ngAfterViewInit() {
    this.grassTexture = TextureGenerator.createGrassTexture();
    this.woodTexture = TextureGenerator.createWoodTexture(true);

    this.initThreeJS();
    this.buildLawn();
    this.createLawnmowers();
    this.startLoop();
  }

  selectSeed(card: SeedCard) {
    this.shovelActive.set(false);
    this.selectedSeed.set(card);
  }

  toggleShovel() {
    this.shovelActive.update(v => !v);
  }

  toggleGameSpeed() {
    this.gameSpeed.update(s => (s === 1 ? 2 : 1));
  }

  togglePause() {
    this.isPaused.update(p => !p);
  }

  toggleFullscreen() {
    const elem = this.containerRef.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  }

  isCardOnCooldown(card: SeedCard): boolean {
    if (card.lastUsedTime === 0) return false;
    const elapsed = (Date.now() - card.lastUsedTime) / 1000;
    return elapsed < card.rechargeTime;
  }

  getCooldownProgress(card: SeedCard): number {
    if (card.lastUsedTime === 0) return 0;
    const elapsed = (Date.now() - card.lastUsedTime) / 1000;
    if (elapsed >= card.rechargeTime) return 0;
    return (card.rechargeTime - elapsed) / card.rechargeTime;
  }

  restartGame() {
    this.clearWorld();
    this.sun.set(150);
    this.wave.set(1);
    this.kills.set(0);
    this.gameOver.set(false);
    this.isPaused.set(false);
    this.shovelActive.set(false);
    this.tickCount = 0;
    this.lastSkySunTick = 0;
    this.seedCards.forEach(c => c.lastUsedTime = 0);
    this.createLawnmowers();
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.018);

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 13, 14);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.5);
    dirLight.position.set(10, 20, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    canvas.addEventListener('click', (e) => this.onCanvasClick(e));
  }

  private buildLawn() {
    // Soil Base Frame
    const baseGeo = new THREE.BoxGeometry(11.5, 0.5, 7.5);
    const baseMat = new THREE.MeshStandardMaterial({
      map: this.woodTexture,
      roughness: 0.9
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -0.3, 0);
    baseMesh.receiveShadow = true;
    this.scene.add(baseMesh);

    // 5 Rows x 9 Cols Grass Lawn Grid
    const tileGeo = new THREE.BoxGeometry(1, 0.1, 1);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 9; c++) {
        const isDark = (r + c) % 2 === 0;
        const tileMat = new THREE.MeshStandardMaterial({
          map: this.grassTexture,
          color: isDark ? 0x22c55e : 0x16a34a,
          roughness: 0.5
        });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        const x = c - 4;
        const z = r - 2;
        tile.position.set(x, 0, z);
        tile.receiveShadow = true;
        tile.userData = { row: r, col: c };
        this.lawnTiles.push(tile);
        this.scene.add(tile);
      }
    }
  }

  private createLawnmowers() {
    this.lawnmowers.forEach(m => this.scene.remove(m.mesh));
    this.lawnmowers = [];

    for (let r = 0; r < 5; r++) {
      const group = new THREE.Group();

      const bodyGeo = new THREE.BoxGeometry(0.6, 0.3, 0.5);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.2;
      body.castShadow = true;
      group.add(body);

      const bladeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(-0.2, 0.1, 0);
      group.add(blade);

      group.position.set(-4.8, 0, r - 2);
      this.scene.add(group);

      this.lawnmowers.push({
        row: r,
        mesh: group,
        active: false,
        used: false
      });
    }
  }

  private onCanvasClick(event: MouseEvent) {
    if (this.gameOver() || this.isPaused()) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check Sun Orb Collection First
    const sunMeshes = this.sunOrbs.map(s => s.mesh);
    const sunHits = this.raycaster.intersectObjects(sunMeshes, true);
    if (sunHits.length > 0) {
      let hitMesh: THREE.Object3D | null = sunHits[0].object;
      while (hitMesh && !hitMesh.userData['orbIndex'] && hitMesh.parent) {
        if (hitMesh.userData['orbIndex'] !== undefined) break;
        hitMesh = hitMesh.parent;
      }
      const orbIdx = this.sunOrbs.findIndex(s => s.mesh === hitMesh || s.mesh === sunHits[0].object || s.mesh === sunHits[0].object.parent);
      if (orbIdx !== -1) {
        this.collectSun(orbIdx);
        return;
      }
    }

    // 2. Check Lawn Tile Clicking
    const tileHits = this.raycaster.intersectObjects(this.lawnTiles);
    if (tileHits.length > 0) {
      const tile = tileHits[0].object as THREE.Mesh;
      const { row, col } = tile.userData;

      if (this.shovelActive()) {
        this.shovelPlant(row, col);
      } else {
        this.placePlant(row, col);
      }
    }
  }

  private shovelPlant(row: number, col: number) {
    const idx = this.placedPlants.findIndex(p => p.row === row && p.col === col);
    if (idx !== -1) {
      const plant = this.placedPlants[idx];
      this.scene.remove(plant.mesh);
      this.placedPlants.splice(idx, 1);
    }
  }

  private placePlant(row: number, col: number) {
    const card = this.selectedSeed();
    if (!card || this.sun() < card.cost || this.isCardOnCooldown(card)) return;
    if (this.placedPlants.some(p => p.row === row && p.col === col)) return;

    this.sun.update(s => s - card.cost);
    card.lastUsedTime = Date.now();

    const x = col - 4;
    const z = row - 2;
    const mesh = this.createPlantMesh(card.id);
    mesh.position.set(x, 0.1, z);
    this.scene.add(mesh);

    if (card.id === 'cherrybomb') {
      this.triggerCherryExplosion(row, col, x, z);
      this.scene.remove(mesh);
      return;
    }

    const maxHp = card.id === 'barkblock' ? 120 : 30;
    this.placedPlants.push({
      id: this.nextId++,
      row,
      col,
      type: card.id,
      hp: maxHp,
      maxHp,
      mesh,
      lastAction: this.tickCount,
      isArmed: card.id === 'spudmine' ? false : undefined
    });
  }

  private createPlantMesh(type: string): THREE.Group {
    const group = new THREE.Group();

    if (type === 'sunbloom') {
      const stemGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.3;
      stem.castShadow = true;
      group.add(stem);

      const headGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.6;
      head.rotation.x = Math.PI / 4;
      head.castShadow = true;
      group.add(head);
    } else if (type === 'peltpod' || type === 'twinpelt' || type === 'frostpod') {
      const colorMap: Record<string, number> = {
        peltpod: 0x22c55e,
        twinpelt: 0x059669,
        frostpod: 0x38bdf8
      };
      const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.25;
      stem.castShadow = true;
      group.add(stem);

      const shooterGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const shooterMat = new THREE.MeshStandardMaterial({ color: colorMap[type], roughness: 0.2 });
      const shooter = new THREE.Mesh(shooterGeo, shooterMat);
      shooter.position.set(0, 0.5, 0.1);
      shooter.castShadow = true;
      group.add(shooter);
    } else if (type === 'barkblock') {
      const wallGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      const wallMat = new THREE.MeshStandardMaterial({ map: this.woodTexture, roughness: 0.9 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.y = 0.35;
      wall.castShadow = true;
      group.add(wall);
    } else if (type === 'snapplant') {
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x14532d });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.2;
      group.add(stem);

      const jawGeo = new THREE.BoxGeometry(0.5, 0.3, 0.4);
      const jawMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
      const jaw = new THREE.Mesh(jawGeo, jawMat);
      jaw.position.set(0, 0.4, 0.1);
      jaw.castShadow = true;
      group.add(jaw);
    } else if (type === 'spudmine') {
      const mineGeo = new THREE.SphereGeometry(0.25, 12, 12);
      const mineMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
      const mine = new THREE.Mesh(mineGeo, mineMat);
      mine.position.y = 0.1;
      mine.scale.y = 0.6;
      group.add(mine);
    }

    return group;
  }

  private triggerCherryExplosion(row: number, col: number, worldX: number, worldZ: number) {
    const expGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const expMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const expMesh = new THREE.Mesh(expGeo, expMat);
    expMesh.position.set(worldX, 0.5, worldZ);
    this.scene.add(expMesh);

    setTimeout(() => this.scene.remove(expMesh), 350);

    this.zombies.forEach(z => {
      if (Math.abs(z.row - row) <= 1 && Math.abs((z.x - 4) - worldX) <= 1.6) {
        z.hp -= 180;
      }
    });
  }

  private spawnZombie() {
    const row = Math.floor(Math.random() * 5);
    const types: ('shambler' | 'conehead' | 'buckethead' | 'runner')[] = ['shambler', 'conehead', 'buckethead', 'runner'];
    const type = types[Math.floor(Math.random() * types.length)];

    const mesh = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.4;
    body.castShadow = true;
    mesh.add(body);

    const headGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.9;
    head.castShadow = true;
    mesh.add(head);

    if (type === 'conehead') {
      const coneGeo = new THREE.ConeGeometry(0.2, 0.4, 8);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 1.25;
      cone.castShadow = true;
      mesh.add(cone);
    } else if (type === 'buckethead') {
      const buckGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.3);
      const buckMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const bucket = new THREE.Mesh(buckGeo, buckMat);
      bucket.position.y = 1.2;
      bucket.castShadow = true;
      mesh.add(bucket);
    } else if (type === 'runner') {
      const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(0.2, 0.7, 0);
      pole.rotation.z = Math.PI / 6;
      mesh.add(pole);
    }

    const startX = 8.5;
    const startZ = row - 2;
    mesh.position.set(startX - 4, 0, startZ);
    this.scene.add(mesh);

    const hpMap = { shambler: 50, conehead: 120, buckethead: 220, runner: 40 };
    const speedMap = { shambler: 0.015, conehead: 0.015, buckethead: 0.012, runner: 0.035 };

    this.zombies.push({
      id: this.nextId++,
      row,
      x: startX,
      type,
      hp: hpMap[type],
      maxHp: hpMap[type],
      speed: speedMap[type],
      mesh,
      slowTimer: 0
    });
  }

  private spawnSunOrb(x: number, y: number, z: number, targetY = 0.5) {
    const group = new THREE.Group();
    const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xfcb316 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    group.add(orb);

    group.position.set(x, y, z);
    this.scene.add(group);

    const orbIndex = this.sunOrbs.length;
    group.userData['orbIndex'] = orbIndex;

    this.sunOrbs.push({
      id: this.nextId++,
      x, y, z,
      targetY,
      mesh: group,
      value: 25,
      spawnTime: this.tickCount
    });
  }

  private collectSun(index: number) {
    if (index < 0 || index >= this.sunOrbs.length) return;
    const orb = this.sunOrbs[index];
    this.sun.update(s => s + orb.value);
    this.scene.remove(orb.mesh);
    this.sunOrbs.splice(index, 1);
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);

      if (!this.gameOver() && !this.isPaused()) {
        const iterations = this.gameSpeed();
        for (let i = 0; i < iterations; i++) {
          this.tickCount++;
          this.updateGameLogic();
        }
      }

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private updateGameLogic() {
    // 1. Sky Sun Drops (every ~10s)
    if (this.tickCount - this.lastSkySunTick >= 300) {
      const rx = (Math.random() * 8) - 4;
      const rz = (Math.random() * 4) - 2;
      this.spawnSunOrb(rx, 6, rz, 0.5);
      this.lastSkySunTick = this.tickCount;
    }

    // 2. Spawning Zombie Waves
    if (this.tickCount % 160 === 0) {
      this.spawnZombie();
      if (this.tickCount % 600 === 0) {
        this.wave.update(w => w + 1);
      }
    }

    // 3. Plant Logic & Actions
    this.placedPlants.forEach(plant => {
      // Idle Sway animation
      plant.mesh.rotation.z = Math.sin(this.tickCount * 0.05) * 0.05;

      if (plant.type === 'sunbloom' && (this.tickCount - plant.lastAction) >= 240) {
        const x = plant.col - 4;
        const z = plant.row - 2;
        this.spawnSunOrb(x, 0.5, z, 0.5);
        plant.lastAction = this.tickCount;
      }
      else if ((plant.type === 'peltpod' || plant.type === 'frostpod' || plant.type === 'twinpelt') && (this.tickCount - plant.lastAction) >= 45) {
        const hasZombieInLane = this.zombies.some(z => z.row === plant.row && z.x > plant.col);
        if (hasZombieInLane) {
          const isIce = plant.type === 'frostpod';
          const isDouble = plant.type === 'twinpelt';
          const x = plant.col - 4 + 0.3;
          const z = plant.row - 2;

          this.fireProjectile(plant.row, x, z, isIce);
          if (isDouble) {
            setTimeout(() => this.fireProjectile(plant.row, x, z, false), 150);
          }

          plant.lastAction = this.tickCount;
        }
      }
      else if (plant.type === 'spudmine') {
        if (!plant.isArmed && (this.tickCount - plant.lastAction) >= 200) {
          plant.isArmed = true;
          plant.mesh.position.y = 0.25; // pop out when armed
        }
        if (plant.isArmed) {
          const zInRange = this.zombies.find(z => z.row === plant.row && Math.abs((z.x - 4) - (plant.col - 4)) < 0.4);
          if (zInRange) {
            zInRange.hp -= 180;
            plant.hp = 0; // explode
          }
        }
      }
      else if (plant.type === 'snapplant') {
        if (!plant.isDigesting) {
          const zTarget = this.zombies.find(z => z.row === plant.row && Math.abs((z.x - 4) - (plant.col - 4)) < 0.6);
          if (zTarget) {
            zTarget.hp = 0; // devour
            plant.isDigesting = true;
            plant.digestEndTime = this.tickCount + 300; // 10s digest
          }
        } else if (plant.digestEndTime && this.tickCount >= plant.digestEndTime) {
          plant.isDigesting = false;
        }
      }
    });

    // 4. Projectiles Movement & Collision
    const remainingProjs: Projectile3D[] = [];
    this.projectiles.forEach(p => {
      p.mesh.position.x += 0.14;
      p.x += 0.14;

      let hit = false;
      this.zombies.forEach(z => {
        if (!hit && z.row === p.row && Math.abs((z.x - 4) - p.mesh.position.x) < 0.35) {
          z.hp -= 15;
          if (p.isIce) {
            z.slowTimer = 90; // slow for 3 seconds
          }
          hit = true;
        }
      });

      if (hit || p.mesh.position.x > 4.8) {
        this.scene.remove(p.mesh);
      } else {
        remainingProjs.push(p);
      }
    });
    this.projectiles = remainingProjs;

    // 5. Lawnmower Movement & Logic
    this.lawnmowers.forEach(lm => {
      if (lm.active) {
        lm.mesh.position.x += 0.25;
        this.zombies.forEach(z => {
          if (z.row === lm.row && Math.abs((z.x - 4) - lm.mesh.position.x) < 0.6) {
            z.hp = 0;
          }
        });
        if (lm.mesh.position.x > 5.5) {
          this.scene.remove(lm.mesh);
          lm.active = false;
        }
      }
    });

    // 6. Zombies Movement & Eating Logic
    const remainingZombies: Zombie3D[] = [];
    this.zombies.forEach(z => {
      if (z.hp <= 0) {
        this.scene.remove(z.mesh);
        this.kills.update(k => k + 1);
        return;
      }

      // Handle Slow Timer
      let currentSpeed = z.speed;
      if (z.slowTimer > 0) {
        z.slowTimer--;
        currentSpeed *= 0.5;
      }

      const worldX = z.x - 4;
      const targetPlant = this.placedPlants.find(p => p.row === z.row && Math.abs((p.col - 4) - worldX) < 0.4);

      if (z.type === 'runner' && !z.hasVaulted && targetPlant) {
        // Vault over first plant
        z.hasVaulted = true;
        z.x -= 1.2;
        z.speed = 0.015; // slow down after vault
      } else if (targetPlant) {
        targetPlant.hp -= 0.3; // Eat plant
      } else {
        z.x -= currentSpeed;
        z.mesh.position.x = z.x - 4;
        z.mesh.position.z = (z.row - 2) + Math.sin(this.tickCount * 0.1) * 0.05; // Walk wobble
      }

      // Trigger Lawnmower if reached left edge
      if (z.x - 4 <= -4.2) {
        const lm = this.lawnmowers.find(m => m.row === z.row && !m.used);
        if (lm) {
          lm.active = true;
          lm.used = true;
        }
      }

      // Reached house behind lawnmowers -> Lose Level!
      if (z.x - 4 < -4.8) {
        this.gameOver.set(true);
      } else {
        remainingZombies.push(z);
      }
    });
    this.zombies = remainingZombies;

    // 7. Cleanup Destroyed Plants
    const activePlants: PlacedPlant3D[] = [];
    this.placedPlants.forEach(p => {
      if (p.hp <= 0) {
        this.scene.remove(p.mesh);
      } else {
        activePlants.push(p);
      }
    });
    this.placedPlants = activePlants;

    // 8. Sun Orbs Falling & Expiration
    const activeOrbs: SunOrb3D[] = [];
    this.sunOrbs.forEach(orb => {
      if (orb.y > orb.targetY) orb.y -= 0.05;
      orb.mesh.position.y = orb.y;

      // Auto fade/expire after 15s
      if (this.tickCount - orb.spawnTime > 450) {
        this.scene.remove(orb.mesh);
      } else {
        activeOrbs.push(orb);
      }
    });
    this.sunOrbs = activeOrbs;
  }

  private fireProjectile(row: number, x: number, z: number, isIce: boolean) {
    const pGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: isIce ? 0x38bdf8 : 0x84cc16 });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.set(x, 0.5, z);
    this.scene.add(pMesh);

    this.projectiles.push({
      id: this.nextId++,
      row,
      x: x + 4,
      mesh: pMesh,
      isIce
    });
  }

  private clearWorld() {
    this.placedPlants.forEach(p => this.scene.remove(p.mesh));
    this.zombies.forEach(z => this.scene.remove(z.mesh));
    this.projectiles.forEach(p => this.scene.remove(p.mesh));
    this.sunOrbs.forEach(s => this.scene.remove(s.mesh));
    this.lawnmowers.forEach(m => this.scene.remove(m.mesh));

    this.placedPlants = [];
    this.zombies = [];
    this.projectiles = [];
    this.sunOrbs = [];
    this.lawnmowers = [];
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
