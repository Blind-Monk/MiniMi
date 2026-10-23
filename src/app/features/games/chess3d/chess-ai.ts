import { ChessRulesEngine, Move, PieceColor } from './chess-rules-engine';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'grandmaster';

export class ChessAI {
  // Piece values
  private static pieceValues: Record<string, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20000
  };

  // Positional evaluation tables (for White; inverted for Black)
  private static pawnTable = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ];

  private static knightTable = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  static getBestMove(engine: ChessRulesEngine, color: PieceColor, difficulty: AIDifficulty): Move | null {
    const allMoves: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = engine.grid[r][c];
        if (p && p.color === color) {
          allMoves.push(...engine.getLegalMoves(r, c, color));
        }
      }
    }

    if (allMoves.length === 0) return null;

    if (difficulty === 'easy') {
      // Random move or simple capture
      const captures = allMoves.filter(m => m.capturedPiece);
      if (captures.length > 0 && Math.random() > 0.3) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }

    const maxDepth = difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 4;
    let bestMove: Move | null = null;
    let bestValue = color === 'w' ? -Infinity : Infinity;

    // Shuffle moves for variety
    allMoves.sort(() => Math.random() - 0.5);

    for (const move of allMoves) {
      const sim = engine.cloneEngine();
      sim.makeMove(move);

      const boardValue = this.minimax(sim, maxDepth - 1, -Infinity, Infinity, color === 'w' ? false : true);

      if (color === 'w') {
        if (boardValue > bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      } else {
        if (boardValue < bestValue) {
          bestValue = boardValue;
          bestMove = move;
        }
      }
    }

    return bestMove || allMoves[0];
  }

  private static minimax(
    engine: ChessRulesEngine,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    if (depth === 0) {
      return this.evaluateBoard(engine);
    }

    const currentTurnColor: PieceColor = isMaximizing ? 'w' : 'b';
    const moves: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = engine.grid[r][c];
        if (p && p.color === currentTurnColor) {
          moves.push(...engine.getLegalMoves(r, c, currentTurnColor));
        }
      }
    }

    if (moves.length === 0) {
      if (engine.isKingInCheck(currentTurnColor)) {
        return isMaximizing ? -20000 : 20000; // Checkmate
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const sim = engine.cloneEngine();
        sim.makeMove(move);
        const evalVal = this.minimax(sim, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const sim = engine.cloneEngine();
        sim.makeMove(move);
        const evalVal = this.minimax(sim, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      return minEval;
    }
  }

  static evaluateBoard(engine: ChessRulesEngine): number {
    let totalScore = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = engine.grid[r][c];
        if (p) {
          let val = this.pieceValues[p.type] || 0;

          // Positional bonuses
          if (p.type === 'p') {
            const tableRow = p.color === 'w' ? r : 7 - r;
            val += this.pawnTable[tableRow][c];
          } else if (p.type === 'n') {
            const tableRow = p.color === 'w' ? r : 7 - r;
            val += this.knightTable[tableRow][c];
          }

          if (p.color === 'w') {
            totalScore += val;
          } else {
            totalScore -= val;
          }
        }
      }
    }

    return totalScore;
  }
}
