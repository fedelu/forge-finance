import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useBalance } from '../contexts/BalanceContext';
import { useSession } from './FogoSessions';
import { useCrucible } from '../hooks/useCrucible';
import { formatNumberWithCommas, getCTokenPrice, RATE_SCALE } from '../utils/math';
import CTokenPortfolio from './CTokenPortfolio';
// import { DynamicTokenBalances } from './DynamicTokenBalances'; // Temporarily disabled
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics, getRecentTransactions } = useAnalytics();
  const { balances } = useBalance();
  const { liveAPYEarnings, walletPublicKey } = useSession();
  const { crucibles, userBalances } = useCrucible();

  const recentTransactions = getRecentTransactions(5);

  // Calculate annual APY earnings based on cToken holdings and leveraged positions
  const getTotalAPYEarnings = () => {
    const price = (token: string) => ({ SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5, FORGE: 0.002 } as any)[token] || 1;
    
    // Calculate APY earnings from cToken holdings
    let totalAPYEarnings = 0;
    
    crucibles.forEach(crucible => {
      const userBalance = userBalances[crucible.id];
      if (userBalance && userBalance.ptokenBalance > 0) {
        // Calculate the value of cTokens in base token units
        const cTokenValue = Number(userBalance.ptokenBalance) / 1e9; // Convert from BigInt to number
        const baseTokenValue = cTokenValue * price(crucible.baseToken);
        
        // Calculate annual APY earnings (APY rate * value)
        const annualAPY = baseTokenValue * (crucible.apr || 0);
        totalAPYEarnings += annualAPY;
      }
    });
    
    // Also include APY earnings from leveraged positions (3x the base APY)
    try {
      if (walletPublicKey) {
        const leveragedPositions = JSON.parse(localStorage.getItem('leveraged_positions') || '[]');
        let currentWalletAddress: string | null = null;
        if (walletPublicKey) {
          if (typeof walletPublicKey === 'string') {
            currentWalletAddress = walletPublicKey;
          } else if (walletPublicKey.toBase58) {
            currentWalletAddress = walletPublicKey.toBase58();
          } else if (walletPublicKey.toString) {
            currentWalletAddress = walletPublicKey.toString();
          }
        }
        
        if (currentWalletAddress) {
          leveragedPositions.forEach((position: any) => {
            if (position.isOpen && position.owner === currentWalletAddress) {
              const baseTokenPrice = position.token === 'FOGO' ? 0.5 : 0.002;
              const collateralValueUSD = position.collateral * baseTokenPrice;
              // Find the crucible for this position
              const crucible = crucibles.find(c => c.baseToken === position.token);
              if (crucible) {
                // Leveraged positions earn 3x the base APY
                const leveragedAPY = collateralValueUSD * (crucible.apr || 0) * 3;
                totalAPYEarnings += leveragedAPY;
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to calculate leveraged position APY:', e);
    }
    
    return totalAPYEarnings;
  };

  // Calculate total borrowed USDC from leveraged positions
  const getTotalBorrowed = () => {
    try {
      if (!walletPublicKey) {
        return 0;
      }
      
      const leveragedPositions = JSON.parse(localStorage.getItem('leveraged_positions') || '[]');
      
      // Get current wallet address in base58 format
      let currentWalletAddress: string | null = null;
      if (walletPublicKey) {
        if (typeof walletPublicKey === 'string') {
          currentWalletAddress = walletPublicKey;
        } else if (walletPublicKey.toBase58) {
          currentWalletAddress = walletPublicKey.toBase58();
        } else if (walletPublicKey.toString) {
          currentWalletAddress = walletPublicKey.toString();
        }
      }
      
      if (!currentWalletAddress) {
        return 0;
      }
      
      const totalBorrowed = leveragedPositions
        .filter((position: any) => {
          // Only count open positions for current wallet
          const isOpen = position.isOpen === true;
          const isOwner = position.owner === currentWalletAddress;
          return isOpen && isOwner;
        })
        .reduce((sum: number, position: any) => {
          return sum + (position.borrowedUSDC || 0);
        }, 0);
      return totalBorrowed;
    } catch (e) {
      console.warn('Failed to calculate total borrowed:', e);
      return 0;
    }
  };


  // Update APY earnings when transactions change or every minute for real-time display

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const getTotalPortfolioValue = () => {
    return balances.reduce((total, balance) => total + balance.usdValue, 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-inter-bold text-white mb-2">Portfolio</h1>
        <p className="text-fogo-gray-400 font-inter-light">Track your Forge portfolio performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-stretch">
        <div className="bg-fogo-gray-900 rounded-2xl p-8 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-primary/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-fogo-primary/20 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-fogo-primary" />
            </div>
            <div>
              <p className="text-fogo-gray-400 text-sm font-satoshi-light">APY Earnings</p>
              <p className="text-2xl font-satoshi-bold text-white">{formatCurrency(getTotalAPYEarnings())}</p>
              <p className="text-xs text-fogo-primary mt-1">
                Annual APY based on cToken holdings
              </p>
            </div>
          </div>
        </div>

        <div className="bg-fogo-gray-900 rounded-2xl p-8 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-success/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-fogo-success/20 rounded-xl flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-fogo-success" />
            </div>
            <div>
              <p className="text-fogo-gray-400 text-sm font-satoshi-light">Total Deposits</p>
              <p className="text-2xl font-satoshi-bold text-white">{formatCurrency(analytics.totalDeposits)}</p>
            </div>
          </div>
        </div>

        <div className="bg-fogo-gray-900 rounded-2xl p-8 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-error/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-fogo-error/20 rounded-xl flex items-center justify-center">
              <ArrowDownIcon className="h-6 w-6 text-fogo-error" />
            </div>
            <div>
              <p className="text-fogo-gray-400 text-sm font-satoshi-light">Total Withdrawals</p>
              <p className="text-2xl font-satoshi-bold text-white">{formatCurrency(analytics.totalWithdrawals)}</p>
            </div>
          </div>
        </div>

        <div className="bg-fogo-gray-900 rounded-2xl p-8 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-orange-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <p className="text-fogo-gray-400 text-sm font-satoshi-light">Borrowed</p>
              <p className="text-2xl font-satoshi-bold text-white">{formatCurrency(getTotalBorrowed())}</p>
              <p className="text-xs text-orange-400 mt-1">
                Total USDC borrowed from lending pool
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Portfolio overview moved to DynamicTokenBalances component */}

      {/* cToken Portfolio Overview */}
      <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo">
        <CTokenPortfolio />
      </div>


      {/* Recent Transactions */}
      <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-fogo-secondary/20 rounded-xl flex items-center justify-center">
            <ChartBarIcon className="h-5 w-5 text-fogo-secondary" />
          </div>
          <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-fogo-gray-800 rounded-xl hover:bg-fogo-gray-700 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    (tx.type === 'deposit' || tx.type === 'wrap') ? 'bg-fogo-success/20 text-fogo-success' : 'bg-fogo-error/20 text-fogo-error'
                  }`}>
                    {(tx.type === 'deposit' || tx.type === 'wrap') ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {(() => {
                        if (tx.type === 'deposit' || tx.type === 'wrap') {
                          // Check if this is an LP position deposit
                          const lpTokens = ['cFOGO/USDC LP', 'cFORGE/USDC LP', 'FOGO/USDC LP', 'FORGE/USDC LP']
                          return 'LP Position';
                        }
                        if (tx.type === 'withdraw' || tx.type === 'unwrap') return 'Withdrawal';
                        return tx.type;
                      })()} - {tx.crucibleId}
                    </p>
                    <p className="text-fogo-gray-400 text-sm">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                    {tx.borrowedAmount && tx.borrowedAmount > 0 && (
                      <p className="text-orange-400 text-xs font-medium mt-1">
                        Borrowed: {tx.borrowedAmount.toFixed(2)} USDC ({tx.leverage}x leverage)
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {tx.amount.toFixed(2)} {tx.token}
                    {tx.usdcDeposited && tx.usdcDeposited > 0 && (
                      <span className="text-fogo-primary ml-2">+ {tx.usdcDeposited.toFixed(2)} USDC</span>
                    )}
                    {tx.usdcReceived && tx.usdcReceived > 0 && (
                      <span className="text-fogo-primary ml-2">+ {tx.usdcReceived.toFixed(2)} USDC</span>
                    )}
                  </p>
                  <p className="text-fogo-gray-400 text-sm">
                    {formatCurrency(tx.usdValue || tx.amount * (tx.token === 'FOGO' ? 0.5 : tx.token === 'FORGE' ? 0.002 : tx.token === 'SOL' ? 200 : tx.token === 'USDC' ? 1 : tx.token === 'ETH' ? 4000 : 110000))}
                  </p>
                  {tx.borrowedAmount && tx.borrowedAmount > 0 && (
                    <p className="text-orange-400 text-xs font-medium mt-1">
                      + {formatCurrency(tx.borrowedAmount)} borrowed
                    </p>
                  )}
                  {tx.signature && (
                    <p className="text-fogo-gray-500 text-xs font-mono mt-1">
                      {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-fogo-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BanknotesIcon className="h-8 w-8 text-fogo-primary" />
              </div>
              <p className="text-fogo-gray-300 text-lg mb-2">No transactions yet</p>
              <p className="text-fogo-gray-500 text-sm">Make your first deposit to see analytics!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
