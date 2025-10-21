/**
 * Fogo Sessions Helper Library
 * 
 * This module provides a clean interface for working with Fogo Sessions,
 * including session creation, validation, and transaction signing.
 */

import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

// Environment configuration
const FOGO_CONFIG = {
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.fogo.io',
  API_BASE_URL: process.env.NEXT_PUBLIC_FOGO_API_BASE_URL || 'https://testnet.fogo.io/api',
  SESSION_VERSION: process.env.NEXT_PUBLIC_FOGO_SESSION_VERSION || '0.1',
  CHAIN_ID: process.env.NEXT_PUBLIC_FOGO_CHAIN_ID || 'fogo-testnet',
  APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
  DEFAULT_EXPIRY_DAYS: 7,
  COMMITMENT: process.env.NEXT_PUBLIC_COMMITMENT || 'confirmed'
} as const;

// Types
export interface FogoSessionConfig {
  wallet?: any;
  network?: string;
  domain?: string;
  expires?: number;
  allowedTokens?: string[];
  limits?: Record<string, string>;
}

export interface WalletStatus {
  isInstalled: boolean;
  isUnlocked: boolean;
  isAvailable: boolean;
  isConnected: boolean;
  publicKey: PublicKey | null;
  error?: string;
}

export interface FogoSessionResponse {
  success: boolean;
  sessionId: string;
  sessionKey: string;
  expiresAt: string;
  userPublicKey: string;
  message: string;
}

export interface FogoSessionState {
  isActive: boolean;
  sessionId: string | null;
  sessionKey: string | null;
  expiresAt: Date | null;
  userPublicKey: PublicKey | null;
  domain: string;
}

// Session state management
let currentSession: FogoSessionState = {
  isActive: false,
  sessionId: null,
  sessionKey: null,
  expiresAt: null,
  userPublicKey: null,
  domain: FOGO_CONFIG.APP_DOMAIN
};

// Event listeners for session state changes
const sessionListeners = new Set<(session: FogoSessionState) => void>();

/**
 * Initialize Fogo Sessions client
 * Validates domain and checks for existing sessions
 */
export async function initializeFogoSession(): Promise<boolean> {
  console.log('🔥 Initializing Fogo Sessions...');
  
  try {
    // Validate domain
    if (typeof window !== 'undefined') {
      const currentDomain = window.location.origin;
      if (currentDomain !== FOGO_CONFIG.APP_DOMAIN && !FOGO_CONFIG.APP_DOMAIN.includes('localhost')) {
        console.warn(`⚠️ Domain mismatch: expected ${FOGO_CONFIG.APP_DOMAIN}, got ${currentDomain}`);
      }
    }

    // Check for existing session in localStorage
    const storedSession = getStoredSession();
    if (storedSession && !isSessionExpired(storedSession)) {
      console.log('✅ Found valid stored session');
      currentSession = storedSession;
      notifySessionListeners();
      return true;
    }

    console.log('ℹ️ No valid session found');
    return false;
  } catch (error) {
    console.error('❌ Failed to initialize Fogo Sessions:', error);
    return false;
  }
}

/**
 * Create a new Fogo Session
 */
export async function createFogoSession(config: FogoSessionConfig = {}): Promise<FogoSessionResponse> {
  console.log('🔥 Creating new Fogo Session...');
  
  try {
    // Guard against server-side rendering
    if (typeof window === 'undefined') {
      throw new Error('Window object not available (server-side rendering)');
    }

    // Detect wallet status with comprehensive checks
    const walletStatus = await detectWalletStatus();
    
    if (!walletStatus.isInstalled) {
      throw new Error(walletStatus.error || 'Phantom wallet not installed');
    }

    if (!walletStatus.isUnlocked) {
      throw new Error('Phantom wallet is locked. Please unlock your wallet and try again.');
    }

    // Connect to wallet using robust connection logic
    const connectionResult = await connectWallet();
    
    if (!connectionResult.success) {
      throw new Error(connectionResult.error || 'Failed to connect to wallet');
    }

    const publicKey = connectionResult.publicKey;
    console.log('✅ Wallet connected successfully:', publicKey.toString());

    // Generate session parameters
    const sessionKey = crypto.randomUUID();
    const expires = Date.now() + FOGO_CONFIG.DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const domain = config.domain || FOGO_CONFIG.APP_DOMAIN;

    // Create intent message
    const intentMessage = `Fogo Sessions:
Signing this intent will allow this app to interact with your on-chain balances.
Please make sure you trust this app and the domain in the message matches the domain of the current web application.

version: ${FOGO_CONFIG.SESSION_VERSION}
chain_id: ${FOGO_CONFIG.CHAIN_ID}
domain: ${domain}
expires: ${new Date(expires).toISOString()}
session_key: ${sessionKey}
tokens: this app may spend any amount of any token`;

    console.log('📄 Intent message:', intentMessage);

    // Sign the message using robust signing function
    const encodedMessage = new TextEncoder().encode(intentMessage);
    const signResult = await signMessage(encodedMessage, publicKey);
    
    if (!signResult.success) {
      throw new Error(signResult.error || 'Failed to sign message');
    }

    console.log('✅ Message signed successfully');

    // Convert signature to base64
    const signatureBase64 = btoa(String.fromCharCode(...Array.from(signResult.signature)));

    // Send to Fogo API
    const requestBody = {
      version: FOGO_CONFIG.SESSION_VERSION,
      chain_id: FOGO_CONFIG.CHAIN_ID,
      domain: domain,
      expires: new Date(expires).toISOString(),
      session_key: sessionKey,
      public_key: publicKey.toString(),
      signature: signatureBase64,
      intent_message: intentMessage.trim()
    };

    console.log('📦 Sending session request to Fogo API...');
    const response = await fetch(`${FOGO_CONFIG.API_BASE_URL}/sessions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Fogo API error:', errorText);
      throw new Error(`Fogo API error (${response.status}): ${errorText}`);
    }

    const apiResult = await response.json();
    console.log('✅ Fogo API response:', apiResult);

    // Create session response
    const sessionResponse: FogoSessionResponse = {
      success: true,
      sessionId: apiResult.session_id || sessionKey,
      sessionKey: sessionKey,
      expiresAt: new Date(expires).toISOString(),
      userPublicKey: publicKey.toString(),
      message: 'Fogo Session created successfully'
    };

    // Update current session state
    currentSession = {
      isActive: true,
      sessionId: sessionResponse.sessionId,
      sessionKey: sessionResponse.sessionKey,
      expiresAt: new Date(sessionResponse.expiresAt),
      userPublicKey: publicKey,
      domain: domain
    };

    // Store session in localStorage
    storeSession(currentSession);

    // Notify listeners
    notifySessionListeners();

    console.log('🎉 Fogo Session created successfully:', sessionResponse.sessionId);
    return sessionResponse;

  } catch (error: any) {
    console.error('❌ Failed to create Fogo Session:', error);
    throw new Error(`Fogo Session creation failed: ${error.message}`);
  }
}

/**
 * Renew an existing Fogo Session
 */
export async function renewFogoSession(): Promise<FogoSessionResponse> {
  console.log('🔄 Renewing Fogo Session...');
  
  if (!currentSession.isActive || !currentSession.sessionId) {
    throw new Error('No active session to renew');
  }

  // Create new session with same configuration
  return await createFogoSession({
    domain: currentSession.domain
  });
}

/**
 * Validate current session
 */
export function validateFogoSession(): boolean {
  if (!currentSession.isActive || !currentSession.sessionId) {
    return false;
  }

  if (isSessionExpired(currentSession)) {
    console.log('⚠️ Session expired');
    endFogoSession();
    return false;
  }

  return true;
}

/**
 * End current Fogo Session
 */
export function endFogoSession(): void {
  console.log('🔚 Ending Fogo Session...');
  
  currentSession = {
    isActive: false,
    sessionId: null,
    sessionKey: null,
    expiresAt: null,
    userPublicKey: null,
    domain: FOGO_CONFIG.APP_DOMAIN
  };

  // Clear stored session
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fogo_session');
  }

  // Notify listeners
  notifySessionListeners();
}

/**
 * Send transaction through Fogo Sessions (gasless)
 */
export async function sendFogoTransaction(transaction: Transaction | VersionedTransaction): Promise<string> {
  console.log('🚀 Sending transaction through Fogo Sessions...');
  
  if (!validateFogoSession()) {
    throw new Error('No valid Fogo Session available');
  }

  try {
    // For now, we'll simulate the transaction since we need the actual Fogo RPC integration
    // In a real implementation, this would send the transaction to the Fogo RPC endpoint
    console.log('⚠️ SIMULATION MODE: Transaction not actually sent to Fogo RPC');
    
    const mockSignature = `fogo_${crypto.randomUUID().replace(/-/g, '')}`;
    console.log('✅ Transaction simulated successfully:', mockSignature);
    
    return mockSignature;
  } catch (error: any) {
    console.error('❌ Failed to send Fogo transaction:', error);
    throw new Error(`Fogo transaction failed: ${error.message}`);
  }
}

/**
 * Get current session state
 */
export function getCurrentSession(): FogoSessionState {
  return { ...currentSession };
}

/**
 * Subscribe to session state changes
 */
export function onSessionChange(callback: (session: FogoSessionState) => void): () => void {
  sessionListeners.add(callback);
  
  // Return unsubscribe function
  return () => {
    sessionListeners.delete(callback);
  };
}

// Wallet Detection and Validation Functions

/**
 * Detect Phantom wallet status with comprehensive checks
 */
export async function detectWalletStatus(): Promise<WalletStatus> {
  console.log('🔍 Detecting wallet status...');
  
  // Guard against server-side rendering
  if (typeof window === 'undefined') {
    return {
      isInstalled: false,
      isUnlocked: false,
      isAvailable: false,
      isConnected: false,
      publicKey: null,
      error: 'Window object not available (server-side rendering)'
    };
  }

  try {
    // Check if Phantom is installed
    if (!window.solana) {
      console.warn('⚠️ Phantom wallet not detected');
      return {
        isInstalled: false,
        isUnlocked: false,
        isAvailable: false,
        isConnected: false,
        publicKey: null,
        error: 'Phantom wallet not installed. Please install Phantom wallet to continue.'
      };
    }

    // Check if it's actually Phantom
    if (!window.solana.isPhantom) {
      console.warn('⚠️ Detected wallet is not Phantom');
      return {
        isInstalled: false,
        isUnlocked: false,
        isAvailable: false,
        isConnected: false,
        publicKey: null,
        error: 'Detected wallet is not Phantom. Please use Phantom wallet.'
      };
    }

    console.log('✅ Phantom wallet detected');

    // Check if wallet is unlocked and available
    let isUnlocked = false;
    let isConnected = false;
    let publicKey: PublicKey | null = null;

    try {
      // Try to get the public key to check if wallet is unlocked
      if (window.solana.publicKey) {
        publicKey = window.solana.publicKey;
        isUnlocked = true;
        isConnected = window.solana.isConnected || false;
        console.log('✅ Wallet is unlocked and connected:', publicKey.toString());
      } else {
        // Wallet might be locked
        console.log('🔒 Wallet appears to be locked');
        isUnlocked = false;
        isConnected = false;
      }
    } catch (error) {
      console.warn('⚠️ Error checking wallet status:', error);
      isUnlocked = false;
      isConnected = false;
    }

    const isAvailable = isUnlocked && isConnected;

    return {
      isInstalled: true,
      isUnlocked,
      isAvailable,
      isConnected,
      publicKey,
      error: isAvailable ? undefined : isUnlocked ? 'Wallet is not connected' : 'Wallet is locked'
    };

  } catch (error: any) {
    console.error('❌ Error detecting wallet status:', error);
    return {
      isInstalled: false,
      isUnlocked: false,
      isAvailable: false,
      isConnected: false,
      publicKey: null,
      error: `Wallet detection failed: ${error.message}`
    };
  }
}

/**
 * Connect to Phantom wallet with comprehensive error handling
 */
export async function connectWallet(): Promise<{ publicKey: PublicKey; success: boolean; error?: string }> {
  console.log('🔌 Connecting to Phantom wallet...');
  
  try {
    // Check wallet status first
    const walletStatus = await detectWalletStatus();
    
    if (!walletStatus.isInstalled) {
      throw new Error(walletStatus.error || 'Phantom wallet not installed');
    }

    if (!walletStatus.isUnlocked) {
      throw new Error('Phantom wallet is locked. Please unlock your wallet and try again.');
    }

    // If already connected, return existing public key
    if (walletStatus.isConnected && walletStatus.publicKey) {
      console.log('✅ Already connected to Phantom:', walletStatus.publicKey.toString());
      return {
        publicKey: walletStatus.publicKey,
        success: true
      };
    }

    // Attempt to connect
    if (!window.solana?.connect) {
      throw new Error('Phantom wallet connect method not available');
    }

    const response = await window.solana.connect();
    
    if (!response?.publicKey) {
      throw new Error('Failed to get public key from wallet connection');
    }

    console.log('✅ Successfully connected to Phantom:', response.publicKey.toString());
    
    return {
      publicKey: response.publicKey,
      success: true
    };

  } catch (error: any) {
    console.error('❌ Failed to connect to Phantom wallet:', error);
    return {
      publicKey: null as any,
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate signature before proceeding with Fogo Session creation
 */
export async function validateSignature(message: Uint8Array, signature: Uint8Array, publicKey: PublicKey): Promise<boolean> {
  console.log('🔐 Validating signature...');
  
  try {
    // Basic validation checks
    if (!signature || signature.length === 0) {
      console.error('❌ Signature is empty or invalid');
      return false;
    }

    if (!publicKey) {
      console.error('❌ Public key is required for signature validation');
      return false;
    }

    if (!message || message.length === 0) {
      console.error('❌ Message is empty or invalid');
      return false;
    }

    // Check signature length (Ed25519 signatures are 64 bytes)
    if (signature.length !== 64) {
      console.error(`❌ Invalid signature length: ${signature.length} bytes (expected 64)`);
      return false;
    }

    // For now, we'll do basic validation
    // In a production environment, you would verify the signature cryptographically
    console.log('✅ Signature validation passed (basic checks)');
    console.log('📊 Signature details:', {
      signatureLength: signature.length,
      messageLength: message.length,
      publicKey: publicKey.toString()
    });

    return true;

  } catch (error: any) {
    console.error('❌ Signature validation failed:', error);
    return false;
  }
}

/**
 * Sign message with comprehensive error handling
 */
export async function signMessage(message: Uint8Array, publicKey: PublicKey): Promise<{ signature: Uint8Array; success: boolean; error?: string }> {
  console.log('✍️ Signing message...');
  
  try {
    // Guard against server-side rendering
    if (typeof window === 'undefined') {
      throw new Error('Window object not available (server-side rendering)');
    }

    // Check if Phantom is available
    if (!window.solana?.signMessage) {
      throw new Error('Phantom wallet signMessage method not available');
    }

    // Validate inputs
    if (!message || message.length === 0) {
      throw new Error('Message is empty or invalid');
    }

    if (!publicKey) {
      throw new Error('Public key is required for signing');
    }

    console.log('📝 Signing message with Phantom wallet...');
    console.log('📊 Message details:', {
      messageLength: message.length,
      publicKey: publicKey.toString()
    });

    // Sign the message
    const signatureResponse = await window.solana.signMessage(message);
    
    if (!signatureResponse?.signature) {
      throw new Error('Failed to get signature from wallet');
    }

    const signature = signatureResponse.signature;
    
    // Validate the signature
    const isValid = await validateSignature(message, signature, publicKey);
    
    if (!isValid) {
      throw new Error('Signature validation failed');
    }

    console.log('✅ Message signed successfully');
    console.log('📊 Signature details:', {
      signatureLength: signature.length,
      signatureBase64: btoa(String.fromCharCode(...Array.from(signature)))
    });

    return {
      signature,
      success: true
    };

  } catch (error: any) {
    console.error('❌ Failed to sign message:', error);
    return {
      signature: new Uint8Array(0),
      success: false,
      error: error.message
    };
  }
}

// Helper functions

function isSessionExpired(session: FogoSessionState): boolean {
  if (!session.expiresAt) return true;
  return new Date() > session.expiresAt;
}

function getStoredSession(): FogoSessionState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('fogo_session');
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
      userPublicKey: parsed.userPublicKey ? new PublicKey(parsed.userPublicKey) : null
    };
  } catch (error) {
    console.error('Failed to parse stored session:', error);
    return null;
  }
}

function storeSession(session: FogoSessionState): void {
  if (typeof window === 'undefined') return;
  
  try {
    const toStore = {
      ...session,
      expiresAt: session.expiresAt?.toISOString(),
      userPublicKey: session.userPublicKey?.toString()
    };
    localStorage.setItem('fogo_session', JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to store session:', error);
  }
}

function notifySessionListeners(): void {
  sessionListeners.forEach(callback => {
    try {
      callback({ ...currentSession });
    } catch (error) {
      console.error('Session listener error:', error);
    }
  });
}

// Export configuration
export { FOGO_CONFIG };
