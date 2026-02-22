"""
Pydantic models and schemas for The Gambit Engine API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


# ============ Enums ============

class PieceType(str, Enum):
    PAWN = "PAWN"
    KNIGHT = "KNIGHT"
    BISHOP = "BISHOP"
    ROOK = "ROOK"
    QUEEN = "QUEEN"
    KING = "KING"


class PieceColor(str, Enum):
    WHITE = "WHITE"
    BLACK = "BLACK"


class TraitName(str, Enum):
    FORWARD_STEP = "FORWARD_STEP"
    LEAP = "LEAP"
    DIAGONAL = "DIAGONAL"
    STRAIGHT = "STRAIGHT"
    COMBINED = "COMBINED"
    ADJACENT = "ADJACENT"
    EXTENDED_RANGE = "EXTENDED_RANGE"
    PHANTOM_LEAP = "PHANTOM_LEAP"
    DOUBLE_MOVE = "DOUBLE_MOVE"
    TELEPORT = "TELEPORT"
    HIDDEN_ABILITY = "HIDDEN_ABILITY"
    ETHEREAL = "ETHEREAL"
    AUTONOMOUS_AI = "AUTONOMOUS_AI"


class OpponentType(str, Enum):
    HUMAN = "HUMAN"
    AI = "AI"
    ANY = "ANY"


class GameStatus(str, Enum):
    WAITING = "WAITING"
    PLAYING = "PLAYING"
    COMPLETED = "COMPLETED"


class GameEndReason(str, Enum):
    CHECKMATE = "CHECKMATE"
    STALEMATE = "STALEMATE"
    RESIGNATION = "RESIGNATION"
    DRAW = "DRAW"
    TIMEOUT = "TIMEOUT"


# ============ Base Models ============

class Position(BaseModel):
    file: int = Field(..., ge=0, le=7, description="File (0-7, a-h)")
    rank: int = Field(..., ge=0, le=7, description="Rank (0-7, 1-8)")


class Trait(BaseModel):
    name: TraitName
    cost: int
    is_hidden: bool = False


# ============ Game Models ============

class GameConfig(BaseModel):
    max_complexity: int = 100
    ghost_enabled: bool = False
    ghost_count: int = 0
    zk_fog_enabled: bool = True
    starting_gas: int = 10


class GameState(BaseModel):
    id: int
    player_white: str
    player_black: str
    current_turn: str
    move_count: int
    is_check: bool = False
    is_checkmate: bool = False
    is_stalemate: bool = False
    winner: Optional[str] = None
    gas_white: int = 10
    gas_black: int = 10
    status: GameStatus = GameStatus.WAITING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_move_at: Optional[datetime] = None


class GameCreate(BaseModel):
    player_white: str
    config: Optional[GameConfig] = None


class GameJoin(BaseModel):
    player_black: str


class Move(BaseModel):
    piece_id: int
    from_pos: Position = Field(..., alias="from")
    to_pos: Position = Field(..., alias="to")
    is_special: bool = False
    special_data: Optional[str] = None
    
    class Config:
        populate_by_name = True


class MoveResult(BaseModel):
    success: bool
    is_capture: bool
    captured_piece_id: Optional[int] = None
    new_position: Position
    evolution_pending: bool = False


# ============ Piece Models ============

class Piece(BaseModel):
    id: int
    piece_type: PieceType
    color: PieceColor
    position: Position
    is_alive: bool = True
    owner: str
    game_id: int
    traits: List[Trait] = []
    complexity: int = 0
    generation: int = 1
    capture_count: int = 0


class PieceCreate(BaseModel):
    game_id: int
    piece_type: PieceType
    color: PieceColor
    position: Position
    owner: str


# ============ Player Models ============

class ELOData(BaseModel):
    player_address: str
    current_elo: int = 1200
    highest_elo: int = 1200
    games_played: int = 0
    wins: int = 0
    losses: int = 0
    draws: int = 0
    win_streak: int = 0
    best_win_streak: int = 0


class PlayerStats(BaseModel):
    address: str
    elo: ELOData
    total_games: int = 0
    total_wins: int = 0
    win_rate: float = 0.0


# ============ Inventory Models ============

class InventoryPiece(BaseModel):
    id: int
    owner: str
    base_type: PieceType
    traits: List[Trait] = []
    games_played: int = 0
    captures_made: int = 0
    evolution_count: int = 0
    name: str = ""
    is_available: bool = True
    is_locked: bool = False
    rarity: str = "COMMON"


class Inventory(BaseModel):
    owner: str
    pieces: List[InventoryPiece]
    max_slots: int = 10
    used_slots: int = 0


# ============ Matchmaking Models ============

class MatchmakingRequest(BaseModel):
    player: str
    preferred_opponent: OpponentType = OpponentType.ANY
    min_elo: int = 0
    max_elo: int = 3000


class MatchFound(BaseModel):
    game_id: int
    opponent: str
    opponent_elo: int
    is_bot: bool
    bot_level: Optional[int] = None
    color: PieceColor = PieceColor.WHITE


class QueueStatus(BaseModel):
    is_queued: bool
    queue_position: int = 0
    estimated_wait_seconds: int = 0
    preferred_opponent: OpponentType = OpponentType.ANY


# ============ Evolution Models ============

class EvolutionRequest(BaseModel):
    game_id: int
    piece_id: int
    captured_piece_type: PieceType
    traits_to_inherit: List[TraitName]


class EvolutionOptions(BaseModel):
    attacker_type: PieceType
    defender_type: PieceType
    available_traits: List[TraitName]
    complexity_cost: Dict[str, int]
    can_afford: List[bool]


class CaptureData(BaseModel):
    game_id: int
    attacker_id: int
    defender_id: int
    attacker_type: PieceType
    defender_type: PieceType
    turn: int


# ============ API Response Models ============

class HealthCheck(BaseModel):
    status: str
    services: Dict[str, str]


class ServerStatus(BaseModel):
    name: str
    version: str
    status: str
    description: str


class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    has_more: bool
