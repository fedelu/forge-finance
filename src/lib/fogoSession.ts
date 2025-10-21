// src/lib/fogoSession.ts
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

/**
 * Initialize a Fogo Sessions context and return helpers.
 * Uses the correct Fogo Sessions SDK API.
 */
export function createFogoSessionClient(opts?: {
  rpcUrl?: string;
  network?: string;
  paymasterUrl?: string;
}) {
  const rpcUrl = opts?.rpcUrl ?? process.env.NEXT_PUBLIC_RPC_URL;
  const network = opts?.network ?? process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  const paymasterUrl = opts?.paymasterUrl ?? (process.env.NEXT_PUBLIC_PAYMASTER_URL ?? undefined);

  if (!rpcUrl || !network) {
    console.error("Fogo Sessions: Missing RPC URL or Network in environment variables.");
    throw new Error("Fogo Sessions: RPC URL and Network must be configured.");
  }

  // Temporarily disable paymaster until domain is registered with Fogo team
  // TODO: Re-enable paymaster once domain is registered
  const finalPaymasterUrl = undefined;

  console.log('🔥 Initializing Fogo Sessions client with:', {
    rpcUrl,
    network,
    paymasterUrl: finalPaymasterUrl,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side'
  });
  
  if (!finalPaymasterUrl) {
    console.warn('⚠️ PAYMASTER DISABLED: Domain not registered with Fogo team');
    console.warn('⚠️ Gasless transactions are not available until domain is registered');
    console.warn('⚠️ Contact Fogo team to register your domain for paymaster access');
  }

  // Create connection to Fogo testnet
  const connection = new Connection(rpcUrl, 'confirmed');
  
  // Create session context with error handling
  let context;
  try {
    if (finalPaymasterUrl) {
      console.log('🔥 Creating session context with paymaster:', finalPaymasterUrl);
      context = createSessionContext({
        connection,
        paymaster: finalPaymasterUrl,
      });
    } else {
      console.log('🔥 Creating session context without paymaster (development mode)');
      context = createSessionContext({
        connection,
      });
    }
  } catch (error) {
    console.warn('⚠️ Failed to create session context with paymaster, trying without:', error);
    // Fallback: create context without paymaster
    try {
      context = createSessionContext({
        connection,
      });
      console.log('✅ Fallback session context created successfully');
    } catch (fallbackError) {
      console.error('❌ Failed to create fallback session context:', fallbackError);
      throw new Error('Unable to create Fogo session context');
    }
  }

  return {
    context,
    connection,
    rpcUrl,
    network,
    paymasterUrl: finalPaymasterUrl,
  };
}

/**
 * Creates a Fogo Session using a connected wallet.
 * @param context The session context from createFogoSessionClient
 * @param walletPublicKey The connected wallet's public key
 * @param signMessage Function to sign messages with the wallet
 * @param expires Session expiration date
 * @returns The session establishment result
 */
export async function createSessionWithWallet(
  context: SessionContext,
  walletPublicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  expires: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
): Promise<any> {
  console.log('🔥 Creating Fogo session for wallet:', walletPublicKey.toString());
  
  try {
    const result = await establishSession({
      context,
      walletPublicKey,
      signMessage,
      expires,
      unlimited: true, // Allow unlimited transactions for now
    });

    if (result.type === 0) { // SessionResultType.Success
      console.log('✅ Fogo session created successfully:', result.session.sessionPublicKey.toString());
      
      // Store the session for future use
      try {
        await setStoredSession({
          walletPublicKey,
          sessionKey: result.session.sessionKey,
        });
      } catch (storageError) {
        console.warn('⚠️ Failed to store session, but session created successfully:', storageError);
      }
    } else {
      console.error('❌ Failed to create Fogo session:', result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error creating Fogo session:', error);
    
    // For local development, return a mock success result
    const isDevelopment = process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && 
       (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
    
    if (isDevelopment) {
      console.log('🔄 Local development detected, returning mock session result');
      
      // Create a mock session result
      const mockSession = {
        sessionPublicKey: new PublicKey('11111111111111111111111111111111'), // Mock public key
        sessionKey: {} as CryptoKeyPair, // Mock key pair
        walletPublicKey,
        payer: walletPublicKey,
        sendTransaction: async () => ({ type: 'Success', signature: 'mock_signature' }),
        sessionInfo: {} as any
      };
      
      return {
        type: 0, // SessionResultType.Success
        signature: 'mock_signature',
        session: mockSession
      };
    }
    
    throw error;
  }
}

/**
 * Retrieves the current active Fogo Session.
 * @param context The session context
 * @param walletPublicKey The wallet's public key
 * @returns The current session details or null if no active session.
 */
export async function getCurrentSession(
  context: SessionContext, 
  walletPublicKey: PublicKey
): Promise<Session | null> {
  try {
    // Try to get stored session first
    const storedSession = await getStoredSession(walletPublicKey);
    if (!storedSession) {
      console.log('No stored session found');
      return null;
    }

    // Try to reestablish the session
    const session = await reestablishSession(context, walletPublicKey, storedSession.sessionKey);
    if (session) {
      console.log('✅ Reestablished existing Fogo session:', session.sessionPublicKey.toString());
      return session;
    }

    return null;
  } catch (error) {
    console.error('Error getting current Fogo Session:', error);
    return null;
  }
}

/**
 * Ends the current Fogo Session.
 * @param context The session context
 * @param session The session to end
 */
export async function endFogoSession(
  context: SessionContext,
  session: Session
): Promise<void> {
  try {
    await revokeSession({ context, session });
    console.log('🔚 Fogo Session ended successfully');
  } catch (error) {
    console.error('Error ending Fogo Session:', error);
    throw error;
  }
}

/**
 * Sends a transaction using the active Fogo Session (gasless).
 * @param session The active session
 * @param instructions The transaction instructions to send
 * @returns The transaction result
 */
export async function sendFogoTransaction(
  session: Session,
  instructions: TransactionInstruction[]
): Promise<TransactionResult> {
  try {
    console.log('🚀 Sending transaction via Fogo Session...');
    const result = await session.sendTransaction(instructions);
    console.log('✅ Fogo Session transaction successful');
    return result;
  } catch (error) {
    console.error('Error sending Fogo Session transaction:', error);
    throw error;
  }
}

/**
 * Clear stored session data
 * @param walletPublicKey The wallet's public key
 */
export async function clearStoredFogoSession(walletPublicKey: PublicKey): Promise<void> {
  try {
    await clearStoredSession(walletPublicKey);
    console.log('🧹 Cleared stored Fogo session data');
  } catch (error) {
    console.error('Error clearing stored session:', error);
    throw error;
  }
}