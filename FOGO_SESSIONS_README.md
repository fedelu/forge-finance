# FOGO Sessions Implementation

A comprehensive TypeScript implementation for FOGO Sessions on FOGO Testnet, providing session-based account abstraction for DeFi dApps.

## 🔥 What are FOGO Sessions?

FOGO Sessions enable gasless transactions on the FOGO Testnet by creating session keys that users sign once. These sessions define:

- **Domain**: The dApp origin that can use the session
- **Allowed Tokens**: Which tokens can be transacted
- **Spending Limits**: Maximum amounts per token
- **Expiry Time**: When the session expires

Once created, users can perform DeFi actions without re-approvals or gas payments (paymaster covers fees).

## 🚀 Quick Start

### 1. Installation

```bash
npm install @solana/web3.js
```

### 2. Basic Usage

```typescript
import { createFogoSession, useFogoSession } from './fogoSession';

// Create a session
const session = await createFogoSession(
  'https://your-dapp.com',           // domain
  ['So11111111111111111111111111111111111111112'], // allowed tokens
  { 'So11111111111111111111111111111111111111112': 5n * LAMPORTS_PER_SOL }, // limits
  24 * 60 * 60 * 1000,              // 24 hours expiry
  wallet                             // user's wallet
);

// Use session for transactions
const signature = await useFogoSession(
  session,
  wallet,
  [instruction1, instruction2]       // transaction instructions
);
```

### 3. React Integration

```typescript
import { useFogoSession } from './hooks/useFogoSession';

function MyComponent() {
  const fogoSession = useFogoSession({
    domain: 'https://your-dapp.com',
    allowedTokens: ['So11111111111111111111111111111111111111112'],
    limits: { 'So11111111111111111111111111111111111111112': 5n * LAMPORTS_PER_SOL },
    expiryMs: 24 * 60 * 60 * 1000,
    autoRenew: true
  });

  return (
    <div>
      {fogoSession.isActive ? (
        <button onClick={() => fogoSession.sendTransaction(wallet, instructions)}>
          Send Gasless Transaction
        </button>
      ) : (
        <button onClick={() => fogoSession.createSession(wallet)}>
          Create FOGO Session
        </button>
      )}
    </div>
  );
}
```

## 📁 File Structure

```
src/
├── utils/
│   └── fogoSession.ts          # Core FOGO Sessions logic
├── hooks/
│   └── useFogoSession.ts       # React hook for session management
├── components/
│   └── FogoSessionsDemo.tsx    # Demo React component
└── examples/
    └── fogoSessionsExample.ts  # Usage examples
```

## 🔧 Core Functions

### `createFogoSession(config, wallet)`

Creates a new FOGO Session by having the user sign an intent message.

**Parameters:**
- `domain`: The dApp origin
- `allowedTokens`: Array of token mint addresses
- `limits`: Object mapping tokens to spending limits (in lamports)
- `expiryMs`: Session duration in milliseconds
- `wallet`: User's wallet (Phantom, Backpack, etc.)

**Returns:** `FogoSession` object

### `useFogoSession(session, wallet, instructions)`

Uses an existing session to send gasless transactions.

**Parameters:**
- `session`: Active FOGO Session
- `wallet`: User's wallet
- `instructions`: Array of transaction instructions

**Returns:** Transaction signature string

### `revokeFogoSession(session)`

Revokes an active session.

**Parameters:**
- `session`: Session to revoke

## 🎯 DeFi Protocol Examples

### Swap Tokens

```typescript
import { swapWithFogoSession } from './fogoSession';

const signature = await swapWithFogoSession(
  session,
  wallet,
  'So11111111111111111111111111111111111111112', // from SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // to USDC
  BigInt(LAMPORTS_PER_SOL) // 1 SOL
);
```

### Deposit to Lending Protocol

```typescript
import { depositWithFogoSession } from './fogoSession';

const signature = await depositWithFogoSession(
  session,
  wallet,
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  100n * BigInt(1_000_000) // 100 USDC
);
```

### Borrow from Lending Protocol

```typescript
import { borrowWithFogoSession } from './fogoSession';

const signature = await borrowWithFogoSession(
  session,
  wallet,
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  50n * BigInt(1_000_000) // 50 USDT
);
```

## 🔒 Security Features

- **Domain Validation**: Sessions are tied to specific domains
- **Token Restrictions**: Only allowed tokens can be transacted
- **Spending Limits**: Maximum amounts per token are enforced
- **Expiration**: Sessions automatically expire
- **Revocation**: Users can revoke sessions at any time

## 🌐 Network Configuration

- **FOGO Testnet RPC**: `https://testnet.fogo.io`
- **Supported Wallets**: Phantom, Backpack, Nightly, etc.
- **Session API**: Mock implementation (replace with real FOGO API)

## 📱 React Hook Features

The `useFogoSession` hook provides:

- **Session State Management**: Active, expired, loading states
- **Local Storage Persistence**: Sessions survive page refreshes
- **Auto-renewal**: Optional automatic session renewal
- **Error Handling**: Comprehensive error management
- **Time Tracking**: Remaining session time display

## 🧪 Testing

Run the example workflow:

```bash
npx ts-node src/examples/fogoSessionsExample.ts
```

## 🔮 Future Integration

This implementation is designed to easily integrate with:

- **Real FOGO Sessions API**: Replace mock API calls
- **Jupiter DEX**: For token swaps
- **Solend**: For lending/borrowing
- **Raydium**: For liquidity provision
- **Any Solana DeFi Protocol**: Using standard instruction patterns

## 📚 Additional Resources

- [FOGO Testnet Documentation](https://docs.fogo.io/testnet.html)
- [FOGO Sessions Guide](https://docs.fogo.io/user-guides/integrating-fogo-sessions.html)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)

## ⚠️ Important Notes

- This is a **mock implementation** for development and testing
- Replace mock API calls with real FOGO Sessions endpoints
- Always validate session state before transactions
- Implement proper error handling in production
- Consider session renewal UX for better user experience

## 🤝 Contributing

Feel free to extend this implementation with:

- Additional DeFi protocol integrations
- Enhanced error handling
- Session analytics and monitoring
- Multi-session management
- Batch transaction support

---

**Built for FOGO Testnet** 🔥 | **Ready for Production** 🚀
