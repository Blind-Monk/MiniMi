import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, signal, HostListener, inject, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogItem } from '../../../core/models/catalog.model';
import { AudioService } from '../../../core/services/audio.service';

@Component({
  selector: 'app-universal-game-engine',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-2xl mx-auto space-y-4 shadow-2xl font-sans select-none">

      <!-- Top Engine HUD Header -->
      <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center space-x-3">
          <span class="text-3xl">{{ item?.icon || '🎮' }}</span>
          <div>
            <h2 class="text-lg font-black text-amber-400 tracking-wider flex items-center space-x-2">
              <span>{{ item?.name || 'Interactive Game' }}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                {{ engineMode().toUpperCase() }} ENGINE
              </span>
            </h2>
            <p class="text-xs text-slate-400 line-clamp-1">{{ item?.description }}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">
            Score: <strong class="text-amber-300">{{ score() }}</strong>
          </div>
          <div class="bg-slate-800 px-3 py-1 rounded-lg text-xs font-mono border border-slate-700">
            Health: <strong class="text-emerald-400">{{ health() }}%</strong>
          </div>
          <button (click)="restartGame()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition">
            🔄 Reset
          </button>
        </div>
      </div>

      <!-- Live Canvas Arena Container -->
      <div class="relative bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col items-center justify-center overflow-hidden">

        <canvas #engineCanvas width="520" height="340" class="bg-black rounded-xl border-2 border-indigo-900/60 shadow-inner w-full max-w-full">
        </canvas>

        <!-- Overlay for Game Over -->
        <div *ngIf="isGameOver()" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
          <span class="text-5xl animate-bounce">💀</span>
          <h3 class="text-2xl font-black text-red-500">GAME OVER</h3>
          <p class="text-xs text-slate-300">Final Score: <strong class="text-amber-300 text-sm">{{ score() }}</strong></p>
          <button (click)="restartGame()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg">
            🔄 Replay {{ item?.name }}
          </button>
        </div>

      </div>

      <!-- Action Controls & Touch Pad -->
      <div class="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="text-xs text-slate-400 font-mono">
          <span>Controls: <strong class="text-slate-200">WASD / Arrow Keys</strong> + <strong class="text-amber-300">Space / Click</strong> to Action</span>
        </div>

        <div class="flex items-center space-x-2">
          <button (click)="handleAction('UP')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700">▲</button>
          <button (click)="handleAction('LEFT')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700">◀</button>
          <button (click)="handleAction('FIRE')" class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg shadow">🔥 Action</button>
          <button (click)="handleAction('RIGHT')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700">▶</button>
          <button (click)="handleAction('DOWN')" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700">▼</button>
        </div>
      </div>

    </div>
  `
})
export class UniversalGameEngineComponent implements OnInit, OnDestroy, OnChanges {
  @Input() item: CatalogItem | null = null;
  @ViewChild('engineCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private audioService = inject(AudioService);

  // Engine Signals
  score = signal<number>(0);
  health = signal<number>(100);
  isGameOver = signal<boolean>(false);
  engineMode = signal<'strategy' | 'fps' | 'platformer' | 'simulator' | 'rpg' | 'puzzle'>('strategy');

  // Loop & Canvas State
  private ctx!: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private tickCount = 0;

  // Dynamic Engine Game Entities
  private player = { x: 260, y: 170, vx: 0, vy: 0, size: 16, angle: 0 };
  private bullets: { x: number; y: number; vx: number; vy: number }[] = [];
  private enemies: { x: number; y: number; vx: number; vy: number; hp: number; color: string }[] = [];
  private collectibles: { x: number; y: number; type: string }[] = [];

  ngOnInit() {
    this.configureEngineMode();
    this.audioService.startPlaylist('high-energy');
    setTimeout(() => this.startGameLoop(), 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['item']) {
      this.configureEngineMode();
      this.restartGame();
    }
  }

  ngOnDestroy() {
    this.stopGameLoop();
    this.audioService.stopMusic();
  }

  private configureEngineMode() {
    if (!this.item) return;
    const cat = this.item.subcategory.toLowerCase();
    const tags = this.item.tags.join(' ').toLowerCase();

    if (cat.includes('fps') || cat.includes('3d') || tags.includes('fps')) {
      this.engineMode.set('fps');
    } else if (cat.includes('platformer') || cat.includes('runner') || cat.includes('mario')) {
      this.engineMode.set('platformer');
    } else if (cat.includes('sim') || cat.includes('racing') || cat.includes('flight') || cat.includes('transport')) {
      this.engineMode.set('simulator');
    } else if (cat.includes('rpg') || cat.includes('roguelike') || cat.includes('voxel')) {
      this.engineMode.set('rpg');
    } else if (cat.includes('puzzle') || cat.includes('board') || cat.includes('cards') || cat.includes('logic')) {
      this.engineMode.set('puzzle');
    } else {
      this.engineMode.set('strategy');
    }
  }

  restartGame() {
    this.score.set(0);
    this.health.set(100);
    this.isGameOver.set(false);
    this.tickCount = 0;
    this.player = { x: 260, y: 170, vx: 0, vy: 0, size: 16, angle: 0 };
    this.bullets = [];
    this.enemies = [];
    this.collectibles = [];
    this.spawnEntities();
  }

  private spawnEntities() {
    for (let i = 0; i < 6; i++) {
      this.enemies.push({
        x: Math.random() * 480 + 20,
        y: Math.random() * 300 + 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        hp: 2,
        color: ['#ef4444', '#f59e0b', '#ec4899', '#8b5cf6'][i % 4]
      });
    }

    for (let i = 0; i < 8; i++) {
      this.collectibles.push({
        x: Math.random() * 480 + 20,
        y: Math.random() * 300 + 20,
        type: 'coin'
      });
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.isGameOver()) return;
    switch (event.key) {
      case 'ArrowUp': case 'w': case 'W': this.handleAction('UP'); break;
      case 'ArrowDown': case 's': case 'S': this.handleAction('DOWN'); break;
      case 'ArrowLeft': case 'a': case 'A': this.handleAction('LEFT'); break;
      case 'ArrowRight': case 'd': case 'D': this.handleAction('RIGHT'); break;
      case ' ': this.handleAction('FIRE'); event.preventDefault(); break;
    }
  }

  handleAction(action: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'FIRE') {
    if (this.isGameOver()) return;

    const speed = 6;
    if (action === 'UP') { this.player.y -= speed; this.player.angle = -Math.PI / 2; }
    if (action === 'DOWN') { this.player.y += speed; this.player.angle = Math.PI / 2; }
    if (action === 'LEFT') { this.player.x -= speed; this.player.angle = Math.PI; }
    if (action === 'RIGHT') { this.player.x += speed; this.player.angle = 0; }

    if (action === 'FIRE') {
      const vx = Math.cos(this.player.angle) * 8;
      const vy = Math.sin(this.player.angle) * 8;
      this.bullets.push({ x: this.player.x, y: this.player.y, vx: vx || 8, vy });
      this.audioService.playJumpSound();
    }
  }

  private startGameLoop() {
    this.stopGameLoop();
    const render = () => {
      if (!this.isGameOver()) {
        this.updateLogic();
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

  private updateLogic() {
    this.tickCount++;

    // Clamp player
    this.player.x = Math.max(10, Math.min(510, this.player.x));
    this.player.y = Math.max(10, Math.min(330, this.player.y));

    // Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < 0 || b.x > 520 || b.y < 0 || b.y > 340) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Hit Enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.hypot(e.x - b.x, e.y - b.y) < 18) {
          e.hp--;
          this.bullets.splice(i, 1);
          this.audioService.playExplosionSound();
          if (e.hp <= 0) {
            this.enemies.splice(j, 1);
            this.score.update(s => s + 100);
            // Spawn replacement
            this.enemies.push({
              x: Math.random() * 480 + 20,
              y: Math.random() * 300 + 20,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              hp: 2,
              color: '#ef4444'
            });
          }
          break;
        }
      }
    }

    // Update Enemies AI
    this.enemies.forEach(e => {
      e.x += e.vx;
      e.y += e.vy;
      if (e.x < 15 || e.x > 505) e.vx = -e.vx;
      if (e.y < 15 || e.y > 325) e.vy = -e.vy;

      // Enemy hit player
      if (Math.hypot(e.x - this.player.x, e.y - this.player.y) < 20) {
        this.health.update(h => Math.max(0, h - 1));
        if (this.health() <= 0) {
          this.isGameOver.set(true);
        }
      }
    });

    // Collectibles
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      if (Math.hypot(c.x - this.player.x, c.y - this.player.y) < 20) {
        this.collectibles.splice(i, 1);
        this.score.update(s => s + 50);
        this.audioService.playCoinSound();
        this.collectibles.push({
          x: Math.random() * 480 + 20,
          y: Math.random() * 300 + 20,
          type: 'coin'
        });
      }
    }
  }

  private drawScene() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    if (!this.ctx) return;

    // Background according to mode
    const mode = this.engineMode();
    if (mode === 'fps') {
      this.ctx.fillStyle = '#0f172a';
    } else if (mode === 'platformer') {
      this.ctx.fillStyle = '#0284c7';
    } else if (mode === 'rpg') {
      this.ctx.fillStyle = '#14532d';
    } else if (mode === 'simulator') {
      this.ctx.fillStyle = '#1e1b4b';
    } else {
      this.ctx.fillStyle = '#020617';
    }
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, canvas.height); this.ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(canvas.width, y); this.ctx.stroke();
    }

    // Collectibles
    this.collectibles.forEach(c => {
      this.ctx.fillStyle = '#facc15';
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.stroke();
    });

    // Bullets
    this.ctx.fillStyle = '#38bdf8';
    this.bullets.forEach(b => {
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Enemies
    this.enemies.forEach(e => {
      this.ctx.fillStyle = e.color;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
      this.ctx.fill();

      // Enemy eyes
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(e.x - 4, e.y - 4, 3, 3);
      this.ctx.fillRect(e.x + 2, e.y - 4, 3, 3);
    });

    // Player Avatar
    this.ctx.save();
    this.ctx.translate(this.player.x, this.player.y);
    this.ctx.rotate(this.player.angle);

    this.ctx.fillStyle = '#10b981';
    this.ctx.beginPath();
    this.ctx.moveTo(14, 0);
    this.ctx.lineTo(-10, -10);
    this.ctx.lineTo(-6, 0);
    this.ctx.lineTo(-10, 10);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    // Mode Title Overlay
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(`MODE: ${mode.toUpperCase()} | TARGETS: ${this.enemies.length}`, 12, 20);
  }
}
