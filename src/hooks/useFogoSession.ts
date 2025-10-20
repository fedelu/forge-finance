/**
 * React Hook for FOGO Sessions Management
 * 
 * This hook provides session state management, persistence, and easy integration
 * with React components for FOGO Sessions functionality.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import { 
  FogoSession, 
  FogoWallet, 
  createFogoSession, 
  revokeFogoSession, 
  isSessionValid,
  useFogoSession as useFogoSessionCore
} from '../utils/fogoSession';

// Session state interface
export interface FogoSessionState {
  session: FogoSession | null;
  isActive: boolean;
  isExpired: boolean;
  isLoading: boolean;
  error: string | null;
  expiryTime: number | null;
  remainingTime: number | null; // milliseconds until expiry
}

// Hook configuration
export interface UseFogoSessionConfig {
  domain: string;
  allowedTokens: string[];
  limits: Record<string, bigint>;
  expiryMs?: number;
  autoRenew?: boolean;
  storageKey?: string;
}

// Default configuration
const DEFAULT_CONFIG: Partial<UseFogoSessionConfig> = {
  expiryMs: 24 * 60 * 60 * 1000, // 24 hours
  autoRenew: false,
  storageKey: 'fogo-session'
};

/**
 * React hook for managing FOGO Sessions
 */
export function useFogoSession(config: UseFogoSessionConfig) {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const [state, setState] = useState<FogoSessionState>({
    session: null,
    isActive: false,
    isExpired: false,
    isLoading: false,
    error: null,
    expiryTime: null,
    remainingTime: null
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load session from localStorage on mount
  useEffect(() => {
    loadSessionFromStorage();
  }, []);
  
  // Update remaining time every second
  useEffect(() => {
    if (state.session && state.isActive) {
      intervalRef.current = setInterval(() => {
        updateRemainingTime();
      }, 1000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.session, state.isActive]);
  
  // Load session from localStorage
  const loadSessionFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(fullConfig.storageKey!);
      if (stored) {
        const sessionData = JSON.parse(stored);
        const session: FogoSession = {
          ...sessionData,
          sessionPublicKey: new PublicKey(sessionData.sessionPublicKey),
          config: {
            ...sessionData.config,
            userPublicKey: new PublicKey(sessionData.config.userPublicKey)
          }
        };
        
        const isValid = isSessionValid(session);
        setState(prev => ({
          ...prev,
          session,
          isActive: isValid,
          isExpired: !isValid,
          expiryTime: session.expiry,
          remainingTime: isValid ? session.expiry - Date.now() : 0
        }));
        
        console.log('📱 FOGO Session loaded from storage:', session.sessionKey);
      }
    } catch (error) {
      console.error('❌ Failed to load session from storage:', error);
      localStorage.removeItem(fullConfig.storageKey!);
    }
  }, [fullConfig.storageKey]);
  
  // Save session to localStorage
  const saveSessionToStorage = useCallback((session: FogoSession) => {
    try {
      localStorage.setItem(fullConfig.storageKey!, JSON.stringify(session));
      console.log('💾 FOGO Session saved to storage');
    } catch (error) {
      console.error('❌ Failed to save session to storage:', error);
    }
  }, [fullConfig.storageKey]);
  
  // Update remaining time
  const updateRemainingTime = useCallback(() => {
    if (state.session && state.isActive) {
      const remaining = state.session.expiry - Date.now();
      const isExpired = remaining <= 0;
      
      setState(prev => ({
        ...prev,
        remainingTime: Math.max(0, remaining),
        isExpired,
        isActive: !isExpired
      }));
      
      // Auto-renew if configured and session is about to expire
      if (fullConfig.autoRenew && remaining < 5 * 60 * 1000 && remaining > 0) {
        console.log('🔄 Auto-renewing FOGO Session...');
        // Note: Auto-renewal would require wallet re-signing
      }
    }
  }, [state.session, state.isActive, fullConfig.autoRenew]);
  
  // Create new FOGO Session
  const createSession = useCallback(async (wallet: FogoWallet) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔥 Creating new FOGO Session...');
      console.log('🔍 Hook config:', {
        domain: fullConfig.domain,
        allowedTokens: fullConfig.allowedTokens,
        limits: fullConfig.limits,
        expiryMs: fullConfig.expiryMs
      });
      
      const session = await createFogoSession(
        fullConfig.domain,
        fullConfig.allowedTokens,
        fullConfig.limits,
        fullConfig.expiryMs,
        wallet
      );
      
      saveSessionToStorage(session);
      
      setState(prev => ({
        ...prev,
        session,
        isActive: true,
        isExpired: false,
        isLoading: false,
        error: null,
        expiryTime: session.expiry,
        remainingTime: session.expiry - Date.now()
      }));
      
      console.log('✅ FOGO Session created and saved');
      return session;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [fullConfig, saveSessionToStorage]);
  
  // Revoke current FOGO Session
  const revokeSession = useCallback(async () => {
    if (!state.session) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔄 Revoking FOGO Session...');
      
      await revokeFogoSession(state.session);
      localStorage.removeItem(fullConfig.storageKey!);
      
      setState(prev => ({
        ...prev,
        session: null,
        isActive: false,
        isExpired: false,
        isLoading: false,
        error: null,
        expiryTime: null,
        remainingTime: null
      }));
      
      console.log('✅ FOGO Session revoked');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [state.session, fullConfig.storageKey]);
  
  // Use FOGO Session for transaction
  const sendTransaction = useCallback(async (
    wallet: FogoWallet,
    instructions: any[]
  ) => {
    if (!state.session) {
      throw new Error('No active FOGO Session');
    }
    
    if (!state.isActive) {
      throw new Error('FOGO Session is not active');
    }
    
    try {
      console.log('🔥 Sending transaction with FOGO Session...');
      
      const signature = await useFogoSessionCore(
        state.session,
        wallet,
        instructions
      );
      
      console.log('✅ Transaction sent successfully:', signature);
      return signature;
      
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }, [state.session, state.isActive]);
  
  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);
  
  // Format remaining time
  const formatRemainingTime = useCallback(() => {
    if (!state.remainingTime) return null;
    
    const hours = Math.floor(state.remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((state.remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((state.remainingTime % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, [state.remainingTime]);
  
  // Get session info
  const getSessionInfo = useCallback(() => {
    if (!state.session) return null;
    
    return {
      sessionKey: state.session.sessionKey,
      sessionPublicKey: state.session.sessionPublicKey.toString(),
      expiry: new Date(state.session.expiry).toISOString(),
      allowedTokens: state.session.config.allowedTokens,
      limits: state.session.config.limits,
      domain: state.session.config.domain,
      remainingTime: formatRemainingTime()
    };
  }, [state.session, formatRemainingTime]);
  
  return {
    // State
    ...state,
    
    // Actions
    createSession,
    revokeSession,
    sendTransaction,
    clearError,
    
    // Utilities
    formatRemainingTime,
    getSessionInfo,
    
    // Computed values
    hasSession: !!state.session,
    canTransact: state.isActive && !state.isExpired,
    isNearExpiry: state.remainingTime ? state.remainingTime < 5 * 60 * 1000 : false // 5 minutes
  };
}

/**
 * Hook for FOGO Session status display
 */
export function useFogoSessionStatus(sessionState: FogoSessionState) {
  const getStatusColor = useCallback(() => {
    if (sessionState.isLoading) return 'text-yellow-400';
    if (sessionState.error) return 'text-red-400';
    if (sessionState.isExpired) return 'text-gray-400';
    if (sessionState.isActive) return 'text-green-400';
    return 'text-gray-400';
  }, [sessionState]);
  
  const getStatusText = useCallback(() => {
    if (sessionState.isLoading) return 'Creating Session...';
    if (sessionState.error) return 'Error';
    if (sessionState.isExpired) return 'Expired';
    if (sessionState.isActive) return 'Active';
    return 'Not Connected';
  }, [sessionState]);
  
  const getStatusIcon = useCallback(() => {
    if (sessionState.isLoading) return '⏳';
    if (sessionState.error) return '❌';
    if (sessionState.isExpired) return '⏰';
    if (sessionState.isActive) return '🔥';
    return '⚪';
  }, [sessionState]);
  
  return {
    color: getStatusColor(),
    text: getStatusText(),
    icon: getStatusIcon()
  };
}
