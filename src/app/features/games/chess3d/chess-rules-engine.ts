export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface PieceState {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  capturedPiece?: PieceState;
  isCastling?: 'kingside' | 'queenside';
  isEnPassant?: boolean;
  promotion?: PieceType;
  notation?: string;
}

export class ChessRulesEngine {
  grid: (PieceState | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  enPassantTarget: { row: number; col: number } | null = null;
  halfMoveClock: number = 0;
  fullMoveNumber: number = 1;
  moveHistory: Move[] = [];

  constructor() {
    this.resetBoard();
  }

  resetBoard() {
    this.grid = Array(8).fill(null).map(() => Array(8).fill(null));
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.moveHistory = [];

    const backRow: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

    // Black pieces at rows 0 and 1
    backRow.forEach((type, col) => {
      this.grid[0][col] = { type, color: 'b', hasMoved: false };
      this.grid[1][col] = { type: 'p', color: 'b', hasMoved: false };
    });

    // White pieces at rows 6 and 7
    for (let col = 0; col < 8; col++) {
      this.grid[6][col] = { type: 'p', color: 'w', hasMoved: false };
    }
    backRow.forEach((type, col) => {
      this.grid[7][col] = { type, color: 'w', hasMoved: false };
    });
  }

  cloneEngine(): ChessRulesEngine {
    const copy = new ChessRulesEngine();
    copy.grid = this.grid.map(row => row.map(cell => cell ? { ...cell } : null));
    copy.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    copy.halfMoveClock = this.halfMoveClock;
    copy.fullMoveNumber = this.fullMoveNumber;
    copy.moveHistory = [...this.moveHistory];
    return copy;
  }

  getPiece(row: number, col: number): PieceState | null {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.grid[row][col];
  }

  getLegalMoves(row: number, col: number, turnColor: PieceColor): Move[] {
    const piece = this.getPiece(row, col);
    if (!piece || piece.color !== turnColor) return [];

    const pseudoMoves = this.getPseudoLegalMoves(row, col, piece, true);
    // Filter out moves that leave or put king in check
    return pseudoMoves.filter(move => {
      const simEngine = this.cloneEngine();
      simEngine.executeMoveInternal(move);
      return !simEngine.isKingInCheck(turnColor);
    });
  }

  getPseudoLegalMoves(r: number, c: number, piece: PieceState, checkCastling: boolean = true): Move[] {
    const moves: Move[] = [];
    const color = piece.color;
    const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // One step forward
        if (r + dir >= 0 && r + dir < 8 && !this.grid[r + dir][c]) {
          moves.push({ fromRow: r, fromCol: c, toRow: r + dir, toCol: c });
          // Two steps forward from starting row
          if (r === startRow && !this.grid[r + 2 * dir][c]) {
            moves.push({ fromRow: r, fromCol: c, toRow: r + 2 * dir, toCol: c });
          }
        }

        // Diagonal captures
        [-1, 1].forEach(dc => {
          const nr = r + dir;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = this.grid[nr][nc];
            if (target && target.color === enemyColor) {
              moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target });
            } else if (this.enPassantTarget && this.enPassantTarget.row === nr && this.enPassantTarget.col === nc) {
              moves.push({
                fromRow: r,
                fromCol: c,
                toRow: nr,
                toCol: nc,
                capturedPiece: this.grid[r][nc] || undefined,
                isEnPassant: true
              });
            }
          }
        });
        break;
      }

      case 'n': {
        const offsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        offsets.forEach(([dr, dc]) => {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = this.grid[nr][nc];
            if (!target || target.color === enemyColor) {
              moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target || undefined });
            }
          }
        });
        break;
      }

      case 'b': {
        this.addRayMoves(moves, r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1]], enemyColor);
        break;
      }

      case 'r': {
        this.addRayMoves(moves, r, c, [[-1, 0], [1, 0], [0, -1], [0, 1]], enemyColor);
        break;
      }

      case 'q': {
        this.addRayMoves(moves, r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]], enemyColor);
        break;
      }

      case 'k': {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              const target = this.grid[nr][nc];
              if (!target || target.color === enemyColor) {
                moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target || undefined });
              }
            }
          }
        }

        // Castling
        if (checkCastling && !piece.hasMoved && !this.isKingInCheck(color)) {
          // Kingside
          const rookK = this.grid[r][7];
          if (rookK && rookK.type === 'r' && !rookK.hasMoved && !this.grid[r][5] && !this.grid[r][6]) {
            if (!this.isSquareAttacked(r, 5, enemyColor) && !this.isSquareAttacked(r, 6, enemyColor)) {
              moves.push({ fromRow: r, fromCol: c, toRow: r, toCol: 6, isCastling: 'kingside' });
            }
          }
          // Queenside
          const rookQ = this.grid[r][0];
          if (rookQ && rookQ.type === 'r' && !rookQ.hasMoved && !this.grid[r][1] && !this.grid[r][2] && !this.grid[r][3]) {
            if (!this.isSquareAttacked(r, 2, enemyColor) && !this.isSquareAttacked(r, 3, enemyColor)) {
              moves.push({ fromRow: r, fromCol: c, toRow: r, toCol: 2, isCastling: 'queenside' });
            }
          }
        }
        break;
      }
    }

    return moves;
  }

  private addRayMoves(moves: Move[], r: number, c: number, directions: number[][], enemyColor: PieceColor) {
    directions.forEach(([dr, dc]) => {
      let nr = r + dr;
      let nc = c + dc;
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const target = this.grid[nr][nc];
        if (!target) {
          moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc });
        } else {
          if (target.color === enemyColor) {
            moves.push({ fromRow: r, fromCol: c, toRow: nr, toCol: nc, capturedPiece: target });
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    });
  }

  isSquareAttacked(r: number, c: number, attackerColor: PieceColor): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const p = this.grid[row][col];
        if (p && p.color === attackerColor) {
          const pMoves = this.getPseudoLegalMoves(row, col, p, false); // checkCastling = false prevents recursion!
          if (pMoves.some(m => m.toRow === r && m.toCol === c)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isKingInCheck(color: PieceColor): boolean {
    let kingRow = -1;
    let kingCol = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.grid[r][c];
        if (p && p.type === 'k' && p.color === color) {
          kingRow = r;
          kingCol = c;
          break;
        }
      }
    }
    if (kingRow === -1) return false;
    const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';
    return this.isSquareAttacked(kingRow, kingCol, enemyColor);
  }

  makeMove(move: Move, promotionChoice: PieceType = 'q'): boolean {
    const piece = this.getPiece(move.fromRow, move.fromCol);
    if (!piece) return false;

    // Check promotion
    if (piece.type === 'p' && (move.toRow === 0 || move.toRow === 7)) {
      move.promotion = promotionChoice;
    }

    move.notation = this.generateAlgebraicNotation(move, piece);

    this.executeMoveInternal(move);
    this.moveHistory.push(move);
    return true;
  }

  private executeMoveInternal(move: Move) {
    const piece = this.grid[move.fromRow][move.fromCol]!;

    if (move.isEnPassant) {
      this.grid[move.fromRow][move.toCol] = null;
    }

    this.grid[move.toRow][move.toCol] = {
      ...piece,
      type: move.promotion ? move.promotion : piece.type,
      hasMoved: true
    };
    this.grid[move.fromRow][move.fromCol] = null;

    if (move.isCastling === 'kingside') {
      const rook = this.grid[move.fromRow][7];
      if (rook) {
        this.grid[move.fromRow][5] = { ...rook, hasMoved: true };
        this.grid[move.fromRow][7] = null;
      }
    } else if (move.isCastling === 'queenside') {
      const rook = this.grid[move.fromRow][0];
      if (rook) {
        this.grid[move.fromRow][3] = { ...rook, hasMoved: true };
        this.grid[move.fromRow][0] = null;
      }
    }

    if (piece.type === 'p' && Math.abs(move.toRow - move.fromRow) === 2) {
      this.enPassantTarget = {
        row: (move.fromRow + move.toRow) / 2,
        col: move.fromCol
      };
    } else {
      this.enPassantTarget = null;
    }
  }

  generateAlgebraicNotation(move: Move, piece: PieceState): string {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    if (move.isCastling === 'kingside') return 'O-O';
    if (move.isCastling === 'queenside') return 'O-O-O';

    let str = '';
    if (piece.type !== 'p') {
      str += piece.type.toUpperCase();
    } else if (move.capturedPiece) {
      str += files[move.fromCol];
    }

    if (move.capturedPiece) str += 'x';
    str += files[move.toCol] + ranks[move.toRow];

    if (move.promotion) str += '=' + move.promotion.toUpperCase();

    return str;
  }

  hasLegalMoves(color: PieceColor): boolean {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.grid[r][c];
        if (p && p.color === color) {
          const moves = this.getLegalMoves(r, c, color);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }

  isCheckmate(color: PieceColor): boolean {
    return this.isKingInCheck(color) && !this.hasLegalMoves(color);
  }

  isStalemate(color: PieceColor): boolean {
    return !this.isKingInCheck(color) && !this.hasLegalMoves(color);
  }
}
