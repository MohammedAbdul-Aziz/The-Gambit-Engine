# Gas-Based Evolution System

The Gas-Based Evolution System transforms piece captures into strategic evolution decisions, where players spend limited gas resources to inherit traits from captured pieces.

## Overview

Unlike the automatic splicing system, the **Gas-Based Evolution** gives players explicit control:

1. **Capture a piece** → Opportunity to evolve
2. **Choose to evolve** → Spend gas to inherit traits
3. **Save evolved pieces** → Use in future matches
4. **Manage gas wisely** → Only 10 gas per game

## Gas System

### Starting Gas

```
Each player begins with: 10 GAS
```

Gas is **per-game**, not carried over between matches. This ensures:
- Fair matches (everyone starts equal)
- Strategic decisions (spend now or save?)
- No pay-to-win mechanics

### Trait Gas Costs

| Piece Type | Gas Cost | Movement Pattern |
|------------|----------|------------------|
| **Pawn** | 1 | Forward Step |
| **Knight** | 3 | L-Shaped Leap |
| **Bishop** | 3 | Diagonal Movement |
| **Rook** | 5 | Straight Movement |
| **Queen** | 10 | Combined (Rook + Bishop) |

### Evolution Examples

#### Example 1: Pawn Captures Knight

```
Scenario: White Pawn at e4 captures Black Knight at f6

Options:
┌─────────────────────────────────────────────────────────┐
│ Option A: Evolve                                        │
│ - Cost: 3 gas (Knight trait)                            │
│ - Result: Pawn gains "Leap" trait                       │
│ - New moves: Forward + L-shaped jumps                   │
│ - Remaining gas: 7                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Option B: Skip Evolution                                │
│ - Cost: 0 gas                                           │
│ - Result: Standard capture, no trait gain               │
│ - Remaining gas: 10                                     │
│ - Benefit: Save gas for better evolution later          │
└─────────────────────────────────────────────────────────┘
```

#### Example 2: Multiple Evolutions

```
Player has 10 gas starting budget

Turn 3: Knight captures Bishop
  → Evolve: 3 gas (Diagonal trait)
  → Remaining: 7 gas

Turn 7: Evolved Knight captures Rook
  → Evolve: 5 gas (Straight trait)
  → Remaining: 2 gas
  → Knight now has: Leap + Diagonal + Straight

Turn 10: Knight captures Queen
  → Cannot evolve (need 10 gas, have 2)
  → Must skip or use remaining gas elsewhere
```

### Gas Budget Strategy

```
Poor Gas Management:
Turn 1: Pawn captures Knight → Evolve (3 gas)
Turn 2: Pawn captures Bishop → Evolve (3 gas)
Turn 3: Pawn captures Rook → Evolve (5 gas)
Total: 11 gas ❌ (EXCEEDED - last evolution fails!)

Smart Gas Management:
Turn 1: Pawn captures Knight → Skip (0 gas)
Turn 2: Knight captures Bishop → Evolve (3 gas)
Turn 3: Evolved Knight captures Rook → Evolve (5 gas)
Turn 4: Evolved Knight captures Queen → Skip (0 gas)
Total: 8 gas ✓ (Within budget, powerful hybrid created)
```

## Evolution Flow

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: CAPTURE                                             │
│ Player's piece captures opponent's piece                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: EVOLUTION OPPORTUNITY                               │
│ System detects capture, offers evolution choice             │
│ Shows:                                                      │
│ - Available traits from captured piece                      │
│ - Gas cost for each trait                                   │
│ - Player's remaining gas                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: PLAYER DECISION                                     │
│ Player chooses:                                             │
│ - Which traits to inherit (can select multiple)             │
│ - Or skip evolution entirely                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: GAS VALIDATION                                      │
│ Contract checks:                                            │
│ - Player has sufficient gas                                 │
│ - Total cost ≤ remaining gas                                │
│ If valid: proceed                                           │
│ If invalid: evolution fails, capture still counts           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: TRAIT INHERITANCE                                   │
│ Selected traits are added to capturing piece                │
│ Gas is deducted from player's game gas                      │
│ Piece is marked as "evolved"                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: INVENTORY SAVE                                      │
│ At game end, evolved pieces are saved to player inventory   │
│ Can be used in future matches                               │
└─────────────────────────────────────────────────────────────┘
```

## Trait Inheritance Rules

### Base Traits by Piece

```cairo
struct PieceTrait {
    name: TraitName,
    gas_cost: u8,
    movement_pattern: MovementPattern,
}

const TRAIT_COSTS: Map<PieceType, u8> = {
    PieceType::Pawn => 1,
    PieceType::Knight => 3,
    PieceType::Bishop => 3,
    PieceType::Rook => 5,
    PieceType::Queen => 10,
    PieceType::King => 0, // Cannot inherit King traits
};
```

### Trait Effects

| Trait | Movement Added | Stackable |
|-------|----------------|-----------|
| **ForwardStep** (Pawn) | +1 square forward | Yes |
| **Leap** (Knight) | L-shaped jumps (2+1) | No |
| **Diagonal** (Bishop) | Any squares diagonally | No |
| **Straight** (Rook) | Any squares horizontally/vertically | No |
| **Combined** (Queen) | Diagonal + Straight | No (replaces both) |

### Trait Conflicts

```cairo
fn resolve_trait_conflicts(
    current_traits: Array<Trait>,
    new_traits: Array<Trait>
) -> Array<Trait> {
    let mut result = current_traits;

    for trait in new_traits {
        // Diagonal + Straight = Combined (more efficient)
        if trait.name == TraitName::Diagonal && has_trait(result, Straight) {
            remove_trait(result, Straight);
            add_trait(result, TraitName::Combined);
            continue;
        }

        if trait.name == TraitName::Straight && has_trait(result, Diagonal) {
            remove_trait(result, Diagonal);
            add_trait(result, TraitName::Combined);
            continue;
        }

        // Skip if already have this trait
        if has_trait(result, trait.name) {
            continue;
        }

        add_trait(result, trait);
    }

    return result;
}
```

## Cairo Implementation

### Evolution Request

```cairo
#[external(v0)]
fn request_evolution(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32,
    captured_piece_type: PieceType,
    traits_to_inherit: Array<TraitName>
) {
    // Verify caller is piece owner
    let player = get_caller_address();
    let piece = self.pieces.read(piece_id);
    assert(piece.owner == player, "Not piece owner");

    // Get player's gas
    let player_gas = self.player_gas.read((game_id, player));

    // Calculate total gas cost
    let mut total_cost: u8 = 0;
    for trait in traits_to_inherit {
        total_cost += get_trait_gas_cost(captured_piece_type);
    }

    // Check gas budget
    assert(player_gas >= total_cost, "Insufficient gas");

    // Deduct gas
    self.player_gas.write((game_id, player), player_gas - total_cost);

    // Apply traits to piece
    let mut genetic_data = self.genetic_data.read(piece_id);
    for trait in traits_to_inherit {
        genetic_data.inherited_traits.append(trait);
    }
    genetic_data.is_evolved = true;
    self.genetic_data.write(piece_id, genetic_data);

    // Emit event
    self.emit(PieceEvolved {
        game_id,
        piece_id,
        traits_inherited: traits_to_inherit,
        gas_spent: total_cost,
        remaining_gas: player_gas - total_cost,
    });
}
```

### Skip Evolution

```cairo
#[external(v0)]
fn skip_evolution(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32
) {
    // Player chooses not to evolve
    // Gas is preserved for future captures

    self.emit(EvolutionSkipped {
        game_id,
        piece_id,
    });
}
```

## Strategic Implications

### Early Game

```
Conservative Strategy:
- Skip early evolutions
- Save gas for powerful mid-game pieces
- Risk: Fall behind in piece power

Aggressive Strategy:
- Evolve on first capture (Pawn + Knight = 3 gas)
- Build momentum with hybrid pieces
- Risk: No gas for critical late-game evolutions
```

### Mid Game

```
Balanced Approach:
- Spend 3-5 gas per evolution
- Keep 2-3 gas reserve for emergencies
- Focus on key pieces (Knights, Bishops)
```

### Late Game

```
All-In Strategy:
- Spend remaining gas on Queen capture (10 gas)
- Create ultimate hybrid
- Risk: All-or-nothing gamble

Conservative Finish:
- Use small evolutions (Pawn traits: 1 gas)
- Maintain flexibility
- Benefit: Multiple small upgrades
```

## Gas Efficiency

### Best Value Evolutions

| Capture | Cost | Value Rating | Notes |
|---------|------|--------------|-------|
| **Pawn** | 1 | ⭐⭐⭐ | Cheap, good for testing |
| **Knight** | 3 | ⭐⭐⭐⭐⭐ | Leap trait is very versatile |
| **Bishop** | 3 | ⭐⭐⭐⭐ | Strong diagonal control |
| **Rook** | 5 | ⭐⭐⭐⭐ | Powerful but expensive |
| **Queen** | 10 | ⭐⭐ | All-in, use only when necessary |

### Optimal Evolution Paths

```
Path 1: The Hybrid Knight
1. Knight captures Bishop → Evolve (3 gas) → Diagonal trait
2. Evolved Knight captures Rook → Evolve (5 gas) → Straight trait
3. Result: Knight with Queen-like movement
4. Total: 8 gas

Path 2: The Super Pawn
1. Pawn captures Knight → Evolve (3 gas) → Leap trait
2. Evolved Pawn captures Bishop → Evolve (3 gas) → Diagonal trait
3. Evolved Pawn captures Rook → Evolve (5 gas) → Straight trait
4. Result: Pawn with Queen-like movement (!)
5. Total: 11 gas (requires multiple games to save)

Path 3: The Balanced Army
1. Multiple pieces, small evolutions (1-3 gas each)
2. Build diverse capabilities
3. Total: 10 gas spread across 3-4 pieces
```

## Inventory System

### Saving Evolved Pieces

```cairo
struct InventoryPiece {
    piece_id: u32,
    owner: ContractAddress,
    base_type: PieceType,
    inherited_traits: Array<Trait>,
    games_played: u32,
    captures_made: u32,
    created_at: u64,
    last_used: u64,
}

#[external(v0)]
fn save_to_inventory(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32
) {
    let piece = self.pieces.read(piece_id);
    let genetic_data = self.genetic_data.read(piece_id);

    // Only save evolved pieces
    assert(genetic_data.is_evolved, "Piece not evolved");

    let inventory_piece = InventoryPiece {
        piece_id: self.generate_inventory_id(),
        base_type: piece.piece_type,
        inherited_traits: genetic_data.inherited_traits,
        games_played: 0,
        captures_made: genetic_data.capture_count,
        created_at: block_number,
        last_used: block_number,
    };

    self.inventory.write((piece.owner, inventory_piece.piece_id), inventory_piece);

    // Add to player's inventory list
    let mut player_inventory = self.player_inventory_ids.read(piece.owner);
    player_inventory.append(inventory_piece.piece_id);
    self.player_inventory_ids.write(piece.owner, player_inventory);
}
```

### Using Inventory Pieces

```cairo
#[external(v0)]
fn select_inventory_piece(
    ref self: ContractState,
    game_id: u64,
    inventory_piece_id: u32,
    starting_position: Position
) -> u32 {
    let player = get_caller_address();
    let inventory_piece = self.inventory.read((player, inventory_piece_id));

    // Create piece for new game
    let new_piece = Piece {
        id: self.generate_piece_id(),
        piece_type: inventory_piece.base_type,
        color: get_game_color(game_id, player),
        position: starting_position,
        is_alive: true,
        owner: player,
        game_id,
    };

    // Restore genetic data
    let genetic_data = GeneticData {
        piece_id: new_piece.id,
        inherited_traits: inventory_piece.inherited_traits,
        is_evolved: true,
        games_played: inventory_piece.games_played + 1,
        ..
    };

    self.pieces.write(new_piece.id, new_piece);
    self.genetic_data.write(new_piece.id, genetic_data);

    return new_piece.id;
}
```

## Next Steps

- [Inventory System](inventory-system.md) - Detailed inventory management
- [ELO Matchmaking](elo-system.md) - Skill-based matchmaking
- [Capture System](capture-system.md) - Updated capture flow
