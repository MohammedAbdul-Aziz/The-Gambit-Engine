'use client';

import { useState } from 'react';
import { OpponentType, ELOData } from '@/types';
import { cn } from '@/lib/utils';
import { Users, Bot, Search, X } from 'lucide-react';

interface MatchmakingPanelProps {
  playerElo: ELOData;
  onQueue: (opponentType: OpponentType) => void;
  onCancel: () => void;
  isQueued: boolean;
  queueTime?: number;
  estimatedWait?: number;
}

export function MatchmakingPanel({
  playerElo,
  onQueue,
  onCancel,
  isQueued,
  queueTime,
  estimatedWait = 30,
}: MatchmakingPanelProps) {
  const getBotLevel = () => {
    const elo = playerElo.currentElo;
    if (elo < 600) return { level: 1, name: 'Bot I' };
    if (elo < 800) return { level: 2, name: 'Bot II' };
    if (elo < 1000) return { level: 3, name: 'Bot III' };
    if (elo < 1200) return { level: 4, name: 'Bot IV' };
    if (elo < 1400) return { level: 5, name: 'Bot V' };
    if (elo < 1600) return { level: 6, name: 'Bot VI' };
    if (elo < 1800) return { level: 7, name: 'Bot VII' };
    if (elo < 2000) return { level: 8, name: 'Bot VIII' };
    if (elo < 2200) return { level: 9, name: 'Bot IX' };
    return { level: 10, name: 'Bot X' };
  };

  const botLevel = getBotLevel();

  if (isQueued) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
              <Search className="w-8 h-8 text-blue-600 absolute inset-0 m-auto" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Finding Match...
            </h3>
            <p className="text-gray-600">
              Looking for opponent near your ELO ({playerElo.currentElo})
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">Queue Position</div>
            <div className="text-2xl font-bold text-blue-600">
              #{Math.max(1, Math.floor((queueTime || 0) / 10))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Est. wait: ~{estimatedWait}s
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            Searching for an opponent...
          </div>

          <button
            onClick={onCancel}
            className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Play a Game</h3>

      {/* Player ELO */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Your Rating</span>
          <span className="text-lg font-bold text-gray-900">
            {playerElo.currentElo}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {getRankName(playerElo.currentElo)}
        </div>
        <div className="mt-2 pt-2 border-t flex justify-between text-xs">
          <span>W: {playerElo.wins}</span>
          <span>L: {playerElo.losses}</span>
          <span>D: {playerElo.draws}</span>
        </div>
      </div>

      {/* Opponent Type Selection */}
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onQueue('HUMAN')}
          className="w-full px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex flex-col items-center justify-center gap-2"
        >
          <Users className="w-8 h-8" />
          <span className="text-lg">Play vs Human</span>
          <span className="text-xs text-blue-200">ELO: ±100</span>
        </button>
        <button
          onClick={() => onQueue('AI')}
          className="w-full px-4 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold flex flex-col items-center justify-center gap-2"
        >
          <Bot className="w-8 h-8" />
          <span className="text-lg">Play vs AI</span>
          <span className="text-xs text-gray-300">
            vs {botLevel.name} (ELO: {botLevel.level * 200})
          </span>
        </button>
      </div>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-4">
        You will be matched with an opponent near your skill level.
      </p>
    </div>
  );
}

function getRankName(elo: number): string {
  if (elo >= 2400) return 'Grandmaster';
  if (elo >= 2000) return 'Master';
  if (elo >= 1600) return 'Expert';
  if (elo >= 1200) return 'Advanced';
  if (elo >= 800) return 'Intermediate';
  return 'Beginner';
}
