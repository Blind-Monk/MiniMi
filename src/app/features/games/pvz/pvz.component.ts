import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Plant {
  id: string;
  name: string;
  cost: number;
  icon: string;
  type: 'sun' | 'shooter' | 'wall';
}

interface PlacedPlant {
  row: number;
  col: number;
  type: 'sun' | 'shooter' | 'wall';
  hp: number;
  icon: string;
  lastAction: number;
}

interface Groaner {
  id: number;
  row: number;
  col: number; // floating x position (0 to 8)
  hp: number;
  maxHp: number;
  speed: number;
  type: 'shambler' | 'runner';
}

interface Projectile {
  id: number;
  row: number;
  x: number; // 0 to 9
}

@Component({
  selector: 'app-pvz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-4xl mx-auto space-y-4">
      <!-- Top HUD Bar -->
      <div class="flex flex-wrap items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 gap-2">
        <div class="flex items-center space-x-2 bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-lg border border-yellow-500/40 font-bold text-lg">
          <span>☀️ Sun:</span>
          <span>{{ sun() }}</span>
        </div>

        <!-- Plant Selection Cards -->
        <div class="flex items-center space-x-2">
          @for (p of availablePlants; track p.id) {
            <button
              (click)="selectPlant(p)"
              [disabled]="sun() < p.cost"
              [class.border-teal-400]="selectedPlant()?.id === p.id"
              [class.bg-slate-700]="selectedPlant()?.id === p.id"
              class="flex items-center space-x-1.5 bg-slate-800 border border-slate-600 px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-700 transition-all text-xs font-semibold">
              <span class="text-xl">{{ p.icon }}</span>
              <div class="text-left">
                <div>{{ p.name }}</div>
                <div class="text-yellow-400 font-mono">{{ p.cost }} ☀️</div>
              </div>
            </button>
          }
        </div>

        <button
          (click)="toggleGame()"
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg transition-colors text-sm">
          {{ isRunning() ? '⏸ Pause' : '▶ Play' }}
        </button>
      </div>

      <!-- Lawn Board Grid (5 Rows x 9 Cols) -->
      <div class="relative bg-emerald-950 border-2 border-emerald-700 rounded-xl p-2 select-none overflow-hidden">
        <div class="grid grid-rows-5 gap-1.5 relative">
          @for (rowIdx of rows; track rowIdx) {
            <div class="grid grid-cols-9 gap-1.5 h-16 sm:h-20 bg-emerald-900/40 border-b border-emerald-800/40 last:border-b-0 rounded-md">
              @for (colIdx of cols; track colIdx) {
                <div
                  (click)="placePlantOnTile(rowIdx, colIdx)"
                  class="bg-emerald-800/30 hover:bg-emerald-700/50 border border-emerald-700/30 rounded-md flex items-center justify-center cursor-pointer transition-colors relative">

                  <!-- Render Placed Plant -->
                  @if (getPlantAt(rowIdx, colIdx); as plant) {
                    <div class="text-2xl sm:text-3xl animate-bounce-short flex flex-col items-center">
                      <span>{{ plant.icon }}</span>
                      <div class="w-8 h-1 bg-slate-900 rounded-full mt-1 overflow-hidden">
                        <div [style.width.%]="(plant.hp / (plant.type === 'wall' ? 100 : 30)) * 100" class="h-full bg-green-500"></div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Render Flying Seed Projectiles -->
        @for (proj of projectiles(); track proj.id) {
          <div
            [style.top.%]="proj.row * 20 + 8"
            [style.left.%]="(proj.x / 9) * 100"
            class="absolute w-4 h-4 bg-lime-400 rounded-full border border-lime-200 shadow-md transform -translate-x-1/2 pointer-events-none text-[8px] flex items-center justify-center">
            🟢
          </div>
        }

        <!-- Render Groaner Zombies -->
        @for (g of groaners(); track g.id) {
          <div
            [style.top.%]="g.row * 20 + 3"
            [style.left.%]="(g.col / 9) * 90"
            class="absolute flex flex-col items-center transition-all duration-100 transform -translate-x-1/2 pointer-events-none">
            <span class="text-3xl sm:text-4xl animate-pulse">{{ g.type === 'shambler' ? '🧟' : '🧟‍♂️' }}</span>
            <div class="w-8 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <div [style.width.%]="(g.hp / g.maxHp) * 100" class="h-full bg-red-500"></div>
            </div>
          </div>
        }
      </div>

      <!-- Info Banner -->
      <div class="text-xs text-slate-400 flex items-center justify-between bg-slate-800/60 p-2.5 rounded-lg">
        <span>Click a plant card above, then click any green tile on the lawn to plant.</span>
        <span class="font-bold text-teal-400">Waves Defeated: {{ wave() }}</span>
      </div>
    </div>
  `
})
export class PvzComponent implements OnDestroy {
  rows = [0, 1, 2, 3, 4];
  cols = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  availablePlants: Plant[] = [
    { id: 'sunbloom', name: 'Sunbloom', cost: 50, icon: '🌻', type: 'sun' },
    { id: 'peltpod', name: 'Pelt-Pod', cost: 100, icon: '🌱', type: 'shooter' },
    { id: 'barkblock', name: 'Bark Block', cost: 50, icon: '🪵', type: 'wall' }
  ];

  selectedPlant = signal<Plant | null>(this.availablePlants[0]);
  sun = signal<number>(150);
  placedPlants = signal<PlacedPlant[]>([]);
  groaners = signal<Groaner[]>([]);
  projectiles = signal<Projectile[]>([]);
  wave = signal<number>(1);
  isRunning = signal<boolean>(true);

  private timer: any;
  private tickCount = 0;
  private nextId = 1;

  constructor() {
    this.timer = setInterval(() => this.gameLoop(), 200);
  }

  selectPlant(p: Plant) {
    this.selectedPlant.set(p);
  }

  getPlantAt(row: number, col: number): PlacedPlant | undefined {
    return this.placedPlants().find(p => p.row === row && p.col === col);
  }

  placePlantOnTile(row: number, col: number) {
    const p = this.selectedPlant();
    if (!p || this.sun() < p.cost) return;
    if (this.getPlantAt(row, col)) return; // Tile occupied

    this.sun.update(s => s - p.cost);
    const newPlant: PlacedPlant = {
      row,
      col,
      type: p.type,
      hp: p.type === 'wall' ? 100 : 30,
      icon: p.icon,
      lastAction: this.tickCount
    };
    this.placedPlants.update(arr => [...arr, newPlant]);
  }

  toggleGame() {
    this.isRunning.update(r => !r);
  }

  private gameLoop() {
    if (!this.isRunning()) return;
    this.tickCount++;

    // 1. Passive Sun Generation
    if (this.tickCount % 25 === 0) {
      this.sun.update(s => s + 25);
    }

    // 2. Plant Actions (Sunbloom gives sun, Pelt-Pod shoots)
    const currentPlants = [...this.placedPlants()];
    currentPlants.forEach(plant => {
      if (plant.type === 'sun' && (this.tickCount - plant.lastAction) >= 30) {
        this.sun.update(s => s + 25);
        plant.lastAction = this.tickCount;
      } else if (plant.type === 'shooter' && (this.tickCount - plant.lastAction) >= 10) {
        // Spawn seed projectile if there is a zombie in row
        const hasZombie = this.groaners().some(g => g.row === plant.row && g.col > plant.col);
        if (hasZombie) {
          this.projectiles.update(projs => [...projs, { id: this.nextId++, row: plant.row, x: plant.col + 0.5 }]);
          plant.lastAction = this.tickCount;
        }
      }
    });

    // 3. Move Projectiles & Check Collisions
    const updatedProjs: Projectile[] = [];
    const currentGroaners = [...this.groaners()];

    this.projectiles().forEach(proj => {
      const nextX = proj.x + 0.4;
      let hit = false;

      currentGroaners.forEach(g => {
        if (!hit && g.row === proj.row && Math.abs(g.col - nextX) < 0.4) {
          g.hp -= 10;
          hit = true;
        }
      });

      if (!hit && nextX < 9) {
        updatedProjs.push({ ...proj, x: nextX });
      }
    });

    // Remove dead zombies
    this.groaners.set(currentGroaners.filter(g => g.hp > 0));
    this.projectiles.set(updatedProjs);

    // 4. Move Groaner Zombies & Attack Plants
    const remainingPlants: PlacedPlant[] = [...this.placedPlants()];

    const updatedGroaners = this.groaners().map(g => {
      // Check if blocked by plant
      const targetPlant = remainingPlants.find(p => p.row === g.row && Math.abs(p.col - g.col) < 0.4);
      if (targetPlant) {
        targetPlant.hp -= 2;
        return g; // Stay in place while eating
      } else {
        return { ...g, col: g.col - g.speed };
      }
    });

    // Clean up destroyed plants
    this.placedPlants.set(remainingPlants.filter(p => p.hp > 0));
    this.groaners.set(updatedGroaners);

    // 5. Spawn Zombies Periodically
    if (this.tickCount % 40 === 0) {
      const randomRow = Math.floor(Math.random() * 5);
      const isRunner = Math.random() > 0.7;
      this.groaners.update(gs => [
        ...gs,
        {
          id: this.nextId++,
          row: randomRow,
          col: 8.8,
          hp: isRunner ? 30 : 50,
          maxHp: isRunner ? 30 : 50,
          speed: isRunner ? 0.12 : 0.06,
          type: isRunner ? 'runner' : 'shambler'
        }
      ]);
    }
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}
