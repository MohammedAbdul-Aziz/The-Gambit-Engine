# Complexity Budgets

Complexity budgets manage the computational and gas costs of piece abilities, ensuring balanced gameplay and sustainable on-chain operations.

## Overview

Every piece in The Gambit Engine has a **complexity budget** that limits the total cost of its abilities. This system:

- Prevents overpowered hybrid pieces
- Manages on-chain computation costs
- Creates strategic depth in capture decisions
- Ensures gas efficiency

## Complexity System

### Budget Limits

```cairo
const MAX_COMPLEXITY: u32 = 100;
const MIN_COMPLEXITY: u32 = 5;

struct ComplexityBudget {
    base_cost: u32,      // Base piece cost
    trait_cost: u32,     // Inherited trait costs
    zk_cost: u32,        // ZK-Fog ability costs
    ai_cost: u32,        // AI/ghost costs
    total: u32,          // Must be <= MAX_COMPLEXITY
}
```

### Base Costs

| Piece Type | Base Complexity |
|------------|-----------------|
| **Pawn** | 5 |
| **Knight** | 15 |
| **Bishop** | 25 |
| **Rook** | 25 |
| **Queen** | 50 |
| **King** | 10 |

## Trait Costs

### Movement Traits

| Trait | Cost | Description |
|-------|------|-------------|
| **ForwardStep** | 5 | Pawn-like forward movement |
| **Leap** | 15 | Knight-like L-shaped jumps |
| **Diagonal** | 25 | Bishop-like diagonal movement |
| **Straight** | 25 | Rook-like straight movement |
| **Combined** | 50 | Queen-like (Diagonal + Straight) |
| **Adjacent** | 10 | King-like one-square movement |

### Enhanced Traits

| Trait | Cost | Description |
|-------|------|-------------|
| **ExtendedRange** | 10/level | +1 square movement range |
| **PhantomLeap** | 30 | Leap through pieces |
| **DoubleMove** | 35 | Move twice per turn |
| **Teleport** | 40 | Teleport to any empty square |

### ZK-Fog Traits

| Trait | Cost | Description |
|-------|------|-------------|
| **HiddenAbility** | 15 | Conceal one ability |
| **CommitReveal** | 20 | Commit-reveal scheme |
| **ProofGeneration** | 25 | Generate STARK proofs |

### Ghost Traits

| Trait | Cost | Description |
|-------|------|-------------|
| **Ethereal** | 20 | Pass through pieces |
| **AutonomousAI** | 30 | AI-controlled movement |
| **Evolution** | 25 | Gain traits over time |

## Budget Calculation

### Simple Calculation

```cairo
fn calculate_complexity(piece: Piece) -> u32 {
    let mut total = piece.base_cost;
    
    // Add trait costs
    for trait in piece.traits {
        total += trait.cost;
    }
    
    // Add ZK-Fog costs
    if piece.has_hidden_abilities {
        total += ZK_FOG_BASE_COST;
    }
    
    // Add AI costs
    if piece.is_ghost {
        total += AI_CONTROL_COST;
    }
    
    return total;
}
```

### Example Calculations

#### Example 1: Standard Knight

```
Knight:
- Base: 15
- Traits: [Leap (15)]
- Total: 15 + 15 = 30 / 100 ✓
```

#### Example 2: Hybrid Knight+Bishop

```
Knight captures Bishop:
- Base: 15 (Knight)
- Traits: [Leap (15), Diagonal (25)]
- Total: 15 + 15 + 25 = 55 / 100 ✓
```

#### Example 3: Complex Hybrid

```
Knight captures Bishop, Rook, and Pawn:
- Base: 15 (Knight)
- Traits: [Leap (15), Diagonal (25), Straight (25), ForwardStep (5)]
- Total: 15 + 15 + 25 + 25 + 5 = 85 / 100 ✓
```

#### Example 4: Budget Overflow

```
Complex Hybrid (85) captures Queen:
- Current: 85
- New Trait: Combined (50)
- Total: 85 + 50 = 135 / 100 ✗

Result: CAPTURE BLOCKED or TRAIT SKIPPED
```

## Strategic Implications

### 1. Capture Prioritization

```
High-Value Captures (within budget):
✓ Capture Bishop when you have 50 complexity remaining
✓ Capture Rook for Straight trait

Low-Value Captures (redundant):
✗ Capture Rook when you already have Combined trait
✗ Capture Pawn when at 95/100 complexity
```

### 2. Evolution Planning

```
Optimal Evolution Path:
Knight (30) → +Bishop (55) → +Rook (80) → +Pawn (85)
Total: 85/100, 4 traits

Suboptimal Path:
Knight (30) → +Queen (80) → Stuck (cannot add more)
Total: 80/100, 2 traits
```

### 3. Sacrifice Strategy

```
Sacrifice Play:
- Low-complexity piece captures high-complexity piece
- Gains valuable traits
- Sacrifices piece to another low-complexity piece
- Second piece inherits accumulated traits

Result: Powerful hybrid with controlled complexity
```

## Budget Management

### Overflow Handling

```cairo
enum OverflowStrategy {
    BlockCapture,      // Reject capture entirely
    SkipTrait,         // Capture but skip expensive traits
    PartialCapture,    // Capture maximum affordable traits
    ReplaceTrait,      // Replace old trait with new if better
}

fn handle_overflow(
    current: u32,
    new_trait: Trait,
    strategy: OverflowStrategy
) -> Result<CaptureResult, CaptureError> {
    match strategy {
        OverflowStrategy::BlockCapture => {
            if current + new_trait.cost > MAX_COMPLEXITY {
                return Result::Err(CaptureError::ComplexityExceeded);
            }
        },
        OverflowStrategy::SkipTrait => {
            if current + new_trait.cost > MAX_COMPLEXITY {
                return Result::Ok(CaptureResult::SkipTrait);
            }
        },
        OverflowStrategy::PartialCapture => {
            // Capture what fits, skip rest
            return capture_affordable_traits(current, new_trait);
        },
        OverflowStrategy::ReplaceTrait => {
            // Replace if new trait is better value
            return try_replace_trait(current, new_trait);
        },
    }
    
    return Result::Ok(CaptureResult::Success);
}
```

### Trait Optimization

```cairo
fn optimize_traits(piece: Piece) -> Piece {
    // Check for redundant traits
    if piece.has_trait(Diagonal) && piece.has_trait(Straight) {
        // Replace with Combined (same cost, cleaner)
        piece.remove_trait(Diagonal);
        piece.remove_trait(Straight);
        piece.add_trait(Combined);
    }
    
    // Remove low-value traits if near budget
    if piece.complexity > 90 {
        for trait in piece.traits {
            if trait.cost < 10 && !trait.is_essential() {
                piece.remove_trait(trait);
                piece.complexity -= trait.cost;
            }
        }
    }
    
    return piece;
}
```

## Gas Cost Mapping

### Complexity to Gas

```
Complexity Range | Approximate Gas | Notes
-----------------|-----------------|-------
0-25             | ~3,000          | Simple pieces
26-50            | ~5,000          | Moderate hybrids
51-75            | ~8,000          | Complex hybrids
76-100           | ~12,000         | Ultra hybrids
```

### Gas Optimization

```cairo
// Efficient trait storage
#[derive(Component)]
struct OptimizedGeneticData {
    packed_traits: u128,     // Pack multiple traits into bits
    complexity: u8,          // Single byte for complexity
    generation: u8,          // Single byte for generation
}

// vs inefficient storage
#[derive(Component)]
struct UnoptimizedGeneticData {
    traits: Array<Trait>,    // Dynamic array (expensive)
    complexity: u32,         // Full u32
    generation: u32,         // Full u32
}
```

## Advanced Mechanics

### Complexity Regeneration

Pieces can shed complexity over time:

```cairo
fn regenerate_complexity(
    piece: Piece,
    turns_since_capture: u64
) -> Piece {
    // Lose 5 complexity every 10 turns without capture
    if turns_since_capture >= 10 {
        let reduction = (turns_since_capture / 10) * 5;
        piece.complexity = max(MIN_COMPLEXITY, piece.complexity - reduction);
    }
    
    return piece;
}
```

### Complexity Trading

Trade traits for complexity:

```cairo
fn trade_trait_for_complexity(
    piece: Piece,
    trait_to_remove: Trait
) -> Result<Piece, TradeError> {
    if !piece.has_trait(trait_to_remove) {
        return Result::Err(TradeError::TraitNotFound);
    }
    
    piece.remove_trait(trait_to_remove);
    piece.complexity -= trait_to_remove.cost;
    piece.available_complexity += trait_to_remove.cost;
    
    return Result::Ok(piece);
}
```

### Budget Upgrades

Increase budget through achievements:

```cairo
fn check_budget_upgrade(
    piece: Piece,
    achievements: Achievements
) -> Piece {
    // Capture 5 pieces: +10 budget
    if achievements.captures >= 5 && piece.max_complexity < 110 {
        piece.max_complexity += 10;
    }
    
    // Reach generation 5: +10 budget
    if piece.generation >= 5 && piece.max_complexity < 120 {
        piece.max_complexity += 10;
    }
    
    return piece;
}
```

## Examples

### Example 1: Smart Capture Sequence

```
Turn 1: Knight (30/100) captures Pawn
  → Knight (35/100) [Leap, ForwardStep]

Turn 3: Knight (35/100) captures Bishop
  → Knight (60/100) [Leap, ForwardStep, Diagonal]

Turn 5: Knight (60/100) captures Rook
  → Knight (85/100) [Leap, ForwardStep, Diagonal, Straight]

Turn 7: Knight (85/100) captures Queen
  → BLOCKED (85 + 50 = 135 > 100)
  
Strategy: Skip capture or sacrifice first
```

### Example 2: Optimal Hybrid

```
Starting: Pawn (5/100)

Capture Sequence:
1. +Knight (20/100) [ForwardStep, Leap]
2. +Bishop (45/100) [ForwardStep, Leap, Diagonal]
3. +Rook (70/100) [ForwardStep, Leap, Diagonal, Straight]
4. +ExtendedRange x2 (90/100) [+2 range]

Result: 90/100, highly versatile piece
```

### Example 3: Budget Management

```
Current: Hybrid (92/100)
Opponent offers: Pawn (5)

Analysis:
- 92 + 5 = 97/100 ✓ (Valid)
- But ForwardStep trait is redundant
- Net gain: 0 traits, +5 complexity

Decision: SKIP capture (not worth it)
```

## Next Steps

- [Reference: ECS Components](../reference/ecs-components.md)
- [Guides: Development](../guides/development.md)
