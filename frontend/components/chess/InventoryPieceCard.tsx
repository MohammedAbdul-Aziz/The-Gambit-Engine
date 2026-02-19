
import { InventoryPiece, PieceRarity } from '@/types';
import { cn } from '@/lib/utils';
import { Lock, Unlock, Trash2, Star } from 'lucide-react';

interface InventoryPieceCardProps {
  piece: InventoryPiece;
  selectable: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onLock?: () => void;
  onRelease?: () => void;
}

const RARITY_COLORS: Record<PieceRarity, string> = {
  COMMON: 'border-accent-6 bg-secondary',
  UNCOMMON: 'border-green-700 bg-secondary',
  RARE: 'border-blue-700 bg-secondary',
  EPIC: 'border-purple-700 bg-secondary',
  LEGENDARY: 'border-orange-700 bg-secondary',
  MYTHIC: 'border-yellow-700 bg-secondary animate-pulse',
};

const RARITY_STARS: Record<PieceRarity, number> = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  MYTHIC: 6,
};

function getPieceSymbol(type: string): string {
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

export function InventoryPieceCard({
  piece,
  selectable,
  isSelected = false,
  onSelect,
  onLock,
  onRelease,
}: InventoryPieceCardProps) {
  const rarityColor = RARITY_COLORS[piece.rarity];
  const stars = RARITY_STARS[piece.rarity];

  return (
    <div
      className={cn(
        'aspect-square border-2 rounded-lg p-3 transition-all relative text-accent',
        rarityColor,
        selectable && 'cursor-pointer hover:shadow-lg hover:border-accent-4',
        isSelected && 'ring-2 ring-blue-500 scale-105'
      )}
      onClick={selectable ? onSelect : undefined}
    >
      {/* Lock indicator */}
      {piece.isLocked && (
        <div className="absolute top-1 right-1">
          <Lock className="w-4 h-4 text-accent-3" />
        </div>
      )}

      {/* Piece type */}
      <div className="text-center mb-2">
        <div className="text-4xl text-accent">{getPieceSymbol(piece.baseType)}</div>
        <div className="text-xs font-semibold text-accent-3">{piece.baseType}</div>
      </div>

      {/* Traits */}
      <div className="text-xs text-accent-3 mb-2">
        <div>{piece.traits.length} traits</div>
        {piece.traits.slice(0, 2).map((trait, index) => (
          <div key={index} className="truncate text-purple-400">
            • {trait.name.replace('_', ' ')}
          </div>
        ))}
        {piece.traits.length > 2 && (
          <div className="text-accent-4">+{piece.traits.length - 2} more</div>
        )}
      </div>

      {/* Stats */}
      <div className="text-xs text-accent-4 space-y-1">
        <div className="flex justify-between">
          <span>Games:</span>
          <span className="font-medium text-accent-2">{piece.gamesPlayed}</span>
        </div>
        <div className="flex justify-between">
          <span>Captures:</span>
          <span className="font-medium text-accent-2">{piece.capturesMade}</span>
        </div>
      </div>

      {/* Rarity stars */}
      <div className="flex gap-0.5 mt-2">
        {Array.from({ length: stars }).map((_, i) => (
          <Star
            key={i}
            className="w-3 h-3 fill-yellow-500 text-yellow-500"
          />
        ))}
      </div>

      {/* Actions */}
      {!selectable && (
        <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 bg-primary bg-opacity-90 rounded-b-lg">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLock?.();
            }}
            className="flex-1 p-1 text-xs bg-secondary rounded hover:bg-accent-6"
          >
            {piece.isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRelease?.();
            }}
            disabled={piece.isLocked}
            className="flex-1 p-1 text-xs bg-red-900 text-red-300 rounded hover:bg-red-800 disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
