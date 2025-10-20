import React, { useState, useEffect } from 'react';
import { FireIcon, BoltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

// Simplified FOGO integration without the React SDK to avoid version conflicts
interface FogoIntegrationProps {
  children: React.ReactNode;
}

// FOGO Session Provider Wrapper (simplified)
export const FogoIntegrationProvider: React.FC<FogoIntegrationProps> = ({ children }) => {
  return <>{children}</>;
};

// FOGO Wallet Connection Component (simplified)
export const FogoWalletButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    // Check if FOGO wallet is available
    if (typeof window !== 'undefined' && (window as any).fogo) {
      // Mock connection status
      setIsConnected(false);
    }
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Simulate FOGO wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      setBalance(Math.random() * 1000);
      console.log('Connected to FOGO wallet (simulated)');
    } catch (error) {
      console.error('Failed to connect to FOGO wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setBalance(null);
    console.log('Disconnected from FOGO wallet');
  };

  if (isLoading) {
    return (
      <button className="btn-primary flex items-center space-x-2" disabled>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span>Connecting...</span>
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm text-gray-400">FOGO Balance</div>
          <div className="text-lg font-semibold text-orange-400">
            {balance ? `${balance.toFixed(2)} FOGO` : 'Loading...'}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="btn-secondary flex items-center space-x-2"
        >
          <FireIcon className="h-4 w-4" />
          <span>Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="btn-primary flex items-center space-x-2"
    >
      <FireIcon className="h-4 w-4" />
      <span>Connect FOGO Wallet</span>
    </button>
  );
};

// FOGO Session Status Component (simplified)
export const FogoSessionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status
    setIsConnected(false); // Default to disconnected for demo
  }, []);

  if (!isConnected) {
    return (
      <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-gray-300">FOGO Session: Not Connected</span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Click "Connect FOGO Wallet" to start using FOGO features
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-orange-900/30 border border-orange-600 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span className="text-orange-300">FOGO Session: Connected</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-orange-200">Session ID</div>
          <div className="text-sm font-mono text-orange-300">
            {Math.random().toString(36).substr(2, 8)}...
          </div>
        </div>
      </div>
    </div>
  );
};

// FOGO Token Operations Component (simplified)
export const FogoTokenOperations: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'deposit' | 'withdraw'>('deposit');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check connection status
    setIsConnected(false); // Default to disconnected for demo
  }, []);

  const handleOperation = async () => {
    if (!isConnected) {
      alert('Please connect your FOGO wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // Simulate FOGO operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`✅ ${operation === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!\n\nAmount: ${amount} FOGO tokens\n\nNote: This is a simulated transaction for demo purposes.`);
      setAmount('');
    } catch (error) {
      console.error(`FOGO ${operation} failed:`, error);
      alert(`❌ ${operation === 'deposit' ? 'Deposit' : 'Withdrawal'} failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-gray-800 border border-gray-600 rounded-lg text-center">
        <FireIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Connect FOGO Wallet</h3>
        <p className="text-gray-400">Connect your FOGO wallet to start depositing and withdrawing tokens</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg">
      <div className="flex items-center space-x-3 mb-6">
        <FireIcon className="h-6 w-6 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">🔥 FOGO Token Operations</h3>
      </div>

      <div className="space-y-4">
        {/* Operation Type Selection */}
        <div className="flex space-x-2">
          <button
            onClick={() => setOperation('deposit')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              operation === 'deposit'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Deposit FOGO
          </button>
          <button
            onClick={() => setOperation('withdraw')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              operation === 'withdraw'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Withdraw FOGO
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (FOGO)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            placeholder="0.0"
          />
        </div>

        {/* Operation Button */}
        <button
          onClick={handleOperation}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `${operation === 'deposit' ? 'Deposit' : 'Withdraw'} FOGO Tokens`}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-400 text-center">
          Demo mode - Simulated FOGO token operations
        </div>
      </div>
    </div>
  );
};

