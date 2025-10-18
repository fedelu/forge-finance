#!/bin/bash

# Forge Finance - Fogo Testnet Deployment Script
# This script deploys all Forge Finance programs to Fogo Testnet

set -e

echo "🚀 Starting Forge Finance Fogo Testnet Deployment..."
echo "=================================================="

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

# Configure Solana CLI for Fogo
configure_solana() {
    print_status "Configuring Solana CLI for Fogo testnet..."
    
    # Set Fogo RPC
    solana config set --url https://testnet.fogo.io
    
    # Check if Fogo keypair exists
    if [ ! -f "/Users/federicodelucchi/.config/solana/fogo-testnet-keypair.json" ]; then
        print_warning "Fogo keypair not found. Creating new one..."
        solana-keygen new --outfile /Users/federicodelucchi/.config/solana/fogo-testnet-keypair.json --no-bip39-passphrase
    fi
    
    # Set Fogo keypair
    solana config set --keypair /Users/federicodelucchi/.config/solana/fogo-testnet-keypair.json
    
    # Verify configuration
    print_status "Solana configuration:"
    solana config get
    
    print_success "Solana CLI configured for Fogo testnet"
}

# Check wallet balance and get testnet tokens
check_balance() {
    print_status "Checking wallet balance..."
    
    BALANCE=$(solana balance --lamports)
    BALANCE_SOL=$(echo "scale=4; $BALANCE / 1000000000" | bc)
    
    print_status "Current balance: $BALANCE_SOL SOL"
    
    # Check if balance is sufficient
    if (( $(echo "$BALANCE_SOL < 1" | bc -l) )); then
        print_warning "Balance is low ($BALANCE_SOL SOL). Getting testnet tokens..."
        
        # Try to get testnet tokens
        print_status "Requesting testnet tokens from Fogo faucet..."
        
        # Get wallet address
        WALLET_ADDRESS=$(solana address)
        print_status "Wallet address: $WALLET_ADDRESS"
        
        print_warning "Please visit https://testnet.fogo.io/faucet and request tokens for: $WALLET_ADDRESS"
        print_warning "Or try: solana airdrop 10 (if available)"
        
        read -p "Press Enter after getting testnet tokens..."
        
        # Check balance again
        BALANCE=$(solana balance --lamports)
        BALANCE_SOL=$(echo "scale=4; $BALANCE / 1000000000" | bc)
        print_status "New balance: $BALANCE_SOL SOL"
    fi
    
    print_success "Balance check completed"
}

# Generate new program IDs for Fogo
generate_program_ids() {
    print_status "Generating new program IDs for Fogo testnet..."
    
    # This will generate new program IDs
    anchor keys list > program_ids_fogo.txt
    
    print_warning "New program IDs generated. Please update Anchor.toml with these IDs:"
    cat program_ids_fogo.txt
    
    read -p "Have you updated Anchor.toml with the new Fogo program IDs? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Please update Anchor.toml first and run the script again."
        exit 1
    fi
    
    print_success "Program IDs configured for Fogo"
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

# Deploy programs to Fogo
deploy_programs() {
    print_status "Deploying programs to Fogo testnet..."
    
    # Deploy all programs
    anchor deploy --provider.cluster fogo-testnet
    
    if [ $? -eq 0 ]; then
        print_success "All programs deployed successfully to Fogo testnet!"
    else
        print_error "Deployment failed. Please check the errors above."
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment on Fogo..."
    
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
    
    print_success "Fogo deployment verification completed"
}

# Update frontend configuration for Fogo
update_frontend() {
    print_status "Updating frontend configuration for Fogo..."
    
    # Create Fogo config file
    cat > app/src/config/fogo-testnet.ts << EOF
// Forge Protocol - Fogo Testnet Configuration
// Fogo testnet deployment configuration

export const FOGO_TESTNET_PROGRAM_IDS = {
  FORGE_CORE: '$(grep "forge_core" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_CRUCIBLES: '$(grep "forge_crucibles" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_SPARKS: '$(grep "forge_sparks" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_SMELTERS: '$(grep "forge_smelters" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_HEAT: '$(grep "forge_heat" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_REACTORS: '$(grep "forge_reactors" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_FIREWALL: '$(grep "forge_firewall" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
  FORGE_ENGINEERS: '$(grep "forge_engineers" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')',
} as const

export const FOGO_TESTNET_CONFIG = {
  RPC_URL: 'https://testnet.fogo.io',
  WALLET_ADDRESS: '$(solana address)',
  NETWORK: 'fogo-testnet',
  COMMITMENT: 'confirmed' as const,
  EXPLORER_URL: 'https://explorer.fogo.io',
} as const
EOF
    
    print_success "Frontend configuration updated for Fogo"
}

# Initialize protocol on Fogo
initialize_protocol() {
    print_status "Initializing protocol on Fogo testnet..."
    
    # This would typically be done through a script or CLI command
    print_warning "Please initialize the protocol manually after deployment:"
    print_warning "1. Set up protocol parameters"
    print_warning "2. Initialize crucibles"
    print_warning "3. Set up governance"
    print_warning "4. Configure fees and limits"
    
    print_success "Protocol initialization instructions provided"
}

# Main deployment function
main() {
    echo "🚀 Forge Finance Fogo Testnet Deployment"
    echo "========================================"
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
    initialize_protocol
    
    echo ""
    echo "🎉 FOGO TESTNET DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "================================================="
    echo ""
    echo "📊 Program IDs:"
    anchor keys list
    echo ""
    echo "🔗 Fogo Explorer links:"
    echo "https://explorer.fogo.io/address/$(grep "forge_core" Anchor.toml | grep -o '"[^"]*"' | tr -d '"')"
    echo ""
    echo "💰 Wallet Address: $(solana address)"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "- This is a testnet deployment"
    echo "- Test all functionality thoroughly"
    echo "- Document any issues found"
    echo "- Use this for testing before mainnet"
    echo ""
    echo "Next steps:"
    echo "1. Test all protocol functions"
    echo "2. Initialize crucibles and governance"
    echo "3. Test with multiple users"
    echo "4. Fix any issues found"
    echo "5. Deploy to mainnet when ready"
}

# Run main function
main "$@"
