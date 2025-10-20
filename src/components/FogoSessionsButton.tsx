import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

export function FogoSessionsButton() {
  const { connect, connected, publicKey, disconnect } = useWallet();
  const [isEstablishing, setIsEstablishing] = useState(false);

  const handleConnectAndEstablish = async () => {
    if (!connected) {
      // Connect Phantom wallet first
      await connect();
    }
    
    // Then establish FOGO Session
    setIsEstablishing(true);
    
    try {
      console.log('Establishing FOGO Session...');
      
      // Simulate FOGO Session establishment
      setTimeout(() => {
        setIsEstablishing(false);
        console.log('FOGO Session established successfully!');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to establish FOGO Session:', error);
      setIsEstablishing(false);
    }
  };

  if (connected && publicKey) {
    return (
      <div className="flex items-center space-x-4">
        {/* Wallet Info */}
        <div className="text-sm text-gray-300 font-mono">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>

        {/* FOGO Sessions Status */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-orange-900/30 border border-orange-500/50 rounded-lg">
          <span className="text-orange-400 text-sm">🔥</span>
          <span className="text-orange-300 text-sm font-medium">
            {isEstablishing ? 'Establishing...' : 'FOGO Sessions'}
          </span>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnectAndEstablish}
      disabled={isEstablishing}
      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isEstablishing ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔥</span>
          <span>FOGO Sessions</span>
        </div>
      )}
    </button>
  );
}
