import { GraphQLClient } from 'graphql-request';
import {
  Piece,
  GameState,
  InventoryPiece,
  ELOData,
  Move,
  TraitName,
  OpponentType,
} from '@/types';

const TORII_URL = process.env.NEXT_PUBLIC_TORII_URL || 'http://localhost:8080/graphql';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

const client = new GraphQLClient(TORII_URL);

// GraphQL Queries
const GET_PIECES_QUERY = `
  query GetPieces($gameId: BigInt!) {
    pieces(where: { gameId: $gameId, isAlive: true }) {
      id
      pieceType
      color
      position {
        file
        rank
      }
      isAlive
      owner
      gameId
      complexity
      generation
    }
  }
`;

const GET_GAME_STATE_QUERY = `
  query GetGameState($gameId: ID!) {
      game(id: $gameId) {
      id
      playerWhite
      playerBlack
      currentTurn
      moveCount
      isCheck
      isCheckmate
      isStalemate
      winner
    }
  }
`;

const GET_PLAYER_INVENTORY_QUERY = `
  query GetPlayerInventory($owner: String!) {
    inventoryPieces(where: { owner: $owner, isAvailable: true }) {
      id
      owner
      baseType
      gamesPlayed
      capturesMade
      evolutionCount
      name
      isAvailable
      isLocked
    }
  }
`;

const GET_PLAYER_ELO_QUERY = `
  query GetPlayerELO($playerAddress: String!) {
    eloData: player(id: $playerAddress) {
      currentElo
      highestElo
      gamesPlayed
      wins
      losses
      draws
      winStreak
      bestWinStreak
    }
  }
`;

// API Functions
export async function getGamePieces(gameId: number): Promise<Piece[]> {
  try {
    const data = await client.request(GET_PIECES_QUERY, { gameId });
    return (data as any).pieces || [];
  } catch (error) {
    console.error('Error fetching pieces:', error);
    return [];
  }
}

export async function getGameState(gameId: number): Promise<GameState | null> {
  try {
    const data = await client.request(GET_GAME_STATE_QUERY, { gameId });
    return (data as any).game || null;
  } catch (error) {
    console.error('Error fetching game state:', error);
    return null;
  }
}

export async function getPlayerInventory(playerAddress: string): Promise<InventoryPiece[]> {
  try {
    const data = await client.request(GET_PLAYER_INVENTORY_QUERY, { owner: playerAddress });
    return (data as any).inventoryPieces || [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
}

export async function getPlayerELO(playerAddress: string): Promise<ELOData | null> {
  try {
    const data = await client.request(GET_PLAYER_ELO_QUERY, { playerAddress });
    return (data as any).eloData || null;
  } catch (error) {
    console.error('Error fetching ELO:', error);
    return null;
  }
}

// Contract interaction functions (using starknet.js)
export async function createGame(playerWhite: string): Promise<number> {
  // This would interact with the smart contract
  // For now, return a mock game ID
  console.log('Creating game for:', playerWhite);
  return 1;
}

export async function joinGame(gameId: number, playerBlack: string): Promise<void> {
  console.log('Joining game:', gameId, playerBlack);
}

export async function makeMove(gameId: number, move: Move): Promise<void> {
  console.log('Making move:', gameId, move);
}

export async function requestEvolution(
  gameId: number,
  pieceId: number,
  capturedPieceType: string,
  traits: TraitName[]
): Promise<void> {
  console.log('Requesting evolution:', { gameId, pieceId, capturedPieceType, traits });
}

export async function skipEvolution(gameId: number, pieceId: number): Promise<void> {
  console.log('Skipping evolution:', gameId, pieceId);
}

export async function saveToInventory(
  gameId: number,
  pieceId: number,
  customName: string
): Promise<void> {
  console.log('Saving to inventory:', gameId, pieceId, customName);
}

export async function deployInventoryPiece(
  gameId: number,
  inventoryPieceId: number,
  position: { file: number; rank: number }
): Promise<number> {
  console.log('Deploying inventory piece:', gameId, inventoryPieceId, position);
  return 100; // Return new piece ID
}

export async function queueForMatch(opponentType: OpponentType): Promise<void> {
  console.log('Queuing for match:', opponentType);
}

export async function cancelMatchmaking(): Promise<void> {
  console.log('Canceling matchmaking');
}

export async function registerPlayer(playerAddress: string): Promise<void> {
  console.log('Registering player:', playerAddress);
}
