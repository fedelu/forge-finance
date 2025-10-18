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
  PlusIcon
} from '@heroicons/react/24/outline'

export default function MinimalDemo() {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConnect = () => {
    setLoading(true)
    setTimeout(() => {
      setIsConnected(true)
      setLoading(false)
    }, 1000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
  }

  return (
    <>
      <Head>
        <title>Forge Protocol - Minimal Demo</title>
        <meta name="description" content="Forge Protocol Minimal Demo - DeFi on Solana" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-forge-dark">
        {/* Header */}
        <header className="bg-forge-gray border-b border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FireIcon className="h-8 w-8 text-forge-primary" />
                  <BoltIcon className="h-6 w-6 text-forge-accent" />
                </div>
                <h1 className="text-2xl font-bold text-white">Forge Protocol</h1>
              </div>
              <div className="flex items-center space-x-4">
                {isConnected ? (
                  <button 
                    onClick={handleDisconnect}
                    className="btn-secondary"
                  >
                    Disconnect Wallet
                  </button>
                ) : (
                  <button 
                    onClick={handleConnect}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Connecting...' : 'Connect Fogo Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Debug Panel */}
          <div className="card mb-8 bg-gray-800 border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Debug Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Connected:</span>
                <span className={`ml-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Loading:</span>
                <span className={`ml-2 ${loading ? 'text-yellow-400' : 'text-green-400'}`}>
                  {loading ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Protocol Stats:</span>
                <span className="ml-2 text-green-400">Loaded</span>
              </div>
              <div>
                <span className="text-gray-400">Error:</span>
                <span className="ml-2 text-green-400">No</span>
              </div>
            </div>
          </div>

          {/* Token Balances Panel - Show when connected */}
          {isConnected && (
            <div className="card mb-8 bg-gradient-to-r from-forge-primary/20 to-forge-accent/20 border-forge-primary">
              <h3 className="text-lg font-semibold text-white mb-4">💰 Your Token Balances</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                <div className="text-center p-3 bg-forge-gray/50 rounded-lg">
                  <div className="text-white font-semibold">100.5 SOL</div>
                  <div className="text-gray-400">$15,000</div>
                </div>
                <div className="text-center p-3 bg-forge-gray/50 rounded-lg">
                  <div className="text-white font-semibold">5,000 USDC</div>
                  <div className="text-gray-400">$5,000</div>
                </div>
                <div className="text-center p-3 bg-forge-gray/50 rounded-lg">
                  <div className="text-white font-semibold">2.3 ETH</div>
                  <div className="text-gray-400">$4,600</div>
                </div>
                <div className="text-center p-3 bg-forge-gray/50 rounded-lg">
                  <div className="text-white font-semibold">0.15 BTC</div>
                  <div className="text-gray-400">$6,000</div>
                </div>
                <div className="text-center p-3 bg-forge-gray/50 rounded-lg">
                  <div className="text-white font-semibold">10,000 SPARK</div>
                  <div className="text-gray-400">Governance</div>
                </div>
                <div className="text-center p-3 bg-forge-gray/50 rounded-lg">
                  <div className="text-white font-semibold">250 HEAT</div>
                  <div className="text-gray-400">Rewards</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-8">
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-white mb-6">Welcome to Forge Protocol</h1>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                A modular DeFi protocol on Solana. Deposit tokens into Crucibles, earn yield with Heat, and participate in governance with Sparks.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="btn-primary text-lg px-8 py-4">Get Started</button>
                <button className="btn-secondary text-lg px-8 py-4">Learn More</button>
              </div>
            </div>

            {/* Protocol Statistics */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Protocol Statistics</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-sm text-gray-400">Live</span>
                  <button className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors">Pause</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Crucibles</p>
                      <p className="text-3xl font-bold text-white mt-1">10</p>
                      <p className="text-green-400 text-sm mt-1">+2 this week</p>
                    </div>
                    <FireIcon className="h-8 w-8 text-forge-primary" />
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total TVL</p>
                      <p className="text-3xl font-bold text-white mt-1">$1,000,000</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpIcon className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-green-400">5.00%</span>
                      </div>
                    </div>
                    <BanknotesIcon className="h-8 w-8 text-forge-accent" />
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-1">500</p>
                      <p className="text-green-400 text-sm mt-1">+12 today</p>
                    </div>
                    <UserGroupIcon className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                
                <div className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Average APR</p>
                      <p className="text-3xl font-bold text-white mt-1">8.00%</p>
                      <p className="text-blue-400 text-sm mt-1">+0.2% this week</p>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">24h Volume</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">$250,000</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-sm">+15.3%</span>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-semibold text-white mb-4">Network Status</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-400">Operational</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">All Systems</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button className="p-6 bg-forge-gray rounded-lg border border-gray-700 hover:border-forge-primary transition-colors text-left">
                  <FireIcon className="h-8 w-8 text-forge-primary mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Deposit Tokens</h3>
                  <p className="text-gray-400">Add liquidity to earn yield</p>
                </button>
                
                <button className="p-6 bg-forge-gray rounded-lg border border-gray-700 hover:border-forge-primary transition-colors text-left">
                  <ChartBarIcon className="h-8 w-8 text-forge-accent mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
                  <p className="text-gray-400">Track your performance</p>
                </button>
                
                <button className="p-6 bg-forge-gray rounded-lg border border-gray-700 hover:border-forge-primary transition-colors text-left">
                  <UserGroupIcon className="h-8 w-8 text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Governance</h3>
                  <p className="text-gray-400">Vote on proposals</p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
