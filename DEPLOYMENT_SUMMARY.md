# Forge Finance - Deployment Summary

## 🚀 Quick Start Guide

### For Solana Mainnet Deployment:

```bash
# 1. Configure Solana CLI for mainnet
solana config set --url https://api.mainnet-beta.solana.com
solana-keygen new --outfile ~/.config/solana/mainnet-keypair.json
solana config set --keypair ~/.config/solana/mainnet-keypair.json

# 2. Fund your wallet (minimum 10 SOL recommended)
# Transfer SOL from exchange or other wallet

# 3. Generate new program IDs
./scripts/update-anchor-config.sh mainnet

# 4. Update program source files with new IDs
# Edit each program's lib.rs file with the new declare_id!() values

# 5. Deploy to mainnet
./scripts/deploy-mainnet.sh
```

### For Fogo Testnet Deployment:

```bash
# 1. Configure Solana CLI for Fogo
solana config set --url https://testnet.fogo.io
solana-keygen new --outfile ~/.config/solana/fogo-testnet-keypair.json
solana config set --keypair ~/.config/solana/fogo-testnet-keypair.json

# 2. Get testnet tokens
# Visit: https://testnet.fogo.io/faucet
# Or try: solana airdrop 10

# 3. Generate new program IDs
./scripts/update-anchor-config.sh fogo

# 4. Update program source files with new IDs
# Edit each program's lib.rs file with the new declare_id!() values

# 5. Deploy to Fogo testnet
./scripts/deploy-fogo-mainnet.sh
```

## 📋 Prerequisites Checklist

### Required Tools:
- [ ] Solana CLI installed
- [ ] Anchor CLI (v0.32.0) installed
- [ ] Rust/Cargo installed
- [ ] Node.js (v18+) installed

### For Mainnet:
- [ ] Real SOL (minimum 10 SOL recommended)
- [ ] Hardware wallet (recommended)
- [ ] Security audit completed
- [ ] Thorough testing on testnet

### For Fogo Testnet:
- [ ] Fogo testnet tokens (free)
- [ ] Test wallet setup
- [ ] All functionality tested

## 🔧 Manual Steps Required

### 1. Update Program Source Files
After generating new program IDs, you must update each program's `lib.rs` file:

```rust
// In each program's src/lib.rs
declare_id!("YOUR_NEW_PROGRAM_ID_HERE");
```

**Programs to update:**
- `programs/forge-core/src/lib.rs`
- `programs/forge-crucibles/src/lib.rs`
- `programs/forge-sparks/src/lib.rs`
- `programs/forge-smelters/src/lib.rs`
- `programs/forge-heat/src/lib.rs`
- `programs/forge-reactors/src/lib.rs`
- `programs/forge-firewall/src/lib.rs`
- `programs/forge-engineers/src/lib.rs`

### 2. Initialize Protocol
After deployment, initialize the protocol:

```bash
# For mainnet
anchor run initialize-protocol --provider.cluster mainnet

# For Fogo testnet
anchor run initialize-protocol --provider.cluster fogo-testnet
```

## 💰 Cost Estimates

### Solana Mainnet:
- **Deployment**: ~2-5 SOL per program (8 programs = ~16-40 SOL)
- **Transaction fees**: ~0.000005 SOL per transaction
- **Storage**: ~0.00089 SOL per KB

### Fogo Testnet:
- **Deployment**: Free (testnet tokens)
- **Transaction fees**: Free
- **Storage**: Free

### Fogo Mainnet:
- **Deployment**: **TBD** (Not yet launched - estimated Q2-Q3 2024)
- **Transaction fees**: **TBD** (Expected to be very low due to high performance design)
- **Storage**: **TBD** (Expected to be competitive with other L1s)
- **Status**: Currently in testnet phase, mainnet launch pending

## 🔍 Verification Steps

### After Deployment:
1. **Check program status:**
   ```bash
   solana program show <PROGRAM_ID>
   ```

2. **Verify on explorer:**
   - Mainnet: https://explorer.solana.com
   - Fogo: https://explorer.fogo.io

3. **Test all functions:**
   ```bash
   anchor test --provider.cluster <NETWORK>
   ```

4. **Monitor logs:**
   ```bash
   solana logs <PROGRAM_ID>
   ```

## ⚠️ Important Security Notes

### Mainnet:
- **Use hardware wallet** for mainnet keypair
- **Test thoroughly** on testnet first
- **Audit smart contracts** before mainnet deployment
- **Implement upgrade authority** management
- **Set up monitoring** and alerting

### Fogo Testnet:
- **Use separate keypairs** from mainnet
- **Test all functionality** before mainnet
- **Monitor for bugs** and edge cases
- **Document any issues** found

## 🚨 Troubleshooting

### Common Issues:
1. **Insufficient funds**: Ensure wallet has enough SOL
2. **Program ID conflicts**: Generate new IDs for each network
3. **RPC errors**: Check network connectivity and RPC endpoint
4. **Build failures**: Ensure all dependencies are installed

### Debug Commands:
```bash
# Check Solana CLI version
solana --version

# Check Anchor version
anchor --version

# Check program build
anchor build --verbose

# Check deployment status
solana program show <PROGRAM_ID> --verbose
```

## 📞 Support

- **Solana Documentation**: https://docs.solana.com/
- **Anchor Documentation**: https://www.anchor-lang.com/
- **Fogo Documentation**: https://docs.fogo.io/
- **Forge Finance Issues**: Create GitHub issues for bugs

---

**⚠️ CRITICAL**: Always test thoroughly on testnet before deploying to mainnet. Mainnet deployments are permanent and costly.
