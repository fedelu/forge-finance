import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_TESTNET_CONFIG } from '../config/solana-testnet';

// Phantom wallet types
interface PhantomWallet {
  isPhantom?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
  publicKey?: PublicKey;
  isConnected?: boolean;
}

interface WalletContextType {
  connection: Connection;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  getBalance: () => Promise<number | null>;
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
  const [connection] = useState(() => new Connection(SOLANA_TESTNET_CONFIG.RPC_URL, 'confirmed'));
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

  const value = useMemo(() => ({
    connection,
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    sendTransaction,
    getBalance,
    wallet,
  }), [connection, publicKey, connected, connecting, connect, disconnect, signTransaction, signAllTransactions, sendTransaction, getBalance, wallet]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};