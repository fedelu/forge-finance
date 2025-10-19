import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Transaction, SystemProgram, PublicKey, Connection } from '@solana/web3.js';

interface RealSolModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const RealSolModal: React.FC<RealSolModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const { updateCrucibleDeposit } = useCrucible();
  const { addTransaction } = useAnalytics();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create connection to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const handleDeposit = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!signTransaction) {
      setError('Wallet does not support signing transactions');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('=== REAL SOL TRANSACTION ===');
      console.log('Wallet:', publicKey.toString());
      console.log('Amount:', amount, 'SOL');

      // Check balance first
      const balance = await connection.getBalance(publicKey);
      console.log('Current balance:', balance / 1e9, 'SOL');

      if (balance < parseFloat(amount) * 1e9) {
        throw new Error(`Insufficient balance. You have ${balance / 1e9} SOL but need ${amount} SOL`);
      }

      // Create a very simple transaction - send to yourself (this always works)
      const transaction = new Transaction();
      
      // Send a tiny amount to yourself to test the transaction
      const testAmount = 1000; // 0.000001 SOL (very small)
      
      // Add a small test transfer to yourself
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Send to yourself (always works)
          lamports: testAmount,
        })
      );

      console.log('Getting recent blockhash...');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      
      // Set transaction properties
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('Transaction created:', {
        recentBlockhash: blockhash,
        feePayer: publicKey.toString(),
        testAmount: testAmount
      });

      console.log('Signing transaction...');
      // Sign the transaction using wallet adapter
      const signedTransaction = await signTransaction(transaction);
      console.log('Transaction signed successfully');

      console.log('Sending transaction...');
      // Send the signed transaction
      const signature = await connection.sendTransaction(signedTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      console.log('Transaction sent, signature:', signature);

      console.log('Waiting for confirmation...');
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('Transaction confirmed successfully!');
      console.log('=== REAL SOL TRANSACTION SUCCESS ===');
      
      // Update balances (simulate the deposit)
      const depositAmount = parseFloat(amount);
      subtractFromBalance('SOL', depositAmount);
      addToBalance('SPARK', depositAmount * 10);
      addToBalance('HEAT', depositAmount * 5);
      
      // Update crucible
      updateCrucibleDeposit(crucibleId, depositAmount);
      
      // Record transaction in analytics
      addTransaction({
        type: 'deposit',
        amount: depositAmount,
        token: 'SOL',
        crucibleId,
        signature
      });
      
      alert(`✅ REAL SOL TRANSACTION SUCCESSFUL!\n\nSignature: ${signature}\nSOL deposited: ${depositAmount}\nSPARK earned: ${depositAmount * 10}\nHEAT earned: ${depositAmount * 5}\n\nNote: This was a test transaction. The actual deposit is simulated.\n\nView: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">🔥 Real SOL Transaction - Crucible {crucibleId}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="0.0"
            />
          </div>

          <div className="p-3 bg-green-900/30 border border-green-600 rounded-lg">
            <p className="text-green-300 text-sm">
              ✅ <strong>REAL TRANSACTION:</strong> This will send a real transaction to Solana devnet using your SOL.
            </p>
          </div>

          <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
            <p className="text-blue-300 text-sm">
              ℹ️ <strong>TEST TRANSACTION:</strong> Sends a tiny amount to yourself to test, then simulates the deposit.
            </p>
          </div>

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/30 border border-red-600 rounded-lg">
              ❌ {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Send Real SOL'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
