# Phantom Wallet Integration Guide

## Overview

This guide explains the new robust Phantom wallet integration that fixes connection issues and provides a clean foundation for Fogo Sessions integration.

## Key Components

### 1. `usePhantomWallet` Hook (`src/hooks/usePhantomWallet.ts`)

A comprehensive React hook that handles all Phantom wallet operations:

```typescript
const {
  provider,        // Phantom provider instance
  publicKey,       // Connected wallet's public key
  connected,       // Connection status
  connecting,      // Connection in progress
  error,          // Error message if any
  isInstalled,    // Phantom installation status
  isUnlocked,     // Wallet unlock status
  connect,        // Connect function
  disconnect,     // Disconnect function
  signMessage,    // Sign message function
  clearError      // Clear error function
} = usePhantomWallet();
```

**Key Features:**
- ✅ SSR-safe (only runs in browser)
- ✅ Handles provider injection timing
- ✅ Prevents duplicate connection attempts
- ✅ Comprehensive error handling
- ✅ Automatic reconnection detection
- ✅ Detailed console logging

### 2. Fogo Session Initialization (`src/lib/fogoSessionInit.ts`)

Placeholder for Fogo SDK integration:

```typescript
// Initialize Fogo Session with Phantom provider
const result = await initFogoSession(provider);

// Sign message for Fogo Session
const signature = await signFogoMessage(provider, message);
```

### 3. Test Components

- **`PhantomWalletButton`** (`src/components/PhantomWalletButton.tsx`): Complete UI component for testing
- **`wallet-test` page** (`src/pages/wallet-test.tsx`): Dedicated test page
- **`SimplifiedWalletContext`** (`src/contexts/SimplifiedWalletContext.tsx`): Context wrapper

## Usage Examples

### Basic Connection

```tsx
import { usePhantomWallet } from '../hooks/usePhantomWallet';

function MyComponent() {
  const { connected, publicKey, connect, error } = usePhantomWallet();
  
  return (
    <div>
      {connected ? (
        <p>Connected: {publicKey?.toString()}</p>
      ) : (
        <button onClick={connect}>Connect Phantom</button>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### With Fogo Session Integration

```tsx
import { usePhantomWallet } from '../hooks/usePhantomWallet';
import { initFogoSession } from '../lib/fogoSessionInit';

function MyComponent() {
  const { provider, connected, connect } = usePhantomWallet();
  
  const handleConnect = async () => {
    await connect();
    
    if (provider) {
      const session = await initFogoSession(provider);
      console.log('Fogo Session:', session);
    }
  };
  
  return <button onClick={handleConnect}>Connect & Initialize Fogo</button>;
}
```

## Error Handling

The hook provides comprehensive error handling for common scenarios:

1. **Phantom Not Installed**
   - Shows install link
   - Prevents connection attempts
   - Clear error message

2. **Wallet Locked**
   - Detects locked state
   - Shows unlock prompt
   - Allows retry after unlocking

3. **Connection Rejected**
   - Handles user rejection gracefully
   - Provides retry option
   - Logs detailed error info

4. **Network Issues**
   - Handles connection timeouts
   - Provides retry mechanism
   - Graceful degradation

## Console Logging

All operations are logged with clear prefixes:

```
🔍 usePhantomWallet: Detecting Phantom provider...
✅ usePhantomWallet: Phantom provider detected
🔌 usePhantomWallet: Attempting to connect to Phantom...
✅ usePhantomWallet: Successfully connected to: [address]
🔥 initFogoSession: Initializing Fogo Session...
✅ initFogoSession: Fogo session initialized successfully
```

## Testing

### Test Page
Visit `http://localhost:3003/wallet-test` for a dedicated test page.

### Demo Page
The main demo page (`http://localhost:3003/demo`) includes the wallet button.

### Console Testing
Open browser console to see detailed logs of all operations.

## Environment Configuration

The `.env.local` file is configured for Fogo testnet:

```env
NEXT_PUBLIC_SOLANA_NETWORK=fogo-testnet
NEXT_PUBLIC_RPC_URL=https://testnet.fogo.io
NEXT_PUBLIC_COMMITMENT=confirmed
NEXT_PUBLIC_APP_DOMAIN=http://localhost:3003
```

## Next Steps for Fogo Sessions Integration

1. **Replace Placeholder Functions**
   - Update `initFogoSession()` in `src/lib/fogoSessionInit.ts`
   - Integrate actual Fogo SDK
   - Add paymaster configuration

2. **Add Session Management**
   - Session renewal logic
   - Session expiration handling
   - Session storage

3. **Transaction Signing**
   - Gasless transaction support
   - Paymaster integration
   - Transaction queuing

4. **Error Handling**
   - Fogo-specific error codes
   - Network error handling
   - User-friendly error messages

## Files Created/Modified

### New Files
- `src/hooks/usePhantomWallet.ts` - Main wallet hook
- `src/lib/fogoSessionInit.ts` - Fogo Session initialization
- `src/components/PhantomWalletButton.tsx` - Test UI component
- `src/pages/wallet-test.tsx` - Test page
- `src/contexts/SimplifiedWalletContext.tsx` - Context wrapper
- `PHANTOM_WALLET_INTEGRATION.md` - This guide

### Modified Files
- `.env.local` - Updated for Fogo testnet
- `src/pages/demo.tsx` - Added wallet button

## Troubleshooting

### Common Issues

1. **"Phantom is not installed"**
   - Install Phantom wallet extension
   - Refresh the page
   - Check browser console for details

2. **"Connection failed"**
   - Unlock Phantom wallet
   - Check network connection
   - Try refreshing the page

3. **"Provider detection failed"**
   - Wait for page to fully load
   - Check if Phantom is properly installed
   - Try refreshing the page

### Debug Steps

1. Open browser console (F12)
2. Look for wallet-related logs
3. Check for error messages
4. Verify Phantom wallet is unlocked
5. Try the test page at `/wallet-test`

## Production Considerations

- Update `NEXT_PUBLIC_APP_DOMAIN` for production domain
- Add proper error boundaries
- Implement session persistence
- Add analytics tracking
- Test across different browsers
- Add mobile wallet support
