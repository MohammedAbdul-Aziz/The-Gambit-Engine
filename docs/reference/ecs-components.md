# Dojo ECS Components Reference

Complete reference for all Entity-Component-System components in The Gambit Engine.

## Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENT CATEGORIES                     │
├─────────────────────────────────────────────────────────────┤
│  Core Components         │ Piece identity and state        │
│  Genetic Components      │ Trait inheritance and DNA       │
│  Movement Components     │ Move patterns and validation    │
│  Game Components         │ Game state and configuration    │
│  ZK Components           │ Hidden abilities and proofs     │
│  AI Components           │ Ghost piece behavior            │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### Piece

Identifies an entity as a chess piece.

```cairo
#[derive(Component, Drop, Serde)]
struct Piece {
    id: u32,
    piece_type: PieceType,
    color: Color,
    position: Position,
    is_alive: bool,
    owner: ContractAddress,
    game_id: u64,
}
```

**Fields:**
- `id`: Unique piece identifier
- `piece_type`: Base piece type (Pawn, Knight, etc.)
- `color`: Piece color (White/Black)
- `position`: Current board position
- `is_alive`: Whether piece is still in play
- `owner`: Address of controlling player
- `game_id`: Associated game session

---

### Position

Board coordinates for a piece.

```cairo
#[derive(Component, Drop, Serde, Copy)]
struct Position {
    file: u8,  // 0-7 (a-h)
    rank: u8,  // 0-7 (1-8)
}
```

**Helper Functions:**
```cairo
fn position_to_index(pos: Position) -> u8 {
    pos.rank * 8 + pos.file
}

fn index_to_position(index: u8) -> Position {
    Position {
        file: index % 8,
        rank: index / 8,
    }
}

fn is_valid_position(pos: Position) -> bool {
    pos.file < 8 && pos.rank < 8
}
```

---

### Square

Represents a board square.

```cairo
#[derive(Component, Drop, Serde, Copy)]
struct Square {
    file: u8,
    rank: u8,
    occupant: Option<u32>,      // Piece ID if occupied
    is_attacked_white: bool,
    is_attacked_black: bool,
}
```

---

## Genetic Components

### GeneticData

Stores inherited genetic information.

```cairo
#[derive(Component, Drop, Serde)]
struct GeneticData {
    piece_id: u32,
    inherited_traits: Array<Trait>,
    complexity_cost: u32,
    max_complexity: u32,
    generation: u32,
    parent_ids: Array<u32>,
    capture_count: u32,
}
```

**Fields:**
- `piece_id`: Reference to parent Piece component
- `inherited_traits`: Array of acquired traits
- `complexity_cost`: Current complexity usage
- `max_complexity`: Maximum allowed complexity (default: 100)
- `generation`: Number of captures/generations
- `parent_ids`: IDs of pieces this piece has captured
- `capture_count`: Total captures made

---

### Trait

Defines a specific ability or movement pattern.

```cairo
#[derive(Drop, Serde, Clone)]
struct Trait {
    name: TraitName,
    cost: u32,
    data: Array<felt252>,
    is_hidden: bool,
    is_revealed: bool,
}
```

**TraitName Enum:**
```cairo
#[derive(Drop, Serde, Clone, PartialEq)]
enum TraitName {
    // Base movement
    ForwardStep,
    Leap,
    Diagonal,
    Straight,
    Combined,
    Adjacent,
    
    // Enhanced
    ExtendedRange,
    PhantomLeap,
    DoubleMove,
    Teleport,
    ShadowStep,
    
    // ZK-Fog
    HiddenAbility,
    CommitReveal,
    
    // Ghost
    Ethereal,
    AutonomousAI,
    Evolution,
    
    // Special
    Shield,
    Mirror,
    Regeneration,
}
```

---

### ComplexityBudget

Tracks complexity resource usage.

```cairo
#[derive(Component, Drop, Serde, Copy)]
struct ComplexityBudget {
    base_cost: u32,
    trait_cost: u32,
    zk_cost: u32,
    ai_cost: u32,
    total: u32,
    max: u32,
}
```

**Validation:**
```cairo
fn is_within_budget(budget: ComplexityBudget) -> bool {
    budget.total <= budget.max
}

fn get_available_budget(budget: ComplexityBudget) -> u32 {
    budget.max - budget.total
}
```

---

## Movement Components

### MovementRules

Defines valid movement patterns.

```cairo
#[derive(Component, Drop, Serde)]
struct MovementRules {
    piece_id: u32,
    base_patterns: Array<MovePattern>,
    bonus_patterns: Array<MovePattern>,
    hidden_patterns: Array<MovePattern>,
    move_count: u32,
    last_move: Option<Move>,
}
```

---

### MovePattern

Describes a movement pattern.

```cairo
#[derive(Drop, Serde, Clone)]
struct MovePattern {
    pattern_type: PatternType,
    directions: Array<Direction>,
    min_range: u8,
    max_range: u8,
    can_capture: bool,
    can_move_through: bool,
}
```

**PatternType:**
```cairo
#[derive(Drop, Serde, Clone, PartialEq)]
enum PatternType {
    Slide,      // Continuous (Rook, Bishop)
    Step,       // Single square (King, Pawn)
    Leap,       // Fixed jump (Knight)
    Special,    // Unique (Castling, En Passant)
}
```

**Direction:**
```cairo
#[derive(Drop, Serde, Clone, Copy, PartialEq)]
enum Direction {
    North,
    South,
    East,
    West,
    Northeast,
    Northwest,
    Southeast,
    Southwest,
}
```

---

### ValidMoves

Cached valid moves for a piece.

```cairo
#[derive(Component, Drop, Serde)]
struct ValidMoves {
    piece_id: u32,
    moves: Array<Position>,
    captures: Array<Position>,
    last_updated: u64,
    is_stale: bool,
}
```

---

## Game Components

### GameState

Tracks overall game state.

```cairo
#[derive(Component, Drop, Serde)]
struct GameState {
    game_id: u64,
    current_turn: ContractAddress,
    move_count: u32,
    is_check: bool,
    is_checkmate: bool,
    is_stalemate: bool,
    winner: Option<ContractAddress>,
    halfmove_clock: u32,
    fullmove_number: u32,
}
```

---

### GameConfig

Game configuration and rules.

```cairo
#[derive(Component, Drop, Serde)]
struct GameConfig {
    game_id: u64,
    max_complexity: u32,
    ghost_enabled: bool,
    ghost_count: u8,
    zk_fog_enabled: bool,
    time_control: TimeControl,
    complexity_overflow: OverflowStrategy,
}
```

---

### Player

Player information and stats.

```cairo
#[derive(Component, Drop, Serde)]
struct Player {
    address: ContractAddress,
    color: Color,
    game_id: u64,
    pieces: Array<u32>,
    captured_pieces: Array<u32>,
    total_complexity_gained: u32,
    captures: u32,
    moves_made: u32,
    remaining_time: u64,
}
```

---

### Turn

Tracks turn information.

```cairo
#[derive(Component, Drop, Serde, Copy)]
struct Turn {
    game_id: u64,
    current_player: ContractAddress,
    turn_number: u32,
    started_at: u64,
    time_remaining: u64,
}
```

---

## ZK Components

### HiddenCommitment

Commitment to a hidden ability.

```cairo
#[derive(Component, Drop, Serde)]
struct HiddenCommitment {
    piece_id: u32,
    ability_hash: felt252,
    timestamp: u64,
    revealed: bool,
    expiry_turn: u32,
}
```

---

### ProofData

Stored proof information.

```cairo
#[derive(Component, Drop, Serde)]
struct ProofData {
    proof_id: u32,
    proof_type: ProofType,
    public_inputs: Array<felt252>,
    proof_hash: felt252,
    verified: bool,
    verified_at: u64,
}
```

**ProofType:**
```cairo
#[derive(Drop, Serde, Clone, PartialEq)]
enum ProofType {
    HiddenMove,
    AIDecision,
    GeneticSplicing,
    Custom,
}
```

---

### ZKConfig

ZK-Fog configuration.

```cairo
#[derive(Component, Drop, Serde, Copy)]
struct ZKConfig {
    enabled: bool,
    max_commitments_per_piece: u8,
    commitment_expiry_turns: u32,
    max_reveals_per_turn: u8,
}
```

---

## AI Components

### GhostPiece

AI-controlled piece entity.

```cairo
#[derive(Component, Drop, Serde)]
struct GhostPiece {
    id: u32,
    piece_type: PieceType,
    position: Position,
    ai_model_hash: felt252,
    decision_seed: felt252,
    aggression_level: u8,
    target_priority: TargetPriority,
    movement_strategy: MovementStrategy,
    last_move_turn: u64,
    move_frequency: u64,
}
```

---

### AIConfig

AI behavior configuration.

```cairo
#[derive(Component, Drop, Serde)]
struct AIConfig {
    ghost_id: u32,
    model_hash: felt252,
    aggression: u8,
    target_priority: TargetPriority,
    movement_strategy: MovementStrategy,
    learning_enabled: bool,
    difficulty: u8,
}
```

**TargetPriority:**
```cairo
#[derive(Drop, Serde, Clone, PartialEq)]
enum TargetPriority {
    King,
    HighValueHybrid,
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,
    Random,
}
```

**MovementStrategy:**
```cairo
#[derive(Drop, Serde, Clone, PartialEq)]
enum MovementStrategy {
    CenterControl,
    EdgePatrol,
    HuntMode,
    Defensive,
    Random,
}
```

---

### AIDecision

AI decision output.

```cairo
#[derive(Drop, Serde)]
struct AIDecision {
    ghost_id: u32,
    decision_type: DecisionType,
    target_position: Position,
    confidence: u8,
    proof: StarkProof,
}
```

---

## System Queries

### Example Queries

```cairo
// Get all pieces for a player
fn get_player_pieces(
    world: @World,
    player: ContractAddress
) -> Array<Piece> {
    let query = world.query::<Piece>();
    query.filter(|p| p.owner == player);
    query.execute()
}

// Get all hybrid pieces (generation > 1)
fn get_hybrid_pieces(
    world: @World
) -> Array<(Piece, GeneticData)> {
    let query = world.query::<(Piece, GeneticData)>();
    query.filter(|(_, g)| g.generation > 1);
    query.execute()
}

// Get pieces within complexity budget
fn get_pieces_with_budget(
    world: @World,
    min_available: u32
) -> Array<(Piece, GeneticData, ComplexityBudget)> {
    let query = world.query::<(Piece, GeneticData, ComplexityBudget)>();
    query.filter(|(_, _, b)| b.max - b.total >= min_available);
    query.execute()
}
```

---

## Next Steps

- [Torii Indexer](torii-indexer.md) - Querying component data
- [Giza Integration](giza-integration.md) - AI component usage
