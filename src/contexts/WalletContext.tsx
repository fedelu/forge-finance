import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_TESTNET_CONFIG } from '../config/solana-testnet';
import { FOGO_TESTNET_CONFIG } from '../config/fogo-testnet';

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
  const [network, setNetwork] = useState<'solana-testnet' | 'fogo-testnet'>('solana-testnet');
  const [connection, setConnection] = useState(() => new Connection(SOLANA_TESTNET_CONFIG.RPC_URL, 'confirmed'));
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wallet, setWallet] = useState<PhantomWallet | null>(null);

  // Check for Phantom wallet on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).solana) {
      const phantom = (window as any).solana as PhantomWallet;
      if (phantom.isPhantom) {
        setWallet(phantom);
        
        // Check if already connected
        if (phantom.isConnected && phantom.publicKey) {
          setPublicKey(phantom.publicKey);
          setConnected(true);
        }
      }
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    try {
      if (!wallet) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet.');
      }

      const response = await wallet.connect();
      setPublicKey(response.publicKey);
      setConnected(true);
      console.log('Connected to Phantom wallet:', response.publicKey.toString());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
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
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Sign the transaction
      const signedTransaction = await wallet.signTransaction(transaction);
      
      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log('Transaction sent to Solana devnet:', signature);
      return signature;
    } catch (error) {
      console.error('Failed to send transaction to Solana:', error);
      throw error;
    }
  }, [publicKey, wallet, connection]);

  const switchNetwork = useCallback((newNetwork: 'solana-testnet' | 'fogo-testnet') => {
    setNetwork(newNetwork);
    const config = newNetwork === 'fogo-testnet' ? FOGO_TESTNET_CONFIG : SOLANA_TESTNET_CONFIG;
    setConnection(new Connection(config.RPC_URL, 'confirmed'));
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
      // Get all token accounts for the user
      const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });

      console.log('=== DEBUGGING TOKEN ACCOUNTS ===');
      console.log('Found token accounts:', tokenAccounts.value.length);
      console.log('Your wallet address:', publicKey.toString());

      // Log all token accounts for debugging
      tokenAccounts.value.forEach((accountInfo, index) => {
        const accountData = accountInfo.account.data;
        if (accountData.parsed) {
          const mint = accountData.parsed.info.mint;
          const amount = accountData.parsed.info.tokenAmount.uiAmount;
          const decimals = accountData.parsed.info.tokenAmount.decimals;
          
          console.log(`Token Account ${index + 1}:`, {
            mint,
            amount,
            decimals,
            rawAmount: accountData.parsed.info.tokenAmount.amount
          });
        }
      });

      // Look for FOGO token account using Pyron's approach
      // Pyron queries banks by token symbol "FOGO" - we need to find the actual FOGO mint
      for (const accountInfo of tokenAccounts.value) {
        const accountData = accountInfo.account.data;
        if (accountData.parsed) {
          const mint = accountData.parsed.info.mint;
          const amount = accountData.parsed.info.tokenAmount.uiAmount;
          
          // Check if this looks like a FOGO token account
          // We'll look for tokens with significant balance that might be FOGO
          if (amount && amount > 0) {
            console.log('Found token with balance:', { mint, amount });
            
            // If you have 1000 FOGO tokens, this should show the mint address
            // Please check the console logs and tell me the mint address for your FOGO tokens
            if (amount >= 1000) {
              console.log('🎯 POTENTIAL FOGO TOKEN FOUND:', { mint, amount });
              console.log('This might be your FOGO token! Please verify the mint address.');
            }
          }
        }
      }

      // For now, return 0 until we identify the correct FOGO mint address
      console.log('No FOGO token account identified yet');
      console.log('Please check the console logs above to find your FOGO token mint address');
      console.log('Once you find it, we can update the code to detect it properly');
      return 0;
    } catch (error) {
      console.error('Error getting FOGO balance:', error);
      return null;
    }
  }, [publicKey, wallet, connection]);

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
  }), [connection, publicKey, connected, connecting, network, connect, disconnect, switchNetwork, signTransaction, signAllTransactions, sendTransaction, getBalance, getTokenBalance, getFogoBalance, wallet]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};