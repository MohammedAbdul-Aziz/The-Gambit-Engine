"""
Inventory API Routes - Handle piece inventory management
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Optional
import logging

from models.schemas import (
    Inventory, InventoryPiece, Piece, Trait, TraitName,
    PieceType, APIResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage (would use database in production)
inventory_db: Dict[str, Inventory] = {}


def get_or_create_inventory(owner: str) -> Inventory:
    """Get existing inventory or create new one"""
    if owner not in inventory_db:
        inventory_db[owner] = Inventory(
            owner=owner,
            pieces=[],
            max_slots=10,
        )
    return inventory_db[owner]


@router.get("/{owner}", response_model=Inventory)
async def get_inventory(owner: str):
    """Get player's inventory"""
    inventory = get_or_create_inventory(owner)
    inventory.used_slots = len(inventory.pieces)
    return inventory


@router.post("/{owner}/save-piece", response_model=APIResponse)
async def save_piece_to_inventory(
    owner: str,
    piece_data: Dict,
):
    """Save a piece from completed game to inventory"""
    inventory = get_or_create_inventory(owner)
    
    if len(inventory.pieces) >= inventory.max_slots:
        raise HTTPException(status_code=400, detail="Inventory full")
    
    # Create inventory piece
    inventory_piece = InventoryPiece(
        id=len(inventory.pieces) + 1000,  # Unique ID
        owner=owner,
        base_type=PieceType(piece_data.get("base_type", "PAWN")),
        traits=[
            Trait(
                name=TraitName(t.get("name", "FORWARD_STEP")),
                cost=t.get("cost", 1),
                is_hidden=t.get("is_hidden", False),
            )
            for t in piece_data.get("traits", [])
        ],
        games_played=piece_data.get("games_played", 1),
        captures_made=piece_data.get("captures_made", 0),
        evolution_count=piece_data.get("evolution_count", 0),
        name=piece_data.get("name", ""),
        rarity=piece_data.get("rarity", "COMMON"),
    )
    
    inventory.pieces.append(inventory_piece)
    inventory.used_slots = len(inventory.pieces)
    
    logger.info(f"Piece saved to inventory: owner={owner}, piece_id={inventory_piece.id}")
    
    return APIResponse(
        success=True,
        message="Piece saved to inventory",
        data={"piece": inventory_piece},
    )


@router.post("/{owner}/deploy-piece", response_model=APIResponse)
async def deploy_piece_from_inventory(
    owner: str,
    piece_id: int,
    game_id: int,
    position: Dict[str, int],
):
    """Deploy a piece from inventory to a new game"""
    inventory = get_or_create_inventory(owner)
    
    # Find piece
    piece = None
    piece_index = None
    for i, p in enumerate(inventory.pieces):
        if p.id == piece_id:
            piece = p
            piece_index = i
            break
    
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    if not piece.is_available:
        raise HTTPException(status_code=400, detail="Piece not available")
    
    if piece.is_locked:
        raise HTTPException(status_code=400, detail="Piece is locked")
    
    # In production, would call smart contract to deploy
    # For now, mark as unavailable
    piece.is_available = False
    piece.games_played += 1
    
    logger.info(f"Piece deployed: owner={owner}, piece_id={piece_id}, game_id={game_id}")
    
    return APIResponse(
        success=True,
        message="Piece deployed successfully",
        data={
            "piece": piece,
            "game_id": game_id,
            "position": position,
        },
    )


@router.post("/{owner}/lock-piece", response_model=APIResponse)
async def lock_piece(owner: str, piece_id: int):
    """Lock a piece to prevent deletion"""
    inventory = get_or_create_inventory(owner)
    
    piece = next((p for p in inventory.pieces if p.id == piece_id), None)
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    piece.is_locked = True
    
    logger.info(f"Piece locked: owner={owner}, piece_id={piece_id}")
    
    return APIResponse(
        success=True,
        message="Piece locked",
    )


@router.post("/{owner}/unlock-piece", response_model=APIResponse)
async def unlock_piece(owner: str, piece_id: int):
    """Unlock a piece"""
    inventory = get_or_create_inventory(owner)
    
    piece = next((p for p in inventory.pieces if p.id == piece_id), None)
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    piece.is_locked = False
    
    logger.info(f"Piece unlocked: owner={owner}, piece_id={piece_id}")
    
    return APIResponse(
        success=True,
        message="Piece unlocked",
    )


@router.delete("/{owner}/piece/{piece_id}", response_model=APIResponse)
async def delete_piece(owner: str, piece_id: int):
    """Delete a piece from inventory"""
    inventory = get_or_create_inventory(owner)
    
    piece = next((p for p in inventory.pieces if p.id == piece_id), None)
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    if piece.is_locked:
        raise HTTPException(status_code=400, detail="Cannot delete locked piece")
    
    inventory.pieces = [p for p in inventory.pieces if p.id != piece_id]
    inventory.used_slots = len(inventory.pieces)
    
    logger.info(f"Piece deleted: owner={owner}, piece_id={piece_id}")
    
    return APIResponse(
        success=True,
        message="Piece deleted",
    )


@router.post("/{owner}/rename-piece", response_model=APIResponse)
async def rename_piece(owner: str, piece_id: int, new_name: str):
    """Rename a piece"""
    inventory = get_or_create_inventory(owner)
    
    piece = next((p for p in inventory.pieces if p.id == piece_id), None)
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    old_name = piece.name
    piece.name = new_name
    
    logger.info(f"Piece renamed: owner={owner}, piece_id={piece_id}, '{old_name}' -> '{new_name}'")
    
    return APIResponse(
        success=True,
        message="Piece renamed",
        data={"old_name": old_name, "new_name": new_name},
    )


@router.get("/{owner}/piece/{piece_id}", response_model=InventoryPiece)
async def get_piece_details(owner: str, piece_id: int):
    """Get detailed information about a specific piece"""
    inventory = get_or_create_inventory(owner)
    
    piece = next((p for p in inventory.pieces if p.id == piece_id), None)
    if piece is None:
        raise HTTPException(status_code=404, detail="Piece not found")
    
    return piece


@router.get("/{owner}/stats", response_model=Dict)
async def get_inventory_stats(owner: str):
    """Get inventory statistics"""
    inventory = get_or_create_inventory(owner)
    
    total_captures = sum(p.captures_made for p in inventory.pieces)
    total_evolutions = sum(p.evolution_count for p in inventory.pieces)
    
    rarity_counts = {}
    for piece in inventory.pieces:
        rarity = piece.rarity
        rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1
    
    return {
        "owner": owner,
        "total_pieces": len(inventory.pieces),
        "max_slots": inventory.max_slots,
        "available_slots": inventory.max_slots - len(inventory.pieces),
        "total_captures": total_captures,
        "total_evolutions": total_evolutions,
        "rarity_distribution": rarity_counts,
        "locked_pieces": sum(1 for p in inventory.pieces if p.is_locked),
    }
