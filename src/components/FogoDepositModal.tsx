import React, { useState, useMemo, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useBalance } from '../contexts/BalanceContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useSession } from './FogoSessions';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface FogoDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  crucibleId: string;
}

export const FogoDepositModal: React.FC<FogoDepositModalProps> = ({ isOpen, onClose, crucibleId }) => {
  const { connection, publicKey, sendTransaction, network, switchNetwork, getFogoBalance } = useWallet();
  const { subtractFromBalance, addToBalance } = useBalance();
  const { updateCrucibleDeposit, getCrucible } = useCrucible();
  const { addTransaction } = useAnalytics();
  const fogoSession = useSession();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositMode, setDepositMode] = useState<'simulation' | 'real'>('real'); // Default to real FOGO
  const [fogoBalance, setFogoBalance] = useState<number | null>(null);

  const crucible = getCrucible(crucibleId);
  const targetSymbol = useMemo(() => crucible?.symbol || 'FOGO', [crucible?.symbol]);

  // Fetch FOGO balance when modal opens
  useEffect(() => {
    if (isOpen && publicKey && depositMode === 'real') {
      getFogoBalance().then(balance => {
        setFogoBalance(balance);
      });
    }
  }, [isOpen, publicKey, depositMode, getFogoBalance]);

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

    // Check FOGO balance for real deposits
    if (depositMode === 'real' && fogoBalance !== null && depositAmount > fogoBalance) {
      setError(`Insufficient FOGO balance. You have ${fogoBalance.toFixed(2)} FOGO tokens.`);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (depositMode === 'simulation') {
        // SIMULATION MODE - No real tokens, just testing
        console.log('Simulating FOGO deposit...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockSignature = 'sim_fogo_' + Math.random().toString(36).substr(2, 9);
        
        console.log('Simulated FOGO deposit successful:', mockSignature);

        // Update local state (simulation)
        subtractFromBalance('SOL', depositAmount * 0.5); // Convert FOGO to SOL for simulation
        addToBalance('SPARK', depositAmount * 10);
        addToBalance('HEAT', depositAmount * 5);

        // Update crucible
        updateCrucibleDeposit(crucibleId, depositAmount);

        // Record transaction
        addTransaction({
          type: 'deposit',
          amount: depositAmount,
          token: 'FOGO',
          distToken: targetSymbol,
          crucibleId,
          signature: mockSignature
        });

        alert(`🎮 SIMULATION MODE\n\n✅ ${depositAmount} FOGO simulated deposit\n✅ ${depositAmount * 10} SPARK earned\n✅ ${depositAmount * 5} HEAT earned\n\nTransaction: ${mockSignature}\n\nThis is a test - no real tokens were used!`);

      } else {
        // REAL MODE - Actual FOGO tokens
        if (network !== 'fogo-testnet') {
          switchNetwork('fogo-testnet');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        let signature: string;

        // Use FOGO Sessions if available for gasless transactions (official API)
        if (fogoSession.isEstablished && fogoSession.sendTransaction) {
          console.log('Using official FOGO Sessions for gasless transaction');
          
          // Create transaction instruction for FOGO deposit
          const instruction = SystemProgram.transfer({
            fromPubkey: fogoSession.walletPublicKey,
            toPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible vault
            lamports: Math.floor(depositAmount * LAMPORTS_PER_SOL), // Convert FOGO to lamports
          });

          // Send via official FOGO Sessions (gasless)
          signature = await fogoSession.sendTransaction([instruction]);
          console.log('Official FOGO Sessions transaction successful:', signature);
        } else {
          // Fallback to regular transaction
          console.log('Using regular transaction (no FOGO Sessions)');
          
          const transaction = new Transaction();
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey('11111111111111111111111111111111'), // Mock crucible vault
              lamports: Math.floor(depositAmount * LAMPORTS_PER_SOL), // Convert FOGO to lamports
            })
          );

          signature = await sendTransaction(transaction);
          console.log('Regular transaction successful:', signature);
        }

        // Update local state
        subtractFromBalance('SOL', depositAmount * 0.5); // Convert FOGO to SOL for balance tracking
        addToBalance('SPARK', depositAmount * 10);
        addToBalance('HEAT', depositAmount * 5);

        // Update crucible
        updateCrucibleDeposit(crucibleId, depositAmount);

        // Record transaction
        addTransaction({
          type: 'deposit',
          amount: depositAmount,
          token: 'FOGO',
          distToken: targetSymbol,
          crucibleId,
          signature
        });

        const sessionUsed = fogoSession.isEstablished;
        alert(`🔥 REAL FOGO DEPOSIT\n\n✅ ${depositAmount} FOGO deposited\n✅ ${depositAmount * 10} SPARK earned\n✅ ${depositAmount * 5} HEAT earned\n\n${sessionUsed ? '🚀 Gasless via FOGO Sessions!' : '⛽ Regular transaction'}\n\nTransaction: ${signature}\n\nView on FOGO Explorer: https://fogoscan.com/tx/${signature}?cluster=testnet`);
      }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            Deposit FOGO Tokens - {crucible?.name}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
          {/* Deposit Mode Selection */}
          <div className="p-4 bg-gray-700 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-3">Choose Deposit Mode</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDepositMode('simulation')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  depositMode === 'simulation'
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                    : 'border-gray-600 bg-gray-600/30 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-lg mb-1">🎮</div>
                <div className="text-sm font-medium">Simulation</div>
                <div className="text-xs opacity-75">Test platform</div>
              </button>
              <button
                onClick={() => setDepositMode('real')}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  depositMode === 'real'
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
          {depositMode === 'simulation' ? (
            <div className="p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">🎮 Simulation Mode</h4>
              <div className="text-xs text-blue-200 space-y-1">
                <div>• No real FOGO tokens required</div>
                <div>• Perfect for testing the platform</div>
                <div>• All features work normally</div>
                <div>• Safe to experiment with</div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-orange-900/30 border border-orange-600 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-300 mb-2">🔥 Real FOGO Mode</h4>
              <div className="text-xs text-orange-200 space-y-1">
                <div>• Uses your actual FOGO tokens</div>
                <div>• Requires Fogo testnet connection</div>
                <div>• Real transactions on blockchain</div>
                <div>• Earn actual APY rewards</div>
              </div>
            </div>
          )}

          {/* Network Status */}
          <div className="p-3 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${depositMode === 'real' && network === 'fogo-testnet' ? 'bg-orange-400' : 'bg-blue-400'}`}></div>
              <span className="text-sm text-gray-300">
                {depositMode === 'simulation' 
                  ? 'Simulation Mode - No network required'
                  : `Network: ${network === 'fogo-testnet' ? 'Fogo Testnet' : 'Will switch to Fogo Testnet'}`
                }
              </span>
            </div>
          </div>

          {/* FOGO Token Info */}
          <div className="p-3 bg-purple-900/30 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">FOGO Token Deposit</h4>
            <div className="text-xs text-purple-200 space-y-1">
              <div>• Deposit your FOGO tokens from Phantom wallet</div>
              <div>• Earn SPARK governance tokens</div>
              <div>• Earn HEAT reward tokens</div>
              <div>• APY: {(crucible?.apr || 0.15) * 100}%</div>
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
                <div>Annual APY: {((crucible?.apr || 0.15) * 100).toFixed(1)}%</div>
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
              onClick={handleDeposit}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Depositing...' : depositMode === 'simulation' ? 'Simulate Deposit' : 'Deposit Real FOGO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};