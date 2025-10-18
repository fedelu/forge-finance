import React, { useState, useEffect } from 'react'
import Head from 'next/head'

export default function EnhancedDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mainTab, setMainTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('tvl')
  
  // Enhanced analytics state with more data
  const [analytics, setAnalytics] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalYieldEarned: 0,
    activeCrucibles: 0,
    totalVotes: 0,
    tokenBalances: {
      SOL: 100.5,
      USDC: 5000,
      ETH: 2.3,
      BTC: 0.15,
      SPARK: 10000,
      HEAT: 250
    },
    cruciblePositions: [],
    transactionHistory: [],
    // New enhanced data
    portfolioValue: 0,
    totalFees: 0,
    averageAPY: 0,
    riskScore: 0,
    yieldHistory: [],
    priceHistory: {},
    volumeHistory: {},
    userRank: 0,
    totalUsers: 500,
    weeklyChange: 0,
    monthlyChange: 0
  })

  // Mock data generation
  useEffect(() => {
    // Generate mock historical data
    const generateHistoryData = (days: number, baseValue: number, volatility: number = 0.1) => {
      const data = []
      const now = new Date()
      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const randomChange = (Math.random() - 0.5) * volatility
        const value = baseValue * (1 + randomChange)
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.max(0, value),
          timestamp: date.getTime()
        })
      }
      return data
    }

    setAnalytics(prev => ({
      ...prev,
      portfolioValue: 125000,
      totalFees: 1250,
      averageAPY: 8.5,
      riskScore: 3.2,
      yieldHistory: generateHistoryData(30, 1000, 0.15),
      priceHistory: {
        SOL: generateHistoryData(30, 100, 0.08),
        USDC: generateHistoryData(30, 1, 0.01),
        ETH: generateHistoryData(30, 2500, 0.12),
        BTC: generateHistoryData(30, 45000, 0.1)
      },
      volumeHistory: generateHistoryData(30, 50000, 0.2),
      userRank: 42,
      weeklyChange: 12.5,
      monthlyChange: 28.3
    }))
  }, [])

  const handleConnect = () => {
    setLoading(true)
    setTimeout(() => {
      setIsConnected(true)
      setLoading(false)
      alert('✅ Wallet connected successfully!\n\nYour Fogo testnet wallet is now connected.')
    }, 1500)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    alert('🔌 Wallet disconnected successfully!')
  }

  const handleQuickAction = (action: string) => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!\n\nClick "Connect Wallet" to start using the protocol.')
      return
    }
    
    switch (action) {
      case 'deposit':
        setMainTab('crucibles')
        break
      case 'analytics':
        setMainTab('analytics')
        break
      case 'governance':
        setMainTab('governance')
        break
      default:
        setMainTab('dashboard')
    }
  }

  // Chart component for data visualization
  const Chart = ({ data, type = 'line', color = '#FF6B35', height = 200, className = '' }) => {
    const canvasRef = React.useRef(null)
    
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas || !data.length) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const width = canvas.width
      const height = canvas.height
      
      ctx.clearRect(0, 0, width, height)
      
      const maxValue = Math.max(...data.map(d => d.value))
      const minValue = Math.min(...data.map(d => d.value))
      const range = maxValue - minValue || 1
      
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = 2
      
      if (type === 'line') {
        ctx.beginPath()
        data.forEach((point, index) => {
          const x = (index / (data.length - 1)) * width
          const y = height - ((point.value - minValue) / range) * height
          
          if (index === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        })
        ctx.stroke()
        
        // Add gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height)
        gradient.addColorStop(0, color + '40')
        gradient.addColorStop(1, color + '00')
        ctx.fillStyle = gradient
        ctx.fill()
      } else if (type === 'bar') {
        const barWidth = width / data.length
        data.forEach((point, index) => {
          const x = index * barWidth
          const barHeight = ((point.value - minValue) / range) * height
          const y = height - barHeight
          ctx.fillRect(x + 2, y, barWidth - 4, barHeight)
        })
      }
    }, [data, type, color, height])
    
    return (
      <canvas
        ref={canvasRef}
        width={400}
        height={height}
        className={`w-full ${className}`}
      />
    )
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Enhanced Header with Portfolio Overview */}
      <div className="bg-gradient-to-r from-forge-primary/10 via-forge-secondary/10 to-forge-accent/10 backdrop-blur-sm rounded-3xl p-8 border border-forge-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Portfolio Overview</h1>
            <p className="text-forge-gray-300">Track your DeFi performance and earnings</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">${analytics.portfolioValue.toLocaleString()}</p>
            <div className="flex items-center space-x-2">
              <span className="text-forge-success text-sm">+{analytics.weeklyChange}%</span>
              <span className="text-forge-gray-400 text-sm">this week</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">Total Yield</p>
            <p className="text-xl font-bold text-white">${analytics.totalYieldEarned.toLocaleString()}</p>
          </div>
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">Avg APY</p>
            <p className="text-xl font-bold text-forge-success">{analytics.averageAPY}%</p>
          </div>
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">Risk Score</p>
            <p className="text-xl font-bold text-forge-warning">{analytics.riskScore}/10</p>
          </div>
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">User Rank</p>
            <p className="text-xl font-bold text-forge-info">#{analytics.userRank}</p>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Portfolio Value Chart */}
        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Portfolio Value</h3>
            <div className="flex space-x-2">
              {['1d', '7d', '30d'].map(period => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === period
                      ? 'bg-forge-primary text-white'
                      : 'bg-forge-gray-700 text-forge-gray-300 hover:bg-forge-gray-600'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <Chart 
              data={analytics.yieldHistory.slice(-(timeRange === '1d' ? 7 : timeRange === '7d' ? 7 : 30))} 
              color="#FF6B35"
              height={200}
            />
          </div>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-forge-gray-400">Current: ${analytics.portfolioValue.toLocaleString()}</span>
            <span className="text-forge-success">+{analytics.monthlyChange}% this month</span>
          </div>
        </div>

        {/* Token Performance Chart */}
        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Token Performance</h3>
            <select 
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="bg-forge-gray-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              <option value="tvl">TVL</option>
              <option value="price">Price</option>
              <option value="volume">Volume</option>
            </select>
          </div>
          <div className="h-64">
            <Chart 
              data={selectedMetric === 'tvl' ? (Array.isArray(analytics.yieldHistory) ? analytics.yieldHistory.slice(-30) : []) : 
                    selectedMetric === 'price' ? (Array.isArray(analytics.priceHistory) ? analytics.priceHistory.slice(-30) : []) :
                    Array.isArray(analytics.volumeHistory) ? analytics.volumeHistory.slice(-30) : []} 
              color={selectedMetric === 'tvl' ? '#FF6B35' : selectedMetric === 'price' ? '#F7931E' : '#FFD23F'}
              height={200}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-forge-gray-400 text-sm">SOL</p>
              <p className="text-white font-bold">+8.2%</p>
            </div>
            <div className="text-center">
              <p className="text-forge-gray-400 text-sm">ETH</p>
              <p className="text-white font-bold">+12.1%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-forge-primary/20 to-forge-primary-dark/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">Total Crucibles</p>
              <p className="text-4xl font-bold text-white">10</p>
              <p className="text-forge-success text-sm mt-2 flex items-center">
                <span className="mr-1">↗</span> +2 this week
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-primary to-forge-primary-dark flex items-center justify-center">
              <span className="text-3xl">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-forge-accent/20 to-yellow-400/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">Total TVL</p>
              <p className="text-4xl font-bold text-white">$1.2M</p>
              <p className="text-forge-success text-sm mt-2 flex items-center">
                <span className="mr-1">↗</span> +5.2% (24h)
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-accent to-yellow-400 flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-forge-info/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-info/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">Active Users</p>
              <p className="text-4xl font-bold text-white">500</p>
              <p className="text-forge-success text-sm mt-2 flex items-center">
                <span className="mr-1">↗</span> +12 today
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-info to-blue-500 flex items-center justify-center">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-forge-success/20 to-green-500/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-success/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">Average APR</p>
              <p className="text-4xl font-bold text-white">8.5%</p>
              <p className="text-forge-info text-sm mt-2 flex items-center">
                <span className="mr-1">↗</span> +0.2% this week
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-success to-green-500 flex items-center justify-center">
              <span className="text-3xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Balances with Enhanced Design */}
      <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Token Holdings</h3>
          <div className="flex items-center space-x-2">
            <span className="text-forge-gray-400 text-sm">Total Value:</span>
            <span className="text-xl font-bold text-white">${analytics.portfolioValue.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(analytics.tokenBalances).map(([token, balance], index) => {
            const colors = [
              'from-forge-primary to-forge-primary-dark',
              'from-forge-accent to-yellow-400',
              'from-forge-info to-blue-500',
              'from-forge-success to-green-500',
              'from-purple-500 to-purple-600',
              'from-pink-500 to-pink-600'
            ]
            const icons = ['☀️', '💵', '🔷', '₿', '⚡', '🔥']
            
            return (
              <div key={token} className="group bg-forge-gray-700/50 rounded-xl p-4 hover:bg-forge-gray-700/70 transition-all duration-300 hover:scale-105">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{icons[index % icons.length]}</span>
                </div>
                <p className="text-forge-gray-400 text-sm font-medium mb-1 text-center">{token}</p>
                <p className="text-white font-bold text-lg text-center">{balance.toLocaleString()}</p>
                <p className="text-forge-success text-xs text-center mt-1">+{Math.random() * 10 + 2}%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-r from-forge-gray-800/50 to-forge-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button 
            onClick={() => handleQuickAction('deposit')}
            className="group relative overflow-hidden bg-gradient-to-br from-forge-primary to-forge-secondary rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🔥</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-forge-accent transition-colors">
                Deposit Tokens
              </h3>
              <p className="text-white/80 group-hover:text-white transition-colors">
                Add liquidity to earn yield across multiple crucibles
              </p>
            </div>
          </button>

          <button 
            onClick={() => handleQuickAction('analytics')}
            className="group relative overflow-hidden bg-gradient-to-br from-forge-accent to-yellow-400 rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-forge-primary transition-colors">
                View Analytics
              </h3>
              <p className="text-white/80 group-hover:text-white transition-colors">
                Track your performance with detailed insights
              </p>
            </div>
          </button>

          <button 
            onClick={() => handleQuickAction('governance')}
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🗳️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-forge-accent transition-colors">
                Governance
              </h3>
              <p className="text-white/80 group-hover:text-white transition-colors">
                Vote on proposals and shape the protocol
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { type: 'deposit', token: 'SOL', amount: 100, crucible: 'SOL Crucible', time: '2 hours ago', status: 'completed' },
            { type: 'yield', token: 'HEAT', amount: 25, crucible: 'ETH Crucible', time: '4 hours ago', status: 'completed' },
            { type: 'vote', proposal: 'Increase SOL APR', vote: 'Yes', time: '1 day ago', status: 'completed' },
            { type: 'withdraw', token: 'USDC', amount: 500, crucible: 'USDC Crucible', time: '2 days ago', status: 'completed' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-forge-gray-700/50 rounded-xl hover:bg-forge-gray-700/70 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'deposit' ? 'bg-forge-success/20' :
                activity.type === 'yield' ? 'bg-forge-primary/20' :
                activity.type === 'vote' ? 'bg-forge-info/20' :
                'bg-forge-warning/20'
              }`}>
                <span className="text-lg">
                  {activity.type === 'deposit' ? '💰' :
                   activity.type === 'yield' ? '⚡' :
                   activity.type === 'vote' ? '🗳️' : '💸'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">
                  {activity.type === 'deposit' && `Deposited ${activity.amount} ${activity.token} to ${activity.crucible}`}
                  {activity.type === 'yield' && `Earned ${activity.amount} ${activity.token} from ${activity.crucible}`}
                  {activity.type === 'vote' && `Voted "${activity.vote}" on ${activity.proposal}`}
                  {activity.type === 'withdraw' && `Withdrew ${activity.amount} ${activity.token} from ${activity.crucible}`}
                </p>
                <p className="text-forge-gray-400 text-sm">{activity.time}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                activity.status === 'completed' ? 'bg-forge-success/20 text-forge-success' : 'bg-forge-warning/20 text-forge-warning'
              }`}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (mainTab) {
      case 'dashboard':
        return renderDashboard()
      case 'crucibles':
        return <div className="text-center py-16"><h2 className="text-3xl font-bold text-white">Crucibles Page</h2></div>
      case 'governance':
        return <div className="text-center py-16"><h2 className="text-3xl font-bold text-white">Governance Page</h2></div>
      case 'analytics':
        return <div className="text-center py-16"><h2 className="text-3xl font-bold text-white">Analytics Page</h2></div>
      default:
        return renderDashboard()
    }
  }

  return (
    <>
      <Head>
        <title>Forge Protocol - Enhanced Dashboard</title>
        <meta name="description" content="Forge Protocol Enhanced Dashboard - Advanced DeFi Analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-forge-dark">
        {/* Enhanced Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-forge-gray-900/95 backdrop-blur-md border-b border-forge-gray-700/50 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <span className="text-3xl animate-pulse">🔥</span>
                    <span className="text-xl absolute -top-1 -right-1 animate-bounce">⚡</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-forge-primary to-forge-secondary bg-clip-text text-transparent">
                    Forge Protocol
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                {['dashboard', 'crucibles', 'governance', 'analytics'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setMainTab(tab)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      mainTab === tab 
                        ? 'bg-forge-primary/20 text-forge-primary border border-forge-primary/30' 
                        : 'text-forge-gray-300 hover:text-white hover:bg-forge-gray-800/50'
                    }`}
                  >
                    <span className="text-lg">🔥</span>
                    <span className="font-medium capitalize">{tab}</span>
                  </button>
                ))}
              </nav>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <button
                    onClick={handleDisconnect}
                    className="bg-forge-gray-800 hover:bg-forge-gray-700 text-white font-semibold px-6 py-3 rounded-lg border border-forge-gray-600 hover:border-forge-primary transition-all duration-300 flex items-center space-x-2"
                  >
                    <div className="w-3 h-3 bg-forge-success rounded-full animate-pulse"></div>
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="bg-gradient-to-r from-forge-primary to-forge-secondary hover:from-forge-primary-dark hover:to-forge-secondary-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-forge-gray-500 rounded-full"></div>
                        <span>Connect Wallet</span>
                      </>
                    )}
                  </button>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-md text-forge-gray-300 hover:text-white hover:bg-forge-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-forge-primary"
                >
                  {isMobileMenuOpen ? (
                    <span className="text-xl">✕</span>
                  ) : (
                    <span className="text-xl">☰</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-forge-gray-900/95 backdrop-blur-md border-b border-forge-gray-700/50 py-4">
              <nav className="flex flex-col items-center space-y-4">
                {['dashboard', 'crucibles', 'governance', 'analytics'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setMainTab(tab)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`text-lg font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                      mainTab === tab 
                        ? 'text-forge-primary bg-forge-primary/20' 
                        : 'text-forge-gray-300 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            {renderContent()}
          </div>
        </main>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-forge-dark/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-forge-primary/30 border-t-forge-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Connecting to Fogo testnet...</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
