# ECS Design

The Gambit Engine uses the Entity-Component-System (ECS) pattern via the Dojo framework. This document explains the ECS architecture in detail.

## ECS Fundamentals

### Entities

Entities are unique identifiers representing game objects:

- **Pieces**: Knights, Bishops, Rooks, Queens, Kings, Pawns
- **Players**: White and Black players
- **Board Squares**: 64 positions on the chess board
- **Game Sessions**: Individual match instances

### Components

Components are pure data structures attached to entities:

#### Piece Components

```cairo
#[derive(Component)]
struct Piece {
    piece_type: PieceType,      // Knight, Bishop, etc.
    color: Color,               // White or Black
    position: Position,         // Current board square
    is_alive: bool,             // Still in play
}

#[derive(Component)]
struct GeneticData {
    inherited_traits: Array<Trait>,  // Acquired abilities
    complexity_cost: u32,            // Gas budget usage
    generation: u32,                 // Mutation generation
}

#[derive(Component)]
struct MovementRules {
    base_moves: Array<MovePattern>,     // Standard movement
    bonus_moves: Array<MovePattern>,    // Inherited abilities
    hidden_moves: Array<MovePattern>,   // ZK-Fog abilities
}
```

#### Board Components

```cairo
#[derive(Component)]
struct Position {
    file: u8,   // a-h (0-7)
    rank: u8,   // 1-8 (0-7)
}

#[derive(Component)]
struct SquareState {
    occupant: Option<EntityId>,  // Piece on this square
    is_attacked_white: bool,     // Controlled by white
    is_attacked_black: bool,     // Controlled by black
}
```

#### Game Components

```cairo
#[derive(Component)]
struct GameState {
    current_turn: Color,
    move_count: u32,
    is_check: bool,
    is_checkmate: bool,
    is_stalemate: bool,
}

#[derive(Component)]
struct Player {
    address: ContractAddress,
    color: Color,
    captured_pieces: Array<EntityId>,
    remaining_time: u64,
}
```

### Systems

Systems contain the game logic and operate on entities with specific components:

#### MoveValidationSystem

Validates legal moves:

```cairo
#[derive(System)]
struct MoveValidationSystem {
    fn validate_move(
        piece: Piece,
        movement: MovementRules,
        from: Position,
        to: Position,
        board: BoardState
    ) -> Result<MoveValidity, MoveError>
}
```

#### CaptureResolutionSystem

Handles piece captures and genetic splicing:

```cairo
#[derive(System)]
struct CaptureResolutionSystem {
    fn resolve_capture(
        attacker: (Piece, GeneticData),
        defender: (Piece, GeneticData),
        game_state: GameState
    ) -> Result<SplicedPiece, CaptureError>
}
```

#### GeneticSplicingSystem

Manages trait inheritance:

```cairo
#[derive(System)]
struct GeneticSplicingSystem {
    fn splice_traits(
        source: GeneticData,
        target: GeneticData,
        complexity_budget: u32
    ) -> Result<GeneticData, SplicingError>
}
```

#### ZKFogSystem

Manages hidden information:

```cairo
#[derive(System)]
struct ZKFogSystem {
    fn reveal_hidden_ability(
        piece: Piece,
        movement: MovementRules,
        proof: StarkProof
    ) -> Result<RevealedMove, FogError>
}
```

## Entity Relationships

```
Game Session
    ├── Player (White)
    │   └── Pieces[] (King, Queen, Rooks, Bishops, Knights, Pawns)
    │
    ├── Player (Black)
    │   └── Pieces[] (King, Queen, Rooks, Bishops, Knights, Pawns)
    │
    └── Board
        └── Squares[] (64 positions)
```

## Dojo Manifests

Dojo uses manifests to define the world configuration:

```toml
[world]
name = "Gambit Engine"
description = "DNA-encoded on-chain chess RPG"

[contracts]
piece = { path = "src/piece" }
board = { path = "src/board" }
game = { path = "src/game" }
genetics = { path = "src/genetics" }
```

## State Management

### On-Chain State

Stored in Cairo contracts:

- Piece positions
- Genetic data
- Game state
- Move history

### Indexed State

Queried via Torii:

- Player statistics
- Historical games
- Leaderboards
- Analytics

## Performance Considerations

### Complexity Budgets

Each piece has a complexity limit to manage gas costs:

```cairo
const MAX_COMPLEXITY: u32 = 100;

struct ComplexityBudget {
    base_cost: u32,      // Standard piece cost
    trait_cost: u32,     // Inherited trait cost
    zk_cost: u32,        // ZK-Fog ability cost
    total: u32,          // Must be <= MAX_COMPLEXITY
}
```

### Batch Operations

Multiple moves processed in single transaction where possible:

- Castling (King + Rook)
- En passant (Pawn capture + state update)
- Promotion (Pawn removal + new piece creation)

## Next Steps

- [Smart Contracts](smart-contracts.md) - Contract implementation details
- [Genetic Splicing](../mechanics/genetic-splicing.md) - Trait inheritance mechanics
