# Development Workflow

Guide for daily development on The Gambit Engine.

## Project Structure

```
The-Gambit-Engine/
├── contracts/              # Cairo smart contracts
│   ├── src/
│   │   ├── lib.cairo      # Main entry point
│   │   ├── piece.cairo    # Piece logic
│   │   ├── board.cairo    # Board management
│   │   ├── game.cairo     # Game logic
│   │   ├── genetics.cairo # Genetic splicing
│   │   └── zk_fog.cairo   # ZK-Fog system
│   ├── manifests/          # Dojo configurations
│   └── Scarb.toml
├── frontend/               # React/Next.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
└── docs/                   # Documentation
```

## Daily Workflow

### 1. Start Development Environment

```bash
# Terminal 1: Start Katana
katana --validate-max-steps 16777216

# Terminal 2: Build and migrate contracts
cd contracts
sozo build
sozo migrate apply

# Terminal 3: Start Torii
torii \
  --world 0xYOUR_WORLD_ADDRESS \
  --rpc http://localhost:5050 \
  --graphql http://localhost:8080

# Terminal 4: Start frontend
cd frontend
npm run dev
```

### 2. Make Changes

#### Smart Contracts

Edit Cairo files in `contracts/src/`:

```cairo
// contracts/src/piece.cairo
#[external(v0)]
fn make_move(
    ref self: ContractState,
    game_id: u64,
    move: Move
) {
    // Your changes here
}
```

#### Frontend

Edit React components in `frontend/src/`:

```typescript
// frontend/src/components/Board.tsx
function Board() {
  // Your changes here
}
```

### 3. Test Changes

```bash
# Run contract tests
cd contracts
sozo test

# Run frontend tests
cd frontend
npm test
```

### 4. Deploy Updates

```bash
# Redeploy contracts
cd contracts
sozo migrate apply

# Refresh frontend (hot reload usually handles this)
```

## Smart Contract Development

### Writing Tests

```cairo
#[cfg(test)]
mod tests {
    use super::{Piece, Move, Position};
    
    #[test]
    fn test_knight_move() {
        let piece = Piece {
            piece_type: PieceType::Knight,
            position: Position { file: 0, rank: 1 },
            ..
        };
        
        let valid_moves = piece.get_valid_moves();
        
        assert(valid_moves.contains(Position { file: 2, rank: 2 }));
        assert(valid_moves.contains(Position { file: 1, rank: 3 }));
    }
    
    #[test]
    fn test_capture_with_splicing() {
        // Test implementation
    }
}
```

### Running Tests

```bash
# Run all tests
sozo test

# Run specific test
sozo test --filter test_knight_move

# Run with coverage
sozo test --coverage
```

### Debugging

```cairo
// Use print statements for debugging
#[external(v0)]
fn debug_function(ref self: ContractState) {
    let value = self.get_value();
    starknet::print(value.into());
}
```

## Frontend Development

### Component Development

```typescript
// frontend/src/components/Piece.tsx
interface PieceProps {
  piece: PieceData;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
}

export function Piece({ piece, isSelected, isValidMove, onClick }: PieceProps) {
  return (
    <div 
      className={`piece ${piece.color} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {isValidMove && <div className="valid-move-indicator" />}
      <PieceIcon type={piece.pieceType} />
    </div>
  );
}
```

### Hooks

```typescript
// frontend/src/hooks/useGame.ts
export function useGame(gameId: string) {
  const [game, setGame] = useState<GameState | null>(null);
  
  // Subscribe to Torii updates
  useEffect(() => {
    const subscription = torii.subscribe(`game:${gameId}`);
    subscription.on('update', (data) => setGame(data));
    
    return () => subscription.unsubscribe();
  }, [gameId]);
  
  // Make moves
  const makeMove = async (move: Move) => {
    await contract.makeMove(gameId, move);
  };
  
  return { game, makeMove };
}
```

### Styling

```css
/* frontend/src/styles/Board.css */
.board {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-template-rows: repeat(8, 1fr);
  width: 100%;
  aspect-ratio: 1;
}

.square {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.square.light {
  background-color: #f0d9b5;
}

.square.dark {
  background-color: #b58863;
}

.valid-move::after {
  content: '';
  position: absolute;
  width: 20%;
  height: 20%;
  background-color: rgba(0, 255, 0, 0.5);
  border-radius: 50%;
}
```

## Git Workflow

### Branch Strategy

```bash
# Create feature branch
git checkout -b feature/genetic-splicing

# Make changes and commit
git add .
git commit -m "feat: implement genetic splicing system"

# Push and create PR
git push origin feature/genetic-splicing
```

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Example Commits

```bash
git commit -m "feat: add ZK-Fog commitment system"
git commit -m "fix: resolve complexity budget overflow"
git commit -m "test: add genetic splicing unit tests"
```

## Tooling

### Useful Commands

```bash
# Clean build artifacts
sozo clean

# Format Cairo code
scarb fmt

# Check Cairo code
scarb check

# Build contracts
sozo build

# Run tests
sozo test

# Deploy contracts
sozo migrate apply

# Query Torii
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ pieces { id pieceType } }"}'
```

### VS Code Extensions

Recommended extensions:

- **Cairo** - Cairo language support
- **Starknet** - Starknet development
- **GraphQL** - GraphQL query support
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting

## Common Tasks

### Add New Piece Type

1. Update `PieceType` enum in contracts
2. Add movement rules
3. Update frontend piece renderer
4. Add tests

### Add New Trait

1. Add to `TraitName` enum
2. Define cost in genetics contract
3. Implement movement pattern
4. Update UI to display trait

### Add New Ghost AI

1. Create/modify Cairo AI model
2. Deploy to Giza Network
3. Register model hash in contract
4. Test AI behavior

## Performance Tips

### Smart Contracts

```cairo
// Good: Efficient storage
struct PackedData {
    traits: u128,      // Pack multiple bools
    complexity: u8,
    generation: u8,
}

// Bad: Wasteful storage
struct UnpackedData {
    trait1: bool,
    trait2: bool,
    // ... many bools
    complexity: u32,
    generation: u32,
}
```

### Frontend

```typescript
// Good: Memoized component
const Piece = memo(({ piece }: PieceProps) => {
  return <div>{piece.pieceType}</div>;
});

// Good: Efficient queries
const { data } = useQuery(GET_PIECES, {
  variables: { gameId },
  staleTime: 1000, // Cache for 1 second
});

// Bad: Re-renders every render
const pieces = torii.query('pieces');
```

## Next Steps

- [Testing Strategy](testing.md) - Comprehensive testing guide
- [Deployment Guide](deployment.md) - Production deployment
