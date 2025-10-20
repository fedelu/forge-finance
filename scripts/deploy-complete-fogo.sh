#!/bin/bash

# Complete Fogo Testnet Deployment Script
echo "🚀 Starting Complete Fogo Testnet Deployment..."

# Step 1: Deploy Smart Contracts
echo "📦 Step 1: Deploying Smart Contracts to Fogo Testnet..."
bash scripts/deploy-fogo-testnet.sh

# Step 2: Update Frontend Configuration
echo "🔧 Step 2: Updating Frontend Configuration..."
node scripts/update-fogo-config.js

# Step 3: Build Frontend
echo "🏗️ Step 3: Building Frontend..."
npm run build

# Step 4: Deploy to Vercel
echo "🌐 Step 4: Deploying to Vercel..."
vercel --prod

echo "✅ Complete Fogo Testnet Deployment Finished!"
echo ""
echo "📋 Next Steps:"
echo "1. Test real deposits on Fogo testnet"
echo "2. Verify APY calculations"
echo "3. Test withdrawals with rewards"
echo "4. Monitor transaction confirmations"
echo ""
echo "🔗 Useful Links:"
echo "- Fogo Explorer: https://explorer.fogo.io"
echo "- Fogo Faucet: https://faucet.fogo.io"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
