
export function getPieceSymbol(type: string): string {
    const symbols: Record<string, string> = {
      KING: '♔',
      QUEEN: '♕',
      ROOK: '♖',
      BISHOP: '♗',
      KNIGHT: '♘',
      PAWN: '♙',
    };
    return symbols[type] || '?';
  }
