# ZK-Fog System

The ZK-Fog (Zero-Knowledge Fog) system introduces strategic uncertainty to The Gambit Engine by allowing players to conceal abilities and moves until execution, verified through STARK proofs.

## Overview

Traditional chess is a game of **perfect information** - all pieces and their capabilities are visible to both players. The ZK-Fog system transforms this into **dynamic uncertainty**, where hidden abilities and secret strategies create a fog of war.

## Core Concepts

### 1. Hidden Enchantments

Pieces can have concealed abilities that remain hidden until revealed:

```
Visible Information:
┌───┬───┬───┬───┬───┬───┬───┬───┐
│   │   │   │   │   │   │   │   │
│   │   │   │ N │   │   │   │   │  ← Knight (visible)
│   │   │   │   │   │   │   │   │
└───┴───┴───┴───┴───┴───┴───┴───┘

Hidden Information (only owner knows):
- Knight has "3-Square Leap" enchantment
- Can jump 3 squares instead of 2
- Revealed only when executed
```

### 2. Commit-Reveal Scheme

Hidden moves use a two-phase commit-reveal pattern:

```
Phase 1: Commit
┌─────────────────────────────────┐
│ Player calculates hidden move   │
│ Generates STARK proof           │
│ Commits hash to chain           │
│ Move remains concealed          │
└─────────────────────────────────┘
              │
              ▼
Phase 2: Reveal
┌─────────────────────────────────┐
│ Player reveals move             │
│ Submits proof for verification  │
│ Contract verifies proof         │
│ Move executed, ability revealed │
└─────────────────────────────────┘
```

### 3. STARK Proofs

Zero-knowledge proofs verify hidden moves without revealing information prematurely:

```cairo
struct HiddenMoveProof {
    move_hash: felt252,           // Commitment to the move
    ability_hash: felt252,        // Commitment to the ability
    proof_data: Array<felt252>,   // STARK proof
    public_inputs: Array<felt252>, // Public verification data
}
```

## Hidden Ability Types

### Movement Enchantments

| Ability | Description | Complexity |
|---------|-------------|------------|
| **Extended Leap** | Knight jumps 3 squares | 15 |
| **Shadow Step** | Move through occupied squares | 20 |
| **Blink** | Teleport to adjacent square | 25 |
| **Double Move** | Move twice in one turn | 35 |
| **Time Warp** | Undo last move once | 40 |

### Defensive Enchantments

| Ability | Description | Complexity |
|---------|-------------|------------|
| **Shield** | Immune to one capture | 30 |
| **Phantom** | Cannot be targeted | 25 |
| **Mirror** | Reflect capture attempt | 35 |

### Offensive Enchantments

| Ability | Description | Complexity |
|---------|-------------|------------|
| **Assassinate** | Capture without moving | 40 |
| **Corrupt** | Steal trait without capture | 45 |
| **Nuke** | Destroy all adjacent pieces | 50 |

## Implementation

### Committing a Hidden Ability

```cairo
#[external(v0)]
fn commit_hidden_ability(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32,
    ability_hash: felt252
) {
    // Verify caller is piece owner
    let player = get_caller_address();
    let piece = self.pieces.read(piece_id);
    assert(piece.owner == player, "Not piece owner");
    
    // Verify game state
    let game = self.games.read(game_id);
    assert(game.current_turn == player, "Not your turn");
    
    // Store commitment
    let commitment = HiddenCommitment {
        piece_id,
        ability_hash,
        timestamp: block_number,
        revealed: false,
    };
    
    self.hidden_commitments.write(piece_id, commitment);
    
    // Emit event
    self.emit(HiddenAbilityCommitted {
        game_id,
        piece_id,
        ability_hash,
    });
}
```

### Revealing a Hidden Ability

```cairo
#[external(v0)]
fn reveal_hidden_ability(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32,
    move_data: Move,
    proof: StarkProof
) {
    // Retrieve commitment
    let commitment = self.hidden_commitments.read(piece_id);
    assert(!commitment.revealed, "Already revealed");
    
    // Verify STARK proof
    let is_valid = self.verify_stark_proof(
        proof,
        commitment.ability_hash,
        move_data
    );
    assert(is_valid, "Invalid proof");
    
    // Execute the move
    self.execute_move(game_id, move_data);
    
    // Mark as revealed
    commitment.revealed = true;
    self.hidden_commitments.write(piece_id, commitment);
    
    // Emit event
    self.emit(HiddenAbilityRevealed {
        game_id,
        piece_id,
        move_data,
    });
}
```

### Proof Verification

```cairo
fn verify_stark_proof(
    self: @ContractState,
    proof: StarkProof,
    commitment: felt252,
    move_data: Move
) -> bool {
    // Build verification key
    let vk = self.get_verification_key();
    
    // Build public inputs
    let mut public_inputs = array![
        commitment,
        move_data.piece_id,
        move_data.from.file,
        move_data.from.rank,
        move_data.to.file,
        move_data.to.rank,
    ];
    
    // Verify with STARK verifier
    let is_valid = starknet::verify_stark(
        vk,
        proof,
        public_inputs
    );
    
    return is_valid;
}
```

## Strategic Implications

### 1. Bluffing

Players can commit to fake abilities:

```
Strategy: False Flag
1. Commit hash for "Teleport" ability
2. Opponent plays defensively expecting teleport
3. Reveal with normal Knight move
4. Opponent wasted turns preparing for non-existent threat
```

### 2. Information Asymmetry

```
Player A knows:
- Has 3 hidden abilities committed
- Opponent doesn't know which pieces or what abilities

Player B knows:
- 3 commitments exist
- Must play conservatively until revealed
```

### 3. Timing Games

```
Early Game:
- Commit multiple abilities
- Build complex strategies

Mid Game:
- Reveal at critical moments
- Create tactical surprises

Late Game:
- Hidden abilities as win conditions
- Force opponent mistakes
```

## Gas Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Commit Ability | ~5,000 | Storage write + event |
| Reveal Ability | ~15,000 | Proof verification + move execution |
| Proof Verification | ~10,000 | STARK verification |
| Standard Move | ~3,000 | No proof required |

## Limitations

### 1. Commitment Expiry

Hidden commitments expire after N turns:

```cairo
const COMMITMENT_EXPIRY: u64 = 10;

fn check_commitment_expiry(commitment: HiddenCommitment) {
    let age = block_number - commitment.timestamp;
    assert(age < COMMITMENT_EXPIRY, "Commitment expired");
}
```

### 2. One Reveal Per Turn

Only one hidden ability can be revealed per turn:

```cairo
fn check_reveal_limit(game: Game) {
    assert(
        game.reveals_this_turn < 1,
        "Already revealed this turn"
    );
}
```

### 3. Complexity Budget

Hidden abilities count toward piece complexity:

```
Knight (base: 15) + Hidden Teleport (25) = 40/100
```

## Example Game Flow

```
Turn 1 (White):
- Knight to f3 (standard move)
- Commit hidden "Extended Leap" for Knight

Turn 1 (Black):
- Pawn to e5 (standard move)
- No commitments

Turn 2 (White):
- Reveal Extended Leap: Knight f3 → g5 (3-square jump)
- Threatens f7 pawn

Turn 2 (Black):
- Responds to unexpected threat
- Commit hidden "Shield" for f7 pawn

Turn 3 (White):
- Standard Queen move
- No commitments

Turn 3 (Black):
- Reveal Shield: Knight capture attempt fails
- Pawn survives!
```

## Next Steps

- [Zero-Knowledge Proofs](../advanced/zk-proofs.md) - Deep dive into STARKs
- [Ghost Pieces](../advanced/ghost-pieces.md) - AI with hidden abilities
