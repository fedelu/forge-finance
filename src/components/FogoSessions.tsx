import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import { 
  createSessionWithWallet,
  getCurrentSession,
  endFogoSession,
  sendFogoTransaction,
  clearStoredFogoSession
} from '../lib/fogoSession';
import { useFogoWallet } from '../hooks/useFogoWallet';
import { FOGO_TESTNET_CONFIG } from '../config/fogo-testnet';
import WalletFallback from './WalletFallback';

// Phantom wallet types
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  isConnected?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (args: any) => void) => void;
  removeListener: (event: string, callback: (args: any) => void) => void;
}

// FOGO Sessions Context
interface FogoSessionContextType {
  isEstablished: boolean;
  walletPublicKey: PublicKey | null;
  sessionData: any | null;
  fogoBalance: number;
  connect: () => Promise<void>;
  endSession: () => Promise<void>;
  sendTransaction: (instructions: any[]) => Promise<string>;
  depositToCrucible: (amount: number) => Promise<{ success: boolean; transactionId: string }>;
  withdrawFromCrucible: (amount: number) => Promise<{ success: boolean; transactionId: string }>;
  calculateAPY: (principal: number, timeInDays: number) => number;
  calculateCompoundInterest: (principal: number, apy: number, timeInDays: number) => number;
  refreshBalance: () => Promise<void>;
  testDeposit: (amount: number) => Promise<{ success: boolean; transactionId: string }>;
  error: string | null;
}

const FogoSessionContext = createContext<FogoSessionContextType | null>(null);

// FOGO Sessions Provider
export function FogoSessionsProvider({ 
  children, 
  fogoClient 
}: { 
  children: React.ReactNode;
  fogoClient?: { context: any; connection: any };
}) {
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [fogoBalance, setFogoBalance] = useState<number>(10000); // Fixed fake balance
  const [error, setError] = useState<string | null>(null);
  const [isEstablished, setIsEstablished] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Use the official Fogo wallet hook
  const fogoWallet = useFogoWallet();
  
  // Use connection from fogoClient or create fallback
  const connection = fogoClient?.connection || new Connection(process.env.NEXT_PUBLIC_RPC_URL || 'https://testnet.fogo.io', 'confirmed');

  // Function to get fake FOGO balance
  const fetchFogoBalance = async (publicKey: PublicKey): Promise<number> => {
    console.log('💰 Using fake FOGO balance: 10,000 FOGO for wallet:', publicKey.toString());
    return 10000; // Always return 10,000 FOGO
  };

  // Sync with Fogo wallet state
  useEffect(() => {
    const syncWithFogoWallet = async () => {
      if (fogoWallet.connected && fogoWallet.publicKey && fogoClient) {
        console.log('🔄 Syncing with Fogo wallet:', fogoWallet.publicKey.toString());
        
        setWalletPublicKey(fogoWallet.publicKey);
        
        // Set fake FOGO balance
        setFogoBalance(10000);
        
        // Create fake Fogo Session
        console.log('🔥 Creating fake Fogo Session...');
        setSessionData({
          sessionId: 'fogo_session_' + Date.now(),
          sessionKey: {},
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          walletPublicKey: fogoWallet.publicKey.toString(),
          success: true,
          message: 'Fogo Session established (Demo Mode)',
          sendTransaction: async (instructions: any[]) => {
            console.log('🔥 Simulating FOGO transaction with', instructions.length, 'instructions');
            return { type: 0, signature: 'fogo_tx_' + Date.now() };
          },
        });
        setIsEstablished(true);
        setError(null);
        console.log('✅ Fake Fogo Session established');
        
      } else {
        // Reset when wallet disconnects
        console.log('🔌 Wallet disconnected, resetting FOGO Session');
        setWalletPublicKey(null);
        setIsEstablished(false);
        setSessionData(null);
        setFogoBalance(10000); // Keep fake balance even when disconnected
        setError(null);
      }
    };

    syncWithFogoWallet();
  }, [fogoWallet.connected, fogoWallet.publicKey, fogoClient]);

  // Initialize Fogo Sessions on mount
  useEffect(() => {
    const initializeSessions = async () => {
      // Guard against server-side rendering
      if (typeof window === "undefined" || !fogoClient) {
        return;
      }

      // Check for existing session
      if (fogoWallet.publicKey) {
        const publicKey = new PublicKey(fogoWallet.publicKey);
        // Always set fake balance
        setFogoBalance(10000);
        
        // Create fake session
        setSessionData({
          sessionId: 'fogo_session_' + Date.now(),
          sessionKey: {},
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          walletPublicKey: publicKey.toString(),
          success: true,
          message: 'Fogo Session re-established (Demo Mode)',
          sendTransaction: async (instructions: any[]) => {
            console.log('🔥 Simulating FOGO transaction with', instructions.length, 'instructions');
            return { type: 0, signature: 'fogo_tx_' + Date.now() };
          },
        });
        setIsEstablished(true);
        setWalletPublicKey(publicKey);
        console.log('✅ Re-established fake Fogo session');
      } else {
        console.log('ℹ️ No existing Fogo session found');
      }
    };

    initializeSessions();
  }, [fogoClient]);

  const connect = async (publicKey?: PublicKey) => {
    try {
      console.log('🔥 Connecting to FOGO Sessions...');
      setError(null);
      
      // Use Fogo wallet connection
      if (!fogoWallet.connected) {
        await fogoWallet.connect();
      }
      
      if (!fogoWallet.publicKey) {
        throw new Error('Failed to get public key from wallet');
      }
      
      const connectedPublicKey = fogoWallet.publicKey;
      setWalletPublicKey(connectedPublicKey);
      console.log('✅ Connected to wallet:', connectedPublicKey.toString());
      
      // Set fake FOGO balance
      setFogoBalance(10000);
      
      // Create fake Fogo Session
      console.log('🔥 Creating fake Fogo Session...');
      setSessionData({
        sessionId: 'fogo_session_' + Date.now(),
        sessionKey: {},
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        walletPublicKey: connectedPublicKey.toString(),
        success: true,
        message: 'Fogo Session established (Demo Mode)',
        sendTransaction: async (instructions: any[]) => {
          console.log('🔥 Simulating FOGO transaction with', instructions.length, 'instructions');
          return { type: 0, signature: 'fogo_tx_' + Date.now() };
        },
      });
      setIsEstablished(true);
      setError(null);
      console.log('✅ Fake Fogo Session established');
      
    } catch (error: any) {
      console.error('❌ Failed to establish FOGO Sessions:', error);
      setError(error.message);
      setIsEstablished(false);
      setShowFallback(true);
    }
  };

  // End session function
  const endSession = async () => {
    try {
      console.log('🔥 Ending FOGO Sessions...');
      setError(null);
      setIsEstablished(false);
      setSessionData(null);
      setWalletPublicKey(null);
      setFogoBalance(10000); // Keep fake balance even after disconnect
      setShowFallback(false);

      if (fogoClient && sessionData) {
        // Reconstruct session object for endFogoSession
        const sessionToRevoke = {
          sessionPublicKey: new PublicKey(sessionData.sessionId),
          sessionKey: sessionData.sessionKey,
          walletPublicKey: new PublicKey(sessionData.walletPublicKey),
          payer: new PublicKey(sessionData.walletPublicKey),
          sendTransaction: sessionData.sendTransaction,
          sessionInfo: {
            expiresAt: sessionData.expiresAt,
            unlimited: true,
            isDemo: true,
          }
        };
        await endFogoSession(fogoClient.context, sessionToRevoke as any);
      }
      // Store public key before disconnecting
      const currentPublicKey = fogoWallet.publicKey;
      await fogoWallet.disconnect();
      // Only clear stored session if we had a valid public key
      if (currentPublicKey) {
        try {
          await clearStoredFogoSession(new PublicKey(currentPublicKey));
        } catch (e) {
          console.warn('Could not clear stored session:', e);
        }
      }
      console.log('✅ FOGO Sessions ended');
    } catch (error: any) {
      console.error('❌ Error ending FOGO Session:', error);
      setError(error.message);
    }
  };

  // Send transaction function
  const sendTransaction = async (instructions: any[]): Promise<string> => {
    if (!sessionData) {
      setError('Fogo Session not established for transaction.');
      throw new Error('Fogo Session not established for transaction.');
    }
    try {
      // In simulation mode, use the mock sendTransaction from sessionData
      if (sessionData.sendTransaction) {
        console.log('🔥 Using simulation mode for transaction');
        const result = await sessionData.sendTransaction(instructions);
        console.log('✅ Simulated transaction successful:', result.signature);
        return result.signature;
      } else if (fogoClient) {
        // Real Fogo transaction (if fogoClient is available)
        const sessionToSend = {
          sessionPublicKey: new PublicKey(sessionData.sessionId),
          sessionKey: sessionData.sessionKey,
          walletPublicKey: new PublicKey(sessionData.walletPublicKey),
          payer: new PublicKey(sessionData.walletPublicKey),
          sendTransaction: sessionData.sendTransaction,
          sessionInfo: {
            expiresAt: sessionData.expiresAt,
            unlimited: true,
            isDemo: true,
          }
        };
        const result = await sendFogoTransaction(sessionToSend as any, instructions);
        if (result.type === 0) { // Success
          console.log('✅ Transaction successful:', result.signature);
          // Refresh balances after a successful transaction
          if (walletPublicKey) {
            await refreshBalance();
          }
          return result.signature;
        } else {
          throw new Error(result.error?.message || 'Transaction failed');
        }
      } else {
        // Fallback simulation
        console.log('🔥 Using fallback simulation for transaction');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const mockSignature = 'fogo_sim_tx_' + Date.now();
        console.log('✅ Fallback simulated transaction successful:', mockSignature);
        return mockSignature;
      }
    } catch (error: any) {
      console.error('❌ Error sending transaction:', error);
      setError(error.message);
      throw error;
    }
  };

  // Mock deposit/withdraw functions for demo
  const depositToCrucible = async (amount: number) => {
    console.log(`🎮 Simulating deposit of ${amount} FOGO to crucible`);
    // Simulate a transaction
    const signature = await sendTransaction([]); // Send a mock transaction
    // Update simulated balance (deposit reduces wallet balance)
    setFogoBalance(prev => prev - amount);
    console.log(`💰 Updated FOGO balance after deposit: ${fogoBalance - amount}`);
    return { success: true, transactionId: signature };
  };

  const withdrawFromCrucible = async (amount: number) => {
    console.log(`🎮 Simulating withdrawal of ${amount} FOGO from crucible`);
    // Simulate a transaction
    const signature = await sendTransaction([]); // Send a mock transaction
    // Update simulated balance (withdrawal increases wallet balance)
    setFogoBalance(prev => prev + amount);
    console.log(`💰 Updated FOGO balance after withdrawal: ${fogoBalance + amount}`);
    return { success: true, transactionId: signature };
  };

  // APY and Compound Interest calculations (can be real or mocked)
  const calculateAPY = (principal: number, timeInDays: number): number => {
    // Mock APY for demo
    return 0.15; // 15% APY
  };

  const calculateCompoundInterest = (principal: number, apy: number, timeInDays: number): number => {
    const dailyRate = apy / 365;
    return principal * Math.pow(1 + dailyRate, timeInDays) - principal;
  };

  const refreshBalance = useCallback(async () => {
    if (walletPublicKey) {
      await fetchFogoBalance(walletPublicKey);
    }
  }, [walletPublicKey]);

  const testDeposit = async (amount: number) => {
    console.log(`🧪 Testing deposit of ${amount} FOGO`);
    // Simulate a transaction
    const signature = await sendTransaction([]); // Send a mock transaction
    // Update simulated balance
    setFogoBalance(prev => prev + amount);
    return { success: true, transactionId: signature };
  };

  const contextValue: FogoSessionContextType = {
    isEstablished,
    walletPublicKey,
    sessionData,
    fogoBalance,
    connect,
    endSession,
    sendTransaction,
    depositToCrucible,
    withdrawFromCrucible,
    calculateAPY,
    calculateCompoundInterest,
    refreshBalance,
    testDeposit,
    error,
  };

  return (
    <FogoSessionContext.Provider value={contextValue}>
      {children}
      {showFallback && (
        <WalletFallback
          walletStatus={{
            isInstalled: fogoWallet.isInstalled,
            isUnlocked: fogoWallet.isUnlocked,
            connected: fogoWallet.connected,
            error: fogoWallet.error,
          }}
          onRetry={() => connect()}
        />
      )}
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

// FOGO Sessions Button with Pyron/Brasa Finance style
export function FogoSessionsButton() {
  const { isEstablished, connect, endSession, walletPublicKey, sessionData, fogoBalance, refreshBalance, error } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');

  // Listen for balance updates from crucible operations
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      console.log('🔄 Balance update received:', event.detail);
      // Refresh the balance from context
      refreshBalance();
    };
    window.addEventListener('fogoBalanceUpdated', handleBalanceUpdate as EventListener);
    return () => {
      window.removeEventListener('fogoBalanceUpdated', handleBalanceUpdate as EventListener);
    };
  }, [refreshBalance]);

  const handleConnect = async () => {
    console.log('🔥 FOGO Sessions button clicked!');
    setIsConnecting(true);
    try {
      await connect();
    } catch (e) {
      console.error('Error connecting:', e);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await endSession();
      setIsOpen(false);
    } catch (e) {
      console.error('Error during disconnect:', e);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefreshBalance = async () => {
    setIsLoadingBalance(true);
    await refreshBalance();
    setIsLoadingBalance(false);
  };

  const copyToClipboard = () => {
    if (walletPublicKey) {
      navigator.clipboard.writeText(walletPublicKey.toString());
    }
  };

  const openFaucet = () => {
    if (walletPublicKey) {
      window.open(`https://www.gas.zip/faucet/fogo?address=${walletPublicKey.toString()}`, '_blank');
    }
  };

  // Show connected state with Pyron/Brasa Finance style wallet popup
  if (isEstablished && sessionData && walletPublicKey) {
    const shortAddress = `${walletPublicKey.toString().slice(0, 4)}...${walletPublicKey.toString().slice(-4)}`;
    
    return (
      <div className="relative">
        {/* FOGO style wallet button */}
            <button
              onClick={() => setIsOpen(true)}
              className="bg-fogo-gray-900 hover:bg-fogo-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 group shadow-fogo hover:shadow-flame border border-fogo-gray-700"
            >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
          </svg>
          <span className="text-sm font-medium">{shortAddress}</span>
          <svg className="w-3 h-3 text-white/80 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Pyron/Brasa Finance style wallet popup */}
        {isOpen && (
            <div className="absolute top-full right-0 mt-2 z-50 bg-fogo-gray-900 rounded-xl shadow-fogo-lg border border-fogo-gray-700 w-80 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-fogo-primary to-fogo-secondary p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">FOGO Wallet</div>
                    <div className="text-xs text-orange-100">{shortAddress}</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Balance */}
                    <div className="bg-fogo-gray-800 rounded-lg p-4 mb-4">
                      <div className="text-sm text-fogo-gray-400 mb-1">FOGO Balance</div>
                      <div className="text-2xl font-bold text-white">{fogoBalance.toFixed(2)} FOGO</div>
                    </div>


              {/* Get Tokens */}
              <button
                onClick={openFaucet}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors mb-4"
              >
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-purple-600">Get FOGO Tokens</span>
              </button>

              {/* Disconnect */}
              <button
                onClick={handleDisconnect}
                className="w-full p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Initial login button - FOGO style
  return (
        <div className="relative">
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-fogo-gray-900 hover:bg-fogo-gray-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 shadow-fogo hover:shadow-flame disabled:opacity-50 disabled:cursor-not-allowed border border-fogo-gray-700"
          >
        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
        </svg>
        <span className="font-medium">
          {isConnecting ? 'Connecting...' : 'Log in with FOGO'}
        </span>
      </button>
      
      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-900/90 text-red-200 text-xs rounded-md whitespace-nowrap z-50">
          {error}
        </div>
      )}
    </div>
  );
}