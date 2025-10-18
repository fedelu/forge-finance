import React, { useState } from 'react'
import Head from 'next/head'

export default function FinalDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mainTab, setMainTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Wallet analytics state
  const [walletAnalytics, setWalletAnalytics] = useState({
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
    transactionHistory: []
  })

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

  const handleDeposit = (crucibleId: string, amount: number) => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!')
      return
    }
    
    setWalletAnalytics(prev => ({
      ...prev,
      totalDeposits: prev.totalDeposits + amount,
      activeCrucibles: prev.activeCrucibles + 1,
      cruciblePositions: [...prev.cruciblePositions, {
        crucibleId,
        amount,
        timestamp: new Date().toISOString(),
        apy: 8.5
      }],
      transactionHistory: [...prev.transactionHistory, {
        type: 'deposit',
        amount,
        crucibleId,
        timestamp: new Date().toISOString()
      }]
    }))
    
    alert(`💰 Successfully deposited ${amount} tokens to Crucible ${crucibleId}!\n\nYour wallet analytics have been updated.`)
  }

  const handleWithdraw = (crucibleId: string, amount: number) => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!')
      return
    }
    
    setWalletAnalytics(prev => ({
      ...prev,
      totalWithdrawals: prev.totalWithdrawals + amount,
      activeCrucibles: Math.max(0, prev.activeCrucibles - 1),
      cruciblePositions: prev.cruciblePositions.filter(pos => pos.crucibleId !== crucibleId),
      transactionHistory: [...prev.transactionHistory, {
        type: 'withdraw',
        amount,
        crucibleId,
        timestamp: new Date().toISOString()
      }]
    }))
    
    alert(`💸 Successfully withdrew ${amount} tokens from Crucible ${crucibleId}!\n\nYour wallet analytics have been updated.`)
  }

  const handleVote = (proposalId: string, vote: 'yes' | 'no') => {
    if (!isConnected) {
      alert('⚠️ Please connect your wallet first!')
      return
    }
    
    setWalletAnalytics(prev => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      transactionHistory: [...prev.transactionHistory, {
        type: 'vote',
        proposalId,
        vote,
        timestamp: new Date().toISOString()
      }]
    }))
    
    alert(`🗳️ Successfully voted "${vote}" on proposal ${proposalId}!\n\nYour wallet analytics have been updated.`)
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Protocol Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-1">Total Crucibles</p>
              <p className="text-3xl font-bold text-white">10</p>
              <p className="text-forge-success text-sm mt-2">+2 this week</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-primary to-forge-secondary flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-1">Total TVL</p>
              <p className="text-3xl font-bold text-white">$1.2M</p>
              <p className="text-forge-success text-sm mt-2">+5.2% (24h)</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-accent to-yellow-400 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-1">Active Users</p>
              <p className="text-3xl font-bold text-white">500</p>
              <p className="text-forge-success text-sm mt-2">+12 today</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-info to-blue-500 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-1">Average APR</p>
              <p className="text-3xl font-bold text-white">8.5%</p>
              <p className="text-forge-info text-sm mt-2">+0.2% this week</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-success to-green-500 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button 
            onClick={() => handleQuickAction('deposit')}
            className="group p-8 bg-forge-gray-800/50 rounded-2xl border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 text-left hover:scale-105"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-forge-primary to-forge-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🔥</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-forge-primary transition-colors">
              Deposit Tokens
            </h3>
            <p className="text-forge-gray-400 group-hover:text-forge-gray-300 transition-colors">
              Add liquidity to earn yield
            </p>
          </button>

          <button 
            onClick={() => handleQuickAction('analytics')}
            className="group p-8 bg-forge-gray-800/50 rounded-2xl border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 text-left hover:scale-105"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-forge-accent to-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-forge-primary transition-colors">
              View Analytics
            </h3>
            <p className="text-forge-gray-400 group-hover:text-forge-gray-300 transition-colors">
              Track your performance
            </p>
          </button>

          <button 
            onClick={() => handleQuickAction('governance')}
            className="group p-8 bg-forge-gray-800/50 rounded-2xl border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 text-left hover:scale-105"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl">🗳️</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-forge-primary transition-colors">
              Governance
            </h3>
            <p className="text-forge-gray-400 group-hover:text-forge-gray-300 transition-colors">
              Vote on proposals
            </p>
          </button>
        </div>
      </div>
    </div>
  )

  const renderCrucibles = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">Crucible Management</h2>
      
      {/* Crucible List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'sol-crucible', name: 'SOL Crucible', symbol: 'SOL', tvl: 500000, apr: 0.085, icon: '☀️' },
          { id: 'eth-crucible', name: 'ETH Crucible', symbol: 'ETH', tvl: 750000, apr: 0.067, icon: '🔷' },
          { id: 'usdc-crucible', name: 'USDC Crucible', symbol: 'USDC', tvl: 300000, apr: 0.092, icon: '💵' }
        ].map(crucible => (
          <div key={crucible.id} className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{crucible.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{crucible.name}</h3>
                  <p className="text-forge-gray-400">{crucible.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-forge-success font-bold">{crucible.apr * 100}% APR</p>
                <p className="text-forge-gray-400 text-sm">${crucible.tvl.toLocaleString()} TVL</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Amount to deposit"
                className="w-full px-4 py-3 bg-forge-gray-700/50 border border-forge-gray-600 rounded-lg text-white placeholder-forge-gray-400 focus:outline-none focus:border-forge-primary"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeposit(crucible.id, 100)}
                  className="flex-1 bg-forge-primary hover:bg-forge-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Deposit
                </button>
                <button
                  onClick={() => handleWithdraw(crucible.id, 50)}
                  className="flex-1 bg-forge-gray-700 hover:bg-forge-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Withdraw
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
      <h2 className="text-3xl font-bold text-white text-center mb-8">Governance Proposals</h2>
      
      {/* Proposals List */}
      <div className="space-y-6">
        {[
          { id: 'prop-1', title: 'Increase SOL Crucible APR', description: 'Proposal to increase SOL crucible APR from 8.5% to 10%', votes: { yes: 75, no: 25 }, status: 'active' },
          { id: 'prop-2', title: 'Add New ETH Crucible', description: 'Proposal to add a new ETH crucible with 7% APR', votes: { yes: 60, no: 40 }, status: 'active' },
          { id: 'prop-3', title: 'Update Protocol Fees', description: 'Proposal to reduce protocol fees from 0.5% to 0.3%', votes: { yes: 80, no: 20 }, status: 'passed' }
        ].map(proposal => (
          <div key={proposal.id} className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
                <p className="text-forge-gray-400 mb-4">{proposal.description}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    proposal.status === 'active' ? 'bg-forge-success/20 text-forge-success' : 'bg-forge-primary/20 text-forge-primary'
                  }`}>
                    {proposal.status === 'active' ? 'Active' : 'Passed'}
                  </span>
                  <span className="text-forge-gray-400 text-sm">ID: {proposal.id}</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-forge-gray-400 mb-2">
                <span>Yes: {proposal.votes.yes}%</span>
                <span>No: {proposal.votes.no}%</span>
              </div>
              <div className="w-full bg-forge-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-forge-success to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${proposal.votes.yes}%` }}
                ></div>
              </div>
            </div>
            
            {proposal.status === 'active' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVote(proposal.id, 'yes')}
                  className="flex-1 bg-forge-success hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Vote Yes
                </button>
                <button
                  onClick={() => handleVote(proposal.id, 'no')}
                  className="flex-1 bg-forge-error hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Vote No
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderWalletAnalytics = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8 flex items-center justify-center">
        <span className="text-4xl mr-3">👛</span>
        Your Wallet Analytics
      </h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Total Deposits</p>
              <p className="text-3xl font-bold text-white">${walletAnalytics.totalDeposits.toLocaleString()}</p>
              <p className="text-forge-success text-sm mt-2">+12.5%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-primary to-forge-primary-dark flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Total Yield Earned</p>
              <p className="text-3xl font-bold text-white">${walletAnalytics.totalYieldEarned.toLocaleString()}</p>
              <p className="text-forge-success text-sm mt-2">+8.2%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-success to-green-500 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Active Crucibles</p>
              <p className="text-3xl font-bold text-white">{walletAnalytics.activeCrucibles}</p>
              <p className="text-forge-primary text-sm mt-2">Earning Yield</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-secondary to-forge-secondary-dark flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>

        <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-forge-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Total Votes</p>
              <p className="text-3xl font-bold text-white">{walletAnalytics.totalVotes}</p>
              <p className="text-forge-info text-sm mt-2">Governance</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-info to-blue-500 flex items-center justify-center">
              <span className="text-2xl">🗳️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Balances */}
      <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Token Balances</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(walletAnalytics.tokenBalances).map(([token, balance]) => (
            <div key={token} className="text-center p-4 bg-forge-gray-700/50 rounded-lg">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forge-primary to-forge-secondary flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💰</span>
              </div>
              <p className="text-forge-gray-400 text-sm font-medium mb-1">{token}</p>
              <p className="text-white font-bold text-lg">{balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-forge-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-forge-gray-700/50">
        <h3 className="text-2xl font-bold text-white mb-6">Recent Transactions</h3>
        <div className="space-y-3">
          {walletAnalytics.transactionHistory.length === 0 ? (
            <p className="text-forge-gray-400 text-center py-8">No transactions yet. Connect your wallet and start using the protocol!</p>
          ) : (
            walletAnalytics.transactionHistory.slice(-10).reverse().map((tx, index) => (
              <div key={index} className="bg-forge-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      tx.type === 'deposit' ? 'bg-forge-success' : 
                      tx.type === 'withdraw' ? 'bg-forge-error' : 
                      'bg-forge-info'
                    }`}></div>
                    <div>
                      <p className="text-white font-medium capitalize">{tx.type}</p>
                      {tx.amount && <p className="text-forge-gray-400">${tx.amount.toLocaleString()}</p>}
                      {tx.crucibleId && <p className="text-forge-gray-400">Crucible {tx.crucibleId}</p>}
                      {tx.proposalId && <p className="text-forge-gray-400">Proposal {tx.proposalId}</p>}
                    </div>
                  </div>
                  <p className="text-forge-gray-400 text-sm">
                    {new Date(tx.timestamp).toLocaleString()}
                  </p>
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
        return renderWalletAnalytics()
      default:
        return renderDashboard()
    }
  }

  return (
    <>
      <Head>
        <title>Forge Protocol - Final Demo</title>
        <meta name="description" content="Forge Protocol Final Demo - DeFi on Solana" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-forge-dark">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-forge-gray-900/95 backdrop-blur-md border-b border-forge-gray-700/50 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <span className="text-3xl">🔥</span>
                    <span className="text-xl absolute -top-1 -right-1">⚡</span>
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
                    <div className="w-3 h-3 bg-forge-success rounded-full"></div>
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
