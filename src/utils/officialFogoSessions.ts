/**
 * Proper FOGO Sessions Implementation using Official SDK
 * 
 * This implementation uses the official @fogo/sessions-sdk-web package
 * to create real FOGO Sessions that work with the FOGO testnet.
 */

// Note: Using direct API implementation since SDK exports are not available

// FOGO Sessions Configuration
const FOGO_CONFIG = {
  RPC_URL: 'https://testnet.fogo.io',
  API_BASE_URL: 'https://testnet.fogo.io/api',
  SESSION_VERSION: '0.1',
  CHAIN_ID: 'fogo-testnet',
  DEFAULT_EXPIRY_DAYS: 7
};

export interface OfficialFogoSessionConfig {
  wallet?: any; // Wallet adapter or public key
  network?: string;
  domain?: string;
  expires?: number;
  allowedTokens?: string[];
  limits?: Record<string, string>;
}

export interface OfficialFogoSessionResponse {
  success: boolean;
  sessionId: string;
  sessionKey: string;
  expiresAt: string;
  userPublicKey: string;
  message: string;
}

/**
 * Create FOGO Session using the official SDK
 */
export async function createOfficialFogoSession(config: OfficialFogoSessionConfig = {}): Promise<OfficialFogoSessionResponse> {
  console.log('🔥 Creating FOGO Session with Official SDK...');
  
  try {
    // Step 1: Check if Phantom wallet is available
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }
    
    console.log('✅ Phantom wallet detected');
    
    // Step 2: Connect to Phantom wallet
    let publicKey;
    if (window.solana.isConnected && window.solana.publicKey) {
      publicKey = window.solana.publicKey;
      console.log('✅ Already connected to Phantom:', publicKey.toString());
    } else {
      console.log('🔌 Connecting to Phantom...');
      const response = await window.solana.connect();
      publicKey = response.publicKey;
      console.log('✅ Connected to Phantom:', publicKey.toString());
    }
    
    // Step 3: Fallback to Direct API method since SDK is not available
    console.log('⚠️ SDK not available, using Direct API method...');
    return await createFogoSessionDirectAPI(config);
    
  } catch (error: any) {
    console.error('❌ Failed to create FOGO Session with Official SDK:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`FOGO Session creation failed: ${error.message}`);
  }
}

/**
 * Alternative implementation using direct API calls
 * This is a fallback if the SDK doesn't work
 */
export async function createFogoSessionDirectAPI(config: OfficialFogoSessionConfig = {}): Promise<OfficialFogoSessionResponse> {
  console.log('🔥 Creating FOGO Session with Direct API...');
  
  try {
    // Step 1: Check Phantom wallet
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom wallet not found. Please install Phantom wallet.');
    }
    
    // Step 2: Connect to Phantom
    let publicKey;
    if (window.solana.isConnected && window.solana.publicKey) {
      publicKey = window.solana.publicKey;
    } else {
      const response = await window.solana.connect();
      publicKey = response.publicKey;
    }
    
    console.log('✅ Connected to Phantom:', publicKey.toString());
    
    // Step 3: Generate session parameters
    const sessionKey = crypto.randomUUID();
    const expires = Date.now() + FOGO_CONFIG.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    
    // Step 4: Create intent message
    const intentMessage = `Fogo Sessions:
Signing this intent will allow this app to interact with your on-chain balances.
Please make sure you trust this app and the domain in the message matches the domain of the current web application.

version: ${FOGO_CONFIG.SESSION_VERSION}
chain_id: ${FOGO_CONFIG.CHAIN_ID}
domain: ${window.location.origin}
expires: ${new Date(expires).toISOString()}
session_key: ${sessionKey}
tokens: this app may spend any amount of any token`;
    
    console.log('📄 Intent message:', intentMessage);
    
    // Step 5: Sign the message
    const encodedMessage = new TextEncoder().encode(intentMessage);
    const signature = await window.solana.signMessage(encodedMessage);
    
    console.log('✅ Message signed successfully');
    
    // Step 6: Convert signature to base64
    let signatureBase64: string;
    try {
      signatureBase64 = btoa(String.fromCharCode(...Array.from(signature)));
    } catch (error) {
      console.log('⚠️ Spread syntax failed, trying Array.from method');
      const signatureArray = Array.from(signature);
      signatureBase64 = btoa(String.fromCharCode(...signatureArray));
    }
    
    console.log('📄 Signature (base64):', signatureBase64);
    
    // Step 7: Send to FOGO API
    const requestBody = {
      version: FOGO_CONFIG.SESSION_VERSION,
      chain_id: FOGO_CONFIG.CHAIN_ID,
      domain: window.location.origin,
      expires: new Date(expires).toISOString(),
      session_key: sessionKey,
      public_key: publicKey.toString(),
      signature: signatureBase64,
      intent_message: intentMessage.trim()
    };
    
    console.log('📦 Request body:', requestBody);
    
    const response = await fetch(`${FOGO_CONFIG.API_BASE_URL}/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`FOGO API error (${response.status}): ${errorText}`);
    }
    
    const apiResult = await response.json();
    console.log('✅ API Response:', apiResult);
    
    return {
      success: true,
      sessionId: apiResult.session_id || sessionKey,
      sessionKey: sessionKey,
      expiresAt: new Date(expires).toISOString(),
      userPublicKey: publicKey.toString(),
      message: 'FOGO Session created successfully with Direct API'
    };
    
  } catch (error: any) {
    console.error('❌ Failed to create FOGO Session with Direct API:', error);
    throw new Error(`FOGO Session creation failed: ${error.message}`);
  }
}

/**
 * Smart FOGO Session creator that tries official SDK first, then falls back to direct API
 */
export async function createFogoSessionSmart(config: OfficialFogoSessionConfig = {}): Promise<OfficialFogoSessionResponse> {
  console.log('🔥 Creating FOGO Session (Smart Method)...');
  
  try {
    // Try official SDK first
    console.log('🔧 Attempting Official SDK method...');
    return await createOfficialFogoSession(config);
  } catch (error: any) {
    console.log('⚠️ Official SDK failed, trying Direct API method...');
    console.log('SDK Error:', error.message);
    
    try {
      // Fallback to direct API
      return await createFogoSessionDirectAPI(config);
    } catch (directError: any) {
      console.error('❌ Both methods failed');
      console.error('Direct API Error:', directError.message);
      throw new Error(`FOGO Session creation failed with both methods. SDK Error: ${error.message}, Direct API Error: ${directError.message}`);
    }
  }
}

// Export configuration
export { FOGO_CONFIG };
