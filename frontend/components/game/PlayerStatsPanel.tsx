
import { ELOData } from '@/types';
import { Trophy, BarChart, TrendingUp, ChevronsUp } from 'lucide-react';

interface PlayerStatsPanelProps {
  eloData: ELOData;
}

export function PlayerStatsPanel({ eloData }: PlayerStatsPanelProps) {
  const {
    currentElo,
    highestElo,
    gamesPlayed,
    wins,
    losses,
    draws,
    winStreak,
    bestWinStreak,
  } = eloData;

  const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : 0;

  return (
    <div className="bg-primary rounded-lg shadow-lg p-6 border border-accent-6">
      <h3 className="text-xl font-bold text-accent mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        Player Statistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current ELO */}
        <div className="bg-secondary p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-accent">{currentElo}</div>
          <div className="text-sm text-accent-3">Current ELO</div>
        </div>

        {/* Highest ELO */}
        <div className="bg-secondary p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-accent">{highestElo}</div>
          <div className="text-sm text-accent-3">Highest ELO</div>
        </div>

        {/* Win Rate */}
        <div className="bg-secondary p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-accent">{winRate}%</div>
          <div className="text-sm text-accent-3">Win Rate</div>
        </div>

        {/* Games Played */}
        <div className="bg-secondary p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-accent">{gamesPlayed}</div>
          <div className="text-sm text-accent-3">Games Played</div>
        </div>

        {/* Win/Loss/Draw */}
        <div className="md:col-span-2 bg-secondary p-4 rounded-lg flex justify-around items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{wins}</div>
            <div className="text-sm text-accent-3">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{losses}</div>
            <div className="text-sm text-accent-3">Losses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{draws}</div>
            <div className="text-sm text-accent-3">Draws</div>
          </div>
        </div>

        {/* Win Streak */}
        <div className="bg-secondary p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                <TrendingUp className="w-6 h-6" /> {winStreak}
            </div>
            <div className="text-sm text-accent-3">Current Streak</div>
        </div>

        {/* Best Win Streak */}
        <div className="bg-secondary p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
                <ChevronsUp className="w-6 h-6" /> {bestWinStreak}
            </div>
            <div className="text-sm text-accent-3">Best Streak</div>
        </div>
      </div>
    </div>
  );
}
