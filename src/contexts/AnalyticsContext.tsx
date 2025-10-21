import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  token: string; // input token (SOL)
  distToken?: string; // crucible native token for distribution
  crucibleId: string;
  timestamp: number;
  signature?: string;
  apyRewards?: number; // APY rewards earned/withdrawn
  totalWithdrawal?: number; // Total amount including APY rewards
}

interface AnalyticsData {
  totalDeposits: number; // USD
  totalWithdrawals: number; // USD
  totalVolume: number; // USD
  transactionCount: number;
  averageDeposit: number; // USD
  averageWithdrawal: number; // USD
  transactions: Transaction[];
  dailyVolume: { [key: string]: number }; // USD per day
  tokenDistribution: { [key: string]: number }; // token amounts
  totalAPYRewards: number; // Total APY rewards earned (USD)
  totalAPYWithdrawn: number; // Total APY rewards withdrawn (USD)
}

interface AnalyticsContextType {
  analytics: AnalyticsData;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  getDailyStats: (days: number) => any[];
  getTokenStats: () => any[];
  getRecentTransactions: (limit?: number) => Transaction[];
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalVolume: 0,
    transactionCount: 0,
    averageDeposit: 0,
    averageWithdrawal: 0,
    transactions: [],
    dailyVolume: {},
    tokenDistribution: {},
    totalAPYRewards: 0,
    totalAPYWithdrawn: 0
  });

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setAnalytics(prev => {
      const newTransactions = [newTransaction, ...prev.transactions].slice(0, 100); // Keep last 100
      
      const price = (token: string) => ({ SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5 } as any)[token] || 1;
      const toUsd = (tx: Transaction) => tx.amount * price(tx.token);

      const totalDeposits = newTransactions
        .filter(tx => tx.type === 'deposit')
        .reduce((sum, tx) => sum + toUsd(tx), 0);
      
      const totalWithdrawals = newTransactions
        .filter(tx => tx.type === 'withdraw')
        .reduce((sum, tx) => sum + toUsd(tx), 0);

      // Calculate APY rewards tracking
      const totalAPYRewards = newTransactions
        .filter(tx => tx.apyRewards && tx.apyRewards > 0)
        .reduce((sum, tx) => sum + (tx.apyRewards || 0) * price(tx.token), 0);

      const totalAPYWithdrawn = newTransactions
        .filter(tx => tx.type === 'withdraw' && tx.apyRewards && tx.apyRewards > 0)
        .reduce((sum, tx) => sum + (tx.apyRewards || 0) * price(tx.token), 0);
      
      // Net volume = deposits - withdrawals (USD)
      const totalVolume = totalDeposits - totalWithdrawals;
      
      const depositTransactions = newTransactions.filter(tx => tx.type === 'deposit');
      const withdrawalTransactions = newTransactions.filter(tx => tx.type === 'withdraw');
      
      const averageDeposit = depositTransactions.length > 0 
        ? totalDeposits / depositTransactions.length 
        : 0;
      
      const averageWithdrawal = withdrawalTransactions.length > 0 
        ? totalWithdrawals / withdrawalTransactions.length 
        : 0;

      // Calculate daily volume
      const dailyVolume: { [key: string]: number } = {};
      newTransactions.forEach(tx => {
        const date = new Date(tx.timestamp).toISOString().split('T')[0];
        const signed = tx.type === 'deposit' ? toUsd(tx) : -toUsd(tx);
        dailyVolume[date] = (dailyVolume[date] || 0) + signed;
      });

      // Calculate token distribution in USD (DEPOSITS - WITHDRAWS) by token
      const tokenDistribution: { [key: string]: number } = {};
      newTransactions.forEach(tx => {
        const key = tx.distToken || tx.token;
        const signed = (tx.type === 'deposit' ? 1 : -1) * toUsd(tx);
        tokenDistribution[key] = (tokenDistribution[key] || 0) + signed;
      });

      return {
        totalDeposits,
        totalWithdrawals,
        totalVolume,
        transactionCount: newTransactions.length,
        averageDeposit,
        averageWithdrawal,
        transactions: newTransactions,
        dailyVolume,
        tokenDistribution,
        totalAPYRewards,
        totalAPYWithdrawn
      };
    });
  }, []);

  const getDailyStats = useCallback((days: number = 7) => {
    const stats: Array<{ date: string; volume: number; day: string }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const volume = analytics.dailyVolume[dateStr] || 0;
      stats.push({
        date: dateStr,
        volume,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    return stats;
  }, [analytics.dailyVolume]);

  const getTokenStats = useCallback(() => {
    const totalUsd = Object.values(analytics.tokenDistribution).reduce((s, v) => s + v, 0);
    return Object.entries(analytics.tokenDistribution).map(([token, amount]) => ({
      token,
      amount,
      percentage: totalUsd > 0 ? (amount / totalUsd) * 100 : 0
    }));
  }, [analytics.tokenDistribution]);

  const getRecentTransactions = useCallback((limit: number = 10) => {
    const price = (token: string) => ({ SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5 } as any)[token] || 1;
    
    return analytics.transactions
      .slice(0, limit)
      .map(tx => ({
        ...tx,
        usdValue: tx.amount * price(tx.token)
      }));
  }, [analytics.transactions]);

  const value = {
    analytics,
    addTransaction,
    getDailyStats,
    getTokenStats,
    getRecentTransactions
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
