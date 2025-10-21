import { PublicKey } from '@solana/web3.js';

// Phantom provider interface
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  isConnected?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (args: any) => void) => void;
  removeListener: (event: string, callback: (args: any) => void) => void;
}

// Fogo Session configuration
const FOGO_CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.fogo.io',
  API_BASE_URL: process.env.NEXT_PUBLIC_FOGO_API_BASE_URL || 'https://testnet.fogo.io/api',
  SESSION_VERSION: process.env.NEXT_PUBLIC_FOGO_SESSION_VERSION || '0.1',
  CHAIN_ID: process.env.NEXT_PUBLIC_FOGO_CHAIN_ID || 'fogo-testnet',
  APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  DEFAULT_EXPIRY_DAYS: 7,
  COMMITMENT: process.env.NEXT_PUBLIC_COMMITMENT || 'confirmed'
} as const;

/**
 * Initialize Fogo Session with Phantom provider
 * This is a placeholder for future Fogo SDK integration
 */
export async function initFogoSession(provider: PhantomProvider): Promise<{
  success: boolean;
  sessionId?: string;
  error?: string;
}> {
  console.log('🔥 initFogoSession: Initializing Fogo Session...');
  
  try {
    // Guard against server-side rendering
    if (typeof window === 'undefined') {
      throw new Error('Window object not available (server-side rendering)');
    }

    // Validate provider
    if (!provider) {
      throw new Error('Phantom provider is required');
    }

    if (!provider.isPhantom) {
      throw new Error('Provider is not Phantom wallet');
    }

    if (!provider.publicKey) {
      throw new Error('Provider is not connected');
    }

    console.log('✅ initFogoSession: Provider validated:', provider.publicKey.toString());
    console.log('🌐 initFogoSession: Domain:', FOGO_CONFIG.APP_DOMAIN);
    console.log('🔗 initFogoSession: RPC URL:', FOGO_CONFIG.RPC_URL);

    // TODO: Integrate with actual Fogo SDK here
    // For now, we'll simulate a successful session creation
    
    // Generate a mock session ID
    const sessionId = `fogo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🎉 initFogoSession: Fogo session initialized successfully');
    console.log('📋 initFogoSession: Session ID:', sessionId);
    console.log('👤 initFogoSession: User public key:', provider.publicKey.toString());
    console.log('🌐 initFogoSession: Domain:', FOGO_CONFIG.APP_DOMAIN);
    console.log('🔗 initFogoSession: RPC endpoint:', FOGO_CONFIG.RPC_URL);

    // TODO: Replace with actual Fogo SDK initialization
    // const fogoSession = await FogoSDK.init({
    //   provider,
    //   rpcUrl: FOGO_CONFIG.RPC_URL,
    //   domain: FOGO_CONFIG.APP_DOMAIN,
    //   chainId: FOGO_CONFIG.CHAIN_ID
    // });

    return {
      success: true,
      sessionId
    };

  } catch (error: any) {
    console.error('❌ initFogoSession: Failed to initialize Fogo Session:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sign message for Fogo Session creation
 * This is a placeholder for future Fogo SDK integration
 */
export async function signFogoMessage(
  provider: PhantomProvider, 
  message: string
): Promise<{
  success: boolean;
  signature?: Uint8Array;
  error?: string;
}> {
  console.log('✍️ signFogoMessage: Signing message for Fogo Session...');
  
  try {
    if (!provider || !provider.publicKey) {
      throw new Error('Provider not connected');
    }

    if (!provider.signMessage) {
      throw new Error('Provider does not support message signing');
    }

    // Encode message
    const msg = new TextEncoder().encode(message);
    
    // Sign message
    const { signature } = await provider.signMessage(msg, 'utf8');
    
    console.log('✅ signFogoMessage: Message signed successfully');
    console.log('📊 signFogoMessage: Signature length:', signature.length);
    
    return {
      success: true,
      signature
    };

  } catch (error: any) {
    console.error('❌ signFogoMessage: Failed to sign message:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export configuration
export { FOGO_CONFIG };
