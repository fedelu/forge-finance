import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';

// Phantom wallet provider interface
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

// Hook state interface
interface PhantomWalletState {
  provider: PhantomProvider | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  isInstalled: boolean;
  isUnlocked: boolean;
}

// Custom hook for Phantom wallet management
export const usePhantomWallet = () => {
  const [state, setState] = useState<PhantomWalletState>({
    provider: null,
    publicKey: null,
    connected: false,
    connecting: false,
    error: null,
    isInstalled: false,
    isUnlocked: false,
  });

  // Ref to track if we're in the middle of connecting to prevent multiple attempts
  const connectingRef = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Detect Phantom provider on mount and when window changes
  useEffect(() => {
    const detectProvider = () => {
      // Only run in browser
      if (typeof window === 'undefined') {
        console.log('🔍 usePhantomWallet: Server-side rendering detected, skipping provider detection');
        return;
      }

      console.log('🔍 usePhantomWallet: Detecting Phantom provider...');

      try {
        // Check if window.solana exists
        if (!window.solana) {
          console.warn('⚠️ usePhantomWallet: window.solana not found');
          setState(prev => ({
            ...prev,
            provider: null,
            isInstalled: false,
            error: 'Phantom is not installed or not available on this page.'
          }));
          return;
        }

        // Check if it's actually Phantom
        if (!window.solana.isPhantom) {
          console.warn('⚠️ usePhantomWallet: Detected wallet is not Phantom');
          setState(prev => ({
            ...prev,
            provider: null,
            isInstalled: false,
            error: 'Detected wallet is not Phantom. Please use Phantom wallet.'
          }));
          return;
        }

        console.log('✅ usePhantomWallet: Phantom provider detected');
        
        const provider = window.solana as PhantomProvider;
        
        // Check if already connected
        const isConnected = provider.isConnected && !!provider.publicKey;
        const publicKey = provider.publicKey || null;
        
        setState(prev => ({
          ...prev,
          provider,
          isInstalled: true,
          isUnlocked: true, // If we can access the provider, it's unlocked
          connected: isConnected,
          publicKey,
          error: null
        }));

        if (isConnected && publicKey) {
          console.log('✅ usePhantomWallet: Already connected to:', publicKey.toString());
        }

      } catch (error: any) {
        console.error('❌ usePhantomWallet: Error detecting provider:', error);
        setState(prev => ({
          ...prev,
          provider: null,
          isInstalled: false,
          error: `Provider detection failed: ${error.message}`
        }));
      }
    };

    // Initial detection
    detectProvider();

    // Listen for provider injection (in case it loads after our component)
    const handleProviderChange = () => {
      if (mountedRef.current) {
        detectProvider();
      }
    };

    // Listen for provider changes
    window.addEventListener('load', handleProviderChange);
    
    // Check periodically for provider injection (with timeout)
    const checkInterval = setInterval(() => {
      if (mountedRef.current && !state.isInstalled && typeof window !== 'undefined' && window.solana?.isPhantom) {
        console.log('🔄 usePhantomWallet: Provider detected after initial check');
        detectProvider();
        clearInterval(checkInterval);
      }
    }, 100);

    // Clear interval after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      window.removeEventListener('load', handleProviderChange);
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [state.isInstalled]);

  // Connect to Phantom wallet
  const connect = useCallback(async (): Promise<void> => {
    if (connectingRef.current) {
      console.log('⚠️ usePhantomWallet: Connection already in progress, ignoring duplicate request');
      return;
    }

    if (!state.provider) {
      const error = 'Phantom wallet not available. Please install Phantom wallet.';
      console.error('❌ usePhantomWallet:', error);
      setState(prev => ({ ...prev, error }));
      return;
    }

    if (state.connected) {
      console.log('✅ usePhantomWallet: Already connected');
      return;
    }

    connectingRef.current = true;
    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      console.log('🔌 usePhantomWallet: Attempting to connect to Phantom...');
      
      // Attempt connection
      const response = await state.provider.connect();
      
      if (!response?.publicKey) {
        throw new Error('Failed to get public key from wallet connection');
      }

      console.log('✅ usePhantomWallet: Successfully connected to:', response.publicKey.toString());

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          publicKey: response.publicKey,
          connected: true,
          connecting: false,
          error: null
        }));
      }

    } catch (error: any) {
      console.error('❌ usePhantomWallet: Connection failed:', error);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          connecting: false,
          error: `Connection failed: ${error.message}`
        }));
      }
    } finally {
      connectingRef.current = false;
    }
  }, [state.provider, state.connected]);

  // Disconnect from Phantom wallet
  const disconnect = useCallback(async (): Promise<void> => {
    if (!state.provider || !state.connected) {
      console.log('⚠️ usePhantomWallet: Not connected, nothing to disconnect');
      return;
    }

    try {
      console.log('🔌 usePhantomWallet: Disconnecting from Phantom...');
      await state.provider.disconnect();
      
      console.log('✅ usePhantomWallet: Successfully disconnected');
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          publicKey: null,
          connected: false,
          error: null
        }));
      }

    } catch (error: any) {
      console.error('❌ usePhantomWallet: Disconnect failed:', error);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: `Disconnect failed: ${error.message}`
        }));
      }
    }
  }, [state.provider, state.connected]);

  // Sign message
  const signMessage = useCallback(async (message: string): Promise<Uint8Array | null> => {
    if (!state.provider || !state.connected || !state.publicKey) {
      console.error('❌ usePhantomWallet: Cannot sign message - not connected');
      return null;
    }

    try {
      console.log('✍️ usePhantomWallet: Signing message...');
      
      const msg = new TextEncoder().encode(message);
      const { signature } = await state.provider.signMessage(msg, 'utf8');
      
      console.log('✅ usePhantomWallet: Message signed successfully');
      return signature;

    } catch (error: any) {
      console.error('❌ usePhantomWallet: Sign message failed:', error);
      setState(prev => ({
        ...prev,
        error: `Sign message failed: ${error.message}`
      }));
      return null;
    }
  }, [state.provider, state.connected, state.publicKey]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    provider: state.provider,
    publicKey: state.publicKey,
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    isInstalled: state.isInstalled,
    isUnlocked: state.isUnlocked,
    connect,
    disconnect,
    signMessage,
    clearError,
  };
};

export default usePhantomWallet;
