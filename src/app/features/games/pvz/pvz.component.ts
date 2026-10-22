import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { TextureGenerator } from '../../../core/utils/texture-generator';

export type GameMode = 'menu' | 'adventure' | 'vasebreaker' | 'mystery_pots' | 'wallnut_bowling';

export interface LevelConfig {
  id: string;
  name: string;
  subLevel: string;
  description: string;
  allowedCards: string[];
  maxWaves: number;
  zombieTypes: ('shambler' | 'conehead' | 'buckethead' | 'runner')[];
}

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
  collecting?: boolean;
}

interface LawnMower3D {
  row: number;
  mesh: THREE.Group;
  active: boolean;
  used: boolean;
}

// Puzzle Vase object
interface Vase3D {
  id: number;
  row: number;
  col: number;
  mesh: THREE.Group;
  content: 'plant_peltpod' | 'plant_sunbloom' | 'plant_barkblock' | 'zombie_shambler' | 'zombie_conehead' | 'sun_50';
  isBroken: boolean;
}

// Rolling Wallnut object for bowling
interface RollingWallnut3D {
  id: number;
  row: number;
  x: number;
  z: number;
  mesh: THREE.Group;
  vx: number;
  vz: number;
}

@Component({
  selector: 'app-pvz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- ================= MAIN MENU MODE ================= -->
      @if (currentMode() === 'menu') {
        <div class="relative w-full aspect-[16/9] max-h-[560px] bg-gradient-to-b from-emerald-950 via-slate-900 to-amber-950 rounded-2xl border-2 border-emerald-600/40 p-6 flex flex-col items-center justify-between shadow-2xl overflow-hidden">
          <!-- Background Decor Elements -->
          <div class="absolute -top-10 -left-10 text-9xl opacity-20 pointer-events-none animate-pulse">🌻</div>
          <div class="absolute -bottom-10 -right-10 text-9xl opacity-20 pointer-events-none animate-bounce">🧟‍♂️</div>

          <!-- Title Banner -->
          <div class="text-center z-10 space-y-2 mt-2">
            <div class="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-4 py-1 rounded-full text-emerald-300 font-extrabold text-xs tracking-widest uppercase">
              3D Garden Defense Suite
            </div>
            <h1 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-400 to-teal-200 tracking-wider drop-shadow-[0_5px_15px_rgba(16,185,129,0.4)]">
              GARDEN VS GROANERS
            </h1>
            <p class="text-slate-300 text-sm max-w-lg font-medium">
              Defend your lawn against slow groaning zombies! Select a game mode below to begin.
            </p>
          </div>

          <!-- Game Mode Selection Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl z-10 my-auto">
            <!-- Adventure Mode Card -->
            <button
              (click)="selectMenuCategory('adventure')"
              [class.ring-2]="selectedMenuCategory() === 'adventure'"
              [class.ring-emerald-400]="selectedMenuCategory() === 'adventure'"
              class="bg-slate-900/90 hover:bg-slate-800 border-2 border-emerald-500/40 hover:border-emerald-400 p-5 rounded-2xl flex flex-col items-center text-center transition-all transform hover:-translate-y-1 shadow-lg group">
              <span class="text-5xl mb-2 group-hover:scale-110 transition-transform">🏡</span>
              <h2 class="text-xl font-black text-amber-300 mb-1">ADVENTURE</h2>
              <p class="text-xs text-slate-300 leading-relaxed">
                Classic garden defense levels (1-1, 1-2, 1-3, 2-1) with auto sun collection & slow groaners.
              </p>
            </button>

            <!-- Puzzle Mode Card -->
            <button
              (click)="selectMenuCategory('puzzle')"
              [class.ring-2]="selectedMenuCategory() === 'puzzle'"
              [class.ring-amber-400]="selectedMenuCategory() === 'puzzle'"
              class="bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-500/40 hover:border-amber-400 p-5 rounded-2xl flex flex-col items-center text-center transition-all transform hover:-translate-y-1 shadow-lg group">
              <span class="text-5xl mb-2 group-hover:scale-110 transition-transform">🏺</span>
              <h2 class="text-xl font-black text-amber-300 mb-1">PUZZLE</h2>
              <p class="text-xs text-slate-300 leading-relaxed">
                Break the Vase & Mystery Pots! Break vases to reveal hidden plants or zombies.
              </p>
            </button>

            <!-- Mini Games Card -->
            <button
              (click)="selectMenuCategory('minigame')"
              [class.ring-2]="selectedMenuCategory() === 'minigame'"
              [class.ring-teal-400]="selectedMenuCategory() === 'minigame'"
              class="bg-slate-900/90 hover:bg-slate-800 border-2 border-teal-500/40 hover:border-teal-400 p-5 rounded-2xl flex flex-col items-center text-center transition-all transform hover:-translate-y-1 shadow-lg group">
              <span class="text-5xl mb-2 group-hover:scale-110 transition-transform">🎳</span>
              <h2 class="text-xl font-black text-teal-300 mb-1">MINI-GAMES</h2>
              <p class="text-xs text-slate-300 leading-relaxed">
                Wall-Nut Bowling! Roll heavy Bark Blocks down lanes to crush approaching zombies.
              </p>
            </button>
          </div>

          <!-- Sub-level Selection Modal / Panel -->
          <div class="w-full max-w-2xl bg-slate-900/95 border border-slate-700/80 p-4 rounded-2xl z-10">
            @if (selectedMenuCategory() === 'adventure') {
              <div class="space-y-3">
                <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider text-center">Select Adventure Level</div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  @for (lvl of adventureLevels; track lvl.id) {
                    <button
                      (click)="startAdventureLevel(lvl)"
                      class="bg-slate-800 hover:bg-emerald-700 text-amber-200 font-extrabold py-2 px-3 rounded-xl border border-slate-600 text-sm transition-all hover:scale-105 flex flex-col items-center">
                      <span class="text-lg">🌱 {{ lvl.subLevel }}</span>
                      <span class="text-[10px] text-slate-300 font-normal truncate max-w-full">{{ lvl.name }}</span>
                    </button>
                  }
                </div>
              </div>
            } @else if (selectedMenuCategory() === 'puzzle') {
              <div class="space-y-3">
                <div class="text-xs font-bold text-amber-400 uppercase tracking-wider text-center">Select Puzzle Sub-Mode</div>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    (click)="startMode('vasebreaker')"
                    class="bg-slate-800 hover:bg-amber-700 text-amber-200 font-extrabold py-3 px-4 rounded-xl border border-slate-600 text-sm transition-all hover:scale-105 flex items-center justify-center gap-2">
                    <span class="text-2xl">🏺</span>
                    <div class="text-left">
                      <div class="font-black">Vasebreaker 1-1</div>
                      <div class="text-[10px] text-slate-300 font-normal">Break vases to reveal items</div>
                    </div>
                  </button>
                  <button
                    (click)="startMode('mystery_pots')"
                    class="bg-slate-800 hover:bg-amber-700 text-amber-200 font-extrabold py-3 px-4 rounded-xl border border-slate-600 text-sm transition-all hover:scale-105 flex items-center justify-center gap-2">
                    <span class="text-2xl">🍲</span>
                    <div class="text-left">
                      <div class="font-black">Mystery Pots 1-2</div>
                      <div class="text-[10px] text-slate-300 font-normal">Surprise plant & zombie pots</div>
                    </div>
                  </button>
                </div>
              </div>
            } @else if (selectedMenuCategory() === 'minigame') {
              <div class="space-y-3">
                <div class="text-xs font-bold text-teal-400 uppercase tracking-wider text-center">Select Mini-Game</div>
                <button
                  (click)="startMode('wallnut_bowling')"
                  class="w-full bg-slate-800 hover:bg-teal-700 text-teal-200 font-extrabold py-3 px-4 rounded-xl border border-slate-600 text-sm transition-all hover:scale-105 flex items-center justify-center gap-3">
                  <span class="text-2xl">🎳</span>
                  <div class="text-left">
                    <div class="font-black">Wall-Nut Bowling Mini-Game</div>
                    <div class="text-[10px] text-slate-300 font-normal">Roll heavy nuts along red line to strike down zombie waves</div>
                  </div>
                </button>
              </div>
            }
          </div>

          <div class="text-[11px] text-slate-400 z-10">
            ☀️ Suns collect automatically | 🧟 Zombies move slow | 🏡 Expanded Garden 3D View
          </div>
        </div>
      }

      <!-- ================= GAMEPLAY PLAYING MODE ================= -->
      @if (currentMode() !== 'menu') {
        <!-- Top Bar: Resources, Waves & Game Controls -->
        <div class="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 gap-3">
          <div class="flex items-center gap-3">
            <!-- Back to Main Menu Button -->
            <button
              (click)="returnToMenu()"
              class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1">
              <span>🏠</span>
              <span>Menu</span>
            </button>

            <!-- Sun Balance (Adventure & Standard Modes) -->
            @if (currentMode() === 'adventure') {
              <div class="flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-xl border border-amber-500/40 font-black text-xl shadow-inner">
                <span class="animate-bounce text-2xl">☀️</span>
                <span>{{ sun() }}</span>
              </div>
            }

            <div class="flex flex-col text-xs text-slate-300">
              <span class="font-extrabold text-emerald-400 text-sm tracking-wide uppercase">
                {{ getModeTitle() }}
              </span>
              <span>
                @if (currentMode() === 'adventure') {
                  Wave: <strong class="text-amber-400">{{ wave() }} / {{ currentLevelConfig?.maxWaves || 5 }}</strong> | Defeated: <strong class="text-teal-400">{{ kills() }}</strong>
                } @else if (currentMode() === 'vasebreaker' || currentMode() === 'mystery_pots') {
                  Remaining Vases: <strong class="text-amber-400">{{ remainingVasesCount() }}</strong> | Defeated: <strong class="text-teal-400">{{ kills() }}</strong>
                } @else if (currentMode() === 'wallnut_bowling') {
                  Wall-nuts Ready: <strong class="text-amber-400">{{ wallnutConveyor().length }}</strong> | Defeated: <strong class="text-teal-400">{{ kills() }}</strong>
                }
              </span>
            </div>
          </div>

          <!-- Action Controls -->
          <div class="flex items-center gap-2 flex-wrap">
            @if (currentMode() === 'adventure') {
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
            }

            <!-- Speed Toggle -->
            <button (click)="toggleGameSpeed()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 text-xs font-bold transition-all">
              {{ gameSpeed() === 1 ? '⏩ 1x Speed' : '⚡ 2x Speed' }}
            </button>

            <!-- Pause / Resume -->
            <button (click)="togglePause()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-bold transition-all">
              {{ isPaused() ? '▶ Resume' : '⏸ Pause' }}
            </button>

            <!-- Fullscreen & Restart -->
            <button (click)="toggleFullscreen()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold">
              ⛶
            </button>
            <button (click)="restartGame()" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all">
              🔄 Restart
            </button>
          </div>
        </div>

        <!-- Seed Selector / Conveyor Bar -->
        @if (currentMode() === 'adventure') {
          <div class="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            @for (card of availableSeedCards; track card.id) {
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
        } @else if (currentMode() === 'wallnut_bowling') {
          <!-- Conveyor belt for Rolling Wallnut Bowling -->
          <div class="flex items-center justify-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-teal-800">
            <span class="text-xs font-black text-teal-400 mr-2 uppercase tracking-wide">Conveyor Belt:</span>
            <div class="flex items-center gap-2 overflow-x-auto">
              @for (nut of wallnutConveyor(); track $index) {
                <button
                  (click)="selectBowlingNut($index)"
                  [class.ring-2]="selectedBowlingNutIndex() === $index"
                  [class.ring-amber-400]="selectedBowlingNutIndex() === $index"
                  class="bg-amber-950/80 hover:bg-amber-900 border border-amber-600 px-4 py-2 rounded-xl font-black text-amber-200 text-sm flex items-center gap-2 shadow-md hover:scale-105 transition-all">
                  <span class="text-xl">🪵</span>
                  <span>Wall-Nut</span>
                </button>
              }
              @if (wallnutConveyor().length === 0) {
                <span class="text-xs text-slate-400 italic">Waiting for wall-nuts...</span>
              }
            </div>
          </div>
        }

        <!-- 3D Viewport Canvas Container -->
        <div #canvasContainer class="relative w-full aspect-[16/9] max-h-[560px] bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
          <canvas #canvas class="w-full h-full block cursor-crosshair"></canvas>

          <!-- Instructions Banner Overlay -->
          <div class="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
            @if (currentMode() === 'adventure') {
              @if (shovelActive()) {
                <span class="text-red-400 font-bold">🪣 Click any placed plant to shovel it up!</span>
              } @else if (selectedSeed()) {
                <span>🌱 Click empty tile to plant <strong class="text-emerald-300">{{ selectedSeed()?.name }}</strong> | Suns collect automatically!</span>
              } @else {
                <span>Select a seed card or watch suns collect automatically ☀️</span>
              }
            } @else if (currentMode() === 'vasebreaker' || currentMode() === 'mystery_pots') {
              <span class="text-amber-300 font-bold">🏺 Click vases to smash them open & reveal plants or zombies!</span>
            } @else if (currentMode() === 'wallnut_bowling') {
              <span class="text-teal-300 font-bold">🎳 Click on the left side of lawn to roll a Wall-Nut down that lane!</span>
            }
          </div>

          <!-- Pause Overlay -->
          @if (isPaused() && !gameOver() && !levelVictory()) {
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
              <p class="text-slate-300 text-base max-w-md">Your lawn was overrun by groaners. Don't give up!</p>
              <div class="flex items-center gap-3">
                <button (click)="restartGame()" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-emerald-600 text-slate-950 font-black text-base rounded-xl shadow-xl hover:scale-105 transition-all">
                  TRY AGAIN
                </button>
                <button (click)="returnToMenu()" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-base rounded-xl shadow-xl transition-all">
                  MAIN MENU
                </button>
              </div>
            </div>
          }

          <!-- Level Victory Overlay -->
          @if (levelVictory()) {
            <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-center z-30 p-6">
              <span class="text-7xl animate-bounce">🏆</span>
              <h2 class="text-4xl font-black text-emerald-400 tracking-wider drop-shadow-lg">VICTORY! LAWN DEFENDED!</h2>
              <p class="text-slate-300 text-base max-w-md">
                You survived all waves and cleared the groaners!
              </p>
              <div class="flex items-center gap-3">
                <button (click)="returnToMenu()" class="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black text-base rounded-xl shadow-xl hover:scale-105 transition-all">
                  MAIN MENU
                </button>
              </div>
            </div>
          }
        </div>
      }

    </div>
  `
})
export class PvzComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasContainer') containerRef!: ElementRef<HTMLDivElement>;

  // Game Modes
  currentMode = signal<GameMode>('menu');
  selectedMenuCategory = signal<'adventure' | 'puzzle' | 'minigame'>('adventure');

  // Adventure Level Definitions
  adventureLevels: LevelConfig[] = [
    {
      id: 'adv-1-1',
      name: 'Front Lawn Start',
      subLevel: '1-1',
      description: 'Single slow groaner waves to practice auto sun collection.',
      allowedCards: ['sunbloom', 'peltpod', 'barkblock'],
      maxWaves: 3,
      zombieTypes: ['shambler']
    },
    {
      id: 'adv-1-2',
      name: 'Conehead Approaching',
      subLevel: '1-2',
      description: 'Groaners equipped with traffic cones appear!',
      allowedCards: ['sunbloom', 'peltpod', 'barkblock', 'frostpod'],
      maxWaves: 4,
      zombieTypes: ['shambler', 'conehead']
    },
    {
      id: 'adv-1-3',
      name: 'Double Trouble',
      subLevel: '1-3',
      description: 'Twin-Pelts and Cherry Bombs unlocked for heavy waves.',
      allowedCards: ['sunbloom', 'peltpod', 'barkblock', 'frostpod', 'cherrybomb', 'twinpelt'],
      maxWaves: 5,
      zombieTypes: ['shambler', 'conehead', 'runner']
    },
    {
      id: 'adv-2-1',
      name: 'Buckethead Invasion',
      subLevel: '2-1',
      description: 'High HP Buckethead groaners join the attack.',
      allowedCards: ['sunbloom', 'peltpod', 'barkblock', 'frostpod', 'cherrybomb', 'twinpelt', 'snapplant', 'spudmine'],
      maxWaves: 6,
      zombieTypes: ['shambler', 'conehead', 'buckethead', 'runner']
    }
  ];

  currentLevelConfig: LevelConfig | null = this.adventureLevels[0];

  // All Plants Catalog
  allSeedCards: SeedCard[] = [
    { id: 'sunbloom', name: 'Sunbloom', cost: 50, rechargeTime: 7.5, icon: '🌻', color: '#f59e0b', desc: 'Produces 25 Sun periodically', lastUsedTime: 0 },
    { id: 'peltpod', name: 'Pelt-Pod', cost: 100, rechargeTime: 7.5, icon: '🌱', color: '#10b981', desc: 'Shoots green seeds at zombies', lastUsedTime: 0 },
    { id: 'barkblock', name: 'Bark Block', cost: 50, rechargeTime: 15, icon: '🪵', color: '#885022', desc: 'Heavy wall with 120 HP', lastUsedTime: 0 },
    { id: 'frostpod', name: 'Frost Pod', cost: 175, rechargeTime: 7.5, icon: '❄️', color: '#38bdf8', desc: 'Shoots ice peas that slow enemies', lastUsedTime: 0 },
    { id: 'cherrybomb', name: 'Cherry Bomb', cost: 150, rechargeTime: 25, icon: '🍒', color: '#ef4444', desc: 'Explodes in a 3x3 area immediately', lastUsedTime: 0 },
    { id: 'twinpelt', name: 'Twin Pelt', cost: 200, rechargeTime: 7.5, icon: '🌿', color: '#059669', desc: 'Fires double seeds per burst', lastUsedTime: 0 },
    { id: 'snapplant', name: 'Snap Plant', cost: 150, rechargeTime: 7.5, icon: '🐊', color: '#16a34a', desc: 'Devours a zombie whole, then digests', lastUsedTime: 0 },
    { id: 'spudmine', name: 'Spud Mine', cost: 25, rechargeTime: 15, icon: '🥔', color: '#a16207', desc: 'Arms in 8s, explodes on contact', lastUsedTime: 0 }
  ];

  availableSeedCards: SeedCard[] = [];
  selectedSeed = signal<SeedCard | null>(null);

  // Bowling Mode Signal State
  wallnutConveyor = signal<number[]>([1, 1, 1]);
  selectedBowlingNutIndex = signal<number | null>(0);

  // Puzzle Mode Signal State
  vases = signal<Vase3D[]>([]);
  remainingVasesCount = signal<number>(0);

  // General State
  sun = signal<number>(150);
  wave = signal<number>(1);
  kills = signal<number>(0);
  gameOver = signal<boolean>(false);
  levelVictory = signal<boolean>(false);
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
  private rollingWallnuts: RollingWallnut3D[] = [];
  private vase3DObjects: Vase3D[] = [];

  private grassTexture!: THREE.CanvasTexture;
  private woodTexture!: THREE.CanvasTexture;

  private tickCount = 0;
  private nextId = 1;
  private lastSkySunTick = 0;

  ngAfterViewInit() {
    this.grassTexture = TextureGenerator.createGrassTexture();
    this.woodTexture = TextureGenerator.createWoodTexture(true);
  }

  selectMenuCategory(cat: 'adventure' | 'puzzle' | 'minigame') {
    this.selectedMenuCategory.set(cat);
  }

  startAdventureLevel(lvl: LevelConfig) {
    this.currentLevelConfig = lvl;
    this.availableSeedCards = this.allSeedCards.filter(c => lvl.allowedCards.includes(c.id));
    this.selectedSeed.set(this.availableSeedCards[0] || null);
    this.startMode('adventure');
  }

  startMode(mode: GameMode) {
    this.currentMode.set(mode);
    setTimeout(() => {
      if (this.canvasRef && this.containerRef) {
        this.initThreeJS();
        this.buildLawn();
        this.createLawnmowers();

        if (mode === 'vasebreaker' || mode === 'mystery_pots') {
          this.setupVasebreakerMode(mode === 'mystery_pots');
        } else if (mode === 'wallnut_bowling') {
          this.setupWallnutBowlingMode();
        } else if (mode === 'adventure') {
          if (!this.currentLevelConfig) this.currentLevelConfig = this.adventureLevels[0];
          this.availableSeedCards = this.allSeedCards.filter(c => this.currentLevelConfig!.allowedCards.includes(c.id));
          this.selectedSeed.set(this.availableSeedCards[0] || null);
        }

        this.restartGameLogic();
        this.startLoop();
      }
    }, 50);
  }

  returnToMenu() {
    cancelAnimationFrame(this.animFrameId);
    this.currentMode.set('menu');
  }

  getModeTitle(): string {
    const mode = this.currentMode();
    if (mode === 'adventure') return `Adventure Level ${this.currentLevelConfig?.subLevel || '1-1'}`;
    if (mode === 'vasebreaker') return 'Vasebreaker Puzzle 1-1';
    if (mode === 'mystery_pots') return 'Mystery Pots Puzzle 1-2';
    if (mode === 'wallnut_bowling') return 'Wall-Nut Bowling Mini-Game';
    return 'Garden vs Groaners';
  }

  selectSeed(card: SeedCard) {
    this.shovelActive.set(false);
    this.selectedSeed.set(card);
  }

  selectBowlingNut(index: number) {
    this.selectedBowlingNutIndex.set(index);
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
    const elem = this.containerRef?.nativeElement;
    if (!elem) return;
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
    this.restartGameLogic();
  }

  private restartGameLogic() {
    this.clearWorld();
    this.sun.set(150);
    this.wave.set(1);
    this.kills.set(0);
    this.gameOver.set(false);
    this.levelVictory.set(false);
    this.isPaused.set(false);
    this.shovelActive.set(false);
    this.tickCount = 0;
    this.lastSkySunTick = 0;
    this.allSeedCards.forEach(c => c.lastUsedTime = 0);
    this.createLawnmowers();

    const mode = this.currentMode();
    if (mode === 'vasebreaker' || mode === 'mystery_pots') {
      this.setupVasebreakerMode(mode === 'mystery_pots');
    } else if (mode === 'wallnut_bowling') {
      this.setupWallnutBowlingMode();
    }
  }

  private initThreeJS() {
    if (!this.canvasRef || !this.containerRef) return;
    const canvas = this.canvasRef.nativeElement;
    const container = this.containerRef.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a192f);
    this.scene.fog = new THREE.FogExp2(0x0a192f, 0.012);

    // Camera framed close and bold to present a large, prominent garden view like Plants vs Zombies!
    this.camera = new THREE.PerspectiveCamera(46, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 8.2, 8.8);
    this.camera.lookAt(0, 0.2, 0.3);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    dirLight.position.set(10, 20, 12);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private onWindowResize() {
    if (!this.renderer || !this.camera || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width && height) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  }

  private onTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
      event.preventDefault();
      const touch = event.touches[0];
      this.onCanvasClick({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }

  private buildLawn() {
    this.lawnTiles = [];

    // Expanded Soil Base Frame
    const baseGeo = new THREE.BoxGeometry(12.2, 0.5, 8.2);
    const baseMat = new THREE.MeshStandardMaterial({
      map: this.woodTexture,
      roughness: 0.9
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, -0.3, 0);
    baseMesh.receiveShadow = true;
    this.scene.add(baseMesh);

    // 5 Rows x 9 Cols Grass Lawn Grid
    const tileGeo = new THREE.BoxGeometry(1.2, 0.1, 1.2);
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 9; c++) {
        const isDark = (r + c) % 2 === 0;
        const tileMat = new THREE.MeshStandardMaterial({
          map: this.grassTexture,
          color: isDark ? 0x22c55e : 0x16a34a,
          roughness: 0.5
        });
        const tile = new THREE.Mesh(tileGeo, tileMat);
        const x = (c - 4) * 1.25;
        const z = (r - 2) * 1.35;
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

      const bodyGeo = new THREE.BoxGeometry(0.7, 0.35, 0.6);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.2;
      body.castShadow = true;
      group.add(body);

      const bladeGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 8);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(-0.25, 0.1, 0);
      group.add(blade);

      const x = (-4 - 0.7) * 1.25;
      const z = (r - 2) * 1.35;
      group.position.set(x, 0, z);
      this.scene.add(group);

      this.lawnmowers.push({
        row: r,
        mesh: group,
        active: false,
        used: false
      });
    }
  }

  // ================= PUZZLE VASEBREAKER MODE SETUP =================
  private setupVasebreakerMode(isMysteryPots = false) {
    this.vase3DObjects.forEach(v => this.scene.remove(v.mesh));
    this.vase3DObjects = [];

    const vaseContents: ('plant_peltpod' | 'plant_sunbloom' | 'plant_barkblock' | 'zombie_shambler' | 'zombie_conehead' | 'sun_50')[] = [
      'plant_peltpod', 'plant_peltpod', 'plant_peltpod',
      'plant_sunbloom', 'plant_sunbloom',
      'plant_barkblock',
      'zombie_shambler', 'zombie_shambler', 'zombie_conehead',
      'sun_50', 'sun_50', 'sun_50'
    ];

    let idx = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 3; c < 9; c++) { // right side grid columns for vases
        if (idx >= vaseContents.length) break;

        const content = vaseContents[idx % vaseContents.length];
        idx++;

        const group = new THREE.Group();
        const vaseGeo = new THREE.CylinderGeometry(0.35, 0.25, 0.7, 12);
        const vaseMat = new THREE.MeshStandardMaterial({
          color: isMysteryPots ? 0xd97706 : 0xca8a04,
          roughness: 0.4
        });
        const vaseMesh = new THREE.Mesh(vaseGeo, vaseMat);
        vaseMesh.position.y = 0.35;
        vaseMesh.castShadow = true;
        group.add(vaseMesh);

        // Decor rim
        const rimGeo = new THREE.TorusGeometry(0.35, 0.05, 8, 16);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0x854d0e });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.position.y = 0.7;
        rim.rotation.x = Math.PI / 2;
        group.add(rim);

        const x = (c - 4) * 1.25;
        const z = (r - 2) * 1.35;
        group.position.set(x, 0, z);
        this.scene.add(group);

        this.vase3DObjects.push({
          id: this.nextId++,
          row: r,
          col: c,
          mesh: group,
          content,
          isBroken: false
        });
      }
    }

    this.remainingVasesCount.set(this.vase3DObjects.length);
  }

  // ================= MINI GAME WALLNUT BOWLING SETUP =================
  private setupWallnutBowlingMode() {
    this.wallnutConveyor.set([1, 1, 1, 1]);
    this.selectedBowlingNutIndex.set(0);
  }

  private onCanvasClick(event: MouseEvent) {
    if (this.gameOver() || this.isPaused() || this.levelVictory()) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const mode = this.currentMode();

    if (mode === 'vasebreaker' || mode === 'mystery_pots') {
      // Check Vase Clicks
      const vaseMeshes = this.vase3DObjects.filter(v => !v.isBroken).map(v => v.mesh);
      const vaseHits = this.raycaster.intersectObjects(vaseMeshes, true);
      if (vaseHits.length > 0) {
        let hitObj: THREE.Object3D | null = vaseHits[0].object;
        while (hitObj && hitObj.parent && hitObj.parent !== this.scene) {
          hitObj = hitObj.parent;
        }
        const vase = this.vase3DObjects.find(v => v.mesh === hitObj);
        if (vase && !vase.isBroken) {
          this.breakVase(vase);
          return;
        }
      }
    }

    if (mode === 'wallnut_bowling') {
      // Check Lawn Tile Clicks to roll wall-nut down lane
      const tileHits = this.raycaster.intersectObjects(this.lawnTiles);
      if (tileHits.length > 0) {
        const tile = tileHits[0].object as THREE.Mesh;
        const { row, col } = tile.userData;
        if (col <= 2) { // Roll line on left side
          this.rollWallnut(row);
        }
        return;
      }
    }

    if (mode === 'adventure') {
      // 1. Check Sun Orb Manual Click
      const sunMeshes = this.sunOrbs.map(s => s.mesh);
      const sunHits = this.raycaster.intersectObjects(sunMeshes, true);
      if (sunHits.length > 0) {
        let hitMesh: THREE.Object3D | null = sunHits[0].object;
        while (hitMesh && hitMesh.parent && hitMesh.parent !== this.scene) {
          hitMesh = hitMesh.parent;
        }
        const orbIdx = this.sunOrbs.findIndex(s => s.mesh === hitMesh || s.mesh === sunHits[0].object);
        if (orbIdx !== -1) {
          this.collectSun(orbIdx);
          return;
        }
      }

      // 2. Check Lawn Tile Clicking for planting/shoveling
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
  }

  private breakVase(vase: Vase3D) {
    vase.isBroken = true;
    this.scene.remove(vase.mesh);
    this.remainingVasesCount.update(c => Math.max(0, c - 1));

    const x = (vase.col - 4) * 1.25;
    const z = (vase.row - 2) * 1.35;

    if (vase.content.startsWith('plant_')) {
      const plantType = vase.content.replace('plant_', '');
      const plantMesh = this.createPlantMesh(plantType);
      plantMesh.position.set(x, 0.1, z);
      this.scene.add(plantMesh);

      const maxHp = plantType === 'barkblock' ? 120 : 30;
      this.placedPlants.push({
        id: this.nextId++,
        row: vase.row,
        col: vase.col,
        type: plantType,
        hp: maxHp,
        maxHp,
        mesh: plantMesh,
        lastAction: this.tickCount
      });
    } else if (vase.content.startsWith('zombie_')) {
      const zombieType = vase.content.replace('zombie_', '') as 'shambler' | 'conehead';
      this.spawnZombieAt(vase.row, vase.col, zombieType);
    } else if (vase.content === 'sun_50') {
      this.sun.update(s => s + 50);
    }

    // Check Victory for Vasebreaker
    this.checkPuzzleVictory();
  }

  private checkPuzzleVictory() {
    if (this.remainingVasesCount() === 0 && this.zombies.length === 0) {
      setTimeout(() => {
        if (this.remainingVasesCount() === 0 && this.zombies.length === 0) {
          this.levelVictory.set(true);
        }
      }, 800);
    }
  }

  private rollWallnut(row: number) {
    const conveyor = this.wallnutConveyor();
    if (conveyor.length === 0) return;

    // Remove one wallnut from conveyor
    const updated = [...conveyor];
    updated.pop();
    this.wallnutConveyor.set(updated);

    const nutGroup = new THREE.Group();
    const nutGeo = new THREE.SphereGeometry(0.35, 16, 16);
    const nutMat = new THREE.MeshStandardMaterial({ map: this.woodTexture, roughness: 0.8 });
    const nutMesh = new THREE.Mesh(nutGeo, nutMat);
    nutMesh.position.y = 0.35;
    nutMesh.castShadow = true;
    nutGroup.add(nutMesh);

    const startX = (-4) * 1.25;
    const startZ = (row - 2) * 1.35;
    nutGroup.position.set(startX, 0, startZ);
    this.scene.add(nutGroup);

    this.rollingWallnuts.push({
      id: this.nextId++,
      row,
      x: startX,
      z: startZ,
      mesh: nutGroup,
      vx: 0.12,
      vz: 0
    });
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

    const x = (col - 4) * 1.25;
    const z = (row - 2) * 1.35;
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
      const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.65);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.32;
      stem.castShadow = true;
      group.add(stem);

      const headGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 12);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 0.65;
      head.rotation.x = Math.PI / 4;
      head.castShadow = true;
      group.add(head);
    } else if (type === 'peltpod' || type === 'twinpelt' || type === 'frostpod') {
      const colorMap: Record<string, number> = {
        peltpod: 0x22c55e,
        twinpelt: 0x059669,
        frostpod: 0x38bdf8
      };
      const stemGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.55);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.28;
      stem.castShadow = true;
      group.add(stem);

      const shooterGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const shooterMat = new THREE.MeshStandardMaterial({ color: colorMap[type], roughness: 0.2 });
      const shooter = new THREE.Mesh(shooterGeo, shooterMat);
      shooter.position.set(0, 0.55, 0.12);
      shooter.castShadow = true;
      group.add(shooter);
    } else if (type === 'barkblock') {
      const wallGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
      const wallMat = new THREE.MeshStandardMaterial({ map: this.woodTexture, roughness: 0.9 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.y = 0.38;
      wall.castShadow = true;
      group.add(wall);
    } else if (type === 'snapplant') {
      const stemGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.45);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x14532d });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.22;
      group.add(stem);

      const jawGeo = new THREE.BoxGeometry(0.55, 0.35, 0.45);
      const jawMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
      const jaw = new THREE.Mesh(jawGeo, jawMat);
      jaw.position.set(0, 0.45, 0.12);
      jaw.castShadow = true;
      group.add(jaw);
    } else if (type === 'spudmine') {
      const mineGeo = new THREE.SphereGeometry(0.28, 12, 12);
      const mineMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.8 });
      const mine = new THREE.Mesh(mineGeo, mineMat);
      mine.position.y = 0.12;
      mine.scale.y = 0.6;
      group.add(mine);
    }

    return group;
  }

  private triggerCherryExplosion(row: number, col: number, worldX: number, worldZ: number) {
    const expGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const expMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
    const expMesh = new THREE.Mesh(expGeo, expMat);
    expMesh.position.set(worldX, 0.5, worldZ);
    this.scene.add(expMesh);

    setTimeout(() => this.scene.remove(expMesh), 350);

    this.zombies.forEach(z => {
      if (Math.abs(z.row - row) <= 1 && Math.abs((z.x - 4) * 1.25 - worldX) <= 1.8) {
        z.hp -= 220;
      }
    });
  }

  private spawnZombie() {
    const allowedTypes = this.currentLevelConfig?.zombieTypes || ['shambler', 'conehead'];
    const type = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const row = Math.floor(Math.random() * 5);
    this.spawnZombieAt(row, 8, type);
  }

  private spawnZombieAt(row: number, col: number, type: 'shambler' | 'conehead' | 'buckethead' | 'runner') {
    const mesh = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.85);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.42;
    body.castShadow = true;
    mesh.add(body);

    const headGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.95;
    head.castShadow = true;
    mesh.add(head);

    if (type === 'conehead') {
      const coneGeo = new THREE.ConeGeometry(0.22, 0.45, 8);
      const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.y = 1.3;
      cone.castShadow = true;
      mesh.add(cone);
    } else if (type === 'buckethead') {
      const buckGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35);
      const buckMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
      const bucket = new THREE.Mesh(buckGeo, buckMat);
      bucket.position.y = 1.25;
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

    const startX = col * 1.25;
    const startZ = (row - 2) * 1.35;
    mesh.position.set((col - 4) * 1.25, 0, startZ);
    this.scene.add(mesh);

    // HP & Slow Zombie Speeds (Relaxed, fun PvZ groaner pacing)
    const hpMap = { shambler: 60, conehead: 140, buckethead: 260, runner: 50 };
    const speedMap = { shambler: 0.005, conehead: 0.005, buckethead: 0.004, runner: 0.012 };

    this.zombies.push({
      id: this.nextId++,
      row,
      x: col,
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
    const orbGeo = new THREE.SphereGeometry(0.28, 16, 16);
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

      if (this.currentMode() !== 'menu' && !this.gameOver() && !this.isPaused() && !this.levelVictory()) {
        const iterations = this.gameSpeed();
        for (let i = 0; i < iterations; i++) {
          this.tickCount++;
          this.updateGameLogic();
        }
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    loop();
  }

  private updateGameLogic() {
    const mode = this.currentMode();

    // 1. Sky Sun Drops (Adventure Mode)
    if (mode === 'adventure' && this.tickCount - this.lastSkySunTick >= 280) {
      const rx = ((Math.random() * 8) - 4) * 1.25;
      const rz = ((Math.random() * 4) - 2) * 1.35;
      this.spawnSunOrb(rx, 6, rz, 0.5);
      this.lastSkySunTick = this.tickCount;
    }

    // 2. Auto Sun Collection Logic (Collects suns automatically without requiring click!)
    const activeOrbs: SunOrb3D[] = [];
    this.sunOrbs.forEach(orb => {
      if (orb.y > orb.targetY) orb.y -= 0.06;
      orb.mesh.position.y = orb.y;

      // Auto magnetize & collect after brief drop (~20 ticks)
      if (this.tickCount - orb.spawnTime > 22) {
        this.sun.update(s => s + orb.value);
        this.scene.remove(orb.mesh);
      } else {
        activeOrbs.push(orb);
      }
    });
    this.sunOrbs = activeOrbs;

    // 3. Spawning Zombie Waves (Adventure Mode & Wallnut Bowling)
    if (mode === 'adventure') {
      const maxWaves = this.currentLevelConfig?.maxWaves || 5;
      if (this.tickCount % 220 === 0 && this.wave() <= maxWaves) {
        this.spawnZombie();
        if (this.tickCount % 660 === 0) {
          if (this.wave() < maxWaves) {
            this.wave.update(w => w + 1);
          }
        }
      }

      // Check Level Victory for Adventure Mode
      if (this.wave() >= maxWaves && this.zombies.length === 0 && this.kills() > 0) {
        this.levelVictory.set(true);
      }
    } else if (mode === 'wallnut_bowling') {
      if (this.tickCount % 180 === 0 && this.kills() < 20) {
        this.spawnZombie();
      }
      if (this.tickCount % 120 === 0 && this.wallnutConveyor().length < 6) {
        this.wallnutConveyor.update(list => [...list, 1]);
      }
      if (this.kills() >= 20 && this.zombies.length === 0) {
        this.levelVictory.set(true);
      }
    }

    // 4. Plant Logic & Actions
    this.placedPlants.forEach(plant => {
      // Gentle idle animation
      plant.mesh.rotation.z = Math.sin(this.tickCount * 0.05) * 0.05;

      if (plant.type === 'sunbloom' && (this.tickCount - plant.lastAction) >= 200) {
        const x = (plant.col - 4) * 1.25;
        const z = (plant.row - 2) * 1.35;
        this.spawnSunOrb(x, 0.5, z, 0.5);
        plant.lastAction = this.tickCount;
      }
      else if ((plant.type === 'peltpod' || plant.type === 'frostpod' || plant.type === 'twinpelt') && (this.tickCount - plant.lastAction) >= 45) {
        const hasZombieInLane = this.zombies.some(z => z.row === plant.row && z.x > plant.col);
        if (hasZombieInLane) {
          const isIce = plant.type === 'frostpod';
          const isDouble = plant.type === 'twinpelt';
          const x = (plant.col - 4) * 1.25 + 0.3;
          const z = (plant.row - 2) * 1.35;

          this.fireProjectile(plant.row, x, z, isIce);
          if (isDouble) {
            setTimeout(() => this.fireProjectile(plant.row, x, z, false), 150);
          }

          plant.lastAction = this.tickCount;
        }
      }
      else if (plant.type === 'spudmine') {
        if (!plant.isArmed && (this.tickCount - plant.lastAction) >= 160) {
          plant.isArmed = true;
          plant.mesh.position.y = 0.25;
        }
        if (plant.isArmed) {
          const zInRange = this.zombies.find(z => z.row === plant.row && Math.abs((z.x - 4) * 1.25 - (plant.col - 4) * 1.25) < 0.5);
          if (zInRange) {
            zInRange.hp -= 200;
            plant.hp = 0;
          }
        }
      }
      else if (plant.type === 'snapplant') {
        if (!plant.isDigesting) {
          const zTarget = this.zombies.find(z => z.row === plant.row && Math.abs((z.x - 4) * 1.25 - (plant.col - 4) * 1.25) < 0.7);
          if (zTarget) {
            zTarget.hp = 0;
            plant.isDigesting = true;
            plant.digestEndTime = this.tickCount + 250;
          }
        } else if (plant.digestEndTime && this.tickCount >= plant.digestEndTime) {
          plant.isDigesting = false;
        }
      }
    });

    // 5. Projectiles Movement & Collision
    const remainingProjs: Projectile3D[] = [];
    this.projectiles.forEach(p => {
      p.mesh.position.x += 0.16;
      p.x += 0.16;

      let hit = false;
      this.zombies.forEach(z => {
        if (!hit && z.row === p.row && Math.abs((z.x - 4) * 1.25 - p.mesh.position.x) < 0.4) {
          z.hp -= 20;
          if (p.isIce) {
            z.slowTimer = 90;
          }
          hit = true;
        }
      });

      if (hit || p.mesh.position.x > 5.5) {
        this.scene.remove(p.mesh);
      } else {
        remainingProjs.push(p);
      }
    });
    this.projectiles = remainingProjs;

    // 6. Rolling Wall-Nuts Mechanics (Bowling Mini-Game)
    const activeWallnuts: RollingWallnut3D[] = [];
    this.rollingWallnuts.forEach(nut => {
      nut.x += nut.vx;
      nut.z += nut.vz;
      nut.mesh.position.x = nut.x;
      nut.mesh.position.z = nut.z;
      nut.mesh.rotation.z -= 0.15; // Roll animation

      let hitZombie = false;
      this.zombies.forEach(z => {
        const zWorldX = (z.x - 4) * 1.25;
        const zWorldZ = (z.row - 2) * 1.35;
        if (Math.abs(zWorldX - nut.x) < 0.5 && Math.abs(zWorldZ - nut.z) < 0.5) {
          z.hp -= 150; // Heavy bowling damage
          hitZombie = true;
          // Ricochet into adjacent lane
          nut.vz = (nut.vz === 0) ? (Math.random() > 0.5 ? 0.08 : -0.08) : -nut.vz;
        }
      });

      if (nut.x > 6.0 || Math.abs(nut.z) > 4.5) {
        this.scene.remove(nut.mesh);
      } else {
        activeWallnuts.push(nut);
      }
    });
    this.rollingWallnuts = activeWallnuts;

    // 7. Lawnmower Movement & Logic
    this.lawnmowers.forEach(lm => {
      if (lm.active) {
        lm.mesh.position.x += 0.28;
        this.zombies.forEach(z => {
          if (z.row === lm.row && Math.abs((z.x - 4) * 1.25 - lm.mesh.position.x) < 0.7) {
            z.hp = 0;
          }
        });
        if (lm.mesh.position.x > 6.5) {
          this.scene.remove(lm.mesh);
          lm.active = false;
        }
      }
    });

    // 8. Zombies Movement & Eating Logic
    const remainingZombies: Zombie3D[] = [];
    this.zombies.forEach(z => {
      if (z.hp <= 0) {
        this.scene.remove(z.mesh);
        this.kills.update(k => k + 1);
        if (mode === 'vasebreaker' || mode === 'mystery_pots') {
          this.checkPuzzleVictory();
        }
        return;
      }

      // Slow Zombie Movement
      let currentSpeed = z.speed;
      if (z.slowTimer > 0) {
        z.slowTimer--;
        currentSpeed *= 0.5;
      }

      const worldX = (z.x - 4) * 1.25;
      const targetPlant = this.placedPlants.find(p => p.row === z.row && Math.abs((p.col - 4) * 1.25 - worldX) < 0.45);

      if (z.type === 'runner' && !z.hasVaulted && targetPlant) {
        z.hasVaulted = true;
        z.x -= 1.0;
        z.speed = 0.005;
      } else if (targetPlant) {
        targetPlant.hp -= 0.35; // Eat plant
      } else {
        z.x -= currentSpeed;
        z.mesh.position.x = (z.x - 4) * 1.25;
        z.mesh.position.z = ((z.row - 2) * 1.35) + Math.sin(this.tickCount * 0.08) * 0.04;
      }

      // Trigger Lawnmower if reached left lawn edge
      if ((z.x - 4) * 1.25 <= (-4.2) * 1.25) {
        const lm = this.lawnmowers.find(m => m.row === z.row && !m.used);
        if (lm) {
          lm.active = true;
          lm.used = true;
        }
      }

      // Reached house behind lawnmowers -> Game Over!
      if ((z.x - 4) * 1.25 < (-5.0) * 1.25) {
        this.gameOver.set(true);
      } else {
        remainingZombies.push(z);
      }
    });
    this.zombies = remainingZombies;

    // 9. Cleanup Destroyed Plants
    const activePlants: PlacedPlant3D[] = [];
    this.placedPlants.forEach(p => {
      if (p.hp <= 0) {
        this.scene.remove(p.mesh);
      } else {
        activePlants.push(p);
      }
    });
    this.placedPlants = activePlants;
  }

  private fireProjectile(row: number, x: number, z: number, isIce: boolean) {
    const pGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const pMat = new THREE.MeshBasicMaterial({ color: isIce ? 0x38bdf8 : 0x84cc16 });
    const pMesh = new THREE.Mesh(pGeo, pMat);
    pMesh.position.set(x, 0.55, z);
    this.scene.add(pMesh);

    this.projectiles.push({
      id: this.nextId++,
      row,
      x,
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
    this.rollingWallnuts.forEach(w => this.scene.remove(w.mesh));
    this.vase3DObjects.forEach(v => this.scene.remove(v.mesh));

    this.placedPlants = [];
    this.zombies = [];
    this.projectiles = [];
    this.sunOrbs = [];
    this.lawnmowers = [];
    this.rollingWallnuts = [];
    this.vase3DObjects = [];
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animFrameId);
    if (this.renderer) this.renderer.dispose();
  }
}
