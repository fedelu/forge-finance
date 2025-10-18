#!/bin/bash

echo "🔥 Forge Protocol - Fogo Testnet Mock Deployment"
echo "================================================"

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

# Set Fogo testnet as default
print_status "Configuring Solana CLI for Fogo testnet..."
solana config set --url https://testnet.fogo.io
print_success "Solana CLI configured for Fogo testnet"

# Use the wallet with tokens
print_status "Setting up wallet with tokens..."
WALLET_ADDRESS="78bNPUUvdFLoCubco57mfXqEu1EU9UmRcodqUGNaZ7Pf"
print_success "Using wallet: $WALLET_ADDRESS"

# Check balance
BALANCE=$(solana balance $WALLET_ADDRESS 2>/dev/null | grep -o '[0-9.]*' | head -1)
if [ -n "$BALANCE" ]; then
    print_success "Wallet balance: $BALANCE SOL"
else
    print_warning "Could not check balance, but proceeding..."
fi

# Create mock program files
print_status "Creating mock program files..."
mkdir -p target/deploy

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

for PROGRAM in "${PROGRAMS[@]}"; do
    echo "Mock program content for ${PROGRAM}.so" > "target/deploy/${PROGRAM}.so"
    print_success "Created ${PROGRAM}.so"
done

# Update frontend configuration
print_status "Updating frontend configuration for Fogo testnet..."

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

# Update WalletContext to use Fogo testnet
print_status "Updating WalletContext for Fogo testnet..."
sed -i.bak 's|https://api.testnet.solana.com|https://testnet.fogo.io|g' app/src/contexts/WalletContext.tsx
print_success "WalletContext updated for Fogo testnet"

# Create deployment summary
print_status "Creating deployment summary..."

cat > FOGO_DEPLOYMENT_SUMMARY.md << EOF
# 🚀 Forge Protocol - Fogo Testnet Deployment Summary

## Deployment Details
- **Network**: Fogo Testnet
- **RPC URL**: https://testnet.fogo.io
- **Deployment Date**: $(date)
- **Wallet Address**: \`$WALLET_ADDRESS\`
- **Wallet Balance**: $BALANCE SOL

## Deployed Programs
| Program | Program ID | Status |
|---------|------------|--------|
| forge_core | DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU | ✅ Mock Deployed |
| forge_crucibles | Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2 | ✅ Mock Deployed |
| forge_sparks | FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf | ✅ Mock Deployed |
| forge_smelters | B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg | ✅ Mock Deployed |
| forge_heat | Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7 | ✅ Mock Deployed |
| forge_reactors | HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc | ✅ Mock Deployed |
| forge_firewall | 6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS | ✅ Mock Deployed |
| forge_engineers | 99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68 | ✅ Mock Deployed |

## Next Steps
1. **Test the Frontend**: Open http://localhost:3001/demo
2. **Connect Wallet**: Use a Fogo-compatible wallet
3. **Test Features**: Deposit, withdraw, claim rewards
4. **Real Deployment**: When ready, deploy actual programs

## Resources
- [Fogo Documentation](https://docs.fogo.io)
- [Fogo Testnet Faucet](https://www.fogo.io/start)
- [Fogo Sessions](https://docs.fogo.io/user-guides/integrating-fogo-sessions)

---
**🎉 Forge Protocol is now configured for Fogo Testnet!**
EOF

print_success "Deployment summary created: FOGO_DEPLOYMENT_SUMMARY.md"

echo ""
print_success "🎉 Forge Protocol successfully configured for Fogo testnet!"
echo ""
print_status "Next steps:"
echo "1. Start the frontend: cd app && npm run dev"
echo "2. Open http://localhost:3001/demo"
echo "3. Connect your Fogo wallet ($WALLET_ADDRESS)"
echo "4. Test all DeFi features!"
echo ""
print_status "Configuration files updated:"
echo "- app/src/config/fogo-testnet.ts"
echo "- app/src/contexts/WalletContext.tsx"
echo "- FOGO_DEPLOYMENT_SUMMARY.md"
echo ""
print_warning "Note: This is a mock deployment. For real deployment, you'll need to:"
echo "1. Fix the Anchor build issues"
echo "2. Deploy actual programs to Fogo testnet"
echo "3. Update program IDs with real deployed addresses"
