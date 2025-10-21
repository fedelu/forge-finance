import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const WalletStatusDisplay: React.FC = () => {
  const { walletStatus, connected, publicKey } = useWallet();

  const getStatusIcon = () => {
    if (connected && publicKey) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    
    if (!walletStatus.isInstalled) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
    
    if (!walletStatus.isUnlocked) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    }
    
    return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (connected && publicKey) {
      return `Connected: ${publicKey.toString().slice(0, 8)}...`;
    }
    
    if (!walletStatus.isInstalled) {
      return 'Phantom not installed';
    }
    
    if (!walletStatus.isUnlocked) {
      return 'Wallet locked';
    }
    
    return 'Not connected';
  };

  const getStatusColor = () => {
    if (connected && publicKey) {
      return 'text-green-600';
    }
    
    if (!walletStatus.isInstalled) {
      return 'text-red-600';
    }
    
    if (!walletStatus.isUnlocked) {
      return 'text-yellow-600';
    }
    
    return 'text-gray-600';
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      {getStatusIcon()}
      <span className={getStatusColor()}>
        {getStatusText()}
      </span>
      {walletStatus.error && (
        <span className="text-red-500 text-xs">
          ({walletStatus.error})
        </span>
      )}
    </div>
  );
};

export default WalletStatusDisplay;
