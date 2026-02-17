# Cairo Contracts Reference

API reference for The Gambit Engine's Cairo smart contracts.

## Contract Addresses

| Contract | Mainnet | Testnet | Devnet |
|----------|---------|---------|--------|
| Game | `0x...` | `0x...` | `0x...` |
| Piece | `0x...` | `0x...` | `0x...` |
| Genetics | `0x...` | `0x...` | `0x...` |
| ZKFog | `0x...` | `0x...` | `0x...` |

## Game Contract

### `create_game`

Creates a new game session.

```cairo
fn create_game(
    ref self: ContractState,
    player_white: ContractAddress,
    config: GameConfig
) -> u64;
```

**Parameters:**
- `player_white`: Address of the white player
- `config`: Game configuration (ghost pieces, complexity limits, etc.)

**Returns:**
- `u64`: Unique game ID

**Events:**
```cairo
GameCreated {
    game_id: u64,
    player_white: ContractAddress,
    config: GameConfig,
    created_at: u64,
}
```

---

### `join_game`

Join an existing game as black player.

```cairo
fn join_game(
    ref self: ContractState,
    game_id: u64,
    player_black: ContractAddress
);
```

**Parameters:**
- `game_id`: ID of the game to join
- `player_black`: Address of the black player

**Events:**
```cairo
GameJoined {
    game_id: u64,
    player_black: ContractAddress,
    joined_at: u64,
}
```

---

### `make_move`

Execute a move in the game.

```cairo
fn make_move(
    ref self: ContractState,
    game_id: u64,
    move: Move
);
```

**Parameters:**
- `game_id`: ID of the game
- `move`: Move data structure

**Move Structure:**
```cairo
struct Move {
    piece_id: u32,
    from: Position,
    to: Position,
    is_special: bool,
    special_data: SpecialMove,
    zk_proof: Option<StarkProof>,
}
```

**Events:**
```cairo
MoveMade {
    game_id: u64,
    piece_id: u32,
    from: Position,
    to: Position,
    is_capture: bool,
    turn: u32,
}
```

---

### `get_game_state`

Retrieve current game state.

```cairo
fn get_game_state(
    self: @TContractState,
    game_id: u64
) -> GameState;
```

**Returns:**
```cairo
struct GameState {
    id: u64,
    player_white: ContractAddress,
    player_black: ContractAddress,
    current_turn: ContractAddress,
    move_count: u32,
    is_check: bool,
    is_checkmate: bool,
    is_stalemate: bool,
    winner: Option<ContractAddress>,
    created_at: u64,
    last_move_at: u64,
}
```

---

## Piece Contract

### `create_piece`

Create a new piece entity.

```cairo
fn create_piece(
    ref self: ContractState,
    game_id: u64,
    piece_type: PieceType,
    color: Color,
    position: Position
) -> u32;
```

**Returns:**
- `u32`: Unique piece ID

---

### `validate_move`

Validate if a move is legal.

```cairo
fn validate_move(
    self: @TContractState,
    piece_id: u32,
    from: Position,
    to: Position
) -> MoveValidity;
```

**Returns:**
```cairo
enum MoveValidity {
    Valid,
    Invalid: MoveError,
}

enum MoveError {
    OutOfBounds,
    Blocked,
    SameColor,
    WrongPattern,
    InCheck,
    ThroughCheck,
}
```

---

### `get_valid_moves`

Get all valid moves for a piece.

```cairo
fn get_valid_moves(
    self: @TContractState,
    piece_id: u32
) -> Array<Position>;
```

---

### `get_piece_data`

Retrieve complete piece data.

```cairo
fn get_piece_data(
    self: @TContractState,
    piece_id: u32
) -> PieceData;
```

**Returns:**
```cairo
struct PieceData {
    id: u32,
    piece_type: PieceType,
    color: Color,
    position: Position,
    is_alive: bool,
    genetic_data: GeneticData,
    movement_rules: MovementRules,
    complexity: u32,
    generation: u32,
}
```

---

## Genetics Contract

### `splice_on_capture`

Execute genetic splicing after capture.

```cairo
fn splice_on_capture(
    ref self: ContractState,
    attacker_id: u32,
    defender_id: u32
) -> SplicingResult;
```

**Returns:**
```cairo
struct SplicingResult {
    success: bool,
    new_traits: Array<Trait>,
    new_complexity: u32,
    new_generation: u32,
    error: Option<SplicingError>,
}
```

---

### `get_inherited_traits`

Get all inherited traits for a piece.

```cairo
fn get_inherited_traits(
    self: @TContractState,
    piece_id: u32
) -> Array<Trait>;
```

---

### `calculate_complexity`

Calculate current complexity for a piece.

```cairo
fn calculate_complexity(
    self: @TContractState,
    piece_id: u32
) -> ComplexityBudget;
```

---

### `can_inherit_trait`

Check if a piece can inherit a specific trait.

```cairo
fn can_inherit_trait(
    self: @TContractState,
    piece_id: u32,
    trait: Trait
) -> bool;
```

---

## ZK-Fog Contract

### `commit_hidden_ability`

Commit to a hidden ability.

```cairo
fn commit_hidden_ability(
    ref self: ContractState,
    piece_id: u32,
    ability_hash: felt252
);
```

---

### `reveal_ability`

Reveal a hidden ability with proof.

```cairo
fn reveal_ability(
    ref self: ContractState,
    piece_id: u32,
    move: Move,
    proof: StarkProof
);
```

---

### `verify_proof`

Verify a STARK proof.

```cairo
fn verify_proof(
    self: @TContractState,
    proof: StarkProof,
    public_inputs: Array<felt252>
) -> bool;
```

---

### `get_commitment`

Get commitment data for a piece.

```cairo
fn get_commitment(
    self: @TContractState,
    piece_id: u32
) -> Commitment;
```

**Returns:**
```cairo
struct Commitment {
    piece_id: u32,
    ability_hash: felt252,
    timestamp: u64,
    revealed: bool,
}
```

---

## Ghost Contract

### `spawn_ghost`

Spawn a new ghost piece.

```cairo
fn spawn_ghost(
    ref self: ContractState,
    game_id: u64,
    config: GhostConfig
) -> u32;
```

---

### `execute_ghost_turn`

Execute all ghost moves for a turn.

```cairo
fn execute_ghost_turn(
    ref self: ContractState,
    game_id: u64
);
```

---

### `get_ghost_data`

Get ghost piece data.

```cairo
fn get_ghost_data(
    self: @TContractState,
    ghost_id: u32
) -> GhostData;
```

---

## Data Structures

### PieceType

```cairo
enum PieceType {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}
```

### Color

```cairo
enum Color {
    White,
    Black,
}
```

### Position

```cairo
struct Position {
    file: u8,  // 0-7 (a-h)
    rank: u8,  // 0-7 (1-8)
}
```

### Trait

```cairo
struct Trait {
    name: TraitName,
    cost: u32,
    data: Array<felt252>,
}

enum TraitName {
    ForwardStep,
    Leap,
    Diagonal,
    Straight,
    Combined,
    Adjacent,
    ExtendedRange,
    PhantomLeap,
    DoubleMove,
    Teleport,
    HiddenAbility,
    Ethereal,
    AutonomousAI,
}
```

### SpecialMove

```cairo
enum SpecialMove {
    None,
    CastleKing,
    CastleQueen,
    EnPassant,
    Promotion: PieceType,
}
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 1 | `GAME_NOT_FOUND` | Game ID does not exist |
| 2 | `NOT_PLAYER_TURN` | Caller is not current turn player |
| 3 | `INVALID_MOVE` | Move violates chess rules |
| 4 | `COMPLEXITY_EXCEEDED` | Trait would exceed budget |
| 5 | `PROOF_INVALID` | STARK proof verification failed |
| 6 | `COMMITMENT_EXPIRED` | Hidden commitment expired |
| 7 | `NOT_PIECE_OWNER` | Caller does not own piece |
| 8 | `GAME_ALREADY_COMPLETE` | Game has ended |

---

## Next Steps

- [Dojo ECS Components](ecs-components.md) - Component reference
- [Development Guide](../guides/development.md) - Building with contracts
