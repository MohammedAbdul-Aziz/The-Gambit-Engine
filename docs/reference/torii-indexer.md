# Torii Indexer

Reference for using Torii, the Dojo indexer, to query game state in The Gambit Engine.

## Overview

Torii is a GraphQL-based indexer for Dojo ECS that provides:

- **Real-time indexing** of on-chain game state
- **GraphQL queries** for flexible data retrieval
- **Event streaming** for live updates
- **Historical data** for analytics

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TORII INDEXER FLOW                       │
│                                                             │
│  Starknet Chain                                             │
│       │                                                     │
│       │ Events                                              │
│       ▼                                                     │
│  ┌─────────────────┐                                       │
│  │     Torii       │                                       │
│  │    Indexer      │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│           │ Indexed Data                                    │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │   GraphQL API   │◀────── Client Queries                 │
│  └─────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Setup

### Running Torii Locally

```bash
# Start Torii with local Katana
torii \
  --world 0xYOUR_WORLD_ADDRESS \
  --rpc http://localhost:5050 \
  --graphql http://localhost:8080
```

### Configuration

```toml
# torii.toml
[server]
http_addr = "0.0.0.0"
http_port = 8080

[indexer]
rpc_url = "http://localhost:5050"
world_address = "0xYOUR_WORLD_ADDRESS"

[database]
path = "./torii.db"
```

## GraphQL Schema

### Core Types

```graphql
type Piece {
  id: ID!
  pieceType: PieceType!
  color: Color!
  position: Position!
  isAlive: Boolean!
  owner: String!
  gameId: BigInt!
  geneticData: GeneticData
  movementRules: MovementRules
  complexity: BigInt!
  generation: BigInt!
}

type GeneticData {
  id: ID!
  pieceId: BigInt!
  inheritedTraits: [Trait!]!
  complexityCost: BigInt!
  maxComplexity: BigInt!
  generation: BigInt!
  parentIds: [BigInt!]!
  captureCount: BigInt!
}

type Trait {
  name: TraitName!
  cost: BigInt!
  data: [String!]!
  isHidden: Boolean!
  isRevealed: Boolean!
}

type Game {
  id: ID!
  playerWhite: String!
  playerBlack: String!
  currentTurn: String!
  moveCount: BigInt!
  isCheck: Boolean!
  isCheckmate: Boolean!
  isStalemate: Boolean!
  winner: String
  createdAt: BigInt!
  lastMoveAt: BigInt!
}

type Player {
  id: ID!
  address: String!
  color: Color!
  gameId: BigInt!
  pieces: [Piece!]!
  capturedPieces: [Piece!]!
  totalComplexityGained: BigInt!
  captures: BigInt!
  movesMade: BigInt!
}

enum PieceType {
  PAWN
  KNIGHT
  BISHOP
  ROOK
  QUEEN
  KING
}

enum Color {
  WHITE
  BLACK
}

enum TraitName {
  FORWARD_STEP
  LEAP
  DIAGONAL
  STRAIGHT
  COMBINED
  ADJACENT
  EXTENDED_RANGE
  PHANTOM_LEAP
  DOUBLE_MOVE
  TELEPORT
  HIDDEN_ABILITY
  ETHEREAL
  AUTONOMOUS_AI
}
```

## Common Queries

### Get All Pieces

```graphql
query GetAllPieces {
  pieces {
    id
    pieceType
    color
    position {
      file
      rank
    }
    isAlive
    owner
  }
}
```

### Get Piece by ID

```graphql
query GetPiece($id: ID!) {
  piece(id: $id) {
    id
    pieceType
    color
    position {
      file
      rank
    }
    geneticData {
      inheritedTraits {
        name
        cost
      }
      complexityCost
      generation
    }
  }
}
```

### Get Game State

```graphql
query GetGameState($gameId: ID!) {
  game(id: $gameId) {
    id
    playerWhite
    playerBlack
    currentTurn
    moveCount
    isCheck
    isCheckmate
    winner
    pieces {
      id
      pieceType
      position {
        file
        rank
      }
    }
  }
}
```

### Get Player Stats

```graphql
query GetPlayerStats($address: String!) {
  player(id: $address) {
    address
    color
    captures
    movesMade
    totalComplexityGained
    pieces {
      id
      pieceType
      generation
      complexity
    }
  }
}
```

### Get Hybrid Pieces

```graphql
query GetHybridPieces($gameId: BigInt!) {
  pieces(where: { gameId: $gameId, generation_gt: 1 }) {
    id
    pieceType
    generation
    geneticData {
      inheritedTraits {
        name
      }
      complexityCost
    }
  }
}
```

### Get Pieces by Complexity

```graphql
query GetHighComplexityPieces($gameId: BigInt!, $minComplexity: BigInt!) {
  pieces(where: { gameId: $gameId, complexity_gte: $minComplexity }) {
    id
    pieceType
    complexity
    geneticData {
      inheritedTraits {
        name
        cost
      }
    }
  }
}
```

### Get Capture History

```graphql
query GetCaptureHistory($gameId: BigInt!) {
  captureRecords(where: { gameId: $gameId }, orderBy: { field: TURN, direction: DESC }) {
    id
    turn
    attackerId
    defenderId
    attackerType
    defenderType
    inheritedTraits {
      name
    }
    newGeneration
  }
}
```

## Filtering

### Basic Filters

```graphql
query FilteredPieces {
  pieces(where: {
    pieceType: KNIGHT,
    color: WHITE,
    isAlive: true
  }) {
    id
    position {
      file
      rank
    }
  }
}
```

### Comparison Filters

```graphql
query HighGenerationPieces {
  pieces(where: {
    generation_gt: 3,
    complexity_lt: 80
  }) {
    id
    pieceType
    generation
    complexity
  }
}
```

### Array Filters

```graphql
query PiecesWithTrait {
  pieces(where: {
    geneticData: {
      inheritedTraits_some: {
        name: DIAGONAL
      }
    }
  }) {
    id
    pieceType
    geneticData {
      inheritedTraits {
        name
      }
    }
  }
}
```

## Subscriptions

### Real-Time Piece Updates

```graphql
subscription PieceUpdates {
  pieceUpdated {
    id
    position {
      file
      rank
    }
    isAlive
  }
}
```

### New Move Events

```graphql
subscription MoveEvents($gameId: BigInt!) {
  moveMade(where: { gameId: $gameId }) {
    gameId
    pieceId
    from {
      file
      rank
    }
    to {
      file
      rank
    }
    isCapture
    turn
  }
}
```

### Capture Events

```graphql
subscription CaptureEvents($gameId: BigInt!) {
  captureMade(where: { gameId: $gameId }) {
    attackerId
    defenderId
    traitsGained {
      name
    }
    newComplexity
  }
}
```

## Client Integration

### TypeScript Example

```typescript
import { gql } from 'graphql-request';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient('http://localhost:8080/graphql');

// Get game state
async function getGameState(gameId: string) {
  const query = gql`
    query GetGameState($gameId: ID!) {
      game(id: $gameId) {
        id
        currentTurn
        moveCount
        isCheck
        pieces {
          id
          pieceType
          position {
            file
            rank
          }
        }
      }
    }
  `;
  
  const variables = { gameId };
  return await client.request(query, variables);
}

// Subscribe to moves
async function subscribeToMoves(gameId: string) {
  const subscription = gql`
    subscription MoveEvents($gameId: BigInt!) {
      moveMade(where: { gameId: $gameId }) {
        pieceId
        from { file rank }
        to { file rank }
      }
    }
  `;
  
  // Use GraphQL subscription client
  // ...
}
```

### React Hook Example

```typescript
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_PIECES = gql`
  query GetPieces($gameId: BigInt!) {
    pieces(where: { gameId: $gameId }) {
      id
      pieceType
      color
      position {
        file
        rank
      }
      geneticData {
        inheritedTraits {
          name
        }
      }
    }
  }
`;

function useGamePieces(gameId: string) {
  const { loading, error, data } = useQuery(GET_PIECES, {
    variables: { gameId },
  });
  
  return { loading, error, pieces: data?.pieces };
}
```

## Performance Tips

### 1. Pagination

```graphql
query PaginatedPieces($cursor: ID, $limit: Int!) {
  pieces(first: $limit, after: $cursor) {
    edges {
      node {
        id
        pieceType
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 2. Selective Fields

```graphql
# Good: Only request needed fields
query EfficientQuery {
  pieces {
    id
    pieceType
  }
}

# Bad: Requesting everything
query InefficientQuery {
  pieces {
    id
    pieceType
    color
    position { file rank }
    geneticData { ... }
    movementRules { ... }
    # ... all fields
  }
}
```

### 3. Batch Queries

```graphql
query BatchQuery {
  whitePieces: pieces(where: { color: WHITE }) {
    id
    pieceType
  }
  blackPieces: pieces(where: { color: BLACK }) {
    id
    pieceType
  }
  hybrids: pieces(where: { generation_gt: 1 }) {
    id
    generation
  }
}
```

## Next Steps

- [Giza AI Integration](giza-integration.md) - AI and ghost pieces
- [Development Guide](../guides/development.md) - Building with Torii
