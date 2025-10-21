// Demo-ready Fogo Sessions component for investor presentation
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { 
  createDemoSessionWithWallet,
  getCurrentDemoSession,
  sendDemoTransaction,
  fetchDemoBalances,
  clearDemoSession
} from '../lib/fogoSessionDemo';
import { useFogoWallet } from '../hooks/useFogoWallet';
import { DEMO_CONFIG } from '../config/demo-config';

// Demo Session Context
interface DemoSessionContextType {
  isEstablished: boolean;
  walletPublicKey: PublicKey | null;
  sessionData: any | null;
  sessionWalletAddress: string | null;
  balances: { fogo: number; usdc: number; sol: number };
  connect: () => Promise<void>;
  endSession: () => Promise<void>;
  sendTransaction: (instructions: any[]) => Promise<string>;
  depositToCrucible: (amount: number) => Promise<{ success: boolean; transactionId: string }>;
  withdrawFromCrucible: (amount: number) => Promise<{ success: boolean; transactionId: string }>;
  refreshBalances: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
  isDemo: boolean;
}

const DemoSessionContext = createContext<DemoSessionContextType | null>(null);

export const useDemoSession = () => {
  const context = useContext(DemoSessionContext);
  if (!context) {
    throw new Error('useDemoSession must be used within DemoSessionProvider');
  }
  return context;
};

// Demo Session Provider
export function DemoSessionProvider({ 
  children, 
  fogoClient 
}: { 
  children: React.ReactNode;
  fogoClient?: { context: any; connection: any };
}) {
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [sessionWalletAddress, setSessionWalletAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState({ fogo: 0, usdc: 0, sol: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isEstablished, setIsEstablished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fogoWallet = useFogoWallet();
  const connection = fogoClient?.connection || new Connection(DEMO_CONFIG.RPC_URL, 'confirmed');

  // Connect to Fogo Sessions (Demo Mode)
  const connect = async () => {
    try {
      console.log('🔥 Connecting to FOGO Sessions (Demo Mode)...');
      setError(null);
      setIsLoading(true);
      
      if (!fogoWallet.connected) {
        await fogoWallet.connect();
      }
      
      if (!fogoWallet.publicKey) {
        throw new Error('Failed to get public key from wallet');
      }
      
      const walletPublicKey = new PublicKey(fogoWallet.publicKey);
      console.log('✅ Connected to wallet:', walletPublicKey.toString());
      
      // Create demo session
      const sessionResponse = await createDemoSessionWithWallet(
        fogoClient?.context,
        walletPublicKey,
        fogoWallet.signMessage
      );
      
      if (sessionResponse.type === 0) {
        setWalletPublicKey(walletPublicKey);
        setSessionData(sessionResponse.session);
        setSessionWalletAddress(sessionResponse.session.sessionPublicKey.toString());
        setIsEstablished(true);
        
        // Fetch demo balances
        const demoBalances = await fetchDemoBalances(connection, walletPublicKey);
        setBalances(demoBalances);
        
        console.log('✅ Demo FOGO Session established successfully');
        console.log('🎮 Session Wallet:', sessionResponse.session.sessionPublicKey.toString());
        console.log('💰 Demo Balances:', demoBalances);
      } else {
        throw new Error('Failed to create demo session');
      }
      
    } catch (error: any) {
      console.error('❌ Demo session connection failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // End session
  const endSession = async () => {
    try {
      console.log('🔚 Ending demo FOGO session...');
      
      if (walletPublicKey) {
        await clearDemoSession(walletPublicKey);
      }
      
      setWalletPublicKey(null);
      setSessionData(null);
      setSessionWalletAddress(null);
      setBalances({ fogo: 0, usdc: 0, sol: 0 });
      setIsEstablished(false);
      setError(null);
      
      // Disconnect wallet
      if (fogoWallet.connected) {
        await fogoWallet.disconnect();
      }
      
      console.log('✅ Demo session ended successfully');
    } catch (error: any) {
      console.error('❌ Error ending demo session:', error);
      setError(error.message);
    }
  };

  // Send transaction (demo)
  const sendTransaction = async (instructions: any[]): Promise<string> => {
    if (!sessionData) {
      throw new Error('No active session');
    }
    
    try {
      console.log('🚀 Sending demo transaction...');
      const result = await sendDemoTransaction(sessionData, instructions);
      console.log('✅ Demo transaction successful:', result.signature);
      return result.signature || 'demo_signature';
    } catch (error: any) {
      console.error('❌ Demo transaction failed:', error);
      throw error;
    }
  };

  // Deposit to crucible (demo)
  const depositToCrucible = async (amount: number): Promise<{ success: boolean; transactionId: string }> => {
    try {
      console.log(`💰 Demo deposit to crucible: ${amount} FOGO`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update balances
      setBalances(prev => ({
        ...prev,
        fogo: Math.max(0, prev.fogo - amount)
      }));
      
      const transactionId = `demo_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Demo deposit successful:', transactionId);
      return { success: true, transactionId };
    } catch (error: any) {
      console.error('❌ Demo deposit failed:', error);
      return { success: false, transactionId: '' };
    }
  };

  // Withdraw from crucible (demo)
  const withdrawFromCrucible = async (amount: number): Promise<{ success: boolean; transactionId: string }> => {
    try {
      console.log(`💸 Demo withdraw from crucible: ${amount} FOGO`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update balances
      setBalances(prev => ({
        ...prev,
        fogo: prev.fogo + amount
      }));
      
      const transactionId = `demo_withdraw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ Demo withdraw successful:', transactionId);
      return { success: true, transactionId };
    } catch (error: any) {
      console.error('❌ Demo withdraw failed:', error);
      return { success: false, transactionId: '' };
    }
  };

  // Refresh balances
  const refreshBalances = async () => {
    if (!walletPublicKey) return;
    
    try {
      console.log('🔄 Refreshing demo balances...');
      const newBalances = await fetchDemoBalances(connection, walletPublicKey);
      setBalances(newBalances);
      console.log('✅ Demo balances refreshed:', newBalances);
    } catch (error: any) {
      console.error('❌ Failed to refresh demo balances:', error);
    }
  };

  // Auto-connect on wallet connection
  useEffect(() => {
    if (fogoWallet.connected && fogoWallet.publicKey && !isEstablished) {
      connect();
    }
  }, [fogoWallet.connected, fogoWallet.publicKey]);

  const value = {
    isEstablished,
    walletPublicKey,
    sessionData,
    sessionWalletAddress,
    balances,
    connect,
    endSession,
    sendTransaction,
    depositToCrucible,
    withdrawFromCrucible,
    refreshBalances,
    error,
    isLoading,
    isDemo: true,
  };

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  );
}

// Demo Session Button Component
export function DemoSessionButton() {
  const { 
    isEstablished, 
    sessionWalletAddress,
    balances,
    connect, 
    endSession, 
    error, 
    isLoading 
  } = useDemoSession();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await endSession();
    } catch (error) {
      console.error('Disconnect failed:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  if (isEstablished) {
  return (
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="font-semibold">FOGO Session Active</span>
            <span className="text-xs bg-yellow-500 px-2 py-1 rounded">DEMO</span>
      </div>
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors disabled:opacity-50"
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-orange-200">Session Wallet:</span>
            <div className="font-mono text-xs bg-black/20 p-2 rounded mt-1 break-all">
              {sessionWalletAddress}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-black/20 p-2 rounded">
              <div className="text-orange-200">FOGO</div>
              <div className="font-bold">{balances.fogo.toFixed(2)}</div>
          </div>
            <div className="bg-black/20 p-2 rounded">
              <div className="text-orange-200">USDC</div>
              <div className="font-bold">{balances.usdc.toFixed(2)}</div>
      </div>
            <div className="bg-black/20 p-2 rounded">
              <div className="text-orange-200">SOL</div>
              <div className="font-bold">{balances.sol.toFixed(4)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
          <div className="space-y-3">
            <button
        onClick={handleConnect}
        disabled={isConnecting || isLoading}
        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting || isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span>Connect FOGO Session</span>
            <span className="text-xs bg-yellow-500 px-2 py-1 rounded">DEMO</span>
          </>
        )}
            </button>
            
      {error && (
        <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-400 text-center">
        Demo Mode - No paymaster validation required
        </div>
    </div>
  );
}