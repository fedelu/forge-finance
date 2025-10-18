import React, { useState, useEffect } from 'react'
import Head from 'next/head'

export default function CompleteDashboard() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mainTab, setMainTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('tvl')
  const [isProcessing, setIsProcessing] = useState(false) // Add processing state to prevent rapid clicks
  
  // Enhanced analytics state with completely static data
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
    portfolioValue: 125000,
    totalFees: 1250,
    averageAPY: 8.5,
    riskScore: 3.2,
    yieldHistory: [],
    priceHistory: {},
    volumeHistory: {},
    userRank: 42,
    totalUsers: 500,
    weeklyChange: 12.5,
    monthlyChange: 28.3
  })

  // Mock data for different modules
  const [crucibles, setCrucibles] = useState([
    { id: 'sol-crucible', name: 'SOL Crucible', symbol: 'SOL', tvl: 500000, apr: 0.085, icon: '☀️', description: 'High-yield SOL staking with 8.5% APR', users: 1250, minDeposit: 1 },
    { id: 'eth-crucible', name: 'ETH Crucible', symbol: 'ETH', tvl: 750000, apr: 0.067, icon: '🔷', description: 'Ethereum staking with 6.7% APR', users: 890, minDeposit: 0.1 },
    { id: 'usdc-crucible', name: 'USDC Crucible', symbol: 'USDC', tvl: 300000, apr: 0.092, icon: '💵', description: 'Stable yield with 9.2% APR', users: 2100, minDeposit: 100 },
    { id: 'btc-crucible', name: 'BTC Crucible', symbol: 'BTC', tvl: 1200000, apr: 0.045, icon: '₿', description: 'Bitcoin staking with 4.5% APR', users: 650, minDeposit: 0.01 },
    { id: 'spark-crucible', name: 'SPARK Crucible', symbol: 'SPARK', tvl: 200000, apr: 0.125, icon: '⚡', description: 'Native token staking with 12.5% APR', users: 3200, minDeposit: 1000 },
    { id: 'heat-crucible', name: 'HEAT Crucible', symbol: 'HEAT', tvl: 150000, apr: 0.158, icon: '🔥', description: 'Reward token staking with 15.8% APR', users: 1800, minDeposit: 500 }
  ])

  const [proposals, setProposals] = useState([
    { 
      id: 'prop-001', 
      title: 'Increase SOL Crucible APR to 10%', 
      description: 'Proposal to increase the SOL Crucible APR from 8.5% to 10% to attract more liquidity',
      status: 'active',
      votesFor: 1250000,
      votesAgainst: 450000,
      totalVotes: 1700000,
      endDate: '2024-02-15',
      proposer: '0x1234...5678',
      category: 'governance'
    },
    { 
      id: 'prop-002', 
      title: 'Add New USDT Crucible', 
      description: 'Proposal to create a new USDT crucible with 7% APR for stablecoin yield farming',
      status: 'active',
      votesFor: 890000,
      votesAgainst: 210000,
      totalVotes: 1100000,
      endDate: '2024-02-20',
      proposer: '0x9876...5432',
      category: 'feature'
    },
    { 
      id: 'prop-003', 
      title: 'Reduce Protocol Fees to 0.5%', 
      description: 'Proposal to reduce protocol fees from 1% to 0.5% to increase user adoption',
      status: 'passed',
      votesFor: 2100000,
      votesAgainst: 300000,
      totalVotes: 2400000,
      endDate: '2024-01-30',
      proposer: '0x4567...8901',
      category: 'economics'
    }
  ])

  // Completely static data generation - no randomness at all
  useEffect(() => {
    const generateStaticHistoryData = (days: number, baseValue: number) => {
      const data = []
      const now = new Date()
      for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const sineValue = Math.sin(i * 0.1) * 0.1 + 1
        const value = baseValue * sineValue
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
      yieldHistory: generateStaticHistoryData(30, 1000),
      priceHistory: {
        SOL: generateStaticHistoryData(30, 100),
        USDC: generateStaticHistoryData(30, 1),
        ETH: generateStaticHistoryData(30, 2500),
        BTC: generateStaticHistoryData(30, 45000)
      },
      volumeHistory: generateStaticHistoryData(30, 50000)
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

  // Enhanced deposit handler with duplicate prevention
  const handleDeposit = (crucibleId: string, amount: number, token: string = 'SOL') => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!')
      return
    }
    
    if (isProcessing) {
      console.log('Transaction already processing, please wait...')
      return
    }
    
    setIsProcessing(true)
    
    // Prevent duplicate transactions by checking recent history
    const now = new Date()
    const recentTransactions = analytics.transactionHistory.filter(tx => 
      tx.type === 'deposit' && 
      tx.crucibleId === crucibleId && 
      tx.amount === amount &&
      (now.getTime() - new Date(tx.timestamp).getTime()) < 5000 // Within last 5 seconds
    )
    
    if (recentTransactions.length > 0) {
      console.log('Duplicate deposit prevented')
      setIsProcessing(false)
      return
    }
    
    setAnalytics(prev => {
      const newAnalytics = { ...prev }
      newAnalytics.totalDeposits += amount
      newAnalytics.portfolioValue += amount
      
      if (token in newAnalytics.tokenBalances) {
        newAnalytics.tokenBalances[token] = Math.max(0, newAnalytics.tokenBalances[token] - amount)
      }
      
      newAnalytics.cruciblePositions.push({
        crucibleId,
        amount,
        token,
        timestamp: new Date().toISOString(),
        apy: 8.5
      })
      
      newAnalytics.activeCrucibles = newAnalytics.cruciblePositions.length
      
      // Add transaction with unique ID to prevent duplicates
      const transactionId = `deposit_${crucibleId}_${amount}_${token}_${now.getTime()}`
      newAnalytics.transactionHistory.push({
        id: transactionId,
        type: 'deposit',
        amount,
        crucibleId,
        token,
        timestamp: new Date().toISOString()
      })
      
      return newAnalytics
    })
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false)
    }, 1000)
    
    alert(`💰 Successfully deposited ${amount} ${token} to Crucible ${crucibleId}!\n\nYour analytics have been updated.`)
  }

  // Enhanced withdrawal handler with duplicate prevention
  const handleWithdraw = (crucibleId: string, amount: number, token: string = 'SOL') => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!')
      return
    }
    
    if (isProcessing) {
      console.log('Transaction already processing, please wait...')
      return
    }
    
    setIsProcessing(true)
    
    // Prevent duplicate transactions by checking recent history
    const now = new Date()
    const recentTransactions = analytics.transactionHistory.filter(tx => 
      tx.type === 'withdraw' && 
      tx.crucibleId === crucibleId && 
      tx.amount === amount &&
      (now.getTime() - new Date(tx.timestamp).getTime()) < 5000 // Within last 5 seconds
    )
    
    if (recentTransactions.length > 0) {
      console.log('Duplicate withdrawal prevented')
      setIsProcessing(false)
      return
    }
    
    setAnalytics(prev => {
      const newAnalytics = { ...prev }
      newAnalytics.totalWithdrawals += amount
      newAnalytics.portfolioValue -= amount
      
      if (token in newAnalytics.tokenBalances) {
        newAnalytics.tokenBalances[token] += amount
      }
      
      newAnalytics.cruciblePositions = newAnalytics.cruciblePositions.filter(pos => pos.crucibleId !== crucibleId)
      newAnalytics.activeCrucibles = newAnalytics.cruciblePositions.length
      
      // Add transaction with unique ID to prevent duplicates
      const transactionId = `withdraw_${crucibleId}_${amount}_${token}_${now.getTime()}`
      newAnalytics.transactionHistory.push({
        id: transactionId,
        type: 'withdraw',
        amount,
        crucibleId,
        token,
        timestamp: new Date().toISOString()
      })
      
      return newAnalytics
    })
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false)
    }, 1000)
    
    alert(`💸 Successfully withdrew ${amount} ${token} from Crucible ${crucibleId}!\n\nYour analytics have been updated.`)
  }

  // Vote handler with duplicate prevention
  const handleVote = (proposalId: string, vote: 'yes' | 'no') => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!')
      return
    }
    
    if (isProcessing) {
      console.log('Transaction already processing, please wait...')
      return
    }
    
    setIsProcessing(true)
    
    // Prevent duplicate votes by checking recent history
    const now = new Date()
    const recentVotes = analytics.transactionHistory.filter(tx => 
      tx.type === 'vote' && 
      tx.proposalId === proposalId &&
      (now.getTime() - new Date(tx.timestamp).getTime()) < 5000 // Within last 5 seconds
    )
    
    if (recentVotes.length > 0) {
      console.log('Duplicate vote prevented')
      setIsProcessing(false)
      return
    }
    
    setAnalytics(prev => {
      const newAnalytics = { ...prev }
      newAnalytics.totalVotes += 1
      
      // Add transaction with unique ID to prevent duplicates
      const transactionId = `vote_${proposalId}_${vote}_${now.getTime()}`
      newAnalytics.transactionHistory.push({
        id: transactionId,
        type: 'vote',
        proposalId,
        vote,
        timestamp: new Date().toISOString()
      })
      
      return newAnalytics
    })
    
    // Reset processing state after a short delay
    setTimeout(() => {
      setIsProcessing(false)
    }, 1000)
    
    alert(`🗳️ Successfully voted "${vote}" on proposal ${proposalId}!\n\nYour vote has been recorded.`)
  }

  // Simple static chart component
  const StaticChart = ({ data, type = 'line', color = '#FF6B35', height = 200, className = '' }) => {
    const maxValue = Math.max(...data.map(d => d.value))
    const minValue = Math.min(...data.map(d => d.value))
    const range = maxValue - minValue || 1
    
    return (
      <div className={`relative ${className}`} style={{ height: `${height}px` }}>
        <div className="absolute inset-0 flex items-end justify-between">
          {data.map((point, index) => {
            const barHeight = ((point.value - minValue) / range) * height
            return (
              <div
                key={index}
                className="flex-1 mx-0.5 rounded-t"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  opacity: 0.8
                }}
              />
            )
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-forge-gray-400 text-sm">Chart Data</div>
        </div>
      </div>
    )
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Portfolio Overview */}
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
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">Total Deposits</p>
            <p className="text-xl font-bold text-white">${analytics.totalDeposits.toLocaleString()}</p>
          </div>
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">Total Yield</p>
            <p className="text-xl font-bold text-white">${analytics.totalYieldEarned.toLocaleString()}</p>
          </div>
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">Avg APY</p>
            <p className="text-xl font-bold text-forge-success">{analytics.averageAPY}%</p>
          </div>
          <div className="bg-forge-gray-800/50 rounded-xl p-4">
            <p className="text-forge-gray-400 text-sm">Active Crucibles</p>
            <p className="text-xl font-bold text-forge-primary">{analytics.activeCrucibles}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <StaticChart 
              data={analytics.yieldHistory.slice(-(timeRange === '1d' ? 7 : timeRange === '7d' ? 7 : 30))} 
              color="#FF6B35"
              height={200}
            />
          </div>
        </div>

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
            <StaticChart 
              data={selectedMetric === 'tvl' ? (Array.isArray(analytics.yieldHistory) ? analytics.yieldHistory.slice(-30) : []) : 
                    selectedMetric === 'price' ? (Array.isArray(analytics.priceHistory) ? analytics.priceHistory.slice(-30) : []) :
                    Array.isArray(analytics.volumeHistory) ? analytics.volumeHistory.slice(-30) : []} 
              color={selectedMetric === 'tvl' ? '#FF6B35' : selectedMetric === 'price' ? '#F7931E' : '#FFD23F'}
              height={200}
            />
          </div>
        </div>
      </div>

      {/* Token Holdings */}
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
            const staticChanges = [8.2, 5.1, 12.3, 7.8, 9.4, 6.7]
            
            return (
              <div key={token} className="group bg-forge-gray-700/50 rounded-xl p-4 hover:bg-forge-gray-700/70 transition-all duration-300 hover:scale-105">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{icons[index % icons.length]}</span>
                </div>
                <p className="text-forge-gray-400 text-sm font-medium mb-1 text-center">{token}</p>
                <p className="text-white font-bold text-lg text-center">{balance.toLocaleString()}</p>
                <p className="text-forge-success text-xs text-center mt-1">+{staticChanges[index % staticChanges.length]}%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
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

      {/* Recent Activity */}
      <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {analytics.transactionHistory.length === 0 ? (
            <p className="text-forge-gray-400 text-center py-8">No transactions yet. Connect your wallet and start using the protocol!</p>
          ) : (
            analytics.transactionHistory.slice(-10).reverse().map((tx, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-forge-gray-700/50 rounded-xl hover:bg-forge-gray-700/70 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-forge-success/20' :
                  tx.type === 'yield' ? 'bg-forge-primary/20' :
                  tx.type === 'vote' ? 'bg-forge-info/20' :
                  'bg-forge-warning/20'
                }`}>
                  <span className="text-lg">
                    {tx.type === 'deposit' ? '💰' :
                     tx.type === 'yield' ? '⚡' :
                     tx.type === 'vote' ? '🗳️' : '💸'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {tx.type === 'deposit' && `Deposited ${tx.amount} ${tx.token} to Crucible ${tx.crucibleId}`}
                    {tx.type === 'yield' && `Earned ${tx.amount} ${tx.token} from ${tx.crucibleId}`}
                    {tx.type === 'vote' && `Voted "${tx.vote}" on ${tx.proposalId}`}
                    {tx.type === 'withdraw' && `Withdrew ${tx.amount} ${tx.token} from Crucible ${tx.crucibleId}`}
                  </p>
                  <p className="text-forge-gray-400 text-sm">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-forge-success/20 text-forge-success">
                  completed
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderCrucibles = () => (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Crucible Management</h1>
        <p className="text-forge-gray-300 text-lg">Deposit tokens into crucibles to earn yield</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {crucibles.map(crucible => (
          <div key={crucible.id} className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forge-primary to-forge-secondary flex items-center justify-center">
                  <span className="text-3xl">{crucible.icon}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{crucible.name}</h3>
                  <p className="text-forge-gray-400">{crucible.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-forge-success font-bold text-xl">{crucible.apr * 100}% APR</p>
                <p className="text-forge-gray-400 text-sm">${crucible.tvl.toLocaleString()} TVL</p>
              </div>
            </div>

            <p className="text-forge-gray-300 mb-6">{crucible.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-forge-gray-700/50 rounded-lg p-3">
                <p className="text-forge-gray-400">Users</p>
                <p className="text-white font-bold">{crucible.users.toLocaleString()}</p>
              </div>
              <div className="bg-forge-gray-700/50 rounded-lg p-3">
                <p className="text-forge-gray-400">Min Deposit</p>
                <p className="text-white font-bold">{crucible.minDeposit} {crucible.symbol}</p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="number"
                placeholder={`Amount to deposit (min ${crucible.minDeposit} ${crucible.symbol})`}
                className="w-full px-4 py-3 bg-forge-gray-700/50 border border-forge-gray-600 rounded-lg text-white placeholder-forge-gray-400 focus:outline-none focus:border-forge-primary"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeposit(crucible.id, crucible.minDeposit, crucible.symbol)}
                  disabled={isProcessing}
                  className={`flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors ${
                    isProcessing 
                      ? 'bg-forge-gray-500 cursor-not-allowed' 
                      : 'bg-forge-primary hover:bg-forge-primary-dark'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Deposit'}
                </button>
                <button
                  onClick={() => handleWithdraw(crucible.id, crucible.minDeposit / 2, crucible.symbol)}
                  disabled={isProcessing}
                  className={`flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors ${
                    isProcessing 
                      ? 'bg-forge-gray-500 cursor-not-allowed' 
                      : 'bg-forge-gray-600 hover:bg-forge-gray-500'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderGovernance = () => (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Governance</h1>
        <p className="text-forge-gray-300 text-lg">Vote on proposals and shape the protocol's future</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {proposals.map(proposal => (
          <div key={proposal.id} className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{proposal.title}</h3>
                <p className="text-forge-gray-300 mb-4">{proposal.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-3 py-1 rounded-full ${
                    proposal.status === 'active' ? 'bg-forge-primary/20 text-forge-primary' :
                    proposal.status === 'passed' ? 'bg-forge-success/20 text-forge-success' :
                    'bg-forge-gray-500/20 text-forge-gray-400'
                  }`}>
                    {proposal.status.toUpperCase()}
                  </span>
                  <span className="text-forge-gray-400">Ends: {proposal.endDate}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-forge-gray-400">Votes For</span>
                <span className="text-white font-bold">{proposal.votesFor.toLocaleString()}</span>
              </div>
              <div className="w-full bg-forge-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-forge-success h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-forge-gray-400">Votes Against</span>
                <span className="text-white font-bold">{proposal.votesAgainst.toLocaleString()}</span>
              </div>
              <div className="w-full bg-forge-gray-700 rounded-full h-3">
                <div 
                  className="bg-forge-error h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(proposal.votesAgainst / proposal.totalVotes) * 100}%` }}
                ></div>
              </div>
            </div>

            {proposal.status === 'active' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVote(proposal.id, 'yes')}
                  disabled={isProcessing}
                  className={`flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors ${
                    isProcessing 
                      ? 'bg-forge-gray-500 cursor-not-allowed' 
                      : 'bg-forge-success hover:bg-green-600'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Vote For'}
                </button>
                <button
                  onClick={() => handleVote(proposal.id, 'no')}
                  disabled={isProcessing}
                  className={`flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-colors ${
                    isProcessing 
                      ? 'bg-forge-gray-500 cursor-not-allowed' 
                      : 'bg-forge-error hover:bg-red-600'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Vote Against'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Advanced Analytics</h1>
        <p className="text-forge-gray-300 text-lg">Detailed insights into your DeFi performance</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-forge-primary/20 to-forge-primary-dark/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">Total Yield Earned</p>
              <p className="text-3xl font-bold text-white">${analytics.totalYieldEarned.toLocaleString()}</p>
              <p className="text-forge-success text-sm mt-2">+{analytics.weeklyChange}% this week</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-primary to-forge-primary-dark flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-forge-accent/20 to-yellow-400/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-accent/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">Portfolio Value</p>
              <p className="text-3xl font-bold text-white">${analytics.portfolioValue.toLocaleString()}</p>
              <p className="text-forge-success text-sm mt-2">+{analytics.monthlyChange}% this month</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-accent to-yellow-400 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-forge-info/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-info/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">User Ranking</p>
              <p className="text-3xl font-bold text-white">#{analytics.userRank}</p>
              <p className="text-forge-info text-sm mt-2">of {analytics.totalUsers} users</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-info to-blue-500 flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-forge-success/20 to-green-500/20 backdrop-blur-sm rounded-2xl p-6 border border-forge-success/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-300 text-sm font-medium mb-2">Risk Score</p>
              <p className="text-3xl font-bold text-white">{analytics.riskScore}/10</p>
              <p className="text-forge-success text-sm mt-2">Low Risk</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-success to-green-500 flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">Yield Performance</h3>
          <div className="h-64">
            <StaticChart 
              data={analytics.yieldHistory.slice(-30)} 
              color="#FF6B35"
              height={200}
            />
          </div>
        </div>

        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-6">Token Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analytics.tokenBalances).map(([token, balance], index) => {
              const percentage = (balance / analytics.portfolioValue) * 100
              const colors = ['#FF6B35', '#F7931E', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899']
              
              return (
                <div key={token} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                    <span className="text-white font-medium">{token}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-forge-gray-400">{balance.toLocaleString()}</span>
                    <span className="text-white font-bold">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Transaction History</h3>
        <div className="space-y-4">
          {analytics.transactionHistory.length === 0 ? (
            <p className="text-forge-gray-400 text-center py-8">No transactions yet. Start using the protocol to see your activity here!</p>
          ) : (
            analytics.transactionHistory.map((tx, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-forge-gray-700/50 rounded-xl hover:bg-forge-gray-700/70 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-forge-success/20' :
                  tx.type === 'yield' ? 'bg-forge-primary/20' :
                  tx.type === 'vote' ? 'bg-forge-info/20' :
                  'bg-forge-warning/20'
                }`}>
                  <span className="text-lg">
                    {tx.type === 'deposit' ? '💰' :
                     tx.type === 'yield' ? '⚡' :
                     tx.type === 'vote' ? '🗳️' : '💸'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {tx.type === 'deposit' && `Deposited ${tx.amount} ${tx.token} to Crucible ${tx.crucibleId}`}
                    {tx.type === 'yield' && `Earned ${tx.amount} ${tx.token} from ${tx.crucibleId}`}
                    {tx.type === 'vote' && `Voted "${tx.vote}" on ${tx.proposalId}`}
                    {tx.type === 'withdraw' && `Withdrew ${tx.amount} ${tx.token} from Crucible ${tx.crucibleId}`}
                  </p>
                  <p className="text-forge-gray-400 text-sm">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-forge-success/20 text-forge-success">
                  completed
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (mainTab) {
      case 'dashboard':
        return renderDashboard()
      case 'crucibles':
        return renderCrucibles()
      case 'governance':
        return renderGovernance()
      case 'analytics':
        return renderAnalytics()
      default:
        return renderDashboard()
    }
  }

  return (
    <>
      <Head>
        <title>Forge Protocol - Complete Dashboard</title>
        <meta name="description" content="Forge Protocol Complete Dashboard - Full DeFi Experience" />
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
