# Smart Contracts

This document details the smart contract architecture of The Gambit Engine, implemented in Cairo on Starknet.

## Contract Structure

```
contracts/
├── src/
│   ├── lib.cairo              # Main contract entry point
│   ├── piece.cairo            # Piece logic and movement
│   ├── board.cairo            # Board state management
│   ├── game.cairo             # Game session control
│   ├── genetics.cairo         # Genetic splicing system
│   ├── zk_fog.cairo           # Zero-knowledge fog
│   └── ghost.cairo            # AI ghost pieces
├── manifests/
│   ├── base/
│   │   └── dojo_manifest.toml
│   └── dev/
│       └── dojo_manifest.toml
└── Scarb.toml
```

## Core Contracts

### Game Contract

Main entry point for game operations:

```cairo
#[starknet::interface]
trait IGambitGame<TContractState> {
    fn create_game(ref self: TContractState, player_white: ContractAddress) -> u64;
    fn join_game(ref self: TContractState, game_id: u64, player_black: ContractAddress);
    fn make_move(ref self: TContractState, game_id: u64, move: Move);
    fn resign(ref self: TContractState, game_id: u64);
    fn get_game_state(self: @TContractState, game_id: u64) -> GameState;
}
```

### Piece Contract

Handles piece logic and movement validation:

```cairo
#[starknet::interface]
trait IGambitPiece<TContractState> {
    fn create_piece(
        ref self: TContractState,
        game_id: u64,
        piece_type: PieceType,
        color: Color,
        position: Position
    ) -> u32;
    
    fn validate_move(
        self: @TContractState,
        piece_id: u32,
        from: Position,
        to: Position
    ) -> bool;
    
    fn get_valid_moves(
        self: @TContractState,
        piece_id: u32
    ) -> Array<Position>;
}
```

### Genetics Contract

Manages trait inheritance and splicing:

```cairo
#[starknet::interface]
trait IGambitGenetics<TContractState> {
    fn splice_on_capture(
        ref self: TContractState,
        attacker_id: u32,
        defender_id: u32
    ) -> SplicedTrait;
    
    fn get_inherited_traits(
        self: @TContractState,
        piece_id: u32
    ) -> Array<Trait>;
    
    fn calculate_complexity(
        self: @TContractState,
        piece_id: u32
    ) -> ComplexityBudget;
}
```

### ZK-Fog Contract

Handles hidden information and STARK proofs:

```cairo
#[starknet::interface]
trait IGambitZKFog<TContractState> {
    fn commit_hidden_ability(
        ref self: TContractState,
        piece_id: u32,
        ability_hash: felt252
    );
    
    fn reveal_ability(
        ref self: TContractState,
        piece_id: u32,
        proof: StarkProof
    ) -> Ability;
    
    fn verify_proof(
        self: @TContractState,
        proof: StarkProof
    ) -> bool;
}
```

## Key Data Structures

### Move

```cairo
#[derive(Copy, Drop, Serde)]
struct Move {
    piece_id: u32,
    from: Position,
    to: Position,
    is_special: bool,           // Castle, en passant, promotion
    special_data: SpecialMove,
    zk_proof: Option<StarkProof>,
}
```

### Trait

```cairo
#[derive(Copy, Drop, Serde)]
enum Trait {
    DiagonalLeap: bool,         // Bishop-like diagonal movement
    StraightLeap: bool,         // Rook-like straight movement
    KnightJump: bool,           // L-shaped movement
    ExtendedRange: u8,          // Additional squares of movement
    Teleport: bool,             // One-time teleport ability
    ShadowStep: bool,           // Move through pieces
}
```

### GeneticData

```cairo
#[derive(Copy, Drop, Serde)]
struct GeneticData {
    piece_id: u32,
    base_type: PieceType,
    inherited_traits: Array<Trait>,
    complexity_cost: u32,
    generation: u32,
    parent_ids: Array<u32>,
}
```

## Contract Interactions

### Creating a Game

```cairo
let game_id = game_contract.create_game(player_white);
game_contract.join_game(game_id, player_black);
```

### Making a Move

```cairo
let move = Move {
    piece_id: piece_id,
    from: Position { file: 0, rank: 1 },
    to: Position { file: 0, rank: 3 },
    is_special: false,
    special_data: SpecialMove::None,
    zk_proof: Option::None,
};

game_contract.make_move(game_id, move);
```

### Capture with Genetic Splicing

```cairo
// Capture triggers automatic splicing
game_contract.make_move(game_id, capture_move);

// Genetics contract handles trait inheritance
let spliced = genetics_contract.splice_on_capture(attacker, defender);

// Attacker gains defender's traits (within complexity budget)
```

## Security Considerations

### Access Control

- Only game participants can make moves
- Turn-based enforcement
- Reentrancy guards on state changes

### Validation

- All moves validated on-chain
- Genetic splicing rules enforced
- Complexity budgets prevent abuse

### Privacy

- ZK-Fog abilities hidden until revealed
- STARK proofs verify without exposing
- Commit-reveal scheme for hidden moves

## Gas Optimization

### Batch Operations

```cairo
fn batch_update_positions(
    ref self: TContractState,
    updates: Array<PositionUpdate>
);
```

### Efficient Storage

- Packed structs minimize storage slots
- Enums over separate booleans
- Sparse mapping for piece data

## Testing

### Unit Tests

```cairo
#[cfg(test)]
mod tests {
    #[test]
    fn test_knight_move_validation() {
        // Test implementation
    }
    
    #[test]
    fn test_genetic_splicing_complexity() {
        // Test implementation
    }
}
```

### Integration Tests

```cairo
#[test]
fn test_full_game_flow() {
    // Create game
    // Make moves
    // Capture with splicing
    // Verify final state
}
```

## Next Steps

- [Cairo Contracts Reference](../reference/cairo-contracts.md) - API documentation
- [Development Guide](../guides/development.md) - Building and deploying contracts
