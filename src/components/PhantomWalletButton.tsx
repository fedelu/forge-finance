import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface PhantomWalletButtonProps {
  className?: string;
}

export const PhantomWalletButton: React.FC<PhantomWalletButtonProps> = ({ className = '' }) => {
  const { connected, connecting, connect, disconnect, publicKey, getFogoBalance, network, switchNetwork } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [fogoBalance, setFogoBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Fetch FOGO balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      setLoadingBalance(true);
      getFogoBalance().then(balance => {
        setFogoBalance(balance);
        setLoadingBalance(false);
      }).catch(() => {
        setLoadingBalance(false);
      });
    } else {
      setFogoBalance(null);
    }
  }, [connected, publicKey, getFogoBalance]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please make sure Phantom wallet is installed.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setFogoBalance(null);
  };

  const handleSwitchToFogo = () => {
    switchNetwork('fogo-testnet');
    // Refresh balance after switching
    setTimeout(() => {
      if (connected && publicKey) {
        getFogoBalance().then(balance => {
          setFogoBalance(balance);
        });
      }
    }, 1000);
  };

  if (connected && publicKey) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        {/* Network Indicator - Always FOGO */}
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-sm font-medium text-orange-300">FOGO</span>
        </div>

        {/* Wallet Address */}
        <div className="text-sm text-gray-300 font-mono">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>

        {/* FOGO Balance Display (like Pyron.fi) */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-orange-900/30 border border-orange-500/50 rounded-lg">
          <span className="text-orange-400 text-sm">🔥</span>
          <span className="text-orange-300 text-sm font-medium">
            {loadingBalance ? '...' : fogoBalance !== null ? `${fogoBalance.toFixed(2)} FOGO` : '0 FOGO'}
          </span>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={handleDisconnect}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting || isConnecting}
      className={`px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {connecting || isConnecting ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span>👻</span>
          <span>Connect Phantom</span>
        </div>
      )}
    </button>
  );
};
