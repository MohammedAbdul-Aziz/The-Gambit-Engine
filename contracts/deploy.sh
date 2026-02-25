#!/bin/bash
set -e

cd "/home/aziz/Gambit Engine/contracts"

# Configuration
RPC_URL="http://localhost:5050"
ACCOUNT="0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec"
PRIVATE_KEY="0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912"

echo "=========================================="
echo "  Gambit Engine - Starkli Deployment"
echo "=========================================="

echo ""
echo "Step 1: Building contract..."
scarb build

echo ""
echo "Step 2: Declaring contract..."
CLASS_HASH=$(starkli declare \
    target/dev/gambit_engine_GambitEngine.contract_class.json \
    --rpc $RPC_URL \
    --account $ACCOUNT \
    --private-key $PRIVATE_KEY \
    --wait 2>&1 | grep -oP '0x[a-fA-F0-9]+' | tail -1)

if [ -z "$CLASS_HASH" ]; then
    echo "Failed to declare contract. Is Katana running?"
    echo "Start Katana: katana"
    exit 1
fi

echo "Class Hash: $CLASS_HASH"

echo ""
echo "Step 3: Deploying contract..."
CONTRACT_ADDRESS=$(starkli deploy \
    $CLASS_HASH \
    --rpc $RPC_URL \
    --account $ACCOUNT \
    --private-key $PRIVATE_KEY \
    --wait 2>&1 | grep -oP '0x[a-fA-F0-9]+' | tail -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "Failed to deploy contract."
    exit 1
fi

echo "Contract Address: $CONTRACT_ADDRESS"

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Contract Address: $CONTRACT_ADDRESS"
echo "Class Hash: $CLASS_HASH"
echo ""
echo "Save these values:"
echo "  export CONTRACT_ADDRESS=$CONTRACT_ADDRESS"
echo "  export CLASS_HASH=$CLASS_HASH"
echo ""

# Save environment file
cat > .env << EOF
CONTRACT_ADDRESS=$CONTRACT_ADDRESS
CLASS_HASH=$CLASS_HASH
RPC_URL=$RPC_URL
ACCOUNT=$ACCOUNT
PRIVATE_KEY=$PRIVATE_KEY
EOF

echo "Environment saved to .env file"
