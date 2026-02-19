
import { MatchmakingPanel } from '@/components/game/MatchmakingPanel';
import { Inventory } from '@/components/game/Inventory';
import { ELOData, InventoryPiece } from '@/types';

interface MenuProps {
  playerElo: ELOData;
  inventory: InventoryPiece[];
  address: string;
  onQueue: (opponentType: 'HUMAN' | 'AI' | 'ANY') => void;
  onCancel: () => void;
  isQueued: boolean;
  queueTime: number;
}

export const Menu = ({ playerElo, inventory, address, onQueue, onCancel, isQueued, queueTime }: MenuProps) => {
  return (
    <div className="flex items-start justify-center gap-8">
      <MatchmakingPanel
        playerElo={playerElo || {
          playerAddress: address || '',
          currentElo: 1200,
          highestElo: 1200,
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          winStreak: 0,
          bestWinStreak: 0,
        }}
        onQueue={onQueue}
        onCancel={onCancel}
        isQueued={isQueued}
        queueTime={queueTime}
      />
      
      {inventory.length > 0 && (
        <div className="w-96">
          <Inventory
            pieces={inventory}
            maxSlots={10}
            selectable
          />
        </div>
      )}
    </div>
  );
};
