import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TokenBalance {
  symbol: string;
  amount: number;
  usdValue: number;
}

interface BalanceContextType {
  balances: TokenBalance[];
  updateBalance: (symbol: string, amount: number) => void;
  addToBalance: (symbol: string, amount: number) => void;
  subtractFromBalance: (symbol: string, amount: number) => void;
  getBalance: (symbol: string) => number;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

interface BalanceProviderProps {
  children: ReactNode;
}

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children }) => {
  const [balances, setBalances] = useState<TokenBalance[]>([
    { symbol: 'SOL', amount: 1, usdValue: 100 }, // Start with 1 SOL = $100
    { symbol: 'USDC', amount: 0, usdValue: 0 }, // Start with 0 USDC
    { symbol: 'ETH', amount: 0, usdValue: 0 }, // Start with 0 ETH
    { symbol: 'BTC', amount: 0, usdValue: 0 }, // Start with 0 BTC
    { symbol: 'SPARK', amount: 10, usdValue: 10 }, // Start with 10 SPARK = $10
    { symbol: 'HEAT', amount: 5, usdValue: 5 }, // Start with 5 HEAT = $5
  ]);

  const updateBalance = (symbol: string, amount: number) => {
    setBalances(prev => {
      const existingIndex = prev.findIndex(b => b.symbol === symbol);
      if (existingIndex >= 0) {
        const newBalances = [...prev];
        newBalances[existingIndex] = {
          ...newBalances[existingIndex],
          amount,
          usdValue: amount * getTokenPrice(symbol)
        };
        return newBalances;
      } else {
        return [...prev, { symbol, amount, usdValue: amount * getTokenPrice(symbol) }];
      }
    });
  };

  const addToBalance = (symbol: string, amount: number) => {
    console.log(`BalanceContext: Adding ${amount} ${symbol}`);
    setBalances(prev => {
      const existingIndex = prev.findIndex(b => b.symbol === symbol);
      if (existingIndex >= 0) {
        const newBalances = [...prev];
        const newAmount = newBalances[existingIndex].amount + amount;
        newBalances[existingIndex] = {
          ...newBalances[existingIndex],
          amount: newAmount,
          usdValue: newAmount * getTokenPrice(symbol)
        };
        console.log(`BalanceContext: Updated ${symbol} to ${newAmount}`);
        return newBalances;
      } else {
        console.log(`BalanceContext: Added new token ${symbol} with amount ${amount}`);
        return [...prev, { symbol, amount, usdValue: amount * getTokenPrice(symbol) }];
      }
    });
  };

  const subtractFromBalance = (symbol: string, amount: number) => {
    console.log(`BalanceContext: Subtracting ${amount} ${symbol}`);
    setBalances(prev => {
      const existingIndex = prev.findIndex(b => b.symbol === symbol);
      if (existingIndex >= 0) {
        const newBalances = [...prev];
        const newAmount = Math.max(0, newBalances[existingIndex].amount - amount);
        newBalances[existingIndex] = {
          ...newBalances[existingIndex],
          amount: newAmount,
          usdValue: newAmount * getTokenPrice(symbol)
        };
        console.log(`BalanceContext: Updated ${symbol} to ${newAmount}`);
        return newBalances;
      }
      console.log(`BalanceContext: Token ${symbol} not found for subtraction`);
      return prev;
    });
  };

  const getBalance = (symbol: string): number => {
    const balance = balances.find(b => b.symbol === symbol);
    return balance ? balance.amount : 0;
  };

  const getTokenPrice = (symbol: string): number => {
    const prices: { [key: string]: number } = {
      'SOL': 100,
      'USDC': 1,
      'ETH': 2000,
      'BTC': 50000,
      'SPARK': 0.1,
      'HEAT': 0.05,
    };
    return prices[symbol] || 0;
  };

  return (
    <BalanceContext.Provider
      value={{
        balances,
        updateBalance,
        addToBalance,
        subtractFromBalance,
        getBalance,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
