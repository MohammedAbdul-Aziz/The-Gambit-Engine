// Piece types
export type PieceType = 'PAWN' | 'KNIGHT' | 'BISHOP' | 'ROOK' | 'QUEEN' | 'KING';

export type PieceColor = 'WHITE' | 'BLACK';

export type TraitName = 
  | 'FORWARD_STEP'
  | 'LEAP'
  | 'DIAGONAL'
  | 'STRAIGHT'
  | 'COMBINED'
  | 'ADJACENT'
  | 'EXTENDED_RANGE'
  | 'PHANTOM_LEAP'
  | 'DOUBLE_MOVE'
  | 'TELEPORT';

// Gas costs for traits
export const TRAIT_GAS_COSTS: Record<PieceType, number> = {
  PAWN: 1,
  KNIGHT: 3,
  BISHOP: 3,
  ROOK: 5,
  QUEEN: 10,
  KING: 0,
};

export const TRAIT_DESCRIPTIONS: Record<TraitName, string> = {
  FORWARD_STEP: 'Can move one step forward.',
  LEAP: 'Can jump over other pieces.',
  DIAGONAL: 'Can move any number of squares diagonally.',
  STRAIGHT: 'Can move any number of squares horizontally or vertically.',
  COMBINED: 'Combines the power of a Rook and a Bishop.',
  ADJACENT: 'Can move to any adjacent square.',
  EXTENDED_RANGE: 'Increases the movement range of a piece.',
  PHANTOM_LEAP: 'Can move like a Knight, but also passes through pieces.',
  DOUBLE_MOVE: 'Can move two squares on its first move.',
  TELEPORT: 'Can move to any empty square on the board.',
};

export const STARTING_GAS = 10;

// Piece interface
export interface Piece {
  id: number;
  pieceType: PieceType;
  color: PieceColor;
  position: Position;
  isAlive: boolean;
  owner: string;
  gameId: number;
  traits: Trait[];
  complexity: number;
  generation: number;
}

export interface Trait {
  name: TraitName;
  cost: number;
  isHidden: boolean;
}

export interface Position {
  file: number; // 0-7 (a-h)
  rank: number; // 0-7 (1-8)
}

export interface Move {
  pieceId: number;
  from: Position;
  to: Position;
  isSpecial: boolean;
  specialData?: SpecialMove;
}

export type SpecialMove = 
  | 'NONE'
  | 'CASTLE_KING'
  | 'CASTLE_QUEEN'
  | 'EN_PASSANT'
  | 'PROMOTION';

// Game state
export interface GameState {
  id: number;
  playerWhite: string;
  playerBlack: string;
  currentTurn: string;
  moveCount: number;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner?: string;
  gasWhite: number;
  gasBlack: number;
}

// Inventory
export interface InventoryPiece {
  id: number;
  owner: string;
  baseType: PieceType;
  traits: Trait[];
  gamesPlayed: number;
  capturesMade: number;
  evolutionCount: number;
  name: string;
  createdAt: number;
  lastUsed: number;
  isAvailable: boolean;
  isLocked: boolean;
  rarity: PieceRarity;
}

export type PieceRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface PlayerInventory {
  owner: string;
  pieceIds: number[];
  maxSlots: number;
  usedSlots: number;
}

// ELO
export interface ELOData {
  playerAddress: string;
  currentElo: number;
  highestElo: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winStreak: number;
  bestWinStreak: number;
}

export type OpponentType = 'HUMAN' | 'AI' | 'ANY';

export interface MatchmakingRequest {
  player: string;
  playerElo: number;
  preferredOpponent: OpponentType;
  minElo: number;
  maxElo: number;
  queuedAt: number;
}

// Bot configuration
export interface BotConfig {
  botId: number;
  baseElo: number;
  aggression: number;
  calculationDepth: number;
  errorRate: number;
  openingBook: boolean;
  endgameTable: boolean;
}

// Capture data
export interface CaptureData {
  gameId: number;
  attackerId: number;
  defenderId: number;
  attackerType: PieceType;
  defenderType: PieceType;
  turn: number;
}

// Evolution
export interface EvolutionRequest {
  gameId: number;
  pieceId: number;
  capturedPieceType: PieceType;
  traitsToInherit: TraitName[];
  gasCost: number;
}

// Events
export interface GameEvent {
  type: EventType;
  data: any;
  timestamp: number;
}

export type EventType =
  | 'MOVE_MADE'
  | 'CAPTURE_MADE'
  | 'EVOLUTION_REQUESTED'
  | 'EVOLUTION_SKIPPED'
  | 'GAME_STARTED'
  | 'GAME_ENDED'
  | 'PLAYER_QUEUED'
  | 'MATCH_FOUND';

// API Types
export interface CreateGameRequest {
  playerWhite: string;
  config: GameConfig;
}

export interface GameConfig {
  maxComplexity: number;
  ghostEnabled: boolean;
  ghostCount: number;
  zkFogEnabled: boolean;
  timeControl: TimeControl;
}

export interface TimeControl {
  initialTime: number;
  increment: number;
}

export interface JoinGameRequest {
  gameId: number;
  playerBlack: string;
}

export interface MakeMoveRequest {
  gameId: number;
  move: Move;
}

export interface SaveToInventoryRequest {
  gameId: number;
  pieceId: number;
  customName: string;
}

export interface DeployInventoryPieceRequest {
  gameId: number;
  inventoryPieceId: number;
  startingPosition: Position;
}

export interface QueueForMatchRequest {
  preferredOpponent: OpponentType;
}

// Response types
export interface GameResponse {
  game: GameState;
  pieces: Piece[];
}

export interface PlayerStats {
  elo: ELOData;
  inventory: PlayerInventory;
  pieces: InventoryPiece[];
}

export interface MatchFoundResponse {
  gameId: number;
  opponent: string;
  opponentElo: number;
  isBot: boolean;
  botLevel?: number;
}
