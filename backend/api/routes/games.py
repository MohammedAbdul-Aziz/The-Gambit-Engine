"""
Games API Routes - Handle game creation, moves, and state
"""

from fastapi import APIRouter, HTTPException, Depends, WebSocket
from typing import List, Optional, Dict, Any
import logging

from models.schemas import (
    GameState, GameCreate, GameJoin, Move, MoveResult,
    Piece, CaptureData, EvolutionRequest, EvolutionOptions,
    APIResponse, PaginatedResponse, Position,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage (would use database in production)
games_db: Dict[int, GameState] = {}
pieces_db: Dict[int, List[Piece]] = {}
captures_db: Dict[int, CaptureData] = {}


@router.post("/", response_model=APIResponse)
async def create_game(game_data: GameCreate):
    """Create a new game"""
    game_id = len(games_db) + 1
    
    game_state = GameState(
        id=game_id,
        player_white=game_data.player_white,
        player_black=game_data.player_white,  # Until someone joins
        current_turn=game_data.player_white,
        move_count=0,
        gas_white=game_data.config.starting_gas if game_data.config else 10,
        gas_black=game_data.config.starting_gas if game_data.config else 10,
    )
    
    games_db[game_id] = game_state
    pieces_db[game_id] = []
    
    logger.info(f"Game created: {game_id} by {game_data.player_white}")
    
    return APIResponse(
        success=True,
        message="Game created successfully",
        data={"game_id": game_id, "game": game_state},
    )


@router.post("/{game_id}/join", response_model=APIResponse)
async def join_game(game_id: int, join_data: GameJoin):
    """Join an existing game"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games_db[game_id]
    
    if game.player_black != game.player_white:
        raise HTTPException(status_code=400, detail="Game already full")
    
    game.player_black = join_data.player_black
    game.status = "PLAYING"
    
    logger.info(f"Player {join_data.player_black} joined game {game_id}")
    
    return APIResponse(
        success=True,
        message="Joined game successfully",
        data={"game": game},
    )


@router.get("/{game_id}", response_model=GameState)
async def get_game_state(game_id: int):
    """Get current game state"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return games_db[game_id]


@router.post("/{game_id}/move", response_model=MoveResult)
async def make_move(game_id: int, move: Move):
    """Execute a move in the game"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games_db[game_id]
    
    # Validate turn
    # In production, would verify signature
    
    # Check for capture
    is_capture = False
    captured_piece_id = None
    
    # Simulate move processing
    # In production, would call smart contract
    
    game.move_count += 1
    
    # Switch turns
    game.current_turn = game.player_black if game.current_turn == game.player_white else game.player_white
    game.last_move_at = None  # Would be datetime.utcnow()
    
    # Check for evolution
    evolution_pending = is_capture
    
    return MoveResult(
        success=True,
        is_capture=is_capture,
        captured_piece_id=captured_piece_id,
        new_position=move.to_pos,
        evolution_pending=evolution_pending,
    )


@router.get("/{game_id}/pieces", response_model=List[Piece])
async def get_game_pieces(game_id: int):
    """Get all pieces in a game"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    return pieces_db.get(game_id, [])


@router.get("/{game_id}/valid-moves/{piece_id}", response_model=List[Position])
async def get_valid_moves(game_id: int, piece_id: int):
    """Get valid moves for a piece"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # In production, would query smart contract
    # Return mock valid moves
    return [
        {"file": 2, "rank": 3},
        {"file": 3, "rank": 3},
        {"file": 4, "rank": 3},
    ]


@router.post("/{game_id}/evolution", response_model=APIResponse)
async def request_evolution(game_id: int, evolution: EvolutionRequest):
    """Request evolution after capture"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # In production, would call smart contract
    logger.info(f"Evolution requested in game {game_id}: piece {evolution.piece_id}")
    
    return APIResponse(
        success=True,
        message="Evolution applied successfully",
    )


@router.post("/{game_id}/evolution/skip", response_model=APIResponse)
async def skip_evolution(game_id: int, piece_id: int):
    """Skip evolution after capture"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    logger.info(f"Evolution skipped in game {game_id}: piece {piece_id}")
    
    return APIResponse(
        success=True,
        message="Evolution skipped",
    )


@router.post("/{game_id}/resign", response_model=APIResponse)
async def resign_game(game_id: int, player: str):
    """Resign from a game"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    game = games_db[game_id]
    game.winner = game.player_black if player == game.player_white else game.player_white
    game.status = "COMPLETED"
    game.is_checkmate = True
    
    logger.info(f"Player {player} resigned from game {game_id}")
    
    return APIResponse(
        success=True,
        message="Game resigned",
        data={"winner": game.winner},
    )


@router.post("/{game_id}/draw", response_model=APIResponse)
async def offer_draw(game_id: int, player: str):
    """Offer/accept draw"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # In production, would track draw offers
    game.status = "COMPLETED"
    game.is_stalemate = True
    
    logger.info(f"Draw in game {game_id}")
    
    return APIResponse(
        success=True,
        message="Game ended in draw",
    )


@router.get("/{game_id}/history", response_model=PaginatedResponse)
async def get_move_history(game_id: int, page: int = 1, page_size: int = 20):
    """Get move history for a game"""
    if game_id not in games_db:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # In production, would query database
    moves = []
    
    return PaginatedResponse(
        items=moves,
        total=len(moves),
        page=page,
        page_size=page_size,
        has_more=False,
    )
