#!/bin/bash

# Forge Finance - Solana Mainnet Deployment Script
# This script deploys all Forge Finance programs to Solana Mainnet

set -e

echo "🚀 Starting Forge Finance Mainnet Deployment..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v solana &> /dev/null; then
        print_error "Solana CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v anchor &> /dev/null; then
        print_error "Anchor CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v cargo &> /dev/null; then
        print_error "Rust/Cargo is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Configure Solana CLI for mainnet
configure_solana() {
    print_status "Configuring Solana CLI for mainnet..."
    
    # Set mainnet RPC
    solana config set --url https://api.mainnet-beta.solana.com
    
    # Check if mainnet keypair exists
    if [ ! -f "/Users/federicodelucchi/.config/solana/mainnet-keypair.json" ]; then
        print_warning "Mainnet keypair not found. Creating new one..."
        solana-keygen new --outfile /Users/federicodelucchi/.config/solana/mainnet-keypair.json --no-bip39-passphrase
    fi
    
    # Set mainnet keypair
    solana config set --keypair /Users/federicodelucchi/.config/solana/mainnet-keypair.json
    
    # Verify configuration
    print_status "Solana configuration:"
    solana config get
    
    print_success "Solana CLI configured for mainnet"
}

# Check wallet balance
check_balance() {
    print_status "Checking wallet balance..."
    
    BALANCE=$(solana balance --lamports)
    BALANCE_SOL=$(echo "scale=4; $BALANCE / 1000000000" | bc)
    
    print_status "Current balance: $BALANCE_SOL SOL"
    
    # Check if balance is sufficient (minimum 10 SOL recommended)
    if (( $(echo "$BALANCE_SOL < 10" | bc -l) )); then
        print_warning "Balance is low ($BALANCE_SOL SOL). Recommended minimum: 10 SOL"
        print_warning "You may need to fund your wallet before deployment."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled. Please fund your wallet first."
            exit 1
        fi
    fi
    
    print_success "Balance check completed"
}

# Generate new program IDs
generate_program_ids() {
    print_status "Generating new program IDs for mainnet..."
    
    # This will generate new program IDs
    anchor keys list > program_ids_mainnet.txt
    
    print_warning "New program IDs generated. Please update Anchor.toml with these IDs:"
    cat program_ids_mainnet.txt
    
    read -p "Have you updated Anchor.toml with the new program IDs? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please update Anchor.toml first and run the script again."
        exit 1
    fi
    
    print_success "Program IDs configured"
}

# Build programs
build_programs() {
    print_status "Building programs..."
    
    # Clean previous build
    anchor clean
    
    # Build all programs
    anchor build
    
    if [ $? -eq 0 ]; then
        print_success "Programs built successfully"
    else
        print_error "Build failed. Please check the errors above."
        exit 1
    fi
}

# Deploy programs
deploy_programs() {
    print_status "Deploying programs to mainnet..."
    
    # Deploy all programs
    anchor deploy --provider.cluster mainnet
    
    if [ $? -eq 0 ]; then
        print_success "All programs deployed successfully to mainnet!"
    else
        print_error "Deployment failed. Please check the errors above."
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get program IDs from Anchor.toml
    PROGRAMS=(
        "forge_core"
        "forge_crucibles" 
        "forge_sparks"
        "forge_smelters"
        "forge_heat"
        "forge_reactors"
        "forge_firewall"
        "forge_engineers"
    )
    
    for program in "${PROGRAMS[@]}"; do
        # Extract program ID from Anchor.toml
        PROGRAM_ID=$(grep "$program" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')
        
        if [ ! -z "$PROGRAM_ID" ]; then
            print_status "Verifying $program: $PROGRAM_ID"
            solana program show "$PROGRAM_ID" --programs
        fi
    done
    
    print_success "Deployment verification completed"
}

# Update frontend configuration
update_frontend() {
    print_status "Updating frontend configuration..."
    
    # Create mainnet config file
    cat > app/src/config/solana-mainnet.ts << EOF
// Forge Protocol - Solana Mainnet Configuration
// Production deployment configuration

export const SOLANA_MAINNET_PROGRAM_IDS = {
  FORGE_CORE: '$(grep "forge_core" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_CRUCIBLES: '$(grep "forge_crucibles" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_SPARKS: '$(grep "forge_sparks" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_SMELTERS: '$(grep "forge_smelters" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_HEAT: '$(grep "forge_heat" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_REACTORS: '$(grep "forge_reactors" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_FIREWALL: '$(grep "forge_firewall" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_ENGINEERS: '$(grep "forge_engineers" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
} as const

export const SOLANA_MAINNET_CONFIG = {
  RPC_URL: 'https://api.mainnet-beta.solana.com',
  NETWORK: 'mainnet-beta',
  COMMITMENT: 'confirmed' as const,
  EXPLORER_URL: 'https://explorer.solana.com',
} as const
EOF
    
    print_success "Frontend configuration updated"
}

# Main deployment function
main() {
    echo "🚀 Forge Finance Mainnet Deployment"
    echo "===================================="
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "Anchor.toml" ]; then
        print_error "Anchor.toml not found. Please run this script from the project root."
        exit 1
    fi
    
    # Run deployment steps
    check_dependencies
    configure_solana
    check_balance
    generate_program_ids
    build_programs
    deploy_programs
    verify_deployment
    update_frontend
    
    echo ""
    echo "🎉 MAINNET DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=============================================="
    echo ""
    echo "📊 Program IDs:"
    anchor keys list
    echo ""
    echo "🔗 Explorer links:"
    echo "https://explorer.solana.com/address/$(grep "forge_core" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "- Save your keypair securely"
    echo "- Test all functionality before announcing"
    echo "- Monitor program activity"
    echo "- Set up governance mechanisms"
    echo ""
    echo "Next steps:"
    echo "1. Initialize the protocol"
    echo "2. Test all functions"
    echo "3. Update documentation"
    echo "4. Announce deployment"
}

# Run main function
main "$@"
