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
            <p class="text-xs text-slate-400">Match colors, numbers, or declare wild requirements against AI</p>
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
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[340px] flex flex-col items-center justify-center relative space-y-6">

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
        <div class="flex items-center space-x-8 my-2">
          <!-- Draw Deck -->
          <button (click)="drawCardForPlayer()" [disabled]="!isPlayerTurn() || pendingWildSelection()" class="w-20 h-28 bg-slate-800 border-2 border-dashed border-slate-600 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-lg hover:scale-105 disabled:opacity-50">
            <span class="text-2xl">🂠</span>
            <span class="text-[10px] font-bold text-slate-300">DRAW</span>
          </button>

          <!-- Discard Pile Top Card -->
          @if (topCard(); as card) {
            <div class="flex flex-col items-center space-y-2">
              <div [class]="getCardBgClass(chosenColor() || card.color)" class="w-20 h-28 border-2 border-white/80 rounded-xl flex flex-col items-center justify-between p-2 text-white font-black text-lg shadow-2xl animate-fadeIn relative">
                <span class="text-xs self-start">{{ card.value }}</span>
                <span class="text-2xl">{{ getCardIcon(card.type) }}</span>
                <span class="text-xs self-end">{{ card.value }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Active Color / Number Target Banner -->
        <div class="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
          <span class="text-slate-400">Active Requirement:</span>
          @if (chosenColor(); as col) {
            <span class="px-2.5 py-1 rounded font-bold uppercase" [class]="getBadgeBgClass(col)">
              Color: {{ col }}
            </span>
          } @else if (topCard()?.color !== 'wild') {
            <span class="px-2.5 py-1 rounded font-bold uppercase text-white" [class]="getBadgeBgClass(topCard()!.color)">
              Color: {{ topCard()!.color }}
            </span>
          }
          @if (chosenNumber(); as num) {
            <span class="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded font-bold">
              Number / Value: {{ num }}
            </span>
          } @else if (topCard()?.value; as val) {
            <span class="px-2.5 py-1 bg-slate-800 text-slate-300 rounded font-bold">
              Value: {{ val }}
            </span>
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
                [disabled]="!isPlayerTurn() || !canPlayCard(card) || pendingWildSelection()"
                [class]="getCardBgClass(card.color)"
                class="w-16 h-24 border border-white/60 rounded-xl flex flex-col items-center justify-between p-1.5 text-white font-bold text-sm shadow-md hover:scale-110 hover:-translate-y-2 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:hover:translate-y-0 cursor-pointer">
                <span class="text-[10px] self-start">{{ card.value }}</span>
                <span class="text-lg">{{ getCardIcon(card.type) }}</span>
                <span class="text-[10px] self-end">{{ card.value }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Wild Card Color/Number Chooser Modal -->
        @if (pendingWildSelection()) {
          <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 space-y-4 z-20 animate-fadeIn">
            <span class="text-3xl animate-bounce">🌈</span>
            <h3 class="text-lg font-black text-amber-400">WILD CARD PLAYED!</h3>
            <p class="text-xs text-slate-300 max-w-sm text-center">
              Choose the next <strong>Color</strong> or <strong>Number / Value</strong> requirement for the opponent to match!
            </p>

            <div class="space-y-3 w-full max-w-md">
              <!-- Color Selector -->
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 text-center">Select Next Color:</span>
                <div class="grid grid-cols-4 gap-2">
                  <button (click)="selectWildRequirement('red', null)" class="py-2.5 bg-red-600 hover:bg-red-500 font-bold text-xs rounded-xl shadow border border-white/20 active:scale-95 transition">🔴 Red</button>
                  <button (click)="selectWildRequirement('blue', null)" class="py-2.5 bg-blue-600 hover:bg-blue-500 font-bold text-xs rounded-xl shadow border border-white/20 active:scale-95 transition">🔵 Blue</button>
                  <button (click)="selectWildRequirement('green', null)" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl shadow border border-white/20 active:scale-95 transition">🟢 Green</button>
                  <button (click)="selectWildRequirement('yellow', null)" class="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow border border-white/20 active:scale-95 transition">🟡 Yellow</button>
                </div>
              </div>

              <!-- Number Selector -->
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 text-center">OR Select Next Number / Value:</span>
                <div class="grid grid-cols-5 gap-1.5">
                  @for (val of ['0','1','2','3','4','5','6','7','8','9']; track val) {
                    <button (click)="selectWildRequirement(null, val)" class="py-2 bg-indigo-800 hover:bg-indigo-600 text-amber-300 font-black text-xs rounded-lg border border-indigo-500 active:scale-95 transition">
                      # {{ val }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>
        }

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

  // Active Requirements after Wild Card
  chosenColor = signal<'red' | 'blue' | 'green' | 'yellow' | null>(null);
  chosenNumber = signal<string | null>(null);
  pendingWildSelection = signal<boolean>(false);

  private pendingPlayedCard: Card | null = null;
  private nextId = 1;

  ngOnInit() {
    this.audioService.startPlaylist('funny-quirky');
    this.restartGame();
  }

  restartGame() {
    this.playerHand.set(this.generateRandomHand(7));
    this.aiHand.set(this.generateRandomHand(7));
    const startCard = this.generateRandomCard(false); // No wild start
    this.topCard.set(startCard);
    this.chosenColor.set(null);
    this.chosenNumber.set(null);
    this.pendingWildSelection.set(false);
    this.isPlayerTurn.set(true);
    this.statusText.set('Match the top card color or symbol!');
  }

  canPlayCard(card: Card): boolean {
    if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') return true;

    const activeColor = this.chosenColor() || (this.topCard()?.color !== 'wild' ? this.topCard()?.color : null);
    const activeVal = this.chosenNumber() || this.topCard()?.value;

    if (activeColor && card.color === activeColor) return true;
    if (activeVal && card.value === activeVal) return true;

    return false;
  }

  playPlayerCard(card: Card) {
    if (!this.isPlayerTurn() || !this.canPlayCard(card) || this.pendingWildSelection()) return;

    if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') {
      this.pendingPlayedCard = card;
      this.pendingWildSelection.set(true);
      return;
    }

    this.executePlayerCardPlay(card, null, null);
  }

  selectWildRequirement(color: 'red' | 'blue' | 'green' | 'yellow' | null, num: string | null) {
    if (!this.pendingPlayedCard) return;

    const card = this.pendingPlayedCard;
    this.pendingPlayedCard = null;
    this.pendingWildSelection.set(false);

    if (card.type === 'draw4') {
      // AI draws 4 cards
      const extraCards = this.generateRandomHand(4);
      this.aiHand.update(h => [...h, ...extraCards]);
    }

    this.executePlayerCardPlay(card, color, num);
  }

  private executePlayerCardPlay(card: Card, wildColor: 'red' | 'blue' | 'green' | 'yellow' | null, wildNum: string | null) {
    this.audioService.playCardSound();
    this.playerHand.update((h: Card[]) => h.filter((c: Card) => c.id !== card.id));
    this.topCard.set(card);

    if (wildColor || wildNum) {
      this.chosenColor.set(wildColor);
      this.chosenNumber.set(wildNum);
    } else {
      this.chosenColor.set(null);
      this.chosenNumber.set(null);
    }

    if (this.playerHand().length === 0) {
      this.statusText.set('🎉 VICTORY! You played all your cards!');
      return;
    }

    this.isPlayerTurn.set(false);
    this.statusText.set('AI Opponent is thinking...');
    setTimeout(() => this.playAiTurn(), 1200);
  }

  drawCardForPlayer() {
    if (!this.isPlayerTurn() || this.pendingWildSelection()) return;
    this.audioService.playCardSound();
    const newCard = this.generateRandomCard(true);
    this.playerHand.update((h: Card[]) => [...h, newCard]);
    this.statusText.set('You drew a card. AI Turn.');
    this.isPlayerTurn.set(false);
    setTimeout(() => this.playAiTurn(), 1200);
  }

  private playAiTurn() {
    const playable = this.aiHand().filter((c: Card) => this.canPlayCard(c));
    if (playable.length > 0) {
      // Choose best card (prefer non-wild first, or wild if necessary)
      const nonWilds = playable.filter(c => c.color !== 'wild');
      const cardToPlay = nonWilds.length > 0 ? nonWilds[0] : playable[0];

      this.audioService.playCardSound();
      this.aiHand.update((h: Card[]) => h.filter((c: Card) => c.id !== cardToPlay.id));
      this.topCard.set(cardToPlay);

      if (this.aiHand().length === 0) {
        this.statusText.set('🧟 AI OPPONENT WON! Better luck next time.');
        return;
      }

      if (cardToPlay.color === 'wild' || cardToPlay.type === 'wild' || cardToPlay.type === 'draw4') {
        // AI selects color or number based on AI hand
        const colorCounts: Record<string, number> = { red: 0, blue: 0, green: 0, yellow: 0 };
        const valueCounts: Record<string, number> = {};

        this.aiHand().forEach(c => {
          if (c.color !== 'wild') colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
          valueCounts[c.value] = (valueCounts[c.value] || 0) + 1;
        });

        // Pick most frequent color or value
        let bestColor: 'red' | 'blue' | 'green' | 'yellow' = 'red';
        let maxColorCount = -1;
        for (const [col, cnt] of Object.entries(colorCounts)) {
          if (cnt > maxColorCount) {
            maxColorCount = cnt;
            bestColor = col as any;
          }
        }

        let bestVal: string | null = null;
        let maxValCount = 0;
        for (const [val, cnt] of Object.entries(valueCounts)) {
          if (cnt > maxValCount) {
            maxValCount = cnt;
            bestVal = val;
          }
        }

        // AI randomly chooses to mandate either color or number requirement!
        if (bestVal && Math.random() < 0.4 && maxValCount >= 2) {
          this.chosenColor.set(null);
          this.chosenNumber.set(bestVal);
          this.statusText.set(`AI played WILD and set mandatory Number to #${bestVal}! Your turn!`);
        } else {
          this.chosenColor.set(bestColor);
          this.chosenNumber.set(null);
          this.statusText.set(`AI played WILD and set mandatory Color to ${bestColor.toUpperCase()}! Your turn!`);
        }

        if (cardToPlay.type === 'draw4') {
          // Player draws 4
          const playerExtras = this.generateRandomHand(4);
          this.playerHand.update(h => [...h, ...playerExtras]);
          this.statusText.set(`AI played WILD +4! You drew 4 cards and AI set Color to ${bestColor.toUpperCase()}!`);
        }
      } else {
        this.chosenColor.set(null);
        this.chosenNumber.set(null);
        this.statusText.set(`AI played ${cardToPlay.color.toUpperCase()} ${cardToPlay.value}. Your turn!`);
      }
    } else {
      const drawn = this.generateRandomCard(true);
      this.aiHand.update((h: Card[]) => [...h, drawn]);
      this.statusText.set('AI had no playable cards and drew one. Your turn!');
    }
    this.isPlayerTurn.set(true);
  }

  private generateRandomHand(count: number): Card[] {
    const hand: Card[] = [];
    for (let i = 0; i < count; i++) {
      hand.push(this.generateRandomCard(true));
    }
    return hand;
  }

  private generateRandomCard(allowWild = true): Card {
    const colors: ('red' | 'blue' | 'green' | 'yellow')[] = ['red', 'blue', 'green', 'yellow'];
    const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', '+2'];

    if (allowWild && Math.random() < 0.15) {
      const isDraw4 = Math.random() < 0.5;
      return {
        id: this.nextId++,
        color: 'wild',
        value: isDraw4 ? '+4' : 'WILD',
        type: isDraw4 ? 'draw4' : 'wild'
      };
    }

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

  getBadgeBgClass(color: string): string {
    switch (color) {
      case 'red': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'blue': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'green': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'yellow': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    }
  }

  getCardIcon(type: string): string {
    switch (type) {
      case 'skip': return '🚫';
      case 'draw2': return '+2';
      case 'draw4': return '+4';
      case 'wild': return '🌈';
      default: return '🃏';
    }
  }

  ngOnDestroy() {
    this.audioService.stopMusic();
  }
}
