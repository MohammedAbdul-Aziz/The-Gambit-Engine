'use client';

import { Piece, PieceType, PieceColor, Position } from '@/types';
import { cn } from '@/lib/utils';
import {
  ChessKing,
  ChessQueen,
  ChessKnight,
  ChessBishop,
  ChessRook,
  ChessPawn,
} from 'lucide-react';

interface ChessBoardProps {
  pieces: Piece[];
  selectedPieceId?: number;
  validMoves?: Position[];
  onPieceClick?: (pieceId: number) => void;
  onSquareClick?: (position: Position) => void;
  isFlipped?: boolean;
  showCoordinates?: boolean;
}

const PIECE_ICONS: Record<PieceType, React.ComponentType<{ className?: string }>> = {
  KING: ChessKing,
  QUEEN: ChessQueen,
  KNIGHT: ChessKnight,
  BISHOP: ChessBishop,
  ROOK: ChessRook,
  PAWN: ChessPawn,
};

const PIECE_COLORS: Record<PieceColor, string> = {
  WHITE: 'text-accent',
  BLACK: 'text-accent-5',
};

export function ChessBoard({
  pieces,
  selectedPieceId,
  validMoves = [],
  onPieceClick,
  onSquareClick,
  isFlipped = false,
  showCoordinates = true,
}: ChessBoardProps) {
  const getPieceAt = (file: number, rank: number): Piece | undefined => {
    return pieces.find(
      (p) => p.position.file === file && p.position.rank === rank && p.isAlive
    );
  };

  const isValidMove = (file: number, rank: number): boolean => {
    return validMoves.some((m) => m.file === file && m.rank === rank);
  };

  const handleSquareClick = (file: number, rank: number) => {
    if (onSquareClick) {
      onSquareClick({ file, rank });
    }
  };

  const handlePieceClick = (e: React.MouseEvent, pieceId: number) => {
    e.stopPropagation();
    if (onPieceClick) {
      onPieceClick(pieceId);
    }
  };

  const files = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const ranks = isFlipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const fileLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rankLabels = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className="relative inline-block bg-primary p-4 rounded-lg shadow-lg">
      {/* Coordinates - Files */}
      {showCoordinates && (
        <div className="flex pl-6">
          {files.map((file) => (
            <div
              key={`file-${file}`}
              className="w-16 h-6 flex items-center justify-center text-sm text-accent-3"
            >
              {fileLabels[file]}
            </div>
          ))}
        </div>
      )}

      <div className="flex">
        {/* Coordinates - Ranks */}
        {showCoordinates && (
          <div className="flex flex-col">
            {ranks.map((rank) => (
              <div
                key={`rank-${rank}`}
                className="w-6 h-16 flex items-center justify-center text-sm text-accent-3"
              >
                {rankLabels[rank]}
              </div>
            ))}
          </div>
        )}

        {/* Board */}
        <div className="grid grid-cols-8 border-2 border-accent-8">
          {ranks.map((rank) =>
            files.map((file) => {
              const isLight = (file + rank) % 2 === 0;
              const piece = getPieceAt(file, rank);
              const isSelected = piece && piece.id === selectedPieceId;
              const isValid = isValidMove(file, rank);

              return (
                <div
                  key={`${file}-${rank}`}
                  className={cn(
                    'w-16 h-16 flex items-center justify-center relative cursor-pointer transition-all',
                    isLight ? 'bg-secondary' : 'bg-primary',
                    isSelected && 'ring-4 ring-blue-500 ring-inset',
                    isValid && 'before:absolute before:w-4 before:h-4 before:rounded-full before:bg-green-500 before:opacity-50'
                  )}
                  onClick={() => handleSquareClick(file, rank)}
                >
                  {piece && (
                    <div
                      className={cn(
                        'w-14 h-14 flex items-center justify-center transition-transform hover:scale-110',
                        PIECE_COLORS[piece.color],
                        isSelected && 'scale-110'
                      )}
                      onClick={(e) => handlePieceClick(e, piece.id)}
                    >
                      {renderPiece(piece.pieceType)}
                    </div>
                  )}

                  {/* Evolution indicator */}
                  {piece && piece.traits.length > 0 && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-primary" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function renderPiece(type: PieceType) {
  const Icon = PIECE_ICONS[type];
  return <Icon className="w-10 h-10" />;
}
