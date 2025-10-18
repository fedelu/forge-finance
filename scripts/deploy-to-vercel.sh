#!/bin/bash

# Forge Finance - Deploy to Vercel Script
# This script deploys the Forge Finance frontend to Vercel

set -e

echo "🚀 Deploying Forge Finance to Vercel..."
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "app" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    print_success "Directory check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install Vercel CLI globally if not installed
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Install project dependencies
    cd app
    npm install
    
    print_success "Dependencies installed"
}

# Configure for production
configure_production() {
    print_status "Configuring for production..."
    
    # Create production environment file
    cat > .env.production << EOF
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_EXPLORER_URL=https://explorer.solana.com
NEXT_PUBLIC_COMMITMENT=confirmed
EOF
    
    # Update next.config.js for static export
    cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: 'devnet',
    NEXT_PUBLIC_RPC_URL: 'https://api.devnet.solana.com',
    NEXT_PUBLIC_EXPLORER_URL: 'https://explorer.solana.com',
    NEXT_PUBLIC_COMMITMENT: 'confirmed',
  }
}

module.exports = nextConfig
EOF
    
    print_success "Production configuration completed"
}

# Build the project
build_project() {
    print_status "Building project..."
    
    # Build the Next.js app
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build completed successfully"
    else
        print_error "Build failed. Please check the errors above."
        exit 1
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if already logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_warning "Please log in to Vercel first:"
        vercel login
    fi
    
    # Deploy to Vercel
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        print_success "Deployment to Vercel completed!"
    else
        print_error "Deployment failed. Please check the errors above."
        exit 1
    fi
}

# Get deployment URL
get_deployment_url() {
    print_status "Getting deployment URL..."
    
    # Get the deployment URL
    DEPLOYMENT_URL=$(vercel ls | grep "forge-finance" | head -1 | awk '{print $2}')
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        print_success "Deployment URL: https://$DEPLOYMENT_URL"
        echo ""
        echo "🎉 Your Forge Finance app is now live!"
        echo "🔗 URL: https://$DEPLOYMENT_URL"
        echo ""
        echo "📱 Features available:"
        echo "✅ Wallet connection (Phantom, Solflare)"
        echo "✅ Solana devnet integration"
        echo "✅ Token balances and portfolio"
        echo "✅ Crucible management"
        echo "✅ Governance and voting"
        echo "✅ Analytics dashboard"
        echo ""
        echo "💰 Users can get free SOL from:"
        echo "🔗 https://faucet.solana.com (select devnet)"
        echo ""
        echo "🔍 View transactions on:"
        echo "🔗 https://explorer.solana.com/?cluster=devnet"
    else
        print_warning "Could not retrieve deployment URL. Check Vercel dashboard."
    fi
}

# Create deployment summary
create_summary() {
    print_status "Creating deployment summary..."
    
    cat > DEPLOYMENT_INFO.md << EOF
# Forge Finance - Deployment Information

## 🚀 Live Application
- **URL**: https://$DEPLOYMENT_URL
- **Network**: Solana Devnet
- **Status**: ✅ Live and Ready

## 🔧 Configuration
- **RPC URL**: https://api.devnet.solana.com
- **Explorer**: https://explorer.solana.com/?cluster=devnet
- **Faucet**: https://faucet.solana.com (select devnet)

## 📱 Features Available
- ✅ Wallet Connection (Phantom, Solflare)
- ✅ Token Balances & Portfolio
- ✅ Crucible Management
- ✅ Governance & Voting
- ✅ Analytics Dashboard
- ✅ Real-time Updates

## 🎯 For Users
1. **Connect Wallet**: Click "Connect Wallet" button
2. **Get Test SOL**: Visit faucet.solana.com (select devnet)
3. **Start Testing**: Make deposits, create crucibles, vote on proposals

## 🔄 Updates
- **Auto-deploy**: Push to main branch triggers new deployment
- **Manual deploy**: Run \`./scripts/deploy-to-vercel.sh\`

## 📊 Monitoring
- **Vercel Dashboard**: Check deployment status
- **Analytics**: Built-in Vercel analytics
- **Logs**: Available in Vercel dashboard

---
*Deployed on $(date)*
EOF
    
    print_success "Deployment summary created: DEPLOYMENT_INFO.md"
}

# Main deployment function
main() {
    echo "🚀 Forge Finance Vercel Deployment"
    echo "=================================="
    echo ""
    
    check_directory
    install_dependencies
    configure_production
    build_project
    deploy_to_vercel
    get_deployment_url
    create_summary
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "====================================="
    echo ""
    echo "📋 Next steps:"
    echo "1. Share the URL with users"
    echo "2. Test all functionality"
    echo "3. Monitor usage in Vercel dashboard"
    echo "4. Set up custom domain (optional)"
    echo ""
    echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
}

# Run main function
main "$@"
