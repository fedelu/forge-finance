import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

// Simulation context
interface SimulationContextType {
  isSimulationMode: boolean;
  simulatedBalance: number;
  simulatedWallet: string;
  setSimulationMode: (enabled: boolean) => void;
  depositTokens: (amount: number) => void;
  withdrawTokens: (amount: number) => void;
  canWithdraw: (amount: number) => boolean;
  getSimulatedBalance: () => number;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};

interface SimulationProviderProps {
  children: ReactNode;
}

export function SimulationProvider({ children }: SimulationProviderProps) {
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [simulatedBalance, setSimulatedBalance] = useState(1000); // Start with 1000 tokens
  const [simulatedWallet] = useState('SimulatedWallet1111111111111111111111111111111111111');

  // Load simulation state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('fogo-simulation-mode');
      const savedBalance = localStorage.getItem('fogo-simulated-balance');
      
      if (savedMode === 'true') {
        setIsSimulationMode(true);
      }
      if (savedBalance) {
        setSimulatedBalance(parseFloat(savedBalance));
      }
    }
  }, []);

  // Save simulation state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('fogo-simulation-mode', isSimulationMode.toString());
      localStorage.setItem('fogo-simulated-balance', simulatedBalance.toString());
    }
  }, [isSimulationMode, simulatedBalance]);

  const setSimulationMode = (enabled: boolean) => {
    setIsSimulationMode(enabled);
    if (enabled) {
      console.log('🎮 Simulation mode enabled - using fake tokens');
    } else {
      console.log('🔗 Real mode enabled - using Phantom wallet');
    }
  };

  const depositTokens = (amount: number) => {
    if (amount > 0) {
      setSimulatedBalance(prev => prev + amount);
      console.log(`💰 Deposited ${amount} simulated tokens. New balance: ${simulatedBalance + amount}`);
    }
  };

  const withdrawTokens = (amount: number) => {
    if (amount > 0 && amount <= simulatedBalance) {
      setSimulatedBalance(prev => prev - amount);
      console.log(`💸 Withdrew ${amount} simulated tokens. New balance: ${simulatedBalance - amount}`);
    }
  };

  const canWithdraw = (amount: number) => {
    return amount > 0 && amount <= simulatedBalance;
  };

  const getSimulatedBalance = () => {
    return simulatedBalance;
  };

  const value = {
    isSimulationMode,
    simulatedBalance,
    simulatedWallet,
    setSimulationMode,
    depositTokens,
    withdrawTokens,
    canWithdraw,
    getSimulatedBalance,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// Simulation mode toggle component
export function SimulationModeToggle() {
  const { isSimulationMode, setSimulationMode, simulatedBalance } = useSimulation();

  return (
    <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Mode:
        </span>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          isSimulationMode 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {isSimulationMode ? '🎮 Simulation' : '🔗 Real Wallet'}
        </span>
      </div>
      
      <button
        onClick={() => setSimulationMode(!isSimulationMode)}
        className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
      >
        Switch
      </button>
      
      {isSimulationMode && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Balance: {simulatedBalance.toFixed(2)} FOGO
        </div>
      )}
    </div>
  );
}
