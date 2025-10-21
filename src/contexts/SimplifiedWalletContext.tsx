import React, { createContext, useContext, ReactNode } from 'react';
import { usePhantomWallet } from '../hooks/usePhantomWallet';
import { initFogoSession } from '../lib/fogoSessionInit';

// Simplified wallet context interface
interface SimplifiedWalletContextType {
  // Phantom wallet state
  provider: any;
  publicKey: any;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  isInstalled: boolean;
  isUnlocked: boolean;
  
  // Phantom wallet actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<Uint8Array | null>;
  clearError: () => void;
  
  // Fogo Session state
  fogoSessionActive: boolean;
  fogoSessionId: string | null;
  fogoError: string | null;
}

const SimplifiedWalletContext = createContext<SimplifiedWalletContextType | undefined>(undefined);

export const useSimplifiedWallet = () => {
  const context = useContext(SimplifiedWalletContext);
  if (!context) {
    throw new Error('useSimplifiedWallet must be used within a SimplifiedWalletProvider');
  }
  return context;
};

interface SimplifiedWalletProviderProps {
  children: ReactNode;
}

export const SimplifiedWalletProvider: React.FC<SimplifiedWalletProviderProps> = ({ children }) => {
  const phantomWallet = usePhantomWallet();
  const [fogoSessionActive, setFogoSessionActive] = React.useState(false);
  const [fogoSessionId, setFogoSessionId] = React.useState<string | null>(null);
  const [fogoError, setFogoError] = React.useState<string | null>(null);

  // Initialize Fogo Session when Phantom connects
  React.useEffect(() => {
    const initializeFogoSession = async () => {
      if (phantomWallet.connected && phantomWallet.provider && !fogoSessionActive) {
        try {
          console.log('🔥 SimplifiedWalletProvider: Initializing Fogo Session...');
          const result = await initFogoSession(phantomWallet.provider);
          
          if (result.success) {
            setFogoSessionActive(true);
            setFogoSessionId(result.sessionId || null);
            setFogoError(null);
            console.log('✅ SimplifiedWalletProvider: Fogo Session initialized:', result.sessionId);
          } else {
            setFogoError(result.error || 'Failed to initialize Fogo Session');
            console.error('❌ SimplifiedWalletProvider: Fogo Session failed:', result.error);
          }
        } catch (error: any) {
          setFogoError(error.message);
          console.error('❌ SimplifiedWalletProvider: Fogo Session error:', error);
        }
      } else if (!phantomWallet.connected && fogoSessionActive) {
        // Reset Fogo Session when Phantom disconnects
        setFogoSessionActive(false);
        setFogoSessionId(null);
        setFogoError(null);
        console.log('🔌 SimplifiedWalletProvider: Fogo Session reset due to disconnect');
      }
    };

    initializeFogoSession();
  }, [phantomWallet.connected, phantomWallet.provider, fogoSessionActive]);

  const value: SimplifiedWalletContextType = {
    // Phantom wallet state
    provider: phantomWallet.provider,
    publicKey: phantomWallet.publicKey,
    connected: phantomWallet.connected,
    connecting: phantomWallet.connecting,
    error: phantomWallet.error,
    isInstalled: phantomWallet.isInstalled,
    isUnlocked: phantomWallet.isUnlocked,
    
    // Phantom wallet actions
    connect: phantomWallet.connect,
    disconnect: phantomWallet.disconnect,
    signMessage: phantomWallet.signMessage,
    clearError: phantomWallet.clearError,
    
    // Fogo Session state
    fogoSessionActive,
    fogoSessionId,
    fogoError,
  };

  return (
    <SimplifiedWalletContext.Provider value={value}>
      {children}
    </SimplifiedWalletContext.Provider>
  );
};
