import React, { useEffect, useMemo, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
  maxAmount: number; // kept for backwards compatibility; we compute it dynamically
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, crucibleId, maxAmount }) => {
  const { connection, publicKey, signTransaction, sendTransaction } = useWallet();
  const { addToBalance, subtractFromBalance } = useBalance();
  const { updateCrucibleWithdraw, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute maximum SOL withdrawable based on crucible token holdings
  const priceTable = { SOL: 200, USDC: 1, ETH: 4000, BTC: 110000 } as const;
  const normalizeSymbol = (s?: string) => (s || 'SOL').toUpperCase().trim();
  const price = (symbol: string) => (priceTable as any)[normalizeSymbol(symbol)] || 1;
  const crucible = getCrucible(crucibleId);
  const inferSymbol = (id?: string) => {
    const key = (id || '').trim().toLowerCase();
    const explicit: { [k: string]: string } = {
      'eth-crucible': 'ETH',
      'btc-crucible': 'BTC',
      'usdc-crucible': 'USDC',
      'sol-crucible': 'SOL'
    };
    if (explicit[key]) return explicit[key];
    if (key.includes('eth')) return 'ETH';
    if (key.includes('btc')) return 'BTC';
    if (key.includes('usdc')) return 'USDC';
    if (key.includes('sol')) return 'SOL';
    return 'SOL';
  };
  // Always infer token from crucibleId to avoid stale/missing symbols
  const targetSymbol = useMemo(() => normalizeSymbol(inferSymbol(crucibleId)), [crucibleId]);
  // Available token units in the crucible (native token)
  const availableTokenUnits = useMemo(() => {
    return Number(crucible?.userDeposit || 0);
  }, [crucible?.userDeposit]);

  // Reset modal state when opening or switching crucible to avoid stale values
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setError(null);
    }
  }, [isOpen, crucibleId]);

  const handleWithdraw = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > availableTokenUnits) {
      setError(`Maximum withdrawable amount is ${availableTokenUnits.toFixed(6)} ${targetSymbol}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a simple transaction for demonstration
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible address
          toPubkey: publicKey,
          lamports: Math.floor(parseFloat(amount) * 1e9), // Convert SOL to lamports
        })
      );

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // For now, let's simulate a successful transaction without actually sending it
      // since we don't have real programs deployed
      console.log('Simulating withdrawal transaction...');
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock transaction signature
      const mockSignature = 'mock_' + Math.random().toString(36).substr(2, 9);
      
      console.log('Withdrawal simulated successfully:', mockSignature);
      
      // Update balances (input in crucible token units)
      const withdrawTokenAmount = parseFloat(amount); // in target token
      
      console.log('WithdrawModal: Processing withdrawal:', {
        withdrawTokenAmount,
        sparkToRemove: withdrawTokenAmount * 10,
        heatToRemove: withdrawTokenAmount * 5
      });
      
      // Remove from crucible balance (simulated)
      subtractFromBalance('SPARK', withdrawTokenAmount * 10);
      subtractFromBalance('HEAT', withdrawTokenAmount * 5);
      
      // Check availability in token units
      if (withdrawTokenAmount > (crucible?.userDeposit || 0)) {
        throw new Error(`Insufficient ${targetSymbol} in crucible to withdraw ${withdrawTokenAmount} ${targetSymbol}`);
      }
      
      // Credit SOL based on USD parity
      const solCredited = (withdrawTokenAmount * price(targetSymbol)) / price('SOL');
      addToBalance('SOL', solCredited);
      
      // Update crucible
      updateCrucibleWithdraw(crucibleId, withdrawTokenAmount);
      
      // Record transaction in analytics (token-aware)
      console.log('Recording withdrawal transaction in analytics:', {
        type: 'withdraw',
        amount: withdrawTokenAmount,
        token: targetSymbol,
        crucibleId,
        signature: mockSignature
      });
      addTransaction({
        type: 'withdraw',
        amount: withdrawTokenAmount,
        token: targetSymbol,
        crucibleId,
        signature: mockSignature
      });
      
      alert(`Withdrawal simulated successfully! Mock Transaction: ${mockSignature}\n\n✅ ${withdrawTokenAmount} ${targetSymbol} withdrawn\n✅ Credited ${(solCredited).toFixed(2)} SOL\n\nNote: This is a demo. In production, this would be a real transaction on Solana testnet.`);
      
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
    setAmount(availableTokenUnits.toFixed(6));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Withdraw from Crucible {crucibleId}</h2>
        
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
              Available: {availableTokenUnits.toFixed(6)} {targetSymbol}
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
              onClick={handleWithdraw}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Withdrawing...' : `Withdraw ${targetSymbol}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
