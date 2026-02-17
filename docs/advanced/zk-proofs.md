# Zero-Knowledge Proofs

This document provides a deep dive into the zero-knowledge proof system powering The Gambit Engine's ZK-Fog and verifiable AI features.

## Overview

Zero-knowledge proofs allow The Gambit Engine to verify hidden information without revealing it, enabling:

- **Hidden abilities** that remain secret until execution
- **Verifiable AI** decisions without exposing model internals
- **Private strategies** with public verifiability

## STARK Proofs in Gambit

The Gambit Engine uses **STARKs** (Scalable Transparent Arguments of Knowledge) for zero-knowledge proofs:

```
┌─────────────────────────────────────────────────────────────┐
│                    STARK PROOF FLOW                         │
│                                                             │
│  Prover (Player/AI)              Verifier (Contract)        │
│  ┌─────────────────┐             ┌─────────────────┐        │
│  │                 │             │                 │        │
│  │  Private Input  │             │  Public Input   │        │
│  │  - Hidden Move  │             │  - Commitment   │        │
│  │  - Ability Data │             │  - Board State  │        │
│  │                 │             │                 │        │
│  │  ┌───────────┐  │             │  ┌───────────┐  │        │
│  │  │  STARK    │  │   Proof     │  │  STARK    │  │        │
│  │  │  Prover   │──│────────────▶│  │  Verifier │  │        │
│  │  │           │  │             │  │           │  │        │
│  │  └───────────┘  │             │  └───────────┘  │        │
│  │                 │             │                 │        │
│  └─────────────────┘             └─────────────────┘        │
│         │                                  │                 │
│         ▼                                  ▼                 │
│  Generates Proof                    Verifies Proof           │
│  (~5 seconds)                       (~100ms)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Proof Types

### 1. Hidden Move Proofs

Proves a hidden move is valid without revealing the ability:

```cairo
struct HiddenMoveProof {
    // Public inputs (visible on-chain)
    public_inputs: HiddenMovePublicInputs,
    
    // Proof data (verified, not revealed)
    proof: StarkProof,
}

struct HiddenMovePublicInputs {
    commitment_hash: felt252,    // Hash of committed ability
    piece_id: u32,
    from_file: u8,
    from_rank: u8,
    to_file: u8,
    to_rank: u8,
    game_id: u64,
}
```

### 2. AI Decision Proofs

Proves AI made a valid decision according to its model:

```cairo
struct AIDecisionProof {
    public_inputs: AIPublicInputs,
    proof: StarkProof,
}

struct AIPublicInputs {
    model_hash: felt252,         // AI model identifier
    board_hash: felt252,         // Current board state
    decision_hash: felt252,      // AI's chosen move
    ghost_id: u32,
    game_id: u64,
}
```

### 3. Genetic Splicing Proofs

Proves genetic inheritance was calculated correctly:

```cairo
struct SplicingProof {
    public_inputs: SplicingPublicInputs,
    proof: StarkProof,
}

struct SplicingPublicInputs {
    attacker_id: u32,
    defender_id: u32,
    result_complexity: u32,
    trait_count: u8,
    within_budget: bool,
}
```

## Cairo Implementation

### Proof Verification

```cairo
#[starknet::interface]
trait IZKVerifier<TContractState> {
    fn verify_hidden_move_proof(
        self: @TContractState,
        proof: HiddenMoveProof
    ) -> bool;
    
    fn verify_ai_decision_proof(
        self: @TContractState,
        proof: AIDecisionProof
    ) -> bool;
    
    fn verify_splicing_proof(
        self: @TContractState,
        proof: SplicingProof
    ) -> bool;
}
```

### Verification Logic

```cairo
impl ZKVerifierImpl of IZKVerifier<ContractState> {
    fn verify_hidden_move_proof(
        self: @ContractState,
        proof: HiddenMoveProof
    ) -> bool {
        // Get verification key
        let vk = self.get_verification_key();
        
        // Verify the STARK proof
        let is_valid = starknet::verify_stark(
            vk,
            proof.proof,
            proof.public_inputs.serialize()
        );
        
        return is_valid;
    }
    
    fn verify_ai_decision_proof(
        self: @ContractState,
        proof: AIDecisionProof
    ) -> bool {
        // Get AI model's verification key
        let vk = self.get_ai_verification_key(
            proof.public_inputs.model_hash
        );
        
        // Verify the proof
        let is_valid = starknet::verify_stark(
            vk,
            proof.proof,
            proof.public_inputs.serialize()
        );
        
        return is_valid;
    }
}
```

## Proof Generation

### Client-Side Prover

Players generate proofs client-side before submitting:

```typescript
// TypeScript example using Giza SDK
import { GizaClient } from '@giza-network/sdk';

const giza = new GizaClient();

async function generateHiddenMoveProof(
  hiddenMove: HiddenMove,
  commitment: string
): Promise<HiddenMoveProof> {
  // Create proof inputs
  const inputs = {
    ability: hiddenMove.ability,
    moveData: hiddenMove.move,
    commitment: commitment,
  };
  
  // Generate STARK proof
  const proof = await giza.prove({
    modelId: 'hidden-move-v1',
    inputs,
    proofType: 'stark',
  });
  
  return {
    publicInputs: {
      commitmentHash: commitment,
      pieceId: hiddenMove.pieceId,
      fromFile: hiddenMove.from.file,
      fromRank: hiddenMove.from.rank,
      toFile: hiddenMove.to.file,
      toRank: hiddenMove.to.rank,
      gameId: hiddenMove.gameId,
    },
    proof: proof.data,
  };
}
```

### Giza Network Integration

For AI decisions, Giza Network handles proof generation:

```typescript
import { GizaNetwork } from '@giza-network/core';

async function generateAIDecisionProof(
  ghostPiece: GhostPiece,
  boardState: BoardState
): Promise<AIDecisionProof> {
  const giza = new GizaNetwork();
  
  // Prepare AI inference request
  const request = {
    modelHash: ghostPiece.aiModelHash,
    inputs: encodeBoardState(boardState),
    seed: ghostPiece.decisionSeed,
  };
  
  // Get verifiable inference with proof
  const result = await giza.infer(request);
  
  return {
    publicInputs: {
      modelHash: request.modelHash,
      boardHash: hashBoardState(boardState),
      decisionHash: hashMove(result.move),
      ghostId: ghostPiece.id,
      gameId: ghostPiece.gameId,
    },
    proof: result.proof,
  };
}
```

## Commitment Scheme

### Commit Phase

```cairo
fn commit_ability(
    ref self: ContractState,
    piece_id: u32,
    ability_hash: felt252
) {
    // Create commitment with timestamp
    let commitment = Commitment {
        piece_id,
        ability_hash,
        timestamp: block_number,
        revealed: false,
    };
    
    // Store commitment
    self.commitments.write((piece_id, ability_hash), commitment);
    
    // Emit event for off-chain tracking
    self.emit(AbilityCommitted {
        piece_id,
        ability_hash,
        timestamp: block_number,
    });
}
```

### Reveal Phase

```cairo
fn reveal_ability(
    ref self: ContractState,
    piece_id: u32,
    move: Move,
    proof: StarkProof
) {
    // Retrieve commitment
    let commitment = self.commitments.read((piece_id, proof.public_inputs.commitment_hash));
    
    // Verify commitment exists and is unexpired
    assert(!commitment.revealed, "Already revealed");
    assert(block_number - commitment.timestamp < EXPIRY_TURNS, "Expired");
    
    // Verify the proof
    let is_valid = self.verify_stark_proof(proof);
    assert(is_valid, "Invalid proof");
    
    // Execute the move
    self.execute_move(move);
    
    // Mark as revealed
    commitment.revealed = true;
    self.commitments.write((piece_id, proof.public_inputs.commitment_hash), commitment);
    
    // Emit reveal event
    self.emit(AbilityRevealed {
        piece_id,
        move,
        revealed_at: block_number,
    });
}
```

## Cryptographic Primitives

### Hash Functions

```cairo
fn hash_ability(ability: Ability) -> felt252 {
    PoseidonTrait::new()
        .update(ability.type.into())
        .update(ability.parameters.serialize())
        .finalize()
}

fn hash_board_state(board: BoardState) -> felt252 {
    let mut hasher = PoseidonTrait::new();
    
    for square in board.squares {
        hasher.update(square.serialize());
    }
    
    hasher.finalize()
}
```

### Randomness

```cairo
fn get_decision_seed(game_id: u64, turn: u64) -> felt252 {
    // Combine game state with block randomness
    let game = self.games.read(game_id);
    
    PoseidonTrait::new()
        .update(game.id)
        .update(turn)
        .update(block_number)
        .finalize()
}
```

## Performance Considerations

### Proof Size

| Proof Type | Size | Verification Time |
|------------|------|-------------------|
| Hidden Move | ~20 KB | ~100ms |
| AI Decision | ~50 KB | ~200ms |
| Splicing | ~15 KB | ~80ms |

### Gas Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Proof Verification | ~10,000 | Per proof |
| Hash Computation | ~500 | Per hash |
| Storage Write | ~2,000 | Per slot |

### Optimization Strategies

1. **Batch Verification**: Verify multiple proofs in single transaction
2. **Proof Aggregation**: Combine related proofs into one
3. **Lazy Verification**: Verify only when challenged

## Security Considerations

### Proof Validity

- Always verify proofs before executing moves
- Check proof is for correct game state
- Ensure proof hasn't been reused

### Commitment Security

- Use cryptographically secure randomness
- Prevent commitment malleability
- Enforce expiry to prevent hoarding

### Replay Prevention

```cairo
fn check_not_revealed(
    commitment: Commitment
) {
    assert(!commitment.revealed, "Proof already used");
}

fn check_unique_proof(
    proof_hash: felt252
) {
    assert(
        !self.used_proofs.contains(proof_hash),
        "Proof replay detected"
    );
    self.used_proofs.insert(proof_hash);
}
```

## Next Steps

- [Ghost Pieces](ghost-pieces.md) - AI with verifiable decisions
- [Cairo Contracts](../reference/cairo-contracts.md) - Contract API reference
