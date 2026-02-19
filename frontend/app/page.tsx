'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from '@starknet-react/core';
import { useToaster } from '@/hooks/useToaster';
import { Menu } from '@/app/views/Menu';
import { Playing } from '@/app/views/Playing';
import { InventoryView } from '@/app/views/InventoryView';
import { Stats } from '@/app/views/Stats';
import { EvolutionPrompt } from '@/components/game/EvolutionPrompt';
import { Piece, GameState, InventoryPiece, ELOData, CaptureData, Position } from '@/types';
import { getGamePieces, getGameState, getPlayerInventory, getPlayerELO, makeMove, requestEvolution, skipEvolution } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Swords, Package, BarChart } from 'lucide-react';

type GameView = 'MENU' | 'PLAYING' | 'INVENTORY' | 'STATS';
type GamePhase = 'SELECT_PIECE' | 'SELECT_TARGET' | 'EVOLUTION_DECISION';

export default function GamePage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { showToast } = useToaster();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Game state
  const [view, setView] = useState<GameView>('MENU');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [inventory, setInventory] = useState<InventoryPiece[]>([]);
  const [playerElo, setPlayerElo] = useState<ELOData | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  // Game interaction
  const [selectedPieceId, setSelectedPieceId] = useState<number | undefined>();
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [phase, setPhase] = useState<GamePhase>('SELECT_PIECE');
  
  // Evolution
  const [pendingCapture, setPendingCapture] = useState<CaptureData | null>(null);
  const [showEvolutionPrompt, setShowEvolutionPrompt] = useState(false);
  
  // Matchmaking
  const [isQueued, setIsQueued] = useState(false);
  const [queueTime, setQueueTime] = useState(0);

  // Load player data
  useEffect(() => {
    if (address) {
      loadPlayerData(address);
    }
  }, [address]);

  // Load game state periodically when playing
  useEffect(() => {
    if (view === 'PLAYING' && gameState) {
      const interval = setInterval(() => {
        refreshGameState();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [view, gameState]);

  const loadPlayerData = async (playerAddress: string) => {
    const [inv, elo] = await Promise.all([
      getPlayerInventory(playerAddress),
      getPlayerELO(playerAddress),
    ]);
    setInventory(inv);
    if (elo) setPlayerElo(elo);
  };

  const refreshGameState = async () => {
    if (!gameState) return;
    const [newGameState, newPieces] = await Promise.all([
      getGameState(gameState.id),
      getGamePieces(gameState.id),
    ]);
    if (newGameState) setGameState(newGameState);
    setPieces(newPieces);
    // In a real implementation, you'd fetch move history from the API
    setMoveHistory([...moveHistory, `Move ${moveHistory.length + 1}`]);
  };

  const handleQueue = async (opponentType: 'HUMAN' | 'AI' | 'ANY') => {
    if (!address) return;
    
    setIsQueued(true);
    setQueueTime(Date.now());
    showToast(`Queued for a game vs ${opponentType}`, 'info');
    
    // Simulate matchmaking (would be real in production)
    setTimeout(() => {
      startGame();
      setIsQueued(false);
    }, 3000);
  };

  const handleCancelQueue = () => {
    setIsQueued(false);
  };
  
  const startGame = async () => {
    if (!address) return;
    
    // Create or join game (would be real in production)
    const mockGameState: GameState = {
      id: 1,
      playerWhite: address,
      playerBlack: '0x opponent',
      currentTurn: address,
      moveCount: 0,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      gasWhite: 10,
      gasBlack: 10,
    };
    
    setGameState(mockGameState);
    setView('PLAYING');
    setMoveHistory([]);
    
    // Load initial pieces
    const initialPieces = await getGamePieces(1);
    setPieces(initialPieces);
  };

  const handlePieceClick = (pieceId: number) => {
    const piece = pieces.find((p) => p.id === pieceId);
    if (!piece || piece.owner !== address) return;
    
    setSelectedPieceId(pieceId);
    setPhase('SELECT_TARGET');
    
    // Calculate valid moves (would be real in production)
    setValidMoves([
      { file: 2, rank: 3 },
      { file: 3, rank: 3 },
    ]);
  };

  const handleSquareClick = async (position: Position) => {
    if (phase !== 'SELECT_TARGET' || !selectedPieceId || !gameState) return;
    
    // Check if move is valid
    const isValid = validMoves.some(
      (m) => m.file === position.file && m.rank === position.rank
    );
    
    if (!isValid) {
      setSelectedPieceId(undefined);
      setValidMoves([]);
      setPhase('SELECT_PIECE');
      return;
    }
    
    // Make move
    const piece = pieces.find((p) => p.id === selectedPieceId);
    const targetPiece = pieces.find(
      (p) => p.position.file === position.file && p.position.rank === position.rank
    );
    
    await makeMove(gameState.id, {
      pieceId: selectedPieceId,
      from: piece!.position,
      to: position,
      isSpecial: false,
    });
    
    // Check if capture
    if (targetPiece) {
      // Trigger evolution decision
      setPendingCapture({
        gameId: gameState.id,
        attackerId: selectedPieceId,
        defenderId: targetPiece.id,
        attackerType: piece!.pieceType,
        defenderType: targetPiece.pieceType,
        turn: gameState.moveCount,
      });
      setShowEvolutionPrompt(true);
    }
    
    setSelectedPieceId(undefined);
    setValidMoves([]);
    setPhase('SELECT_PIECE');
    
    // Refresh game state
    refreshGameState();
  };

  const handleEvolve = async (traits: any[]) => {
    if (!pendingCapture || !gameState) return;
    
    await requestEvolution(
      gameState.id,
      pendingCapture.attackerId,
      pendingCapture.defenderType,
      traits
    );
    
    setShowEvolutionPrompt(false);
    setPendingCapture(null);
    refreshGameState();
  };

  const handleSkipEvolution = async () => {
    if (!pendingCapture || !gameState) return;
    
    await skipEvolution(gameState.id, pendingCapture.attackerId);
    
    setShowEvolutionPrompt(false);
    setPendingCapture(null);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 bg-primary rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-accent mb-4">
            Connect Wallet to Play
          </h1>
          <p className="text-accent-3 mb-8">
            Please connect your Starknet wallet to start playing
          </p>
          <div className="flex justify-center gap-4">
            {isClient && connectors.length > 0 && connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                className="bg-accent text-primary px-6 py-2 rounded-md font-semibold hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!connector.available()}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-accent">
      {/* Header */}
      <header className="bg-primary shadow-lg border-b border-accent-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-accent">
            ♔ The Gambit Engine
          </h1>
          
          <div className="flex items-center gap-4">
            {playerElo && (
              <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg border border-accent-6">
                <span className="text-sm text-accent-3">ELO:</span>
                <span className="font-bold text-accent">{playerElo.currentElo}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setView('MENU')}
                className={cn(
                  'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
                  view === 'MENU' ? 'bg-accent text-primary' : 'bg-secondary text-accent hover:bg-accent-6'
                )}
              >
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">Play</span>
              </button>
              
              <button
                onClick={() => setView('INVENTORY')}
                className={cn(
                  'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
                  view === 'INVENTORY' ? 'bg-accent text-primary' : 'bg-secondary text-accent hover:bg-accent-6'
                )}
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Inventory</span>
              </button>

              <button
                onClick={() => setView('STATS')}
                className={cn(
                  'px-4 py-2 rounded-lg flex items-center gap-2 transition-colors',
                  view === 'STATS' ? 'bg-accent text-primary' : 'bg-secondary text-accent hover:bg-accent-6'
                )}
              >
                <BarChart className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'MENU' && (
          <Menu
            playerElo={playerElo!}
            inventory={inventory}
            address={address!}
            onQueue={handleQueue}
            onCancel={handleCancelQueue}
            isQueued={isQueued}
            queueTime={queueTime}
          />
        )}

        {view === 'PLAYING' && gameState && (
          <Playing
            pieces={pieces}
            selectedPieceId={selectedPieceId}
            validMoves={validMoves}
            onPieceClick={handlePieceClick}
            onSquareClick={handleSquareClick}
            gameState={gameState}
            playerElo={playerElo!}
            moveHistory={moveHistory}
          />
        )}

        {view === 'INVENTORY' && (
          <InventoryView inventory={inventory} />
        )}

        {view === 'STATS' && playerElo && (
          <Stats playerElo={playerElo} />
        )}
      </main>

      {/* Evolution Prompt */}
      {showEvolutionPrompt && pendingCapture && (
        <EvolutionPrompt
          attackerType={pendingCapture.attackerType}
          defenderType={pendingCapture.defenderType}
          playerGas={gameState?.gasWhite || 10}
          onEvolve={handleEvolve}
          onSkip={handleSkipEvolution}
        />
      )}
    </div>
  );
}
