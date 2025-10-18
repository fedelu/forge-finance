# Forge Protocol Testnet Deployment Guide

## Prerequisites

1. **Solana CLI**: Install Solana CLI v1.18.20
2. **Anchor CLI**: Install Anchor CLI v0.32.0
3. **Rust**: Install Rust with Solana support
4. **Testnet SOL**: Get testnet SOL for deployment

## Step 1: Setup Solana Configuration

```bash
# Set cluster to testnet
solana config set --url https://api.testnet.solana.com

# Create a new keypair for deployment
solana-keygen new --outfile ~/.config/solana/testnet-keypair.json

# Set the keypair
solana config set --keypair ~/.config/solana/testnet-keypair.json

# Get testnet SOL (request airdrop)
solana airdrop 2
```

## Step 2: Build and Deploy Programs

### Option A: Using Anchor (Recommended)

```bash
# Build all programs
anchor build

# Deploy to testnet
anchor deploy --provider.cluster testnet
```

### Option B: Manual Deployment

If Anchor build fails, you can build and deploy manually:

```bash
# Build each program individually
cargo build-sbf --manifest-path programs/forge-core/Cargo.toml
cargo build-sbf --manifest-path programs/forge-crucibles/Cargo.toml
cargo build-sbf --manifest-path programs/forge-sparks/Cargo.toml
cargo build-sbf --manifest-path programs/forge-smelters/Cargo.toml
cargo build-sbf --manifest-path programs/forge-heat/Cargo.toml
cargo build-sbf --manifest-path programs/forge-reactors/Cargo.toml
cargo build-sbf --manifest-path programs/forge-firewall/Cargo.toml
cargo build-sbf --manifest-path programs/forge-engineers/Cargo.toml

# Deploy each program
solana program deploy target/deploy/forge_core.so
solana program deploy target/deploy/forge_crucibles.so
solana program deploy target/deploy/forge_sparks.so
solana program deploy target/deploy/forge_smelters.so
solana program deploy target/deploy/forge_heat.so
solana program deploy target/deploy/forge_reactors.so
solana program deploy target/deploy/forge_firewall.so
solana program deploy target/deploy/forge_engineers.so
```

## Step 3: Update Program IDs

After deployment, update the program IDs in:

1. `Anchor.toml` - Update the `[programs.devnet]` section
2. Frontend configuration
3. SDK configuration

## Step 4: Initialize Programs

Create initialization scripts to set up the protocol:

```typescript
// scripts/initialize-testnet.ts
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';

const connection = new Connection('https://api.testnet.solana.com');
const wallet = Keypair.generate(); // Use your deployed keypair

// Initialize each program
async function initializeProtocol() {
  // 1. Initialize Forge Core
  // 2. Initialize Firewall
  // 3. Initialize other programs
  // 4. Set up initial crucibles
}
```

## Step 5: Frontend Configuration

Update the frontend to use testnet:

1. **Wallet Adapter**: Configure for testnet
2. **Program IDs**: Update with deployed program IDs
3. **RPC Endpoint**: Use testnet RPC
4. **Network**: Set to testnet

## Step 6: Testing

1. **Connect Wallet**: Test with Phantom/Solflare
2. **Deploy Crucibles**: Create test crucibles
3. **Deposit/Withdraw**: Test basic functionality
4. **Heat Rewards**: Test reward calculation
5. **Governance**: Test voting functionality

## Program IDs (Update after deployment)

```typescript
export const FORGE_PROGRAM_IDS = {
  CORE: 'DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU',
  CRUCIBLES: 'Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2',
  SPARKS: 'FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf',
  SMELTERS: 'B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg',
  HEAT: 'Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7',
  REACTORS: 'HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc',
  FIREWALL: '6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS',
  ENGINEERS: '99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68',
};
```

## Troubleshooting

1. **Build Errors**: Ensure Rust and Solana tools are properly installed
2. **Deployment Fails**: Check SOL balance and network connectivity
3. **Program ID Mismatch**: Verify program IDs match deployed programs
4. **RPC Issues**: Use reliable testnet RPC endpoints

## Next Steps

1. Deploy to testnet
2. Test with real wallets
3. Create initial crucibles
4. Test all functionality
5. Deploy to mainnet (when ready)
