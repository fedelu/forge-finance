/**
 * Simplified FOGO Sessions Implementation
 * This focuses only on the core issue without complex logic
 */

import { PublicKey, Keypair } from '@solana/web3.js';

export interface SimpleFogoSessionConfig {
  wallet?: string | Buffer | null;
  network: string;
}

export interface SimpleFogoSessionResponse {
  success: boolean;
  session_id: string;
  user_public_key: string;
  message: string;
  expires_at?: string; // Optional for compatibility
}

/**
 * Ultra-simple FOGO Session creator that handles the exact error
 */
export async function createSimpleFogoSession(config: SimpleFogoSessionConfig): Promise<SimpleFogoSessionResponse> {
  console.log('🔥 Creating Simple FOGO Session...');
  console.log('🔍 Config:', config);
  
  try {
    // Step 1: Check if we have a private key
    if (config.wallet && typeof config.wallet === 'string') {
      console.log('🔑 Using private key string');
      
      // Convert to Buffer (your exact pattern)
      const cleanPrivateKey = config.wallet.replace(/^0x/, '');
      const privateKeyBuffer = Buffer.from(cleanPrivateKey, 'hex');
      
      console.log('✅ Private key converted to Buffer:', {
        type: typeof privateKeyBuffer,
        isBuffer: Buffer.isBuffer(privateKeyBuffer),
        length: privateKeyBuffer.length
      });
      
      // Create Keypair from Buffer
      const keypair = Keypair.fromSecretKey(privateKeyBuffer);
      
      // Generate session
      const sessionId = crypto.randomUUID();
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        success: true,
        session_id: sessionId,
        user_public_key: keypair.toString(),
        message: "FOGO Session created with private key",
        expires_at: expires
      };
    }
    
    // Step 2: Fallback to Phantom wallet
    console.log('👻 Using Phantom wallet fallback');
    
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not found');
    }
    
    // Connect to Phantom
    let publicKey: PublicKey;
    if (window.solana.isConnected && window.solana.publicKey) {
      publicKey = window.solana.publicKey;
    } else {
      const response = await window.solana.connect();
      publicKey = response.publicKey;
    }
    
    console.log('✅ Connected to Phantom:', publicKey.toString());
    
    // Create simple message
    const message = "FOGO Sessions Test Message";
    const encodedMessage = new TextEncoder().encode(message);
    
    console.log('📄 About to call signMessage with:', {
      type: typeof encodedMessage,
      isUint8Array: encodedMessage instanceof Uint8Array,
      length: encodedMessage.length
    });
    
    // Sign with Phantom
    const signature = await window.solana.signMessage(encodedMessage);
    
    console.log('✅ Message signed successfully');
    console.log('📄 Signature received:', {
      type: typeof signature,
      constructor: signature.constructor.name,
      isUint8Array: signature instanceof Uint8Array,
      length: signature.length
    });
    
    // Convert Uint8Array to base64 correctly (handle non-iterable case)
    let signatureBase64: string;
    try {
      // Try the spread syntax first
      signatureBase64 = btoa(String.fromCharCode(...Array.from(signature)));
    } catch (error) {
      console.log('⚠️ Spread syntax failed, trying Array.from method');
      // Fallback: convert to array first, then to base64
      const signatureArray = Array.from(signature);
      signatureBase64 = btoa(String.fromCharCode(...signatureArray));
    }
    
    console.log('📄 Signature (base64):', signatureBase64);
    
    // Generate session
    const sessionId = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      success: true,
      session_id: sessionId,
      user_public_key: publicKey.toString(),
      message: "FOGO Session created with Phantom wallet",
      expires_at: expires
    };
    
  } catch (error: any) {
    console.error('❌ Simple FOGO Session failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Simple FOGO Session failed: ${error.message}`);
  }
}
