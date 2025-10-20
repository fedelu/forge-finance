import React from 'react';
import { useBalance } from '../contexts/BalanceContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useCrucible } from '../contexts/CrucibleContext';
import { 
  FireIcon, 
  BoltIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DynamicTokenBalancesProps {
  className?: string;
}

export const DynamicTokenBalances: React.FC<DynamicTokenBalancesProps> = ({ className = '' }) => {
  const { balances } = useBalance();
  const { analytics } = useAnalytics();
  const { crucibles } = useCrucible();
  

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case 'SOL': return '☀️';
      case 'USDC': return '💎';
      case 'ETH': return '🔷';
      case 'BTC': return '₿';
      case 'SPARK': return '⚡';
      case 'HEAT': return '🔥';
      default: return '💰';
    }
  };

  const getTokenColor = (symbol: string) => {
    switch (symbol) {
      case 'SOL': return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
      case 'USDC': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/50';
      case 'ETH': return 'from-purple-500/20 to-indigo-500/20 border-purple-500/50';
      case 'BTC': return 'from-orange-500/20 to-yellow-500/20 border-orange-500/50';
      case 'SPARK': return 'from-forge-primary/20 to-forge-accent/20 border-forge-primary/50';
      case 'HEAT': return 'from-red-500/20 to-yellow-500/20 border-red-500/50';
      default: return 'from-gray-500/20 to-gray-600/20 border-gray-500/50';
    }
  };

  const getTotalPortfolioValue = () => {
    // Sum USD values across all tokens
    return balances.reduce((total, b) => total + b.usdValue, 0);
  };

  const price = (symbol: string): number => ({ SOL: 200, USDC: 1, ETH: 4000, BTC: 110000, FOGO: 0.5 } as any)[symbol] || 1;

  const getUsdBalance = () => {
    // Sum current crucible holdings in USD (token units * token price)
    return crucibles.reduce((sum, c) => sum + c.userDeposit * price(c.symbol), 0);
  };

  const getCrucibleDeposit = (crucibleId: string) => {
    const crucible = crucibles.find(c => c.id === crucibleId);
    return crucible ? crucible.userDeposit : 0;
  };

  const getSparkBalance = () => {
    return balances.find(b => b.symbol === 'SPARK')?.amount || 0;
  };

  const getHeatBalance = () => {
    return balances.find(b => b.symbol === 'HEAT')?.amount || 0;
  };

  // Debug logs (placed after helpers to avoid temporal dead zone issues)
  console.log('DynamicTokenBalances: Current balances:', balances);
  console.log('DynamicTokenBalances: Current analytics:', analytics);
  console.log('DynamicTokenBalances: Portfolio Value (SOL):', getTotalPortfolioValue());
  console.log('DynamicTokenBalances: Active Tokens:', balances.filter(b => b.amount > 0).length);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Overview */}
      <div className="card bg-gradient-to-r from-forge-primary/20 to-forge-accent/20 border-forge-primary">
        <div className="flex items-center space-x-3 mb-6">
          <ChartBarIcon className="h-6 w-6 text-forge-primary" />
          <h3 className="text-xl font-semibold text-white">Portfolio Overview</h3>
        </div>
        
        <div className="space-y-6">
          {/* Main Portfolio Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* USD Balance */}
            <div className="text-center p-6 bg-gradient-to-br from-forge-primary/20 to-forge-accent/20 rounded-lg border border-forge-primary/30">
              <CurrencyDollarIcon className="h-10 w-10 text-forge-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{formatCurrency(getUsdBalance())}</div>
              <div className="text-sm text-gray-400 mt-1">Total Portfolio Value</div>
            </div>

            {/* SPARK Balance */}
            <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
              <BoltIcon className="h-10 w-10 text-forge-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{formatNumber(getSparkBalance(), 0)}</div>
              <div className="text-sm text-forge-accent mt-1">SPARK Tokens</div>
              <div className="text-xs text-gray-400">Governance Power</div>
            </div>

            {/* HEAT Balance */}
            <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <FireIcon className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white">{formatNumber(getHeatBalance(), 0)}</div>
              <div className="text-sm text-yellow-400 mt-1">HEAT Tokens</div>
              <div className="text-xs text-gray-400">Reward Points</div>
            </div>
          </div>

          {/* FOGO Crucibles Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FireIcon className="h-6 w-6 text-orange-400" />
                <h4 className="text-lg font-semibold text-white">🔥 FOGO Crucibles</h4>
                <div className="text-sm text-gray-400">({crucibles.filter(c => c.symbol === 'FOGO').length} active)</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Total FOGO Deposited</div>
                <div className="text-lg font-bold text-orange-400">
                  {formatNumber(crucibles.filter(c => c.symbol === 'FOGO').reduce((sum, c) => sum + c.userDeposit, 0), 2)} FOGO
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {crucibles.filter(c => c.symbol === 'FOGO').map((crucible) => (
                <div key={crucible.id} className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20 hover:border-orange-500/40 transition-colors">
                  <div className="text-2xl mb-2">{crucible.icon}</div>
                  <div className="text-lg font-bold text-white">{formatNumber(crucible.userDeposit, 2)}</div>
                  <div className="text-sm text-gray-300">FOGO</div>
                  <div className="text-xs text-gray-400 mt-1">{crucible.name}</div>
                  <div className="text-xs font-semibold text-orange-400 mt-1">{(crucible.apr * 100).toFixed(1)}% APY</div>
                  <div className="text-xs text-gray-500 mt-1">{crucible.userShares.toLocaleString()} shares</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed token balances section removed */}
    </div>
  );
};
