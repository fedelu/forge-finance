import React, { useState, useEffect, useMemo } from 'react'
import { 
  FireIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useCrucible } from '../contexts/CrucibleContext'
import { useAnalytics } from '../contexts/AnalyticsContext'

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

interface SimpleStatsProps {
  className?: string
}

export default function SimpleStats({ className = '' }: SimpleStatsProps) {
  const [isLive, setIsLive] = useState(true)
  const [isClient, setIsClient] = useState(false)
  
  // Only use context hooks on client side
  const crucibles = isClient ? useCrucible().crucibles : []
  const analytics = isClient ? useAnalytics().analytics : { totalVolume: 0, transactionCount: 0 }
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Calculate stats with real data when client-side, static data for SSR
  const stats = useMemo(() => {
    if (!isClient) {
      // Static data for SSR
      return {
        totalCrucibles: 10,
        totalTVL: 1000000,
        totalUsers: 500,
        averageAPR: 8.5,
        priceChange24h: 2.3,
        volume24h: 250000,
        tvlChange: 5.2,
        userChange: 12.5,
        aprChange: -0.8,
        volumeChange: 15.3
      }
    }
    
    // Real data when client-side
    const totalCrucibles = crucibles.length
    const totalTVL = crucibles.reduce((sum, crucible) => sum + crucible.tvl, 0)
    const totalUsers = Math.max(100, analytics.transactionCount * 2)
    const averageAPR = crucibles.length > 0 
      ? crucibles.reduce((sum, crucible) => sum + crucible.apr, 0) / crucibles.length 
      : 8.5
    const volume24h = analytics.totalVolume
    const priceChange24h = 0.05 // Mock for now
    const tvlChange = 5.2 // Mock for now
    const userChange = 12 // Mock for now
    const aprChange = 0.2 // Mock for now
    const volumeChange = 15.3 // Mock for now

    return {
      totalCrucibles,
      totalTVL,
      totalUsers,
      averageAPR,
      priceChange24h,
      volume24h,
      tvlChange,
      userChange,
      aprChange,
      volumeChange
    }
  }, [isClient, crucibles, analytics])

  // Real-time updates are now handled by the contexts
  // No need for simulation since we're using real data

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
      <div
        className="card-hover group"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-forge-gray-400 text-sm font-medium mb-2">{title}</p>
            <p className="text-3xl font-bold text-white mb-2">
              {value}
            </p>
            <div className="flex items-center space-x-1">
              {isPositive && <ArrowUpIcon className="h-4 w-4 text-forge-success" />}
              {isNegative && <ArrowDownIcon className="h-4 w-4 text-forge-error" />}
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
          <div
            className={`p-3 rounded-xl ${iconColor} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Protocol Statistics</h2>
          <p className="text-forge-gray-400">Real-time data and performance metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Live Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'status-online' : 'status-offline'}`} />
            <span className="text-sm text-forge-gray-400">Live</span>
            <button 
              onClick={() => setIsLive(!isLive)}
              className="text-xs px-3 py-1 rounded-lg bg-forge-gray-700 hover:bg-forge-gray-600 transition-colors hover-lift"
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Crucibles"
          value={stats.totalCrucibles}
          change={2}
          changeType="positive"
          icon={FireIcon}
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
          delay={100}
        />
        
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.userChange}
          changeType="positive"
          icon={UserGroupIcon}
          iconColor="bg-gradient-to-br from-forge-success to-green-500"
          delay={200}
        />
        
        <StatCard
          title="Average APR"
          value={formatPercentage(stats.averageAPR)}
          change={stats.aprChange}
          changeType={stats.aprChange >= 0 ? "positive" : "negative"}
          icon={ChartBarIcon}
          iconColor="bg-gradient-to-br from-forge-info to-blue-500"
          delay={300}
        />
      </div>
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volume Card */}
        <div className="card-glow">
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
            <div className="w-full h-3 bg-forge-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-forge-success to-green-400 transition-all duration-500 ease-out animate-pulse-glow"
                style={{ width: '75%' }}
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-forge-gray-400">Progress</span>
              <span className="text-white font-semibold">75.0%</span>
            </div>
          </div>
        </div>
        
        {/* Network Status Card */}
        <div className="card-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Network Status</h3>
            <div className="flex items-center space-x-2">
              <div className="status-online" />
              <span className="text-forge-success text-sm font-medium">All Systems</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-forge-success">
              Operational
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-forge-gray-400">Uptime</span>
                <span className="text-white font-semibold">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forge-gray-400">Latency</span>
                <span className="text-white font-semibold">12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
