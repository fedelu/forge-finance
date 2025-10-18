import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FireIcon, 
  BoltIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

import EnhancedHeader from '../components/EnhancedHeader'
import RealTimeStats from '../components/RealTimeStats'
import LoadingSpinner from '../components/LoadingSpinner'
import Notification from '../components/Notification'
import Chart from '../components/Chart'
import ProgressBar from '../components/ProgressBar'

export default function EnhancedDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'warning' | 'error' | 'info'
    title: string
    message?: string
  }>>([])

  // Mock protocol stats
  const protocolStats = {
    totalCrucibles: 10,
    totalTVL: 1_000_000,
    totalUsers: 500,
    averageAPR: 0.08,
  }

  const handleConnect = () => {
    setLoading(true)
    setTimeout(() => {
      setIsConnected(true)
      setLoading(false)
      addNotification('success', 'Wallet Connected', 'Successfully connected to Fogo testnet!')
    }, 1500)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    addNotification('info', 'Wallet Disconnected', 'You have been disconnected from the wallet.')
  }

  const addNotification = (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, title, message }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Mock crucibles data
  const crucibles = [
    {
      id: 1,
      name: 'SOL Vault',
      apy: 12.5,
      tvl: 250000,
      color: 'from-purple-500 to-pink-500',
      icon: '🔥'
    },
    {
      id: 2,
      name: 'USDC Pool',
      apy: 8.2,
      tvl: 180000,
      color: 'from-blue-500 to-cyan-500',
      icon: '💎'
    },
    {
      id: 3,
      name: 'ETH Staking',
      apy: 15.8,
      tvl: 320000,
      color: 'from-orange-500 to-red-500',
      icon: '⚡'
    },
    {
      id: 4,
      name: 'BTC Reserve',
      apy: 6.4,
      tvl: 150000,
      color: 'from-yellow-500 to-orange-500',
      icon: '🛡️'
    }
  ]

  const governanceProposals = [
    {
      id: 1,
      title: 'Increase SOL Vault APY',
      description: 'Proposal to increase the APY for SOL vault from 12.5% to 15%',
      status: 'active',
      votesFor: 1250,
      votesAgainst: 320,
      endDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Add New Token Support',
      description: 'Add support for USDT and DAI tokens in the protocol',
      status: 'pending',
      votesFor: 890,
      votesAgainst: 150,
      endDate: '2024-01-20'
    }
  ]

  const renderDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div className="text-center py-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-forge-primary/20 px-4 py-2 rounded-full border border-forge-primary/30 mb-6">
            <SparklesIcon className="h-5 w-5 text-forge-primary" />
            <span className="text-forge-primary font-semibold">Live on Fogo Testnet</span>
          </div>
          <h1 className="text-6xl font-bold text-gradient mb-6">
            Welcome to Forge Protocol
          </h1>
          <p className="text-xl text-forge-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            A modular DeFi protocol on Solana. Deposit tokens into Crucibles, earn yield with Heat, 
            and participate in governance with Sparks. Built for the future of decentralized finance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.button 
              className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RocketLaunchIcon className="h-6 w-6" />
              <span>Get Started</span>
            </motion.button>
            <motion.button 
              className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShieldCheckIcon className="h-6 w-6" />
              <span>Learn More</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Real-time Stats */}
      <RealTimeStats />

      {/* Quick Actions */}
      <motion.div 
        className="card-glow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: FireIcon,
              title: 'Deposit Tokens',
              description: 'Add liquidity to earn yield',
              color: 'from-forge-primary to-forge-secondary',
              action: () => addNotification('info', 'Deposit', 'Deposit functionality coming soon!')
            },
            {
              icon: ChartBarIcon,
              title: 'View Analytics',
              description: 'Track your performance',
              color: 'from-forge-accent to-yellow-400',
              action: () => setActiveTab('analytics')
            },
            {
              icon: UserGroupIcon,
              title: 'Governance',
              description: 'Vote on proposals',
              color: 'from-green-500 to-emerald-500',
              action: () => setActiveTab('governance')
            }
          ].map((item, index) => (
            <motion.button
              key={item.title}
              onClick={item.action}
              className="group p-8 bg-forge-gray-800/50 rounded-2xl border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-forge-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-forge-gray-400 group-hover:text-forge-gray-300 transition-colors">
                {item.description}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )

  const renderCrucibles = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Crucibles</h1>
        <p className="text-forge-gray-400 text-lg">Deposit tokens and earn yield</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {crucibles.map((crucible, index) => (
          <motion.div
            key={crucible.id}
            className="card-hover group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${crucible.color} flex items-center justify-center text-2xl`}>
                  {crucible.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{crucible.name}</h3>
                  <p className="text-forge-gray-400">Vault Pool</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-forge-primary">{crucible.apy}%</div>
                <div className="text-sm text-forge-gray-400">APY</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-forge-gray-400">TVL</span>
                <span className="text-white font-semibold">
                  ${crucible.tvl.toLocaleString()}
                </span>
              </div>
              
              <ProgressBar 
                progress={Math.random() * 100} 
                color="primary" 
                animated={true}
              />

              <div className="flex space-x-3">
                <motion.button 
                  className="btn-primary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addNotification('info', 'Deposit', `Depositing into ${crucible.name}`)}
                >
                  Deposit
                </motion.button>
                <motion.button 
                  className="btn-secondary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addNotification('info', 'Withdraw', `Withdrawing from ${crucible.name}`)}
                >
                  Withdraw
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderGovernance = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Governance</h1>
        <p className="text-forge-gray-400 text-lg">Vote on protocol proposals</p>
      </div>

      <div className="space-y-6">
        {governanceProposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            className="card-hover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{proposal.title}</h3>
                <p className="text-forge-gray-400 mb-4">{proposal.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className={`px-3 py-1 rounded-full ${
                    proposal.status === 'active' 
                      ? 'bg-forge-success/20 text-forge-success' 
                      : 'bg-forge-warning/20 text-forge-warning'
                  }`}>
                    {proposal.status}
                  </span>
                  <span className="text-forge-gray-400">
                    Ends: {proposal.endDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-forge-gray-400">Votes</span>
                <div className="flex space-x-4">
                  <span className="text-forge-success font-semibold">
                    {proposal.votesFor} For
                  </span>
                  <span className="text-forge-error font-semibold">
                    {proposal.votesAgainst} Against
                  </span>
                </div>
              </div>

              <ProgressBar 
                progress={(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}
                color="success"
                showPercentage={true}
                animated={true}
              />

              <div className="flex space-x-3">
                <motion.button 
                  className="btn-primary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addNotification('success', 'Vote Cast', 'Your vote has been recorded!')}
                >
                  Vote For
                </motion.button>
                <motion.button 
                  className="btn-danger flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addNotification('info', 'Vote Cast', 'Your vote has been recorded!')}
                >
                  Vote Against
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  const renderAnalytics = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">Analytics</h1>
        <p className="text-forge-gray-400 text-lg">Track your performance and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="card-glow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Portfolio Performance</h3>
          <Chart 
            data={[
              { label: 'Jan', value: 100000, color: '#FF6B35' },
              { label: 'Feb', value: 120000, color: '#F7931E' },
              { label: 'Mar', value: 110000, color: '#FFD23F' },
              { label: 'Apr', value: 140000, color: '#10B981' },
              { label: 'May', value: 160000, color: '#3B82F6' },
              { label: 'Jun', value: 180000, color: '#8B5CF6' }
            ]}
            type="line"
            height={300}
            showValues={true}
            animated={true}
          />
        </motion.div>

        <motion.div 
          className="card-glow"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-white mb-6">Asset Distribution</h3>
          <Chart 
            data={[
              { label: 'SOL', value: 40, color: '#FF6B35' },
              { label: 'USDC', value: 30, color: '#F7931E' },
              { label: 'ETH', value: 20, color: '#FFD23F' },
              { label: 'BTC', value: 10, color: '#10B981' }
            ]}
            type="pie"
            height={300}
            showValues={true}
            animated={true}
          />
        </motion.div>
      </div>
    </motion.div>
  )

  const renderContent = () => {
    switch (activeTab) {
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
        <title>Forge Protocol - Enhanced Demo</title>
        <meta name="description" content="Forge Protocol Enhanced Demo - Advanced DeFi on Solana" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-forge-dark">
        {/* Enhanced Header */}
        <EnhancedHeader
          isConnected={isConnected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          loading={loading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <main className="pt-24 pb-8">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </main>

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <AnimatePresence>
            {notifications.map((notification) => (
              <Notification
                key={notification.id}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                onClose={() => removeNotification(notification.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-forge-dark/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <LoadingSpinner size="xl" text="Connecting to Fogo testnet..." />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
