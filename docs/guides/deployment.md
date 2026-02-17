# Deployment Guide

Complete guide for deploying The Gambit Engine to various networks.

## Overview

This guide covers deployment to:

- **Local Development** (Katana)
- **Starknet Testnet**
- **Starknet Mainnet**

## Prerequisites

```bash
# Required tools
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | bash
curl --proto '=https' --tlsv1.2 -sSf https://install.dojoengine.org | bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/sway/download/install.sh | bash

# Verify installations
scarb --version
sozo --version
sncast --version
```

## Local Deployment

### 1. Start Katana (Local Devnet)

```bash
# Start Katana in background
katana --validate-max-steps 16777216 --invoke-max-steps 16777216
```

### 2. Build Contracts

```bash
cd contracts
sozo build
```

**Expected Output:**
```
Compiling manifests...
Compiling contracts...
Build completed successfully!
```

### 3. Deploy to Katana

```bash
# Deploy the world
sozo migrate apply
```

**Expected Output:**
```
Migrating manifests...
Creating world: 0x...
Deploying contracts...
Migration completed successfully!
```

### 4. Start Torii (Indexer)

```bash
# Get world address from migration output
WORLD_ADDRESS=0xYOUR_WORLD_ADDRESS

# Start Torii
torii \
  --world $WORLD_ADDRESS \
  --rpc http://localhost:5050 \
  --graphql http://localhost:8080
```

### 5. Verify Deployment

```bash
# Query the GraphQL endpoint
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ games { id currentTurn moveCount } }"}'
```

## Testnet Deployment

### 1. Configure Network

Create `dojo.toml`:

```toml
[env]
default = "testnet"

[profile.testnet]
rpc_url = "https://starknet-sepolia.public.blastapi.io"
account_address = "0xYOUR_ACCOUNT_ADDRESS"
private_key = "0xYOUR_PRIVATE_KEY"
world_address = "0xYOUR_WORLD_ADDRESS"
```

### 2. Fund Account

Get testnet ETH from faucet:
- [Starknet Faucet](https://starknet-faucet.vercel.app/)

### 3. Build Contracts

```bash
cd contracts
sozo build
```

### 4. Deploy to Testnet

```bash
# Deploy with testnet profile
sozo migrate apply --profile testnet
```

### 5. Verify on Explorer

Visit Starknet testnet explorer:
```
https://sepolia.starkscan.co/contract/0xYOUR_WORLD_ADDRESS
```

## Mainnet Deployment

### 1. Security Checklist

- [ ] Audit smart contracts
- [ ] Test thoroughly on testnet
- [ ] Set up multi-sig wallet
- [ ] Prepare emergency pause mechanism
- [ ] Document all contract addresses

### 2. Configure Mainnet

Add to `dojo.toml`:

```toml
[profile.mainnet]
rpc_url = "https://starknet-mainnet.public.blastapi.io"
account_address = "0xYOUR_ACCOUNT_ADDRESS"
private_key = "0xYOUR_PRIVATE_KEY"
world_address = "0xYOUR_WORLD_ADDRESS"
```

### 3. Build for Production

```bash
# Optimized build
sozo build --release
```

### 4. Deploy to Mainnet

```bash
sozo migrate apply --profile mainnet
```

### 5. Verify on Explorer

```
https://starkscan.co/contract/0xYOUR_WORLD_ADDRESS
```

## Frontend Deployment

### 1. Configure Environment

Create `.env`:

```bash
# Contract Addresses
NEXT_PUBLIC_WORLD_ADDRESS=0x...
NEXT_PUBLIC_GAME_CONTRACT=0x...
NEXT_PUBLIC_PIECE_CONTRACT=0x...

# Network
NEXT_PUBLIC_STARKNET_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://starknet-sepolia.public.blastapi.io

# Torii
NEXT_PUBLIC_TORII_URL=http://localhost:8080/graphql

# Giza
NEXT_PUBLIC_GIZA_API_KEY=your_api_key
```

### 2. Build Frontend

```bash
cd frontend
npm install
npm run build
```

### 3. Deploy Options

#### Vercel

```bash
npm install -g vercel
vercel deploy
```

#### Netlify

```bash
npm run build
netlify deploy --prod
```

#### IPFS

```bash
npm install -g ipfs-deploy
ipfs-deploy build/
```

## Configuration Files

### dojo.toml

```toml
[world]
name = "Gambit Engine"
description = "DNA-encoded on-chain chess RPG"
cover_uri = "file://assets/cover.png"
socials = { website = "https://gambit.engineer", twitter = "@GambitEngine" }

[env]
default = "local"

[profile.local]
rpc_url = "http://localhost:5050"
account_address = "0x01"
private_key = "0x01"
world_address = "0x..."

[profile.testnet]
rpc_url = "https://starknet-sepolia.public.blastapi.io"
account_address = "0x..."
private_key = "0x..."
world_address = "0x..."

[profile.mainnet]
rpc_url = "https://starknet-mainnet.public.blastapi.io"
account_address = "0x..."
private_key = "0x..."
world_address = "0x..."
```

### Scarb.toml

```toml
[package]
name = "gambit_engine"
version = "0.1.0"
edition = "2023_11"

[dependencies]
starknet = "2.6.3"
dojo = "0.7.0"
giza = "0.1.0"

[[target.starknet-contract]]
casm = true
sierra = true

[tool.dojo]
world_address = "0x..."
```

## Post-Deployment

### 1. Initialize Game Config

```bash
sncast invoke \
  --contract-address $GAME_CONTRACT \
  --function initialize \
  --calldata $INITIAL_COMPLEXITY $GHOST_ENABLED $ZK_FOG_ENABLED
```

### 2. Register AI Models

```bash
sncast invoke \
  --contract-address $GIZA_CONTRACT \
  --function register_model \
  --calldata $MODEL_HASH $MODEL_URI
```

### 3. Set Up Monitoring

```yaml
# monitoring.yaml
alerts:
  - name: HighGasPrice
    condition: gas_price > 100
    webhook: https://hooks.slack.com/...
  
  - name: ContractPause
    condition: is_paused == true
    webhook: https://hooks.slack.com/...
```

## Troubleshooting

### Common Issues

**Deployment fails with "Out of Gas":**
```bash
# Increase gas limit
sozo migrate apply --gas-limit 10000000
```

**Account not found:**
```bash
# Verify account address
sncast account list --url https://starknet-sepolia.public.blastapi.io
```

**World already exists:**
```bash
# Use existing world address
sozo migrate apply --world-address 0x...
```

**Torii indexing errors:**
```bash
# Reset Torii database
rm -rf torii.db
torii --world $WORLD_ADDRESS
```

## Next Steps

- [Development Workflow](development.md) - Daily development guide
- [Testing Strategy](testing.md) - Testing contracts and frontend
