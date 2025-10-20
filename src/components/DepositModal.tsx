import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, signTransaction, sendTransaction } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const { updateCrucibleDeposit, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
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
      // Create a simple transaction for demonstration
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible address
          lamports: Math.floor(parseFloat(amount) * 1e9), // Convert SOL to lamports
        })
      );

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // For now, let's simulate a successful transaction without actually sending it
      // since we don't have real programs deployed
      console.log('Simulating deposit transaction...');
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction signature
      const mockSignature = 'mock_' + Math.random().toString(36).substr(2, 9);
      
      console.log('Deposit simulated successfully:', mockSignature);
      
      // Update balances
      const depositAmount = parseFloat(amount);
      
      console.log('DepositModal: Processing deposit:', {
        depositAmount,
        solToRemove: depositAmount,
        sparkToAdd: depositAmount * 10,
        heatToAdd: depositAmount * 5
      });
      
      subtractFromBalance('SOL', depositAmount);
      
      // Add to crucible balance (simulated)
      addToBalance('SPARK', depositAmount * 10); // 10 SPARK per SOL deposited
      addToBalance('HEAT', depositAmount * 5); // 5 HEAT per SOL deposited
      
      // Update crucible
      updateCrucibleDeposit(crucibleId, depositAmount);
      
      // Record transaction in analytics
      // Derive token from crucible for analytics
      const crucible = getCrucible(crucibleId)
      const token = crucible?.symbol || 'SOL'
      addTransaction({
        type: 'deposit',
        amount: depositAmount,
        token,
        crucibleId,
        signature: mockSignature
      });
      
      alert(`Deposit simulated successfully! Mock Transaction: ${mockSignature}\n\n✅ ${depositAmount} SOL deposited\n✅ ${depositAmount * 10} SPARK earned\n✅ ${depositAmount * 5} HEAT earned\n\nNote: This is a demo. In production, this would be a real transaction on Solana testnet.`);
      
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
        <h2 className="text-xl font-bold text-white mb-4">Deposit to Crucible {crucibleId}</h2>
        
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

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Depositing...' : 'Deposit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
