# Genetic Logic Splicing

The Genetic Logic Splicing system is the core innovation of The Gambit Engine, transforming traditional chess capture into a DNA-encoded inheritance mechanism.

## Overview

In traditional chess, capturing a piece eliminates it from the game. In The Gambit Engine, **capture triggers genetic inheritance** - the capturing piece absorbs traits from the captured piece, creating unique hybrid pieces with combined abilities.

## Core Concepts

### 1. Inheritance Over Elimination

When a piece captures another:

- **Captured piece is removed** from the board
- **Genetic traits are extracted** from the captured piece
- **Traits are spliced** into the capturing piece's DNA
- **Hybrid piece remains** on the board with new abilities

### 2. Trait System

Each piece type has inherent movement patterns that can be inherited:

| Piece | Base Trait | Movement Pattern |
|-------|------------|------------------|
| **Pawn** | Forward Step | One square forward (two on first move) |
| **Rook** | Straight Line | Any number of squares horizontally/vertically |
| **Knight** | Leap | L-shaped movement (2+1 squares) |
| **Bishop** | Diagonal | Any number of squares diagonally |
| **Queen** | Combined | Rook + Bishop movement |
| **King** | Adjacent | One square in any direction |

### 3. Splicing Mechanics

#### Trait Acquisition

When a Knight captures a Bishop:

```
Knight (base: Leap) + Bishop (base: Diagonal)
    ↓
Hybrid Knight (Leap + Diagonal Leap trait)
    ↓
Can now move in L-shapes AND diagonally
```

#### Complexity Budget

Each trait has a complexity cost. Pieces have a maximum complexity budget:

```cairo
const MAX_COMPLEXITY: u32 = 100;

struct TraitCost {
    diagonal: u32,      // 25 complexity
    straight: u32,      // 25 complexity
    leap: u32,          // 15 complexity
    extended_range: u32, // 10 per rank
    teleport: u32,      // 40 complexity
}
```

**Example:**
```
Knight (base: 15) captures Bishop (diagonal: 25)
    ↓
New complexity: 15 + 25 = 40 / 100 ✓ (Valid)

Knight (40) captures Queen (combined: 50)
    ↓
New complexity: 40 + 50 = 90 / 100 ✓ (Valid)

Hybrid Knight (90) captures Rook (straight: 25)
    ↓
New complexity: 90 + 25 = 115 / 100 ✗ (Invalid - exceeds budget)
```

## Splicing Algorithm

### Step 1: Capture Detection

```cairo
fn on_capture(
    attacker: Piece,
    defender: Piece,
    game_state: GameState
) -> SplicingResult {
    // Extract defender's genetic data
    let defender_traits = genetics.get_traits(defender.id);
    
    // Calculate new complexity
    let current_complexity = genetics.get_complexity(attacker.id);
    let new_complexity = current_complexity + defender_traits.cost;
    
    // Check budget
    if new_complexity > MAX_COMPLEXITY {
        return SplicingError::ComplexityExceeded;
    }
    
    return SplicingResult::Success;
}
```

### Step 2: Trait Extraction

```cairo
fn extract_traits(piece: Piece) -> Array<Trait> {
    let mut traits = array![];
    
    match piece.piece_type {
        PieceType::Bishop => traits.append(Trait::Diagonal),
        PieceType::Rook => traits.append(Trait::Straight),
        PieceType::Knight => traits.append(Trait::Leap),
        PieceType::Queen => {
            traits.append(Trait::Diagonal);
            traits.append(Trait::Straight);
        }
        _ => {}
    }
    
    // Include inherited traits
    for trait in piece.genetic_data.inherited_traits {
        traits.append(trait);
    }
    
    return traits;
}
```

### Step 3: Trait Splicing

```cairo
fn splice_traits(
    target: Piece,
    new_traits: Array<Trait>
) -> Result<Piece, SplicingError> {
    // Check for duplicates
    for trait in new_traits {
        if target.has_trait(trait) {
            // Trait already exists, skip or upgrade
            continue;
        }
        
        // Check complexity budget
        if target.complexity + trait.cost > MAX_COMPLEXITY {
            // Cannot afford this trait
            continue;
        }
        
        // Splice the trait
        target.genetic_data.inherited_traits.append(trait);
        target.complexity += trait.cost;
    }
    
    target.generation += 1;
    
    return Result::Ok(target);
}
```

## Strategic Implications

### 1. Value Assessment

Piece value becomes dynamic:

- **Early game**: Standard piece values
- **Mid game**: Hybrid pieces may exceed traditional values
- **Late game**: Most powerful hybrids dominate

### 2. Capture Decisions

Not all captures are beneficial:

- **Good capture**: Valuable traits within budget
- **Bad capture**: Wastes complexity on unwanted traits
- **Strategic sacrifice**: Feed weak pieces to build hybrids

### 3. Evolution Paths

Common evolution strategies:

```
Knight → Knight+Bishop → Knight+Bishop+Rook (Ultra Hybrid)
Pawn → Pawn+Knight (Early Aggression)
Bishop → Bishop+Queen (Diagonal Dominance)
```

## Visual Examples

### Example 1: Knight Captures Bishop

```
Before Capture:
┌───┬───┬───┬───┬───┬───┬───┬───┐
│   │   │   │ B │   │   │   │   │  ← Bishop (Diagonal trait)
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │   │   │   │   │   │   │   │
├───┼───┼───┼───┼───┼───┼───┼───┤
│   │ N │   │   │   │   │   │   │  ← Knight (Leap trait)
└───┴───┴───┴───┴───┴───┴───┴───┘

After Capture:
┌───┬───┬───┬───┬───┬───┬───┬───┐
│   │   │   │ N*│   │   │   │   │  ← Hybrid Knight
└───┴───┴───┴───┴───┴───┴───┴───┘
    (Leap + Diagonal traits)
    Complexity: 40/100
    Generation: 2
```

### Example 2: Complexity Budget Exceeded

```
Current Hybrid: Knight + Bishop + Rook (Complexity: 90/100)
Attempting to capture: Queen (Complexity cost: 50)

Result: CAPTURE BLOCKED
Reason: 90 + 50 = 140 > 100 (exceeds budget)

Strategy: Capture weaker piece or sacrifice first
```

## Advanced Mechanics

### Trait Conflicts

Some traits may conflict:

```cairo
fn resolve_conflicts(traits: Array<Trait>) -> Array<Trait> {
    // Diagonal + Straight = Queen movement (merge)
    if has_diagonal && has_straight {
        remove_trait(Diagonal);
        remove_trait(Straight);
        add_trait(Combined);  // More efficient
    }
    
    return traits;
}
```

### Generation Bonuses

Higher generation pieces gain bonuses:

```cairo
fn get_generation_bonus(piece: Piece) -> Bonus {
    match piece.generation {
        1 => Bonus::None,
        2..=4 => Bonus::Minor,      // +5% movement range
        5..=9 => Bonus::Moderate,   // +10% movement range
        10+ => Bonus::Major,        // +20% movement range
    }
}
```

### Mutation Events

Rare spontaneous mutations:

```cairo
fn check_mutation(piece: Piece) -> Option<Trait> {
    if random() < MUTATION_RATE {
        // 1% chance per capture
        return Some(get_random_trait());
    }
    return None;
}
```

## Next Steps

- [Capture System](capture-system.md) - Detailed capture resolution
- [ZK-Fog](zk-fog.md) - Hidden ability mechanics
