import React, { useState } from 'react'
import Head from 'next/head'
import { 
  FireIcon, 
  BoltIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline'

export default function SimpleWorkingDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mainTab, setMainTab] = useState('dashboard')

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Total Crucibles</p>
              <p className="text-3xl font-bold text-white mb-2">10</p>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-forge-success">+2</span>
                <span className="text-forge-gray-500 text-sm">this week</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-forge-primary to-forge-primary-dark group-hover:scale-110 transition-transform duration-300">
              <FireIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Total TVL</p>
              <p className="text-3xl font-bold text-white mb-2">$1,000,000</p>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-forge-success">+5.2%</span>
                <span className="text-forge-gray-500 text-sm">this week</span>
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
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Total Users</p>
              <p className="text-3xl font-bold text-white mb-2">500</p>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-forge-success">+12</span>
                <span className="text-forge-gray-500 text-sm">this week</span>
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
              <p className="text-forge-gray-400 text-sm font-medium mb-2">Average APR</p>
              <p className="text-3xl font-bold text-white mb-2">8.0%</p>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-forge-success">+0.2%</span>
                <span className="text-forge-gray-500 text-sm">this week</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gradient-to-br from-forge-info to-blue-500 group-hover:scale-110 transition-transform duration-300">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard()
      default:
        return renderDashboard()
    }
  }

  return (
    <>
      <Head>
        <title>Forge Protocol - Simple Working Demo</title>
        <meta name="description" content="Forge Protocol Simple Working Demo - DeFi on Solana" />
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

              {/* Navigation */}
              <nav className="hidden lg:flex items-center space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 hover-lift bg-forge-primary/20 text-forge-primary border border-forge-primary/30"
                >
                  <FireIcon className="h-5 w-5" />
                  <span className="font-medium">Dashboard</span>
                </button>
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
              </div>
            </div>
          </div>
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
