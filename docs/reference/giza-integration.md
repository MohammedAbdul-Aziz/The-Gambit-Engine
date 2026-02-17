# Giza AI Integration

Reference for integrating Giza Network's verifiable AI into The Gambit Engine.

## Overview

Giza Network provides verifiable AI inference for on-chain applications. In The Gambit Engine, Giza powers:

- **Ghost Piece AI**: Autonomous decision-making
- **Verifiable Inference**: Provable AI decisions
- **On-Chain Verification**: STARK-proof validated moves

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   GIZA INTEGRATION FLOW                     │
│                                                             │
│  Gambit Contract         Giza Network      AI Model         │
│  ┌─────────────┐        ┌─────────────┐   ┌─────────────┐  │
│  │             │        │             │   │             │  │
│  │  Request    │───────▶│   Inference │   │   Cairo     │  │
│  │  Inference  │        │   Request   │   │   Model     │  │
│  │             │        │             │   │             │  │
│  └─────────────┘        └──────┬──────┘   └─────────────┘  │
│                               │                             │
│                               │ Proof + Output              │
│                               ▼                             │
│  ┌─────────────┐        ┌─────────────┐                     │
│  │             │        │             │                     │
│  │   Verify    │◀───────│    Return   │                     │
│  │   & Execute │        │   Results   │                     │
│  │             │        │             │                     │
│  └─────────────┘        └─────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Setup

### Install Giza SDK

```bash
npm install @giza-network/sdk
# or
pip install giza-sdk
```

### Configure Giza Client

```typescript
import { GizaClient } from '@giza-network/sdk';

const giza = new GizaClient({
  apiKey: process.env.GIZA_API_KEY,
  network: 'testnet', // or 'mainnet'
});
```

## AI Models

### Ghost Piece Model

Pre-trained model for ghost piece behavior:

```typescript
const GHOST_MODEL = {
  id: 'ghost-piece-v1',
  hash: '0x...',
  version: '1.0.0',
  inputSize: 128,
  outputSize: 64,
};
```

### Model Inputs

```typescript
interface GhostInput {
  // Board state (64 squares)
  board: number[];
  
  // Piece position
  pieceFile: number;
  pieceRank: number;
  pieceType: number;
  
  // AI configuration
  aggression: number;
  targetPriority: number;
  
  // Randomness seed
  seed: string;
  
  // Game state
  turnNumber: number;
  isCheck: boolean;
}
```

### Model Outputs

```typescript
interface GhostOutput {
  // Decision
  moveType: number;
  targetFile: number;
  targetRank: number;
  
  // Confidence
  confidence: number;
  
  // Metadata
  computationSteps: number;
  modelVersion: string;
}
```

## Inference

### Basic Inference

```typescript
async function runGhostInference(
  input: GhostInput
): Promise<GhostOutput> {
  const result = await giza.infer({
    modelId: GHOST_MODEL.id,
    inputs: encodeInput(input),
    proofType: 'stark',
  });
  
  return decodeOutput(result.output);
}
```

### Inference with Proof

```typescript
async function runVerifiableInference(
  input: GhostInput
): Promise<{ output: GhostOutput; proof: StarkProof }> {
  const result = await giza.infer({
    modelId: GHOST_MODEL.id,
    inputs: encodeInput(input),
    proofType: 'stark',
    includeProof: true,
  });
  
  return {
    output: decodeOutput(result.output),
    proof: result.proof,
  };
}
```

### Batch Inference

```typescript
async function runBatchInference(
  inputs: GhostInput[]
): Promise<GhostOutput[]> {
  const results = await giza.batchInfer({
    modelId: GHOST_MODEL.id,
    inputs: inputs.map(encodeInput),
    proofType: 'stark',
  });
  
  return results.map(r => decodeOutput(r.output));
}
```

## On-Chain Verification

### Cairo Verifier

```cairo
#[starknet::contract]
mod GizaVerifier {
    use giza::verify_proof;
    
    #[external(v0)]
    fn verify_ghost_decision(
        self: @ContractState,
        input_hash: felt252,
        output_hash: felt252,
        proof: StarkProof
    ) -> bool {
        let vk = self.get_verification_key();
        
        let public_inputs = array![
            input_hash,
            output_hash,
        ];
        
        verify_proof(vk, proof, public_inputs)
    }
}
```

### Verification Flow

```typescript
async function verifyAndExecute(
  ghostId: number,
  input: GhostInput,
  output: GhostOutput,
  proof: StarkProof
) {
  // Hash inputs and outputs
  const inputHash = hashInput(input);
  const outputHash = hashOutput(output);
  
  // Verify on-chain
  const isValid = await contract.verifyGhostDecision(
    inputHash,
    outputHash,
    proof
  );
  
  if (!isValid) {
    throw new Error('Invalid AI proof');
  }
  
  // Execute the move
  await contract.executeGhostMove(
    ghostId,
    output.targetFile,
    output.targetRank
  );
}
```

## Ghost Piece Implementation

### Decision Loop

```typescript
class GhostPieceAI {
  constructor(
    private ghostId: number,
    private config: AIConfig,
    private giza: GizaClient
  ) {}
  
  async decide(boardState: BoardState): Promise<Move> {
    // Prepare input
    const input: GhostInput = {
      board: encodeBoard(boardState),
      pieceFile: this.position.file,
      pieceRank: this.position.rank,
      pieceType: this.pieceType,
      aggression: this.config.aggression,
      targetPriority: this.config.targetPriority,
      seed: this.getSeed(),
      turnNumber: boardState.turnNumber,
      isCheck: boardState.isCheck,
    };
    
    // Run inference
    const { output, proof } = await this.giza.infer({
      modelId: GHOST_MODEL.id,
      inputs: encodeInput(input),
      proofType: 'stark',
      includeProof: true,
    });
    
    // Verify and execute
    await this.verifyAndExecute(output, proof);
    
    return decodeMove(output);
  }
  
  private getSeed(): string {
    return keccak256(
      this.ghostId.toString() + Date.now().toString()
    );
  }
  
  private async verifyAndExecute(
    output: GhostOutput,
    proof: StarkProof
  ) {
    const inputHash = this.computeInputHash();
    const outputHash = this.computeOutputHash(output);
    
    const isValid = await this.contract.verifyGhostDecision(
      inputHash,
      outputHash,
      proof
    );
    
    if (!isValid) {
      throw new Error('Proof verification failed');
    }
    
    await this.contract.executeGhostMove(
      this.ghostId,
      output.targetFile,
      output.targetRank
    );
  }
}
```

## Custom AI Models

### Training a Model

```python
from giza import GizaModel

# Define model architecture
model = GizaModel(
    input_size=128,
    hidden_layers=[256, 128, 64],
    output_size=64,
    activation='relu'
)

# Train on chess positions
model.train(
    training_data=chess_dataset,
    epochs=100,
    batch_size=32,
    learning_rate=0.001
)

# Export to Cairo
model.export_cairo('ghost-piece-v1')

# Deploy to Giza
deployment = giza.deploy(
    model_path='ghost-piece-v1.cairo',
    name='custom-ghost-ai'
)

print(f"Model hash: {deployment.hash}")
```

### Model Configuration

```typescript
interface AIModelConfig {
  // Model identification
  id: string;
  hash: string;
  version: string;
  
  // Architecture
  inputSize: number;
  outputSize: number;
  hiddenLayers: number[];
  
  // Behavior
  aggressionRange: [number, number];
  decisionTimeMs: number;
  confidenceThreshold: number;
}
```

## Aggression Levels

### Behavior Configuration

```typescript
const AGGRESSION_PROFILES = {
  passive: {
    aggression: 20,
    targetPriority: 'defensive',
    movementStrategy: 'edge_patrol',
  },
  cautious: {
    aggression: 40,
    targetPriority: 'safe_captures',
    movementStrategy: 'center_control',
  },
  balanced: {
    aggression: 50,
    targetPriority: 'material',
    movementStrategy: 'balanced',
  },
  aggressive: {
    aggression: 70,
    targetPriority: 'king_hunt',
    movementStrategy: 'attack',
  },
  berserk: {
    aggression: 100,
    targetPriority: 'highest_value',
    movementStrategy: 'all_in',
  },
};
```

### Dynamic Adjustment

```typescript
function adjustAggression(
  baseAggression: number,
  gamePhase: GamePhase,
  materialDifference: number
): number {
  let adjusted = baseAggression;
  
  // More aggressive when losing
  if (materialDifference < 0) {
    adjusted += Math.abs(materialDifference) * 5;
  }
  
  // More aggressive in endgame
  if (gamePhase === 'endgame') {
    adjusted += 10;
  }
  
  return Math.min(100, Math.max(0, adjusted));
}
```

## Performance

### Inference Time

| Model | Input Size | Avg Time | Proof Time |
|-------|------------|----------|------------|
| Ghost-Lite | 64 | ~500ms | ~2s |
| Ghost-Standard | 128 | ~1s | ~5s |
| Ghost-Advanced | 256 | ~2s | ~10s |

### Gas Costs

| Operation | Gas Cost | Notes |
|-----------|----------|-------|
| Proof Verification | ~10,000 | Per inference |
| Input Storage | ~2,000 | Per input array |
| Output Processing | ~1,000 | Per output |

### Optimization Tips

1. **Use smaller models** for simple decisions
2. **Batch multiple inferences** when possible
3. **Cache results** for repeated positions
4. **Use proof aggregation** for multiple ghosts

## Error Handling

### Common Errors

```typescript
enum GizaError {
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  PROOF_GENERATION_FAILED = 'PROOF_GENERATION_FAILED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

async function safeInference(input: GhostInput) {
  try {
    const result = await giza.infer({
      modelId: GHOST_MODEL.id,
      inputs: encodeInput(input),
      proofType: 'stark',
    });
    return result;
  } catch (error) {
    if (error.code === GizaError.PROOF_GENERATION_FAILED) {
      // Retry with different seed
      return retryWithNewSeed(input);
    }
    
    if (error.code === GizaError.TIMEOUT) {
      // Fall back to random move
      return generateRandomMove();
    }
    
    throw error;
  }
}
```

## Examples

### Example: Simple Ghost

```typescript
const ghost = new GhostPieceAI(ghostId, {
  aggression: 50,
  targetPriority: 'material',
});

const board = await getBoardState(gameId);
const move = await ghost.decide(board);

console.log(`Ghost moves to ${move.file}, ${move.rank}`);
```

### Example: Custom Model

```typescript
const customModel = await giza.deploy({
  modelPath: './my-ghost-model.cairo',
  name: 'my-custom-ghost',
});

const ghost = new GhostPieceAI(ghostId, {
  modelId: customModel.id,
  aggression: 75,
});
```

## Next Steps

- [Ghost Pieces](../advanced/ghost-pieces.md) - Ghost piece mechanics
- [Zero-Knowledge Proofs](../advanced/zk-proofs.md) - STARK verification
