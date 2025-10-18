#!/bin/bash

# Forge Protocol Testnet Deployment Script
# This script deploys all Forge Protocol programs to Solana testnet

set -e

echo "🔥 Forge Protocol Testnet Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo -e "${RED}Error: Solana CLI is not installed${NC}"
    echo "Please install Solana CLI: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Check if Anchor CLI is installed
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}Error: Anchor CLI is not installed${NC}"
    echo "Please install Anchor CLI: https://www.anchor-lang.com/docs/installation"
    exit 1
fi

echo -e "${YELLOW}Setting up Solana configuration...${NC}"

# Set cluster to testnet
solana config set --url https://api.testnet.solana.com

# Check if keypair exists
if [ ! -f ~/.config/solana/testnet-keypair.json ]; then
    echo -e "${YELLOW}Creating new keypair for testnet...${NC}"
    solana-keygen new --outfile ~/.config/solana/testnet-keypair.json --no-bip39-passphrase
fi

# Set the keypair
solana config set --keypair ~/.config/solana/testnet-keypair.json

# Get wallet address
WALLET_ADDRESS=$(solana address)
echo -e "${GREEN}Wallet Address: $WALLET_ADDRESS${NC}"

# Check SOL balance
BALANCE=$(solana balance)
echo -e "${GREEN}Current Balance: $BALANCE SOL${NC}"

# Request airdrop if balance is low
if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo -e "${YELLOW}Requesting airdrop...${NC}"
    solana airdrop 2
    sleep 5
    BALANCE=$(solana balance)
    echo -e "${GREEN}New Balance: $BALANCE SOL${NC}"
fi

echo -e "${YELLOW}Building programs...${NC}"

# Try to build with Anchor first
if anchor build; then
    echo -e "${GREEN}Build successful with Anchor!${NC}"
    
    echo -e "${YELLOW}Deploying programs to testnet...${NC}"
    
    # Deploy each program
    echo -e "${YELLOW}Deploying forge-core...${NC}"
    solana program deploy target/deploy/forge_core.so --program-id DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU
    
    echo -e "${YELLOW}Deploying forge-crucibles...${NC}"
    solana program deploy target/deploy/forge_crucibles.so --program-id Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2
    
    echo -e "${YELLOW}Deploying forge-sparks...${NC}"
    solana program deploy target/deploy/forge_sparks.so --program-id FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf
    
    echo -e "${YELLOW}Deploying forge-smelters...${NC}"
    solana program deploy target/deploy/forge_smelters.so --program-id B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg
    
    echo -e "${YELLOW}Deploying forge-heat...${NC}"
    solana program deploy target/deploy/forge_heat.so --program-id Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7
    
    echo -e "${YELLOW}Deploying forge-reactors...${NC}"
    solana program deploy target/deploy/forge_reactors.so --program-id HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc
    
    echo -e "${YELLOW}Deploying forge-firewall...${NC}"
    solana program deploy target/deploy/forge_firewall.so --program-id 6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS
    
    echo -e "${YELLOW}Deploying forge-engineers...${NC}"
    solana program deploy target/deploy/forge_engineers.so --program-id 99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68
    
    echo -e "${GREEN}All programs deployed successfully!${NC}"
    
else
    echo -e "${RED}Anchor build failed. Please check the error messages above.${NC}"
    echo -e "${YELLOW}You may need to:${NC}"
    echo "1. Install the correct Solana tools"
    echo "2. Fix any compilation errors"
    echo "3. Update dependencies"
    exit 1
fi

echo -e "${GREEN}Deployment completed!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update frontend configuration with deployed program IDs"
echo "2. Test wallet connections"
echo "3. Initialize the protocol"
echo "4. Create test crucibles"

echo -e "${GREEN}Program IDs:${NC}"
echo "Core: DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU"
echo "Crucibles: Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2"
echo "Sparks: FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf"
echo "Smelters: B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg"
echo "Heat: Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7"
echo "Reactors: HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc"
echo "Firewall: 6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS"
echo "Engineers: 99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68"
