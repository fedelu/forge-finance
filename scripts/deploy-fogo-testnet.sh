#!/bin/bash

# Deploy Forge Protocol to Fogo Testnet
echo "🚀 Deploying Forge Protocol to Fogo Testnet..."

# Set Fogo testnet cluster
export ANCHOR_PROVIDER_URL="https://testnet.fogo.io"
export ANCHOR_WALLET="/Users/federicodelucchi/.config/solana/solana-testnet-keypair.json"

# Build the programs
echo "📦 Building programs..."
anchor build

# Deploy to Fogo testnet
echo "🌐 Deploying to Fogo testnet..."
anchor deploy --provider.cluster fogo-testnet

# Update program IDs in config
echo "📝 Updating program IDs..."
node scripts/update-fogo-program-ids.js

echo "✅ Deployment complete!"
echo "📋 Next steps:"
echo "1. Update frontend config with new program IDs"
echo "2. Test contract interactions"
echo "3. Deploy frontend to Vercel"