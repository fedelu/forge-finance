import React, { useState, useEffect } from 'react'
import { 
  CurrencyDollarIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Chart from './Chart'
import ProgressBar from './ProgressBar'

interface ProtocolStats {
  totalCrucibles: number
  totalTVL: number
  totalUsers: number
  averageAPR: number
  priceChange24h: number
  volume24h: number
  tvlChange: number
  userChange: number
  aprChange: number
  volumeChange: number
}

interface RealTimeStatsProps {
  className?: string
}

export default function RealTimeStats({ className = '' }: RealTimeStatsProps) {
  const [stats, setStats] = useState<ProtocolStats>({
    totalCrucibles: 10,
    totalTVL: 1_000_000,
    totalUsers: 500,
    averageAPR: 0.08,
    priceChange24h: 0.05,
    volume24h: 250_000,
    tvlChange: 5.2,
    userChange: 12,
    aprChange: 0.2,
    volumeChange: 15.3
  })

  const [isLive, setIsLive] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      setStats(prevStats => ({
        ...prevStats,
        totalTVL: prevStats.totalTVL + Math.floor(Math.random() * 10000 - 5000),
        totalUsers: prevStats.totalUsers + Math.floor(Math.random() * 10 - 5),
        volume24h: prevStats.volume24h + Math.floor(Math.random() * 5000 - 2500),
        averageAPR: Math.max(0.05, Math.min(0.12, prevStats.averageAPR + (Math.random() - 0.5) * 0.01)),
        priceChange24h: (Math.random() - 0.5) * 0.1,
        tvlChange: prevStats.tvlChange + (Math.random() - 0.5) * 0.5,
        userChange: prevStats.userChange + Math.floor(Math.random() * 6 - 3),
        aprChange: prevStats.aprChange + (Math.random() - 0.5) * 0.1,
        volumeChange: prevStats.volumeChange + (Math.random() - 0.5) * 2
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const formatChange = (value: number, isPercentage = false) => {
    const sign = value >= 0 ? '+' : ''
    const formatted = isPercentage ? value.toFixed(1) : value.toLocaleString()
    return `${sign}${formatted}${isPercentage ? '%' : ''}`
  }

  const chartData = [
    { label: 'Mon', value: 850000, color: '#FF6B35' },
    { label: 'Tue', value: 920000, color: '#F7931E' },
    { label: 'Wed', value: 880000, color: '#FFD23F' },
    { label: 'Thu', value: 1050000, color: '#10B981' },
    { label: 'Fri', value: 980000, color: '#3B82F6' },
    { label: 'Sat', value: 1100000, color: '#8B5CF6' },
    { label: 'Sun', value: 1000000, color: '#EF4444' },
  ]

  const timeframes = [
    { id: '1h', label: '1H' },
    { id: '24h', label: '24H' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
  ]

  const StatCard = ({ 
    title, 
    value, 
    change, 
    changeType, 
    icon: Icon, 
    iconColor, 
    delay = 0 
  }: {
    title: string
    value: string | number
    change: number
    changeType: 'positive' | 'negative' | 'neutral'
    icon: any
    iconColor: string
    delay?: number
  }) => {
    const isPositive = changeType === 'positive'
    const isNegative = changeType === 'negative'
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="card-hover group"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-forge-gray-400 text-sm font-medium mb-2">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-white mb-2"
              key={value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.p>
            <div className="flex items-center space-x-1">
              {isPositive && <ArrowTrendingUpIcon className="h-4 w-4 text-forge-success" />}
              {isNegative && <ArrowTrendingDownIcon className="h-4 w-4 text-forge-error" />}
              <span className={`text-sm font-medium ${
                isPositive ? 'text-forge-success' : 
                isNegative ? 'text-forge-error' : 
                'text-forge-gray-400'
              }`}>
                {formatChange(change, true)}
              </span>
              <span className="text-forge-gray-500 text-sm">this week</span>
            </div>
          </div>
          <motion.div
            className={`p-3 rounded-xl ${iconColor} group-hover:scale-110 transition-transform duration-300`}
            whileHover={{ rotate: 5 }}
          >
            <Icon className="h-8 w-8 text-white" />
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Protocol Statistics</h2>
          <p className="text-forge-gray-400">Real-time data and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1 bg-forge-gray-800 rounded-lg p-1">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.id}
                onClick={() => setSelectedTimeframe(timeframe.id)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedTimeframe === timeframe.id
                    ? 'bg-forge-primary text-white'
                    : 'text-forge-gray-400 hover:text-white hover:bg-forge-gray-700'
                }`}
              >
                {timeframe.label}
              </button>
            ))}
          </div>

          {/* Live Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'status-online' : 'status-offline'}`} />
            <span className="text-sm text-forge-gray-400">Live</span>
            <motion.button 
              onClick={() => setIsLive(!isLive)}
              className="text-xs px-3 py-1 rounded-lg bg-forge-gray-700 hover:bg-forge-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLive ? 'Pause' : 'Resume'}
            </motion.button>
          </div>
        </div>
      </motion.div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Crucibles"
          value={stats.totalCrucibles}
          change={2}
          changeType="positive"
          icon={CurrencyDollarIcon}
          iconColor="bg-gradient-to-br from-forge-primary to-forge-primary-dark"
          delay={0}
        />
        
        <StatCard
          title="Total TVL"
          value={formatCurrency(stats.totalTVL)}
          change={stats.tvlChange}
          changeType={stats.tvlChange >= 0 ? "positive" : "negative"}
          icon={BanknotesIcon}
          iconColor="bg-gradient-to-br from-forge-secondary to-forge-secondary-dark"
          delay={0.1}
        />
        
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userChange}
          changeType="positive"
          icon={UserGroupIcon}
          iconColor="bg-gradient-to-br from-forge-success to-green-500"
          delay={0.2}
        />
        
        <StatCard
          title="Average APY"
          value={formatPercentage(stats.averageAPR)}
          change={stats.aprChange}
          changeType={stats.aprChange >= 0 ? "positive" : "negative"}
          icon={ChartBarIcon}
          iconColor="bg-gradient-to-br from-forge-info to-blue-500"
          delay={0.3}
        />
      </div>
      
      {/* Secondary Stats and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume Card */}
        <motion.div 
          className="card-glow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">24h Volume</h3>
            <div className="flex items-center space-x-2">
              <div className="status-online" />
              <span className="text-forge-success text-sm font-medium">+{stats.volumeChange.toFixed(1)}%</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-white">
              {formatCurrency(stats.volume24h)}
            </div>
            <ProgressBar 
              progress={75} 
              color="success" 
              showPercentage={true}
              animated={true}
            />
          </div>
        </motion.div>
        
      </div>

      {/* TVL Chart */}
      <motion.div 
        className="card-glow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">TVL Trend</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-forge-primary rounded-full" />
            <span className="text-forge-gray-400 text-sm">Last 7 days</span>
          </div>
        </div>
        <Chart 
          data={chartData} 
          type="bar" 
          height={300}
          showValues={true}
          animated={true}
        />
      </motion.div>
    </div>
  )
}