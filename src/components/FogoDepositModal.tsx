import React, { useState, useMemo } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface FogoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const FogoDepositModal: React.FC<FogoDepositModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction, network, switchNetwork } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const { updateCrucibleDeposit, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crucible = getCrucible(crucibleId);
  const targetSymbol = useMemo(() => crucible?.symbol || 'SOL', [crucible?.symbol]);

  const handleDeposit = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const depositAmount = parseFloat(amount);
    setLoading(true);
    setError(null);

    try {
      // Switch to Fogo testnet if not already there
      if (network !== 'fogo-testnet') {
        switchNetwork('fogo-testnet');
        // Wait a moment for network switch
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Create transaction for FOGO deposit
      const transaction = new Transaction();

      // For now, we'll simulate a FOGO token transfer
      // In production, this would be a proper token transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible vault
          lamports: Math.floor(depositAmount * LAMPORTS_PER_SOL), // Convert FOGO to lamports
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction);
      
      console.log('FOGO deposit successful:', signature);

      // Update local state
      subtractFromBalance('SOL', depositAmount); // Using SOL balance for now
      addToBalance('SPARK', depositAmount * 10);
      addToBalance('HEAT', depositAmount * 5);

      // Update crucible
      updateCrucibleDeposit(crucibleId, depositAmount);

      // Record transaction
      addTransaction({
        type: 'deposit',
        amount: depositAmount,
        token: 'FOGO', // Mark as FOGO token
        distToken: targetSymbol,
        crucibleId,
        signature
      });

      alert(`✅ FOGO deposit successful!\n\nTransaction: ${signature}\nDeposited: ${depositAmount} FOGO\nEarned: ${depositAmount * 10} SPARK + ${depositAmount * 5} HEAT\n\nNetwork: Fogo Testnet`);

      setAmount('');
      onClose();
    } catch (err) {
      console.error('FOGO deposit failed:', err);
      setError(err instanceof Error ? err.message : 'FOGO deposit failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Deposit FOGO Tokens - {crucible?.name}
        </h2>

        <div className="space-y-4">
          {/* Network Status */}
          <div className="p-3 bg-blue-900/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-blue-300">
                Network: {network === 'fogo-testnet' ? 'Fogo Testnet' : 'Solana Testnet'}
              </span>
            </div>
            {network !== 'fogo-testnet' && (
              <p className="text-xs text-yellow-300 mt-1">
                ⚠️ Will switch to Fogo testnet for FOGO deposits
              </p>
            )}
          </div>

          {/* FOGO Token Info */}
          <div className="p-3 bg-purple-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">FOGO Token Deposit</h4>
            <div className="text-xs text-purple-200 space-y-1">
              <div>• Deposit your FOGO tokens from Phantom wallet</div>
              <div>• Earn SPARK governance tokens</div>
              <div>• Earn HEAT reward tokens</div>
              <div>• APY: {(crucible?.apr || 0.08) * 100}%</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              FOGO Amount
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

          {/* Rewards Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 bg-green-900/30 rounded-lg">
              <h4 className="text-sm font-semibold text-green-300 mb-2">Rewards Preview</h4>
              <div className="text-xs text-green-200 space-y-1">
                <div>SPARK Rewards: {(parseFloat(amount) * 10).toFixed(0)} SPARK</div>
                <div>HEAT Rewards: {(parseFloat(amount) * 5).toFixed(0)} HEAT</div>
                <div>Annual APY: {((crucible?.apr || 0.08) * 100).toFixed(1)}%</div>
              </div>
            </div>
          )}

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
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Depositing FOGO...' : 'Deposit FOGO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
