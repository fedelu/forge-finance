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

// Real-time APY tracking - calculates time since deposit
export const getTimeInCrucible = (crucibleId: string, depositTimestamp?: number): number => {
  if (depositTimestamp) {
    // Calculate actual time elapsed since deposit
    const now = Date.now();
    const timeElapsedMs = now - depositTimestamp;
    const timeElapsedDays = timeElapsedMs / (1000 * 60 * 60 * 24); // Convert to days
    return Math.max(0, timeElapsedDays); // Ensure non-negative
  }
  
  // Fallback: simulate time based on crucible ID (for demo purposes)
  const timeMap: { [key: string]: number } = {
    'fogo-stable-crucible': 30,     // 30 days - stable strategy
    'fogo-growth-crucible': 45,     // 45 days - growth strategy
    'fogo-premium-crucible': 60,    // 60 days - premium strategy
    'fogo-yield-crucible': 90,      // 90 days - high yield strategy
    'fogo-defi-crucible': 120,      // 120 days - DeFi strategy
    // Legacy crucibles (for backward compatibility)
    'sol-crucible': 30,
    'eth-crucible': 30,
    'usdc-crucible': 30,
    'btc-crucible': 30,
    'fogo-crucible': 30,
  };
  
  return timeMap[crucibleId] || 30; // Default to 30 days
};

// Calculate real-time APY earnings for a deposit
export const calculateRealTimeAPY = (
  principal: number,
  apyRate: number,
  depositTimestamp: number
): number => {
  const timeInDays = getTimeInCrucible('', depositTimestamp);
  const dailyRate = apyRate / 365;
  const totalValue = principal * Math.pow(1 + dailyRate, timeInDays);
  const earnedRewards = totalValue - principal;
  return Math.max(0, earnedRewards); // Ensure non-negative
};
