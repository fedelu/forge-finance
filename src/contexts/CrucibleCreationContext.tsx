import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useCrucible } from './CrucibleContext';

export interface CrucibleTemplate {
  id: string;
  name: string;
  symbol: string;
  description: string;
  icon: string;
  minDeposit: number;
  maxDeposit: number;
  apr: number;
  lockPeriod: number; // in days
  fees: {
    deposit: number; // percentage
    withdrawal: number; // percentage
    performance: number; // percentage
  };
  requirements: {
    minBalance: number;
    kycRequired: boolean;
    whitelistOnly: boolean;
  };
}

interface CrucibleCreationContextType {
  templates: CrucibleTemplate[];
  createCrucible: (template: CrucibleTemplate) => void;
  getTemplates: () => CrucibleTemplate[];
  getTemplateById: (id: string) => CrucibleTemplate | undefined;
}

const CrucibleCreationContext = createContext<CrucibleCreationContextType | undefined>(undefined);

export const useCrucibleCreation = () => {
  const context = useContext(CrucibleCreationContext);
  if (!context) {
    throw new Error('useCrucibleCreation must be used within a CrucibleCreationProvider');
  }
  return context;
};

interface CrucibleCreationProviderProps {
  children: ReactNode;
}

export const CrucibleCreationProvider: React.FC<CrucibleCreationProviderProps> = ({ children }) => {
  const { crucibles, addCrucible } = useCrucible();
  const [templates] = useState<CrucibleTemplate[]>([
    {
      id: 'template_1',
      name: 'High Yield SOL',
      symbol: 'SOL',
      description: 'High yield SOL crucible with 15% APR for long-term holders',
      icon: '☀️',
      minDeposit: 1,
      maxDeposit: 1000,
      apr: 0.15,
      lockPeriod: 30,
      fees: {
        deposit: 0.5,
        withdrawal: 1.0,
        performance: 10
      },
      requirements: {
        minBalance: 0.1,
        kycRequired: false,
        whitelistOnly: false
      }
    },
    {
      id: 'template_2',
      name: 'Stable USDC',
      symbol: 'USDC',
      description: 'Stable USDC crucible with 8% APR and low risk',
      icon: '💎',
      minDeposit: 100,
      maxDeposit: 10000,
      apr: 0.08,
      lockPeriod: 7,
      fees: {
        deposit: 0.1,
        withdrawal: 0.5,
        performance: 5
      },
      requirements: {
        minBalance: 1,
        kycRequired: false,
        whitelistOnly: false
      }
    },
    {
      id: 'template_3',
      name: 'Premium ETH',
      symbol: 'ETH',
      description: 'Premium ETH crucible with 12% APR and 60-day lock',
      icon: '🔷',
      minDeposit: 0.1,
      maxDeposit: 100,
      apr: 0.12,
      lockPeriod: 60,
      fees: {
        deposit: 1.0,
        withdrawal: 2.0,
        performance: 15
      },
      requirements: {
        minBalance: 0.01,
        kycRequired: true,
        whitelistOnly: false
      }
    },
    {
      id: 'template_4',
      name: 'Bitcoin Vault',
      symbol: 'BTC',
      description: 'Bitcoin vault with 10% APR and institutional-grade security',
      icon: '₿',
      minDeposit: 0.01,
      maxDeposit: 50,
      apr: 0.10,
      lockPeriod: 90,
      fees: {
        deposit: 2.0,
        withdrawal: 3.0,
        performance: 20
      },
      requirements: {
        minBalance: 0.001,
        kycRequired: true,
        whitelistOnly: true
      }
    }
  ]);

  const createCrucible = useCallback((template: CrucibleTemplate) => {
    console.log('Creating crucible from template:', template);
    // In a real app, this would call the smart contract to create the crucible
    // For now, we'll just log it
    alert(`Crucible "${template.name}" created successfully!\n\nThis is a demo. In production, this would deploy a new crucible contract on Solana.`);
  }, []);

  const getTemplates = useCallback(() => {
    return templates;
  }, [templates]);

  const getTemplateById = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  const value = {
    templates,
    createCrucible,
    getTemplates,
    getTemplateById
  };

  return (
    <CrucibleCreationContext.Provider value={value}>
      {children}
    </CrucibleCreationContext.Provider>
  );
};
