import React from 'react';
import { 
  calculateVolatilityFarmingMetrics, 
  CRUCIBLE_CONFIGS, 
  DEFAULT_CONFIG,
  formatAPY,
  formatDailyReturn,
  formatCurrency
} from '../utils/volatilityFarming';

interface VolatilityFarmingMetricsProps {
  className?: string;
}

export default function VolatilityFarmingMetrics({ className = '' }: VolatilityFarmingMetricsProps) {
  // Calculate metrics for both crucibles
  const fogoMetrics = calculateVolatilityFarmingMetrics(CRUCIBLE_CONFIGS[0], DEFAULT_CONFIG);
  const forgeMetrics = calculateVolatilityFarmingMetrics(CRUCIBLE_CONFIGS[1], DEFAULT_CONFIG);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo">
        <h3 className="text-xl font-inter-bold text-white mb-6">Volatility Farming Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FOGO Crucible Metrics */}
          <div className="bg-fogo-gray-800 rounded-xl p-6 border border-fogo-gray-600">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-fogo-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-fogo-primary font-bold text-sm">F</span>
              </div>
              <h4 className="text-lg font-inter-bold text-white">FOGO Crucible</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Volatility Factor:</span>
                <span className="text-white font-inter">2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Token Price:</span>
                <span className="text-fogo-accent font-inter">$0.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">TVL:</span>
                <span className="text-white font-inter">{formatCurrency(CRUCIBLE_CONFIGS[0].tvl)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Transaction Frequency:</span>
                <span className="text-fogo-accent font-inter">{fogoMetrics.transactionFrequency.toFixed(2)}x/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Daily Transaction Fees:</span>
                <span className="text-fogo-accent font-inter">{formatCurrency(fogoMetrics.dailyTransactionFees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Crucible Holders (80%):</span>
                <span className="text-fogo-success font-inter">{formatCurrency(fogoMetrics.crucibleHoldersShare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Protocol Treasury (20%):</span>
                <span className="text-fogo-primary font-inter">{formatCurrency(fogoMetrics.protocolShare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Daily Yield:</span>
                <span className="text-fogo-accent font-inter">+0.012%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">APY:</span>
                <span className="text-fogo-primary font-inter">{formatAPY(fogoMetrics.apyCompounded)}</span>
              </div>
            </div>
          </div>

          {/* FORGE Crucible Metrics */}
          <div className="bg-fogo-gray-800 rounded-xl p-6 border border-fogo-gray-600">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-fogo-secondary/20 rounded-lg flex items-center justify-center">
                <span className="text-fogo-secondary font-bold text-sm">F</span>
              </div>
              <h4 className="text-lg font-inter-bold text-white">FORGE Crucible</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Volatility Factor:</span>
                <span className="text-white font-inter">18%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Token Price:</span>
                <span className="text-fogo-accent font-inter">$0.002</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">TVL:</span>
                <span className="text-white font-inter">{formatCurrency(CRUCIBLE_CONFIGS[1].tvl)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Transaction Frequency:</span>
                <span className="text-fogo-accent font-inter">{forgeMetrics.transactionFrequency.toFixed(2)}x/day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Daily Transaction Fees:</span>
                <span className="text-fogo-accent font-inter">{formatCurrency(forgeMetrics.dailyTransactionFees)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Crucible Holders (80%):</span>
                <span className="text-fogo-success font-inter">{formatCurrency(forgeMetrics.crucibleHoldersShare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Protocol Treasury (20%):</span>
                <span className="text-fogo-primary font-inter">{formatCurrency(forgeMetrics.protocolShare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Daily Yield:</span>
                <span className="text-fogo-accent font-inter">+0.06%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">APY:</span>
                <span className="text-fogo-primary font-inter">{formatAPY(forgeMetrics.apyCompounded)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* cToken Price Projections */}
        <div className="mt-6 bg-fogo-gray-800 rounded-xl p-6 border border-fogo-gray-600">
          <h4 className="text-lg font-inter-bold text-white mb-4">⚒️ cToken Price Projections</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* cFOGO Projections */}
            <div className="space-y-3">
              <h5 className="text-fogo-primary font-inter-bold">cFOGO Crucible</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">Starting cFOGO Price:</span>
                  <span className="text-fogo-accent font-inter">$0.5000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">TVL:</span>
                  <span className="text-fogo-primary font-inter">$3,225,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">Total cFOGO Supply:</span>
                  <span className="text-fogo-success font-inter">6,450,000 cFOGO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">30D Projected Price:</span>
                  <span className="text-fogo-accent font-inter">$0.5018</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">1Y Projected Price:</span>
                  <span className="text-fogo-accent font-inter">$0.5224</span>
                </div>
              </div>
            </div>
            
            {/* cFORGE Projections */}
            <div className="space-y-3">
              <h5 className="text-fogo-accent font-inter-bold">cFORGE Crucible</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">Starting cFORGE Price:</span>
                  <span className="text-fogo-accent font-inter">$0.0020</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">TVL:</span>
                  <span className="text-fogo-primary font-inter">$1,075,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">Total cFORGE Supply:</span>
                  <span className="text-fogo-success font-inter">537,500,000 cFORGE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">30D Projected Price:</span>
                  <span className="text-fogo-accent font-inter">$0.002036</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fogo-gray-400">1Y Projected Price:</span>
                  <span className="text-fogo-accent font-inter">$0.0025</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Protocol Summary */}
        <div className="mt-6 bg-fogo-gray-800 rounded-xl p-4 border border-fogo-gray-600">
          <h4 className="text-lg font-inter-bold text-white mb-3">Protocol Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-fogo-gray-400">Total Protocol TVL:</span>
              <span className="text-white font-inter">{formatCurrency(DEFAULT_CONFIG.totalProtocolTVL)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fogo-gray-400">Transaction Fee Rate:</span>
              <span className="text-white font-inter">{(DEFAULT_CONFIG.feeRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fogo-gray-400">Protocol Treasury:</span>
              <span className="text-white font-inter">{(DEFAULT_CONFIG.protocolFeeCut * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fogo-gray-400">Crucible Holders:</span>
              <span className="text-fogo-success font-inter">{(DEFAULT_CONFIG.crucibleHoldersCut * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-fogo-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-fogo-gray-400">Total Daily Fees:</span>
                <span className="text-fogo-accent font-inter">{formatCurrency(fogoMetrics.dailyTransactionFees + forgeMetrics.dailyTransactionFees)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
