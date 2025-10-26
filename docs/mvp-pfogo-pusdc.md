# Forge Finance MVP: Solo Volatility Farming

## Overview

The Forge Finance MVP implements **Solo Volatility Farming** where users can deposit FOGO or USDC tokens to receive yield-bearing pTokens (pFOGO or pUSDC) that are freely tradable on external DEXs.

## Key Features

### 1. Dual Token Support
- **FOGO Crucible**: FOGO → pFOGO wrapping
- **USDC Crucible**: USDC → pUSDC wrapping
- Each crucible has its own exchange rate and fee tracking

### 2. Fee Structure
- **0.3% fee** on all wrap/unwrap operations
- **80% of fees** distributed to pToken holders via exchange rate increase
- **20% of fees** sent to Forge treasury

### 3. Yield Mechanism
- Yield is reflected as **price appreciation of pTokens** (like stETH model)
- Exchange rate increases over time based on accumulated fees
- Users receive more base tokens when unwrapping due to rate growth

## Smart Contract Architecture

### Crucible Account Structure
```rust
pub struct Crucible {
    pub engineer: Pubkey,
    pub base_mint: Pubkey,        // FOGO or USDC
    pub ptoken_mint: Pubkey,      // pFOGO or pUSDC
    pub exchange_rate: u128,      // grows over time for APY
    pub total_wrapped: u64,       // total base tokens wrapped
    pub total_fees_collected: u64, // total fees collected
    pub treasury_vault: Pubkey,   // treasury vault for fee collection
    pub tvl: u128,                // Total Value Locked
    pub paused: bool,             // Emergency stop
}
```

### Key Instructions

#### 1. `wrap(amount: u64)`
- User deposits base token (FOGO/USDC)
- Applies 0.3% fee
- Mints equivalent pToken based on current exchange rate
- Updates crucible state

#### 2. `unwrap(amount: u64)`
- User burns pToken
- Applies 0.3% fee
- Returns base token based on current exchange rate
- Transfers fee to treasury

#### 3. `accrue_yield()` (Admin only)
- Distributes 80% of collected fees to exchange rate
- Increases exchange rate proportionally
- Resets fee counter

## Frontend Implementation

### Crucible Display
- Shows both FOGO and USDC crucibles
- Displays base token deposited, pToken balance, and yield earned
- Real-time APY calculation from exchange rate growth

### Wrap/Unwrap UI
- Input validation for amounts
- Fee preview (0.3%)
- pToken amount preview
- Transaction confirmation

### Portfolio Overview
- pToken balances for both FOGO and USDC
- Estimated base token value
- Current APY for each crucible
- Yield earned tracking

## Fee Distribution Logic

### Wrap Operation
```
User deposits: 1000 FOGO
Fee (0.3%): 3 FOGO
Net wrapped: 997 FOGO
pFOGO minted: 997 * RATE_SCALE / exchange_rate
```

### Unwrap Operation
```
User unwraps: 1000 pFOGO
Base amount: 1000 * exchange_rate / RATE_SCALE
Fee (0.3%): base_amount * 0.003
Net returned: base_amount - fee
Treasury receives: fee
```

### Yield Accrual
```
Yield amount: total_fees_collected * 0.8
Rate increase: yield_amount * RATE_SCALE / total_wrapped
New exchange_rate: old_rate + rate_increase
```

## APY Calculation

The APY is calculated from exchange rate growth:

```typescript
daily_growth = (current_rate - previous_rate) / previous_rate
APY = ((1 + daily_growth) ** 365 - 1) * 100%
```

## Security Features

### Access Control
- Crucible authority = Forge PDA
- Admin-only `accrue_yield` function
- Proper signer validation

### Safety Mechanisms
- Paused state for emergency stops
- Fee validation to prevent overflow
- Exchange rate bounds checking

## Testing

The MVP includes comprehensive tests covering:

1. **Wrap/Unwrap Cycles**: Complete roundtrip testing
2. **Fee Distribution**: 80/20 split validation
3. **APY Calculation**: Exchange rate growth verification
4. **Precision Handling**: Small amount edge cases
5. **Authorization**: Unauthorized access prevention

## Usage Flow

### For Users
1. **Connect Wallet**: User connects to Forge
2. **Choose Crucible**: Select FOGO or USDC crucible
3. **Wrap Tokens**: Deposit base tokens, receive pTokens
4. **Earn Yield**: pTokens appreciate in value over time
5. **Unwrap Tokens**: Burn pTokens, receive more base tokens
6. **Trade pTokens**: Freely trade on external DEXs

### For Administrators
1. **Monitor Fees**: Track accumulated fees
2. **Accrue Yield**: Distribute fees to exchange rate
3. **Manage Crucibles**: Pause/resume operations
4. **Treasury Management**: Collect 20% fee share

## Constants

```rust
pub const RATE_SCALE: u128 = 1_000_000_000; // 9 decimal places
pub const FEE_RATE: u64 = 30; // 0.3% in basis points
pub const YIELD_SHARE: u64 = 80; // 80% of fees go to yield
pub const TREASURY_SHARE: u64 = 20; // 20% of fees go to treasury
```

## Future Enhancements

1. **Automated Yield Accrual**: Cron job for regular fee distribution
2. **Multiple Fee Tiers**: Different rates for different crucibles
3. **Governance Integration**: Community-controlled parameters
4. **Cross-Chain Support**: Multi-blockchain pToken trading
5. **Advanced Analytics**: Detailed yield tracking and reporting

## Deployment

The MVP is designed for deployment on:
- **Solana Mainnet**: Production environment
- **Solana Devnet**: Testing and development
- **Local Validator**: Development and testing

## Conclusion

The Forge Finance MVP provides a robust foundation for Solo Volatility Farming, enabling users to earn yield on their FOGO and USDC holdings while maintaining the flexibility to trade pTokens on external DEXs. The 0.3% fee structure ensures sustainable protocol revenue while the 80/20 distribution model maximizes yield for users.
