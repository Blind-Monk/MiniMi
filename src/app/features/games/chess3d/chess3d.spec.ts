import { describe, it, expect, beforeEach } from 'vitest';
import { ChessRulesEngine } from './chess-rules-engine';
import { ChessAI } from './chess-ai';

describe('3D Battle Chess Engine', () => {
  let engine: ChessRulesEngine;

  beforeEach(() => {
    engine = new ChessRulesEngine();
  });

  it('should initialize board with standard 32 pieces', () => {
    let pieceCount = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (engine.grid[r][c] !== null) pieceCount++;
      }
    }
    expect(pieceCount).toBe(32);
  });

  it('should generate legal opening moves for White pawns and knights', () => {
    const e2Moves = engine.getLegalMoves(6, 4, 'w'); // e2 pawn
    expect(e2Moves.length).toBe(2); // e3 and e4

    const b1Moves = engine.getLegalMoves(7, 1, 'w'); // b1 knight
    expect(b1Moves.length).toBe(2); // Na3 and Nc3
  });

  it('should execute move and update move history log', () => {
    const move = { fromRow: 6, fromCol: 4, toRow: 4, toCol: 4 }; // e2-e4
    const success = engine.makeMove(move);
    expect(success).toBe(true);
    expect(engine.getPiece(4, 4)?.type).toBe('p');
    expect(engine.getPiece(6, 4)).toBeNull();
    expect(engine.moveHistory.length).toBe(1);
    expect(engine.moveHistory[0].notation).toBe('e4');
  });

  it('should calculate AI move for Black using Minimax engine', () => {
    // 1. e4
    engine.makeMove({ fromRow: 6, fromCol: 4, toRow: 4, toCol: 4 });
    const bestMove = ChessAI.getBestMove(engine, 'b', 'medium');
    expect(bestMove).not.toBeNull();
    expect(bestMove?.fromRow).toBeGreaterThanOrEqual(0);
  });
});
