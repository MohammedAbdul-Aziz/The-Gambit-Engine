# Verifiable AI: Ghost Pieces

Ghost Pieces are autonomous AI-controlled entities that operate on the chess board with their own on-chain logic, creating unpredictable and provably fair gameplay dynamics.

## Overview

Ghost Pieces represent a revolutionary fusion of AI and blockchain technology. Unlike traditional chess AI that runs off-chain, Ghost Pieces operate with **verifiable on-chain intelligence**, ensuring transparent and auditable decision-making.

## What Are Ghost Pieces?

```
┌─────────────────────────────────────────────────────────────┐
│                    GHOST PIECE                              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   On-Chain  │  │  Verifiable │  │  Autonomous │         │
│  │     AI      │  │    Logic    │  │   Behavior  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  • Moves independently of players                           │
│  • Follows programmed AI logic                              │
│  • All decisions provable on-chain                          │
│  • Can capture and be captured                              │
│  • Participates in genetic splicing                         │
└─────────────────────────────────────────────────────────────┘
```

## Core Features

### 1. Autonomous Movement

Ghost Pieces move according to their AI logic without player input:

```cairo
struct GhostPiece {
    id: u32,
    piece_type: PieceType,
    position: Position,
    ai_model_hash: felt252,      // Reference to AI model
    decision_seed: felt252,      // Provably random seed
    last_move_turn: u64,
    aggression_level: u8,        // 0-100 scale
    target_preference: TargetPriority,
}
```

### 2. Verifiable Decisions

All AI decisions are provable on-chain:

```cairo
struct AIDecisionProof {
    piece_id: u32,
    board_state_hash: felt252,
    decision_inputs: Array<felt252>,
    model_output_hash: felt252,
    execution_proof: StarkProof,
}
```

### 3. Giza Network Integration

Powered by Giza Network for verifiable AI inference:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Gambit     │────▶│    Giza      │────▶│   On-Chain   │
│   Contract   │     │   Network    │     │  Verification│
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │ 1. Request AI      │                    │
       │    Decision        │                    │
       │                    │ 2. Run Inference   │
       │                    │    On-Chain        │
       │                    │                    │
       │                    │ 3. Return Proof    │
       │                    │                    │
       │ 4. Verify &        │                    │
       │    Execute         │◀───────────────────│
       │                    │                    │
```

## AI Behavior Models

### Aggression Levels

| Level | Name | Behavior |
|-------|------|----------|
| 0-20 | Passive | Avoids conflict, defensive positioning |
| 21-40 | Cautious | Captures only when safe |
| 41-60 | Balanced | Standard chess AI behavior |
| 61-80 | Aggressive | Seeks captures, attacking play |
| 81-100 | Berserk | Prioritizes captures above all |

### Target Priorities

```cairo
enum TargetPriority {
    King,             // Highest priority
    HighValueHybrid,  // Pieces with high complexity
    Queen,
    Rook,
    Bishop,
    Knight,
    Pawn,             // Lowest priority
}
```

### Movement Strategies

```cairo
enum MovementStrategy {
    CenterControl,    // Prefer center squares
    EdgePatrol,       // Patrol board edges
    HuntMode,         // Actively pursue targets
    Defensive,        // Stay near king
    Random,           // Unpredictable movement
}
```

## Implementation

### Ghost Piece Creation

```cairo
#[external(v0)]
fn spawn_ghost_piece(
    ref self: ContractState,
    game_id: u64,
    piece_type: PieceType,
    position: Position,
    ai_config: AIConfig
) -> u32 {
    // Generate unique ghost ID
    let ghost_id = self.generate_ghost_id();
    
    // Create ghost piece entity
    let ghost = GhostPiece {
        id: ghost_id,
        piece_type,
        position,
        ai_model_hash: ai_config.model_hash,
        decision_seed: self.get_decision_seed(game_id),
        last_move_turn: 0,
        aggression_level: ai_config.aggression,
        target_preference: ai_config.target_priority,
    };
    
    // Store ghost piece
    self.ghost_pieces.write(ghost_id, ghost);
    
    // Emit event
    self.emit(GhostPieceSpawned {
        game_id,
        ghost_id,
        piece_type,
        position,
    });
    
    return ghost_id;
}
```

### AI Decision Cycle

```cairo
#[external(v0)]
fn execute_ghost_turn(
    ref self: ContractState,
    game_id: u64
) {
    let game = self.games.read(game_id);
    let ghosts = self.get_active_ghosts(game_id);
    
    for ghost in ghosts {
        // Check if ghost should move this turn
        if game.move_count % ghost.move_frequency != 0 {
            continue;
        }
        
        // Get current board state
        let board_state = self.get_board_state(game_id);
        
        // Generate AI decision
        let decision = self.generate_ai_decision(ghost, board_state);
        
        // Verify decision with Giza proof
        let is_valid = self.verify_giza_proof(decision.proof);
        assert(is_valid, "Invalid AI proof");
        
        // Execute the move
        self.execute_ghost_move(game_id, ghost.id, decision.move);
        
        // Update ghost state
        ghost.last_move_turn = game.move_count;
        self.ghost_pieces.write(ghost.id, ghost);
    }
}
```

### Decision Generation (Giza)

```cairo
fn generate_ai_decision(
    ghost: GhostPiece,
    board_state: BoardState
) -> AIDecision {
    // Build input features
    let mut features = array![
        ghost.position.file,
        ghost.position.rank,
        ghost.piece_type.into(),
        ghost.aggression_level,
        // ... board state features
    ];
    
    // Call Giza AI model
    let giza_input = GizaInput {
        model_hash: ghost.ai_model_hash,
        inputs: features,
        seed: ghost.decision_seed,
    };
    
    // Get AI inference with proof
    let (output, proof) = giza::infer(giza_input);
    
    // Parse output into move decision
    let move_data = parse_ai_output(output);
    
    return AIDecision {
        move: move_data,
        proof,
        confidence: output.confidence,
    };
}
```

## Strategic Implications

### 1. Third-Party Chaos

Ghost Pieces introduce unpredictable third-party interference:

```
Traditional Chess:
White vs Black (2 players)

Gambit with Ghosts:
White vs Black vs Ghost Piece AI (3+ actors)
```

### 2. Dynamic Difficulty

```cairo
fn adjust_ghost_difficulty(
    game: Game,
    player_skill: u32
) -> AIConfig {
    // Scale aggression based on player skill
    let aggression = player_skill / 10;
    
    // Add more ghosts for experienced players
    let ghost_count = player_skill / 100;
    
    return AIConfig {
        aggression,
        ghost_count,
        model_complexity: player_skill / 50,
    };
}
```

### 3. Alliance Possibilities

Players can temporarily align with Ghost behavior:

```
Strategy: Ghost Bait
1. Position valuable piece as bait
2. Ghost captures bait
3. Capture Ghost with hybrid piece
4. Gain Ghost's genetic traits
```

## Ghost Piece Types

### Standard Ghosts

| Type | Behavior | Complexity |
|------|----------|------------|
| **Wanderer** | Random movement | 10 |
| **Hunter** | Pursues high-value targets | 25 |
| **Guardian** | Defends specific squares | 20 |
| **Disruptor** | Targets key positions | 30 |

### Special Ghosts

| Type | Behavior | Complexity |
|------|----------|------------|
| **Poltergeist** | Invisible until move (ZK-Fog) | 40 |
| **Possessor** | Can take control of normal pieces | 50 |
| **Swarm** | Spawns multiple mini-ghosts | 45 |
| **Evolver** | Gains traits over time | 35 |

## Genetic Interaction

### Ghost Capture

When a player captures a Ghost Piece:

```cairo
fn on_ghost_captured(
    attacker: Piece,
    ghost: GhostPiece
) -> SplicingResult {
    // Ghosts have unique genetic signature
    let ghost_traits = extract_ghost_traits(ghost);
    
    // Splice into attacker
    let result = splice_traits(attacker, ghost_traits);
    
    // Ghost is removed (not resurrected)
    self.ghost_pieces.delete(ghost.id);
    
    // Emit event
    self.emit(GhostCaptured {
        attacker_id: attacker.id,
        ghost_id: ghost.id,
        traits_gained: result.new_traits,
    });
    
    return result;
}
```

### Ghost Genetic Traits

Ghosts can have unique traits not available to normal pieces:

```cairo
enum GhostTrait {
    Ethereal,        // Can pass through pieces
    Possession,      // Can possess captured pieces
    Resurrection,    // Chance to return after capture
    Haunt,           // Debuffs adjacent enemies
    Manifest,        // Becomes normal piece when captured
}
```

## Configuration

### Game Setup

```cairo
struct GhostConfig {
    enabled: bool,
    count: u8,
    aggression_range: (u8, u8),
    movement_strategies: Array<MovementStrategy>,
    spawn_frequency: u64,  // Turns between spawns
    max_ghosts: u8,
}
```

### Default Settings

```cairo
const DEFAULT_GHOST_CONFIG: GhostConfig = GhostConfig {
    enabled: true,
    count: 2,
    aggression_range: (30, 70),
    movement_strategies: array![
        MovementStrategy::CenterControl,
        MovementStrategy::HuntMode,
    ],
    spawn_frequency: 10,
    max_ghosts: 4,
};
```

## Gas Considerations

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Spawn Ghost | ~8,000 | Entity creation + storage |
| AI Inference | ~15,000 | Giza proof verification |
| Ghost Move | ~5,000 | Standard move execution |
| Ghost Capture | ~10,000 | Splicing + removal |

## Examples

### Example 1: Ghost Intervention

```
Turn 10: White Queen threatens Black King
Turn 11: Ghost Hunter spawns, captures White Queen
Turn 12: White must respond to Ghost threat
Turn 13: Black King escapes danger
```

### Example 2: Ghost Evolution

```
Ghost Evolver spawned (Generation 1, no traits)
Turn 15: Evolver captures Pawn → gains ForwardStep
Turn 20: Evolver captures Knight → gains Leap
Turn 25: Evolver captures Bishop → gains Diagonal
Turn 30: Evolver is now a Hybrid Ghost (Generation 4)
```

## Next Steps

- [Zero-Knowledge Proofs](zk-proofs.md) - STARK verification details
- [Complexity Budgets](complexity-budgets.md) - Managing AI complexity
