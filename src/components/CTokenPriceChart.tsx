import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'
import { useCrucible } from '../hooks/useCrucible'

interface CTokenPriceChartProps {
  isOpen: boolean
  onClose: () => void
  crucibleId: string
}

export function CTokenPriceChart({ isOpen, onClose, crucibleId }: CTokenPriceChartProps) {
  const { crucibles } = useCrucible()
  const crucible = crucibles.find(c => c.id === crucibleId)

  if (!isOpen || !crucible) return null

  // Calculate price growth over 1 year (365 days)
  // Formula: P(t) = P(0) * (1 + APY)^(t/365)
  // Where t is in days, APY is the annual percentage yield
  const apy = crucible.apr
  const daysInYear = 365
  const initialPrice = crucible.baseToken === 'FOGO' ? 0.5 : 0.002
  
  // The final price after 1 year for FOGO: $0.5224 (from accumulated exchange rate)
  // This represents the price after deposits where we "fast forward" to show accumulated yield
  const finalPrice = crucible.baseToken === 'FOGO' ? 0.5224 : 0.0025

  // Generate data points for the year
  const generateChartData = () => {
    const data = []
    const intervals = 12 // Show monthly intervals
    const daysPerInterval = daysInYear / intervals

    for (let i = 0; i <= intervals; i++) {
      const days = i * daysPerInterval
      const elapsedYears = days / daysInYear
      
      // Calculate price using compound interest formula
      const currentPrice = initialPrice * Math.pow(1 + apy, elapsedYears)
      
      data.push({
        month: i,
        day: Math.floor(days),
        price: parseFloat(currentPrice.toFixed(6)),
        label: getMonthLabel(i)
      })
    }

    return data
  }

  const getMonthLabel = (month: number) => {
    if (month === 0) return 'Today'
    if (month === 12) return '1 Year'
    return `Month ${month}`
  }

  const chartData = generateChartData()

  // Calculate projections
  const todayPrice = initialPrice
  const yearEndPrice = finalPrice
  const priceIncreasePercent = ((yearEndPrice - todayPrice) / todayPrice) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-fogo-gray-900 via-fogo-gray-800 to-fogo-gray-900 rounded-3xl shadow-2xl border border-fogo-primary/30 w-full max-w-4xl max-h-[90vh] overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="p-6 border-b border-fogo-gray-700 bg-fogo-gray-900">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-2xl font-inter-bold text-white">
                {crucible.ptokenSymbol} Price Projection
              </h3>
              <p className="text-fogo-gray-400 text-sm mt-1">
                Price growth over 1 year based on {formatPercentage(apy)} APY
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-fogo-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-fogo-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-fogo-primary/10 to-fogo-primary/5 rounded-xl p-4 border border-fogo-primary/20">
              <div className="text-sm text-fogo-gray-300 mb-1">Start Price</div>
              <div className="text-2xl font-bold text-fogo-primary">
                ${todayPrice.toFixed(4)}
              </div>
              <div className="text-xs text-fogo-gray-400 mt-1">At deposit</div>
            </div>
            <div className="bg-gradient-to-br from-fogo-accent/10 to-fogo-accent/5 rounded-xl p-4 border border-fogo-accent/20">
              <div className="text-sm text-fogo-gray-300 mb-1">End Price (1 year)</div>
              <div className="text-2xl font-bold text-fogo-accent">
                ${yearEndPrice.toFixed(4)}
              </div>
              <div className="text-xs text-fogo-gray-400 mt-1">After 1 year</div>
            </div>
            <div className="bg-gradient-to-br from-fogo-success/10 to-fogo-success/5 rounded-xl p-4 border border-fogo-success/20">
              <div className="text-sm text-fogo-gray-300 mb-1">APY Rate</div>
              <div className="text-2xl font-bold text-fogo-success">
                {formatPercentage(apy)}
              </div>
              <div className="text-xs text-fogo-gray-400 mt-1">Annual Percentage Yield</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20">
              <div className="text-sm text-fogo-gray-300 mb-1">Price Increase</div>
              <div className="text-2xl font-bold text-purple-400">
                {priceIncreasePercent.toFixed(2)}%
              </div>
              <div className="text-xs text-fogo-gray-400 mt-1">Actual growth</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-fogo-gray-900 rounded-xl p-4 border border-fogo-gray-700">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-1">
                {crucible.ptokenSymbol} Price Growth
              </h4>
              <p className="text-sm text-fogo-gray-400">
                Price increases over time as yield accumulates
              </p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fill: '#9CA3AF' }}
                  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                  domain={['dataMin - 0.01', 'dataMax + 0.01']}
                  tickFormatter={(value) => `$${value.toFixed(3)}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#fff'
                  }}
                  formatter={(value: number) => `$${value.toFixed(6)}`}
                  labelFormatter={(label: string) => {
                    const data = chartData[parseInt(label)]
                    return `Day ${data.day} (${data.label})`
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9CA3AF' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  name={`${crucible.ptokenSymbol} Price`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Info Section */}
          <div className="mt-6 bg-fogo-gray-900 rounded-xl p-4 border border-fogo-primary/20">
            <h4 className="text-sm font-semibold text-fogo-primary mb-2">How it works</h4>
            <div className="text-xs text-fogo-gray-300 space-y-1">
              <div>• At deposit: 1 {crucible.baseToken} = 1 {crucible.ptokenSymbol} (1:1 exchange rate)</div>
              <div>• Initial {crucible.ptokenSymbol} price: ${todayPrice.toFixed(4)} (same as {crucible.baseToken})</div>
              <div>• Over time: {crucible.ptokenSymbol} price increases through exchange rate growth</div>
              <div>• After 1 year: {crucible.ptokenSymbol} reaches ${yearEndPrice.toFixed(4)} (${priceIncreasePercent.toFixed(2)}% price increase)</div>
              <div>• Withdrawal: Exchange {crucible.ptokenSymbol} back to {crucible.baseToken} at the higher price</div>
              <div>• Result: You receive MORE {crucible.baseToken} than originally deposited</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}

