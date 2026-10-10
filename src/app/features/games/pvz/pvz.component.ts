import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';

interface SeedCard {
  id: string;
  name: string;
  cost: number;
  icon: string;
  color: string;
  desc: string;
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
}

interface Projectile3D {
  id: number;
  row: number;
  x: number;
  mesh: THREE.Mesh;
}

interface SunOrb3D {
  id: number;
  x: number;
  y: number;
  z: number;
  mesh: THREE.Group;
  value: number;
}

@Component({
  selector: 'app-pvz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top Header & Mode Switcher -->
      <div class="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-xl border border-amber-500/40 font-extrabold text-xl shadow-inner">
            <span class="animate-pulse">☀️</span>
            <span>{{ sun() }}</span>
          </div>
          <div class="hidden sm:flex flex-col text-xs text-slate-400">
            <span class="font-bold text-teal-400">GARDEN VS GROANERS 3D</span>
            <span>Wave: {{ wave() }} | Defeated: {{ kills() }}</span>
          </div>
        </div>

        <!-- Mode Selector -->
        <div class="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button (click)="setGameMode('standard')" [class.bg-teal-600]="gameMode() === 'standard'" class="px-3 py-1.5 rounded-lg transition-all">
            🌱 Lawn Defense
          </button>
          <button (click)="setGameMode('bowling')" [class.bg-teal-600]="gameMode() === 'bowling'" class="px-3 py-1.5 rounded-lg transition-all">
            🎳 Bowling
          </button>
          <button (click)="setGameMode('zen')" [class.bg-teal-600]="gameMode() === 'zen'" class="px-3 py-1.5 rounded-lg transition-all">
            🌸 Zen Garden
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="toggleFullscreen()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-bold">
            ⛶ Fullscreen
          </button>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold shadow">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Seed Selector Bar -->
      <div class="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-1">
        @for (card of seedCards; track card.id) {
          <button
            (click)="selectSeed(card)"
            [disabled]="sun() < card.cost"
            [class.ring-2]="selectedSeed()?.id === card.id"
            [class.ring-teal-400]="selectedSeed()?.id === card.id"
            [class.scale-105]="selectedSeed()?.id === card.id"
            class="flex items-center gap-2 bg-slate-900 border border-slate-700 p-2 rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-all cursor-pointer min-w-[110px]">
            <span class="text-2xl">{{ card.icon }}</span>
            <div class="text-left text-xs">
              <div class="font-bold text-slate-100 leading-tight">{{ card.name }}</div>
              <div class="text-amber-400 font-extrabold mt-0.5">{{ card.cost }} ☀️</div>
            </div>
          </button>
        }
      </div>

      <!-- 3D Viewport Canvas Container -->
      <div #canvasContainer class="relative w-full aspect-[16/9] max-h-[560px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
        <canvas #canvas class="w-full h-full block cursor-crosshair"></canvas>

        <div class="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 pointer-events-none">
          🎯 Click tiles to place plant • Sun collects automatically or on click
        </div>

        @if (gameOver()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center z-20">
            <span class="text-6xl animate-bounce">🧟‍♂️</span>
            <h2 class="text-3xl font-black text-red-500 tracking-wider">THE ZOMBIES ATE YOUR BRAINS!</h2>
            <p class="text-slate-300 text-sm">You survived {{ wave() - 1 }} waves and defeated {{ kills() }} zombies.</p>
            <button (click)="restartGame()" class="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-xl hover:scale-105 transition-all">
              PLAY AGAIN
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

  seedCards: SeedCard[] = [
    { id: 'sunbloom', name: 'Sunbloom', cost: 50, icon: '🌻', color: '#f59e0b', desc: 'Produces 25 Sun periodically' },
    { id: 'peltpod', name: 'Pelt-Pod', cost: 100, icon: '🌱', color: '#10b981', desc: 'Shoots green seeds at zombies' },
    { id: 'barkblock', name: 'Bark Block', cost: 50, icon: '🪵', color: '#885022', desc: 'Heavy wall with high health' },
    { id: 'cherrybomb', name: 'Cherry Bomb', cost: 150, icon: '🍒', color: '#ef4444', desc: 'Explodes immediately in a 3x3 area' }
  ];

  selectedSeed = signal<SeedCard | null>(this.seedCards[0]);
  sun = signal<number>(150);
  wave = signal<number>(1);
  kills = signal<number>(0);
  gameOver = signal<boolean>(false);
  gameMode = signal<'standard' | 'bowling' | 'zen'>('standard');

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
  private lawnTiles: THREE.Mesh[] = [];

  private grassTexture!: THREE.CanvasTexture;
  private woodTexture!: THREE.CanvasTexture;

  private tickCount = 0;
  private nextId = 1;

  ngAfterViewInit() {
    this.grassTexture = TextureGenerator.createGrassTexture();
    this.woodTexture = TextureGenerator.createWoodTexture(true);

    this.initThreeJS();
    this.buildLawn();
    this.startLoop();
  }

  selectSeed(card: SeedCard) {
    this.selectedSeed.set(card);
  }

  setGameMode(mode: 'standard' | 'bowling' | 'zen') {
    this.gameMode.set(mode);
    this.restartGame();
  }

  toggleFullscreen() {
    const elem = this.containerRef.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  }

  restartGame() {
    this.clearWorld();
    this.sun.set(150);
    this.wave.set(1);
    this.kills.set(0);
    this.gameOver.set(false);
    this.tickCount = 0;
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 12, 14);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
    dirLight.position.set(8, 16, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    canvas.addEventListener('click', (e) => this.onCanvasClick(e));
  }

  private buildLawn() {
    // Textured Soil Base
    const baseGeo = new THREE.BoxGeometry(11, 0.5, 7);
    const baseMat = new THREE.MeshStandardMaterial({
      map: this.woodTexture,
      roughness: 0.9
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -0.3, 0);
    baseMesh.receiveShadow = true;
    this.scene.add(baseMesh);

    // Textured Grass Grid
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

  private onCanvasClick(event: MouseEvent) {
    if (this.gameOver()) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const sunMeshes = this.sunOrbs.map(s => s.mesh);
    const sunHits = this.raycaster.intersectObjects(sunMeshes, true);
    if (sunHits.length > 0) {
      const parent = sunHits[0].object.parent;
      const orbIdx = this.sunOrbs.findIndex(s => s.mesh === parent || s.mesh === sunHits[0].object);
      if (orbIdx !== -1) {
        this.collectSun(orbIdx);
        return;
      }
    }

    const tileHits = this.raycaster.intersectObjects(this.lawnTiles);
    if (tileHits.length > 0) {
      const tile = tileHits[0].object as THREE.Mesh;
      const { row, col } = tile.userData;
      this.placePlant(row, col);
    }
  }

  private placePlant(row: number, col: number) {
    const card = this.selectedSeed();
    if (!card || this.sun() < card.cost) return;
    if (this.placedPlants.some(p => p.row === row && p.col === col)) return;

    this.sun.update(s => s - card.cost);

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
      lastAction: this.tickCount
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
    } else if (type === 'peltpod') {
      const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.25;
      stem.castShadow = true;
      group.add(stem);

      const shooterGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const shooterMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.2 });
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
    }

    return group;
  }

  private triggerCherryExplosion(row: number, col: number, worldX: number, worldZ: number) {
    const expGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const expMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const expMesh = new THREE.Mesh(expGeo, expMat);
    expMesh.position.set(worldX, 0.5, worldZ);
    this.scene.add(expMesh);

    setTimeout(() => this.scene.remove(expMesh), 300);

    this.zombies.forEach(z => {
      if (Math.abs(z.row - row) <= 1 && Math.abs(z.x - col) <= 1.5) {
        z.hp -= 150;
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
    }

    const startX = 4.5;
    const startZ = row - 2;
    mesh.position.set(startX, 0, startZ);
    this.scene.add(mesh);

    const hpMap = { shambler: 50, conehead: 90, buckethead: 140, runner: 40 };
    const speedMap = { shambler: 0.02, conehead: 0.018, buckethead: 0.015, runner: 0.04 };

    this.zombies.push({
      id: this.nextId++,
      row,
      x: 8.5,
      type,
      hp: hpMap[type],
      maxHp: hpMap[type],
      speed: speedMap[type],
      mesh
    });
  }

  private spawnSunOrb(x: number, y: number, z: number) {
    const group = new THREE.Group();
    const orbGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0xfcb316 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    group.add(orb);

    group.position.set(x, y, z);
    this.scene.add(group);

    this.sunOrbs.push({
      id: this.nextId++,
      x, y, z,
      mesh: group,
      value: 25
    });
  }

  private collectSun(index: number) {
    const orb = this.sunOrbs[index];
    this.sun.update(s => s + orb.value);
    this.scene.remove(orb.mesh);
    this.sunOrbs.splice(index, 1);
  }

  private startLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.tickCount++;

      if (!this.gameOver()) {
        this.updateGameLogic();
      }

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  private updateGameLogic() {
    if (this.tickCount % 120 === 0) {
      this.spawnZombie();
      if (this.tickCount % 600 === 0) {
        this.wave.update(w => w + 1);
      }
    }

    if (this.tickCount % 200 === 0) {
      const rx = (Math.random() * 8) - 4;
      const rz = (Math.random() * 4) - 2;
      this.spawnSunOrb(rx, 3, rz);
    }

    this.placedPlants.forEach(plant => {
      if (plant.type === 'sunbloom' && (this.tickCount - plant.lastAction) >= 180) {
        const x = plant.col - 4;
        const z = plant.row - 2;
        this.spawnSunOrb(x, 0.5, z);
        plant.lastAction = this.tickCount;
      } else if (plant.type === 'peltpod' && (this.tickCount - plant.lastAction) >= 40) {
        const hasZombie = this.zombies.some(z => z.row === plant.row && z.x > plant.col);
        if (hasZombie) {
          const x = plant.col - 4 + 0.3;
          const z = plant.row - 2;
          const pGeo = new THREE.SphereGeometry(0.1, 8, 8);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x84cc16 });
          const pMesh = new THREE.Mesh(pGeo, pMat);
          pMesh.position.set(x, 0.5, z);
          this.scene.add(pMesh);

          this.projectiles.push({
            id: this.nextId++,
            row: plant.row,
            x: plant.col,
            mesh: pMesh
          });
          plant.lastAction = this.tickCount;
        }
      }
    });

    const remainingProjs: Projectile3D[] = [];
    this.projectiles.forEach(p => {
      p.mesh.position.x += 0.12;
      p.x += 0.12;

      let hit = false;
      this.zombies.forEach(z => {
        if (!hit && z.row === p.row && Math.abs((z.x - 4) - p.mesh.position.x) < 0.3) {
          z.hp -= 15;
          hit = true;
        }
      });

      if (hit || p.mesh.position.x > 4.5) {
        this.scene.remove(p.mesh);
      } else {
        remainingProjs.push(p);
      }
    });
    this.projectiles = remainingProjs;

    const remainingZombies: Zombie3D[] = [];
    this.zombies.forEach(z => {
      if (z.hp <= 0) {
        this.scene.remove(z.mesh);
        this.kills.update(k => k + 1);
        return;
      }

      const targetPlant = this.placedPlants.find(p => p.row === z.row && Math.abs((p.col - 4) - (z.x - 4)) < 0.4);
      if (targetPlant) {
        targetPlant.hp -= 0.5;
      } else {
        z.x -= z.speed;
        z.mesh.position.x = z.x - 4;
      }

      if (z.mesh.position.x < -4.5) {
        this.gameOver.set(true);
      } else {
        remainingZombies.push(z);
      }
    });
    this.zombies = remainingZombies;

    const activePlants: PlacedPlant3D[] = [];
    this.placedPlants.forEach(p => {
      if (p.hp <= 0) {
        this.scene.remove(p.mesh);
      } else {
        activePlants.push(p);
      }
    });
    this.placedPlants = activePlants;

    const activeOrbs: SunOrb3D[] = [];
    this.sunOrbs.forEach(orb => {
      if (orb.y > 0.5) orb.y -= 0.03;
      orb.mesh.position.y = orb.y;
      activeOrbs.push(orb);
    });
    this.sunOrbs = activeOrbs;
  }

  private clearWorld() {
    this.placedPlants.forEach(p => this.scene.remove(p.mesh));
    this.zombies.forEach(z => this.scene.remove(z.mesh));
    this.projectiles.forEach(p => this.scene.remove(p.mesh));
    this.sunOrbs.forEach(s => this.scene.remove(s.mesh));

    this.placedPlants = [];
    this.zombies = [];
    this.projectiles = [];
    this.sunOrbs = [];
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
