# Forge Finance - Deployment Guide

## Overview
This guide covers deployment to both **Solana Mainnet** and **Fogo Testnet** for the Forge Finance protocol.

## Prerequisites

### Required Tools
- **Solana CLI** (latest version)
- **Anchor CLI** (v0.32.0)
- **Rust** (latest stable)
- **Node.js** (v18+)
- **Docker** (optional, for containerized builds)

### Required Accounts
- **Solana Mainnet**: Real SOL for deployment fees (~2-5 SOL)
- **Fogo Testnet**: Fogo testnet tokens (free)
- **Wallet**: Phantom or Solflare wallet with sufficient funds

## Part 1: Solana Mainnet Deployment

### Step 1: Configure Solana CLI for Mainnet
```bash
# Set cluster to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Set keypair (create new one for mainnet)
solana-keygen new --outfile ~/.config/solana/mainnet-keypair.json

# Set as default keypair
solana config set --keypair ~/.config/solana/mainnet-keypair.json

# Verify configuration
solana config get
```

### Step 2: Fund Mainnet Wallet
```bash
# Check balance
solana balance

# You need to fund this wallet with real SOL
# Transfer SOL from an exchange or another wallet
# Minimum recommended: 5 SOL for deployment + fees
```

### Step 3: Update Anchor.toml for Mainnet
```toml
[programs.mainnet]
forge_core = "YOUR_MAINNET_PROGRAM_ID_1"
forge_crucibles = "YOUR_MAINNET_PROGRAM_ID_2"
forge_sparks = "YOUR_MAINNET_PROGRAM_ID_3"
forge_smelters = "YOUR_MAINNET_PROGRAM_ID_4"
forge_heat = "YOUR_MAINNET_PROGRAM_ID_5"
forge_reactors = "YOUR_MAINNET_PROGRAM_ID_6"
forge_firewall = "YOUR_MAINNET_PROGRAM_ID_7"
forge_engineers = "YOUR_MAINNET_PROGRAM_ID_8"

[provider]
cluster = "mainnet"
wallet = "/Users/federicodelucchi/.config/solana/mainnet-keypair.json"
```

### Step 4: Generate New Program IDs
```bash
# Generate new program IDs for mainnet
anchor keys list

# Update each program's lib.rs with new IDs:
# forge-core/src/lib.rs: declare_id!("YOUR_NEW_ID");
# forge-crucibles/src/lib.rs: declare_id!("YOUR_NEW_ID");
# etc.
```

### Step 5: Build and Deploy to Mainnet
```bash
# Build all programs
anchor build

# Deploy to mainnet
anchor deploy --provider.cluster mainnet

# Verify deployment
solana program show <PROGRAM_ID>
```

### Step 6: Update Frontend for Mainnet
```typescript
// app/src/config/solana-mainnet.ts
export const SOLANA_MAINNET_PROGRAM_IDS = {
  FORGE_CORE: 'YOUR_MAINNET_PROGRAM_ID_1',
  FORGE_CRUCIBLES: 'YOUR_MAINNET_PROGRAM_ID_2',
  // ... other programs
} as const

export const SOLANA_MAINNET_CONFIG = {
  RPC_URL: 'https://api.mainnet-beta.solana.com',
  NETWORK: 'mainnet-beta',
  COMMITMENT: 'confirmed' as const,
  EXPLORER_URL: 'https://explorer.solana.com',
} as const
```

## Part 2: Fogo Testnet Deployment

### Step 1: Configure Solana CLI for Fogo
```bash
# Set cluster to Fogo testnet
solana config set --url https://testnet.fogo.io

# Create Fogo keypair
solana-keygen new --outfile ~/.config/solana/fogo-testnet-keypair.json

# Set as default keypair
solana config set --keypair ~/.config/solana/fogo-testnet-keypair.json

# Verify configuration
solana config get
```

### Step 2: Fund Fogo Wallet
```bash
# Check balance
solana balance

# Get testnet tokens from Fogo faucet
# Visit: https://testnet.fogo.io/faucet
# Or use: solana airdrop 10 (if available)
```

### Step 3: Update Anchor.toml for Fogo
```toml
[programs.fogo-testnet]
forge_core = "YOUR_FOGO_PROGRAM_ID_1"
forge_crucibles = "YOUR_FOGO_PROGRAM_ID_2"
forge_sparks = "YOUR_FOGO_PROGRAM_ID_3"
forge_smelters = "YOUR_FOGO_PROGRAM_ID_4"
forge_heat = "YOUR_FOGO_PROGRAM_ID_5"
forge_reactors = "YOUR_FOGO_PROGRAM_ID_6"
forge_firewall = "YOUR_FOGO_PROGRAM_ID_7"
forge_engineers = "YOUR_FOGO_PROGRAM_ID_8"

[provider]
cluster = "fogo-testnet"
wallet = "/Users/federicodelucchi/.config/solana/fogo-testnet-keypair.json"
```

### Step 4: Generate New Program IDs for Fogo
```bash
# Generate new program IDs for Fogo
anchor keys list

# Update each program's lib.rs with new Fogo IDs
```

### Step 5: Build and Deploy to Fogo
```bash
# Build all programs
anchor build

# Deploy to Fogo testnet
anchor deploy --provider.cluster fogo-testnet

# Verify deployment
solana program show <PROGRAM_ID>
```

### Step 6: Update Frontend for Fogo
```typescript
// app/src/config/fogo-testnet.ts
export const FOGO_TESTNET_PROGRAM_IDS = {
  FORGE_CORE: 'YOUR_FOGO_PROGRAM_ID_1',
  FORGE_CRUCIBLES: 'YOUR_FOGO_PROGRAM_ID_2',
  // ... other programs
} as const

export const FOGO_TESTNET_CONFIG = {
  RPC_URL: 'https://testnet.fogo.io',
  WALLET_ADDRESS: 'YOUR_FOGO_WALLET_ADDRESS',
} as const
```

## Automated Deployment Scripts

### Mainnet Deployment Script
```bash
#!/bin/bash
# scripts/deploy-mainnet.sh

echo "🚀 Deploying Forge Finance to Solana Mainnet..."

# Set mainnet configuration
solana config set --url https://api.mainnet-beta.solana.com
solana config set --keypair ~/.config/solana/mainnet-keypair.json

# Check balance
echo "💰 Checking wallet balance..."
solana balance

# Build programs
echo "🔨 Building programs..."
anchor build

# Deploy programs
echo "📦 Deploying programs to mainnet..."
anchor deploy --provider.cluster mainnet

echo "✅ Mainnet deployment complete!"
echo "📊 Program IDs:"
anchor keys list
```

### Fogo Testnet Deployment Script
```bash
#!/bin/bash
# scripts/deploy-fogo-mainnet.sh

echo "🚀 Deploying Forge Finance to Fogo Testnet..."

# Set Fogo configuration
solana config set --url https://testnet.fogo.io
solana config set --keypair ~/.config/solana/fogo-testnet-keypair.json

# Check balance
echo "💰 Checking wallet balance..."
solana balance

# Build programs
echo "🔨 Building programs..."
anchor build

# Deploy programs
echo "📦 Deploying programs to Fogo testnet..."
anchor deploy --provider.cluster fogo-testnet

echo "✅ Fogo testnet deployment complete!"
echo "📊 Program IDs:"
anchor keys list
```

## Post-Deployment Steps

### 1. Initialize Protocol
```bash
# Initialize the protocol on mainnet
anchor run initialize-protocol --provider.cluster mainnet

# Initialize the protocol on Fogo
anchor run initialize-protocol --provider.cluster fogo-testnet
```

### 2. Update Frontend Configuration
```typescript
// Update app/src/contexts/WalletContext.tsx
const RPC_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.mainnet-beta.solana.com'  // Mainnet
  : 'https://testnet.fogo.io'              // Fogo testnet
```

### 3. Test Deployments
```bash
# Run tests on mainnet
anchor test --provider.cluster mainnet

# Run tests on Fogo
anchor test --provider.cluster fogo-testnet
```

### 4. Monitor Deployments
```bash
# Check program status
solana program show <PROGRAM_ID>

# Monitor logs
solana logs <PROGRAM_ID>

# Check account data
solana account <ACCOUNT_ADDRESS>
```

## Security Considerations

### Mainnet Security
- **Use hardware wallet** for mainnet keypair
- **Test thoroughly** on testnet first
- **Audit smart contracts** before mainnet deployment
- **Implement upgrade authority** management
- **Set up monitoring** and alerting

### Fogo Testnet Security
- **Use separate keypairs** from mainnet
- **Test all functionality** before mainnet
- **Monitor for bugs** and edge cases
- **Document any issues** found

## Cost Estimates

### Solana Mainnet
- **Deployment**: ~2-5 SOL per program (8 programs = ~16-40 SOL)
- **Transaction fees**: ~0.000005 SOL per transaction
- **Storage**: ~0.00089 SOL per KB

### Fogo Testnet
- **Deployment**: Free (testnet tokens)
- **Transaction fees**: Free
- **Storage**: Free

### Fogo Mainnet
- **Deployment**: **TBD** (Not yet launched - estimated Q2-Q3 2024)
- **Transaction fees**: **TBD** (Expected to be very low due to high performance design)
- **Storage**: **TBD** (Expected to be competitive with other L1s)
- **Status**: Currently in testnet phase, mainnet launch pending

## Troubleshooting

### Common Issues
1. **Insufficient funds**: Ensure wallet has enough SOL
2. **Program ID conflicts**: Generate new IDs for each network
3. **RPC errors**: Check network connectivity and RPC endpoint
4. **Build failures**: Ensure all dependencies are installed

### Debug Commands
```bash
# Check Solana CLI version
solana --version

# Check Anchor version
anchor --version

# Check Rust version
rustc --version

# Check program build
anchor build --verbose

# Check deployment status
solana program show <PROGRAM_ID> --verbose
```

## Next Steps After Deployment

1. **Update documentation** with new program IDs
2. **Configure monitoring** and alerting
3. **Set up CI/CD** for automated deployments
4. **Create user guides** for each network
5. **Implement governance** mechanisms
6. **Plan upgrade strategies**

## Support

- **Solana Documentation**: https://docs.solana.com/
- **Anchor Documentation**: https://www.anchor-lang.com/
- **Fogo Documentation**: https://docs.fogo.io/
- **Forge Finance Issues**: Create GitHub issues for bugs

---

**⚠️ Important**: Always test thoroughly on testnet before deploying to mainnet. Mainnet deployments are permanent and costly.
