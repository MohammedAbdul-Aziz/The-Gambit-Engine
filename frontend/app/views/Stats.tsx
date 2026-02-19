
import { PlayerStatsPanel } from '@/components/game/PlayerStatsPanel';
import { ELOData } from '@/types';

interface StatsProps {
  playerElo: ELOData;
}

export const Stats = ({ playerElo }: StatsProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <PlayerStatsPanel eloData={playerElo} />
    </div>
  );
};
