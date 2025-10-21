/**
 * React Hook for FOGO Sessions Management
 * 
 * This hook provides session state management, persistence, and easy integration
 * with React components for FOGO Sessions functionality.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createFogoSession } from '../utils/fogoSession';

// Session state interface
export interface FogoSessionState {
  session: any | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  walletPublicKey: PublicKey | null;
}

// Hook configuration interface
export interface FogoSessionConfig {
  domain?: string;
  allowedTokens?: string[];
  limits?: Record<string, string>;
  expiryMs?: number;
  autoRenew?: boolean;
}

/**
 * React hook for managing FOGO Sessions
 */
export function useFogoSession(config: FogoSessionConfig = {}): FogoSessionState & {
  createSession: () => Promise<void>;
  revokeSession: () => Promise<void>;
  sendTransaction: (instructions: any[]) => Promise<string>;
} {
  const [session, setSession] = useState<any | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey | null>(null);
  
  const sessionRef = useRef<any | null>(null);
  const renewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default configuration
  const defaultConfig: FogoSessionConfig = {
    domain: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    allowedTokens: ['FOGO_TOKEN_MINT_ADDRESS'],
    limits: {
      'FOGO_TOKEN_MINT_ADDRESS': '1000000000000' // 1000 FOGO tokens
    },
    expiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    autoRenew: true
  };

  const fullConfig = { ...defaultConfig, ...config };

  // Create session
  const createSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔥 Creating FOGO Session via hook...');
      
      const newSession = await createFogoSession();
      
      setSession(newSession);
      setIsActive(true);
      sessionRef.current = newSession;
      
      // Extract wallet public key if available
      if (newSession.walletPublicKey) {
        setWalletPublicKey(new PublicKey(newSession.walletPublicKey));
      }
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('fogo-session', JSON.stringify(newSession));
      }
      
      console.log('✅ FOGO Session created successfully via hook');
      
    } catch (error: any) {
      console.error('❌ Failed to create FOGO Session via hook:', error);
      setError(error.message);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [fullConfig]);

  // Revoke session
  const revokeSession = useCallback(async () => {
    try {
      console.log('🔄 Revoking FOGO Session...');
      
      setSession(null);
      setIsActive(false);
      setWalletPublicKey(null);
      sessionRef.current = null;
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fogo-session');
      }
      
      // Clear renewal timeout
      if (renewTimeoutRef.current) {
        clearTimeout(renewTimeoutRef.current);
        renewTimeoutRef.current = null;
      }
      
      console.log('✅ FOGO Session revoked');
      
    } catch (error: any) {
      console.error('❌ Error revoking FOGO Session:', error);
      setError(error.message);
    }
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (instructions: any[]): Promise<string> => {
    try {
      console.log('🔥 Sending transaction via FOGO Session hook...');
      
      if (!session) {
        throw new Error('No active FOGO Session');
      }
      
      // For now, simulate transaction sending
      console.log('📦 Instructions:', instructions);
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock signature
      const signature = 'fogo_hook_' + Math.random().toString(36).substr(2, 9);
      
      console.log('✅ FOGO Session transaction sent via hook:', signature);
      return signature;
      
    } catch (error: any) {
      console.error('❌ Failed to send transaction via FOGO Session hook:', error);
      throw error;
    }
  }, [session]);

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSession = localStorage.getItem('fogo-session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSession(parsedSession);
          setIsActive(true);
          sessionRef.current = parsedSession;
          
          if (parsedSession.walletPublicKey) {
            setWalletPublicKey(new PublicKey(parsedSession.walletPublicKey));
          }
          
          console.log('✅ FOGO Session restored from localStorage');
        }
      } catch (error) {
        console.error('❌ Error loading FOGO Session from localStorage:', error);
        localStorage.removeItem('fogo-session');
      }
    }
  }, []);

  // Auto-renewal logic
  useEffect(() => {
    if (isActive && fullConfig.autoRenew && session?.expiresAt) {
      const expiryTime = new Date(session.expiresAt).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;
      
      if (timeUntilExpiry > 0) {
        // Set renewal timeout for 1 hour before expiry
        const renewalTime = Math.max(timeUntilExpiry - 60 * 60 * 1000, 0);
        
        renewTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Auto-renewing FOGO Session...');
          createSession();
        }, renewalTime);
        
        console.log(`⏰ FOGO Session auto-renewal scheduled in ${Math.round(renewalTime / 1000 / 60)} minutes`);
      }
    }
    
    return () => {
      if (renewTimeoutRef.current) {
        clearTimeout(renewTimeoutRef.current);
      }
    };
  }, [isActive, session, createSession, fullConfig.autoRenew]);

  return {
    session,
    isActive,
    isLoading,
    error,
    walletPublicKey,
    createSession,
    revokeSession,
    sendTransaction
  };
}

// Status hook for checking session state
export function useFogoSessionStatus() {
  const [isActive, setIsActive] = useState(false);
  const [sessionData, setSessionData] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedSession = localStorage.getItem('fogo-session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          setSessionData(parsedSession);
          setIsActive(true);
        }
      } catch (error) {
        console.error('Error loading session status:', error);
      }
    }
  }, []);

  return { isActive, sessionData };
}