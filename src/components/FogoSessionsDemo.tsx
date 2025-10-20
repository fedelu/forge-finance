/**
 * FOGO Sessions React Component
 * 
 * This component demonstrates how to integrate FOGO Sessions into a React dApp
 * with session management, transaction handling, and status display.
 */

import React, { useState, useEffect } from 'react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useFogoSession, useFogoSessionStatus } from '../hooks/useFogoSession';

// Simple wallet interface for demonstration
interface MockWallet {
  publicKey: PublicKey | null;
  isConnected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
  signTransaction<T extends any>(tx: T): Promise<T>;
}

// Mock wallet for demonstration
const mockWallet: MockWallet = {
  publicKey: null,
  isConnected: false,
  
  async connect() {
    this.publicKey = new PublicKey('11111111111111111111111111111111');
    this.isConnected = true;
  },
  
  async disconnect() {
    this.publicKey = null;
    this.isConnected = false;
  },
  
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    console.log('Mock signing message:', Buffer.from(message).toString('hex'));
    return new Uint8Array(64).fill(1);
  },
  
  async signTransaction<T extends any>(tx: T): Promise<T> {
    console.log('Mock signing transaction');
    return tx;
  }
};

interface FogoSessionsDemoProps {
  className?: string;
}

export const FogoSessionsDemo: React.FC<FogoSessionsDemoProps> = ({ className = '' }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('1');
  const [lastTransactionSignature, setLastTransactionSignature] = useState<string | null>(null);
  
  // FOGO Sessions configuration
  const sessionConfig = {
    domain: 'https://forge-finance.vercel.app',
    allowedTokens: [
      'So11111111111111111111111111111111111111112', // Wrapped SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'  // USDC
    ],
    limits: {
      'So11111111111111111111111111111111111111112': '5000000000', // 5 SOL limit (in lamports as string)
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': '1000000000' // 1000 USDC limit (in micro-units as string)
    },
    expiryMs: 24 * 60 * 60 * 1000, // 24 hours
    autoRenew: true
  };
  
  // Use FOGO Sessions hook
  const fogoSession = useFogoSession(sessionConfig);
  const sessionStatus = useFogoSessionStatus();
  
  // Connect wallet
  const connectWallet = async () => {
    try {
      await mockWallet.connect();
      setIsWalletConnected(true);
      console.log('✅ Wallet connected:', mockWallet.publicKey?.toString());
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
    }
  };
  
  // Create FOGO Session
  const createSession = async () => {
    try {
      await fogoSession.createSession();
      console.log('✅ FOGO Session created');
    } catch (error) {
      console.error('❌ Session creation failed:', error);
    }
  };
  
  // Send test transaction
  const sendTestTransaction = async () => {
    try {
      const amount = parseFloat(transactionAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      const instruction = SystemProgram.transfer({
        fromPubkey: fogoSession.session!.sessionPublicKey,
        toPubkey: new PublicKey('11111111111111111111111111111111'),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL)
      });
      
      const signature = await fogoSession.sendTransaction([instruction]);
      setLastTransactionSignature(signature);
      
      console.log('✅ Transaction sent:', signature);
    } catch (error) {
      console.error('❌ Transaction failed:', error);
    }
  };
  
  // Revoke session
  const revokeSession = async () => {
    try {
      await fogoSession.revokeSession();
      console.log('✅ Session revoked');
    } catch (error) {
      console.error('❌ Session revocation failed:', error);
    }
  };
  
  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">🔥 FOGO Sessions Demo</h2>
        <p className="text-gray-400">
          Experience gasless transactions with FOGO Sessions on FOGO Testnet
        </p>
      </div>
      
      {/* Wallet Connection */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Wallet Connection</h3>
        {!isWalletConnected ? (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="text-green-400">
            ✅ Wallet Connected: {mockWallet.publicKey?.toString().slice(0, 8)}...
          </div>
        )}
      </div>
      
      {/* FOGO Session Status */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">FOGO Session Status</h3>
        
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-2xl">🔥</span>
          <span className="font-medium text-orange-400">
            {sessionStatus.isActive ? 'FOGO Session Active' : 'FOGO Session Inactive'}
          </span>
        </div>
        
        {fogoSession.isActive && (
          <div className="space-y-2 text-sm text-gray-300">
            <div>Session ID: {fogoSession.session?.sessionId?.slice(0, 16)}...</div>
            <div>Public Key: {fogoSession.walletPublicKey?.toString().slice(0, 16)}...</div>
            <div>Status: Active</div>
          </div>
        )}
        
        {fogoSession.error && (
          <div className="mt-3 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
            <div className="text-red-400 font-medium">Error:</div>
            <div className="text-red-300 text-sm">{fogoSession.error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
      
      {/* Session Actions */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Session Actions</h3>
        
        <div className="space-y-3">
          {!fogoSession.isActive ? (
            <button
              onClick={createSession}
              disabled={!isWalletConnected || fogoSession.isLoading}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {fogoSession.isLoading ? 'Creating Session...' : 'Create FOGO Session'}
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={revokeSession}
                disabled={fogoSession.isLoading}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {fogoSession.isLoading ? 'Revoking...' : 'Revoke Session'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Transaction Testing */}
      {fogoSession.isActive && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Test Transaction</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount (SOL)
              </label>
              <input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                placeholder="1.0"
                step="0.1"
                min="0.1"
              />
            </div>
            
            <button
              onClick={sendTestTransaction}
              disabled={fogoSession.isLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send Gasless Transaction
            </button>
            
            {lastTransactionSignature && (
              <div className="mt-3 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
                <div className="text-green-400 font-medium">Transaction Sent!</div>
                <div className="text-green-300 text-sm font-mono break-all">
                  {lastTransactionSignature}
                </div>
                <div className="text-green-400 text-xs mt-1">
                  ✅ Gasless via FOGO Sessions
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Session Info */}
      {fogoSession.isActive && (
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Session Details</h3>
          
          <div className="space-y-2 text-sm text-gray-300">
            <div>
              <span className="font-medium">Domain:</span> {sessionConfig.domain}
            </div>
            <div>
              <span className="font-medium">Allowed Tokens:</span>
              <ul className="ml-4 mt-1 space-y-1">
                {sessionConfig.allowedTokens.map((token, index) => (
                  <li key={index} className="font-mono text-xs">
                    {token.slice(0, 16)}...
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-medium">Limits:</span>
              <ul className="ml-4 mt-1 space-y-1">
                {Object.entries(sessionConfig.limits).map(([token, limit]) => (
                  <li key={token} className="text-xs">
                    {token.slice(0, 8)}...: {limit.toString()} lamports
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FogoSessionsDemo;
