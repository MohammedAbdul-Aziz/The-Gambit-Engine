"""
Players API Routes - Handle player stats, ELO, and profiles
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Optional
import logging

from models.schemas import (
    PlayerStats, ELOData, APIResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage (would use database in production)
players_db: Dict[str, PlayerStats] = {}


def get_or_create_player(address: str) -> PlayerStats:
    """Get existing player or create new one"""
    if address not in players_db:
        players_db[address] = PlayerStats(
            address=address,
            elo=ELOData(player_address=address),
        )
    return players_db[address]


@router.get("/{address}", response_model=PlayerStats)
async def get_player_stats(address: str):
    """Get player statistics"""
    player = get_or_create_player(address)
    return player


@router.get("/{address}/elo", response_model=ELOData)
async def get_player_elo(address: str):
    """Get player ELO rating"""
    player = get_or_create_player(address)
    return player.elo


@router.post("/{address}/register", response_model=APIResponse)
async def register_player(address: str):
    """Register a new player"""
    player = get_or_create_player(address)
    
    logger.info(f"Player registered: {address}")
    
    return APIResponse(
        success=True,
        message="Player registered successfully",
        data={"player": player},
    )


@router.post("/{address}/update-elo", response_model=APIResponse)
async def update_player_elo(address: str, new_elo: int):
    """Update player ELO after game"""
    player = get_or_create_player(address)
    
    old_elo = player.elo.current_elo
    player.elo.current_elo = new_elo
    
    if new_elo > player.elo.highest_elo:
        player.elo.highest_elo = new_elo
    
    logger.info(f"Player {address} ELO updated: {old_elo} -> {new_elo}")
    
    return APIResponse(
        success=True,
        message="ELO updated successfully",
        data={"old_elo": old_elo, "new_elo": new_elo},
    )


@router.post("/{address}/game-result", response_model=APIResponse)
async def record_game_result(
    address: str,
    result: str,  # "win", "loss", "draw"
    opponent_elo: int,
    elo_change: int,
):
    """Record game result and update stats"""
    player = get_or_create_player(address)
    
    player.elo.games_played += 1
    player.elo.current_elo += elo_change
    
    if player.elo.current_elo > player.elo.highest_elo:
        player.elo.highest_elo = player.elo.current_elo
    
    if result == "win":
        player.elo.wins += 1
        player.elo.win_streak += 1
        if player.elo.win_streak > player.elo.best_win_streak:
            player.elo.best_win_streak = player.elo.win_streak
    elif result == "loss":
        player.elo.losses += 1
        player.elo.win_streak = 0
    else:  # draw
        player.elo.draws += 1
        player.elo.win_streak = 0
    
    # Update win rate
    if player.elo.games_played > 0:
        player.win_rate = player.elo.wins / player.elo.games_played
    
    player.total_games = player.elo.games_played
    player.total_wins = player.elo.wins
    
    logger.info(f"Game result recorded for {address}: {result}, ELO change: {elo_change}")
    
    return APIResponse(
        success=True,
        message="Game result recorded",
        data={"player": player},
    )


@router.get("/{address}/history")
async def get_player_history(address: str, limit: int = 20):
    """Get player's game history"""
    # In production, would query database
    return {
        "address": address,
        "games": [],
        "total": 0,
    }


@router.get("/leaderboard", response_model=Dict)
async def get_leaderboard(limit: int = 100):
    """Get global leaderboard"""
    # Sort players by ELO
    sorted_players = sorted(
        players_db.values(),
        key=lambda p: p.elo.current_elo,
        reverse=True,
    )[:limit]
    
    return {
        "leaderboard": [
            {
                "rank": i + 1,
                "address": p.address,
                "elo": p.elo.current_elo,
                "wins": p.elo.wins,
                "games_played": p.elo.games_played,
                "win_rate": p.win_rate,
            }
            for i, p in enumerate(sorted_players)
        ],
        "total_players": len(players_db),
    }
