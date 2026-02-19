
import { ChessBoard } from '@/components/chess/ChessBoard';
import { GameInfoPanel } from '@/components/game/GameInfoPanel';
import { Piece, GameState, Position, ELOData } from '@/types';

interface PlayingProps {
  pieces: Piece[];
  selectedPieceId?: number;
  validMoves: Position[];
  onPieceClick: (pieceId: number) => void;
  onSquareClick: (position: Position) => void;
  gameState: GameState;
  playerElo?: ELOData;
  moveHistory: string[];
}

export const Playing = ({ pieces, selectedPieceId, validMoves, onPieceClick, onSquareClick, gameState, playerElo, moveHistory }: PlayingProps) => {
  return (
    <div className="flex items-start justify-center gap-8">
      <ChessBoard
        pieces={pieces}
        selectedPieceId={selectedPieceId}
        validMoves={validMoves}
        onPieceClick={onPieceClick}
        onSquareClick={onSquareClick}
      />
      
      <div className="w-80 space-y-4">
        <GameInfoPanel
          gameState={gameState}
          playerElo={playerElo}
          opponentElo={1200}
          moveHistory={moveHistory}
        />
      </div>
    </div>
  );
};
