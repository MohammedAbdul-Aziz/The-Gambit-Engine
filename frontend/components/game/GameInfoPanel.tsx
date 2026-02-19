'use client';

import { GameState, ELOData } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Clock, Zap, Trophy, Target, History } from 'lucide-react';

interface GameInfoPanelProps {
  gameState: GameState;
  playerElo?: ELOData;
  opponentElo?: number;
  isBot?: boolean;
  moveHistory: string[];
  onResign?: () => void;
  onDraw?: () => void;
}

export function GameInfoPanel({
  gameState,
  playerElo,
  opponentElo,
  isBot = false,
  moveHistory,
  onResign,
  onDraw,
}: GameInfoPanelProps) {
  const isPlayerTurn = gameState.currentTurn === gameState.playerWhite; // Assuming player is white

  return (
    <div className="bg-primary rounded-lg shadow-lg p-4 space-y-4 border border-accent-6">
      {/* Game Status */}
      <div className="text-center pb-2 border-b border-accent-6">
        <h2 className="text-lg font-bold text-accent">Game #{gameState.id}</h2>
        <div className={cn(
          'text-sm font-semibold mt-1',
          isPlayerTurn ? 'text-green-400' : 'text-accent-3'
        )}>
          {isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
      </div>

      {/* Move Counter */}
      <div className="flex items-center justify-center gap-2 text-accent-3">
        <Clock className="w-4 h-4" />
        <span className="text-sm">Move {gameState.moveCount}</span>
      </div>

      {/* Gas Info & ELO */}
      <div className="grid grid-cols-2 gap-2">
        {/* Gas Info */}
        <div className="bg-secondary rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-accent">Gas</span>
          </div>
          <div className="flex justify-between text-center">
            <div>
              <div className="text-xs text-accent-3">You</div>
              <div className="text-lg font-bold text-accent">
                {isPlayerTurn ? gameState.gasWhite : gameState.gasBlack}
              </div>
            </div>
            <div>
              <div className="text-xs text-accent-3">Opponent</div>
              <div className="text-lg font-bold text-accent">
                {isPlayerTurn ? gameState.gasBlack : gameState.gasWhite}
              </div>
            </div>
          </div>
        </div>

        {/* ELO Info */}
        {(playerElo || opponentElo) && (
          <div className="bg-secondary rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-accent">Ratings</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-accent-3">You</span>
                <span className="text-sm font-bold text-accent">
                  {playerElo?.currentElo || 1200}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-accent-3">
                  {isBot ? 'Bot' : 'Opponent'}
                </span>
                <span className="text-sm font-bold text-accent">
                  {opponentElo || 1200}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Move History */}
      <div className="bg-secondary rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <History className="w-4 h-4 text-accent-3" />
          <span className="text-sm font-semibold text-accent">Move History</span>
        </div>
        <ScrollArea className="h-24">
          <div className="space-y-1 pr-2">
            {moveHistory.length === 0 ? (
              <p className="text-xs text-accent-4 text-center italic">No moves yet</p>
            ) : (
              moveHistory.map((move, index) => (
                <div key={index} className="text-xs flex justify-between p-1 rounded bg-background">
                  <span className="font-mono text-accent-3">{index + 1}.</span>
                  <span className="font-semibold text-accent">{move}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Game State Indicators */}
      <div className="space-y-2">
        {gameState.isCheck && (
          <div className="bg-red-900 text-red-300 px-3 py-2 rounded text-center font-semibold">
            ⚠️ CHECK
          </div>
        )}
        {gameState.isCheckmate && (
          <div className="bg-green-900 text-green-300 px-3 py-2 rounded text-center font-semibold">
            ✓ Checkmate!
          </div>
        )}
        {gameState.isStalemate && (
          <div className="bg-yellow-900 text-yellow-300 px-3 py-2 rounded text-center font-semibold">
            ⚠️ Stalemate
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-accent-6">
        <button
          onClick={onDraw}
          className="flex-1 px-3 py-2 text-sm bg-secondary text-accent rounded hover:bg-accent-6 transition-colors"
        >
          Offer Draw
        </button>
        <button
          onClick={onResign}
          className="flex-1 px-3 py-2 text-sm bg-red-900 text-red-300 rounded hover:bg-red-800 transition-colors"
        >
          Resign
        </button>
      </div>
    </div>
  );
}
