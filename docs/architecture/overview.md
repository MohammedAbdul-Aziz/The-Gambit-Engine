# System Overview

This document provides a high-level overview of The Gambit Engine's architecture and system design.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                    UI / Game Board / Wallet                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Starknet L2 Network                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Cairo      │  │    Dojo      │  │     STARK    │          │
│  │  Contracts   │  │     ECS      │  │    Proofs    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supporting Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Torii     │  │    Giza      │  │   Katana     │          │
│  │   Indexer    │  │     AI       │  │  Devnet      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Smart Contracts (Cairo)

The heart of The Gambit Engine, written in Cairo for provable execution:

- **Game Logic**: Chess rules, move validation, win conditions
- **Genetic System**: Trait inheritance and mutation logic
- **ZK-Fog**: Hidden state management with STARK proofs

### 2. Dojo ECS Framework

Entity-Component-System architecture for game state:

- **Entities**: Pieces, players, board squares, genetic traits
- **Components**: Position, movement rules, genetic data, ownership
- **Systems**: Move validation, capture resolution, trait splicing

### 3. Starknet L2

Zero-knowledge rollup providing:

- **Scalability**: Low-cost transactions
- **Security**: Ethereum L1 finality
- **Privacy**: STARK-based zero-knowledge proofs

### 4. Torii Indexer

GraphQL API for efficient game state queries:

- Real-time game state synchronization
- Historical move tracking
- Player statistics and leaderboards

### 5. Giza Network

Verifiable AI infrastructure:

- **Ghost Pieces**: AI-controlled autonomous agents
- **Provable Fairness**: On-chain verifiable AI decisions
- **Dynamic Difficulty**: Adaptive challenge levels

## Data Flow

### Player Move Flow

1. Player initiates move in frontend
2. Frontend validates move locally
3. Transaction submitted to Starknet
4. Cairo contracts verify move legality
5. Genetic traits calculated (if capture)
6. STARK proof generated (if hidden ability)
7. State updated via Dojo ECS
8. Torii indexes new state
9. Frontend queries updated state
10. UI reflects new game state

### Genetic Splicing Flow

1. Capture event triggered
2. Source piece traits extracted
3. Target piece receives genetic data
4. Complexity budget checked
5. Mutation rules applied
6. New hybrid piece created
7. On-chain proof recorded

## Key Design Principles

### 1. Provable Everything

All game logic is verifiable on-chain:
- Move validity
- Genetic calculations
- AI decisions
- Win conditions

### 2. Progressive Decentralization

- Core logic: Fully on-chain
- AI: Verifiable via Giza
- UI: Client-side with on-chain state

### 3. Composability

- Modular smart contracts
- Extensible trait system
- Pluggable AI agents

## Next Steps

- [ECS Design](ecs-design.md) - Deep dive into Entity-Component-System
- [Smart Contracts](smart-contracts.md) - Contract architecture details
