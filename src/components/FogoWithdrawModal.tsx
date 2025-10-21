import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useSession } from './FogoSessions';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { calculateAPYRewards, getTimeInCrucible, formatAPYBreakdown } from '../utils/apyCalculations';

interface FogoWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const FogoWithdrawModal: React.FC<FogoWithdrawModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction, network, switchNetwork } = useWallet();
  const { addToBalance, subtractFromBalance } = useBalance();
  const { updateCrucibleWithdraw, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
  const fogoSession = useSession();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawMode, setWithdrawMode] = useState<'simulation' | 'real'>('simulation');

  const crucible = getCrucible(crucibleId);
  const targetSymbol = useMemo(() => crucible?.symbol || 'FOGO', [crucible?.symbol]);
  const availableAmount = useMemo(() => crucible?.userDeposit || 0, [crucible?.userDeposit]);

  // APY Calculation
  const timeInCrucible = useMemo(() => getTimeInCrucible(crucibleId), [crucibleId]);
  const apyCalculation = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return null;
    const principal = parseFloat(amount);
    const apyRate = crucible?.apr || 0.15;
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

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > availableAmount) {
      setError(`Maximum withdrawable amount is ${availableAmount.toFixed(6)} ${targetSymbol}`);
      return;
    }

    // Calculate total withdrawal including APY rewards
    const totalWithdrawal = apyCalculation ? apyCalculation.totalWithdrawal : withdrawAmount;
    const apyRewards = apyCalculation ? apyCalculation.totalRewards : 0;

    setLoading(true);
    setError(null);

    try {
      if (withdrawMode === 'simulation') {
        // SIMULATION MODE - Use FOGO Sessions context
        console.log('Simulating FOGO withdrawal using FOGO Sessions context...');
        
        // Check if FOGO Sessions is available
        if (!fogoSession.withdrawFromCrucible) {
          setError('FOGO Sessions not available. Please connect to FOGO Sessions first.');
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Use FOGO Sessions context for withdrawal
        await fogoSession.withdrawFromCrucible(withdrawAmount);
        
        const mockSignature = 'sim_withdraw_fogo_' + Math.random().toString(36).substr(2, 9);
        console.log('Simulated FOGO withdrawal successful:', mockSignature);

        // Update local state (simulation)
        const solCredited = totalWithdrawal * 0.5; // Convert FOGO to SOL for simulation
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
          signature: mockSignature,
          apyRewards: apyRewards,
          totalWithdrawal: totalWithdrawal
        });

        alert(`🎮 SIMULATION WITHDRAWAL\n\n✅ Principal: ${withdrawAmount.toFixed(6)} FOGO\n✅ APY Rewards: ${apyRewards.toFixed(6)} FOGO\n✅ Total Withdrawn: ${totalWithdrawal.toFixed(6)} FOGO\n✅ Credited: ${solCredited.toFixed(6)} SOL\n\nTransaction: ${mockSignature}\n\nThis is a test - no real tokens were used!`);

      } else {
        // REAL MODE - Actual FOGO tokens
        if (network !== 'fogo-testnet') {
          switchNetwork('fogo-testnet');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Create real withdrawal transaction
        const transaction = new Transaction();

        // For now, we'll simulate the withdrawal instruction
        // In production, this would call the actual crucible withdrawal instruction
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible vault
            toPubkey: publicKey,
            lamports: Math.floor(totalWithdrawal * LAMPORTS_PER_SOL), // Convert total withdrawal to lamports
          })
        );

        // Send transaction
        const signature = await sendTransaction(transaction);
        
        console.log('Real FOGO withdrawal successful:', signature);

        // Calculate total withdrawal (principal + APY rewards)
        const solCredited = totalWithdrawal * 0.5; // Convert FOGO to SOL for balance tracking

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
          signature,
          apyRewards: apyRewards,
          totalWithdrawal: totalWithdrawal
        });

        alert(`🔥 REAL FOGO WITHDRAWAL\n\n✅ Principal: ${withdrawAmount.toFixed(6)} FOGO\n✅ APY Rewards: ${apyRewards.toFixed(6)} FOGO\n✅ Total Withdrawn: ${totalWithdrawal.toFixed(6)} FOGO\n✅ Credited: ${solCredited.toFixed(6)} SOL\n\nTransaction: ${signature}\n\nView on Fogo Explorer: https://explorer.fogo.io/tx/${signature}`);
      }

      setAmount('');
      onClose();
    } catch (err) {
      console.error('FOGO withdrawal failed:', err);
      setError(err instanceof Error ? err.message : 'FOGO withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              Withdraw FOGO Tokens - {crucible?.name}
            </h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
          {/* Withdraw Mode Selection */}
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-3">Choose Withdraw Mode</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWithdrawMode('simulation')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  withdrawMode === 'simulation'
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                    : 'border-gray-600 bg-gray-600/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-lg mb-1">🎮</div>
                <div className="text-sm font-medium">Simulation</div>
                <div className="text-xs opacity-75">Test platform</div>
              </button>
              <button
                onClick={() => setWithdrawMode('real')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  withdrawMode === 'real'
                    ? 'border-orange-500 bg-orange-900/30 text-orange-300'
                    : 'border-gray-600 bg-gray-600/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-lg mb-1">🔥</div>
                <div className="text-sm font-medium">Real FOGO</div>
                <div className="text-xs opacity-75">Actual tokens</div>
              </button>
            </div>
          </div>

          {/* Mode-specific Information */}
          {withdrawMode === 'simulation' ? (
            <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">🎮 Simulation Mode</h4>
              <div className="text-xs text-blue-200 space-y-1">
                <div>• No real FOGO tokens required</div>
                <div>• Perfect for testing withdrawals</div>
                <div>• APY calculations work normally</div>
                <div>• Safe to experiment with</div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-orange-900/30 border border-orange-600 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-300 mb-2">🔥 Real FOGO Mode</h4>
              <div className="text-xs text-orange-200 space-y-1">
                <div>• Withdraws your actual FOGO tokens</div>
                <div>• Requires Fogo testnet connection</div>
                <div>• Real transactions on blockchain</div>
                <div>• Receive actual APY rewards</div>
              </div>
            </div>
          )}

          {/* Available Balance */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-300">
              Available: {availableAmount.toFixed(6)} {targetSymbol}
            </div>
            <div className="text-xs text-gray-400">
              APY: {(crucible?.apr || 0.15) * 100}% | Time in crucible: {timeInCrucible} days
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount ({targetSymbol})
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.01"
                min="0"
                max={availableAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="0.0"
              />
              <button
                onClick={() => setAmount(availableAmount.toString())}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Max
              </button>
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

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleWithdraw}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Withdrawing...' : withdrawMode === 'simulation' ? 'Simulate Withdrawal' : 'Withdraw Real FOGO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
