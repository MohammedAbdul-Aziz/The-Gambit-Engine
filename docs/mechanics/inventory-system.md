# Inventory System

The Inventory System allows players to persist evolved pieces across matches, creating a collection of unique hybrid pieces that grow stronger over time.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    INVENTORY FLOW                           │
│                                                             │
│  During Match                                               │
│       │                                                     │
│       │ Piece evolves (gains traits)                        │
│       ▼                                                     │
│  ┌─────────────────┐                                       │
│  │ Evolved Piece   │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│           │ Match ends                                      │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ Save to         │                                       │
│  │ Inventory       │───→ Stored on-chain                   │
│  └─────────────────┘                                       │
│                                                             │
│  Before Next Match                                          │
│       │                                                     │
│       │ Select piece from inventory                         │
│       ▼                                                     │
│  ┌─────────────────┐                                       │
│  │ Deploy to Board │                                       │
│  └─────────────────┘                                       │
│                                                             │
│  During New Match                                           │
│       │                                                     │
│       │ Piece can evolve further                            │
│       ▼                                                     │
│  ┌─────────────────┐                                       │
│  │ Upgrade Existing│───→ Loop back to top                  │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Inventory Structure

### On-Chain Storage

```cairo
#[derive(Component, Drop, Serde)]
struct InventoryPiece {
    // Identification
    id: u32,
    owner: ContractAddress,
    
    // Piece data
    base_type: PieceType,
    inherited_traits: Array<Trait>,
    
    // Stats
    games_played: u32,
    captures_made: u32,
    total_damage_dealt: u32,  // Value of pieces captured
    evolution_count: u32,     // Times evolved
    
    // Metadata
    name: felt252,            // Custom name (optional)
    created_at: u64,          // Block when first saved
    last_used: u64,           // Block of last game
    favorite_slot: u8,        // Starting position preference
    
    // State
    is_available: bool,       // Can be used in matches
    is_locked: bool,          // Protected from deletion/trading
}
```

### Player Inventory

```cairo
#[derive(Component, Drop, Serde)]
struct PlayerInventory {
    owner: ContractAddress,
    piece_ids: Array<u32>,
    max_slots: u32,
    used_slots: u32,
}
```

## Inventory Limits

### Slot System

```
Free Tier:
- Max 10 inventory slots
- Basic storage

Premium Tier (future):
- Max 50 inventory slots
- Advanced features (trading, lending)
```

### Piece Limits per Game

```
Standard Match:
- Select up to 3 evolved pieces from inventory
- Remaining 13 pieces are standard (no traits)

Tournament Match:
- Select up to 5 evolved pieces
- All pieces can be from inventory (if owned)
```

## Core Operations

### Save to Inventory

```cairo
#[external(v0)]
fn save_to_inventory(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32,
    custom_name: felt252
) {
    let player = get_caller_address();
    
    // Get piece and genetic data
    let piece = self.pieces.read(piece_id);
    let genetic_data = self.genetic_data.read(piece_id);
    
    // Verify ownership
    assert(piece.owner == player, "Not your piece");
    
    // Only save evolved pieces
    assert(genetic_data.is_evolved, "Piece not evolved");
    assert(genetic_data.inherited_traits.len() > 0, "No traits to save");
    
    // Check inventory space
    let mut inventory = self.player_inventory.read(player);
    assert(
        inventory.used_slots < inventory.max_slots,
        "Inventory full"
    );
    
    // Create inventory piece
    let inventory_piece = InventoryPiece {
        id: self.generate_inventory_id(),
        owner: player,
        base_type: piece.piece_type,
        inherited_traits: genetic_data.inherited_traits.clone(),
        games_played: 0,
        captures_made: genetic_data.capture_count,
        total_damage_dealt: 0,
        evolution_count: genetic_data.inherited_traits.len(),
        name: custom_name,
        created_at: block_number,
        last_used: block_number,
        favorite_slot: 0,
        is_available: true,
        is_locked: false,
    };
    
    // Store in inventory
    self.inventory_pieces.write(
        (player, inventory_piece.id),
        inventory_piece
    );
    
    // Add to player's piece list
    inventory.piece_ids.append(inventory_piece.id);
    inventory.used_slots += 1;
    self.player_inventory.write(player, inventory);
    
    self.emit(PieceSavedToInventory {
        player,
        piece_id: inventory_piece.id,
        base_type: piece.piece_type,
        trait_count: genetic_data.inherited_traits.len(),
    });
}
```

### Select for Match

```cairo
#[external(v0)]
fn select_inventory_piece(
    ref self: ContractState,
    game_id: u64,
    inventory_piece_id: u32,
    starting_position: Position
) -> u32 {
    let player = get_caller_address();
    
    // Get inventory piece
    let inv_piece = self.inventory_pieces.read((player, inventory_piece_id));
    
    // Verify ownership and availability
    assert(inv_piece.owner == player, "Not your piece");
    assert(inv_piece.is_available, "Piece not available");
    assert(!inv_piece.is_locked, "Piece is locked");
    
    // Get game data
    let game = self.games.read(game_id);
    
    // Determine piece color based on player
    let color = if game.player_white == player {
        Color::White
    } else {
        Color::Black
    };
    
    // Create new piece entity for this game
    let new_piece_id = self.generate_piece_id();
    let new_piece = Piece {
        id: new_piece_id,
        piece_type: inv_piece.base_type,
        color,
        position: starting_position,
        is_alive: true,
        owner: player,
        game_id,
    };
    
    // Restore genetic data
    let genetic_data = GeneticData {
        piece_id: new_piece_id,
        inherited_traits: inv_piece.inherited_traits.clone(),
        complexity_cost: calculate_complexity(inv_piece.inherited_traits),
        max_complexity: 100,
        generation: inv_piece.evolution_count,
        parent_ids: array![],
        capture_count: 0,  // Reset for new game
        is_evolved: true,
        games_played: inv_piece.games_played,
    };
    
    // Store piece
    self.pieces.write(new_piece_id, new_piece);
    self.genetic_data.write(new_piece_id, genetic_data);
    
    // Mark as in-use
    inv_piece.is_available = false;
    inv_piece.last_used = block_number;
    self.inventory_pieces.write((player, inventory_piece_id), inv_piece);
    
    self.emit(PieceDeployed {
        game_id,
        inventory_piece_id,
        new_piece_id,
        base_type: inv_piece.base_type,
        trait_count: inv_piece.inherited_traits.len(),
    });
    
    return new_piece_id;
}
```

### Return After Match

```cairo
#[external(v0)]
fn return_inventory_pieces(
    ref self: ContractState,
    game_id: u64
) {
    let game = self.games.read(game_id);
    
    // Return all pieces used in this game
    let pieces = self.get_pieces_by_game(game_id);
    
    for piece in pieces {
        let genetic_data = self.genetic_data.read(piece.id);
        
        // Find corresponding inventory piece
        let inv_piece = self.get_inventory_piece_by_game(
            piece.owner,
            piece.piece_type,
            genetic_data.inherited_traits
        );
        
        if inv_piece.is_some() {
            let mut inv = inv_piece.unwrap();
            
            // Update stats
            inv.games_played += 1;
            inv.captures_made += genetic_data.capture_count;
            inv.is_available = true;
            
            // Check if piece evolved further during this game
            if genetic_data.inherited_traits.len() > inv.evolution_count {
                // Upgrade stored traits
                inv.inherited_traits = genetic_data.inherited_traits.clone();
                inv.evolution_count = genetic_data.inherited_traits.len();
                
                self.emit(PieceUpgraded {
                    owner: piece.owner,
                    inventory_piece_id: inv.id,
                    new_trait_count: inv.evolution_count,
                });
            }
            
            self.inventory_pieces.write((piece.owner, inv.id), inv);
        }
    }
}
```

### Upgrade Existing Piece

```cairo
#[external(v0)]
fn upgrade_inventory_piece(
    ref self: ContractState,
    inventory_piece_id: u32,
    new_traits: Array<Trait>
) {
    let player = get_caller_address();
    
    let mut inv_piece = self.inventory_pieces.read((player, inventory_piece_id));
    
    // Verify ownership
    assert(inv_piece.owner == player, "Not your piece");
    
    // Add new traits
    for trait in new_traits {
        // Check for duplicates
        let exists = false;
        for existing in inv_piece.inherited_traits {
            if existing.name == trait.name {
                exists = true;
                break;
            }
        }
        
        if !exists {
            inv_piece.inherited_traits.append(trait);
        }
    }
    
    inv_piece.evolution_count = inv_piece.inherited_traits.len();
    
    self.inventory_pieces.write((player, inventory_piece_id), inv_piece);
    
    self.emit(PieceUpgraded {
        owner: player,
        inventory_piece_id,
        new_trait_count: inv_piece.evolution_count,
    });
}
```

### Delete/Release Piece

```cairo
#[external(v0)]
fn release_inventory_piece(
    ref self: ContractState,
    inventory_piece_id: u32
) {
    let player = get_caller_address();
    
    let inv_piece = self.inventory_pieces.read((player, inventory_piece_id));
    
    // Verify ownership
    assert(inv_piece.owner == player, "Not your piece");
    
    // Cannot release locked pieces
    assert(!inv_piece.is_locked, "Piece is locked");
    
    // Remove from inventory
    self.inventory_pieces.delete((player, inventory_piece_id));
    
    // Update player inventory
    let mut inventory = self.player_inventory.read(player);
    
    // Remove from piece_ids array
    let mut new_ids = array![];
    for id in inventory.piece_ids {
        if id != inventory_piece_id {
            new_ids.append(id);
        }
    }
    inventory.piece_ids = new_ids;
    inventory.used_slots -= 1;
    
    self.player_inventory.write(player, inventory);
    
    self.emit(PieceReleased {
        owner: player,
        inventory_piece_id,
        base_type: inv_piece.base_type,
    });
}
```

## Inventory UI

### Inventory Screen

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR INVENTORY (7/10 slots)                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ ♞       │ │ ♝       │ │ ♜       │ │ ♛       │          │
│  │ Knight  │ │ Bishop  │ │ Rook    │ │ Queen   │          │
│  │ [Leap]  │ │ [Diag]  │ │ [Strt]  │ │ [Cmb]   │          │
│  │ [Diag]  │ │ [Leap]  │ │ [Leap]  │ │ [Leap]  │          │
│  │         │ │         │ │         │ │ [Diag]  │          │
│  │ Games:5 │ │ Games:3 │ │ Games:8 │ │ Games:2 │          │
│  │ ★★★★☆   │ │ ★★★☆☆   │ │ ★★★★★   │ │ ★★☆☆☆   │          │
│  │         │ │         │ │         │ │         │          │
│  │ [Use]   │ │ [Use]   │ │ [Use]   │ │ [Use]   │          │
│  │ [Lock]  │ │ [Lock]  │ │ [Lock]  │ │ [Lock]  │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│  │ ♟       │ │ ♞       │ │ ♝       │                       │
│  │ Pawn    │ │ Knight  │ │ Bishop  │                       │
│  │ [Leap]  │ │ [Strt]  │ │ [Strt]  │                       │
│  │         │ │         │ │         │                       │
│  │ Games:2 │ │ Games:1 │ │ Games:4 │                       │
│  │ ★★☆☆☆   │ │ ★☆☆☆☆   │ │ ★★★☆☆   │                       │
│  │         │ │         │ │         │                       │
│  │ [Use]   │ │ [Use]   │ │ [Use]   │                       │
│  │ [Lock]  │ │ [Lock]  │ │ [Lock]  │                       │
│  └─────────┘ └─────────┘ └─────────┘                       │
│                                                             │
│  Empty Slots: [ ] [ ] [ ]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Piece Selection Before Match

```
┌─────────────────────────────────────────────────────────────┐
│  SELECT PIECES FOR MATCH (0/3 used)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Available Inventory Pieces:                                │
│                                                             │
│  ☑ ┌─────────┐  ☐ ┌─────────┐  ☐ ┌─────────┐              │
│  │ │ ♞       │  │ │ ♝       │  │ │ ♜       │              │
│  │ │ Knight  │  │ │ Bishop  │  │ │ Rook    │              │
│  │ │ [Leap]  │  │ │ [Diag]  │  │ │ [Strt]  │              │
│  │ │ [Diag]  │  │ │ [Leap]  │  │ │ [Leap]  │              │
│  │ └─────────┘  │ └─────────┘  │ └─────────┘              │
│                                                             │
│  ☐ ┌─────────┐  ☐ ┌─────────┐  ☐ ┌─────────┐              │
│  │ │ ♛       │  │ │ ♟       │  │ │ ♞       │              │
│  │ │ Queen   │  │ │ Pawn    │  │ │ Knight  │              │
│  │ │ [Cmb]   │  │ │ [Leap]  │  │ │ [Strt]  │              │
│  │ │ [Leap]  │  │ │         │  │ │         │              │
│  │ └─────────┘  │ └─────────┘  │ └─────────┘              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Starting Position Setup                             │   │
│  │                                                     │   │
│  │ Selected pieces will replace standard pieces at:    │   │
│  │ - Knight: b1/g1 (White) or b8/g8 (Black)           │   │
│  │ - Bishop: c1/f1 (White) or c8/f8 (Black)           │   │
│  │ - Rook: a1/h1 (White) or a8/h8 (Black)             │   │
│  │ - Queen: d1 (White) or d8 (Black)                  │   │
│  │ - King: e1 (White) or e8 (Black)                   │   │
│  │ - Pawn: Any pawn file                              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│         [Cancel]              [Start Match]                 │
└─────────────────────────────────────────────────────────────┘
```

## Piece Rarity System

### Rarity Tiers

Based on trait count and games played:

```cairo
enum PieceRarity {
    Common,      // 1 trait, <5 games
    Uncommon,    // 2 traits, <10 games
    Rare,        // 3 traits, <20 games
    Epic,        // 4 traits, <50 games
    Legendary,   // 5+ traits, 50+ games
    Mythic,      // 6+ traits, 100+ games, unique combo
}

fn calculate_rarity(piece: InventoryPiece) -> PieceRarity {
    let trait_count = piece.inherited_traits.len();
    let games = piece.games_played;
    
    if trait_count >= 6 && games >= 100 {
        return PieceRarity::Mythic;
    }
    
    if trait_count >= 5 && games >= 50 {
        return PieceRarity::Legendary;
    }
    
    if trait_count >= 4 && games >= 20 {
        return PieceRarity::Epic;
    }
    
    if trait_count >= 3 && games >= 10 {
        return PieceRarity::Rare;
    }
    
    if trait_count >= 2 && games >= 5 {
        return PieceRarity::Uncommon;
    }
    
    return PieceRarity::Common;
}
```

### Visual Indicators

| Rarity | Border | Glow | Effect |
|--------|--------|------|--------|
| Common | Gray | None | Basic |
| Uncommon | Green | Slight | +1% trait power |
| Rare | Blue | Moderate | +2% trait power |
| Epic | Purple | Strong | +5% trait power |
| Legendary | Orange | Intense | +10% trait power |
| Mythic | Rainbow | Pulsing | +20% trait power |

## Statistics Tracking

### Piece Stats

```cairo
struct PieceStats {
    piece_id: u32,
    total_captures: u32,
    total_moves: u32,
    games_won: u32,
    games_lost: u32,
    mvp_count: u32,  // Most valuable piece in game
    longest_survival: u32,  // Moves before capture
    favorite_opponent_type: PieceType,  // Most captured piece type
}
```

### Player Inventory Stats

```typescript
interface InventoryStats {
  totalPieces: number;
  byRarity: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
    mythic: number;
  };
  averageTraits: number;
  mostPlayedPiece: InventoryPiece;
  newestPiece: InventoryPiece;
  oldestPiece: InventoryPiece;
  totalGamesPlayed: number;
  totalCaptures: number;
}
```

## Gas Costs (On-Chain)

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Save to Inventory | ~5,000 | Storage write |
| Select for Match | ~3,000 | Entity creation |
| Return After Match | ~2,000 | State update |
| Upgrade Piece | ~3,000 | Trait storage |
| Release Piece | ~1,000 | Storage deletion |
| Lock Piece | ~500 | Flag update |

## Next Steps

- [Gas Evolution](gas-evolution.md) - Evolving pieces with gas
- [ELO System](elo-system.md) - Matchmaking and rankings
- [Smart Contracts](../reference/cairo-contracts.md) - Contract implementation
