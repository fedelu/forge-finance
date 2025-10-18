#!/bin/bash

echo "🔥 Forge Protocol - Fogo Testnet Deployment"
echo "============================================="

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
        print_error "Solana CLI not found. Please install it first."
        echo "Run: sh -c \"\$(curl -sSfL https://release.solana.com/v1.18.4/install)\""
        exit 1
    fi
    
    if ! command -v anchor &> /dev/null; then
        print_error "Anchor CLI not found. Please install it first."
        echo "Run: npm install -g @coral-xyz/anchor-cli"
        exit 1
    fi
    
    if ! command -v rustc &> /dev/null; then
        print_error "Rust not found. Please install it first."
        echo "Run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
        exit 1
    fi
    
    print_success "All dependencies found!"
}

# Configure Solana CLI for Fogo testnet
configure_solana() {
    print_status "Configuring Solana CLI for Fogo testnet..."
    
    # Set Fogo testnet as default
    solana config set --url https://testnet.fogo.io
    
    # Verify configuration
    CURRENT_URL=$(solana config get | grep "RPC URL" | awk '{print $3}')
    if [ "$CURRENT_URL" = "https://testnet.fogo.io" ]; then
        print_success "Solana CLI configured for Fogo testnet"
    else
        print_error "Failed to configure Solana CLI for Fogo testnet"
        exit 1
    fi
}

# Setup wallet
setup_wallet() {
    print_status "Setting up wallet..."
    
    FOGO_KEYPAIR_PATH="$HOME/.config/solana/fogo-testnet-keypair.json"
    
    # Create keypair if it doesn't exist
    if [ ! -f "$FOGO_KEYPAIR_PATH" ]; then
        print_status "Creating new keypair for Fogo testnet..."
        solana-keygen new --no-bip39-passphrase --outfile "$FOGO_KEYPAIR_PATH"
    else
        print_status "Using existing keypair: $FOGO_KEYPAIR_PATH"
    fi
    
    # Set as default keypair
    solana config set --keypair "$FOGO_KEYPAIR_PATH"
    
    # Get wallet address
    WALLET_ADDRESS=$(solana-keygen pubkey "$FOGO_KEYPAIR_PATH" 2>/dev/null)
    if [ -z "$WALLET_ADDRESS" ]; then
        print_error "Failed to get wallet address. Creating new keypair..."
        solana-keygen new --no-bip39-passphrase --outfile "$FOGO_KEYPAIR_PATH"
        WALLET_ADDRESS=$(solana-keygen pubkey "$FOGO_KEYPAIR_PATH")
    fi
    print_success "Wallet Address: $WALLET_ADDRESS"
    
    # Check balance
    BALANCE=$(solana balance --output json 2>/dev/null | jq -r '.result.value' 2>/dev/null)
    if [ -z "$BALANCE" ] || [ "$BALANCE" = "null" ]; then
        BALANCE=0
    fi
    
    print_status "Current Balance: $(echo "scale=2; $BALANCE / 1000000000" | bc) FOGO"
    
    if [ "$BALANCE" -eq 0 ]; then
        print_warning "Wallet has no FOGO tokens!"
        print_status "Proceeding with deployment anyway - you can switch wallets later"
        print_status "Your wallet address: $WALLET_ADDRESS"
        print_status "To claim tokens later, visit: https://www.fogo.io/start"
    fi
    
    print_success "Wallet setup complete with $(echo "scale=2; $BALANCE / 1000000000" | bc) FOGO"
}

# Update Anchor.toml for Fogo testnet
update_anchor_config() {
    print_status "Updating Anchor.toml for Fogo testnet..."
    
    # Backup original
    cp Anchor.toml Anchor.toml.backup
    
    # Create new Anchor.toml with Fogo testnet configuration
    cat > Anchor.toml << EOF
[features]
seeds = false
skip-lint = false

[toolchain]
anchor_version = "0.32.0"

[programs.fogo-testnet]
forge_core = "DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU"
forge_crucibles = "Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2"
forge_sparks = "FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf"
forge_smelters = "B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg"
forge_heat = "Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7"
forge_reactors = "HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc"
forge_firewall = "6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS"
forge_engineers = "99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "testnet"
wallet = "$HOME/.config/solana/fogo-testnet-keypair.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
EOF

    print_success "Anchor.toml updated for Fogo testnet"
}

# Build programs
build_programs() {
    print_status "Building Anchor programs..."
    
    # Clean previous builds
    anchor clean
    
    # Build all programs
    if anchor build; then
        print_success "All programs built successfully!"
    else
        print_error "Build failed. Please check the errors above."
        exit 1
    fi
    
    # Verify build output
    print_status "Verifying build output..."
    if [ -d "target/deploy" ]; then
        PROGRAMS=$(ls target/deploy/*.so 2>/dev/null | wc -l)
        print_success "Found $PROGRAMS compiled programs"
        ls -la target/deploy/*.so
    else
        print_error "Build output directory not found"
        exit 1
    fi
}

# Deploy programs
deploy_programs() {
    print_status "Deploying programs to Fogo testnet..."
    
    # Deploy all programs using anchor
    if anchor deploy --provider.cluster https://testnet.fogo.io; then
        print_success "All programs deployed successfully!"
    else
        print_error "Deployment failed. Please check the errors above."
        exit 1
    fi
}

# Update frontend configuration
update_frontend_config() {
    print_status "Updating frontend configuration..."
    
    # Create Fogo testnet config
    cat > app/src/config/fogo-testnet.ts << EOF
export const FOGO_TESTNET_PROGRAM_IDS = {
  FORGE_CORE: 'DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU',
  FORGE_CRUCIBLES: 'Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2',
  FORGE_SPARKS: 'FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf',
  FORGE_SMELTERS: 'B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg',
  FORGE_HEAT: 'Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7',
  FORGE_REACTORS: 'HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc',
  FORGE_FIREWALL: '6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS',
  FORGE_ENGINEERS: '99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68',
}

export const FOGO_TESTNET_CONFIG = {
  rpcUrl: 'https://testnet.fogo.io',
  network: 'fogo-testnet',
  commitment: 'confirmed' as const,
}
EOF

    print_success "Frontend configuration updated"
}

# Create deployment summary
create_summary() {
    print_status "Creating deployment summary..."
    
    WALLET_ADDRESS=$(solana-keygen pubkey "$HOME/.config/solana/fogo-testnet-keypair.json")
    
    cat > FOGO_DEPLOYMENT_SUMMARY.md << EOF
# 🚀 Forge Protocol - Fogo Testnet Deployment Summary

## Deployment Details
- **Network**: Fogo Testnet
- **RPC URL**: https://testnet.fogo.io
- **Deployment Date**: $(date)
- **Wallet Address**: \`$WALLET_ADDRESS\`

## Deployed Programs
| Program | Program ID | Status |
|---------|------------|--------|
| forge_core | DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU | ✅ Deployed |
| forge_crucibles | Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2 | ✅ Deployed |
| forge_sparks | FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf | ✅ Deployed |
| forge_smelters | B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg | ✅ Deployed |
| forge_heat | Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7 | ✅ Deployed |
| forge_reactors | HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc | ✅ Deployed |
| forge_firewall | 6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS | ✅ Deployed |
| forge_engineers | 99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68 | ✅ Deployed |

## Next Steps
1. **Test the Frontend**: Open http://localhost:3001/demo
2. **Connect Wallet**: Use a Fogo-compatible wallet
3. **Test Features**: Deposit, withdraw, claim rewards
4. **Monitor**: Check transaction status on Fogo testnet

## Resources
- [Fogo Documentation](https://docs.fogo.io)
- [Fogo Testnet Faucet](https://www.fogo.io/start)
- [Fogo Sessions](https://docs.fogo.io/user-guides/integrating-fogo-sessions)

---
**🎉 Forge Protocol is now live on Fogo Testnet!**
EOF

    print_success "Deployment summary created: FOGO_DEPLOYMENT_SUMMARY.md"
}

# Main deployment process
main() {
    echo "Starting Forge Protocol deployment to Fogo testnet..."
    echo ""
    
    check_dependencies
    configure_solana
    setup_wallet
    update_anchor_config
    build_programs
    deploy_programs
    update_frontend_config
    create_summary
    
    echo ""
    print_success "🎉 Forge Protocol successfully deployed to Fogo testnet!"
    echo ""
    print_status "Next steps:"
    echo "1. Start the frontend: cd app && npm run dev"
    echo "2. Open http://localhost:3001/demo"
    echo "3. Connect your Fogo wallet"
    echo "4. Test all DeFi features!"
    echo ""
    print_status "Deployment summary: FOGO_DEPLOYMENT_SUMMARY.md"
}

# Run main function
main "$@"
