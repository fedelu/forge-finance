import React, { createContext, useContext, ReactNode, useState } from 'react';
import { 
  computePMint, 
  computeFogoOut, 
  calculateAPY, 
  formatAmount, 
  parseAmount,
  getEstimatedFogoValue,
  getExchangeRateDecimal,
  RATE_SCALE 
} from '../utils/math';
import { calculateVolatilityFarmingMetrics, CRUCIBLE_CONFIGS, DEFAULT_CONFIG, formatAPY, formatCurrency } from '../utils/volatilityFarming';

export interface CrucibleData {
  id: string;
  name: string;
  symbol: string;
  baseToken: 'FOGO' | 'FORGE';
  ptokenSymbol: 'cFOGO' | 'cFORGE';
  tvl: number;
  apr: number;
  status: 'active' | 'paused' | 'maintenance';
  userDeposit: number;
  userShares: number;
  icon: string;
  // pToken specific fields
  ptokenMint?: string;
  exchangeRate?: bigint;
  totalWrapped?: bigint;
  userPtokenBalance?: bigint;
  estimatedBaseValue?: bigint;
  currentAPY?: number;
  totalFeesCollected?: number;
  apyEarnedByUsers?: number;
  totalDeposited?: number;
  totalWithdrawn?: number;
}

interface CrucibleHookReturn {
  crucibles: CrucibleData[];
  loading: boolean;
  error: string | null;
  wrapTokens: (crucibleId: string, amount: string) => Promise<void>;
  unwrapTokens: (crucibleId: string, amount: string) => Promise<void>;
  unwrapTokensToUSDC: (crucibleId: string, amount: string) => Promise<void>;
  refreshCrucibleData: (crucibleId: string) => Promise<void>;
  getCrucible: (crucibleId: string) => CrucibleData | undefined;
  calculateWrapPreview: (crucibleId: string, baseAmount: string) => { ptokenAmount: string; estimatedValue: string };
  calculateUnwrapPreview: (crucibleId: string, ptokenAmount: string) => { baseAmount: string; estimatedValue: string };
  userBalances: Record<string, {
    ptokenBalance: bigint;
    baseDeposited: number;
    estimatedBaseValue: bigint;
    apyEarnedUSD: number;
  }>;
}

// Calculate volatility farming metrics for each crucible
const fogoMetrics = calculateVolatilityFarmingMetrics(CRUCIBLE_CONFIGS[0], DEFAULT_CONFIG);
const forgeMetrics = calculateVolatilityFarmingMetrics(CRUCIBLE_CONFIGS[1], DEFAULT_CONFIG);

// Mock crucible data with volatility farming calculations
  const mockCrucibles: CrucibleData[] = [
    {
      id: 'fogo-crucible',
      name: 'FOGO',
      symbol: 'FOGO',
      baseToken: 'FOGO',
      ptokenSymbol: 'cFOGO',
      tvl: 3_225_000, // FOGO crucible TVL for cToken price calculation
      apr: fogoMetrics.apyCompounded, // Compounded APY from volatility farming
      status: 'active',
      userDeposit: 0,
      userShares: 0,
      icon: '/fogo-logo.png',
      ptokenMint: 'mockPfogoMint1',
      exchangeRate: RATE_SCALE, // 1:1 ratio at deposit (cFOGO starts at $0.50, same as FOGO). Yield comes from value growth to $0.5224
      totalWrapped: BigInt(6450000000000), // 6,450,000 cFOGO emitted
      userPtokenBalance: BigInt(0),
      estimatedBaseValue: BigInt(0),
      currentAPY: fogoMetrics.apyCompounded * 100, // Convert to percentage
      totalFeesCollected: fogoMetrics.dailyTransactionFees * 365, // Annual fees
      apyEarnedByUsers: fogoMetrics.crucibleHoldersShare * 365, // Annual crucible holders yield
      totalDeposited: 0,
      totalWithdrawn: 0
    },
    {
      id: 'forge-crucible',
      name: 'Forge',
      symbol: 'FORGE',
      baseToken: 'FORGE',
      ptokenSymbol: 'cFORGE',
      tvl: 1_075_000, // 25% of protocol TVL
      apr: forgeMetrics.apyCompounded, // Compounded APY from volatility farming
      status: 'active',
      userDeposit: 0,
      userShares: 0,
      icon: '/forgo logo straight.png',
      ptokenMint: 'mockPforgeMint1',
      exchangeRate: BigInt(Math.floor(Number(RATE_SCALE) / (0.002 / 0.0025))), // Inverted to get fewer cFORGE since cFORGE costs more: RATE_SCALE / (FORGE price / cFORGE price) = RATE_SCALE / 0.8
      totalWrapped: BigInt(537500000000000), // 537,500,000 cFORGE emitted
      userPtokenBalance: BigInt(0),
      estimatedBaseValue: BigInt(0),
      currentAPY: forgeMetrics.apyCompounded * 100, // Convert to percentage
      totalFeesCollected: forgeMetrics.dailyTransactionFees * 365, // Annual fees
      apyEarnedByUsers: forgeMetrics.crucibleHoldersShare * 365, // Annual crucible holders yield
      totalDeposited: 0,
      totalWithdrawn: 0
    }
  ];

// Create context with default values
const CrucibleContext = createContext<CrucibleHookReturn>({
  crucibles: mockCrucibles,
  loading: false,
  error: null,
  wrapTokens: async () => {},
  unwrapTokens: async () => {},
  unwrapTokensToUSDC: async () => {},
  refreshCrucibleData: async () => {},
  getCrucible: () => undefined,
  calculateWrapPreview: () => ({ ptokenAmount: '0', estimatedValue: '0' }),
  calculateUnwrapPreview: () => ({ baseAmount: '0', estimatedValue: '0' }),
  userBalances: {}
});

// Provider component
interface CrucibleProviderProps {
  children: ReactNode;
}

export const CrucibleProvider: React.FC<CrucibleProviderProps> = ({ children }) => {
  // State to track user interactions
  const [userBalances, setUserBalances] = useState<Record<string, {
    ptokenBalance: bigint;
    baseDeposited: number;
    estimatedBaseValue: bigint;
    apyEarnedUSD: number; // Track APY earned in USD per user
  }>>({});
  
  // State to trigger re-renders when crucible data changes
  const [crucibleUpdateTrigger, setCrucibleUpdateTrigger] = useState(0);

  // Simulate exchange rate growth over time
  const getUpdatedCrucibles = (): CrucibleData[] => {
    // Use the trigger to ensure re-renders when user balances change
    crucibleUpdateTrigger; // This ensures the function re-runs when trigger changes
    
    return mockCrucibles.map(crucible => {
      // Start with 1:1 exchange rate, only increase when fees are actually collected
      const newExchangeRate = crucible.exchangeRate || RATE_SCALE;
      
      const userBalance = userBalances[crucible.id] || {
        ptokenBalance: BigInt(0),
        baseDeposited: 0,
        estimatedBaseValue: BigInt(0),
        apyEarnedUSD: 0
      };
      
      return {
        ...crucible,
        exchangeRate: newExchangeRate,
        currentAPY: crucible.apr * 100, // Use the static APR as APY (18% and 32%)
        userPtokenBalance: userBalance.ptokenBalance,
        userDeposit: userBalance.baseDeposited,
        estimatedBaseValue: userBalance.estimatedBaseValue,
        apyEarnedByUsers: crucible.apyEarnedByUsers || 0 // Use crucible's total APY earned by all users
      };
    });
  };

  const wrapTokens = async (crucibleId: string, amount: string) => {
    
    const crucible = getCrucible(crucibleId);
    if (crucible && crucible.exchangeRate) {
      const baseDeposited = parseFloat(amount);
      
      // Calculate wrap fee (1.5%)
      const feeAmount = baseDeposited * 0.015;
      const netAmount = baseDeposited - feeAmount;
      
      // Calculate cTokens based on net amount (after fee deduction)
      const netAmountBigInt = parseAmount(netAmount.toString());
      const ptokenAmount = computePMint(netAmountBigInt, crucible.exchangeRate);
      
      // Calculate APY earnings in USD (base amount)
      const currentCrucible = getCrucible(crucibleId);
      const apyEarnedUSD = (currentCrucible?.apyEarnedByUsers || 0) + (feeAmount * 0.33); // APY increases by 1/3 of fees
      const totalFees = apyEarnedUSD * 3; // Total fees = 3x APY earned
      const totalBurnedUSD = apyEarnedUSD / 10; // Total burned = 1/10 of APY earned

      // Calculate new exchange rate: apply accumulated yield only if not already applied
      // Target: RATE_SCALE * (0.5224/0.50) = 1.0448 * RATE_SCALE
      const currentExchangeRate = crucible.exchangeRate || RATE_SCALE;
      const targetExchangeRate = BigInt(Math.floor(Number(RATE_SCALE) * 1.0448)); // 4.48% yield
      // Only increase if current rate is still at 1:1
      const newExchangeRate = currentExchangeRate < targetExchangeRate ? targetExchangeRate : currentExchangeRate;
      
      // Update crucible stats with fee collection and cToken creation
      const crucibleIndex = mockCrucibles.findIndex(c => c.id === crucibleId);
      if (crucibleIndex !== -1) {
        mockCrucibles[crucibleIndex] = {
          ...mockCrucibles[crucibleIndex],
          exchangeRate: newExchangeRate,
          totalFeesCollected: totalFees,
          totalWrapped: (mockCrucibles[crucibleIndex].totalWrapped || BigInt(0)) + ptokenAmount, // Create new cTokens
          tvl: mockCrucibles[crucibleIndex].tvl + baseDeposited, // Increase TVL by the full deposit amount
          apyEarnedByUsers: apyEarnedUSD,
        };
      }
      
      // Update user balances
      setUserBalances(prev => {
        const current = prev[crucibleId] || {
          ptokenBalance: BigInt(0),
          baseDeposited: 0,
          estimatedBaseValue: BigInt(0),
          apyEarnedUSD: 0
        };
        
        // Calculate user's APY earnings from this transaction (1/3 of fees)
        const userApyEarned = feeAmount * 0.33;
        
        return {
          ...prev,
          [crucibleId]: {
            ptokenBalance: current.ptokenBalance + ptokenAmount,
            baseDeposited: current.baseDeposited + netAmount,
            estimatedBaseValue: current.estimatedBaseValue + BigInt(Math.floor(netAmount * 1e9)),
            apyEarnedUSD: current.apyEarnedUSD + userApyEarned
          }
        };
      });
      
      // Trigger re-render
      setCrucibleUpdateTrigger(prev => prev + 1);
      
      
    }
  };

  const unwrapTokensToUSDC = async (crucibleId: string, amount: string) => {
    const crucible = getCrucible(crucibleId);
    if (crucible && crucible.exchangeRate) {
      const ptokenAmount = parseAmount(amount);
      const baseAmount = computeFogoOut(ptokenAmount, crucible.exchangeRate);
      const baseToWithdraw = Number(formatAmount(baseAmount));
      
      // Calculate unwrap fee (1.5%)
      const feeAmount = baseToWithdraw * 0.015;
      const netAmount = baseToWithdraw - feeAmount;
      
      // Convert to USDC (assuming 1:1 rate for simplicity, but could be dynamic)
      const usdcAmount = netAmount;
      
      // Calculate APY earnings in USD (base amount)
      const currentCrucible = getCrucible(crucibleId);
      const apyEarnedUSD = (currentCrucible?.apyEarnedByUsers || 0) + (feeAmount * 0.33);
      const totalFees = apyEarnedUSD * 3;
      const totalBurnedUSD = apyEarnedUSD / 10;

      // Update crucible stats with fee collection and burned tokens
      const crucibleIndex = mockCrucibles.findIndex(c => c.id === crucibleId);
      if (crucibleIndex !== -1) {
        mockCrucibles[crucibleIndex] = {
          ...mockCrucibles[crucibleIndex],
          totalFeesCollected: totalFees,
          totalWrapped: (mockCrucibles[crucibleIndex].totalWrapped || BigInt(0)) - ptokenAmount,
          tvl: mockCrucibles[crucibleIndex].tvl - baseToWithdraw,
          apyEarnedByUsers: apyEarnedUSD
        };
      }
      
      // Update user balances - kill pTokens and return USDC
      setUserBalances(prev => {
        const current = prev[crucibleId] || {
          ptokenBalance: BigInt(0),
          baseDeposited: 0,
          estimatedBaseValue: BigInt(0),
          apyEarnedUSD: 0
        };
        
        const userApyEarned = feeAmount * 0.33;
        
        return {
          ...prev,
          [crucibleId]: {
            ptokenBalance: BigInt(0),
            baseDeposited: 0,
            estimatedBaseValue: BigInt(0),
            apyEarnedUSD: current.apyEarnedUSD + userApyEarned
          }
        };
      });
      
      // Trigger re-render
      setCrucibleUpdateTrigger(prev => prev + 1);
      
      console.log(`Withdrew ${usdcAmount.toFixed(2)} USDC from ${crucibleId} (1.5% fee: ${feeAmount.toFixed(2)})`);
    }
  };

  const unwrapTokens = async (crucibleId: string, amount: string) => {
    
    const crucible = getCrucible(crucibleId);
    if (crucible && crucible.exchangeRate) {
      const ptokenAmount = parseAmount(amount);
      const baseAmount = computeFogoOut(ptokenAmount, crucible.exchangeRate);
      const baseToWithdraw = Number(formatAmount(baseAmount));
      
      // Calculate unwrap fee (1.5%)
      const feeAmount = baseToWithdraw * 0.015;
      const netAmount = baseToWithdraw - feeAmount;
      
      // Calculate APY earnings in USD (base amount)
      const currentCrucible = getCrucible(crucibleId);
      const apyEarnedUSD = (currentCrucible?.apyEarnedByUsers || 0) + (feeAmount * 0.33); // APY increases by 1/3 of fees
      const totalFees = apyEarnedUSD * 3; // Total fees = 3x APY earned
      const totalBurnedUSD = apyEarnedUSD / 10; // Total burned = 1/10 of APY earned

      // Update crucible stats with fee collection and burned tokens
      const crucibleIndex = mockCrucibles.findIndex(c => c.id === crucibleId);
      if (crucibleIndex !== -1) {
        mockCrucibles[crucibleIndex] = {
          ...mockCrucibles[crucibleIndex],
          totalFeesCollected: totalFees,
 // Add to burned tokens
          totalWrapped: (mockCrucibles[crucibleIndex].totalWrapped || BigInt(0)) - ptokenAmount, // Burn the cTokens
          tvl: mockCrucibles[crucibleIndex].tvl - baseToWithdraw, // Decrease TVL by the full amount withdrawn
          apyEarnedByUsers: apyEarnedUSD
        };
      }
      
      // Update user balances - kill pTokens and return base tokens
      setUserBalances(prev => {
        const current = prev[crucibleId] || {
          ptokenBalance: BigInt(0),
          baseDeposited: 0,
          estimatedBaseValue: BigInt(0),
          apyEarnedUSD: 0
        };
        
        // Calculate user's APY earnings from this transaction (1/3 of fees)
        const userApyEarned = feeAmount * 0.33;
        
        return {
          ...prev,
          [crucibleId]: {
            ptokenBalance: BigInt(0), // Kill all pTokens
            baseDeposited: 0, // Reset deposited amount
            estimatedBaseValue: BigInt(0), // Reset estimated value
            apyEarnedUSD: current.apyEarnedUSD + userApyEarned // Keep accumulated APY earnings
          }
        };
      });
      
      // Trigger re-render
      setCrucibleUpdateTrigger(prev => prev + 1);
      
    }
  };


  const refreshCrucibleData = async (crucibleId: string) => {
    // In a real implementation, this would fetch fresh data
  };

  const getCrucible = (crucibleId: string): CrucibleData | undefined => {
    return getUpdatedCrucibles().find(c => c.id === crucibleId);
  };

  const calculateWrapPreview = (crucibleId: string, baseAmount: string) => {
    const crucible = getCrucible(crucibleId);
    if (!crucible || !crucible.exchangeRate) {
      return { ptokenAmount: '0', estimatedValue: '0' };
    }

    const baseDeposited = parseFloat(baseAmount);
    
    // Calculate wrap fee (1.5%)
    const feeAmount = baseDeposited * 0.015;
    const netAmount = baseDeposited - feeAmount;
    
    // Calculate cTokens based on net amount (after fee deduction)
    const netAmountBigInt = parseAmount(netAmount.toString());
    const ptokenAmount = computePMint(netAmountBigInt, crucible.exchangeRate);
    const estimatedValue = getEstimatedFogoValue(ptokenAmount, crucible.exchangeRate);

    return {
      ptokenAmount: formatAmount(ptokenAmount),
      estimatedValue: formatAmount(estimatedValue)
    };
  };

  const calculateUnwrapPreview = (crucibleId: string, ptokenAmount: string) => {
    const crucible = getCrucible(crucibleId);
    if (!crucible || !crucible.exchangeRate) {
      return { baseAmount: '0', estimatedValue: '0' };
    }

    const amount = parseAmount(ptokenAmount);
    const baseAmount = computeFogoOut(amount, crucible.exchangeRate);
    const baseToWithdraw = Number(formatAmount(baseAmount));
    
    // Calculate unwrap fee (1.5%)
    const feeAmount = baseToWithdraw * 0.015;
    const netAmount = baseToWithdraw - feeAmount;

    return {
      baseAmount: netAmount.toFixed(2),
      estimatedValue: netAmount.toFixed(2)
    };
  };

  const value: CrucibleHookReturn = {
    crucibles: getUpdatedCrucibles(),
    loading: false,
    error: null,
    wrapTokens,
    unwrapTokens,
    unwrapTokensToUSDC,
    refreshCrucibleData,
    getCrucible,
    calculateWrapPreview,
    calculateUnwrapPreview,
    userBalances
  };

  return (
    <CrucibleContext.Provider value={value}>
      {children}
    </CrucibleContext.Provider>
  );
};

// Hook to use the context
export const useCrucible = (): CrucibleHookReturn => {
  const context = useContext(CrucibleContext);
  if (!context) {
    throw new Error('useCrucible must be used within a CrucibleProvider');
  }
  return context;
};