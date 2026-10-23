import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../../core/services/audio.service';

interface Card {
  id: number;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string;
  type: 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'draw4';
}

@Component({
  selector: 'app-card-clash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-4xl mx-auto space-y-4 shadow-2xl font-sans select-none">
      <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">🃏</span>
          <div>
            <h2 class="text-lg font-black text-amber-400">CARD CLASH (UNO STYLE)</h2>
            <p class="text-xs text-slate-400">Match colors and values against AI opponents</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <span class="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/30">
            Current Turn: <strong>{{ isPlayerTurn() ? 'YOU' : 'AI OPPONENT' }}</strong>
          </span>
          <button (click)="restartGame()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">
            🔄 New Match
          </button>
        </div>
      </div>

      <!-- Play Arena -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center relative space-y-6">
        <!-- AI Hand -->
        <div class="flex items-center space-x-2">
          <span class="text-xs font-bold text-slate-400">AI Hand ({{ aiHand().length }} cards):</span>
          <div class="flex space-x-1">
            @for (card of aiHand(); track card.id) {
              <div class="w-8 h-12 bg-indigo-900 border border-indigo-500 rounded-md shadow flex items-center justify-center text-xs font-mono">
                🂠
              </div>
            }
          </div>
        </div>

        <!-- Center Discard & Draw Pile -->
        <div class="flex items-center space-x-8 my-4">
          <!-- Draw Deck -->
          <button (click)="drawCardForPlayer()" [disabled]="!isPlayerTurn()" class="w-20 h-28 bg-slate-800 border-2 border-dashed border-slate-600 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-lg hover:scale-105 disabled:opacity-50">
            <span class="text-2xl">🂠</span>
            <span class="text-[10px] font-bold text-slate-300">DRAW</span>
          </button>

          <!-- Discard Pile Top Card -->
          @if (topCard(); as card) {
            <div [class]="getCardBgClass(card.color)" class="w-20 h-28 border-2 border-white/80 rounded-xl flex flex-col items-center justify-between p-2 text-white font-black text-lg shadow-2xl animate-fadeIn">
              <span class="text-xs self-start">{{ card.value }}</span>
              <span class="text-2xl">{{ getCardIcon(card.type) }}</span>
              <span class="text-xs self-end">{{ card.value }}</span>
            </div>
          }
        </div>

        <!-- Status Message Banner -->
        <div class="text-xs font-bold text-amber-300 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
          {{ statusText() }}
        </div>

        <!-- Player Hand -->
        <div class="space-y-2 w-full text-center">
          <span class="text-xs font-bold text-slate-400">Your Hand ({{ playerHand().length }} cards):</span>
          <div class="flex flex-wrap items-center justify-center gap-2 max-w-full overflow-x-auto p-2">
            @for (card of playerHand(); track card.id) {
              <button
                (click)="playPlayerCard(card)"
                [disabled]="!isPlayerTurn() || !canPlayCard(card)"
                [class]="getCardBgClass(card.color)"
                class="w-16 h-24 border border-white/60 rounded-xl flex flex-col items-center justify-between p-1.5 text-white font-bold text-sm shadow-md hover:scale-110 hover:-translate-y-2 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:translate-y-0 cursor-pointer">
                <span class="text-[10px] self-start">{{ card.value }}</span>
                <span class="text-lg">{{ getCardIcon(card.type) }}</span>
                <span class="text-[10px] self-end">{{ card.value }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CardClashComponent implements OnInit, OnDestroy {
  private audioService = inject(AudioService);

  playerHand = signal<Card[]>([]);
  aiHand = signal<Card[]>([]);
  topCard = signal<Card | null>(null);
  isPlayerTurn = signal<boolean>(true);
  statusText = signal<string>('Your turn! Select a matching card or draw.');

  private nextId = 1;

  ngOnInit() {
    this.audioService.startPlaylist('funny-quirky');
    this.restartGame();
  }

  restartGame() {
    this.playerHand.set(this.generateRandomHand(7));
    this.aiHand.set(this.generateRandomHand(7));
    this.topCard.set(this.generateRandomCard());
    this.isPlayerTurn.set(true);
    this.statusText.set('Match the top card color or symbol!');
  }

  canPlayCard(card: Card): boolean {
    const top = this.topCard();
    if (!top) return true;
    return card.color === 'wild' || card.color === top.color || card.value === top.value;
  }

  playPlayerCard(card: Card) {
    if (!this.isPlayerTurn() || !this.canPlayCard(card)) return;

    this.audioService.playCardSound();
    this.playerHand.update((h: Card[]) => h.filter((c: Card) => c.id !== card.id));
    this.topCard.set(card);

    if (this.playerHand().length === 0) {
      this.statusText.set('🎉 VICTORY! You played all your cards!');
      return;
    }

    this.isPlayerTurn.set(false);
    this.statusText.set('AI Opponent is thinking...');
    setTimeout(() => this.playAiTurn(), 1200);
  }

  drawCardForPlayer() {
    if (!this.isPlayerTurn()) return;
    this.audioService.playCardSound();
    const newCard = this.generateRandomCard();
    this.playerHand.update((h: Card[]) => [...h, newCard]);
    this.statusText.set('You drew a card. AI Turn.');
    this.isPlayerTurn.set(false);
    setTimeout(() => this.playAiTurn(), 1200);
  }

  private playAiTurn() {
    const playable = this.aiHand().filter((c: Card) => this.canPlayCard(c));
    if (playable.length > 0) {
      const cardToPlay = playable[0];
      this.audioService.playCardSound();
      this.aiHand.update((h: Card[]) => h.filter((c: Card) => c.id !== cardToPlay.id));
      this.topCard.set(cardToPlay);

      if (this.aiHand().length === 0) {
        this.statusText.set('🧟 AI OPPONENT WON! Better luck next time.');
        return;
      }
      this.statusText.set(`AI played ${cardToPlay.color.toUpperCase()} ${cardToPlay.value}. Your turn!`);
    } else {
      const drawn = this.generateRandomCard();
      this.aiHand.update((h: Card[]) => [...h, drawn]);
      this.statusText.set('AI had no playable cards and drew one. Your turn!');
    }
    this.isPlayerTurn.set(true);
  }

  private generateRandomHand(count: number): Card[] {
    const hand: Card[] = [];
    for (let i = 0; i < count; i++) {
      hand.push(this.generateRandomCard());
    }
    return hand;
  }

  private generateRandomCard(): Card {
    const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', '+2'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const val = values[Math.floor(Math.random() * values.length)];

    return {
      id: this.nextId++,
      color,
      value: val,
      type: val === 'SKIP' ? 'skip' : (val === '+2' ? 'draw2' : 'number')
    };
  }

  getCardBgClass(color: string): string {
    switch (color) {
      case 'red': return 'bg-red-600';
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-emerald-600';
      case 'yellow': return 'bg-amber-500 text-slate-950';
      default: return 'bg-purple-600';
    }
  }

  getCardIcon(type: string): string {
    switch (type) {
      case 'skip': return '🚫';
      case 'draw2': return '+2';
      default: return '🃏';
    }
  }

  ngOnDestroy() {
    this.audioService.stopMusic();
  }
}
