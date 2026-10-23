import { Component, OnInit, OnDestroy, ElementRef, ViewChild, signal, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

export type Faction = 'Romans' | 'Persians';
export type Phase = 'Village' | 'Town' | 'City';
export type ResourceType = 'food' | 'wood' | 'stone' | 'metal';

export interface Resources {
  food: number;
  wood: number;
  stone: number;
  metal: number;
}

export interface Unit {
  id: string;
  type: 'citizen' | 'spearman' | 'archer' | 'cavalry' | 'siege_ram';
  owner: 'player' | 'enemy';
  faction: Faction;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  hp: number;
  maxHp: number;
  attack: number;
  armor: number;
  speed: number;
  range: number;
  state: 'idle' | 'moving' | 'gathering' | 'building' | 'attacking';
  carrying: { type: ResourceType; amount: number } | null;
  carryCapacity: number;
  targetEntityId?: string;
  selected?: boolean;
}

export interface Building {
  id: string;
  type: 'civic_center' | 'house' | 'barracks' | 'farmstead' | 'fortress';
  name: string;
  owner: 'player' | 'enemy';
  faction: Faction;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  constructionProgress: number; // 0 to 100
  trainingQueue: { unitType: string; progress: number }[];
  selected?: boolean;
}

export interface ResourceNode {
  id: string;
  type: ResourceType;
  x: number;
  y: number;
  amount: number;
  maxAmount: number;
}

@Component({
  selector: 'app-rts-0ad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-4xl mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- Top Resource & Phase HUD -->
      <div class="flex flex-wrap items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800 gap-2">
        <div class="flex items-center space-x-3">
          <span class="text-3xl animate-bounce">🏛️</span>
          <div>
            <h2 class="text-lg font-black text-amber-400 tracking-wider">0 A.D. HISTORICAL RTS</h2>
            <p class="text-xs text-slate-400">Empire Building & Ancient Warfare • {{ currentFaction() }}</p>
          </div>
        </div>

        <!-- Resource Bar -->
        <div class="flex items-center space-x-3 text-xs font-mono">
          <div class="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1">
            <span>🌾</span><strong class="text-amber-300">{{ resources().food }}</strong>
          </div>
          <div class="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1">
            <span>🪵</span><strong class="text-amber-600">{{ resources().wood }}</strong>
          </div>
          <div class="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1">
            <span>🪨</span><strong class="text-slate-300">{{ resources().stone }}</strong>
          </div>
          <div class="bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center space-x-1">
            <span>⚔️</span><strong class="text-cyan-300">{{ resources().metal }}</strong>
          </div>
          <div class="bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-700 text-indigo-300 font-bold">
            Phase: {{ currentPhase() }}
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button (click)="advancePhase()" *ngIf="currentPhase() !== 'City'" class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black shadow transition">
            🏛️ Age Up Phase
          </button>
          <button (click)="restartGame()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Main RTS Canvas Arena & Minimap Overlay -->
      <div class="relative bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col items-center justify-center overflow-hidden">

        <canvas #rtsCanvas width="700" height="420"
          (mousedown)="handleMouseDown($event)"
          (mousemove)="handleMouseMove($event)"
          (mouseup)="handleMouseUp($event)"
          (contextmenu)="handleRightClick($event)"
          class="bg-slate-950 rounded-xl border-2 border-amber-900/60 shadow-inner cursor-crosshair w-full max-w-full">
        </canvas>

        <!-- Minimap Overlay -->
        <div class="absolute bottom-4 left-4 bg-slate-950/90 border border-amber-600/50 p-1 rounded-lg shadow-xl hidden sm:block">
          <canvas #minimapCanvas width="120" height="90" class="rounded bg-black"></canvas>
        </div>

        <!-- Command & Build Panel Bar -->
        <div class="absolute bottom-4 right-4 bg-slate-950/90 border border-slate-800 p-2 rounded-xl shadow-xl flex items-center space-x-2">
          <button (click)="selectBuildType('house')" class="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900 text-xs font-bold rounded border border-slate-700">
            🏠 House (50 Wood)
          </button>
          <button (click)="selectBuildType('barracks')" class="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900 text-xs font-bold rounded border border-slate-700">
            ⚔️ Barracks (100 Wood)
          </button>
          <button (click)="selectBuildType('fortress')" *ngIf="currentPhase() === 'City'" class="px-2.5 py-1 bg-slate-800 hover:bg-indigo-900 text-xs font-bold rounded border border-slate-700">
            🏰 Fortress (200 Stone)
          </button>
        </div>

        <!-- Game Over / Victory Screen Overlay -->
        <div *ngIf="isGameOver()" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-6xl animate-bounce">{{ gameVictory() ? '🏆' : '💀' }}</span>
          <h2 class="text-3xl font-black text-amber-400">{{ gameVictory() ? 'VICTORY! EMPIRE SECURED' : 'DEFEAT! CIVIC CENTER FALLEN' }}</h2>
          <p class="text-xs text-slate-300 max-w-md">
            {{ gameVictory() ? 'You successfully destroyed the enemy Civic Center and conquered the region.' : 'Your Civic Center was destroyed by enemy forces.' }}
          </p>
          <button (click)="restartGame()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-sm shadow-xl">
            🔄 Start New Match
          </button>
        </div>

      </div>

      <!-- Action Panel & Selection HUD -->
      <div class="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div class="text-slate-300 font-mono">
          <span>Selected: <strong class="text-amber-300">{{ selectedUnitsCount() }} Units</strong>, <strong class="text-cyan-300">{{ selectedBuildingName() }}</strong></span>
        </div>

        <div class="flex items-center space-x-2">
          <button (click)="trainUnit('citizen')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700">
            👨‍🌾 Train Citizen (50 Food)
          </button>
          <button (click)="trainUnit('spearman')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700">
            🗡️ Train Spearman (60 Wood)
          </button>
          <button (click)="trainUnit('cavalry')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg border border-slate-700">
            🐎 Train Cavalry (80 Food, 40 Metal)
          </button>
        </div>
      </div>

    </div>
  `
})
export class Rts0adComponent implements OnInit, OnDestroy {
  @ViewChild('rtsCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('minimapCanvas', { static: false }) minimapRef!: ElementRef<HTMLCanvasElement>;

  private audioService = inject(AudioService);

  // Engine Signals
  resources = signal<Resources>({ food: 300, wood: 300, stone: 150, metal: 150 });
  currentFaction = signal<Faction>('Romans');
  currentPhase = signal<Phase>('Village');
  isGameOver = signal<boolean>(false);
  gameVictory = signal<boolean>(false);

  selectedUnitsCount = signal<number>(0);
  selectedBuildingName = signal<string>('None');

  // Entities
  private units: Unit[] = [];
  private buildings: Building[] = [];
  private resourceNodes: ResourceNode[] = [];

  // Interaction State
  private isSelecting = false;
  private selectStart = { x: 0, y: 0 };
  private selectEnd = { x: 0, y: 0 };
  private pendingBuildType: 'house' | 'barracks' | 'fortress' | null = null;

  private ctx!: CanvasRenderingContext2D;
  private animFrameId: number | null = null;

  ngOnInit() {
    this.audioService.startPlaylist('high-energy');
    this.restartGame();
  }

  ngOnDestroy() {
    this.stopGameLoop();
    this.audioService.stopMusic();
  }

  restartGame() {
    this.resources.set({ food: 300, wood: 300, stone: 150, metal: 150 });
    this.currentPhase.set('Village');
    this.isGameOver.set(false);
    this.gameVictory.set(false);
    this.pendingBuildType = null;

    // Init Map Entities
    this.buildings = [
      { id: 'p_cc', type: 'civic_center', name: 'Roman Forum', owner: 'player', faction: 'Romans', x: 120, y: 210, hp: 1200, maxHp: 1200, constructionProgress: 100, trainingQueue: [] },
      { id: 'e_cc', type: 'civic_center', name: 'Persian Palace', owner: 'enemy', faction: 'Persians', x: 580, y: 210, hp: 1200, maxHp: 1200, constructionProgress: 100, trainingQueue: [] }
    ];

    this.units = [
      { id: 'p_u1', type: 'citizen', owner: 'player', faction: 'Romans', x: 150, y: 180, hp: 50, maxHp: 50, attack: 5, armor: 1, speed: 1.8, range: 10, state: 'idle', carrying: null, carryCapacity: 10 },
      { id: 'p_u2', type: 'citizen', owner: 'player', faction: 'Romans', x: 150, y: 240, hp: 50, maxHp: 50, attack: 5, armor: 1, speed: 1.8, range: 10, state: 'idle', carrying: null, carryCapacity: 10 },
      { id: 'p_u3', type: 'spearman', owner: 'player', faction: 'Romans', x: 180, y: 210, hp: 80, maxHp: 80, attack: 12, armor: 3, speed: 1.5, range: 15, state: 'idle', carrying: null, carryCapacity: 0 },

      { id: 'e_u1', type: 'citizen', owner: 'enemy', faction: 'Persians', x: 550, y: 180, hp: 50, maxHp: 50, attack: 5, armor: 1, speed: 1.8, range: 10, state: 'idle', carrying: null, carryCapacity: 10 },
      { id: 'e_u2', type: 'spearman', owner: 'enemy', faction: 'Persians', x: 530, y: 210, hp: 80, maxHp: 80, attack: 12, armor: 3, speed: 1.5, range: 15, state: 'idle', carrying: null, carryCapacity: 0 }
    ];

    this.resourceNodes = [
      { id: 'rn_1', type: 'food', x: 80, y: 100, amount: 500, maxAmount: 500 },
      { id: 'rn_2', type: 'wood', x: 200, y: 80, amount: 600, maxAmount: 600 },
      { id: 'rn_3', type: 'stone', x: 100, y: 320, amount: 400, maxAmount: 400 },
      { id: 'rn_4', type: 'metal', x: 220, y: 340, amount: 400, maxAmount: 400 },

      { id: 'rn_5', type: 'food', x: 620, y: 100, amount: 500, maxAmount: 500 },
      { id: 'rn_6', type: 'wood', x: 500, y: 80, amount: 600, maxAmount: 600 }
    ];

    setTimeout(() => this.startGameLoop(), 100);
  }

  advancePhase() {
    const res = this.resources();
    if (this.currentPhase() === 'Village' && res.food >= 200 && res.wood >= 200) {
      this.resources.update(r => ({ ...r, food: r.food - 200, wood: r.wood - 200 }));
      this.currentPhase.set('Town');
      this.audioService.playCoinSound();
    } else if (this.currentPhase() === 'Town' && res.food >= 400 && res.wood >= 400 && res.stone >= 200) {
      this.resources.update(r => ({ ...r, food: r.food - 400, wood: r.wood - 400, stone: r.stone - 200 }));
      this.currentPhase.set('City');
      this.audioService.playCoinSound();
    }
  }

  selectBuildType(type: 'house' | 'barracks' | 'fortress') {
    this.pendingBuildType = type;
  }

  trainUnit(type: 'citizen' | 'spearman' | 'cavalry') {
    const res = this.resources();
    let canTrain = false;

    if (type === 'citizen' && res.food >= 50) {
      this.resources.update(r => ({ ...r, food: r.food - 50 }));
      canTrain = true;
    } else if (type === 'spearman' && res.wood >= 60) {
      this.resources.update(r => ({ ...r, wood: r.wood - 60 }));
      canTrain = true;
    } else if (type === 'cavalry' && res.food >= 80 && res.metal >= 40) {
      this.resources.update(r => ({ ...r, food: r.food - 80, metal: r.metal - 40 }));
      canTrain = true;
    }

    if (canTrain) {
      this.units.push({
        id: 'p_u_' + Date.now(),
        type,
        owner: 'player',
        faction: 'Romans',
        x: 130 + Math.random() * 20,
        y: 220 + Math.random() * 20,
        hp: type === 'cavalry' ? 120 : (type === 'spearman' ? 80 : 50),
        maxHp: type === 'cavalry' ? 120 : (type === 'spearman' ? 80 : 50),
        attack: type === 'cavalry' ? 18 : (type === 'spearman' ? 12 : 5),
        armor: 2,
        speed: type === 'cavalry' ? 2.5 : 1.6,
        range: 15,
        state: 'idle',
        carrying: null,
        carryCapacity: type === 'citizen' ? 10 : 0
      });
      this.audioService.playClickSound();
    }
  }

  handleMouseDown(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (event.button === 0) { // Left Click
      if (this.pendingBuildType) {
        // Place building
        this.buildings.push({
          id: 'b_' + Date.now(),
          type: this.pendingBuildType,
          name: this.pendingBuildType.toUpperCase(),
          owner: 'player',
          faction: 'Romans',
          x, y,
          hp: 400, maxHp: 400,
          constructionProgress: 100,
          trainingQueue: []
        });
        this.pendingBuildType = null;
        this.audioService.playClickSound();
        return;
      }

      this.isSelecting = true;
      this.selectStart = { x, y };
      this.selectEnd = { x, y };
    }
  }

  handleMouseMove(event: MouseEvent) {
    if (this.isSelecting) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      this.selectEnd = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
  }

  handleMouseUp(event: MouseEvent) {
    if (this.isSelecting && event.button === 0) {
      this.isSelecting = false;
      const minX = Math.min(this.selectStart.x, this.selectEnd.x);
      const maxX = Math.max(this.selectStart.x, this.selectEnd.x);
      const minY = Math.min(this.selectStart.y, this.selectEnd.y);
      const maxY = Math.max(this.selectStart.y, this.selectEnd.y);

      let selectedCount = 0;
      this.units.forEach(u => {
        if (u.owner === 'player') {
          if (Math.abs(maxX - minX) < 5 && Math.abs(maxY - minY) < 5) {
            u.selected = Math.hypot(u.x - minX, u.y - minY) < 20;
          } else {
            u.selected = u.x >= minX && u.x <= maxX && u.y >= minY && u.y <= maxY;
          }
          if (u.selected) selectedCount++;
        }
      });
      this.selectedUnitsCount.set(selectedCount);
    }
  }

  handleRightClick(event: MouseEvent) {
    event.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Issue move/attack/gather order
    this.units.filter(u => u.owner === 'player' && u.selected).forEach(u => {
      u.targetX = x;
      u.targetY = y;
      u.state = 'moving';
    });
    this.audioService.playClickSound();
  }

  private startGameLoop() {
    this.stopGameLoop();
    const render = () => {
      if (!this.isGameOver()) {
        this.updateGameLogic();
        this.drawScene();
      }
      this.animFrameId = requestAnimationFrame(render);
    };
    this.animFrameId = requestAnimationFrame(render);
  }

  private stopGameLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private updateGameLogic() {
    // Unit Movement & Combat AI
    this.units.forEach(u => {
      if (u.targetX !== undefined && u.targetY !== undefined) {
        const dx = u.targetX - u.x;
        const dy = u.targetY - u.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
          u.x += (dx / dist) * u.speed;
          u.y += (dy / dist) * u.speed;
        } else {
          u.targetX = undefined;
          u.targetY = undefined;
          u.state = 'idle';
        }
      }

      // Enemy AI Combat
      if (u.owner === 'enemy') {
        const targetPlayer = this.units.find(p => p.owner === 'player' && Math.hypot(p.x - u.x, p.y - u.y) < 120);
        if (targetPlayer) {
          u.targetX = targetPlayer.x;
          u.targetY = targetPlayer.y;
          if (Math.hypot(targetPlayer.x - u.x, targetPlayer.y - u.y) < 20) {
            targetPlayer.hp -= 0.2;
            if (targetPlayer.hp <= 0) {
              this.units = this.units.filter(p => p !== targetPlayer);
            }
          }
        }
      }
    });

    // Check Victory Condition
    const enemyCC = this.buildings.find(b => b.owner === 'enemy' && b.type === 'civic_center');
    const playerCC = this.buildings.find(b => b.owner === 'player' && b.type === 'civic_center');

    if (!enemyCC) {
      this.isGameOver.set(true);
      this.gameVictory.set(true);
    } else if (!playerCC) {
      this.isGameOver.set(true);
      this.gameVictory.set(false);
    }
  }

  private drawScene() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) return;

    // Grass Terrain
    this.ctx.fillStyle = '#15803d';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    this.ctx.strokeStyle = '#166534';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 30) {
      this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, canvas.height); this.ctx.stroke();
    }

    // Draw Resource Nodes
    this.resourceNodes.forEach(rn => {
      this.ctx.fillStyle = rn.type === 'food' ? '#ef4444' : (rn.type === 'wood' ? '#854d0e' : (rn.type === 'stone' ? '#94a3b8' : '#06b6d4'));
      this.ctx.beginPath();
      this.ctx.arc(rn.x, rn.y, 10, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Draw Buildings
    this.buildings.forEach(b => {
      this.ctx.fillStyle = b.owner === 'player' ? '#1e40af' : '#991b1b';
      this.ctx.fillRect(b.x - 20, b.y - 20, 40, 40);
      this.ctx.strokeStyle = '#facc15';
      this.ctx.strokeRect(b.x - 20, b.y - 20, 40, 40);

      // HP Bar
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(b.x - 20, b.y - 26, 40, 4);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillRect(b.x - 20, b.y - 26, (b.hp / b.maxHp) * 40, 4);
    });

    // Draw Units
    this.units.forEach(u => {
      this.ctx.fillStyle = u.owner === 'player' ? '#3b82f6' : '#f43f5e';
      this.ctx.beginPath();
      this.ctx.arc(u.x, u.y, u.type === 'cavalry' ? 9 : 6, 0, Math.PI * 2);
      this.ctx.fill();

      if (u.selected) {
        this.ctx.strokeStyle = '#facc15';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });

    // Selection Drag Box
    if (this.isSelecting) {
      this.ctx.strokeStyle = '#facc15';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(this.selectStart.x, this.selectStart.y, this.selectEnd.x - this.selectStart.x, this.selectEnd.y - this.selectStart.y);
    }
  }
}
