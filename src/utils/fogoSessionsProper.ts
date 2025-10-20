/**
 * Proper FOGO Sessions Implementation for Phantom Wallet
 * 
 * This implementation correctly handles the FOGO Sessions protocol
 * using Phantom wallet's signMessage functionality instead of private keys.
 */

import { PublicKey } from '@solana/web3.js';

// FOGO Sessions Configuration
const FOGO_SESSIONS_CONFIG = {
  API_BASE_URL: 'https://testnet.fogo.io/api',
  SESSION_VERSION: '0.1',
  CHAIN_ID: 'fogo-testnet',
  DEFAULT_EXPIRY_DAYS: 7
};

// Types
export interface FogoSessionRequest {
  version: string;
  chain_id: string;
  domain: string;
  expires: string;
  session_key: string;
  public_key: string;
  signature: string;
  intent_message: string;
}

export interface FogoSessionResponse {
  success: boolean;
  session_id: string;
  session_key: string;
  expires_at: string;
  user_public_key: string;
  message?: string;
}

/**
 * Create a FOGO Session using Phantom wallet's signMessage
 * This is the correct approach for Phantom wallet integration
 */
export async function createFogoSessionWithPhantom(): Promise<FogoSessionResponse> {
  console.log('🔥 Creating FOGO Session with Phantom wallet...');
  
  try {
    // Step 1: Validate Phantom wallet
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }
    
    if (typeof window.solana.signMessage !== 'function') {
      throw new Error('Phantom wallet does not support signMessage. Please update Phantom wallet.');
    }
    
    console.log('✅ Phantom wallet validated');
    
    // Step 2: Connect to Phantom wallet
    let publicKey: PublicKey;
    if (window.solana.isConnected && window.solana.publicKey) {
      publicKey = window.solana.publicKey;
      console.log('✅ Already connected to Phantom:', publicKey.toString());
    } else {
      console.log('🔌 Connecting to Phantom...');
      const response = await window.solana.connect();
      publicKey = response.publicKey;
      console.log('✅ Connected to Phantom:', publicKey.toString());
    }
    
    // Step 3: Generate session parameters
    const sessionKey = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + FOGO_SESSIONS_CONFIG.DEFAULT_EXPIRY_DAYS);
    const expiresISO = expires.toISOString();
    
    console.log('📝 Session parameters:', {
      sessionKey,
      expires: expiresISO,
      publicKey: publicKey.toString()
    });
    
    // Step 4: Create the intent message for signing
    const intentMessage = `Fogo Sessions:
Signing this intent will allow this app to interact with your on-chain balances.
Please make sure you trust this app and the domain in the message matches the domain of the current web application.

version: ${FOGO_SESSIONS_CONFIG.SESSION_VERSION}
chain_id: ${FOGO_SESSIONS_CONFIG.CHAIN_ID}
domain: ${window.location.origin}
expires: ${expiresISO}
session_key: ${sessionKey}
tokens: this app may spend any amount of any token`;
    
    console.log('📄 Intent message:', intentMessage);
    
    // Step 5: Encode the message for signing
    const encodedMessage = new TextEncoder().encode(intentMessage);
    console.log('📄 Encoded message:', {
      type: typeof encodedMessage,
      isUint8Array: encodedMessage instanceof Uint8Array,
      length: encodedMessage.length
    });
    
    // Step 6: Sign the message with Phantom
    console.log('✍️ Requesting signature from Phantom...');
    const signatureBytes = await window.solana.signMessage(encodedMessage);
    console.log('✅ Message signed successfully');
    console.log('📄 Signature:', {
      type: typeof signatureBytes,
      isUint8Array: signatureBytes instanceof Uint8Array,
      length: signatureBytes.length
    });
    
    // Step 7: Convert signature to base64
    const signatureBase64 = Buffer.from(signatureBytes).toString("base64");
    console.log('📄 Signature (base64):', signatureBase64);
    
    // Step 8: Prepare the FOGO Sessions request
    const sessionRequest: FogoSessionRequest = {
      version: FOGO_SESSIONS_CONFIG.SESSION_VERSION,
      chain_id: FOGO_SESSIONS_CONFIG.CHAIN_ID,
      domain: window.location.origin,
      expires: expiresISO,
      session_key: sessionKey,
      public_key: publicKey.toString(),
      signature: signatureBase64,
      intent_message: intentMessage.trim()
    };
    
    console.log('📦 FOGO Sessions request:', sessionRequest);
    
    // Step 9: Send to FOGO Sessions API
    console.log('🚀 Sending to FOGO Sessions API...');
    const response = await fetch(`${FOGO_SESSIONS_CONFIG.API_BASE_URL}/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(sessionRequest)
    });
    
    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FOGO API Error:', errorText);
      throw new Error(`FOGO Sessions API error (${response.status}): ${errorText}`);
    }
    
    const apiResult: FogoSessionResponse = await response.json();
    console.log('✅ FOGO Session created successfully:', apiResult);
    
    // Validate the response
    if (!apiResult.success || !apiResult.session_id) {
      throw new Error('Invalid response from FOGO Sessions API');
    }
    
    return apiResult;
    
  } catch (error: any) {
    console.error('❌ Failed to create FOGO Session:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`FOGO Session creation failed: ${error.message}`);
  }
}

/**
 * Alternative implementation for local testing
 * This simulates the FOGO Sessions API response for development
 */
export async function createFogoSessionLocal(): Promise<FogoSessionResponse> {
  console.log('🔥 Creating FOGO Session (Local Simulation)...');
  
  try {
    // Use the same logic as the real implementation but simulate the API call
    const sessionKey = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + FOGO_SESSIONS_CONFIG.DEFAULT_EXPIRY_DAYS);
    const expiresISO = expires.toISOString();
    
    // Validate Phantom wallet
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }
    
    // Connect to Phantom
    let publicKey: PublicKey;
    if (window.solana.isConnected && window.solana.publicKey) {
      publicKey = window.solana.publicKey;
    } else {
      const response = await window.solana.connect();
      publicKey = response.publicKey;
    }
    
    // Create and sign message
    const intentMessage = `Fogo Sessions (Local Test):
This is a local test of FOGO Sessions functionality.

version: ${FOGO_SESSIONS_CONFIG.SESSION_VERSION}
chain_id: ${FOGO_SESSIONS_CONFIG.CHAIN_ID}
domain: ${window.location.origin}
expires: ${expiresISO}
session_key: ${sessionKey}
tokens: this app may spend any amount of any token`;
    
    const encodedMessage = new TextEncoder().encode(intentMessage);
    const signatureBytes = await window.solana.signMessage(encodedMessage);
    const signatureBase64 = Buffer.from(signatureBytes).toString("base64");
    
    // Simulate successful API response
    const simulatedResponse: FogoSessionResponse = {
      success: true,
      session_id: sessionKey,
      session_key: sessionKey,
      expires_at: expiresISO,
      user_public_key: publicKey.toString(),
      message: "FOGO Session created successfully (Local Simulation)"
    };
    
    console.log('✅ FOGO Session created successfully (Local):', simulatedResponse);
    return simulatedResponse;
    
  } catch (error: any) {
    console.error('❌ Failed to create FOGO Session (Local):', error);
    throw new Error(`FOGO Session creation failed: ${error.message}`);
  }
}

// Export configuration
export { FOGO_SESSIONS_CONFIG };
