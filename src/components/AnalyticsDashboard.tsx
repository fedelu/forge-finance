import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useBalance } from '../contexts/BalanceContext';
import { useSession } from './FogoSessions';
import { DynamicTokenBalances } from './DynamicTokenBalances';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics, getRecentTransactions } = useAnalytics();
  const { balances } = useBalance();
  const { liveAPYEarnings } = useSession();

  const recentTransactions = getRecentTransactions(5);

  // Calculate total APY earnings (live + withdrawn)
  const getTotalAPYEarnings = () => {
    const price = (token: string) => ({ SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5 } as any)[token] || 1;
    
    // Get all withdrawals that have APY rewards (already earned and withdrawn)
    const withdrawnAPY = analytics.transactions
      .filter(tx => tx.type === 'withdraw' && tx.apyRewards && tx.apyRewards > 0)
      .reduce((total, withdrawal) => total + (withdrawal.apyRewards || 0) * price(withdrawal.token), 0);
    
    // Get current live APY earnings (not yet withdrawn)
    const currentAPY = liveAPYEarnings * price('FOGO');
    
    return withdrawnAPY + currentAPY;
  };

  // Calculate 24-hour volume
  const get24HourVolume = () => {
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000);
    
    return analytics.transactions
      .filter(tx => tx.timestamp >= twentyFourHoursAgo)
      .reduce((total, tx) => {
        const price = (token: string) => ({ SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5 } as any)[token] || 1;
        const usdValue = tx.amount * price(tx.token);
        return tx.type === 'deposit' ? total + usdValue : total - usdValue;
      }, 0);
  };

  const volume24h = get24HourVolume();

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
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-fogo-primary/20 rounded-2xl flex items-center justify-center">
          <BanknotesIcon className="h-6 w-6 text-fogo-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-inter-bold text-white mb-2">Portfolio</h1>
          <p className="text-fogo-gray-400 font-inter-light">Track your Forge portfolio performance</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-primary/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-fogo-primary/20 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-fogo-primary" />
            </div>
            <div>
              <p className="text-fogo-gray-400 text-sm font-satoshi-light">APY Earnings</p>
              <p className="text-2xl font-satoshi-bold text-white">{formatCurrency(getTotalAPYEarnings())}</p>
              <p className="text-xs text-fogo-primary mt-1">
                {analytics.totalAPYWithdrawn > 0 ? `${formatCurrency(analytics.totalAPYWithdrawn)} withdrawn` : 'Live earnings'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-success/30">
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

        <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-error/30">
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

        <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-accent/30">
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

        <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-secondary/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-fogo-secondary/20 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-fogo-secondary" />
            </div>
            <div>
              <p className="text-fogo-gray-400 text-sm font-satoshi-light">24h Volume</p>
              <p className="text-2xl font-satoshi-bold text-white">{formatCurrency(volume24h)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio overview moved to DynamicTokenBalances component */}

      {/* Portfolio Overview */}
      <DynamicTokenBalances />


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
                    tx.type === 'deposit' ? 'bg-fogo-success/20 text-fogo-success' : 'bg-fogo-error/20 text-fogo-error'
                  }`}>
                    {tx.type === 'deposit' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - {tx.crucibleId}
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
                    {formatCurrency(tx.usdValue || tx.amount * (tx.token === 'FOGO' ? 0.5 : tx.token === 'SOL' ? 200 : tx.token === 'USDC' ? 1 : tx.token === 'ETH' ? 4000 : 110000))}
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
