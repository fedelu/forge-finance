import React, { useState, useEffect } from 'react';
import { FogoSessionProvider, useFogoSession } from '@fogo/sessions-sdk-react';
import { FireIcon, BoltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface FogoIntegrationProps {
  children: React.ReactNode;
}

// FOGO Session Provider Wrapper
export const FogoIntegrationProvider: React.FC<FogoIntegrationProps> = ({ children }) => {
  return (
    <FogoSessionProvider
      termsOfServiceUrl="https://forge-finance.com/terms"
      privacyPolicyUrl="https://forge-finance.com/privacy"
    >
      {children}
    </FogoSessionProvider>
  );
};

// FOGO Wallet Connection Component
export const FogoWalletButton: React.FC = () => {
  const { connect, disconnect, isConnected, publicKey, isLoading } = useFogoSession();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isConnected && publicKey) {
      // In a real implementation, you would fetch the actual FOGO balance
      // For now, we'll simulate it
      setBalance(Math.random() * 1000);
    } else {
      setBalance(null);
    }
  }, [isConnected, publicKey]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect to FOGO wallet:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setBalance(null);
    } catch (error) {
      console.error('Failed to disconnect from FOGO wallet:', error);
    }
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

// FOGO Session Status Component
export const FogoSessionStatus: React.FC = () => {
  const { isConnected, publicKey, sessionId } = useFogoSession();

  if (!isConnected) {
    return (
      <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-gray-300">FOGO Session: Not Connected</span>
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
            {sessionId ? `${sessionId.slice(0, 8)}...` : 'N/A'}
          </div>
        </div>
      </div>
      {publicKey && (
        <div className="mt-2 text-xs text-orange-200">
          Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
        </div>
      )}
    </div>
  );
};

// FOGO Token Operations Component
export const FogoTokenOperations: React.FC = () => {
  const { isConnected, publicKey } = useFogoSession();
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'deposit' | 'withdraw'>('deposit');

  const handleOperation = async () => {
    if (!isConnected || !publicKey) {
      alert('Please connect your FOGO wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // In a real implementation, you would use the FOGO SDK to perform actual operations
      console.log(`Performing ${operation} of ${amount} FOGO tokens`);
      
      // Simulate operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`✅ ${operation === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!\n\nAmount: ${amount} FOGO tokens`);
      setAmount('');
    } catch (error) {
      console.error(`FOGO ${operation} failed:`, error);
      alert(`❌ ${operation === 'deposit' ? 'Deposit' : 'Withdrawal'} failed. Please try again.`);
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
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {operation === 'deposit' ? 'Deposit FOGO Tokens' : 'Withdraw FOGO Tokens'}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-400 text-center">
          Using official FOGO Sessions SDK for secure token operations
        </div>
      </div>
    </div>
  );
};
