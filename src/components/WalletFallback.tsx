import React from 'react';
import { ExclamationTriangleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface WalletFallbackProps {
  walletStatus: {
    isInstalled: boolean;
    isUnlocked: boolean;
    isAvailable: boolean;
    error?: string;
  };
  onRetry?: () => void;
}

export const WalletFallback: React.FC<WalletFallbackProps> = ({ walletStatus, onRetry }) => {
  const getErrorMessage = () => {
    if (!walletStatus.isInstalled) {
      return {
        title: 'Phantom Wallet Not Installed',
        message: 'Please install Phantom wallet to use this application.',
        action: 'Install Phantom Wallet',
        actionUrl: 'https://phantom.app/download'
      };
    }
    
    if (!walletStatus.isUnlocked) {
      return {
        title: 'Wallet Locked',
        message: 'Please unlock your Phantom wallet and try again.',
        action: 'Retry Connection',
        actionUrl: null
      };
    }
    
    if (walletStatus.error) {
      return {
        title: 'Connection Error',
        message: walletStatus.error,
        action: 'Retry Connection',
        actionUrl: null
      };
    }
    
    return {
      title: 'Wallet Not Available',
      message: 'Unable to connect to your wallet. Please try again.',
      action: 'Retry Connection',
      actionUrl: null
    };
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-orange-500" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {errorInfo.title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {errorInfo.message}
        </p>
        
        <div className="space-y-3">
          {errorInfo.actionUrl ? (
            <a
              href={errorInfo.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {errorInfo.action}
              <ArrowTopRightOnSquareIcon className="ml-2 h-4 w-4" />
            </a>
          ) : (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {errorInfo.action}
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Refresh Page
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>Need help? Check the console for detailed error information.</p>
        </div>
      </div>
    </div>
  );
};

export default WalletFallback;
