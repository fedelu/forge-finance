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

  const price = (symbol: string): number => ({ SOL: 200, USDC: 1, ETH: 2000, BTC: 50000 } as any)[symbol] || 1;

  const getUsdDeposited = () => {
    return crucibles.reduce((sum, c) => sum + c.userDeposit * price(c.symbol), 0);
  };

  const getCrucibleDeposit = (symbol: string) => {
    const c = crucibles.find(x => x.symbol === symbol);
    return c ? c.userDeposit : 0;
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {/* 1) USD Deposited (sum of crucibles) */}
          <div className="text-center p-4 bg-forge-gray/30 rounded-lg">
            <CurrencyDollarIcon className="h-8 w-8 text-forge-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatCurrency(getUsdDeposited())}</div>
            <div className="text-sm text-gray-400">USD Deposited</div>
          </div>

          {/* SPARK Balance */}
          <div className="text-center p-4 bg-forge-gray/30 rounded-lg">
            <BoltIcon className="h-8 w-8 text-forge-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {formatNumber(getSparkBalance(), 0)}
            </div>
            <div className="text-sm text-forge-accent">SPARK</div>
            <div className="text-xs text-gray-400">Governance</div>
          </div>

          {/* HEAT Balance */}
          <div className="text-center p-4 bg-forge-gray/30 rounded-lg">
            <FireIcon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">
              {formatNumber(getHeatBalance(), 0)}
            </div>
            <div className="text-sm text-yellow-400">HEAT</div>
            <div className="text-xs text-gray-400">Rewards</div>
          </div>

          {/* 4) Crucible SOL */}
          <div className="text-center p-4 bg-forge-gray/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{formatNumber(getCrucibleDeposit('SOL'), 2)} SOL</div>
            <div className="text-sm text-gray-400">Crucible SOL</div>
          </div>

          {/* 5) Crucible ETH */}
          <div className="text-center p-4 bg-forge-gray/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{formatNumber(getCrucibleDeposit('ETH'), 2)} ETH</div>
            <div className="text-sm text-gray-400">Crucible ETH</div>
          </div>

          {/* 6) Crucible USDC */}
          <div className="text-center p-4 bg-forge-gray/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{formatNumber(getCrucibleDeposit('USDC'), 2)} USDC</div>
            <div className="text-sm text-gray-400">Crucible USDC</div>
          </div>

          {/* 7) Crucible BTC */}
          <div className="text-center p-4 bg-forge-gray/30 rounded-lg">
            <div className="text-2xl font-bold text-white">{formatNumber(getCrucibleDeposit('BTC'), 2)} BTC</div>
            <div className="text-sm text-gray-400">Crucible BTC</div>
          </div>
        </div>
      </div>

      {/* Detailed token balances section removed */}
    </div>
  );
};
