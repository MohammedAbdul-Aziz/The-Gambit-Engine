
import { Inventory } from '@/components/game/Inventory';
import { InventoryPiece } from '@/types';

interface InventoryViewProps {
  inventory: InventoryPiece[];
}

export const InventoryView = ({ inventory }: InventoryViewProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Inventory
        pieces={inventory}
        maxSlots={10}
        onLockPiece={(pieceId) => console.log('Lock:', pieceId)}
        onReleasePiece={(pieceId) => console.log('Release:', pieceId)}
      />
    </div>
  );
};
