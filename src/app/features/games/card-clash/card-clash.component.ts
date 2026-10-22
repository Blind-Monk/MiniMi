import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Card {
  id: number;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string; // '0'-'9', 'Skip', 'Reverse', '+2', 'Wild', 'Wild +4'
}

@Component({
  selector: 'app-card-clash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-4xl mx-auto space-y-4 shadow-2xl font-sans">

      <!-- Top HUD Header -->
      <div class="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🃏</span>
          <div>
            <h2 class="text-base font-extrabold text-amber-400">CARD CLASH (UNO STYLE)</h2>
            <p class="text-xs text-slate-400">Match by Color or Value • Action Cards & AI Opponents</p>
          </div>
        </div>

        <button (click)="restartGame()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold shadow">
          🔄 New Match
        </button>
      </div>

      <!-- Play Table Area -->
      <div class="bg-emerald-900/60 border-2 border-emerald-700/60 rounded-2xl p-6 min-h-[360px] flex flex-col justify-between relative shadow-inner">

        <!-- Opponents Hands -->
        <div class="flex justify-around items-center">
          <div class="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-center">
            <span class="text-xs font-bold text-slate-300">🤖 AI Bot 1</span>
            <div class="text-amber-400 font-extrabold text-sm">{{ ai1Hand().length }} Cards</div>
          </div>
          <div class="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-center">
            <span class="text-xs font-bold text-slate-300">🤖 AI Bot 2</span>
            <div class="text-amber-400 font-extrabold text-sm">{{ ai2Hand().length }} Cards</div>
          </div>
        </div>

        <!-- Center Discard & Draw Pile -->
        <div class="flex items-center justify-center gap-8 my-4">
          <!-- Draw Pile -->
          <button (click)="drawCardForPlayer()" [disabled]="turn() !== 0" class="w-24 h-36 bg-slate-800 hover:bg-slate-700 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center gap-1 shadow-xl transition-all cursor-pointer">
            <span class="text-2xl">🎴</span>
            <span class="text-xs font-bold text-slate-300">Draw Pile</span>
          </button>

          <!-- Top Discard Card -->
          @if (topCard(); as card) {
            <div [class]="getCardBgClass(card.color)" class="w-24 h-36 border-2 border-white/40 rounded-xl flex flex-col items-center justify-between p-3 shadow-2xl animate-fade-in font-extrabold">
              <span class="text-sm self-start">{{ card.value }}</span>
              <span class="text-3xl">{{ card.value }}</span>
              <span class="text-sm self-end">{{ card.value }}</span>
            </div>
          }
        </div>

        <!-- Player Hand -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-amber-300">YOUR HAND ({{ playerHand().length }} Cards)</span>
            <span class="text-xs text-slate-300 font-bold" [class.text-amber-400]="turn() === 0">
              {{ turn() === 0 ? "👉 YOUR TURN!" : "⏳ Opponent's Turn..." }}
            </span>
          </div>

          <div class="flex items-center gap-2 overflow-x-auto pb-2">
            @for (card of playerHand(); track card.id) {
              <button
                (click)="playCard(card)"
                [disabled]="turn() !== 0 || !canPlay(card)"
                [class]="getCardBgClass(card.color)"
                class="w-20 h-28 shrink-0 rounded-xl border-2 border-white/30 p-2 flex flex-col items-center justify-between font-black shadow-lg hover:-translate-y-2 disabled:opacity-40 transition-all cursor-pointer">
                <span class="text-xs self-start">{{ card.value }}</span>
                <span class="text-2xl">{{ card.value }}</span>
                <span class="text-xs self-end">{{ card.value }}</span>
              </button>
            }
          </div>
        </div>

        @if (winner()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
            <span class="text-5xl">🏆</span>
            <h2 class="text-3xl font-black text-amber-400">{{ winner() }} WINS THE MATCH!</h2>
            <button (click)="restartGame()" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg">
              PLAY AGAIN
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class CardClashComponent {
  playerHand = signal<Card[]>([]);
  ai1Hand = signal<Card[]>([]);
  ai2Hand = signal<Card[]>([]);
  topCard = signal<Card | null>(null);
  turn = signal<number>(0); // 0: Player, 1: AI1, 2: AI2
  winner = signal<string | null>(null);

  private nextId = 1;

  constructor() {
    this.restartGame();
  }

  restartGame() {
    this.winner.set(null);
    this.turn.set(0);

    this.playerHand.set(this.generateHand(7));
    this.ai1Hand.set(this.generateHand(7));
    this.ai2Hand.set(this.generateHand(7));
    this.topCard.set(this.generateSingleCard());
  }

  getCardBgClass(color: string): string {
    if (color === 'red') return 'bg-red-600 text-white';
    if (color === 'blue') return 'bg-blue-600 text-white';
    if (color === 'green') return 'bg-emerald-600 text-white';
    if (color === 'yellow') return 'bg-amber-400 text-slate-950';
    return 'bg-gradient-to-tr from-purple-600 to-pink-600 text-white';
  }

  canPlay(card: Card): boolean {
    const top = this.topCard();
    if (!top) return true;
    return card.color === 'wild' || card.color === top.color || card.value === top.value;
  }

  playCard(card: Card) {
    if (this.turn() !== 0 || !this.canPlay(card)) return;

    this.playerHand.update(h => h.filter(c => c.id !== card.id));
    this.topCard.set(card);

    if (this.playerHand().length === 0) {
      this.winner.set('YOU');
      return;
    }

    this.advanceTurn();
  }

  drawCardForPlayer() {
    if (this.turn() !== 0) return;
    const drawn = this.generateSingleCard();
    this.playerHand.update(h => [...h, drawn]);
    this.advanceTurn();
  }

  private advanceTurn() {
    const nextTurn = (this.turn() + 1) % 3;
    this.turn.set(nextTurn);

    if (nextTurn !== 0) {
      setTimeout(() => this.processAITurn(nextTurn), 800);
    }
  }

  private processAITurn(botIdx: number) {
    const handSig = botIdx === 1 ? this.ai1Hand : this.ai2Hand;
    const hand = handSig();
    const playable = hand.find(c => this.canPlay(c));

    if (playable) {
      handSig.update(h => h.filter(c => c.id !== playable.id));
      this.topCard.set(playable);

      if (handSig().length === 0) {
        this.winner.set(`AI BOT ${botIdx}`);
        return;
      }
    } else {
      handSig.update(h => [...h, this.generateSingleCard()]);
    }

    this.advanceTurn();
  }

  private generateHand(count: number): Card[] {
    return Array.from({ length: count }, () => this.generateSingleCard());
  }

  private generateSingleCard(): Card {
    const colors: ('red' | 'blue' | 'green' | 'yellow' | 'wild')[] = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];

    const isWild = Math.random() < 0.1;
    if (isWild) {
      return { id: this.nextId++, color: 'wild', value: 'Wild' };
    }

    const color = colors[Math.floor(Math.random() * colors.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return { id: this.nextId++, color, value };
  }
}
