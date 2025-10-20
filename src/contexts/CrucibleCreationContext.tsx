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
      id: 'fogo_template_1',
      name: 'FOGO Stable Strategy',
      symbol: 'FOGO',
      description: 'Conservative FOGO crucible with 12% APR and stable returns',
      icon: '🔥',
      minDeposit: 10,
      maxDeposit: 10000,
      apr: 0.12,
      lockPeriod: 30,
      fees: {
        deposit: 0.5,
        withdrawal: 1.0,
        performance: 8
      },
      requirements: {
        minBalance: 1,
        kycRequired: false,
        whitelistOnly: false
      }
    },
    {
      id: 'fogo_template_2',
      name: 'FOGO Growth Strategy',
      symbol: 'FOGO',
      description: 'Aggressive FOGO crucible with 18% APR for growth-focused investors',
      icon: '🚀',
      minDeposit: 50,
      maxDeposit: 50000,
      apr: 0.18,
      lockPeriod: 60,
      fees: {
        deposit: 1.0,
        withdrawal: 2.0,
        performance: 12
      },
      requirements: {
        minBalance: 5,
        kycRequired: false,
        whitelistOnly: false
      }
    },
    {
      id: 'fogo_template_3',
      name: 'FOGO Premium Strategy',
      symbol: 'FOGO',
      description: 'Premium FOGO crucible with 15% APR and enhanced features',
      icon: '💎',
      minDeposit: 100,
      maxDeposit: 100000,
      apr: 0.15,
      lockPeriod: 45,
      fees: {
        deposit: 0.8,
        withdrawal: 1.5,
        performance: 10
      },
      requirements: {
        minBalance: 10,
        kycRequired: false,
        whitelistOnly: false
      }
    },
    {
      id: 'fogo_template_4',
      name: 'FOGO Yield Strategy',
      symbol: 'FOGO',
      description: 'High-yield FOGO crucible with 22% APR and DeFi integration',
      icon: '⚡',
      minDeposit: 25,
      maxDeposit: 25000,
      apr: 0.22,
      lockPeriod: 90,
      fees: {
        deposit: 1.5,
        withdrawal: 2.5,
        performance: 15
      },
      requirements: {
        minBalance: 2.5,
        kycRequired: false,
        whitelistOnly: false
      }
    },
    {
      id: 'fogo_template_5',
      name: 'FOGO DeFi Strategy',
      symbol: 'FOGO',
      description: 'Advanced FOGO crucible with 25% APR and DeFi protocols',
      icon: '🏦',
      minDeposit: 200,
      maxDeposit: 200000,
      apr: 0.25,
      lockPeriod: 120,
      fees: {
        deposit: 2.0,
        withdrawal: 3.0,
        performance: 18
      },
      requirements: {
        minBalance: 20,
        kycRequired: false,
        whitelistOnly: false
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
