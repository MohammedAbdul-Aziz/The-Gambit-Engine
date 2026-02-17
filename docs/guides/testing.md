# Testing Strategy

Comprehensive testing guide for The Gambit Engine.

## Overview

Testing pyramid for The Gambit Engine:

```
        ╱╲
       ╱  ╲
      ╱ E2E╲         Integration Tests
     ╱──────╲
    ╱        ╲
   ╱Integration╲      Component Tests
  ╱──────────────╲
 ╱                ╲
╱    Unit Tests    ╲   Foundation
──────────────────────
```

## Unit Tests

### Contract Unit Tests

```cairo
#[cfg(test)]
mod piece_tests {
    use super::{Piece, PieceType, Color, Position};
    
    #[test]
    fn test_knight_creation() {
        let knight = Piece {
            id: 1,
            piece_type: PieceType::Knight,
            color: Color::White,
            position: Position { file: 1, rank: 0 },
            is_alive: true,
            owner: 0x01,
            game_id: 1,
        };
        
        assert(knight.piece_type == PieceType::Knight);
        assert(knight.color == Color::White);
        assert(knight.is_alive);
    }
    
    #[test]
    fn test_knight_valid_moves() {
        let knight = get_test_knight();
        let moves = knight.get_valid_moves();
        
        assert(moves.len() == 8);
        assert(moves.contains(Position { file: 2, rank: 2 }));
        assert(moves.contains(Position { file: 3, rank: 1 }));
    }
    
    #[test]
    fn test_knight_blocked_moves() {
        let knight = get_test_knight();
        let board = create_board_with_blocker(2, 2);
        let moves = knight.get_valid_moves_with_board(board);
        
        assert(moves.len() == 7); // One move blocked
        assert(!moves.contains(Position { file: 2, rank: 2 }));
    }
}
```

### Genetic Splicing Tests

```cairo
#[cfg(test)]
mod genetics_tests {
    use super::{GeneticData, Trait, TraitName};
    
    #[test]
    fn test_simple_splicing() {
        let mut knight = get_knight_with_genetics();
        let bishop_traits = get_bishop_traits();
        
        let result = splice_traits(knight, bishop_traits);
        
        assert(result.success);
        assert(result.new_traits.contains(TraitName::Diagonal));
        assert(result.new_complexity == 40); // 15 + 25
        assert(result.new_generation == 2);
    }
    
    #[test]
    fn test_complexity_overflow() {
        let mut hybrid = get_high_complexity_piece(); // 85/100
        let queen_traits = get_queen_traits(); // 50
        
        let result = splice_traits(hybrid, queen_traits);
        
        assert(!result.success);
        assert(result.error == SplicingError::ComplexityExceeded);
    }
    
    #[test]
    fn test_trait_conflict_resolution() {
        let mut piece = get_piece_with_trait(TraitName::Diagonal);
        let new_trait = Trait { name: TraitName::Straight, cost: 25 };
        
        let result = splice_traits(piece, array![new_trait]);
        
        // Diagonal + Straight should merge into Combined
        assert(result.success);
        assert(result.new_traits.contains(TraitName::Combined));
        assert(!result.new_traits.contains(TraitName::Diagonal));
        assert(!result.new_traits.contains(TraitName::Straight));
    }
}
```

### ZK-Fog Tests

```cairo
#[cfg(test)]
mod zk_fog_tests {
    use super::{HiddenCommitment, StarkProof};
    
    #[test]
    fn test_commit_hidden_ability() {
        let mut contract = create_test_contract();
        let piece_id = 1;
        let ability_hash = starknet::poseidon_hash(array![1, 2, 3]);
        
        contract.commit_hidden_ability(piece_id, ability_hash);
        
        let commitment = contract.get_commitment(piece_id);
        assert(commitment.ability_hash == ability_hash);
        assert(!commitment.revealed);
    }
    
    #[test]
    fn test_reveal_with_valid_proof() {
        let mut contract = create_test_contract();
        let piece_id = 1;
        let (move_data, proof) = generate_valid_proof();
        
        contract.commit_hidden_ability(piece_id, proof.commitment_hash);
        contract.reveal_ability(piece_id, move_data, proof);
        
        let commitment = contract.get_commitment(piece_id);
        assert(commitment.revealed);
    }
    
    #[test]
    fn test_reveal_with_invalid_proof() {
        let mut contract = create_test_contract();
        let piece_id = 1;
        let (move_data, proof) = generate_invalid_proof();
        
        contract.commit_hidden_ability(piece_id, proof.commitment_hash);
        
        // Should revert
        try {
            contract.reveal_ability(piece_id, move_data, proof);
            assert(false, "Should have reverted");
        } catch (e) {
            assert(e == "Invalid proof");
        }
    }
}
```

## Integration Tests

### Game Flow Tests

```cairo
#[cfg(test)]
mod game_integration_tests {
    use super::{GameContract, PieceContract, GeneticsContract};
    
    #[test]
    fn test_complete_game_flow() {
        let mut game = create_game();
        
        // Setup
        game.create_game(player_white);
        game.join_game(player_black);
        
        // Initial moves
        game.make_move(create_move(piece_id: 1, from: (0, 1), to: (0, 3)));
        game.make_move(create_move(piece_id: 9, from: (0, 6), to: (0, 5)));
        
        // Capture with splicing
        game.make_move(create_move(piece_id: 1, from: (0, 3), to: (0, 5)));
        
        // Verify splicing occurred
        let piece = game.get_piece(1);
        assert(piece.generation == 2);
        assert(piece.complexity > 15);
        
        // Continue until checkmate
        play_until_checkmate(game);
        
        // Verify game end
        let state = game.get_game_state();
        assert(state.is_checkmate);
        assert(state.winner == player_white);
    }
    
    #[test]
    fn test_ghost_piece_intervention() {
        let mut game = create_game_with_ghosts();
        
        // Spawn ghost piece
        let ghost_id = game.spawn_ghost(AIConfig {
            aggression: 50,
            target_priority: 'material',
        });
        
        // Play normal moves
        game.make_move(white_move);
        game.make_move(black_move);
        
        // Execute ghost turn
        game.execute_ghost_turn();
        
        // Verify ghost moved
        let ghost = game.get_ghost(ghost_id);
        assert(ghost.last_move_turn == game.move_count);
    }
}
```

### Frontend Integration Tests

```typescript
// frontend/src/__tests__/Board.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from '../components/Board';
import { MockProvider } from '../test-utils';

describe('Board Integration', () => {
  it('should handle complete move flow', async () => {
    render(
      <MockProvider>
        <Board gameId="1" />
      </MockProvider>
    );
    
    // Select piece
    const knight = screen.getByTestId('piece-knight-1');
    fireEvent.click(knight);
    
    // Verify valid moves shown
    const validMoves = screen.getAllByTestId('valid-move-indicator');
    expect(validMoves.length).toBeGreaterThan(0);
    
    // Make move
    const targetSquare = screen.getByTestId('square-2-2');
    fireEvent.click(targetSquare);
    
    // Verify move executed
    await waitFor(() => {
      expect(screen.getByTestId('piece-knight-1')).toHaveAttribute(
        'data-position',
        '2-2'
      );
    });
  });
  
  it('should show genetic splicing animation on capture', async () => {
    render(
      <MockProvider>
        <Board gameId="1" />
      </MockProvider>
    );
    
    // Setup capture scenario
    const knight = screen.getByTestId('piece-knight-1');
    fireEvent.click(knight);
    
    const bishopSquare = screen.getByTestId('square-0-5');
    fireEvent.click(bishopSquare);
    
    // Verify splicing animation
    const animation = await screen.findByTestId('splicing-animation');
    expect(animation).toBeInTheDocument();
    
    // Verify new trait displayed
    const traitBadge = await screen.findByTestId('trait-diagonal');
    expect(traitBadge).toBeInTheDocument();
  });
});
```

## End-to-End Tests

### Full Game E2E

```typescript
// e2e/tests/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow', () => {
  test('should play a full game with genetic splicing', async ({ page }) => {
    // Navigate to game
    await page.goto('/game/1');
    
    // Wait for board to load
    await page.waitForSelector('.board');
    
    // Player 1 makes opening move
    await page.click('[data-piece="knight-white-1"]');
    await page.click('[data-square="2-2"]');
    
    // Wait for transaction
    await page.waitForSelector('.transaction-confirmed');
    
    // Player 2 responds
    await page.click('[data-piece="pawn-black-1"]');
    await page.click('[data-square="0-5"]');
    
    // Continue until capture
    await makeMovesUntilCapture(page);
    
    // Verify genetic splicing UI
    await expect(page.getByTestId('splicing-panel')).toBeVisible();
    await expect(page.getByTestId('new-trait-badge')).toBeVisible();
    
    // Continue until game end
    await playUntilCheckmate(page);
    
    // Verify game over screen
    await expect(page.getByTestId('game-over')).toBeVisible();
    await expect(page.getByTestId('winner')).toContainText('White');
  });
  
  test('should handle ghost piece intervention', async ({ page }) => {
    await page.goto('/game/2');
    
    // Wait for ghost spawn
    await page.waitForSelector('[data-ghost-piece]');
    
    // Verify ghost moves independently
    const ghostPositionBefore = await getGhostPosition(page);
    await waitForGhostTurn(page);
    const ghostPositionAfter = await getGhostPosition(page);
    
    expect(ghostPositionBefore).not.toEqual(ghostPositionAfter);
  });
});
```

## Running Tests

### Contract Tests

```bash
# Run all tests
sozo test

# Run specific test file
sozo test tests/piece_tests.cairo

# Run with filter
sozo test --filter genetics

# Run with coverage
sozo test --coverage

# View coverage report
open coverage/index.html
```

### Frontend Tests

```bash
# Run unit tests
cd frontend
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run with coverage
npm test -- --coverage
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Cairo
        uses: software-mansion/setup-scarb@v1
      
      - name: Setup Dojo
        uses: dojoengine/setup-dojo@v1
      
      - name: Install dependencies
        run: |
          cd contracts && sozo build
          cd ../frontend && npm install
      
      - name: Run contract tests
        run: cd contracts && sozo test
      
      - name: Run frontend tests
        run: cd frontend && npm test
      
      - name: Run E2E tests
        run: cd frontend && npm run test:e2e
```

## Test Data

### Mock Data Factory

```typescript
// frontend/src/test-utils/factories.ts
export function createPiece(overrides = {}): Piece {
  return {
    id: 1,
    pieceType: 'KNIGHT',
    color: 'WHITE',
    position: { file: 1, rank: 0 },
    isAlive: true,
    owner: '0x01',
    gameId: 1,
    complexity: 15,
    generation: 1,
    ...overrides,
  };
}

export function createGame(overrides = {}): Game {
  return {
    id: 1,
    playerWhite: '0x01',
    playerBlack: '0x02',
    currentTurn: '0x01',
    moveCount: 0,
    isCheck: false,
    isCheckmate: false,
    ...overrides,
  };
}

export function createGeneticData(overrides = {}): GeneticData {
  return {
    pieceId: 1,
    inheritedTraits: [],
    complexityCost: 0,
    maxComplexity: 100,
    generation: 1,
    ...overrides,
  };
}
```

## Best Practices

### 1. Test Isolation

```cairo
// Good: Each test creates fresh state
#[test]
fn test_piece_movement() {
    let piece = create_test_piece();
    let board = create_empty_board();
    // Test...
}

// Bad: Tests share state
static mut PIECE: Option<Piece> = None;
```

### 2. Descriptive Names

```cairo
// Good
#[test]
fn test_knight_capture_triggers_genetic_splicing() { }

// Bad
#[test]
fn test_capture() { }
```

### 3. Test Edge Cases

```cairo
#[test]
fn test_complexity_budget_edge_cases() {
    // Exactly at limit
    test_splicing_at_exact_budget();
    
    // One over limit
    test_splicing_one_over_budget();
    
    // Zero budget remaining
    test_splicing_with_zero_budget();
}
```

### 4. Mock External Dependencies

```typescript
// Good: Mock Giza API
jest.mock('@giza-network/sdk', () => ({
  GizaClient: jest.fn().mockImplementation(() => ({
    infer: jest.fn().mockResolvedValue({ output: {}, proof: {} }),
  })),
}));
```

## Next Steps

- [Deployment Guide](deployment.md) - Deploy tested code
- [Contributing](../community/contributing.md) - Contribution guidelines
