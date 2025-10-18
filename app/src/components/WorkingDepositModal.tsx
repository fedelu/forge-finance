import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

interface WorkingDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const WorkingDepositModal: React.FC<WorkingDepositModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction } = useWallet();
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
      // Create a simple transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // System program (burn address)
          lamports: Math.floor(parseFloat(amount) * 1e9), // Convert SOL to lamports
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction (it will be signed automatically)
      const signature = await sendTransaction(transaction);

      console.log('Deposit successful:', signature);
      
      // Update balances
      const depositAmount = parseFloat(amount);
      subtractFromBalance('SOL', depositAmount);
      
      // Add to crucible balance (simulated)
      addToBalance('SPARK', depositAmount * 10); // 10 SPARK per SOL deposited
      addToBalance('HEAT', depositAmount * 5); // 5 HEAT per SOL deposited
      
      alert(`✅ Deposit successful!\n\nTransaction: ${signature}\nSOL deposited: ${depositAmount}\nSPARK earned: ${depositAmount * 10}\nHEAT earned: ${depositAmount * 5}\n\nView on Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=testnet`);
      
      // Reset form
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Deposit failed:', err);
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">🔥 Deposit to Crucible {crucibleId}</h2>
        
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

          <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ <strong>Real Transaction:</strong> This will send SOL to a test address on Solana testnet. 
              The SOL will be burned (lost) as this is a demo.
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Depositing...</span>
                </div>
              ) : (
                'Deposit SOL'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
