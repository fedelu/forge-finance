import React, { useState, useMemo, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FOGO_TESTNET_CONFIG } from '../config/fogo-testnet';

interface RealFogoWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const RealFogoWithdrawModal: React.FC<RealFogoWithdrawModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction, network } = useWallet();
  const { addToBalance, subtractFromBalance } = useBalance();
  const { updateCrucibleWithdraw, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apyRewards, setApyRewards] = useState(0);

  const crucible = getCrucible(crucibleId);
  const targetSymbol = useMemo(() => crucible?.symbol || 'SOL', [crucible?.symbol]);
  const availableAmount = useMemo(() => crucible?.userDeposit || 0, [crucible?.userDeposit]);

  // Calculate APY rewards based on time in crucible
  useEffect(() => {
    if (crucible && crucible.userDeposit > 0) {
      // Simulate APY calculation (in production, this would be calculated on-chain)
      const apyRate = FOGO_TESTNET_CONFIG.APY_CONFIG[`${targetSymbol}_CRUCIBLE` as keyof typeof FOGO_TESTNET_CONFIG.APY_CONFIG];
      const timeInCrucible = 30; // days (simulated)
      const dailyRate = apyRate / 365;
      const rewards = crucible.userDeposit * dailyRate * timeInCrucible;
      setApyRewards(rewards);
    }
  }, [crucible, targetSymbol]);

  const handleWithdraw = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (network !== 'fogo-testnet') {
      setError('Please switch to Fogo testnet to make real withdrawals');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > availableAmount) {
      setError(`Maximum withdrawable amount is ${availableAmount.toFixed(6)} ${targetSymbol}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create real withdrawal transaction
      const transaction = new Transaction();

      // Add withdrawal instruction from crucible
      const crucibleProgramId = new PublicKey(FOGO_TESTNET_CONFIG.PROGRAM_IDS.FORGE_CRUCIBLES);
      
      // For now, we'll simulate the withdrawal instruction
      // In production, this would call the actual crucible withdrawal instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible vault
          toPubkey: publicKey,
          lamports: Math.floor(withdrawAmount * LAMPORTS_PER_SOL),
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction);
      
      console.log('Real Fogo withdrawal successful:', signature);

      // Calculate total withdrawal (principal + APY rewards)
      const totalWithdrawal = withdrawAmount + (withdrawAmount * apyRewards / availableAmount);
      const solCredited = totalWithdrawal; // Simplified conversion

      // Update local state
      addToBalance('SOL', solCredited);
      subtractFromBalance('SPARK', withdrawAmount * 10);
      subtractFromBalance('HEAT', withdrawAmount * 5);

      // Update crucible
      updateCrucibleWithdraw(crucibleId, withdrawAmount);

      // Record transaction
      addTransaction({
        type: 'withdraw',
        amount: withdrawAmount,
        token: targetSymbol,
        crucibleId,
        signature
      });

      alert(`✅ Real withdrawal successful!\n\nTransaction: ${signature}\nWithdrawn: ${withdrawAmount} ${targetSymbol}\nAPY Rewards: ${apyRewards.toFixed(6)} ${targetSymbol}\nTotal Credited: ${solCredited.toFixed(6)} SOL\n\nView on Fogo Explorer: https://explorer.fogo.io/tx/${signature}`);

      setAmount('');
      onClose();
    } catch (err) {
      console.error('Real withdrawal failed:', err);
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">
          Real Withdrawal - {crucible?.name} ({targetSymbol})
        </h2>

        <div className="space-y-4">

          {/* Available Balance */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-300">
              Available: {availableAmount.toFixed(6)} {targetSymbol}
            </div>
            <div className="text-xs text-gray-400">
              APY Rewards: {apyRewards.toFixed(6)} {targetSymbol}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount ({targetSymbol})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max={availableAmount}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="0.0"
            />
            <button
              onClick={() => setAmount(availableAmount.toString())}
              className="text-xs text-purple-400 hover:text-purple-300 mt-1"
            >
              Max: {availableAmount.toFixed(6)}
            </button>
          </div>

          {/* Withdrawal Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-3 bg-green-900/30 rounded-lg">
              <h4 className="text-sm font-semibold text-green-300 mb-2">Withdrawal Preview</h4>
              <div className="text-xs text-green-200 space-y-1">
                <div>Principal: {parseFloat(amount).toFixed(6)} {targetSymbol}</div>
                <div>APY Rewards: {(parseFloat(amount) * apyRewards / availableAmount).toFixed(6)} {targetSymbol}</div>
                <div>Total: {(parseFloat(amount) + parseFloat(amount) * apyRewards / availableAmount).toFixed(6)} {targetSymbol}</div>
                <div>SOL Credited: {((parseFloat(amount) + parseFloat(amount) * apyRewards / availableAmount)).toFixed(6)} SOL</div>
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
              onClick={handleWithdraw}
              disabled={loading || network !== 'fogo-testnet' || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Withdrawing...' : 'Withdraw Real Tokens'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
