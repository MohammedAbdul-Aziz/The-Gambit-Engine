import { PieceType, TraitName, TRAIT_GAS_COSTS, TRAIT_DESCRIPTIONS } from '@/types';
import { getPieceSymbol } from '../utils/getPieceSymbol';
import { cn } from '@/lib/utils';
import { X, Check, Zap, ArrowRight } from 'lucide-react';

interface EvolutionPromptProps {
  attackerType: PieceType;
  defenderType: PieceType;
  playerGas: number;
  onEvolve: (traits: TraitName[]) => void;
  onSkip: () => void;
}

const AVAILABLE_TRAITS: Record<PieceType, TraitName[]> = {
  PAWN: ['FORWARD_STEP'],
  KNIGHT: ['LEAP'],
  BISHOP: ['DIAGONAL'],
  ROOK: ['STRAIGHT'],
  QUEEN: ['COMBINED'],
  KING: ['ADJACENT'],
};

export function EvolutionPrompt({
  attackerType,
  defenderType,
  playerGas,
  onEvolve,
  onSkip,
}: EvolutionPromptProps) {
  const [selectedTraits, setSelectedTraits] = useState<TraitName[]>([]);

  const availableTraits = AVAILABLE_TRAITS[defenderType];
  const traitCost = TRAIT_GAS_COSTS[defenderType];
  const totalCost = selectedTraits.length * traitCost;
  const canAfford = totalCost <= playerGas;

  const handleTraitToggle = (trait: TraitName) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const handleEvolve = () => {
    if (selectedTraits.length > 0 && canAfford) {
      onEvolve(selectedTraits);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-primary rounded-xl shadow-2xl w-full max-w-2xl border-2 border-accent-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-accent-6">
          <h3 className="text-2xl font-bold text-accent flex items-center gap-2">
            <Zap className="w-7 h-7 text-yellow-400" />
            Evolution Opportunity
          </h3>
          <button
            onClick={onSkip}
            className="p-2 rounded-full hover:bg-accent-6 transition-colors"
          >
            <X className="w-6 h-6 text-accent-3" />
          </button>
        </div>

        <div className="p-6">
          {/* Pieces Involved */}
          <div className="flex items-center justify-around mb-6">
            <div className="text-center">
              <div className="text-6xl text-accent">{getPieceSymbol(attackerType)}</div>
              <div className="text-lg font-semibold text-accent-2">{attackerType}</div>
              <div className="text-sm text-accent-3">(Your Piece)</div>
            </div>
            <ArrowRight className="w-12 h-12 text-accent-4" />
            <div className="text-center">
              <div className="text-6xl text-accent">{getPieceSymbol(defenderType)}</div>
              <div className="text-lg font-semibold text-accent-2">{defenderType}</div>
              <div className="text-sm text-accent-3">(Captured)</div>
            </div>
          </div>

          {/* Trait Selection */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-accent-2 mb-3 text-center">
              Inherit traits from the captured <span className="font-bold">{defenderType}</span>
            </h4>
            <div className="space-y-3">
              {availableTraits.map((trait) => (
                <button
                  key={trait}
                  onClick={() => handleTraitToggle(trait)}
                  disabled={!canAfford && !selectedTraits.includes(trait)}
                  className={cn(
                    'w-full p-4 rounded-lg border-2 transition-all flex items-start text-left',
                    selectedTraits.includes(trait)
                      ? 'border-blue-500 bg-secondary'
                      : 'border-accent-6 hover:border-accent-4',
                    !canAfford && !selectedTraits.includes(trait) && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <div className="flex-grow">
                    <div className="font-bold text-base text-purple-400">{trait.replace(/_/g, ' ')}</div>
                    <p className="text-sm text-accent-3">{TRAIT_DESCRIPTIONS[trait]}</p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <div className="flex items-center gap-1 font-semibold text-yellow-400">
                      <Zap className="w-4 h-4" />
                      {traitCost}
                    </div>
                    {selectedTraits.includes(trait) && (
                      <Check className="w-5 h-5 text-blue-500 mt-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cost Summary & Actions */}
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="text-base text-accent-3">Your Gas:</div>
              <div className="text-base font-bold text-accent">{playerGas}</div>
            </div>
            <div className="flex justify-between items-center mb-3">
              <div className="text-base text-accent-3">Evolution Cost:</div>
              <div className={cn(
                'text-base font-bold',
                canAfford ? 'text-green-400' : 'text-red-400'
              )}>
                - {totalCost}
              </div>
            </div>
            <div className="border-t-2 border-accent-6 my-3"></div>
            <div className="flex justify-between items-center font-bold text-lg">
              <div className="text-accent-3">Remaining Gas:</div>
              <div className={cn(canAfford ? 'text-green-400' : 'text-red-400')}>
                {playerGas - totalCost}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={onSkip}
              className="flex-1 py-3 text-base font-semibold bg-accent-6 text-accent-2 rounded-lg hover:bg-accent-5 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleEvolve}
              disabled={selectedTraits.length === 0 || !canAfford}
              className={cn(
                'flex-1 py-3 text-base font-semibold rounded-lg transition-colors flex items-center justify-center gap-2',
                selectedTraits.length > 0 && canAfford
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-accent-5 text-accent-4 cursor-not-allowed'
              )}
            >
              <Zap className="w-5 h-5" />
              Evolve ({totalCost} Gas)
            </button>
          </div>
          {!canAfford && selectedTraits.length > 0 && (
            <p className="text-sm text-red-400 mt-3 text-center">
              Not enough gas! Select fewer traits or skip.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
