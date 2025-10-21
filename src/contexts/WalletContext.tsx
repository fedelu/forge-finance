import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_TESTNET_CONFIG } from '../config/solana-testnet';
import { FOGO_TESTNET_CONFIG } from '../config/fogo-testnet';
import { 
  initializeFogoSession, 
  createFogoSession, 
  sendFogoTransaction, 
  getCurrentSession, 
  onSessionChange,
  detectWalletStatus,
  connectWallet,
  FOGO_CONFIG 
} from '../lib/fogoSession';

// Phantom wallet types
interface PhantomWallet {
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  publicKey?: PublicKey;
  isConnected?: boolean;
  request(params: { method: string; params?: any }): Promise<any>;
}

interface WalletContextType {
  connection: Connection;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  network: 'solana-testnet' | 'fogo-testnet';
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (network: 'solana-testnet' | 'fogo-testnet') => void;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  getBalance: () => Promise<number | null>;
  getTokenBalance: (tokenMint: string) => Promise<number | null>;
  getFogoBalance: () => Promise<number | null>;
  wallet: PhantomWallet | null;
  // Wallet status and error handling
  walletStatus: {
    isInstalled: boolean;
    isUnlocked: boolean;
    isAvailable: boolean;
    error?: string;
  };
  // Fogo Sessions integration
  fogoSession: {
    isActive: boolean;
    sessionId: string | null;
    createSession: () => Promise<void>;
    endSession: () => void;
    sendFogoTransaction: (transaction: Transaction) => Promise<string>;
  };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [network, setNetwork] = useState<'solana-testnet' | 'fogo-testnet'>('fogo-testnet'); // Default to FOGO testnet
  const [connection, setConnection] = useState(() => new Connection(FOGO_CONFIG.RPC_URL, FOGO_CONFIG.COMMITMENT as any)); // Use Fogo RPC
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wallet, setWallet] = useState<PhantomWallet | null>(null);
  const [fogoSessionState, setFogoSessionState] = useState({
    isActive: false,
    sessionId: null as string | null
  });
  const [walletStatus, setWalletStatus] = useState({
    isInstalled: false,
    isUnlocked: false,
    isAvailable: false,
    error: undefined as string | undefined
  });

  // Initialize Fogo Sessions and check for Phantom wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      // Guard against server-side rendering
      if (typeof window === 'undefined') {
        console.log('⚠️ Server-side rendering detected, skipping wallet initialization');
        return;
      }

      // Detect wallet status with comprehensive checks
      console.log('🔍 Detecting wallet status...');
      try {
        const status = await detectWalletStatus();
        setWalletStatus({
          isInstalled: status.isInstalled,
          isUnlocked: status.isUnlocked,
          isAvailable: status.isAvailable,
          error: status.error
        });

        if (status.isInstalled && status.isUnlocked) {
          setWallet((window as any).solana as PhantomWallet);
          
          if (status.isConnected && status.publicKey) {
            setPublicKey(status.publicKey);
            setConnected(true);
            console.log('✅ Wallet already connected:', status.publicKey.toString());
          }
        } else {
          console.warn('⚠️ Wallet not available:', status.error);
        }
      } catch (error) {
        console.error('❌ Failed to detect wallet status:', error);
        setWalletStatus({
          isInstalled: false,
          isUnlocked: false,
          isAvailable: false,
          error: 'Failed to detect wallet status'
        });
      }

      // Initialize Fogo Sessions
      console.log('🔥 Initializing Fogo Sessions...');
      try {
        const sessionInitialized = await initializeFogoSession();
        if (sessionInitialized) {
          const session = getCurrentSession();
          setFogoSessionState({
            isActive: session.isActive,
            sessionId: session.sessionId
          });
          if (session.userPublicKey) {
            setPublicKey(session.userPublicKey);
            setConnected(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize Fogo Sessions:', error);
      }
    };

    initializeWallet();

    // Listen for Fogo Session changes
    const unsubscribe = onSessionChange((session) => {
      console.log('Fogo Session state changed:', session);
      setFogoSessionState({
        isActive: session.isActive,
        sessionId: session.sessionId
      });
      
      if (session.userPublicKey) {
        setPublicKey(session.userPublicKey);
        setConnected(true);
      } else if (!session.isActive) {
        setPublicKey(null);
        setConnected(false);
      }
    });

    // Listen for wallet connection events from FOGO Sessions
    const handleWalletConnected = (event: CustomEvent) => {
      console.log('Wallet connected event received:', event.detail);
      if (event.detail?.publicKey) {
        const publicKey = new PublicKey(event.detail.publicKey);
        setPublicKey(publicKey);
        setConnected(true);
        console.log('Wallet context synced with FOGO Sessions');
      }
    };

    const handleWalletDisconnected = () => {
      console.log('Wallet disconnected event received');
      setPublicKey(null);
      setConnected(false);
      console.log('Wallet context synced with FOGO Sessions disconnection');
    };

    window.addEventListener('walletConnected', handleWalletConnected as EventListener);
    window.addEventListener('walletDisconnected', handleWalletDisconnected);
    
    return () => {
      unsubscribe();
      window.removeEventListener('walletConnected', handleWalletConnected as EventListener);
      window.removeEventListener('walletDisconnected', handleWalletDisconnected);
    };
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      // Guard against server-side rendering
      if (typeof window === 'undefined') {
        throw new Error('Window object not available (server-side rendering)');
      }

      // Check wallet status first
      const status = await detectWalletStatus();
      
      if (!status.isInstalled) {
        throw new Error(status.error || 'Phantom wallet not installed. Please install Phantom wallet to continue.');
      }

      if (!status.isUnlocked) {
        throw new Error('Phantom wallet is locked. Please unlock your wallet and try again.');
      }

      // Use robust wallet connection
      const connectionResult = await connectWallet();
      
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Failed to connect to wallet');
      }

      setPublicKey(connectionResult.publicKey);
      setConnected(true);
      console.log('✅ Connected to Phantom wallet:', connectionResult.publicKey.toString());
      
      // Update wallet status
      setWalletStatus({
        isInstalled: true,
        isUnlocked: true,
        isAvailable: true,
        error: undefined
      });
      
      // Create Fogo Session
      console.log('🔥 Creating Fogo Session...');
      try {
        const sessionResponse = await createFogoSession({
          domain: FOGO_CONFIG.APP_DOMAIN
        });
        
        setFogoSessionState({
          isActive: true,
          sessionId: sessionResponse.sessionId
        });
        
        console.log('✅ Fogo Session created successfully:', sessionResponse.sessionId);
      } catch (sessionError) {
        console.error('Failed to create Fogo Session:', sessionError);
        // Continue with regular connection even if Fogo Session fails
      }
      
      // Force switch to FOGO testnet after connection
      console.log('Forcing switch to FOGO testnet...');
      await switchNetwork('fogo-testnet');
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      
      // Update wallet status with error
      setWalletStatus(prev => ({
        ...prev,
        error: error.message
      }));
      
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      // End Fogo Session first
      if (fogoSessionState.isActive) {
        console.log('🔚 Ending Fogo Session...');
        // Note: We'll implement endFogoSession in the lib
        setFogoSessionState({
          isActive: false,
          sessionId: null
        });
      }
      
      if (wallet) {
        await wallet.disconnect();
      }
      setPublicKey(null);
      setConnected(false);
      console.log('Disconnected from wallet');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const signTransaction = async (transaction: Transaction): Promise<Transaction> => {
    if (!publicKey || !wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signedTransaction = await wallet.signTransaction(transaction);
      return signedTransaction;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  };

  const signAllTransactions = async (transactions: Transaction[]): Promise<Transaction[]> => {
    if (!publicKey || !wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signedTransactions = await wallet.signAllTransactions(transactions);
      return signedTransactions;
    } catch (error) {
      console.error('Failed to sign transactions:', error);
      throw error;
    }
  };

  const sendTransaction = useCallback(async (transaction: Transaction): Promise<string> => {
    if (!publicKey || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // Use Fogo Sessions if available for gasless transactions
      if (fogoSessionState.isActive) {
        console.log('🚀 Sending transaction through Fogo Sessions (gasless)...');
        try {
          const signature = await sendFogoTransaction(transaction);
          console.log('✅ Fogo transaction sent successfully:', signature);
          return signature;
        } catch (fogoError) {
          console.warn('Fogo transaction failed, falling back to regular transaction:', fogoError);
          // Fall through to regular transaction
        }
      }

      // Regular transaction (fallback or when Fogo Session not available)
      console.log('📡 Sending regular transaction to Fogo testnet...');
      
      // Get recent blockhash from FOGO testnet
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send the signed transaction to FOGO testnet
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Transaction sent to FOGO testnet:', signature);
      console.log('View on FOGO Explorer:', `https://fogoscan.com/tx/${signature}?cluster=testnet`);
      return signature;
    } catch (error) {
      console.error('Failed to send transaction to FOGO testnet:', error);
      throw error;
    }
  }, [publicKey, wallet, connection, fogoSessionState.isActive]);

  const switchNetwork = useCallback((newNetwork: 'solana-testnet' | 'fogo-testnet') => {
    setNetwork(newNetwork);
    const config = newNetwork === 'fogo-testnet' ? FOGO_CONFIG : SOLANA_TESTNET_CONFIG;
    setConnection(new Connection(config.RPC_URL, FOGO_CONFIG.COMMITMENT as any));
  }, []);

  const getBalance = useCallback(async (): Promise<number | null> => {
    if (!publicKey) {
      return null;
    }
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }, [publicKey, connection]);

  const getTokenBalance = useCallback(async (tokenMint: string): Promise<number | null> => {
    if (!publicKey) return null;
    try {
      // For now, return mock balance - in production, this would fetch actual token balance
      return Math.random() * 100; // Mock token balance
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  }, [publicKey]);

  const getFogoBalance = useCallback(async (): Promise<number | null> => {
    if (!publicKey || !wallet) return null;
    try {
      console.log('=== FOGO BALANCE CHECK (Pyron-style) ===');
      console.log('Your wallet address:', publicKey.toString());
      console.log('Current network:', network);
      console.log('Connection URL:', connection.rpcEndpoint);

      // Get all token accounts for the user (like Pyron does)
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });

      console.log('Found token accounts:', tokenAccounts.value.length);

      // Log all token accounts for debugging
        tokenAccounts.value.forEach((accountInfo, index) => {
          const accountData = accountInfo.account.data;
          if (accountData && typeof accountData === 'object' && 'parsed' in accountData) {
            const parsedData = accountData as any;
            if (parsedData.parsed) {
              const mint = parsedData.parsed.info.mint;
              const amount = parsedData.parsed.info.tokenAmount.uiAmount;
              const decimals = parsedData.parsed.info.tokenAmount.decimals;
              
              console.log(`Token Account ${index + 1}:`, {
                mint,
                amount,
                decimals,
                rawAmount: parsedData.parsed.info.tokenAmount.amount
              });
            }
          }
        });

      // Look for any token with balance (like Pyron does)
      for (const accountInfo of tokenAccounts.value) {
        const accountData = accountInfo.account.data;
        if (accountData && typeof accountData === 'object' && 'parsed' in accountData) {
          const parsedData = accountData as any;
          if (parsedData.parsed) {
            const mint = parsedData.parsed.info.mint;
            const amount = parsedData.parsed.info.tokenAmount.uiAmount;
          
            // Check if this token has a balance
            if (amount && amount > 0) {
              console.log('Found token with balance:', { mint, amount });
              
              // For now, return the first token with balance (like Pyron does)
              // In production, you'd identify FOGO by mint address
              console.log('🎯 TOKEN FOUND (Pyron-style):', { mint, amount });
              console.log('This is how Pyron detects your tokens!');
              return amount;
            }
          }
        }
      }

      console.log('No token accounts found with balance');
      console.log('This is normal if you have no tokens in this wallet');
      return 0;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  }, [publicKey, wallet, connection, network]);

  // Fogo Session management functions
  const createFogoSessionHandler = async () => {
    try {
      const sessionResponse = await createFogoSession({
        domain: FOGO_CONFIG.APP_DOMAIN
      });
      
      setFogoSessionState({
        isActive: true,
        sessionId: sessionResponse.sessionId
      });
      
      console.log('✅ Fogo Session created:', sessionResponse.sessionId);
    } catch (error) {
      console.error('Failed to create Fogo Session:', error);
      throw error;
    }
  };

  const endFogoSessionHandler = () => {
    setFogoSessionState({
      isActive: false,
      sessionId: null
    });
    console.log('🔚 Fogo Session ended');
  };

  const sendFogoTransactionHandler = async (transaction: Transaction): Promise<string> => {
    return await sendFogoTransaction(transaction);
  };

  const value = useMemo(() => ({
    connection,
    publicKey,
    connected,
    connecting,
    network,
    connect,
    disconnect,
    switchNetwork,
    signTransaction,
    signAllTransactions,
    sendTransaction,
    getBalance,
    getTokenBalance,
    getFogoBalance,
    wallet,
    walletStatus,
    fogoSession: {
      isActive: fogoSessionState.isActive,
      sessionId: fogoSessionState.sessionId,
      createSession: createFogoSessionHandler,
      endSession: endFogoSessionHandler,
      sendFogoTransaction: sendFogoTransactionHandler,
    },
  }), [connection, publicKey, connected, connecting, network, connect, disconnect, switchNetwork, signTransaction, signAllTransactions, sendTransaction, getBalance, getTokenBalance, getFogoBalance, wallet, walletStatus, fogoSessionState.isActive, fogoSessionState.sessionId]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};