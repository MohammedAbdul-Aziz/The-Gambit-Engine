# New Evolution System - Implementation Guide

This guide outlines the implementation of the new Gas-Based Evolution, Inventory, and ELO Matchmaking systems.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW SYSTEM ARCHITECTURE                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Gas System     │  │  Inventory      │  │  ELO        │ │
│  │  - 10 gas/game  │  │  - On-chain     │  │  - Player   │ │
│  │  - Trait costs  │  │  - Persistent   │  │    ratings  │ │
│  │  - Evolution    │  │  - Upgradable   │  │  - Bot      │ │
│  │    decisions    │  │  - Rarity tiers │  │    levels   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│           │                   │                  │          │
│           └───────────────────┼──────────────────┘          │
│                               │                             │
│                               ▼                             │
│                  ┌─────────────────────────┐               │
│                  │   Core Game Contract    │               │
│                  │   - Match logic         │               │
│                  │   - Capture detection   │               │
│                  │   - Evolution triggers  │               │
│                  └─────────────────────────┘               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Phase 1: Smart Contract Structures

### 1.1 New Data Structures

Add these to your Cairo contracts:

```cairo
// contracts/src/types.cairo

/// Gas system data
#[derive(Component, Drop, Serde, Copy)]
struct PlayerGas {
    game_id: u64,
    player: ContractAddress,
    remaining_gas: u8,
    starting_gas: u8,
}

/// Trait cost constants
const GAS_COST_PAWN: u8 = 1;
const GAS_COST_KNIGHT: u8 = 3;
const GAS_COST_BISHOP: u8 = 3;
const GAS_COST_ROOK: u8 = 5;
const GAS_COST_QUEEN: u8 = 10;
const STARTING_GAS: u8 = 10;

/// Inventory piece
#[derive(Component, Drop, Serde)]
struct InventoryPiece {
    id: u32,
    owner: ContractAddress,
    base_type: PieceType,
    inherited_traits: Array<Trait>,
    games_played: u32,
    captures_made: u32,
    evolution_count: u32,
    name: felt252,
    created_at: u64,
    last_used: u64,
    is_available: bool,
    is_locked: bool,
}

/// Player inventory
#[derive(Component, Drop, Serde)]
struct PlayerInventory {
    owner: ContractAddress,
    piece_ids: Array<u32>,
    max_slots: u32,
    used_slots: u32,
}

/// ELO data
#[derive(Component, Drop, Serde)]
struct ELOData {
    player_address: ContractAddress,
    current_elo: u32,
    highest_elo: u32,
    games_played: u32,
    wins: u32,
    losses: u32,
    draws: u32,
    win_streak: u32,
    best_win_streak: u32,
}

/// Matchmaking request
#[derive(Component, Drop, Serde)]
struct MatchmakingRequest {
    player: ContractAddress,
    player_elo: u32,
    preferred_opponent: OpponentType,
    min_elo: u32,
    max_elo: u32,
    queued_at: u64,
}

/// Opponent type
#[derive(Drop, Serde, Clone, PartialEq)]
enum OpponentType {
    Human,
    AI,
    Any,
}

/// Bot configuration
#[derive(Drop, Serde, Clone, Copy)]
struct BotConfig {
    bot_id: u8,
    base_elo: u32,
    aggression: u8,
    calculation_depth: u8,
    error_rate: u8,
    opening_book: bool,
    endgame_table: bool,
}
```

### 1.2 Contract Storage Updates

```cairo
// contracts/src/storage.cairo

#[storage]
struct Storage {
    // Existing storage...
    
    // Gas system
    player_gas: Mapping<(game_id: u64, player: ContractAddress), PlayerGas>,
    
    // Inventory system
    inventory_pieces: Mapping<(owner: ContractAddress, id: u32), InventoryPiece>,
    player_inventory: Mapping<ContractAddress, PlayerInventory>,
    next_inventory_id: u32,
    
    // ELO system
    player_elo: Mapping<ContractAddress, ELOData>,
    matchmaking_queue: Mapping<ContractAddress, MatchmakingRequest>,
    bot_configs: Mapping<u8, BotConfig>,
}
```

### 1.3 Events

```cairo
// contracts/src/events.cairo

#[derive(Event, Drop)]
enum Event {
    // Existing events...
    
    // Gas system events
    GasInitialized: GasInitialized,
    EvolutionRequested: EvolutionRequested,
    EvolutionSkipped: EvolutionSkipped,
    GasSpent: GasSpent,
    
    // Inventory events
    PieceSavedToInventory: PieceSavedToInventory,
    PieceDeployedFromInventory: PieceDeployedFromInventory,
    PieceUpgraded: PieceUpgraded,
    PieceReleased: PieceReleased,
    
    // ELO events
    PlayerRegistered: PlayerRegistered,
    PlayerQueued: PlayerQueued,
    MatchCompleted: MatchCompleted,
    ELOUpdated: ELOUpdated,
}

#[derive(Drop, starknet::Event)]
struct GasInitialized {
    game_id: u64,
    player: ContractAddress,
    starting_gas: u8,
}

#[derive(Drop, starknet::Event)]
struct EvolutionRequested {
    game_id: u64,
    piece_id: u32,
    captured_piece_type: PieceType,
    traits_requested: Array<TraitName>,
    gas_cost: u8,
}

#[derive(Drop, starknet::Event)]
struct EvolutionSkipped {
    game_id: u64,
    piece_id: u32,
}

#[derive(Drop, starknet::Event)]
struct GasSpent {
    game_id: u64,
    player: ContractAddress,
    amount: u8,
    remaining: u8,
}

#[derive(Drop, starknet::Event)]
struct PieceSavedToInventory {
    player: ContractAddress,
    piece_id: u32,
    base_type: PieceType,
    trait_count: usize,
}

#[derive(Drop, starknet::Event)]
struct PieceDeployedFromInventory {
    game_id: u64,
    inventory_piece_id: u32,
    new_piece_id: u32,
}

#[derive(Drop, starknet::Event)]
struct PieceUpgraded {
    owner: ContractAddress,
    inventory_piece_id: u32,
    new_trait_count: u32,
}

#[derive(Drop, starknet::Event)]
struct PieceReleased {
    owner: ContractAddress,
    inventory_piece_id: u32,
}

#[derive(Drop, starknet::Event)]
struct PlayerRegistered {
    player: ContractAddress,
    initial_elo: u32,
}

#[derive(Drop, starknet::Event)]
struct PlayerQueued {
    player: ContractAddress,
    preferred_opponent: OpponentType,
    elo: u32,
}

#[derive(Drop, starknet::Event)]
struct MatchCompleted {
    game_id: u64,
    winner: Option<ContractAddress>,
    white_elo_change: i32,
    black_elo_change: i32,
    white_new_elo: u32,
    black_new_elo: u32,
}

#[derive(Drop, starknet::Event)]
struct ELOUpdated {
    player: ContractAddress,
    old_elo: u32,
    new_elo: u32,
    change: i32,
}
```

## Phase 2: Core Functions

### 2.1 Gas System Implementation

```cairo
// contracts/src/gas_system.cairo

#[external(v0)]
fn initialize_game_gas(
    ref self: ContractState,
    game_id: u64,
    player_white: ContractAddress,
    player_black: ContractAddress
) {
    // Initialize gas for both players
    let white_gas = PlayerGas {
        game_id,
        player: player_white,
        remaining_gas: STARTING_GAS,
        starting_gas: STARTING_GAS,
    };
    
    let black_gas = PlayerGas {
        game_id,
        player: player_black,
        remaining_gas: STARTING_GAS,
        starting_gas: STARTING_GAS,
    };
    
    self.player_gas.write((game_id, player_white), white_gas);
    self.player_gas.write((game_id, player_black), black_gas);
    
    // Emit events
    self.emit(Event::GasInitialized(GasInitialized {
        game_id,
        player: player_white,
        starting_gas: STARTING_GAS,
    }));
    
    self.emit(Event::GasInitialized(GasInitialized {
        game_id,
        player: player_black,
        starting_gas: STARTING_GAS,
    }));
}

#[external(v0)]
fn request_evolution(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32,
    captured_piece_type: PieceType,
    traits_to_inherit: Array<TraitName>
) {
    let player = get_caller_address();
    
    // Get player's gas
    let mut player_gas = self.player_gas.read((game_id, player));
    
    // Calculate total gas cost
    let mut total_cost: u8 = 0;
    for trait in traits_to_inherit {
        total_cost += get_trait_gas_cost(captured_piece_type);
    }
    
    // Check gas budget
    assert(player_gas.remaining_gas >= total_cost, "Insufficient gas");
    
    // Deduct gas
    player_gas.remaining_gas -= total_cost;
    self.player_gas.write((game_id, player), player_gas);
    
    // Apply traits to piece (call genetics system)
    self.apply_evolution(piece_id, traits_to_inherit);
    
    // Emit events
    self.emit(Event::EvolutionRequested(EvolutionRequested {
        game_id,
        piece_id,
        captured_piece_type,
        traits_requested: traits_to_inherit,
        gas_cost: total_cost,
    }));
    
    self.emit(Event::GasSpent(GasSpent {
        game_id,
        player,
        amount: total_cost,
        remaining: player_gas.remaining_gas,
    }));
}

fn get_trait_gas_cost(piece_type: PieceType) -> u8 {
    match piece_type {
        PieceType::Pawn => GAS_COST_PAWN,
        PieceType::Knight => GAS_COST_KNIGHT,
        PieceType::Bishop => GAS_COST_BISHOP,
        PieceType::Rook => GAS_COST_ROOK,
        PieceType::Queen => GAS_COST_QUEEN,
        PieceType::King => 0, // Cannot inherit King traits
    }
}

#[external(v0)]
fn skip_evolution(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32
) {
    self.emit(Event::EvolutionSkipped(EvolutionSkipped {
        game_id,
        piece_id,
    }));
}
```

### 2.2 Inventory System Implementation

```cairo
// contracts/src/inventory.cairo

#[external(v0)]
fn save_to_inventory(
    ref self: ContractState,
    game_id: u64,
    piece_id: u32,
    custom_name: felt252
) {
    let player = get_caller_address();
    
    // Get piece and genetic data
    let piece = self.pieces.read(piece_id);
    let genetic_data = self.genetic_data.read(piece_id);
    
    // Verify ownership and evolved status
    assert(piece.owner == player, "Not your piece");
    assert(genetic_data.is_evolved, "Piece not evolved");
    assert(genetic_data.inherited_traits.len() > 0, "No traits");
    
    // Get or create player inventory
    let mut inventory = self.player_inventory.read(player);
    assert(inventory.used_slots < inventory.max_slots, "Inventory full");
    
    // Generate new inventory ID
    let inv_id = self.next_inventory_id.read();
    self.next_inventory_id.write(inv_id + 1);
    
    // Create inventory piece
    let inv_piece = InventoryPiece {
        id: inv_id,
        owner: player,
        base_type: piece.piece_type,
        inherited_traits: genetic_data.inherited_traits.clone(),
        games_played: 0,
        captures_made: genetic_data.capture_count,
        evolution_count: genetic_data.inherited_traits.len(),
        name: custom_name,
        created_at: block_number,
        last_used: block_number,
        is_available: true,
        is_locked: false,
    };
    
    // Store
    self.inventory_pieces.write((player, inv_id), inv_piece);
    inventory.piece_ids.append(inv_id);
    inventory.used_slots += 1;
    self.player_inventory.write(player, inventory);
    
    self.emit(Event::PieceSavedToInventory(PieceSavedToInventory {
        player,
        piece_id: inv_id,
        base_type: piece.piece_type,
        trait_count: genetic_data.inherited_traits.len(),
    }));
}

#[external(v0)]
fn deploy_inventory_piece(
    ref self: ContractState,
    game_id: u64,
    inventory_piece_id: u32,
    starting_position: Position
) -> u32 {
    let player = get_caller_address();
    
    // Get inventory piece
    let mut inv_piece = self.inventory_pieces.read((player, inventory_piece_id));
    
    assert(inv_piece.owner == player, "Not your piece");
    assert(inv_piece.is_available, "Piece not available");
    
    // Create new piece for this game
    let new_piece_id = self.generate_piece_id();
    let color = self.get_player_color(game_id, player);
    
    let new_piece = Piece {
        id: new_piece_id,
        piece_type: inv_piece.base_type,
        color,
        position: starting_position,
        is_alive: true,
        owner: player,
        game_id,
    };
    
    let genetic_data = GeneticData {
        piece_id: new_piece_id,
        inherited_traits: inv_piece.inherited_traits.clone(),
        complexity_cost: self.calculate_complexity(inv_piece.inherited_traits),
        max_complexity: 100,
        generation: inv_piece.evolution_count,
        capture_count: 0,
        is_evolved: true,
        games_played: inv_piece.games_played,
    };
    
    // Store
    self.pieces.write(new_piece_id, new_piece);
    self.genetic_data.write(new_piece_id, genetic_data);
    
    // Mark as in-use
    inv_piece.is_available = false;
    self.inventory_pieces.write((player, inventory_piece_id), inv_piece);
    
    self.emit(Event::PieceDeployedFromInventory(PieceDeployedFromInventory {
        game_id,
        inventory_piece_id,
        new_piece_id,
    }));
    
    return new_piece_id;
}
```

### 2.3 ELO System Implementation

```cairo
// contracts/src/elo_system.cairo

#[external(v0)]
fn register_player(
    ref self: ContractState,
    player: ContractAddress
) {
    assert(!self.player_elo.has(player), "Already registered");
    
    let elo_data = ELOData {
        player_address: player,
        current_elo: 1200,
        highest_elo: 1200,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        win_streak: 0,
        best_win_streak: 0,
    };
    
    self.player_elo.write(player, elo_data);
    
    self.emit(Event::PlayerRegistered(PlayerRegistered {
        player,
        initial_elo: 1200,
    }));
}

#[external(v0)]
fn queue_for_match(
    ref self: ContractState,
    preferred_opponent: OpponentType
) {
    let player = get_caller_address();
    let elo_data = self.player_elo.read(player);
    
    let request = MatchmakingRequest {
        player,
        player_elo: elo_data.current_elo,
        preferred_opponent,
        min_elo: elo_data.current_elo - 100,
        max_elo: elo_data.current_elo + 100,
        queued_at: block_number,
    };
    
    self.matchmaking_queue.write(player, request);
    
    self.emit(Event::PlayerQueued(PlayerQueued {
        player,
        preferred_opponent,
        elo: elo_data.current_elo,
    }));
}

#[external(v0)]
fn complete_match(
    ref self: ContractState,
    game_id: u64,
    winner: Option<ContractAddress>
) {
    let game = self.games.read(game_id);
    let player_white = game.player_white;
    let player_black = game.player_black;
    
    // Get ELO data
    let mut white_elo = self.player_elo.read(player_white);
    let mut black_elo = self.player_elo.read(player_black);
    
    // Determine results
    let white_result = self.get_game_result(winner, player_white);
    let black_result = self.get_game_result(winner, player_black);
    
    // Calculate ELO changes
    let k_white = self.get_k_factor(white_elo);
    let k_black = self.get_k_factor(black_elo);
    
    let white_change = self.calculate_elo_change(
        white_elo.current_elo, black_elo.current_elo, white_result, k_white
    );
    
    let black_change = self.calculate_elo_change(
        black_elo.current_elo, white_elo.current_elo, black_result, k_black
    );
    
    // Update ELO
    white_elo.current_elo = (white_elo.current_elo as i32 + white_change) as u32;
    black_elo.current_elo = (black_elo.current_elo as i32 + black_change) as u32;
    
    // Update stats
    self.update_player_stats(ref white_elo, white_result);
    self.update_player_stats(ref black_elo, black_result);
    
    // Update highest ELO
    if white_elo.current_elo > white_elo.highest_elo {
        white_elo.highest_elo = white_elo.current_elo;
    }
    if black_elo.current_elo > black_elo.highest_elo {
        black_elo.highest_elo = black_elo.current_elo;
    }
    
    // Save
    self.player_elo.write(player_white, white_elo);
    self.player_elo.write(player_black, black_elo);
    
    // Remove from queue
    self.matchmaking_queue.delete(player_white);
    self.matchmaking_queue.delete(player_black);
    
    self.emit(Event::MatchCompleted(MatchCompleted {
        game_id,
        winner,
        white_elo_change: white_change,
        black_elo_change: black_change,
        white_new_elo: white_elo.current_elo,
        black_new_elo: black_elo.current_elo,
    }));
}

fn get_k_factor(self: @ContractState, elo_data: ELOData) -> u8 {
    if elo_data.games_played < 30 {
        return 40; // New players
    }
    if elo_data.current_elo >= 2400 {
        return 10; // Masters
    }
    return 20; // Standard
}

fn calculate_elo_change(
    self: @ContractState,
    player_elo: u32,
    opponent_elo: u32,
    result: GameResult,
    k_factor: u8
) -> i32 {
    // Expected score calculation
    let expected = 1.0 / (1.0 + f64::pow(10.0, (opponent_elo - player_elo) as f64 / 400.0));
    
    // Actual score
    let actual = match result {
        GameResult::Win => 1.0,
        GameResult::Loss => 0.0,
        GameResult::Draw => 0.5,
    };
    
    // Change
    let change = k_factor as f64 * (actual - expected);
    return change as i32;
}
```

## Phase 3: Game Flow Integration

### 3.1 Updated Capture Flow

```cairo
// contracts/src/game.cairo

#[external(v0)]
fn make_move(
    ref self: ContractState,
    game_id: u64,
    move: Move
) {
    // Validate move
    self.validate_move(game_id, move);
    
    // Check if capture
    let is_capture = self.is_capture_move(move);
    
    if is_capture {
        // Execute capture
        let captured_piece = self.get_piece_at(move.to);
        let capturing_piece = self.get_piece(move.piece_id);
        
        // Remove captured piece
        self.remove_piece(captured_piece.id);
        
        // Trigger evolution opportunity
        self.emit(Event::CaptureMade(CaptureMade {
            game_id,
            attacker_id: capturing_piece.id,
            defender_id: captured_piece.id,
            defender_type: captured_piece.piece_type,
        }));
        
        // Note: Evolution is now a separate player decision
        // Player must call request_evolution() or skip_evolution()
    }
    
    // Execute move
    self.execute_move(move);
    
    // Update game state
    self.update_game_state(game_id);
}
```

## Phase 4: Frontend Integration

### 4.1 Evolution Decision UI

```typescript
// Evolution prompt component
function EvolutionPrompt({
  capture,
  onEvolve,
  onSkip
}: {
  capture: CaptureData;
  onEvolve: (traits: TraitName[]) => void;
  onSkip: () => void;
}) {
  const [selectedTraits, setSelectedTraits] = useState<TraitName[]>([]);
  const [gasCost, setGasCost] = useState(0);
  
  const traitCosts = {
    [PieceType.Pawn]: 1,
    [PieceType.Knight]: 3,
    [PieceType.Bishop]: 3,
    [PieceType.Rook]: 5,
    [PieceType.Queen]: 10,
  };
  
  const handleTraitToggle = (trait: TraitName) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };
  
  const totalCost = selectedTraits.length * traitCosts[capture.defendantType];
  
  return (
    <div className="evolution-prompt">
      <h3>Evolution Opportunity!</h3>
      <p>Your {capture.attackerType} captured a {capture.defendantType}</p>
      
      <div className="trait-selection">
        <h4>Select traits to inherit:</h4>
        {getAvailableTraits(capture.defendantType).map(trait => (
          <button
            key={trait}
            className={`trait-btn ${selectedTraits.includes(trait) ? 'selected' : ''}`}
            onClick={() => handleTraitToggle(trait)}
          >
            {trait} ({traitCosts[capture.defendantType]} gas)
          </button>
        ))}
      </div>
      
      <div className="gas-info">
        <p>Your gas: {playerGas}</p>
        <p>Total cost: {totalCost} gas</p>
        <p>Remaining: {playerGas - totalCost} gas</p>
      </div>
      
      <div className="actions">
        <button 
          onClick={() => onSkip()}
          disabled={totalCost > playerGas}
        >
          Skip Evolution
        </button>
        <button 
          onClick={() => onEvolve(selectedTraits)}
          disabled={selectedTraits.length === 0 || totalCost > playerGas}
        >
          Evolve ({totalCost} gas)
        </button>
      </div>
    </div>
  );
}
```

## Testing Checklist

- [ ] Gas initialization on game start
- [ ] Evolution with sufficient gas
- [ ] Evolution blocked when insufficient gas
- [ ] Skip evolution preserves gas
- [ ] Save evolved piece to inventory
- [ ] Deploy inventory piece to new game
- [ ] Inventory piece upgrade after game
- [ ] ELO calculation for wins/losses/draws
- [ ] Matchmaking queue functionality
- [ ] Bot level matching to player ELO

## Next Steps

1. Implement smart contract structures
2. Add unit tests for each system
3. Integrate with existing game flow
4. Update frontend UI
5. Deploy to testnet for testing
6. Gather feedback and iterate
