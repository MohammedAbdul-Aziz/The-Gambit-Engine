# The Gambit Engine

A DNA-encoded, on-chain chess RPG where every move is a mutation. Built on Starknet.

## ✅ Build Status

```bash
cd contracts
scarb build
# ✅ Finished `dev` profile target(s) in 0 seconds
```

## Project Structure

```
contracts/
├── Scarb.toml              # Package configuration
├── src/
│   ├── lib.cairo           # Main entry point
│   ├── models.cairo        # Data structures & types
│   ├── systems.cairo       # Game logic systems
│   ├── interfaces.cairo    # Interface definitions
│   ├── models/
│   │   ├── types.cairo     # PieceType, Color, Position, etc.
│   │   ├── components.cairo # Game, Piece, Player components
│   │   └── initializer.cairo
│   ├── systems/
│   │   ├── game_system.cairo    # Game management
│   │   ├── movement_system.cairo # Move validation
│   │   ├── genetics_system.cairo # Piece breeding
│   │   ├── piece_system.cairo   # Piece management
│   │   └── zk_fog_system.cairo  # Fog of war
│   └── interfaces/
│       ├── game_end_reason.cairo
│       └── contracts.cairo
```

## Prerequisites

```bash
# Install Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Install Starknet Foundry (testing & deployment)
curl -L https://raw.githubusercontent.com/foundry-rs/starknet-foundry/master/scripts/install.sh | sh

# (Optional) Install Dojo for ECS
curl -L https://install.dojoengine.org | bash
```

## Building

```bash
cd contracts
scarb build
```

## Deployment Options

### Option 1: Using Dojo (Recommended)

Dojo provides ECS storage management:

```bash
# Install Dojo
asdf plugin add sozo https://github.com/dojoengine/asdf-sozo.git
asdf install sozo latest
asdf global sozo latest

# Build and deploy
sozo build
sozo migrate apply
```

### Option 2: Using Starknet Foundry

For standalone contracts (requires Cairo 2.9+):

```bash
# Compile
scarb build

# Declare contract
snforge declare --url https://starknet-sepolia.public.blastapi.io

# Deploy
snforge deploy --url https://starknet-sepolia.public.blastapi.io
```

### Option 3: Local Development

```bash
# Start Katana devnet
katana

# Deploy
sozo migrate apply --rpc-url http://localhost:5050
```

## Core Types

### PieceType
```cairo
pub enum PieceType {
    Pawn, Knight, Bishop, Rook, Queen, King,
}
```

### Color
```cairo
pub enum Color {
    White, Black,
}
```

### Position
```cairo
pub struct Position {
    pub file: u8,  // 0-7 (a-h)
    pub rank: u8,  // 0-7 (1-8)
}
```

### GameConfig
```cairo
pub struct GameConfig {
    pub max_complexity: u32,
    pub ghost_count: u8,
    pub zk_fog_enabled: bool,
    pub starting_gas: u32,
}
```

## Game Mechanics

1. **Create Game** - Initialize a new chess game
2. **Create Pieces** - Place pieces on the board
3. **Make Moves** - Validate and execute moves
4. **Capture & Evolve** - Pieces inherit traits on capture
5. **End Game** - Checkmate, stalemate, or resignation

## Genetic System

Each piece has DNA-encoded traits:
- **Base Movement**: Standard chess patterns
- **Genetic Traits**: Inherited abilities
- **Complexity Budget**: Max 100 points
- **Generation**: Tracks lineage

## Trait Names

- ForwardStep, Leap, Diagonal, Straight, Combined, Adjacent
- ExtendedRange, PhantomLeap, DoubleMove, Teleport
- HiddenAbility, Ethereal, AutonomousAI

## Configuration

Edit `Scarb.toml`:

```toml
[package]
name = "gambit_engine"
version = "0.1.0"
cairo-version = "2.8.2"

[dependencies]
starknet = "2.8.2"
dojo = "1.0.0"

[tool.dojo.env]
rpc_url = "http://localhost:5050"
```

## Testing

```bash
# Run tests
snforge test

# With Dojo
sozo test
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Links

- [GitHub](https://github.com/MohammedAbdul-Aziz/The-Gambit-Engine)
- [Twitter](https://twitter.com/GambitEngine)
- [Discord](https://discord.gg/gambitengine)
