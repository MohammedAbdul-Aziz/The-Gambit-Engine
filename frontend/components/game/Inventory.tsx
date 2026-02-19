'use client';

import { useState } from 'react';
import { InventoryPiece } from '@/types';
import { PieceDetailModal } from './PieceDetailModal';
import { InventoryPieceCard } from '../chess/InventoryPieceCard';

interface InventoryProps {
  pieces: InventoryPiece[];
  maxSlots: number;
  onSelectPiece?: (piece: InventoryPiece) => void;
  onLockPiece?: (pieceId: number) => void;
  onReleasePiece?: (pieceId: number) => void;
  selectable?: boolean;
  selectedPieceId?: number;
}

export function Inventory({
  pieces,
  maxSlots,
  onSelectPiece,
  onLockPiece,
  onReleasePiece,
  selectable = false,
  selectedPieceId,
}: InventoryProps) {
  const [detailedPiece, setDetailedPiece] = useState<InventoryPiece | null>(null);
  const emptySlots = maxSlots - pieces.length;

  const handlePieceClick = (piece: InventoryPiece) => {
    if (selectable) {
      onSelectPiece?.(piece);
    } else {
      setDetailedPiece(piece);
    }
  };

  return (
    <>
      <div className="bg-primary rounded-lg shadow-lg p-4 border border-accent-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-accent-6">
          <h3 className="text-lg font-bold text-accent">Inventory</h3>
          <span className="text-sm text-accent-3">
            {pieces.length}/{maxSlots} slots
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {pieces.map((piece) => (
            <InventoryPieceCard
              key={piece.id}
              piece={piece}
              selectable={selectable}
              isSelected={selectedPieceId === piece.id}
              onSelect={() => handlePieceClick(piece)}
              onLock={() => onLockPiece?.(piece.id)}
              onRelease={() => onReleasePiece?.(piece.id)}
            />
          ))}

          {/* Empty slots */}
          {Array.from({ length: emptySlots }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="aspect-square border-2 border-dashed border-accent-6 rounded-lg flex items-center justify-center text-accent-4"
            >
              <span className="text-sm">Empty</span>
            </div>
          ))}
        </div>
      </div>
      {detailedPiece && (
        <PieceDetailModal
          piece={detailedPiece}
          onClose={() => setDetailedPiece(null)}
        />
      )}
    </>
  );
}
