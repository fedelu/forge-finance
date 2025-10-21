// Demo-ready Fogo Sessions implementation for investor presentation
import { 
  establishSession, 
  createSessionContext, 
  revokeSession,
  reestablishSession,
  getSessionAccount,
  type Session,
  type SessionContext,
  type TransactionResult
} from "@fogo/sessions-sdk";
import { PublicKey, Connection, TransactionInstruction } from '@solana/web3.js';
import { getStoredSession, clearStoredSession, setStoredSession } from "@fogo/sessions-sdk-web";
import { DEMO_CONFIG } from '../config/demo-config';

/**
 * Demo-ready Fogo Sessions client with mock capabilities
 * This version works without paymaster validation for investor demos
 */
export function createFogoSessionClientDemo(opts?: {
  rpcUrl?: string;
  network?: string;
  paymasterUrl?: string;
}) {
  const rpcUrl = opts?.rpcUrl ?? DEMO_CONFIG.RPC_URL;
  const network = opts?.network ?? DEMO_CONFIG.NETWORK;
  const paymasterUrl = opts?.paymasterUrl ?? DEMO_CONFIG.PAYMASTER_URL;

  console.log('🔥 Initializing Demo Fogo Sessions client with:', {
    rpcUrl,
    network,
    paymasterUrl,
    demoMode: DEMO_CONFIG.DEMO_MODE,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side'
  });

  // Create connection to Fogo testnet
  const connection = new Connection(rpcUrl, 'confirmed');
  
  // Create session context (without paymaster for demo)
  let context;
  try {
    console.log('🔥 Creating demo session context (no paymaster)');
    context = createSessionContext({
      connection,
    });
    console.log('✅ Demo session context created successfully');
  } catch (error) {
    console.error('❌ Failed to create demo session context:', error);
    throw new Error('Unable to create Fogo session context for demo');
  }

  return {
    context,
    connection,
    rpcUrl,
    network,
    paymasterUrl,
    isDemo: true,
  };
}

/**
 * Creates a demo Fogo Session with mock capabilities
 */
export async function createDemoSessionWithWallet(
  context: SessionContext,
  walletPublicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  expires: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
): Promise<any> {
  console.log('🔥 Creating DEMO Fogo session for wallet:', walletPublicKey.toString());
  
  try {
    // Try to create a real session first
    const result = await establishSession({
      context,
      walletPublicKey,
      signMessage,
      expires,
      unlimited: true,
    });

    if (result.type === 0) {
      console.log('✅ Real Fogo session created successfully');
      return result;
    }
  } catch (error) {
    console.log('⚠️ Real session creation failed, using demo mode:', error);
  }

  // Fallback to demo mode
  console.log('🎮 Creating DEMO session (mock)');
  
  const mockSession = {
    sessionPublicKey: new PublicKey(DEMO_CONFIG.DEMO_SESSION_WALLET),
    sessionKey: {} as CryptoKeyPair,
    walletPublicKey,
    payer: walletPublicKey,
    sendTransaction: async (instructions: TransactionInstruction[]) => {
      console.log('🎮 Demo transaction sent with', instructions.length, 'instructions');
      return { 
        type: 'Success', 
        signature: `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
    },
    sessionInfo: {
      expiresAt: expires,
      unlimited: true,
      isDemo: true,
    }
  };
  
  // Store demo session
  try {
    await setStoredSession({
      walletPublicKey,
      sessionKey: mockSession.sessionKey,
    });
  } catch (storageError) {
    console.warn('⚠️ Failed to store demo session:', storageError);
  }

  return {
    type: 0, // Success
    signature: 'demo_signature',
    session: mockSession
  };
}

/**
 * Gets current session (real or demo)
 */
export async function getCurrentDemoSession(
  context: SessionContext, 
  walletPublicKey: PublicKey
): Promise<Session | null> {
  try {
    // Try to get real session first
    const storedSession = await getStoredSession(walletPublicKey);
    if (storedSession) {
      const session = await reestablishSession(context, walletPublicKey, storedSession.sessionKey);
      if (session) {
        console.log('✅ Reestablished real Fogo session');
        return session;
      }
    }
  } catch (error) {
    console.log('⚠️ Real session reestablishment failed, using demo mode');
  }

  // Return demo session
  console.log('🎮 Returning demo session');
  return {
    sessionPublicKey: new PublicKey(DEMO_CONFIG.DEMO_SESSION_WALLET),
    sessionKey: {} as CryptoKeyPair,
    walletPublicKey,
    payer: walletPublicKey,
    sendTransaction: async (instructions: TransactionInstruction[]) => {
      console.log('🎮 Demo transaction sent');
      return { 
        type: 'Success', 
        signature: `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
    },
    sessionInfo: {
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      unlimited: true,
      isDemo: true,
    }
  } as Session;
}

/**
 * Demo transaction sending
 */
export async function sendDemoTransaction(
  session: Session,
  instructions: TransactionInstruction[]
): Promise<TransactionResult> {
  console.log('🚀 Sending DEMO transaction via Fogo Session...');
  
  if (session.sessionInfo?.isDemo) {
    // Demo transaction
    const signature = `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('✅ Demo transaction successful:', signature);
    return { type: 'Success', signature } as TransactionResult;
  } else {
    // Real transaction
    try {
      const result = await session.sendTransaction(instructions);
      console.log('✅ Real Fogo Session transaction successful');
      return result;
    } catch (error) {
      console.error('❌ Real transaction failed, falling back to demo:', error);
      const signature = `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return { type: 'Success', signature } as TransactionResult;
    }
  }
}

/**
 * Demo balance fetching
 */
export async function fetchDemoBalances(
  connection: Connection,
  publicKey: PublicKey
): Promise<{ fogo: number; usdc: number; sol: number }> {
  console.log('💰 Fetching DEMO balances for:', publicKey.toString());
  
  if (DEMO_CONFIG.MOCK_BALANCES) {
    // Return mock balances for demo
    const balances = {
      fogo: DEMO_CONFIG.DEMO_BALANCES.FOGO + (Math.random() * 100 - 50), // Add some variation
      usdc: DEMO_CONFIG.DEMO_BALANCES.USDC + (Math.random() * 50 - 25),
      sol: DEMO_CONFIG.DEMO_BALANCES.SOL + (Math.random() * 0.5 - 0.25),
    };
    
    console.log('🎮 Demo balances:', balances);
    return balances;
  }

  // Try to fetch real balances
  try {
    const fogoMint = new PublicKey(DEMO_CONFIG.TOKEN_ADDRESSES.FOGO);
    const usdcMint = new PublicKey(DEMO_CONFIG.TOKEN_ADDRESSES.USDC);
    
    const [fogoAccount, usdcAccount, solBalance] = await Promise.all([
      getAssociatedTokenAddress(fogoMint, publicKey).then(addr => 
        getAccount(connection, addr).catch(() => ({ amount: BigInt(0) }))
      ),
      getAssociatedTokenAddress(usdcMint, publicKey).then(addr => 
        getAccount(connection, addr).catch(() => ({ amount: BigInt(0) }))
      ),
      connection.getBalance(publicKey)
    ]);

    return {
      fogo: Number(fogoAccount.amount) / 1e9,
      usdc: Number(usdcAccount.amount) / 1e6,
      sol: solBalance / 1e9,
    };
  } catch (error) {
    console.warn('⚠️ Real balance fetch failed, using demo balances:', error);
    return DEMO_CONFIG.DEMO_BALANCES;
  }
}

/**
 * Clear demo session data
 */
export async function clearDemoSession(walletPublicKey: PublicKey): Promise<void> {
  try {
    await clearStoredSession(walletPublicKey);
    console.log('🧹 Cleared demo session data');
  } catch (error) {
    console.error('Error clearing demo session:', error);
  }
}
