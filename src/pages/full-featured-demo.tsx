import React, { useState } from 'react'
import Head from 'next/head'
import { 
  FireIcon, 
  BoltIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import SimpleStats from '../components/SimpleStats'
import CrucibleManager from '../components/CrucibleManager'
import GovernancePanel from '../components/GovernancePanel'

export default function FullFeaturedDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('deposit')
  const [mainTab, setMainTab] = useState('dashboard')
  const [amount, setAmount] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Mock protocol stats
  const protocolStats = {
    totalCrucibles: 10,
    totalTVL: 1_000_000,
    totalUsers: 500,
    averageAPR: 0.08,
  }

  const handleConnect = () => {
    setLoading(true)
    // Simulate wallet connection with Fogo testnet
    setTimeout(() => {
      setIsConnected(true)
      setLoading(false)
      // Show success message
      alert('✅ Wallet connected successfully!\n\nYour Fogo testnet wallet is now connected.\nYou can now deposit, withdraw, and interact with the protocol.')
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
        alert('💰 Deposit Tokens\n\nYou can now deposit tokens into Crucibles to earn yield.\n\nThis feature is ready for real transactions!')
        break
      case 'analytics':
        alert('📊 View Analytics\n\nAccess detailed analytics and performance metrics.\n\nYour portfolio data is now available!')
        break
      case 'governance':
        alert('🗳️ Governance\n\nParticipate in protocol governance and vote on proposals.\n\nYour voting power is now active!')
        break
      default:
        alert(`🚀 ${action} action ready!\n\nYour wallet is connected and ready to use.`)
    }
  }

  const handleAction = (action: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first!')
      return
    }
    
    if (action === 'deposit') {
      alert(`Depositing ${amount || '0'} tokens to Crucible...`)
    } else if (action === 'withdraw') {
      alert(`Withdrawing ${amount || '0'} tokens from Crucible...`)
    } else if (action === 'claim') {
      alert('Claiming rewards...')
    }
  }

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gradient mb-6">
            Welcome to Forge Protocol
          </h1>
          <p className="text-xl text-forge-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            A modular DeFi protocol on Solana. Deposit tokens into Crucibles, earn yield with Heat, 
            and participate in governance with Sparks.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="btn-primary text-lg px-8 py-4">Get Started</button>
            <button className="btn-secondary text-lg px-8 py-4">Learn More</button>
          </div>
        </div>
      </div>

      {/* Real-time Stats */}
      <SimpleStats />

      {/* Quick Actions */}
      <div className="card-glow">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button 
            onClick={() => handleQuickAction('deposit')}
            className="group p-8 bg-forge-gray-800/50 rounded-2xl border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 text-left hover-lift"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-forge-primary to-forge-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FireIcon className="h-8 w-8 text-white" />
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
            className="group p-8 bg-forge-gray-800/50 rounded-2xl border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 text-left hover-lift"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-forge-accent to-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ChartBarIcon className="h-8 w-8 text-white" />
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
            className="group p-8 bg-forge-gray-800/50 rounded-2xl border border-forge-gray-700/50 hover:border-forge-primary/30 transition-all duration-300 text-left hover-lift"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <UserGroupIcon className="h-8 w-8 text-white" />
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
      <CrucibleManager />
    </div>
  )

  const renderGovernance = () => (
    <div className="space-y-8">
      <GovernancePanel />
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-8">
      <div className="card-glow">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Analytics Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-hover group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-forge-gray-400 text-sm font-medium mb-2">24h Volume</p>
                <p className="text-3xl font-bold text-white mb-2">$250,000</p>
                <div className="flex items-center space-x-1">
                  <ArrowUpIcon className="h-4 w-4 text-forge-success" />
                  <span className="text-sm font-medium text-forge-success">+12.5%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-forge-primary to-forge-primary-dark group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card-hover group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-forge-gray-400 text-sm font-medium mb-2">Active Users</p>
                <p className="text-3xl font-bold text-white mb-2">1,250</p>
                <div className="flex items-center space-x-1">
                  <ArrowUpIcon className="h-4 w-4 text-forge-success" />
                  <span className="text-sm font-medium text-forge-success">+8.2%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-forge-success to-green-500 group-hover:scale-110 transition-transform duration-300">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card-hover group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-forge-gray-400 text-sm font-medium mb-2">Fees Earned</p>
                <p className="text-3xl font-bold text-white mb-2">$12,500</p>
                <div className="flex items-center space-x-1">
                  <ArrowUpIcon className="h-4 w-4 text-forge-success" />
                  <span className="text-sm font-medium text-forge-success">+15.3%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-forge-secondary to-forge-secondary-dark group-hover:scale-110 transition-transform duration-300">
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card-hover group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-forge-gray-400 text-sm font-medium mb-2">Market Cap</p>
                <p className="text-3xl font-bold text-white mb-2">$5.2M</p>
                <div className="flex items-center space-x-1">
                  <ArrowUpIcon className="h-4 w-4 text-forge-success" />
                  <span className="text-sm font-medium text-forge-success">+22.1%</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-forge-info to-blue-500 group-hover:scale-110 transition-transform duration-300">
                <FireIcon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
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
        <title>Forge Protocol - Full Featured Demo</title>
        <meta name="description" content="Forge Protocol Full Featured Demo - DeFi on Solana" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-forge-dark">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-forge-gray-900/95 backdrop-blur-md border-b border-forge-gray-700/50 shadow-forge-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <FireIcon className="h-8 w-8 text-forge-primary animate-pulse-glow" />
                    <BoltIcon className="h-5 w-5 text-forge-accent absolute -top-1 -right-1 animate-bounce-gentle" />
                  </div>
                  <h1 className="text-2xl font-bold text-gradient">
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover-lift ${
                      mainTab === tab 
                        ? 'bg-forge-primary/20 text-forge-primary border border-forge-primary/30' 
                        : 'text-forge-gray-300 hover:text-white hover:bg-forge-gray-800/50'
                    }`}
                  >
                    <FireIcon className="h-5 w-5" />
                    <span className="font-medium capitalize">{tab}</span>
                  </button>
                ))}
              </nav>

              {/* Wallet Connection */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <button
                    onClick={handleDisconnect}
                    className="btn-secondary flex items-center space-x-2 hover-lift"
                  >
                    <div className="status-online" />
                    <span>Disconnect</span>
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2 hover-lift"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <div className="status-offline" />
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
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
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
