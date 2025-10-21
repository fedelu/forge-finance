import React from 'react';
import { usePhantomWallet } from '../hooks/usePhantomWallet';
import { initFogoSession } from '../lib/fogoSessionInit';

export const PhantomWalletButton: React.FC = () => {
  const {
    provider,
    publicKey,
    connected,
    connecting,
    error,
    isInstalled,
    isUnlocked,
    connect,
    disconnect,
    signMessage,
    clearError
  } = usePhantomWallet();

  const handleConnect = async () => {
    try {
      console.log('🚀 PhantomWalletButton: Starting connection...');
      await connect();
      
      // Initialize Fogo Session after successful connection
      if (provider && publicKey) {
        console.log('🔥 PhantomWalletButton: Initializing Fogo Session...');
        const sessionResult = await initFogoSession(provider);
        
        if (sessionResult.success) {
          console.log('✅ PhantomWalletButton: Fogo Session initialized:', sessionResult.sessionId);
        } else {
          console.error('❌ PhantomWalletButton: Fogo Session failed:', sessionResult.error);
        }
      }
    } catch (error) {
      console.error('❌ PhantomWalletButton: Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('🔌 PhantomWalletButton: Disconnecting...');
      await disconnect();
    } catch (error) {
      console.error('❌ PhantomWalletButton: Disconnect failed:', error);
    }
  };

  const handleSignMessage = async () => {
    if (!connected || !publicKey) {
      console.error('❌ PhantomWalletButton: Not connected, cannot sign message');
      return;
    }

    try {
      const message = `Hello from Forge Finance! Timestamp: ${Date.now()}`;
      console.log('✍️ PhantomWalletButton: Signing test message...');
      
      const signature = await signMessage(message);
      
      if (signature) {
        console.log('✅ PhantomWalletButton: Message signed successfully');
        console.log('📊 PhantomWalletButton: Signature length:', signature.length);
        console.log('📄 PhantomWalletButton: Message:', message);
      } else {
        console.error('❌ PhantomWalletButton: Signing failed');
      }
    } catch (error) {
      console.error('❌ PhantomWalletButton: Sign message failed:', error);
    }
  };

  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected) return 'Disconnect';
    if (!isInstalled) return 'Install Phantom';
    if (!isUnlocked) return 'Unlock Phantom';
    return 'Connect Phantom';
  };

  const getButtonColor = () => {
    if (connected) return 'bg-red-600 hover:bg-red-700';
    if (!isInstalled || !isUnlocked) return 'bg-gray-600 hover:bg-gray-700';
    return 'bg-purple-600 hover:bg-purple-700';
  };

  const isButtonDisabled = () => {
    return connecting || (!isInstalled && !connected);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900">Phantom Wallet Connection</h3>
      
      {/* Status Display */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {publicKey && (
          <div className="text-sm text-gray-600">
            <strong>Address:</strong> {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </div>
        )}
        
        {!isInstalled && (
          <div className="text-sm text-red-600">
            Phantom wallet not installed. 
            <a 
              href="https://phantom.app/download" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-1 text-blue-600 hover:underline"
            >
              Install here
            </a>
          </div>
        )}
        
        {isInstalled && !isUnlocked && (
          <div className="text-sm text-yellow-600">
            Phantom wallet is locked. Please unlock it and try again.
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-600">{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={connected ? handleDisconnect : handleConnect}
          disabled={isButtonDisabled()}
          className={`w-full px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonColor()}`}
        >
          {getButtonText()}
        </button>
        
        {connected && (
          <button
            onClick={handleSignMessage}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Sign Message
          </button>
        )}
      </div>

      {/* Debug Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>Installed: {isInstalled ? 'Yes' : 'No'}</div>
        <div>Unlocked: {isUnlocked ? 'Yes' : 'No'}</div>
        <div>Connected: {connected ? 'Yes' : 'No'}</div>
        <div>Connecting: {connecting ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
};

export default PhantomWalletButton;