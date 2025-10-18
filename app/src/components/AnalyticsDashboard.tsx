import React from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useBalance } from '../contexts/BalanceContext';
import { DynamicTokenBalances } from './DynamicTokenBalances';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

export const AnalyticsDashboard: React.FC = () => {
  const { analytics, getDailyStats, getTokenStats, getRecentTransactions } = useAnalytics();
  const { balances } = useBalance();

  const dailyStats = getDailyStats(7);
  const tokenStats = getTokenStats();
  const recentTransactions = getRecentTransactions(5);

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
        <ChartBarIcon className="h-8 w-8 text-forge-primary" />
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-r from-forge-primary/20 to-forge-accent/20 border-forge-primary">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-8 w-8 text-forge-primary" />
            <div>
              <p className="text-gray-400 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalVolume)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Deposits</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalDeposits)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500">
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="h-8 w-8 text-red-400 rotate-180" />
            <div>
              <p className="text-gray-400 text-sm">Total Withdrawals</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalWithdrawals)}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-white">{analytics.transactionCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio overview moved to DynamicTokenBalances component */}

      {/* Portfolio Overview */}
      <DynamicTokenBalances />

      {/* Daily Volume Chart */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">7-Day Volume</h3>
        <div className="space-y-4">
          {dailyStats.map((stat, index) => (
            <div key={stat.date} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 text-sm text-gray-400">{stat.day}</div>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-forge-primary to-forge-accent h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.max(5, (stat.volume / Math.max(...dailyStats.map(s => s.volume), 1)) * 100)}%` 
                    }}
                  />
                </div>
              </div>
              <div className="text-sm font-medium text-white w-20 text-right">
                {formatCurrency(stat.volume)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Distribution */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Token Distribution</h3>
        <div className="space-y-3">
          {tokenStats.map((stat, index) => (
            <div key={stat.token} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-forge-gray rounded-full flex items-center justify-center text-sm font-bold">
                  {stat.token.charAt(0)}
                </div>
                <span className="text-white font-medium">{stat.token}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  {formatNumber(stat.amount)} ({formatNumber(stat.percentage)}%)
                </div>
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-forge-primary to-forge-accent h-2 rounded-full"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-forge-gray rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.type === 'deposit' ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'} - {tx.crucibleId}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {formatCurrency(tx.amount)} {tx.token}
                  </p>
                  {tx.signature && (
                    <p className="text-gray-400 text-xs font-mono">
                      {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FireIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500">Make your first deposit to see analytics!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
