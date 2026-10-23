import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { CardClashComponent, Card } from './card-clash.component';

describe('CardClashComponent', () => {
  let component: CardClashComponent;

  beforeEach(() => {
    component = new CardClashComponent();
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize 3 players with 7 double-sided cards each', () => {
    expect(component.players().length).toBe(3);
    component.players().forEach(p => {
      expect(p.hand.length).toBe(7);
      p.hand.forEach(c => {
        expect(c.light).toBeDefined();
        expect(c.dark).toBeDefined();
      });
    });
  });

  it('should ensure the initial top discard card is a number card', () => {
    const top = component.topCard();
    expect(top).not.toBeNull();
    if (top) {
      const side = component.getCardSide(top);
      expect(side.type).toBe('number');
    }
  });

  it('should allow playing cards matching color, value, or wild', () => {
    const redFive: Card = {
      id: 999,
      light: { color: 'red', value: '5', type: 'number' },
      dark: { color: 'teal', value: '5', type: 'number' }
    };

    component.currentColor.set('red');
    expect(component.canPlay(redFive)).toBe(true);

    const wildCard: Card = {
      id: 1000,
      light: { color: 'wild', value: 'Wild', type: 'wild' },
      dark: { color: 'wild', value: 'Wild', type: 'wild' }
    };
    expect(component.canPlay(wildCard)).toBe(true);
  });

  it('should switch mode and reset state when mode is changed', () => {
    component.changeMode('flip');
    expect(component.gameMode()).toBe('flip');
    expect(component.players().length).toBe(3);

    component.changeMode('max');
    expect(component.gameMode()).toBe('max');
  });

  it('should allow player to call UNO', () => {
    component.callUnoPlayer();
    expect(component.players()[0].hasCalledUno).toBe(true);
  });

  it('should penalize a player who has 1 card and did not call UNO when caught', () => {
    // Set Bot 1 hand to 1 card and hasCalledUno = false
    const pList = [...component.players()];
    pList[1].hand = [pList[1].hand[0]];
    pList[1].hasCalledUno = false;
    component.players.set(pList);

    component.catchUno(1);
    expect(component.players()[1].hand.length).toBe(3); // 1 + 2 penalty
  });

  it('should handle Wild +4 challenge correctly when caller is guilty', () => {
    component.currentColor.set('red');

    // Set up pending challenge where target (Player 1) played Wild +4 but had a red card in hand
    const redCard: Card = {
      id: 1001,
      light: { color: 'red', value: '3', type: 'number' },
      dark: { color: 'teal', value: '3', type: 'number' }
    };

    const pList = [...component.players()];
    pList[1].hand = [redCard]; // Guilty!
    component.players.set(pList);

    const wildFour: Card = {
      id: 1002,
      light: { color: 'wild', value: 'Wild +4', type: 'wild-draw', drawAmount: 4 },
      dark: { color: 'wild', value: 'Wild Draw Color', type: 'draw-color' }
    };

    component.pendingChallenge.set({ challengerIdx: 0, targetIdx: 1, card: wildFour, prevColor: 'red' });

    const initialTargetHandCount = component.players()[1].hand.length;
    component.respondChallenge(true); // Player 0 challenges

    // Target had matching color, so target draws 4 penalty cards
    expect(component.players()[1].hand.length).toBe(initialTargetHandCount + 4);
  });

  it('should accumulate draw stacking penalty in Max mode', () => {
    component.changeMode('max');
    component.currentColor.set('red');

    const plusTwoCard: Card = {
      id: 2001,
      light: { color: 'red', value: '+2', type: 'draw', drawAmount: 2 },
      dark: { color: 'teal', value: '+5', type: 'draw', drawAmount: 5 }
    };

    // Add card to player 0's hand
    const pList = [...component.players()];
    pList[0].hand = [plusTwoCard, ...pList[0].hand];
    component.players.set(pList);

    component.playerPlayCard(plusTwoCard);
    expect(component.pendingDrawStack()).toBe(2);
  });

  it('should eliminate a player in Max mode when hand reaches 20 cards', () => {
    component.changeMode('max');
    component.currentColor.set('red');

    const pList = [...component.players()];

    // Give Bot 1 20 cards
    const extraCards = Array.from({ length: 20 }, (_, i) => ({
      id: 3000 + i,
      light: { color: 'red' as const, value: '1', type: 'number' as const },
      dark: { color: 'teal' as const, value: '1', type: 'number' as const }
    }));

    pList[1].hand = extraCards;

    // Add playable card to player 0
    const playCard: Card = {
      id: 2999,
      light: { color: 'red', value: '1', type: 'number' },
      dark: { color: 'teal', value: '1', type: 'number' }
    };
    pList[0].hand = [playCard, ...pList[0].hand];
    component.players.set(pList);

    component.playerPlayCard(playCard);

    expect(component.players()[1].isKnockedOut).toBe(true);
  });
});
