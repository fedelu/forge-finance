// APY Calculation Utilities
export interface APYCalculation {
  principal: number;
  apyRate: number;
  timeInDays: number;
  totalRewards: number;
  totalWithdrawal: number;
  dailyRate: number;
}

export const calculateAPYRewards = (
  principal: number,
  apyRate: number,
  timeInDays: number = 365 // Default to 1 year
): APYCalculation => {
  // Use compound interest formula: A = P(1 + r/n)^(nt)
  // For daily compounding: A = P(1 + r/365)^(365 * t)
  const dailyRate = apyRate / 365;
  const totalWithdrawal = principal * Math.pow(1 + dailyRate, timeInDays);
  const totalRewards = totalWithdrawal - principal;

  return {
    principal,
    apyRate,
    timeInDays,
    totalRewards,
    totalWithdrawal,
    dailyRate
  };
};

export const formatAPYBreakdown = (calculation: APYCalculation) => {
  return {
    principal: calculation.principal.toFixed(6),
    rewards: calculation.totalRewards.toFixed(6),
    total: calculation.totalWithdrawal.toFixed(6),
    apyPercentage: (calculation.apyRate * 100).toFixed(1),
    timeInDays: calculation.timeInDays.toFixed(0)
  };
};

// Mock time tracking - in production, this would be stored on-chain
export const getTimeInCrucible = (crucibleId: string): number => {
  // For demo purposes, simulate time based on crucible ID
  const timeMap: { [key: string]: number } = {
    'fogo-stable-crucible': 365,    // 1 year - stable strategy
    'fogo-growth-crucible': 365,    // 1 year - growth strategy
    'fogo-premium-crucible': 365,   // 1 year - premium strategy
    'fogo-yield-crucible': 365,     // 1 year - high yield strategy
    'fogo-defi-crucible': 365,      // 1 year - DeFi strategy
    // Legacy crucibles (for backward compatibility)
    'sol-crucible': 365,
    'eth-crucible': 365,
    'usdc-crucible': 365,
    'btc-crucible': 365,
    'fogo-crucible': 365,
  };
  
  return timeMap[crucibleId] || 365; // Default to 1 year (365 days)
};
