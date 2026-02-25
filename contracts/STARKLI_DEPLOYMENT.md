# Starkli Deployment Guide for Gambit Engine

## ✅ Build Status

```bash
cd contracts
scarb build
# ✅ Finished `dev` profile target(s) in 4 seconds
```

**Compiled Contract:** `target/dev/gambit_engine_GambitEngine.contract_class.json`

## Step 1: Install Starkli

```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/starkli/install.sh | sh
source ~/.bashrc  # or restart terminal
```

## Step 2: Start Katana (Local Devnet)

```bash
# Terminal 1: Start Katana
katana

# Note the predeployed accounts:
# Account 0: 0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec
# Private Key: 0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912
```

## Step 3: Set Environment Variables

```bash
export STARKNET_RPC=http://localhost:5050
export STARKNET_ACCOUNT_ADDRESS=0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec
export STARKNET_PRIVATE_KEY=0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912
```

## Step 4: Declare Contract

```bash
cd "/home/aziz/Gambit Engine/contracts"

starkli declare \
    target/dev/gambit_engine_GambitEngine.contract_class.json \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --private-key $STARKNET_PRIVATE_KEY
```

**Save the CLASS_HASH from output**

## Step 5: Deploy Contract

```bash
starkli deploy \
    <CLASS_HASH> \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --private-key $STARKNET_PRIVATE_KEY
```

**Save the CONTRACT_ADDRESS from output**

## Step 6: Interact with Contract

### Create Game
```bash
starkli invoke \
    <CONTRACT_ADDRESS> \
    create_game \
    10 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --private-key $STARKNET_PRIVATE_KEY
```

### Join Game
```bash
starkli invoke \
    <CONTRACT_ADDRESS> \
    join_game \
    1 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --private-key $STARKNET_PRIVATE_KEY
```

### Create Piece
```bash
# piece_type: 0=Pawn, 1=Knight, 2=Bishop, 3=Rook, 4=Queen, 5=King
# color: 0=White, 1=Black
starkli invoke \
    <CONTRACT_ADDRESS> \
    create_piece \
    1 0 0 0 1 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --private-key $STARKNET_PRIVATE_KEY
```

### Make Move
```bash
starkli invoke \
    <CONTRACT_ADDRESS> \
    make_move \
    1 1 0 2 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --private-key $STARKNET_PRIVATE_KEY
```

## Automated Deployment Script

Save as `deploy.sh`:

```bash
#!/bin/bash
set -e

cd "/home/aziz/Gambit Engine/contracts"

# Configuration
RPC_URL="http://localhost:5050"
ACCOUNT="0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec"
PRIVATE_KEY="0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912"

echo "Building contract..."
scarb build

echo "Declaring contract..."
CLASS_HASH=$(starkli declare \
    target/dev/gambit_engine_GambitEngine.contract_class.json \
    --rpc $RPC_URL \
    --account $ACCOUNT \
    --private-key $PRIVATE_KEY \
    --wait 2>&1 | grep -oP '0x[a-fA-F0-9]+' | tail -1)

echo "Class Hash: $CLASS_HASH"

echo "Deploying contract..."
CONTRACT_ADDRESS=$(starkli deploy \
    $CLASS_HASH \
    --rpc $RPC_URL \
    --account $ACCOUNT \
    --private-key $PRIVATE_KEY \
    --wait 2>&1 | grep -oP '0x[a-fA-F0-9]+' | tail -1)

echo "Contract Address: $CONTRACT_ADDRESS"
echo "Deployment complete!"

# Save for later use
echo "export CONTRACT_ADDRESS=$CONTRACT_ADDRESS" > .env
echo "export CLASS_HASH=$CLASS_HASH"
```

Make executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Testnet Deployment

```bash
# Set testnet RPC
export STARKNET_RPC=https://starknet-sepolia.public.blastapi.io

# You'll need a funded testnet account
# Get ETH from: https://starknet-faucet.vercel.app/

# Declare
starkli declare \
    target/dev/gambit_engine_GambitEngine.contract_class.json \
    --rpc $STARKNET_RPC

# Deploy
starkli deploy \
    <CLASS_HASH> \
    --rpc $STARKNET_RPC
```

## Contract Functions

| Function | Parameters | Returns |
|----------|------------|---------|
| `create_game` | starting_gas: u32 | game_id: u64 |
| `join_game` | game_id: u64 | - |
| `create_piece` | game_id, piece_type, color, file, rank | piece_id: u32 |
| `make_move` | game_id, piece_id, to_file, to_rank | - |

## Events

- `GameCreated`: Emitted when a new game is created
- `GameJoined`: Emitted when a player joins a game
- `PieceCreated`: Emitted when a piece is created
- `MoveMade`: Emitted when a move is made

## Troubleshooting

### "starkli: command not found"
```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/starkli/install.sh | sh
source ~/.bashrc
```

### "Insufficient balance"
Fund your account from Katana's predeployed accounts or use a testnet faucet.

### "Class hash already declared"
Use the existing class hash for deployment.
