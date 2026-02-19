
import { InventoryPiece, PieceRarity } from '@/types';
import { cn } from '@/lib/utils';
import { X, Star, ShieldCheck, Swords, Zap } from 'lucide-react';

interface PieceDetailModalProps {
  piece: InventoryPiece;
  onClose: () => void;
}

const RARITY_COLORS: Record<PieceRarity, string> = {
  COMMON: 'text-gray-400',
  UNCOMMON: 'text-green-400',
  RARE: 'text-blue-400',
  EPIC: 'text-purple-400',
  LEGENDARY: 'text-orange-400',
  MYTHIC: 'text-yellow-400',
};

const getPieceSymbol = (type: string): string => {
  const symbols: Record<string, string> = {
    KING: '♔',
    QUEEN: '♕',
    ROOK: '♖',
    BISHOP: '♗',
    KNIGHT: '♘',
    PAWN: '♙',
  };
  return symbols[type] || '?';
};

export function PieceDetailModal({ piece, onClose }: PieceDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-xl shadow-2xl w-full max-w-md border-2 border-accent-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent-6">
          <h2 className="text-2xl font-bold text-accent">
            {getPieceSymbol(piece.baseType)} {piece.baseType}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent-6 transition-colors"
          >
            <X className="w-6 h-6 text-accent-3" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Rarity and Level */}
          <div className="flex justify-between items-center">
            <div className={cn('font-bold text-lg', RARITY_COLORS[piece.rarity])}>
              {piece.rarity}
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: piece.rarity.length }).map((_, i) => (
                <Star key={i} className={cn('w-5 h-5', RARITY_COLORS[piece.rarity], 'fill-current')} />
              ))}
            </div>
          </div>

          {/* Traits */}
          <div>
            <h3 className="text-lg font-semibold text-accent-2 mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Traits
            </h3>
            <div className="space-y-2">
              {piece.traits.length > 0 ? (
                piece.traits.map((trait, index) => (
                  <div key={index} className="bg-secondary p-3 rounded-lg">
                    <div className="font-semibold text-purple-400">{trait.name.replace(/_/g, ' ')}</div>
                    <p className="text-sm text-accent-3">{trait.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-accent-4 italic">This piece has no special traits.</p>
              )}
            </div>
          </div>

          {/* Combat Stats */}
          <div>
            <h3 className="text-lg font-semibold text-accent-2 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              Combat Record
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-secondary p-4 rounded-lg">
                <div className="text-2xl font-bold text-accent">{piece.gamesPlayed}</div>
                <div className="text-sm text-accent-3">Games Played</div>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <div className="text-2xl font-bold text-accent">{piece.capturesMade}</div>
                <div className="text-sm text-accent-3">Captures Made</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
