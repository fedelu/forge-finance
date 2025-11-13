import React, { useState, useMemo, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../hooks/useCrucible';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useSession } from './FogoSessions';
import { formatNumberWithCommas, getCTokenPrice, RATE_SCALE } from '../utils/math';
import { WRAP_FEE_RATE } from '../config/fees';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface FogoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const FogoDepositModal: React.FC<FogoDepositModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction, network, switchNetwork, getFogoBalance } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const { wrapTokens, getCrucible, calculateWrapPreview } = useCrucible();
  const { addTransaction } = useAnalytics();
  const fogoSession = useSession();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Removed deposit mode - always use simulation
  const [fogoBalance, setFogoBalance] = useState<number | null>(null);

  const crucible = getCrucible(crucibleId);
  const targetSymbol = useMemo(() => crucible?.symbol || 'FOGO', [crucible?.symbol]);

  // Fetch FOGO balance when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always use FOGO Sessions balance (simulation)
      setFogoBalance(fogoSession.fogoBalance || 10000);
    }
  }, [isOpen, fogoSession.fogoBalance]);

  // Refresh balance function
  const refreshBalance = async () => {
    // Always use FOGO Sessions balance (simulation)
    setFogoBalance(fogoSession.fogoBalance || 10000);
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const depositAmount = parseFloat(amount);

    // Check FOGO balance
    if (fogoSession.fogoBalance !== undefined && depositAmount > fogoSession.fogoBalance) {
      setError(`Insufficient FOGO balance. You have ${fogoSession.fogoBalance.toFixed(2)} FOGO tokens.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Processing FOGO wrap...');
      
      // Check if FOGO Sessions is available
      if (!fogoSession.depositToCrucible) {
        setError('FOGO Sessions not available. Please connect to FOGO Sessions first.');
        return;
      }

      // Calculate cFOGO preview
      const preview = calculateWrapPreview(crucibleId, amount);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use FOGO Sessions context for deposit
      await fogoSession.depositToCrucible(depositAmount, crucibleId);
      
      // Wrap FOGO to cFOGO
      await wrapTokens(crucibleId, amount);
      
      const mockSignature = 'sim_wrap_' + Math.random().toString(36).substr(2, 9);
      console.log('FOGO wrap successful:', mockSignature);

      // Update local state - subtract FOGO from wallet and add cTokens
      subtractFromBalance('FOGO', depositAmount);
      
      // Get the crucible type to determine which cToken to add
      const targetPTokenSymbol = crucible?.ptokenSymbol === 'cFORGE' ? 'cFORGE' : 'cFOGO';
      const ptokenAmount = parseFloat(preview.ptokenAmount);
      addToBalance(targetPTokenSymbol, ptokenAmount);

      // Record transaction
      addTransaction({
        type: 'wrap',
        amount: depositAmount,
        token: 'FOGO',
        distToken: targetPTokenSymbol,
        crucibleId,
        signature: mockSignature
      });

      // Update local FOGO balance display
      setFogoBalance(fogoSession.fogoBalance);

      alert(`✅ FOGO WRAP SUCCESSFUL\n\n✅ ${depositAmount.toFixed(2)} FOGO wrapped\n✅ ${preview.ptokenAmount} cFOGO received\n✅ Est. FOGO value: ${preview.estimatedValue} FOGO\n\nTransaction: ${mockSignature}`);

      setAmount('');
      onClose();
    } catch (err: any) {
      console.error('Wrap error:', err);
      setError(err.message || 'Wrap failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="panel rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-fogo-lg border border-fogo-gray-700">
        <div className="p-6 border-b border-fogo-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-fogo-primary/20 rounded-2xl flex items-center justify-center">
              <svg className="h-5 w-5 text-fogo-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              Wrap {crucible?.baseToken} to {crucible?.ptokenSymbol} - {crucible?.name}
            </h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
          {/* cFOGO Token Info */}
          <div className="p-4 bg-fogo-primary/10 rounded-2xl border border-fogo-primary/20">
            <h4 className="text-sm font-semibold text-fogo-primary mb-2">Wrapping Details</h4>
            <div className="text-xs text-fogo-gray-300 space-y-1">
              <div>• Wrap your {crucible?.baseToken} tokens to earn yield-bearing {crucible?.ptokenSymbol}</div>
              <div>• Exchange rate: <span className="text-fogo-primary font-semibold">1 {crucible?.baseToken} = 1 {crucible?.ptokenSymbol}</span> (at deposit)</div>
              <div>• {crucible?.baseToken} price: <span className="text-white font-semibold">${crucible?.baseToken === 'FOGO' ? '0.50' : '0.002'} USD</span></div>
              <div>• {crucible?.ptokenSymbol} price: <span className="text-fogo-accent font-semibold">{(() => {
                const hasDeposits = (crucible?.totalWrapped || BigInt(0)) > BigInt(0);
                const exchangeRate = hasDeposits ? (crucible?.exchangeRate || RATE_SCALE) : RATE_SCALE;
                const exchangeRateDecimal = Number(exchangeRate) / Number(RATE_SCALE);
                return `${exchangeRateDecimal.toFixed(4)} ${crucible?.baseToken}`;
              })()}</span> {(() => {
                const hasDeposits = (crucible?.totalWrapped || BigInt(0)) > BigInt(0);
                return hasDeposits ? '(includes accumulated yield)' : '(1:1 with ' + crucible?.baseToken + ')';
              })()}</div>
              <div>• Yield comes from {crucible?.ptokenSymbol} value increase over time</div>
              <div>• Current APY: {crucible?.currentAPY?.toFixed(2) || ((crucible?.apr || 0.15) * 100).toFixed(2)}%</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-fogo-gray-300 mb-2">
              {crucible?.baseToken} Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max={fogoBalance || undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 panel-muted rounded-2xl text-white focus:outline-none focus:border-fogo-primary focus:ring-2 focus:ring-fogo-primary/20 transition-all duration-200"
                placeholder="0.0"
              />
            </div>
            {fogoBalance !== null && (
              <div className="mt-2 flex items-center justify-between text-xs text-fogo-gray-400">
                <span>Available: {fogoBalance.toFixed(2)} {crucible?.baseToken}</span>
                <button
                  onClick={refreshBalance}
                  className="text-fogo-primary hover:text-fogo-primary-light transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* cFOGO Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="p-4 bg-fogo-success/10 rounded-2xl border border-fogo-success/20">
              <h4 className="text-sm font-semibold text-fogo-success mb-2">{crucible?.ptokenSymbol} Preview</h4>
              <div className="text-xs text-fogo-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>{crucible?.baseToken} to deposit:</span>
                  <span className="text-white font-medium">{formatNumberWithCommas(parseFloat(amount))} {crucible?.baseToken}</span>
                </div>
            <div className="flex justify-between">
              <span>Wrap Fee ({(WRAP_FEE_RATE * 100).toFixed(1)}%):</span>
              <span className="text-red-300 font-medium">-{formatNumberWithCommas(parseFloat(amount) * WRAP_FEE_RATE)} {crucible?.baseToken}</span>
            </div>
                <div className="flex justify-between border-t border-fogo-gray-600 pt-1">
                  <span>Net deposit:</span>
                  <span className="text-fogo-success font-medium">{formatNumberWithCommas(parseFloat(amount) * (1 - WRAP_FEE_RATE))} {crucible?.baseToken}</span>
                </div>
                <div className="flex justify-between">
                  <span>{crucible?.ptokenSymbol} to receive:</span>
                  <span className="text-fogo-accent font-medium">{calculateWrapPreview(crucibleId, amount).ptokenAmount} {crucible?.ptokenSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current value (at $0.50):</span>
                  <span className="text-white font-medium">${formatNumberWithCommas(parseFloat(amount) * (1 - WRAP_FEE_RATE) * 0.5)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. exchange rate:</span>
                  <span className="text-fogo-accent font-medium">{(() => {
                    const hasDeposits = (crucible?.totalWrapped || BigInt(0)) > BigInt(0);
                    const exchangeRate = hasDeposits ? (crucible?.exchangeRate || RATE_SCALE) : RATE_SCALE;
                    const exchangeRateDecimal = Number(exchangeRate) / Number(RATE_SCALE);
                    return `1 ${crucible?.ptokenSymbol} = ${exchangeRateDecimal.toFixed(4)} ${crucible?.baseToken}`;
                  })()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current APY:</span>
                  <span className="text-fogo-primary font-medium">{crucible?.currentAPY?.toFixed(1) || ((crucible?.apr || 0.15) * 100).toFixed(1)}%</span>
                </div>
                <div className="text-fogo-success text-xs mt-2">
                  💡 Your {crucible?.ptokenSymbol} will automatically earn yield over time!
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          </div>
        </div>

        <div className="p-6 border-t border-fogo-gray-700">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-fogo-gray-700 text-white rounded-2xl hover:bg-fogo-gray-600 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDeposit}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-fogo-primary to-fogo-secondary text-white rounded-2xl hover:from-fogo-primary-dark hover:to-fogo-secondary-dark transition-all duration-200 disabled:opacity-50 font-medium shadow-fogo hover:shadow-flame"
            >
              {loading ? 'Wrapping...' : `Wrap ${crucible?.baseToken}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};