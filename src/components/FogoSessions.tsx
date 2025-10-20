import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createFogoSessionSmart, OfficialFogoSessionResponse, OfficialFogoSessionConfig } from '../utils/officialFogoSessions';

// FOGO Sessions Context
interface FogoSessionContextType {
  isEstablished: boolean;
  walletPublicKey: PublicKey | null;
  sessionData: OfficialFogoSessionResponse | null;
  connect: () => Promise<void>;
  endSession: () => Promise<void>;
  sendTransaction: (instructions: any[]) => Promise<string>;
  error: string | null;
}

const FogoSessionContext = createContext<FogoSessionContextType | null>(null);

// FOGO Sessions Provider
export function FogoSessionsProvider({ children }: { children: React.ReactNode }) {
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey | null>(null);
  const [sessionData, setSessionData] = useState<OfficialFogoSessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      console.log('🔥 Starting FOGO Sessions connection with Official SDK...');
      setError(null);
      
      // Use the official FOGO Sessions implementation
      const config: OfficialFogoSessionConfig = {
        network: "fogo-testnet",
        domain: window.location.origin,
        allowedTokens: ['FOGO_TOKEN_MINT_ADDRESS'],
        limits: {
          'FOGO_TOKEN_MINT_ADDRESS': '1000000000000' // 1000 FOGO tokens
        }
      };
      
      const result = await createFogoSessionSmart(config);
      
      // Extract wallet public key from the result
      if (result.userPublicKey) {
        setWalletPublicKey(new PublicKey(result.userPublicKey));
      }
      
      setSessionData(result);
      
      // Trigger wallet connection event to sync with main wallet context
      window.dispatchEvent(new CustomEvent('walletConnected', { 
        detail: { publicKey: result.userPublicKey } 
      }));
      
      console.log('🔥 FOGO Session established successfully!');
      console.log('Session ID:', result.sessionId);
      console.log('Session Key:', result.sessionKey);
      console.log('Expires:', result.expiresAt);
      
      // Show success message
      alert(`🔥 FOGO Sessions Connected!\n\n✅ Phantom wallet connected\n✅ FOGO Session established\n✅ Session ID: ${result.sessionId}\n✅ Session Key: ${result.sessionKey.slice(0, 8)}...\n✅ Expires: ${new Date(result.expiresAt).toLocaleString()}\n\n🚀 Ready for gasless transactions!`);
      
    } catch (error: any) {
      console.error('❌ Failed to establish FOGO Sessions:', error);
      setError(error.message);
      alert(`❌ FOGO Sessions Connection Failed\n\nError: ${error.message}\n\nPlease make sure Phantom wallet is installed and try again.`);
      throw error;
    }
  };

  const endSession = async () => {
    try {
      console.log('🔄 Ending FOGO Session...');
      
      setSessionData(null);
      setWalletPublicKey(null);
      setError(null);
      
      // Trigger wallet disconnection event
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
      
      console.log('✅ FOGO Sessions ended');
    } catch (error: any) {
      console.error('❌ Error ending FOGO Session:', error);
      throw error;
    }
  };

  const sendTransaction = async (instructions: any[]): Promise<string> => {
    try {
      console.log('🔥 Sending transaction via FOGO Sessions...');
      
      if (!sessionData) {
        throw new Error('No active FOGO Session');
      }
      
      if (!walletPublicKey) {
        throw new Error('No wallet connected');
      }
      
      // For now, we'll simulate the transaction sending
      // In a real implementation, this would use the FOGO Sessions SDK
      console.log('📦 Instructions:', instructions);
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock signature
      const signature = 'fogo_' + Math.random().toString(36).substr(2, 9);
      
      console.log('✅ FOGO Sessions transaction sent:', signature);
      return signature;
      
    } catch (error: any) {
      console.error('❌ Failed to send transaction via FOGO Sessions:', error);
      throw error;
    }
  };

  const value: FogoSessionContextType = {
    isEstablished: !!sessionData,
    walletPublicKey,
    sessionData,
    connect,
    endSession,
    sendTransaction,
    error,
  };

  return (
    <FogoSessionContext.Provider value={value}>
      {children}
    </FogoSessionContext.Provider>
  );
}

// FOGO Sessions Hook
export function useSession() {
  const context = useContext(FogoSessionContext);
  if (!context) {
    throw new Error('useSession must be used within FogoSessionsProvider');
  }
  return context;
}

// FOGO Sessions Button
export function FogoSessionsButton() {
  const { isEstablished, connect, endSession, walletPublicKey, sessionData, error } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    console.log('🔥 FOGO Sessions button clicked!');
    setIsConnecting(true);
    try {
      console.log('Calling connect function...');
      await connect();
      console.log('✅ Connect function completed successfully');
    } catch (error) {
      console.error('❌ Connection failed:', error);
    } finally {
      setIsConnecting(false);
      console.log('Connection attempt finished');
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await endSession();
    } catch (error) {
      console.error('Disconnection failed:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isEstablished && sessionData) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1 bg-orange-900/30 border border-orange-500/50 rounded-lg">
          <span className="text-orange-400 text-sm">🔥</span>
          <span className="text-orange-300 text-sm font-medium">FOGO Sessions</span>
          <span className="text-orange-400 text-xs">Active</span>
        </div>
        <div className="text-xs text-gray-400">
          {walletPublicKey?.toString().slice(0, 8)}...{walletPublicKey?.toString().slice(-8)}
        </div>
        <div className="text-xs text-gray-400">
          Session: {sessionData.sessionId.slice(0, 8)}...
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDisconnecting ? 'Ending...' : 'End Session'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => {
          console.log('🔥 BUTTON CLICKED - Starting FOGO Sessions with Official SDK...');
          handleConnect();
        }}
        disabled={isConnecting}
        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-lg">🔥</span>
            <span>FOGO Sessions</span>
          </div>
        )}
      </button>
      
      {error && (
        <div className="text-red-400 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}