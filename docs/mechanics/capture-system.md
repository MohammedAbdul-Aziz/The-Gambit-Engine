# Piece Capture & Inheritance

This document details the capture resolution system and genetic inheritance mechanics in The Gambit Engine.

## Overview

Capture is the most transformative action in The Gambit Engine. Unlike traditional chess where capture eliminates pieces, here it **triggers genetic inheritance**, creating unique hybrid pieces that carry forward the genetic legacy of both attacker and defender.

## Capture Resolution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPTURE INITIATED                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Validate Capture                                   │
│  - Verify move is legal                                     │
│  - Confirm target is opponent's piece                       │
│  - Check special conditions (protected, immune, etc.)       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Extract Genetic Data                               │
│  - Read defender's trait array                              │
│  - Calculate trait complexity costs                         │
│  - Identify inheritable traits                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Check Complexity Budget                            │
│  - Calculate new total complexity                           │
│  - Verify within MAX_COMPLEXITY limit                       │
│  - Handle overflow (skip traits or block capture)           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Splice Traits                                      │
│  - Merge trait arrays                                       │
│  - Resolve conflicts (Diagonal + Straight = Combined)       │
│  - Update piece genetic data                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Update Game State                                  │
│  - Remove defender from board                               │
│  - Update attacker position                                 │
│  - Increment generation counter                             │
│  - Record capture in history                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPTURE COMPLETE                         │
│  Attacker now possesses combined traits                     │
└─────────────────────────────────────────────────────────────┘
```

## Capture Validation

### Basic Validation

```cairo
fn validate_capture(
    attacker: Piece,
    defender: Piece,
    move_data: Move
) -> Result<CaptureValidity, CaptureError> {
    // Must be opponent's piece
    if attacker.color == defender.color {
        return Result::Err(CaptureError::SameColor);
    }
    
    // Must be legal move
    if !is_legal_move(attacker, move_data.to) {
        return Result::Err(CaptureError::IllegalMove);
    }
    
    // Check for protection
    if is_protected(defender) {
        // Protected pieces may have special rules
        return Result::Err(CaptureError::Protected);
    }
    
    // Check for immunity
    if defender.has_trait(Trait::Shield) && defender.shield_active {
        return Result::Err(CaptureError::Immune);
    }
    
    return Result::Ok(CaptureValidity::Valid);
}
```

### Special Capture Rules

#### En Passant

```cairo
fn validate_en_passant(
    attacker: Piece,
    defender: Piece,
    game_state: GameState
) -> bool {
    // Must be pawn
    if attacker.piece_type != PieceType::Pawn {
        return false;
    }
    
    // Defender must have moved two squares last turn
    if !defender.just_moved_two_squares {
        return false;
    }
    
    // Must be adjacent file
    if abs(attacker.position.file - defender.position.file) != 1 {
        return false;
    }
    
    return true;
}
```

## Genetic Extraction

### Trait Extraction Algorithm

```cairo
fn extract_genetic_data(piece: Piece) -> GeneticExtraction {
    let mut traits = array![];
    let mut total_complexity: u32 = 0;
    
    // Extract base trait
    let base_trait = get_base_trait(piece.piece_type);
    traits.append(base_trait);
    total_complexity += base_trait.cost;
    
    // Extract inherited traits
    for trait in piece.genetic_data.inherited_traits {
        traits.append(trait);
        total_complexity += trait.cost;
    }
    
    // Extract hidden traits (if revealed)
    if piece.has_revealed_hidden_traits() {
        for hidden_trait in piece.revealed_hidden_traits {
            traits.append(hidden_trait);
            total_complexity += hidden_trait.cost;
        }
    }
    
    return GeneticExtraction {
        traits,
        total_complexity,
        generation: piece.generation,
        parent_id: piece.id,
    };
}
```

### Base Trait Mapping

```cairo
fn get_base_trait(piece_type: PieceType) -> Trait {
    match piece_type {
        PieceType::Pawn => Trait {
            name: TraitName::ForwardStep,
            cost: 5,
            data: array![],
        },
        PieceType::Rook => Trait {
            name: TraitName::StraightLine,
            cost: 25,
            data: array![],
        },
        PieceType::Knight => Trait {
            name: TraitName::Leap,
            cost: 15,
            data: array![],
        },
        PieceType::Bishop => Trait {
            name: TraitName::Diagonal,
            cost: 25,
            data: array![],
        },
        PieceType::Queen => Trait {
            name: TraitName::Combined,
            cost: 50,
            data: array![],
        },
        PieceType::King => Trait {
            name: TraitName::Adjacent,
            cost: 10,
            data: array![],
        },
    }
}
```

## Complexity Budget Management

### Budget Calculation

```cairo
fn calculate_new_complexity(
    attacker_complexity: u32,
    defender_extraction: GeneticExtraction
) -> u32 {
    let mut new_complexity = attacker_complexity;
    
    for trait in defender_extraction.traits {
        // Skip if already have this trait
        if attacker_has_trait(attacker, trait.name) {
            continue;
        }
        
        new_complexity += trait.cost;
    }
    
    return new_complexity;
}
```

### Budget Overflow Handling

```cairo
fn handle_complexity_overflow(
    attacker: Piece,
    defender_traits: Array<Trait>,
    max_complexity: u32
) -> Result<Array<Trait>, SplicingError> {
    let current = attacker.complexity;
    let mut selected_traits = array![];
    let mut running_total = current;
    
    // Sort traits by value/cost ratio (greedy approach)
    let sorted_traits = sort_by_efficiency(defender_traits);
    
    for trait in sorted_traits {
        if running_total + trait.cost <= max_complexity {
            selected_traits.append(trait);
            running_total += trait.cost;
        } else {
            // Cannot afford this trait
            // Option 1: Skip and continue
            continue;
            
            // Option 2: Block entire capture
            // return Result::Err(SplicingError::ComplexityExceeded);
        }
    }
    
    return Result::Ok(selected_traits);
}
```

## Trait Splicing

### Trait Merging

```cairo
fn splice_traits(
    attacker: Piece,
    new_traits: Array<Trait>
) -> Result<Piece, SplicingError> {
    let mut result = attacker;
    
    for trait in new_traits {
        // Check for duplicates
        if result.has_trait(trait.name) {
            // Option: Upgrade existing trait
            if trait.can_upgrade() {
                result.upgrade_trait(trait.name);
            }
            continue;
        }
        
        // Check for conflicts
        let conflict = check_trait_conflict(result.traits, trait.name);
        if conflict.is_some() {
            // Resolve conflict (merge, replace, or skip)
            let resolved = resolve_conflict(result, trait, conflict.unwrap());
            result = resolved;
            continue;
        }
        
        // Add the trait
        result.traits.append(trait);
        result.complexity += trait.cost;
    }
    
    // Increment generation
    result.generation += 1;
    
    return Result::Ok(result);
}
```

### Conflict Resolution

```cairo
fn resolve_conflict(
    piece: Piece,
    new_trait: Trait,
    conflict: TraitConflict
) -> Piece {
    match conflict {
        TraitConflict::DiagonalStraight => {
            // Diagonal + Straight = Combined (more efficient)
            piece.remove_trait(TraitName::Diagonal);
            piece.remove_trait(TraitName::Straight);
            piece.add_trait(Trait {
                name: TraitName::Combined,
                cost: 50,  // Less than 25+25=50 (same, but cleaner)
            });
            piece.complexity = piece.complexity - 25 - 25 + 50;
        },
        TraitConflict::LeapShadow => {
            // Leap + Shadow = Phantom Leap (enhanced)
            piece.remove_trait(TraitName::Leap);
            piece.add_trait(Trait {
                name: TraitName::PhantomLeap,
                cost: 30,  // Enhanced version
            });
        },
        // Add more conflict resolutions...
    }
    
    return piece;
}
```

## State Updates

### Board State

```cairo
fn update_board_state(
    attacker: Piece,
    defender: Piece,
    new_position: Position
) {
    // Clear defender's square
    self.squares.write(defender.position, SquareState {
        occupant: Option::None,
        ..
    });
    
    // Update attacker's position
    self.squares.write(attacker.position, SquareState {
        occupant: Option::None,
        ..
    });
    self.squares.write(new_position, SquareState {
        occupant: Option::Some(attacker.id),
        ..
    });
    
    // Update piece position
    attacker.position = new_position;
    self.pieces.write(attacker.id, attacker);
}
```

### Capture History

```cairo
fn record_capture(
    game_id: u64,
    attacker: Piece,
    defender: Piece,
    new_traits: Array<Trait>
) {
    let capture_record = CaptureRecord {
        game_id,
        turn: self.games.read(game_id).move_count,
        attacker_id: attacker.id,
        defender_id: defender.id,
        attacker_type: attacker.piece_type,
        defender_type: defender.piece_type,
        inherited_traits: new_traits,
        new_generation: attacker.generation,
        timestamp: block_number,
    };
    
    self.capture_history.append(capture_record);
    
    // Update player stats
    let player = self.players.read(attacker.owner);
    player.captures += 1;
    player.total_complexity_gained += new_traits.total_cost();
    self.players.write(attacker.owner, player);
}
```

## Examples

### Example 1: Simple Capture

```
Initial State:
- White Knight at f3 (Complexity: 15, Generation: 1)
- Black Bishop at c5 (Complexity: 25, Generation: 1)

Action: Knight captures Bishop

Result:
- White Knight at c5 (Complexity: 40, Generation: 2)
- New traits: [Leap, Diagonal]
- Can move in L-shapes AND diagonally
```

### Example 2: Complex Hybrid Capture

```
Initial State:
- White Hybrid Queen at d4
  (Complexity: 75, Generation: 4)
  Traits: [Combined, Leap, ExtendedRange]
  
- Black Rook at d8
  (Complexity: 25, Generation: 1)
  Traits: [Straight]

Action: Queen captures Rook

Result:
- Cannot inherit Straight (already have Combined)
- Complexity unchanged: 75/100
- Generation: 5
- No new traits gained (redundant capture)
```

### Example 3: Budget Overflow

```
Initial State:
- White Hybrid Knight at e5
  (Complexity: 85, Generation: 3)
  Traits: [Leap, Diagonal, Straight]
  
- Black Queen at h8
  (Complexity: 50, Generation: 1)
  Traits: [Combined]

Action: Knight captures Queen

Calculation:
- Current: 85
- New trait (Combined): 50
- Total: 135 > 100 (OVERFLOW)

Result:
- Capture blocked OR
- Partial inheritance (skip Combined, gain nothing)
```

## Next Steps

- [Advanced: Complexity Budgets](../advanced/complexity-budgets.md)
- [Reference: ECS Components](../reference/ecs-components.md)
