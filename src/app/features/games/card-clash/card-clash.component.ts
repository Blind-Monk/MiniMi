import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type GameMode = 'classic' | 'flip' | 'max';
export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'teal' | 'pink' | 'purple' | 'orange' | 'wild';
export type Side = 'light' | 'dark';

export interface CardSide {
  color: CardColor;
  value: string; // '0'-'9', 'Skip', 'Reverse', '+2', 'Wild', 'Wild +4', 'Flip', '+5', 'Skip Everyone', 'Wild Draw Color', 'Wild Discard Half', '+6', '+10'
  type: 'number' | 'skip' | 'reverse' | 'draw' | 'wild' | 'wild-draw' | 'flip' | 'skip-everyone' | 'draw-color' | 'discard-half';
  drawAmount?: number;
}

export interface Card {
  id: number;
  light: CardSide;
  dark: CardSide;
}

export interface Player {
  id: number;
  name: string;
  isAi: boolean;
  hand: Card[];
  hasCalledUno: boolean;
  isKnockedOut: boolean;
  score: number;
}

@Component({
  selector: 'app-card-clash',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white max-w-5xl mx-auto space-y-4 shadow-2xl font-sans relative overflow-hidden select-none" [class.animate-shake]="isShaking()">

      <!-- Top Navigation & Controls Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 backdrop-blur">
        <div class="flex items-center gap-3">
          <span class="text-3xl animate-bounce">🃏</span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black tracking-wide bg-gradient-to-r from-amber-400 via-rose-400 to-purple-400 bg-clip-text text-transparent">
                CARD CLASH
              </h2>
              <span class="text-xs font-extrabold px-2 py-0.5 rounded-full border shadow"
                    [ngClass]="{
                      'bg-amber-500/20 text-amber-300 border-amber-500/40': gameMode() === 'classic',
                      'bg-cyan-500/20 text-cyan-300 border-cyan-500/40': gameMode() === 'flip',
                      'bg-rose-500/20 text-rose-300 border-rose-500/40': gameMode() === 'max'
                    }">
                {{ gameMode().toUpperCase() }} MODE
              </span>
              @if (gameMode() === 'flip') {
                <span class="text-xs font-bold px-2 py-0.5 rounded-full border border-purple-500/40"
                      [class.bg-amber-500/30]="activeSide() === 'light'"
                      [class.bg-purple-900/80]="activeSide() === 'dark'">
                  {{ activeSide() === 'light' ? '☀️ Light Side' : '🌙 Dark Side' }}
                </span>
              }
            </div>
            <p class="text-xs text-slate-400">Match by Color or Value • Action Cards, Double-Sided Flip & Stacking Max</p>
          </div>
        </div>

        <!-- Mode Selectors & Buttons -->
        <div class="flex items-center flex-wrap gap-2">
          <div class="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-xs font-bold">
            <button (click)="changeMode('classic')" [class.bg-amber-600]="gameMode() === 'classic'" class="px-2.5 py-1 rounded-lg hover:bg-slate-800 transition">Classic</button>
            <button (click)="changeMode('flip')" [class.bg-cyan-600]="gameMode() === 'flip'" class="px-2.5 py-1 rounded-lg hover:bg-slate-800 transition">UNO Flip</button>
            <button (click)="changeMode('max')" [class.bg-rose-600]="gameMode() === 'max'" class="px-2.5 py-1 rounded-lg hover:bg-slate-800 transition">UNO Max</button>
          </div>

          <button (click)="showRulebook.set(true)" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1">
            📖 Rules
          </button>

          <button (click)="restartMatch()" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-black shadow transition flex items-center gap-1">
            🔄 Restart Match
          </button>
        </div>
      </div>

      <!-- Game Arena / Table Board -->
      <div class="relative border-2 rounded-2xl p-4 min-h-[460px] flex flex-col justify-between shadow-2xl transition-all duration-700 overflow-hidden"
           [ngClass]="{
             'bg-emerald-950/80 border-emerald-700/60': activeSide() === 'light',
             'bg-slate-950 border-purple-800/80 shadow-purple-950/50': activeSide() === 'dark'
           }">

        <!-- Global Flip Animation Overlay -->
        @if (isFlipping()) {
          <div class="absolute inset-0 z-50 bg-purple-900/40 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
            <span class="text-6xl animate-spin">🌀</span>
            <span class="text-2xl font-black text-purple-200 tracking-widest mt-2">FLIPPING DECK SIDE!</span>
          </div>
        }

        <!-- Direction Indicator & Table Header Info -->
        <div class="flex items-center justify-between text-xs font-extrabold text-slate-300 z-10 px-2">
          <div class="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
            <span class="inline-block transition-transform duration-500" [style.transform]="turnDirection() === 1 ? 'rotate(0deg)' : 'rotate(180deg)'">
              🔄
            </span>
            <span>Direction: {{ turnDirection() === 1 ? 'Clockwise ↻' : 'Counter-Clockwise ↺' }}</span>
          </div>

          <div class="flex items-center gap-2">
            @if (pendingDrawStack() > 0) {
              <div class="bg-rose-600/90 text-white font-black px-3 py-1 rounded-full border border-rose-400 animate-bounce shadow-lg">
                ⚠️ Draw Stack: +{{ pendingDrawStack() }} Cards!
              </div>
            }
            <div class="bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
              Dealer: Player {{ dealerIndex() + 1 }}
            </div>
          </div>
        </div>

        <!-- AI Opponents Area -->
        <div class="grid grid-cols-2 gap-4 my-2 z-10">
          @for (player of players().slice(1); track player.id) {
            <div class="relative bg-slate-900/85 border p-3 rounded-xl flex items-center justify-between shadow-lg transition-all"
                 [ngClass]="{
                   'border-amber-400 ring-2 ring-amber-400/50': turnIndex() === player.id && !player.isKnockedOut,
                   'border-slate-800 opacity-60': player.isKnockedOut,
                   'border-slate-700': turnIndex() !== player.id && !player.isKnockedOut
                 }">

              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xl shadow">
                  🤖
                </div>
                <div>
                  <div class="flex items-center gap-1">
                    <span class="font-black text-sm text-slate-200">{{ player.name }}</span>
                    @if (turnIndex() === player.id && !player.isKnockedOut) {
                      <span class="text-xs bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded animate-pulse">THINKING</span>
                    }
                  </div>
                  <div class="text-xs text-amber-400 font-extrabold flex items-center gap-2">
                    <span>{{ player.hand.length }} Cards</span>
                    <span class="text-slate-400">• Score: {{ player.score }}</span>
                  </div>
                </div>
              </div>

              <!-- UNO Badge or Knockout Badge -->
              <div class="flex items-center gap-2">
                @if (player.isKnockedOut) {
                  <span class="text-xs font-black bg-rose-950 text-rose-400 border border-rose-700 px-2 py-1 rounded-lg">
                    💀 KNOCKED OUT
                  </span>
                } @else {
                  @if (player.hand.length === 1) {
                    @if (player.hasCalledUno) {
                      <span class="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg animate-bounce shadow">
                        UNO!
                      </span>
                    } @else {
                      <button (click)="catchUno(player.id)" class="text-xs font-black bg-rose-600 hover:bg-rose-500 text-white px-2 py-1 rounded-lg animate-pulse shadow transition">
                        🚨 Catch UNO!
                      </button>
                    }
                  }
                }
              </div>
            </div>
          }
        </div>

        <!-- Table Center: Discard Pile & Draw Pile -->
        <div class="flex items-center justify-center gap-6 my-4 z-10">
          <!-- Draw Pile Button -->
          <div class="flex flex-col items-center gap-1">
            <button (click)="playerDrawCard()"
                    [disabled]="turnIndex() !== 0 || isAiThinking() || players()[0].isKnockedOut"
                    class="w-24 h-36 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 hover:border-amber-400 rounded-xl flex flex-col items-center justify-center gap-1 shadow-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer group">
              <span class="text-3xl group-hover:scale-110 transition-transform">🎴</span>
              <span class="text-xs font-black text-slate-300">Draw Pile</span>
              <span class="text-[10px] text-slate-400 font-bold">({{ drawPile().length }})</span>
            </button>
          </div>

          <!-- Active Discard Pile Card -->
          <div class="flex flex-col items-center gap-1">
            @if (topCard(); as card) {
              @let activeCard = getCardSide(card);
              <div [class]="getCardBgClass(activeCard.color)"
                   class="w-24 h-36 border-2 border-white/50 rounded-xl flex flex-col items-center justify-between p-2.5 shadow-2xl animate-fade-in font-extrabold relative overflow-hidden transition-transform duration-500"
                   [style.transform]="isFlipping() ? 'rotateY(180deg)' : 'rotateY(0deg)'">

                <span class="text-xs self-start leading-none">{{ activeCard.value }}</span>

                <div class="text-center">
                  <span class="text-2xl font-black block">{{ getCardIcon(activeCard.value) }}</span>
                  <span class="text-xs font-black block mt-0.5">{{ activeCard.value }}</span>
                </div>

                <span class="text-xs self-end leading-none">{{ activeCard.value }}</span>
              </div>
            }
            <span class="text-xs font-bold text-slate-300">Discard Pile</span>
          </div>

          <!-- Current Color Indicator -->
          <div class="flex flex-col items-center gap-1">
            <div class="w-12 h-12 rounded-full border-2 border-white/60 flex items-center justify-center shadow-xl transition-all"
                 [class]="getCardBgClass(currentColor() || 'wild')">
              <span class="text-xs font-black uppercase text-center leading-tight">
                {{ currentColor() || 'Wild' }}
              </span>
            </div>
            <span class="text-[10px] font-bold text-slate-300">Active Color</span>
          </div>
        </div>

        <!-- Drawn Card Optional Immediate Play Action Banner -->
        @if (drawnCardThisTurn() && turnIndex() === 0) {
          <div class="z-20 bg-amber-950/90 border border-amber-500 p-3 rounded-xl flex items-center justify-between shadow-xl animate-fade-in">
            <div class="flex items-center gap-3">
              <span class="text-xl">✨</span>
              <div>
                <div class="text-xs font-black text-amber-300">CARD DRAWN!</div>
                <div class="text-xs text-slate-200">You drew <strong class="text-amber-400">{{ getCardSide(drawnCardThisTurn()!).value }}</strong>. Play it or Pass turn?</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              @if (canPlay(drawnCardThisTurn()!)) {
                <button (click)="playDrawnCard()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg shadow">
                  Play Drawn Card
                </button>
              }
              <button (click)="passTurnAfterDraw()" class="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-lg shadow">
                Pass Turn
              </button>
            </div>
          </div>
        }

        <!-- Player Hand & Controls Area -->
        <div class="space-y-2 z-10 mt-2">
          <!-- Player HUD Row -->
          <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div class="flex items-center gap-2">
              <span class="text-xs font-extrabold text-amber-300">YOUR HAND ({{ players()[0].hand.length }} Cards)</span>
              @if (turnIndex() === 0 && !players()[0].isKnockedOut) {
                <span class="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full animate-pulse">
                  👉 YOUR TURN!
                </span>
              } @else {
                <span class="text-xs font-bold text-slate-400">⏳ Opponent's Turn...</span>
              }
            </div>

            <div class="flex items-center gap-2">
              <!-- UNO Call Button -->
              @if (players()[0].hand.length <= 2 && !players()[0].hasCalledUno && !players()[0].isKnockedOut) {
                <button (click)="callUnoPlayer()" class="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg shadow animate-bounce">
                  🗣️ CALL "UNO!"
                </button>
              } @else if (players()[0].hasCalledUno && players()[0].hand.length === 1) {
                <span class="text-xs font-black bg-emerald-600 text-white px-2.5 py-1 rounded-lg">
                  ✅ UNO CALLED!
                </span>
              }
            </div>
          </div>

          <!-- Player Cards Fan Arc Hand Display -->
          <div class="relative min-h-[140px] flex items-center justify-center pt-2 pb-4 overflow-x-auto">
            @if (players()[0].isKnockedOut) {
              <div class="text-rose-400 font-black text-base py-6 text-center">
                💀 YOU HAVE BEEN ELIMINATED (Hand Limit Exceeded 20 Cards)
              </div>
            } @else {
              <div class="flex items-center justify-center gap-[-1.5rem]">
                @for (card of players()[0].hand; track card.id; let idx = $index) {
                  @let activeSideData = getCardSide(card);
                  @let isCardPlayable = turnIndex() === 0 && canPlay(card);
                  <button (click)="playerPlayCard(card)"
                          [disabled]="!isCardPlayable"
                          [class]="getCardBgClass(activeSideData.color)"
                          [style.transform]="getCardTransform(idx, players()[0].hand.length)"
                          class="w-20 h-32 shrink-0 rounded-xl border-2 border-white/40 p-2 flex flex-col items-center justify-between font-black shadow-2xl transition-all duration-200 cursor-pointer hover:z-30 hover:-translate-y-4 hover:scale-110 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:cursor-not-allowed relative group">

                    <span class="text-[10px] self-start leading-none">{{ activeSideData.value }}</span>

                    <div class="text-center">
                      <span class="text-xl font-black block">{{ getCardIcon(activeSideData.value) }}</span>
                      <span class="text-[10px] font-black block leading-tight mt-0.5">{{ activeSideData.value }}</span>
                    </div>

                    <span class="text-[10px] self-end leading-none">{{ activeSideData.value }}</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>

        <!-- Activity Log Drawer -->
        <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-2 text-[11px] text-slate-300 max-h-24 overflow-y-auto space-y-1 z-10 font-mono">
          <div class="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">Match Feed:</div>
          @for (log of logs(); track $index) {
            <div class="leading-tight text-slate-300">• {{ log }}</div>
          }
        </div>

        <!-- Color Choice Radial Modal -->
        @if (pendingColorChoice()) {
          <div class="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-4 animate-fade-in">
            <h3 class="text-xl font-black text-amber-400">CHOOSE NEXT COLOR</h3>
            <div class="grid grid-cols-2 gap-4">
              @for (color of getAvailableWildColors(); track color) {
                <button (click)="selectWildColor(color)"
                        [class]="getCardBgClass(color)"
                        class="w-28 h-20 rounded-xl font-black text-sm uppercase shadow-xl hover:scale-105 active:scale-95 border-2 border-white/60 transition cursor-pointer">
                  {{ color }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Wild +4 Challenge Choice Modal -->
        @if (pendingChallenge() && pendingChallenge()?.targetIdx === 0) {
          <div class="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 animate-fade-in text-center">
            <span class="text-4xl">⚠️</span>
            <h3 class="text-2xl font-black text-rose-400">WILD +4 PLAYED AGAINST YOU!</h3>
            <p class="text-xs text-slate-300 max-w-md">
              Do you want to challenge? If they had a card matching the previous color, they draw 4 cards penalty. If they were innocent, you draw 6 cards!
            </p>
            <div class="flex items-center gap-4 mt-2">
              <button (click)="respondChallenge(true)" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-lg">
                ⚔️ Challenge Play!
              </button>
              <button (click)="respondChallenge(false)" class="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-xl shadow-lg">
                ACCEPT +4
              </button>
            </div>
          </div>
        }

        <!-- Round Victory Overlay -->
        @if (winner()) {
          <div class="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center gap-4 text-center p-6 animate-fade-in">
            <span class="text-6xl animate-bounce">🏆</span>
            <h2 class="text-3xl font-black bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              {{ winner() }} WINS THE ROUND!
            </h2>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-2 w-full max-w-sm text-left">
              <div class="font-bold text-slate-300 border-b border-slate-800 pb-1">Round Scores:</div>
              @for (p of players(); track p.id) {
                <div class="flex justify-between items-center text-slate-200">
                  <span>{{ p.name }}:</span>
                  <span class="font-extrabold text-amber-400">{{ p.score }} pts</span>
                </div>
              }
            </div>
            <button (click)="restartMatch()" class="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 text-slate-950 font-black rounded-xl shadow-2xl text-base cursor-pointer">
              NEXT ROUND / RESTART
            </button>
          </div>
        }

      </div>

      <!-- In-Game Rulebook Modal -->
      @if (showRulebook()) {
        <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
            <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div class="flex items-center gap-2">
                <span class="text-xl">📖</span>
                <h3 class="font-black text-amber-400 text-base">CARD CLASH RULEBOOK</h3>
              </div>
              <button (click)="showRulebook.set(false)" class="text-slate-400 hover:text-white text-lg font-black px-2">✕</button>
            </div>

            <div class="p-5 overflow-y-auto space-y-4 text-xs leading-relaxed">
              <section>
                <h4 class="font-extrabold text-amber-300 text-sm mb-1">1. Objective & Setup</h4>
                <p>Be the first player to discard all cards from your hand. Each match begins with 7 cards dealt per player. A starting number card is flipped face-up to begin the Discard Pile.</p>
              </section>

              <section>
                <h4 class="font-extrabold text-amber-300 text-sm mb-1">2. Core Turn Process</h4>
                <p>Match the top card of the Discard Pile by Color, Value, or Symbol. If you cannot play, draw 1 card from the Draw Pile. If playable, you may play it immediately or pass your turn.</p>
              </section>

              <section>
                <h4 class="font-extrabold text-amber-300 text-sm mb-1">3. Card Effects & Wild +4 Challenge</h4>
                <ul class="list-disc pl-4 space-y-1">
                  <li><strong>Skip:</strong> Next player loses turn.</li>
                  <li><strong>Reverse:</strong> Changes turn direction (Clockwise ↔ Counter-clockwise).</li>
                  <li><strong>Draw Two (+2):</strong> Next player draws 2 cards and misses turn.</li>
                  <li><strong>Wild:</strong> Player chooses next active color.</li>
                  <li><strong>Wild Draw Four (+4) Challenge:</strong> Playable legally only if you have no matching color in hand. The targeted player can Challenge! If guilty, you draw 4 cards; if innocent, challenger draws 6 cards!</li>
                </ul>
              </section>

              <section>
                <h4 class="font-extrabold text-cyan-300 text-sm mb-1">4. Special Mode: UNO Flip (Double-Sided Deck)</h4>
                <p>The game features a physical double-sided deck (Light Side vs Dark Side). Playing a <strong>Flip Card</strong> rotates all hands, draw pile, and discard pile to the Dark Side!</p>
                <ul class="list-disc pl-4 space-y-1 mt-1">
                  <li><strong>Draw Five (+5):</strong> Target draws 5 cards.</li>
                  <li><strong>Skip Everyone:</strong> Skips all opponents so you play again immediately!</li>
                  <li><strong>Wild Draw Color:</strong> Target draws continuously until receiving the chosen color.</li>
                  <li><strong>Wild Discard Half:</strong> Forces opponent with largest hand to discard half their hand.</li>
                </ul>
              </section>

              <section>
                <h4 class="font-extrabold text-rose-300 text-sm mb-1">5. Special Mode: UNO Max (Extreme Stacking & Hand Limit Knockout)</h4>
                <ul class="list-disc pl-4 space-y-1">
                  <li><strong>Stacking:</strong> Draw cards stack on top of each other (+2 on +2, +4 on +4, +6 on +6, etc.). Accumulated penalty builds until someone cannot stack and must draw the total stack!</li>
                  <li><strong>20-Card Knockout:</strong> If a player's hand exceeds 20 cards at any time, they are immediately eliminated!</li>
                </ul>
              </section>

              <section>
                <h4 class="font-extrabold text-amber-300 text-sm mb-1">6. UNO Declaration & Scoring</h4>
                <p>When playing your 2nd-to-last card (leaving 1 card), click "CALL UNO!". If an opponent catches you before the next turn, you draw a 2-card penalty! Winner earns points from opponents' remaining cards (Numbers: face value, Actions: 20 pts, Wilds/Special: 50 pts).</p>
              </section>
            </div>

            <div class="p-3 border-t border-slate-800 bg-slate-950 text-right">
              <button (click)="showRulebook.set(false)" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-extrabold text-xs text-white rounded-lg shadow">
                Got It!
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    @keyframes shake {
      0%, 100% { transform: translate(0, 0); }
      20% { transform: translate(-4px, 4px); }
      40% { transform: translate(4px, -4px); }
      60% { transform: translate(-4px, -4px); }
      80% { transform: translate(4px, 4px); }
    }
    .animate-shake {
      animation: shake 0.4s ease-in-out;
    }
  `]
})
export class CardClashComponent {
  // Game State Signals
  gameMode = signal<GameMode>('classic');
  activeSide = signal<Side>('light');
  drawPile = signal<Card[]>([]);
  discardPile = signal<Card[]>([]);
  players = signal<Player[]>([]);

  dealerIndex = signal<number>(0);
  turnIndex = signal<number>(0);
  turnDirection = signal<number>(1); // 1 = Clockwise, -1 = Counter-Clockwise
  pendingDrawStack = signal<number>(0);
  currentColor = signal<CardColor | null>(null);

  drawnCardThisTurn = signal<Card | null>(null);
  pendingColorChoice = signal<{ playerIdx: number; isDrawColor?: boolean } | null>(null);
  pendingChallenge = signal<{ challengerIdx: number; targetIdx: number; card: Card; prevColor: CardColor | null } | null>(null);

  isFlipping = signal<boolean>(false);
  isShaking = signal<boolean>(false);
  isAiThinking = signal<boolean>(false);
  winner = signal<string | null>(null);
  logs = signal<string[]>([]);
  showRulebook = signal<boolean>(false);

  private nextCardId = 1;

  constructor() {
    this.restartMatch();
  }

  // Top Card computed helper
  topCard = computed(() => {
    const pile = this.discardPile();
    return pile.length > 0 ? pile[pile.length - 1] : null;
  });

  getCardSide(card: Card): CardSide {
    return this.activeSide() === 'light' ? card.light : card.dark;
  }

  changeMode(mode: GameMode) {
    this.gameMode.set(mode);
    this.restartMatch();
  }

  restartMatch() {
    this.winner.set(null);
    this.activeSide.set('light');
    this.dealerIndex.set(0);
    this.turnIndex.set(0);
    this.turnDirection.set(1);
    this.pendingDrawStack.set(0);
    this.drawnCardThisTurn.set(null);
    this.pendingColorChoice.set(null);
    this.pendingChallenge.set(null);
    this.logs.set(['New match started in ' + this.gameMode().toUpperCase() + ' mode.']);

    // Generate Full Double-Sided Deck
    const deck = this.generateDeck();

    // Initialize 3 Players (0: Player, 1: Bot 1, 2: Bot 2)
    const initialPlayers: Player[] = [
      { id: 0, name: 'You (Player)', isAi: false, hand: deck.splice(0, 7), hasCalledUno: false, isKnockedOut: false, score: 0 },
      { id: 1, name: '🤖 AI Bot 1', isAi: true, hand: deck.splice(0, 7), hasCalledUno: false, isKnockedOut: false, score: 0 },
      { id: 2, name: '🤖 AI Bot 2', isAi: true, hand: deck.splice(0, 7), hasCalledUno: false, isKnockedOut: false, score: 0 }
    ];

    // Flip first top card until non-action card appears
    let firstCardIdx = 0;
    while (firstCardIdx < deck.length) {
      const topCandidate = deck[firstCardIdx];
      const sideCandidate = topCandidate.light;
      if (sideCandidate.type === 'number') {
        deck.splice(firstCardIdx, 1);
        this.discardPile.set([topCandidate]);
        this.currentColor.set(sideCandidate.color);
        break;
      }
      firstCardIdx++;
    }

    this.drawPile.set(deck);
    this.players.set(initialPlayers);
  }

  private generateDeck(): Card[] {
    const cards: Card[] = [];
    const lightColors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
    const darkColors: CardColor[] = ['teal', 'pink', 'purple', 'orange'];

    // Number Cards
    lightColors.forEach((lColor, colIdx) => {
      const dColor = darkColors[colIdx];

      for (let n = 0; n <= 9; n++) {
        cards.push({
          id: this.nextCardId++,
          light: { color: lColor, value: n.toString(), type: 'number' },
          dark: { color: dColor, value: n.toString(), type: 'number' }
        });
      }

      // Action cards
      if (this.gameMode() === 'flip') {
        cards.push({
          id: this.nextCardId++,
          light: { color: lColor, value: 'Flip', type: 'flip' },
          dark: { color: dColor, value: 'Flip', type: 'flip' }
        });
      }

      cards.push({
        id: this.nextCardId++,
        light: { color: lColor, value: 'Skip', type: 'skip' },
        dark: { color: dColor, value: 'Skip Everyone', type: 'skip-everyone' }
      });

      cards.push({
        id: this.nextCardId++,
        light: { color: lColor, value: 'Reverse', type: 'reverse' },
        dark: { color: dColor, value: 'Flip', type: 'flip' }
      });

      cards.push({
        id: this.nextCardId++,
        light: { color: lColor, value: '+2', type: 'draw', drawAmount: 2 },
        dark: { color: dColor, value: '+5', type: 'draw', drawAmount: 5 }
      });
    });

    // Wilds
    for (let w = 0; w < 4; w++) {
      cards.push({
        id: this.nextCardId++,
        light: { color: 'wild', value: 'Wild', type: 'wild' },
        dark: { color: 'wild', value: 'Wild', type: 'wild' }
      });

      cards.push({
        id: this.nextCardId++,
        light: { color: 'wild', value: 'Wild +4', type: 'wild-draw', drawAmount: 4 },
        dark: { color: 'wild', value: 'Wild Draw Color', type: 'draw-color' }
      });
    }

    // High penalty cards for Max Mode
    if (this.gameMode() === 'max') {
      for (let m = 0; m < 2; m++) {
        cards.push({
          id: this.nextCardId++,
          light: { color: 'wild', value: '+6', type: 'draw', drawAmount: 6 },
          dark: { color: 'wild', value: '+6', type: 'draw', drawAmount: 6 }
        });
        cards.push({
          id: this.nextCardId++,
          light: { color: 'wild', value: '+10', type: 'draw', drawAmount: 10 },
          dark: { color: 'wild', value: '+10', type: 'draw', drawAmount: 10 }
        });
      }
    }

    // Shuffle deck
    return cards.sort(() => Math.random() - 0.5);
  }

  canPlay(card: Card): boolean {
    const activeSideData = this.getCardSide(card);
    const activeTop = this.topCard();
    if (!activeTop) return true;

    const topSideData = this.getCardSide(activeTop);
    const currCol = this.currentColor();

    // If there is an active pending draw stack
    if (this.pendingDrawStack() > 0) {
      if (this.gameMode() === 'max') {
        // Stacking rule in Max mode: can play draw cards
        return activeSideData.type === 'draw' || activeSideData.type === 'wild-draw';
      } else {
        // In Classic/Flip mode, cannot stack unless player has matching draw card
        return activeSideData.type === 'draw' && activeSideData.drawAmount === topSideData.drawAmount;
      }
    }

    if (activeSideData.color === 'wild' || activeSideData.type === 'wild' || activeSideData.type === 'wild-draw' || activeSideData.type === 'draw-color') {
      return true;
    }

    return activeSideData.color === currCol || activeSideData.value === topSideData.value;
  }

  playerPlayCard(card: Card) {
    if (this.turnIndex() !== 0 || !this.canPlay(card) || this.isAiThinking()) return;
    this.executePlayCard(0, card);
  }

  playerDrawCard() {
    if (this.turnIndex() !== 0 || this.isAiThinking() || this.drawnCardThisTurn()) return;

    // Handle active pending draw stack penalty
    if (this.pendingDrawStack() > 0) {
      this.addLog(`You drew ${this.pendingDrawStack()} cards from penalty stack.`);
      this.drawMultipleCards(0, this.pendingDrawStack());
      this.pendingDrawStack.set(0);
      this.advanceTurn();
      return;
    }

    const drawn = this.drawSingleCard(0);
    if (drawn) {
      this.addLog(`You drew a card.`);
      if (this.canPlay(drawn)) {
        this.drawnCardThisTurn.set(drawn);
      } else {
        this.advanceTurn();
      }
    }
  }

  playDrawnCard() {
    const drawn = this.drawnCardThisTurn();
    if (drawn) {
      this.drawnCardThisTurn.set(null);
      this.executePlayCard(0, drawn);
    }
  }

  passTurnAfterDraw() {
    this.drawnCardThisTurn.set(null);
    this.advanceTurn();
  }

  callUnoPlayer() {
    const pList = [...this.players()];
    pList[0].hasCalledUno = true;
    this.players.set(pList);
    this.addLog(`🗣️ You called UNO!`);
  }

  catchUno(targetIdx: number) {
    const pList = [...this.players()];
    const target = pList[targetIdx];
    if (target.hand.length === 1 && !target.hasCalledUno) {
      this.addLog(`🚨 ${target.name} caught not calling UNO! +2 Cards penalty!`);
      this.drawMultipleCards(targetIdx, 2);
      target.hasCalledUno = true;
      this.players.set(pList);
    }
  }

  private executePlayCard(playerIdx: number, card: Card) {
    const pList = [...this.players()];
    const player = pList[playerIdx];

    const prevColor = this.currentColor(); // Color before card played

    // Remove card from hand
    player.hand = player.hand.filter(c => c.id !== card.id);
    this.discardPile.update(p => [...p, card]);

    const cardSide = this.getCardSide(card);
    if (cardSide.color !== 'wild') {
      this.currentColor.set(cardSide.color);
    }
    this.addLog(`${player.name} played ${cardSide.color.toUpperCase()} ${cardSide.value}`);

    // Check Max mode 20-card hand limit knockout check
    this.checkHandLimitKnockout();

    // Check Victory
    if (player.hand.length === 0) {
      this.triggerRoundVictory(player);
      return;
    }

    // Handle Action card effects
    this.handleCardEffect(playerIdx, card, cardSide, prevColor);
  }

  private handleCardEffect(playerIdx: number, card: Card, cardSide: CardSide, prevColor: CardColor | null) {
    // 1. Draw Stacking (+2, +5, +6, +10)
    if (cardSide.drawAmount) {
      this.pendingDrawStack.update(s => s + cardSide.drawAmount!);
      if (this.gameMode() === 'max') {
        this.triggerScreenShake();
      }
    }

    // 2. Flip Card
    if (cardSide.type === 'flip') {
      this.triggerGlobalFlip();
    }

    // 3. Skip / Skip Everyone
    if (cardSide.type === 'skip') {
      this.addLog(`Next player turn skipped!`);
      this.advanceTurn(2);
      return;
    }

    if (cardSide.type === 'skip-everyone') {
      this.addLog(`Skip Everyone played! ${this.players()[playerIdx].name} plays again!`);
      this.advanceTurn(0);
      return;
    }

    // 4. Reverse
    if (cardSide.type === 'reverse') {
      this.turnDirection.update(d => d * -1);
      this.addLog(`Direction reversed!`);
    }

    // 5. Wild / Wild Draw / Draw Color
    if (cardSide.color === 'wild') {
      if (playerIdx === 0) {
        // Player pick color
        this.pendingColorChoice.set({ playerIdx: 0 });
        return;
      } else {
        // AI Pick color
        const aiChosenColor = this.aiChooseColor(playerIdx);
        this.currentColor.set(aiChosenColor);
        this.addLog(`${this.players()[playerIdx].name} chose color ${aiChosenColor.toUpperCase()}`);

        if (cardSide.type === 'wild-draw' && this.gameMode() === 'classic') {
          // Target (Player 0 or another AI) gets option to challenge
          const nextTargetIdx = this.getNextTurnIdx(1);
          if (nextTargetIdx === 0) {
            this.pendingChallenge.set({ challengerIdx: 0, targetIdx: playerIdx, card, prevColor });
            return;
          }
        }
      }
    }

    this.advanceTurn();
  }

  selectWildColor(color: CardColor) {
    this.currentColor.set(color);
    this.addLog(`You chose color ${color.toUpperCase()}`);
    this.pendingColorChoice.set(null);
    this.advanceTurn();
  }

  respondChallenge(doChallenge: boolean) {
    const challengeData = this.pendingChallenge();
    if (!challengeData) return;
    this.pendingChallenge.set(null);

    const targetPlayer = this.players()[challengeData.targetIdx];
    const prevColor = challengeData.prevColor;

    if (doChallenge) {
      // Inspect target player's hand before playing +4
      const hadMatchingColor = targetPlayer.hand.some(c => this.getCardSide(c).color === prevColor);
      if (hadMatchingColor) {
        this.addLog(`⚔️ Challenge SUCCESSFUL! ${targetPlayer.name} was guilty of having matching color (${prevColor?.toUpperCase()})! They draw 4 cards!`);
        this.drawMultipleCards(challengeData.targetIdx, 4);
      } else {
        this.addLog(`⚔️ Challenge FAILED! ${targetPlayer.name} was innocent! You draw 6 cards penalty!`);
        this.drawMultipleCards(0, 6);
      }
    } else {
      this.addLog(`You accepted +4 penalty.`);
      this.drawMultipleCards(0, 4);
    }

    this.advanceTurn();
  }

  private triggerGlobalFlip() {
    this.isFlipping.set(true);
    setTimeout(() => {
      this.activeSide.update(s => s === 'light' ? 'dark' : 'light');
      this.isFlipping.set(false);
      this.addLog(`🌀 DECK FLIPPED TO ${this.activeSide().toUpperCase()} SIDE!`);
    }, 600);
  }

  private triggerScreenShake() {
    this.isShaking.set(true);
    setTimeout(() => this.isShaking.set(false), 400);
  }

  private checkHandLimitKnockout() {
    if (this.gameMode() !== 'max') return;

    const pList = [...this.players()];
    let knockoutOccurred = false;

    pList.forEach(p => {
      if (!p.isKnockedOut && p.hand.length >= 20) {
        p.isKnockedOut = true;
        knockoutOccurred = true;
        this.addLog(`💀 ${p.name} exceeded 20 cards and is ELIMINATED!`);
      }
    });

    if (knockoutOccurred) {
      this.players.set(pList);
      const activePlayers = pList.filter(p => !p.isKnockedOut);
      if (activePlayers.length === 1) {
        this.triggerRoundVictory(activePlayers[0]);
      }
    }
  }

  private advanceTurn(stepCount = 1) {
    if (this.winner()) return;

    let nextIdx = this.getNextTurnIdx(stepCount);

    // Skip knocked out players
    let safetyCounter = 0;
    while (this.players()[nextIdx].isKnockedOut && safetyCounter < 3) {
      nextIdx = (nextIdx + this.turnDirection() + 3) % 3;
      safetyCounter++;
    }

    this.turnIndex.set(nextIdx);

    // AI Turn Processing
    if (nextIdx !== 0 && !this.players()[nextIdx].isKnockedOut) {
      this.isAiThinking.set(true);
      setTimeout(() => this.processAiTurn(nextIdx), 1000);
    } else {
      this.isAiThinking.set(false);
    }
  }

  private processAiTurn(botIdx: number) {
    if (this.winner() || this.turnIndex() !== botIdx) return;

    const bot = this.players()[botIdx];

    // AI UNO declaration check
    if (bot.hand.length === 2 && !bot.hasCalledUno && Math.random() < 0.85) {
      bot.hasCalledUno = true;
      this.addLog(`🤖 ${bot.name} called "UNO!"`);
    }

    // Handle active draw stack in Max mode
    if (this.pendingDrawStack() > 0) {
      const stackingCard = bot.hand.find(c => this.canPlay(c));
      if (stackingCard) {
        this.isAiThinking.set(false);
        this.executePlayCard(botIdx, stackingCard);
        return;
      } else {
        this.addLog(`🤖 ${bot.name} drew total penalty stack: ${this.pendingDrawStack()} cards.`);
        this.drawMultipleCards(botIdx, this.pendingDrawStack());
        this.pendingDrawStack.set(0);
        this.isAiThinking.set(false);
        this.advanceTurn();
        return;
      }
    }

    // Regular play finding
    const playableCards = bot.hand.filter(c => this.canPlay(c));
    if (playableCards.length > 0) {
      const chosen = playableCards[Math.floor(Math.random() * playableCards.length)];
      this.isAiThinking.set(false);
      this.executePlayCard(botIdx, chosen);
    } else {
      // Draw 1 card
      const drawn = this.drawSingleCard(botIdx);
      if (drawn && this.canPlay(drawn) && Math.random() < 0.7) {
        this.addLog(`🤖 ${bot.name} drew and played card.`);
        this.isAiThinking.set(false);
        this.executePlayCard(botIdx, drawn);
      } else {
        this.addLog(`🤖 ${bot.name} drew a card and passed.`);
        this.isAiThinking.set(false);
        this.advanceTurn();
      }
    }
  }

  private aiChooseColor(botIdx: number): CardColor {
    const hand = this.players()[botIdx].hand;
    const colorCounts: Record<string, number> = {};
    hand.forEach(c => {
      const col = this.getCardSide(c).color;
      if (col !== 'wild') {
        colorCounts[col] = (colorCounts[col] || 0) + 1;
      }
    });

    const availColors = this.getAvailableWildColors();
    let maxCol: CardColor = availColors[0];
    let maxCount = -1;

    availColors.forEach(col => {
      if ((colorCounts[col] || 0) > maxCount) {
        maxCount = colorCounts[col] || 0;
        maxCol = col;
      }
    });

    return maxCol;
  }

  private drawSingleCard(playerIdx: number): Card | null {
    if (this.drawPile().length === 0) {
      this.reshuffleDiscardIntoDraw();
    }

    const pile = [...this.drawPile()];
    if (pile.length === 0) return null;

    const drawnCard = pile.pop()!;
    this.drawPile.set(pile);

    const pList = [...this.players()];
    pList[playerIdx].hand.push(drawnCard);
    this.players.set(pList);

    return drawnCard;
  }

  private drawMultipleCards(playerIdx: number, count: number) {
    for (let i = 0; i < count; i++) {
      this.drawSingleCard(playerIdx);
    }
  }

  private reshuffleDiscardIntoDraw() {
    const disc = [...this.discardPile()];
    if (disc.length <= 1) return;

    const top = disc.pop()!;
    this.discardPile.set([top]);

    const newDraw = disc.sort(() => Math.random() - 0.5);
    this.drawPile.set(newDraw);
    this.addLog(`🔄 Reshuffled discard pile into new draw pile.`);
  }

  private triggerRoundVictory(victor: Player) {
    this.winner.set(victor.name);

    // Calculate Scores
    const pList = [...this.players()];
    pList.forEach(p => {
      if (p.id !== victor.id) {
        const pHandScore = p.hand.reduce((sum, card) => {
          const side = this.getCardSide(card);
          if (side.type === 'number') return sum + parseInt(side.value, 10);
          if (side.color === 'wild') return sum + 50;
          return sum + 20;
        }, 0);
        victor.score += pHandScore;
      }
    });

    this.players.set(pList);
    this.addLog(`🏆 ${victor.name} WINS THE MATCH! Total Score: ${victor.score} pts`);
  }

  getNextTurnIdx(steps = 1): number {
    const total = 3;
    const dir = this.turnDirection();
    return (this.turnIndex() + (dir * steps) + (total * 10)) % total;
  }

  getAvailableWildColors(): CardColor[] {
    return this.activeSide() === 'light'
      ? ['red', 'blue', 'green', 'yellow']
      : ['teal', 'pink', 'purple', 'orange'];
  }

  getCardBgClass(color: CardColor | string): string {
    switch (color) {
      case 'red': return 'bg-gradient-to-tr from-red-700 to-rose-500 text-white border-rose-400';
      case 'blue': return 'bg-gradient-to-tr from-blue-700 to-sky-500 text-white border-sky-400';
      case 'green': return 'bg-gradient-to-tr from-emerald-700 to-teal-500 text-white border-emerald-400';
      case 'yellow': return 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-amber-300';
      case 'teal': return 'bg-gradient-to-tr from-cyan-700 to-teal-500 text-white border-cyan-400';
      case 'pink': return 'bg-gradient-to-tr from-pink-700 to-rose-400 text-white border-pink-300';
      case 'purple': return 'bg-gradient-to-tr from-purple-800 to-indigo-600 text-white border-purple-400';
      case 'orange': return 'bg-gradient-to-tr from-orange-700 to-amber-500 text-white border-orange-300';
      default: return 'bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white border-amber-300';
    }
  }

  getCardIcon(value: string): string {
    switch (value) {
      case 'Skip': return '🚫';
      case 'Skip Everyone': return '💥';
      case 'Reverse': return '🔁';
      case 'Flip': return '🌀';
      case 'Wild': return '🌈';
      case 'Wild +4': return '⚡';
      case 'Wild Draw Color': return '🎨';
      case 'Wild Discard Half': return '✂️';
      case '+2': return '➕2';
      case '+5': return '➕5';
      case '+6': return '🔥6';
      case '+10': return '💥10';
      default: return value;
    }
  }

  getCardTransform(index: number, totalCards: number): string {
    if (totalCards <= 1) return 'rotate(0deg) translateY(0px)';
    const centerIdx = (totalCards - 1) / 2;
    const offset = index - centerIdx;
    const maxAngle = Math.min(30, totalCards * 3);
    const angle = (offset / centerIdx) * (maxAngle / 2);
    const translateY = Math.abs(offset) * 4;
    return `rotate(${angle}deg) translateY(${translateY}px)`;
  }

  private addLog(msg: string) {
    this.logs.update(l => [msg, ...l.slice(0, 19)]);
  }
}
