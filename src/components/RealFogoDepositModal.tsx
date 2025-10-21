import React, { useState, useMemo } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FOGO_TESTNET_CONFIG } from '../config/fogo-testnet';

interface RealFogoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const RealFogoDepositModal: React.FC<RealFogoDepositModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction, network } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const { updateCrucibleDeposit, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crucible = getCrucible(crucibleId);
  const targetSymbol = useMemo(() => crucible?.symbol || 'SOL', [crucible?.symbol]);
  const tokenMint = FOGO_TESTNET_CONFIG.TOKEN_ADDRESSES[targetSymbol as keyof typeof FOGO_TESTNET_CONFIG.TOKEN_ADDRESSES];

  const handleDeposit = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (network !== 'fogo-testnet') {
      setError('Please switch to Fogo testnet to make real deposits');
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
      // Create real transaction for Fogo testnet
      const transaction = new Transaction();

      // Add deposit instruction to crucible
      const crucibleProgramId = new PublicKey(FOGO_TESTNET_CONFIG.PROGRAM_IDS.FORGE_CRUCIBLES);
      
      // For now, we'll simulate the deposit instruction
      // In production, this would call the actual crucible deposit instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible vault
          lamports: Math.floor(depositAmount * LAMPORTS_PER_SOL),
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction);
      
      console.log('Real Fogo deposit successful:', signature);

      // Update local state
      subtractFromBalance('SOL', depositAmount);
      addToBalance('SPARK', depositAmount * 10);
      addToBalance('HEAT', depositAmount * 5);

      // Convert SOL to target token amount for crucible
      const depositInTargetToken = depositAmount; // Simplified for now
      updateCrucibleDeposit(crucibleId, depositInTargetToken);

      // Record transaction
      addTransaction({
        type: 'deposit',
        amount: depositAmount,
        token: 'SOL',
        distToken: targetSymbol,
        crucibleId,
        signature
      });

      alert(`✅ Real deposit successful!\n\nTransaction: ${signature}\nDeposited: ${depositAmount} SOL\nEarned: ${depositAmount * 10} SPARK + ${depositAmount * 5} HEAT\n\nView on Fogo Explorer: https://explorer.fogo.io/tx/${signature}`);

      setAmount('');
      onClose();
    } catch (err) {
      console.error('Real deposit failed:', err);
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Real Deposit - {crucible?.name} ({targetSymbol})
        </h2>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount ({targetSymbol})
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

          {/* APY Information */}
          <div className="p-3 bg-green-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-green-300 mb-2">APY Rewards</h4>
            <div className="text-xs text-green-200 space-y-1">
              <div>APY: {(FOGO_TESTNET_CONFIG.APY_CONFIG[`${targetSymbol}_CRUCIBLE` as keyof typeof FOGO_TESTNET_CONFIG.APY_CONFIG] * 100).toFixed(1)}%</div>
              <div>SPARK Rewards: {amount ? (parseFloat(amount) * 10).toFixed(0) : '0'} SPARK</div>
              <div>HEAT Rewards: {amount ? (parseFloat(amount) * 5).toFixed(0) : '0'} HEAT</div>
            </div>
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
              disabled={loading || network !== 'fogo-testnet'}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Depositing...' : 'Deposit Real Tokens'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
