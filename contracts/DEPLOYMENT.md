# Starkli Deployment Guide

## Prerequisites

```bash
# Install starkli
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/starkli/install.sh | sh

# Verify installation
starkli --version
```

## Step 1: Build the Contract

```bash
cd "/home/aziz/Gambit Engine/contracts"
scarb build
```

This creates the compiled contract at:
- `target/dev/gambit_engine_GambitEngine.contract_class.json`

## Step 2: Set Up Account

### Option A: Use Katana Predeployed Account

```bash
# Start Katana
katana

# Set environment variables for account 0
export STARKNET_ACCOUNT_ADDRESS=0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec
export STARKNET_PRIVATE_KEY=0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912
export STARKNET_RPC=http://localhost:5050
```

### Option B: Create New Account (Testnet)

```bash
# Create account (save the output!)
starkli signer keystore account new ~/.starkli_accounts/my_account.json

# Fund the account (get ETH from faucet)
# Visit: https://starknet-faucet.vercel.app/
```

## Step 3: Declare the Contract

```bash
# Declare contract class
starkli declare \
    target/dev/gambit_engine_GambitEngine.contract_class.json \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --keystore ~/.starkli_accounts/my_account.json
```

Note the **Class Hash** from the output.

## Step 4: Deploy the Contract

```bash
# Deploy with constructor (no arguments needed)
starkli deploy \
    <CLASS_HASH> \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --keystore ~/.starkli_accounts/my_account.json
```

Note the **Contract Address** from the output.

## Step 5: Interact with the Contract

### Create a Game

```bash
# GameConfig: { max_complexity: 100, ghost_count: 0, zk_fog_enabled: false, starting_gas: 10 }
# Calldata: 100 0 0 10

starkli invoke \
    <CONTRACT_ADDRESS> \
    create_game \
    100 0 0 10 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --keystore ~/.starkli_accounts/my_account.json
```

### Join a Game

```bash
# Join game_id 1
starkli invoke \
    <CONTRACT_ADDRESS> \
    join_game \
    1 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --keystore ~/.starkli_accounts/my_account.json
```

### Create a Piece

```bash
# PieceType: Pawn=0, Knight=1, Bishop=2, Rook=3, Queen=4, King=5
# Color: White=0, Black=1
# Create pawn (type 0) at position (0, 1) for white (color 0)
starkli invoke \
    <CONTRACT_ADDRESS> \
    create_piece \
    1 0 0 0 1 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --keystore ~/.starkli_accounts/my_account.json
```

### Make a Move

```bash
# Move piece 1 to position (0, 2)
starkli invoke \
    <CONTRACT_ADDRESS> \
    make_move \
    1 1 0 2 \
    --rpc $STARKNET_RPC \
    --account $STARKNET_ACCOUNT_ADDRESS \
    --keystore ~/.starkli_accounts/my_account.json
```

### Query Game State

```bash
# Get game info
starkli call \
    <CONTRACT_ADDRESS> \
    get_game \
    1 \
    --rpc $STARKNET_RPC
```

## Full Deployment Script

```bash
#!/bin/bash
set -e

cd "/home/aziz/Gambit Engine/contracts"

# Configuration
RPC_URL="http://localhost:5050"
ACCOUNT_ADDRESS="0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec"
PRIVATE_KEY="0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912"

echo "Building contract..."
scarb build

echo "Declaring contract..."
CLASS_HASH=$(starkli declare \
    target/dev/gambit_engine_GambitEngine.contract_class.json \
    --rpc $RPC_URL \
    --account $ACCOUNT_ADDRESS \
    --private-key $PRIVATE_KEY \
    --wait | grep -oP '0x[a-fA-F0-9]+')

echo "Class Hash: $CLASS_HASH"

echo "Deploying contract..."
CONTRACT_ADDRESS=$(starkli deploy \
    $CLASS_HASH \
    --rpc $RPC_URL \
    --account $ACCOUNT_ADDRESS \
    --private-key $PRIVATE_KEY \
    --wait | grep -oP '0x[a-fA-F0-9]+')

echo "Contract Address: $CONTRACT_ADDRESS"
echo "Deployment complete!"
```

## Testnet Deployment

```bash
# Set testnet RPC
export STARKNET_RPC=https://starknet-sepolia.public.blastapi.io

# Declare
starkli declare \
    target/dev/gambit_engine_GambitEngine.contract_class.json \
    --rpc $STARKNET_RPC

# Deploy
starkli deploy \
    <CLASS_HASH> \
    --rpc $STARKNET_RPC
```

## Verify Deployment

```bash
# Check contract is deployed
starkli call \
    <CONTRACT_ADDRESS> \
    get_game \
    1 \
    --rpc $STARKNET_RPC
```

## Common Issues

### "Insufficient balance"
Fund your account with ETH from faucet:
- Sepolia: https://starknet-faucet.vercel.app/

### "Class hash already declared"
Use the existing class hash for deployment.

### "Account not deployed"
Deploy your account first or use a predeployed one.
