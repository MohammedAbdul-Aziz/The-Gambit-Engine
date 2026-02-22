"""
Matchmaking API Routes - Handle queue management and match finding
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict, Any
import logging

from models.schemas import (
    MatchmakingRequest, MatchFound, QueueStatus, APIResponse,
)
from services.matchmaking_service import MatchmakingService

logger = logging.getLogger(__name__)

router = APIRouter()

# Service instance (would be injected via dependency in production)
matchmaking_service: Optional[MatchmakingService] = None


def get_matchmaking_service() -> MatchmakingService:
    """Get matchmaking service instance"""
    global matchmaking_service
    if matchmaking_service is None:
        matchmaking_service = MatchmakingService()
    return matchmaking_service


@router.post("/queue", response_model=APIResponse)
async def join_queue(
    request: MatchmakingRequest,
    service: MatchmakingService = Depends(get_matchmaking_service),
):
    """Join the matchmaking queue"""
    try:
        status = await service.queue_player(request)
        
        return APIResponse(
            success=True,
            message="Joined matchmaking queue",
            data={"queue_status": status},
        )
    except Exception as e:
        logger.error(f"Failed to join queue: {e}")
        raise HTTPException(status_code=500, detail="Failed to join queue")


@router.post("/queue/cancel", response_model=APIResponse)
async def cancel_queue(
    player_address: str,
    service: MatchmakingService = Depends(get_matchmaking_service),
):
    """Leave the matchmaking queue"""
    try:
        success = await service.cancel_queue(player_address)
        
        if not success:
            raise HTTPException(status_code=404, detail="Player not in queue")
        
        return APIResponse(
            success=True,
            message="Left matchmaking queue",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to cancel queue: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel queue")


@router.get("/queue/status", response_model=QueueStatus)
async def get_queue_status(
    player_address: str,
    service: MatchmakingService = Depends(get_matchmaking_service),
):
    """Get current queue status"""
    status = await service.get_queue_status(player_address)
    
    if status is None:
        raise HTTPException(status_code=404, detail="Player not in queue")
    
    return status


@router.get("/match/check", response_model=Optional[MatchFound])
async def check_for_match(
    player_address: str,
    service: MatchmakingService = Depends(get_matchmaking_service),
):
    """Check if a match has been found"""
    match = service.get_match_result(player_address)
    return match


@router.post("/match/accept", response_model=APIResponse)
async def accept_match(
    player_address: str,
    game_id: int,
    service: MatchmakingService = Depends(get_matchmaking_service),
):
    """Accept a found match"""
    match = service.get_match_result(player_address)
    
    if match is None or match.game_id != game_id:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # In production, would confirm both players ready
    
    return APIResponse(
        success=True,
        message="Match accepted",
        data={"game_id": game_id},
    )


@router.get("/stats", response_model=Dict[str, Any])
async def get_matchmaking_stats(
    service: MatchmakingService = Depends(get_matchmaking_service),
):
    """Get matchmaking statistics"""
    return {
        "human_queue_size": len(service.human_queue),
        "ai_queue_size": len(service.ai_queue),
        "any_queue_size": len(service.any_queue),
        "active_games": len(service.active_games),
        "avg_wait_time_seconds": 15,  # Would calculate from actual data
    }
