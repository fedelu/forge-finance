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
  timeInDays: number
): APYCalculation => {
  const dailyRate = apyRate / 365;
  const totalRewards = principal * dailyRate * timeInDays;
  const totalWithdrawal = principal + totalRewards;

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
    'fogo-stable-crucible': 45,    // 45 days - stable strategy
    'fogo-growth-crucible': 30,    // 30 days - growth strategy
    'fogo-premium-crucible': 60,   // 60 days - premium strategy
    'fogo-yield-crucible': 20,     // 20 days - high yield strategy
    'fogo-defi-crucible': 15,      // 15 days - DeFi strategy
    // Legacy crucibles (for backward compatibility)
    'sol-crucible': 30,
    'eth-crucible': 45,
    'usdc-crucible': 20,
    'btc-crucible': 60,
    'fogo-crucible': 15,
  };
  
  return timeMap[crucibleId] || 30; // Default to 30 days
};
