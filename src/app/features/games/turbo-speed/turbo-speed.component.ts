import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';

interface PlayerConfig {
  id: number;
  name: string;
  color: string;
  active: boolean;
  useGamepad: boolean;
  gamepadIndex: number;
  keys: {
    up: string;
    down: string;
    left: string;
    right: string;
  };
}

interface CarState {
  x: number;
  z: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  accel: number;
  steer: number;
  lap: number;
  checkpoint: number;
  mesh: THREE.Group;
  color: string;
  isAI: boolean;
}

@Component({
  selector: 'app-turbo-speed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-6xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top HUD Header -->
      <div class="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-xl font-black shadow-lg">
            🏎️
          </div>
          <div>
            <h2 class="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
              TURBO SPEED II SE (RETRO 3D)
            </h2>
            <p class="text-xs text-slate-400">Split-screen 1–4 Player • Joystick & Custom Keys Supported</p>
          </div>
        </div>

        <!-- Player Count Switcher -->
        <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
          <span class="text-slate-400 px-1">Players:</span>
          @for (count of [1, 2, 3, 4]; track count) {
            <button
              (click)="setPlayerCount(count)"
              [class.bg-red-600]="playerCount() === count"
              class="px-3 py-1 rounded-lg transition-all">
              {{ count }}P
            </button>
          }
        </div>

        <div class="flex items-center gap-2">
          <button (click)="toggleKeyConfigModal()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 text-xs font-bold">
            ⚙️ Keybindings
          </button>
          <button (click)="toggleFullscreen()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs font-bold">
            ⛶ Fullscreen
          </button>
          <button (click)="restartRace()" class="px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold shadow">
            🏁 Restart Race
          </button>
        </div>
      </div>

      <!-- 3D Racing Viewport Canvas Container -->
      <div #container class="relative w-full aspect-[16/9] max-h-[600px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl">
        <canvas #canvas class="w-full h-full block"></canvas>

        <!-- Floating HUD Overlay -->
        <div class="absolute top-3 left-3 flex gap-2">
          @for (pIdx of getActivePlayerIndices(); track pIdx) {
            <div class="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-bold flex items-center gap-2">
              <span [style.color]="playerConfigs[pIdx].color">PLAYER {{ pIdx + 1 }}</span>
              <span class="text-amber-400 font-mono">P{{ getPosition(pIdx) }}</span>
              <span class="text-teal-400 font-mono">LAP {{ cars[pIdx]?.lap || 1 }}/3</span>
              <span class="text-red-400 font-mono">{{ getDisplaySpeed(pIdx) }} KM/H</span>
            </div>
          }
        </div>

        <!-- Winner Overlay -->
        @if (raceWinner()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center z-30">
            <span class="text-6xl animate-bounce">🏆</span>
            <h2 class="text-4xl font-black text-amber-400 tracking-wider">{{ raceWinner() }} WINS THE RACE!</h2>
            <button (click)="restartRace()" class="px-8 py-3 bg-gradient-to-r from-red-600 to-amber-500 text-slate-950 font-black rounded-xl shadow-xl hover:scale-105 transition-all">
              PLAY AGAIN
            </button>
          </div>
        }
      </div>

      <!-- Keybindings Config Modal -->
      @if (showKeyModal()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 class="text-lg font-bold text-amber-400">⚙️ Configure Player Keybindings & Joysticks</h3>
              <button (click)="toggleKeyConfigModal()" class="text-slate-400 hover:text-white font-bold text-xl">✕</button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              @for (cfg of playerConfigs; track cfg.id) {
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div class="flex items-center justify-between font-bold" [style.color]="cfg.color">
                    <span>PLAYER {{ cfg.id + 1 }}</span>
                    <label class="flex items-center gap-1 cursor-pointer text-slate-300 font-normal">
                      <input type="checkbox" [(ngModel)]="cfg.useGamepad" class="rounded bg-slate-800 border-slate-700 text-red-500">
                      Gamepad
                    </label>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-slate-300">
                    <div>Accelerate: <span class="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">{{ cfg.keys.up }}</span></div>
                    <div>Brake/Rev: <span class="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">{{ cfg.keys.down }}</span></div>
                    <div>Steer Left: <span class="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">{{ cfg.keys.left }}</span></div>
                    <div>Steer Right: <span class="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-amber-300">{{ cfg.keys.right }}</span></div>
                  </div>
                </div>
              }
            </div>

            <div class="text-right pt-2 border-t border-slate-800">
              <button (click)="toggleKeyConfigModal()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg text-xs">
                Save & Close
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class TurboSpeedComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  playerCount = signal<number>(1);
  raceWinner = signal<string | null>(null);
  showKeyModal = signal<boolean>(false);

  playerConfigs: PlayerConfig[] = [
    { id: 0, name: 'P1 Red Viper', color: '#ef4444', active: true, useGamepad: false, gamepadIndex: 0, keys: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' } },
    { id: 1, name: 'P2 Blue Stealth', color: '#3b82f6', active: false, useGamepad: false, gamepadIndex: 1, keys: { up: 'w', down: 's', left: 'a', right: 'd' } },
    { id: 2, name: 'P3 Yellow Comet', color: '#eab308', active: false, useGamepad: false, gamepadIndex: 2, keys: { up: 'i', down: 'k', left: 'j', right: 'l' } },
    { id: 3, name: 'P4 Green Beast', color: '#22c55e', active: false, useGamepad: false, gamepadIndex: 3, keys: { up: '8', down: '5', left: '4', right: '6' } }
  ];

  cars: CarState[] = [];
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number = 0;
  private activeKeys = new Set<string>();

  private asphaltTexture!: THREE.CanvasTexture;
  private grassTexture!: THREE.CanvasTexture;

  ngAfterViewInit() {
    this.asphaltTexture = TextureGenerator.createAsphaltTexture();
    this.grassTexture = TextureGenerator.createGrassTexture();

    this.initRaceWorld();
    this.startRaceLoop();
  }

  setPlayerCount(count: number) {
    this.playerCount.set(count);
    this.playerConfigs.forEach((cfg, idx) => cfg.active = idx < count);
    this.restartRace();
  }

  getActivePlayerIndices(): number[] {
    return Array.from({ length: this.playerCount() }, (_, i) => i);
  }

  toggleKeyConfigModal() {
    this.showKeyModal.update(v => !v);
  }

  toggleFullscreen() {
    const elem = this.containerRef.nativeElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  }

  restartRace() {
    this.raceWinner.set(null);
    this.cars.forEach((car, idx) => {
      car.x = -10 - idx * 5;
      car.z = 0;
      car.angle = Math.PI / 2;
      car.speed = 0;
      car.lap = 1;
      car.checkpoint = 0;
      car.mesh.position.set(car.x, 0.2, car.z);
      car.mesh.rotation.y = car.angle;
    });
  }

  getPosition(pIdx: number): number {
    if (!this.cars[pIdx]) return 1;
    const pCar = this.cars[pIdx];
    let pos = 1;
    this.cars.forEach((other, idx) => {
      if (idx !== pIdx) {
        if (other.lap > pCar.lap || (other.lap === pCar.lap && other.checkpoint > pCar.checkpoint)) {
          pos++;
        }
      }
    });
    return pos;
  }

  getDisplaySpeed(pIdx: number): number {
    if (!this.cars[pIdx]) return 0;
    return Math.round(Math.abs(this.cars[pIdx].speed) * 180);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    this.activeKeys.add(e.key);
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    this.activeKeys.delete(e.key);
  }

  private initRaceWorld() {
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0284c7);
    this.scene.fog = new THREE.FogExp2(0x0284c7, 0.005);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setScissorTest(true);

    // Textured Grass Turf Ground
    const grassGeo = new THREE.PlaneGeometry(500, 500);
    const grassMat = new THREE.MeshStandardMaterial({
      map: this.grassTexture,
      roughness: 0.8
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    this.scene.add(grass);

    // Textured Asphalt Circuit
    this.buildCircuitTrack();

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(amb);

    const sun = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sun.position.set(50, 100, 50);
    this.scene.add(sun);

    // Cars with Glossy Metallic PBR finish
    const carColors = ['#ef4444', '#3b82f6', '#eab308', '#22c55e', '#a855f7', '#ec4899'];
    for (let i = 0; i < 6; i++) {
      const isAI = i >= this.playerCount();
      const color = carColors[i];
      const mesh = this.createCarMesh(color);
      const x = -10 - i * 4;
      const z = 0;
      mesh.position.set(x, 0.2, z);
      mesh.rotation.y = Math.PI / 2;
      this.scene.add(mesh);

      this.cars.push({
        x, z,
        angle: Math.PI / 2,
        speed: 0,
        maxSpeed: isAI ? 0.8 : 1.0,
        accel: 0.02,
        steer: 0.04,
        lap: 1,
        checkpoint: 0,
        mesh,
        color,
        isAI
      });
    }
  }

  private buildCircuitTrack() {
    const trackCurve = new THREE.EllipseCurve(0, 0, 80, 50, 0, 2 * Math.PI, false, 0);
    const points = trackCurve.getPoints(100);

    const shape = new THREE.Shape();
    points.forEach((p, idx) => {
      if (idx === 0) shape.moveTo(p.x, p.y);
      else shape.lineTo(p.x, p.y);
    });

    const extrudeSettings = { depth: 0.1, bevelEnabled: false };
    const roadGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.asphaltTexture,
      roughness: 0.4,
      metalness: 0.1
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = Math.PI / 2;
    roadMesh.position.y = 0.05;
    this.scene.add(roadMesh);
  }

  private createCarMesh(colorHex: string): THREE.Group {
    const group = new THREE.Group();

    // Glossy Metallic Paint Body Chassis
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.5, 3);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      metalness: 0.8,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.3;
    group.add(body);

    // Glass Roof Cabin
    const cabinGeo = new THREE.BoxGeometry(1.2, 0.4, 1.4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.7, -0.2);
    group.add(cabin);

    // Rubber Wheels with Chrome Hubs
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const positions = [[-0.8, 0.3, 1], [0.8, 0.3, 1], [-0.8, 0.3, -1], [0.8, 0.3, -1]];
    positions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      group.add(wheel);
    });

    return group;
  }

  private startRaceLoop() {
    const loop = () => {
      this.animFrameId = requestAnimationFrame(loop);
      this.updateRacePhysics();
      this.renderSplitScreenViewports();
    };
    loop();
  }

  private updateRacePhysics() {
    if (this.raceWinner()) return;

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    this.cars.forEach((car, idx) => {
      if (!car.isAI && idx < this.playerCount()) {
        const cfg = this.playerConfigs[idx];
        let accelInput = false;
        let brakeInput = false;
        let leftInput = false;
        let rightInput = false;

        if (cfg.useGamepad && gamepads[cfg.gamepadIndex]) {
          const gp = gamepads[cfg.gamepadIndex]!;
          accelInput = gp.buttons[0]?.pressed || gp.axes[1] < -0.2;
          brakeInput = gp.buttons[1]?.pressed || gp.axes[1] > 0.2;
          leftInput = gp.axes[0] < -0.2;
          rightInput = gp.axes[0] > 0.2;
        } else {
          accelInput = this.activeKeys.has(cfg.keys.up);
          brakeInput = this.activeKeys.has(cfg.keys.down);
          leftInput = this.activeKeys.has(cfg.keys.left);
          rightInput = this.activeKeys.has(cfg.keys.right);
        }

        if (accelInput) car.speed = Math.min(car.maxSpeed, car.speed + car.accel);
        else if (brakeInput) car.speed = Math.max(-car.maxSpeed * 0.4, car.speed - car.accel);
        else car.speed *= 0.96;

        if (leftInput) car.angle += car.steer * (car.speed >= 0 ? 1 : -1);
        if (rightInput) car.angle -= car.steer * (car.speed >= 0 ? 1 : -1);
      } else {
        car.speed = car.maxSpeed * 0.9;
        car.angle += 0.015;
      }

      car.x += Math.sin(car.angle) * car.speed;
      car.z += Math.cos(car.angle) * car.speed;

      car.mesh.position.set(car.x, 0.2, car.z);
      car.mesh.rotation.y = car.angle;

      const distFromCenter = Math.hypot(car.x, car.z);
      if (distFromCenter > 40 && distFromCenter < 90) {
        car.checkpoint++;
        if (car.checkpoint > 200) {
          car.lap++;
          car.checkpoint = 0;
          if (car.lap > 3 && !this.raceWinner()) {
            this.raceWinner.set(car.isAI ? `AI Bot ${idx}` : `PLAYER ${idx + 1}`);
          }
        }
      }
    });
  }

  private renderSplitScreenViewports() {
    if (!this.renderer || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const pCount = this.playerCount();

    for (let i = 0; i < pCount; i++) {
      const car = this.cars[i];
      if (!car) continue;

      let vx = 0, vy = 0, vw = w, vh = h;
      if (pCount === 2) {
        vw = w / 2;
        vx = i * vw;
      } else if (pCount >= 3) {
        vw = w / 2;
        vh = h / 2;
        vx = (i % 2) * vw;
        vy = i < 2 ? vh : 0;
      }

      this.renderer.setViewport(vx, vy, vw, vh);
      this.renderer.setScissor(vx, vy, vw, vh);

      const cam = new THREE.PerspectiveCamera(60, vw / vh, 0.1, 300);
      const camX = car.x - Math.sin(car.angle) * 8;
      const camZ = car.z - Math.cos(car.angle) * 8;
      cam.position.set(camX, 4, camZ);
      cam.lookAt(car.x, 1, car.z);

      this.renderer.render(this.scene, cam);
    }
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
