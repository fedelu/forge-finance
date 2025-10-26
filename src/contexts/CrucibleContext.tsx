import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Crucible {
  id: string;
  name: string;
  symbol: string;
  tvl: number; // USD
  apr: number;
  status: 'active' | 'paused' | 'maintenance';
  userDeposit: number;
  userShares: number;
  icon: string;
}

interface CrucibleContextType {
  crucibles: Crucible[];
  updateCrucibleDeposit: (crucibleId: string, amount: number) => void;
  updateCrucibleWithdraw: (crucibleId: string, amount: number) => void;
  getCrucible: (crucibleId: string) => Crucible | undefined;
  addCrucible: (crucible: Crucible) => void;
}

const CrucibleContext = createContext<CrucibleContextType | undefined>(undefined);

export const useCrucible = () => {
  const context = useContext(CrucibleContext);
  if (!context) {
    throw new Error('useCrucible must be used within a CrucibleProvider');
  }
  return context;
};

interface CrucibleProviderProps {
  children: ReactNode;
}

export const CrucibleProvider: React.FC<CrucibleProviderProps> = ({ children }) => {
  const [crucibles, setCrucibles] = useState<Crucible[]>([
    {
      id: 'fogo-stable-crucible',
      name: 'FOGO Stable',
      symbol: 'FOGO',
      tvl: 2_500_000,
      apr: 0.12, // 12% APY - Stable strategy
      status: 'active',
      userDeposit: 0,
      userShares: 0,
      icon: '🔥'
    },
    {
      id: 'fogo-growth-crucible',
      name: 'FOGO Growth',
      symbol: 'FOGO',
      tvl: 1_800_000,
      apr: 0.18, // 18% APY - Growth strategy
      status: 'active',
      userDeposit: 0,
      userShares: 0,
      icon: '🚀'
    },
    {
      id: 'fogo-premium-crucible',
      name: 'FOGO Premium',
      symbol: 'FOGO',
      tvl: 3_200_000,
      apr: 0.15, // 15% APY - Premium strategy
      status: 'active',
      userDeposit: 0,
      userShares: 0,
      icon: '💎'
    },
    {
      id: 'fogo-yield-crucible',
      name: 'FOGO Yield',
      symbol: 'FOGO',
      tvl: 1_500_000,
      apr: 0.22, // 22% APY - High yield strategy
      status: 'active',
      userDeposit: 0,
      userShares: 0,
      icon: '⚡'
    },
    {
      id: 'fogo-defi-crucible',
      name: 'FOGO DeFi',
      symbol: 'FOGO',
      tvl: 900_000,
      apr: 0.25, // 25% APY - DeFi strategy
      status: 'active',
      userDeposit: 0,
      userShares: 0,
      icon: '🏦'
    }
  ]);

  const price = (symbol: string) => ({ SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5, FORGE: 0.002 } as any)[symbol] || 1;

  const updateCrucibleDeposit = useCallback((crucibleId: string, amount: number) => {
    console.log(`CrucibleContext: Adding deposit of ${amount} to ${crucibleId}`);
    setCrucibles(prev => {
      return prev.map(crucible => {
        if (crucible.id === crucibleId) {
          const newDeposit = crucible.userDeposit + amount;
          const newShares = crucible.userShares + amount; // 1:1 ratio for simplicity
          const newTVL = crucible.tvl + amount * price(crucible.symbol); // TVL in USD
          console.log(`CrucibleContext: Updated ${crucibleId} - deposit: ${newDeposit}, shares: ${newShares}, TVL: ${newTVL}`);
          return {
            ...crucible,
            userDeposit: newDeposit,
            userShares: newShares,
            tvl: newTVL
          };
        }
        return crucible;
      });
    });
  }, []);

  const updateCrucibleWithdraw = useCallback((crucibleId: string, amount: number) => {
    console.log(`CrucibleContext: Withdrawing ${amount} from ${crucibleId}`);
    setCrucibles(prev => {
      return prev.map(crucible => {
        if (crucible.id === crucibleId) {
          const newDeposit = Math.max(0, crucible.userDeposit - amount);
          const newShares = Math.max(0, crucible.userShares - amount);
          const newTVL = Math.max(0, crucible.tvl - amount * price(crucible.symbol)); // TVL in USD
          console.log(`CrucibleContext: Updated ${crucibleId} - deposit: ${newDeposit}, shares: ${newShares}, TVL: ${newTVL}`);
          return {
            ...crucible,
            userDeposit: newDeposit,
            userShares: newShares,
            tvl: newTVL
          };
        }
        return crucible;
      });
    });
  }, []);

  const getCrucible = useCallback((crucibleId: string) => {
    return crucibles.find(c => c.id === crucibleId);
  }, [crucibles]);

  const addCrucible = useCallback((crucible: Crucible) => {
    setCrucibles(prev => {
      // Check if crucible already exists
      if (prev.find(c => c.id === crucible.id)) {
        return prev;
      }
      return [crucible, ...prev];
    });
    console.log('Crucible added:', crucible);
  }, []);

  const value = {
    crucibles,
    updateCrucibleDeposit,
    updateCrucibleWithdraw,
    getCrucible,
    addCrucible,
  };

  return (
    <CrucibleContext.Provider value={value}>
      {children}
    </CrucibleContext.Provider>
  );
};
