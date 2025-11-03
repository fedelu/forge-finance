import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../hooks/useCrucible';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useSession } from './FogoSessions';
import { formatNumberWithCommas, getCTokenPrice, RATE_SCALE } from '../utils/math';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface FogoWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const FogoWithdrawModal: React.FC<FogoWithdrawModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction, network, switchNetwork } = useWallet();
  const { addToBalance, subtractFromBalance } = useBalance();
  const { unwrapTokens, unwrapTokensToUSDC, getCrucible, calculateUnwrapPreview } = useCrucible();
  const { addTransaction, analytics } = useAnalytics();
  const fogoSession = useSession();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawalMode, setWithdrawalMode] = useState<'token' | 'usdc'>('token');

  const crucible = getCrucible(crucibleId);
  const targetSymbol = useMemo(() => crucible?.symbol || 'FOGO', [crucible?.symbol]);
  const availableAmount = useMemo(() => {
    if (!crucible?.userPtokenBalance) return 0;
    return Number(crucible.userPtokenBalance) / 1e9; // Convert from lamports to tokens
  }, [crucible?.userPtokenBalance]);

  // APY Calculation - find the original deposit timestamp for this crucible
  const depositTimestamp = useMemo(() => {
    // Find the most recent deposit transaction for this crucible
    const depositTx = analytics.transactions
      .filter(tx => tx.type === 'deposit' && tx.crucibleId === crucibleId)
      .sort((a, b) => b.timestamp - a.timestamp)[0]; // Get most recent deposit
    return depositTx?.timestamp || Date.now() - (30 * 24 * 60 * 60 * 1000); // Default to 30 days ago if no deposit found
  }, [analytics.transactions, crucibleId]);

  const apyCalculation = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return null;
    const principal = parseFloat(amount);
    const apyRate = crucible?.apr || 0.08; // 8% APY for more realistic demo
    // Calculate APY for full year (365 days) by default
    const dailyRate = apyRate / 365;
    const totalWithdrawal = principal * Math.pow(1 + dailyRate, 365);
    const totalRewards = totalWithdrawal - principal;
    
    return {
      principal,
      apyRate,
      timeInDays: 365,
      totalRewards,
      totalWithdrawal,
      dailyRate
    };
  }, [amount, crucible?.apr]);

  const apyBreakdown = useMemo(() => {
    if (!apyCalculation) return null;
    return {
      principal: apyCalculation.principal.toFixed(6),
      rewards: apyCalculation.totalRewards.toFixed(6),
      total: apyCalculation.totalWithdrawal.toFixed(6),
      apyPercentage: (apyCalculation.apyRate * 100).toFixed(1),
      timeInDays: apyCalculation.timeInDays.toFixed(0)
    };
  }, [apyCalculation]);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > availableAmount) {
      setError(`Maximum withdrawable amount is ${formatNumberWithCommas(availableAmount)} cFOGO`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (withdrawalMode === 'usdc') {
        console.log('Processing cFOGO unwrap to USDC...');
        await unwrapTokensToUSDC(crucibleId, amount);
        
        // Add USDC to balance and subtract cTokens
        const preview = calculateUnwrapPreview(crucibleId, amount);
        const usdcAmount = parseFloat(preview.baseAmount) * 0.985; // 1.5% fee
        
        const targetPTokenSymbol = crucible?.ptokenSymbol === 'cFORGE' ? 'cFORGE' : 'cFOGO';
        subtractFromBalance(targetPTokenSymbol, withdrawAmount);
        addToBalance('USDC', usdcAmount);
        
        // Add transaction record
        addTransaction({
          type: 'withdraw',
          amount: usdcAmount,
          token: 'USDC',
          crucibleId,
          signature: `mock-usdc-${Date.now()}`,
          usdValue: usdcAmount,
          apyRewards: 0 // USDC withdrawal doesn't include APY rewards
        });
        
        console.log(`Successfully withdrew ${formatNumberWithCommas(usdcAmount)} USDC`);
      } else {
        console.log('Processing cFOGO unwrap to token...');
        
        // Check if FOGO Sessions is available
        if (!fogoSession.withdrawFromCrucible) {
          setError('FOGO Sessions not available. Please connect to FOGO Sessions first.');
          return;
        }

        // Calculate FOGO to receive from unwrapping
        const preview = calculateUnwrapPreview(crucibleId, amount);
        const fogoToReceive = parseFloat(preview.baseAmount);

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Use FOGO Sessions context for withdrawal
        await fogoSession.withdrawFromCrucible(fogoToReceive, 0);
        
        // Unwrap cFOGO to FOGO
        await unwrapTokens(crucibleId, amount);
        
        const mockSignature = 'sim_unwrap_pfogo_' + Math.random().toString(36).substr(2, 9);
        console.log('cFOGO unwrap successful:', mockSignature);

        // Update local state - add FOGO received from unwrapping
        // Note: unwrapTokens already updates Crucible userBalances internally,
        // so we only need to update the wallet's FOGO balance
        addToBalance('FOGO', fogoToReceive);

        // Record transaction
        addTransaction({
          type: 'unwrap',
          amount: fogoToReceive,
          token: 'FOGO',
          crucibleId,
          signature: mockSignature
        });

        alert(`✅ cFOGO UNWRAP SUCCESSFUL\n\n✅ ${formatNumberWithCommas(withdrawAmount)} cFOGO unwrapped\n✅ Received: ${formatNumberWithCommas(fogoToReceive)} FOGO\n✅ Yield earned: ${formatNumberWithCommas(fogoToReceive - withdrawAmount)} FOGO\n\nTransaction: ${mockSignature}`);
      }

      setAmount('');
      onClose();
    } catch (err: any) {
      console.error('Unwrap error:', err);
      setError(err.message || 'Unwrap failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-fogo-gray-900 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-fogo-lg border border-fogo-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              Unwrap {crucible?.ptokenSymbol} to {crucible?.baseToken} - {crucible?.name}
            </h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
          {/* cFOGO Token Info */}
          <div className="p-3 bg-purple-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Unwrapping Details</h4>
            <div className="text-xs text-purple-200 space-y-1">
              <div>• Unwrap your {crucible?.ptokenSymbol} tokens to receive {crucible?.baseToken} + yield</div>
              <div>• {crucible?.baseToken} price: <span className="text-white font-semibold">${crucible?.baseToken === 'FOGO' ? '0.50' : '0.002'} USD</span></div>
              <div>• {crucible?.ptokenSymbol} current price: <span className="text-purple-300 font-semibold">{(() => {
                const hasDeposits = (crucible?.totalWrapped || BigInt(0)) > BigInt(0);
                const exchangeRate = hasDeposits ? (crucible?.exchangeRate || RATE_SCALE) : RATE_SCALE;
                const exchangeRateDecimal = Number(exchangeRate) / Number(RATE_SCALE);
                return `${exchangeRateDecimal.toFixed(4)} ${crucible?.baseToken}`;
              })()}</span> {(() => {
                const hasDeposits = (crucible?.totalWrapped || BigInt(0)) > BigInt(0);
                return hasDeposits ? '(includes accumulated yield)' : '(1:1 with ' + crucible?.baseToken + ')';
              })()}</div>
              <div>• You receive MORE {crucible?.baseToken} than deposited due to value appreciation</div>
              <div>• Current APY: {crucible?.currentAPY?.toFixed(2) || ((crucible?.apr || 0.15) * 100).toFixed(2)}%</div>
            </div>
          </div>

          {/* Available Balance */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-300">
              Available: {formatNumberWithCommas(availableAmount)} {crucible?.ptokenSymbol}
            </div>
            <div className="text-xs text-gray-400">
              Est. {crucible?.baseToken} value: {crucible?.estimatedBaseValue ? (Number(crucible.estimatedBaseValue) / 1e9).toFixed(6) : '0.000000'} {crucible?.baseToken}
            </div>
          </div>

          {/* Withdrawal Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Withdrawal Method
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setWithdrawalMode('token')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  withdrawalMode === 'token'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Receive {targetSymbol}
              </button>
              <button
                onClick={() => setWithdrawalMode('usdc')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  withdrawalMode === 'usdc'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Receive USDC (1.5% fee)
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {withdrawalMode === 'usdc' 
                ? 'Convert to USDC with 1.5% commission fee'
                : 'Receive original token with yield included'
              }
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount ({crucible?.ptokenSymbol})
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

          {/* Unwrap Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className={`p-4 border rounded-lg ${
              withdrawalMode === 'usdc' 
                ? 'bg-blue-900/30 border-blue-600' 
                : 'bg-green-900/30 border-green-600'
            }`}>
              <h4 className={`font-semibold mb-3 ${
                withdrawalMode === 'usdc' ? 'text-blue-300' : 'text-green-300'
              }`}>
                💰 Unwrap Preview
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">{crucible?.ptokenSymbol} to unwrap:</span>
                  <span className="text-white font-medium">{formatNumberWithCommas(parseFloat(amount))} {crucible?.ptokenSymbol}</span>
                </div>
                {withdrawalMode === 'usdc' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">USDC to receive:</span>
                      <span className="text-blue-400 font-medium">
                        {formatNumberWithCommas(parseFloat(calculateUnwrapPreview(crucibleId, amount).baseAmount) * 0.985)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Commission fee (1.5%):</span>
                      <span className="text-red-300 font-medium">
                        -{formatNumberWithCommas(parseFloat(calculateUnwrapPreview(crucibleId, amount).baseAmount) * 0.015)} USDC
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{targetSymbol} to receive:</span>
                      <span className="text-green-400 font-medium">{calculateUnwrapPreview(crucibleId, amount).baseAmount} {targetSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Yield included:</span>
                      <span className="text-green-300 font-medium">
                        +{((parseFloat(calculateUnwrapPreview(crucibleId, amount).baseAmount) - parseFloat(amount)) / parseFloat(amount) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">Yield earned:</span>
                  <span className="text-green-400 font-medium">
                    +{(parseFloat(calculateUnwrapPreview(crucibleId, amount).baseAmount) - parseFloat(amount)).toFixed(6)} {crucible?.baseToken}
                  </span>
                </div>
                <div className="text-xs text-green-200 mt-2">
                  💡 Your {crucible?.ptokenSymbol} has earned yield through exchange rate growth!
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
              {loading ? 'Unwrapping...' : 'Unwrap cFOGO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
