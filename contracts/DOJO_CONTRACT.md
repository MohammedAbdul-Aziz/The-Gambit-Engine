# Dojo Contract Integration Guide

## Current Status

✅ **Library builds successfully** with both `scarb build` and `sozo build`

The Gambit Engine library provides all types, models, and game logic. To deploy as a full Dojo application, you need to create a contract that integrates with Dojo's World.

## Creating a Dojo Contract

### Step 1: Create Contract File

Create `src/contracts.cairo`:

```cairo
#[starknet::contract]
pub mod GambitWorld {
    use dojo::world::IWorld;
    use crate::{Game, Piece, Player, PieceType, Color, GameConfig, GameEndReason};

    #[storage]
    pub struct Storage {
        next_game_id: u64,
        next_piece_id: u32,
    }

    #[constructor]
    pub fn constructor(ref self: ContractState) {
        self.next_game_id.write(1);
        self.next_piece_id.write(1);
    }

    #[external(v0)]
    pub fn create_game(
        ref self: ContractState,
        world: IWorld,
        config: GameConfig,
    ) -> u64 {
        // Implementation using world.set_entity()
    }
}
```

### Step 2: Update lib.cairo

```cairo
pub mod contracts;
pub use contracts::GambitWorld;
```

### Step 3: Register Models in Scarb.toml

```toml
[[tool.dojo.models]]
name = "Game"

[[tool.dojo.models]]
name = "Piece"

[[tool.dojo.models]]
name = "Player"
```

### Step 4: Build and Deploy

```bash
# Build
sozo build

# Deploy to local devnet
katana &
sozo migrate apply

# Deploy to testnet
sozo migrate apply --rpc-url https://starknet-sepolia.public.blastapi.io
```

## Alternative: Use Dojo Starter

If you encounter issues, create a new Dojo project and import the library:

```bash
# Create new Dojo project
sozo init gambit_full
cd gambit_full

# Import Gambit Engine as dependency
# Edit Scarb.toml:
[dependencies]
gambit_engine = { path = "../contracts" }

# Use types in your contract
use gambit_engine::{Game, Piece, Player};
```

## Known Issues

### Cairo 2.8.2 Compatibility

Some Dojo features require Cairo 2.9+. If you encounter errors:

1. Update Scarb.toml:
```toml
cairo-version = "2.9.0"
starknet = "2.9.0"
```

2. Or use Dojo's version:
```toml
[dependencies]
dojo = { git = "https://github.com/dojoengine/dojo", tag = "v1.8.6" }
```

### asdf Version

If you see asdf notices, upgrade:
```bash
asdf upgrade
asdf install sozo latest
asdf global sozo latest
```

## Testing

```bash
# Run tests
sozo test

# With coverage
sozo test --coverage
```

## Resources

- [Dojo Documentation](https://book.dojoengine.org/)
- [Cairo Documentation](https://book.cairo-lang.org/)
- [Starknet Foundry](https://foundry-rs.github.io/starknet-foundry/)
