import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useBalance } from '../contexts/BalanceContext';
import { useSession } from './FogoSessions';
import { useCrucible } from '../hooks/useCrucible';
import { formatNumberWithCommas, getCTokenPrice, RATE_SCALE } from '../utils/math';
// import { DynamicTokenBalances } from './DynamicTokenBalances'; // Temporarily disabled
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics, getRecentTransactions } = useAnalytics();
  const { balances } = useBalance();
  const { liveAPYEarnings } = useSession();
  const { crucibles, userBalances } = useCrucible();

  const recentTransactions = getRecentTransactions(5);

  // Calculate annual APY earnings based on cToken holdings
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
    
    return totalAPYEarnings;
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

        <div className="bg-fogo-gray-900 rounded-2xl p-8 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-accent/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-fogo-accent/20 rounded-xl flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-fogo-accent" />
            </div>
            <div>
              <p className="text-fogo-gray-400 text-sm font-satoshi-light">Transactions</p>
              <p className="text-2xl font-satoshi-bold text-white">{analytics.transactionCount}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Portfolio overview moved to DynamicTokenBalances component */}

      {/* pToken Portfolio Overview */}
      <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-fogo-primary/20 rounded-xl flex items-center justify-center">
            <BanknotesIcon className="h-6 w-6 text-fogo-primary" />
          </div>
          <div>
            <h3 className="text-xl font-inter-bold text-white">cToken Portfolio</h3>
            <p className="text-fogo-gray-400 text-sm">Your yield-bearing cTokens backed by FOGO & FORGE</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crucibles.map((crucible) => {
            // Get user's actual cToken holdings from userBalances
            const userBalanceData = userBalances[crucible.id];
            const cTokenHoldings = userBalanceData ? Number(userBalanceData.ptokenBalance) / 1e9 : 0;
            
            // Calculate annual APY earnings based on cToken holdings
            const baseTokenPrice = crucible.baseToken === 'FOGO' ? 0.5 : 0.002; // FOGO = $0.50, FORGE = $0.002
            // Use dynamic pricing based on whether there are deposits in the crucible
            const hasDeposits = (crucible.totalWrapped || BigInt(0)) > BigInt(0);
            const exchangeRate = hasDeposits ? (crucible.exchangeRate || RATE_SCALE) : RATE_SCALE;
            const cTokenPrice = getCTokenPrice(baseTokenPrice, exchangeRate);
            const holdingsValueUSD = cTokenHoldings * cTokenPrice; // Current accumulated value of cTokens
            const annualAPYEarnings = holdingsValueUSD * (crucible.apr || 0);
            
            // Calculate total value = current holdings value in USD (after accumulation)
            const totalValueUSD = holdingsValueUSD;
            
            return (
              <div key={crucible.id} className="bg-fogo-gray-800 rounded-xl p-6 border border-fogo-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {crucible.icon.startsWith('/') ? (
                      <img 
                        src={crucible.icon} 
                        alt={`${crucible.name} icon`} 
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{crucible.icon}</span>
                    )}
                    <div>
                      <h4 className="font-inter-bold text-white text-lg">{crucible.name}</h4>
                      <p className="text-fogo-gray-400 text-sm">{crucible.baseToken} → {crucible.ptokenSymbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-fogo-primary font-inter-bold text-lg">
                      {crucible.currentAPY?.toFixed(1) || '0.0'}% APY
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-fogo-gray-400">cToken Holdings:</span>
                    <span className="text-fogo-accent font-medium text-base">
                      {formatNumberWithCommas(cTokenHoldings)} {crucible.ptokenSymbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fogo-gray-400">Value (1 year accumulated):</span>
                    <span className="text-white font-medium">
                      ${holdingsValueUSD.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fogo-gray-400">Annual APY earnings:</span>
                    <span className="text-fogo-primary font-medium">
                      ${annualAPYEarnings.toFixed(2)} USD/year
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-fogo-gray-700 pt-3">
                    <span className="text-fogo-gray-300 font-medium">Total Value:</span>
                    <div className="text-right">
                      <div className="text-fogo-accent font-bold text-lg">
                        ${formatNumberWithCommas(holdingsValueUSD)} USD
                      </div>
                      <div className="text-fogo-gray-400 text-sm">
                        + ${formatNumberWithCommas(annualAPYEarnings)} annual APY
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-fogo-gray-400">Yield Status:</span>
                    <span className={`font-medium ${cTokenHoldings > 0 ? 'text-fogo-success' : 'text-fogo-gray-500'}`}>
                      {cTokenHoldings > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
                        if (tx.type === 'deposit' || tx.type === 'wrap') return 'Deposit';
                        if (tx.type === 'withdraw' || tx.type === 'unwrap') return 'Withdrawal';
                        return tx.type;
                      })()} - {tx.crucibleId}
                    </p>
                    <p className="text-fogo-gray-400 text-sm">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {tx.amount.toFixed(2)} {tx.token}
                  </p>
                  <p className="text-fogo-gray-400 text-sm">
                    {formatCurrency(tx.usdValue || tx.amount * (tx.token === 'FOGO' ? 0.5 : tx.token === 'FORGE' ? 0.002 : tx.token === 'SOL' ? 200 : tx.token === 'USDC' ? 1 : tx.token === 'ETH' ? 4000 : 110000))}
                  </p>
                  {tx.signature && (
                    <p className="text-fogo-gray-500 text-xs font-mono">
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
