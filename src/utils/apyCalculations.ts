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
    'sol-crucible': 30,    // 30 days
    'eth-crucible': 45,    // 45 days
    'usdc-crucible': 20,   // 20 days
    'btc-crucible': 60,    // 60 days
    'fogo-crucible': 15,   // 15 days (newer crucible)
  };
  
  return timeMap[crucibleId] || 30; // Default to 30 days
};
