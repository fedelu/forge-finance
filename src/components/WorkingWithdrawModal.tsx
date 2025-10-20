import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { calculateAPYRewards, getTimeInCrucible, formatAPYBreakdown } from '../utils/apyCalculations';

interface WorkingWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
  maxAmount: number;
}

export const WorkingWithdrawModal: React.FC<WorkingWithdrawModalProps> = ({ isOpen, onClose, crucibleId, maxAmount }) => {
  const { connection, publicKey, sendTransaction } = useWallet();
  const { addToBalance, subtractFromBalance } = useBalance();
  const { updateCrucibleWithdraw, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceTable = { SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5 } as const;
  const normalizeSymbol = (s?: string) => (s || 'SOL').toUpperCase().trim();
  const price = (symbol: string) => (priceTable as any)[normalizeSymbol(symbol)] || 1;
  const crucible = getCrucible(crucibleId);
  const inferSymbol = (id?: string) => {
    const key = (id || '').trim().toLowerCase();
    if (key.includes('eth')) return 'ETH';
    if (key.includes('btc')) return 'BTC';
    if (key.includes('usdc')) return 'USDC';
    if (key.includes('fogo')) return 'FOGO';
    if (key.includes('sol')) return 'SOL';
    return 'SOL';
  };
  const targetSymbol = normalizeSymbol(inferSymbol(crucibleId));
  const availableTokenUnits = Number(crucible?.userDeposit || 0);

  // APY Calculation
  const timeInCrucible = useMemo(() => getTimeInCrucible(crucibleId), [crucibleId]);
  const apyCalculation = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return null;
    const principal = parseFloat(amount);
    const apyRate = crucible?.apr || 0.08;
    return calculateAPYRewards(principal, apyRate, timeInCrucible);
  }, [amount, crucible?.apr, timeInCrucible]);

  const apyBreakdown = useMemo(() => {
    return apyCalculation ? formatAPYBreakdown(apyCalculation) : null;
  }, [apyCalculation]);

  const handleWithdraw = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const withdrawTokenAmount = parseFloat(amount);

    if (withdrawTokenAmount > availableTokenUnits) {
      setError(`Maximum withdrawable amount is ${availableTokenUnits.toFixed(6)} ${targetSymbol}`);
      return;
    }

    // Calculate total withdrawal including APY rewards
    const totalWithdrawal = apyCalculation ? apyCalculation.totalWithdrawal : withdrawTokenAmount;
    const apyRewards = apyCalculation ? apyCalculation.totalRewards : 0;

    setLoading(true);
    setError(null);

    try {
      // Create a simple transfer transaction (simulating withdrawal with APY)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible address
          toPubkey: publicKey,
          lamports: Math.floor(totalWithdrawal * price(targetSymbol) / price('SOL') * 1e9), // Convert total withdrawal to SOL lamports
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // For withdrawal, we'll simulate it since we can't actually withdraw from a mock address
      // In a real app, this would interact with the actual crucible program
      console.log('Simulating withdrawal transaction...');
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction signature
      const mockSignature = 'withdraw_' + Math.random().toString(36).substr(2, 9);
      
      console.log('Withdrawal simulated successfully:', mockSignature);
      
      // Update balances: input is in crucible token units
      const solCredited = (totalWithdrawal * price(targetSymbol)) / price('SOL');
      addToBalance('SOL', solCredited);
      
      // Remove from crucible-linked rewards (demo logic)
      subtractFromBalance('SPARK', withdrawTokenAmount * 10);
      subtractFromBalance('HEAT', withdrawTokenAmount * 5);
      
      // Update crucible (deduct token units)
      updateCrucibleWithdraw(crucibleId, withdrawTokenAmount);
      
      // Record transaction in analytics in token units (USD conversion handled in context)
      addTransaction({
        type: 'withdraw',
        amount: withdrawTokenAmount,
        token: targetSymbol,
        crucibleId,
        signature: mockSignature
      });
      
      alert(`✅ Withdrawal successful!\n\nMock Transaction: ${mockSignature}\nPrincipal: ${withdrawTokenAmount.toFixed(6)} ${targetSymbol}\nAPY Rewards: ${apyRewards.toFixed(6)} ${targetSymbol}\nTotal Withdrawn: ${totalWithdrawal.toFixed(6)} ${targetSymbol}\nCredited: ${solCredited.toFixed(6)} SOL`);
      
      // Reset form
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Withdrawal failed:', err);
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMax = () => {
    setAmount(availableTokenUnits.toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">🔥 Withdraw from Crucible {crucibleId}</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount ({targetSymbol})
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max={availableTokenUnits}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="0.0"
              />
              <button
                onClick={handleMax}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Max
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Available: {availableTokenUnits} {targetSymbol}
            </div>
          </div>

          {/* APY Rewards Breakdown */}
          {apyBreakdown && (
            <div className="p-4 bg-green-900/30 border border-green-600 rounded-lg">
              <h4 className="text-green-300 font-semibold mb-3">💰 APY Rewards Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Principal:</span>
                  <span className="text-white font-medium">{apyBreakdown.principal} {targetSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">APY Rewards ({apyBreakdown.apyPercentage}% for {apyBreakdown.timeInDays} days):</span>
                  <span className="text-green-400 font-medium">+{apyBreakdown.rewards} {targetSymbol}</span>
                </div>
                <div className="border-t border-green-600 pt-2">
                  <div className="flex justify-between">
                    <span className="text-green-300 font-semibold">Total Withdrawal:</span>
                    <span className="text-green-400 font-bold">{apyBreakdown.total} {targetSymbol}</span>
                  </div>
                </div>
                <div className="text-xs text-green-200 mt-2">
                  💡 You'll receive the full amount including APY rewards!
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
            <p className="text-blue-300 text-sm">
              ℹ️ <strong>Simulated Transaction:</strong> This is a demo withdrawal. In production, this would interact with the actual crucible program.
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
              onClick={handleWithdraw}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Withdrawing...</span>
                </div>
              ) : (
                <span>Withdraw {targetSymbol}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
