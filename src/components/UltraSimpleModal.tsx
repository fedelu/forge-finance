import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

interface UltraSimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const UltraSimpleModal: React.FC<UltraSimpleModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { publicKey } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const { updateCrucibleDeposit } = useCrucible();
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
      console.log('=== ULTRA SIMPLE TRANSACTION ===');
      console.log('Wallet:', publicKey.toString());
      console.log('Amount:', amount, 'SOL');

      // Simulate a successful transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction signature
      const mockSignature = 'ultra_simple_' + Math.random().toString(36).substr(2, 9);
      
      console.log('Transaction simulated successfully:', mockSignature);
      
      // Update balances
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
        signature: mockSignature
      });
      
      alert(`✅ ULTRA SIMPLE TRANSACTION SUCCESSFUL!\n\nMock Signature: ${mockSignature}\nSOL deposited: ${depositAmount}\nSPARK earned: ${depositAmount * 10}\nHEAT earned: ${depositAmount * 5}\n\nNote: This is a simulation. No real SOL is used.`);
      
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
        <h2 className="text-xl font-bold text-white mb-4">🔥 Ultra Simple - Crucible {crucibleId}</h2>
        
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

          <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
            <p className="text-blue-300 text-sm">
              ℹ️ <strong>ULTRA SIMPLE:</strong> This version simulates the transaction without using real SOL. Perfect for testing the UI and balance updates.
            </p>
          </div>

          <div className="p-3 bg-green-900/30 border border-green-600 rounded-lg">
            <p className="text-green-300 text-sm">
              ✅ <strong>NO ERRORS:</strong> This version will work without any Phantom simulation errors.
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Simulate Deposit'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
