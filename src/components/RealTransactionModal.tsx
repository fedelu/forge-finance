import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

interface RealTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const RealTransactionModal: React.FC<RealTransactionModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, signTransaction } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating real transaction...');
      console.log('From:', publicKey.toString());
      console.log('Amount:', parseFloat(amount), 'SOL');

      // Create a real transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // System program (burn address)
          lamports: Math.floor(parseFloat(amount) * 1e9), // Convert SOL to lamports
        })
      );

      console.log('Getting recent blockhash...');
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log('Signing transaction...');
      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      console.log('Sending transaction...');
      // Send the signed transaction
      const signature = await connection.sendTransaction(signedTransaction, []);
      
      console.log('Waiting for confirmation...');
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Transaction successful:', signature);
      
      // Update balances
      const depositAmount = parseFloat(amount);
      subtractFromBalance('SOL', depositAmount);
      
      // Add to crucible balance (simulated)
      addToBalance('SPARK', depositAmount * 10); // 10 SPARK per SOL deposited
      addToBalance('HEAT', depositAmount * 5); // 5 HEAT per SOL deposited
      
      alert(`✅ Real Transaction Successful!\n\nTransaction: ${signature}\nSOL deposited: ${depositAmount}\nSPARK earned: ${depositAmount * 10}\nHEAT earned: ${depositAmount * 5}\n\nView on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      // Reset form
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
        <h2 className="text-xl font-bold text-white mb-4">🔥 Real Transaction - Crucible {crucibleId}</h2>
        
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

          <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg">
            <p className="text-red-300 text-sm">
              ⚠️ <strong>Real Transaction:</strong> This will use your actual SOL from devnet. The SOL will be burned (lost) as this is a demo.
            </p>
          </div>

          <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
            <p className="text-blue-300 text-sm">
              💡 <strong>Get SOL for testing:</strong> Visit <a href="https://faucet.solana.com" target="_blank" className="text-blue-400 underline">https://faucet.solana.com</a> and select "Devnet"
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
