import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Crucible {
  id: string;
  name: string;
  symbol: string;
  tvl: number;
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
      id: 'usdc-crucible',
      name: 'USDC Crucible',
      symbol: 'USDC',
      tvl: 1_300_000,
      apr: 0.085,
      status: 'active',
      userDeposit: 0, // Start with 0
      userShares: 0, // Start with 0
      icon: '💎'
    },
    {
      id: 'sol-crucible',
      name: 'SOL Crucible',
      symbol: 'SOL',
      tvl: 900_000,
      apr: 0.123,
      status: 'active',
      userDeposit: 0, // Start with 0
      userShares: 0, // Start with 0
      icon: '☀️'
    },
    {
      id: 'eth-crucible',
      name: 'ETH Crucible',
      symbol: 'ETH',
      tvl: 2_100_000,
      apr: 0.067,
      status: 'active',
      userDeposit: 0, // Start with 0
      userShares: 0, // Start with 0
      icon: '🔷'
    },
    {
      id: 'btc-crucible',
      name: 'BTC Crucible',
      symbol: 'BTC',
      tvl: 800_000,
      apr: 0.092,
      status: 'paused',
      userDeposit: 0, // Start with 0
      userShares: 0, // Start with 0
      icon: '₿'
    }
  ]);

  const updateCrucibleDeposit = useCallback((crucibleId: string, amount: number) => {
    console.log(`CrucibleContext: Adding deposit of ${amount} to ${crucibleId}`);
    setCrucibles(prev => {
      return prev.map(crucible => {
        if (crucible.id === crucibleId) {
          const newDeposit = crucible.userDeposit + amount;
          const newShares = crucible.userShares + amount; // 1:1 ratio for simplicity
          const newTVL = crucible.tvl + amount; // Update TVL with deposit
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
          const newTVL = Math.max(0, crucible.tvl - amount); // Update TVL with withdrawal
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
