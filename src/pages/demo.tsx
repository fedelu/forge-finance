import React, { useState } from 'react'
import Head from 'next/head'
import { 
  FireIcon, 
  BoltIcon, 
  UserGroupIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline'
import SimpleStats from '../components/SimpleStats'
import CrucibleManager from '../components/CrucibleManager'
import GovernancePanel from '../components/GovernancePanel'
import MobileNav from '../components/MobileNav'
import { FogoSessionsProvider, FogoSessionsButton } from '../components/FogoSessions'
import { WalletProvider, useWallet } from '../contexts/WalletContext'
import { BalanceProvider } from '../contexts/BalanceContext'
import { CrucibleProvider } from '../contexts/CrucibleContext'
import { AnalyticsProvider } from '../contexts/AnalyticsContext'
import { GovernanceProvider } from '../contexts/GovernanceContext'
import { CrucibleCreationProvider } from '../contexts/CrucibleCreationContext'
import { DynamicTokenBalances } from '../components/DynamicTokenBalances'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'

function DemoContent() {
  const [mainTab, setMainTab] = useState('dashboard')
  const { network, connected } = useWallet()

  // Mock protocol stats
  const protocolStats = {
    totalCrucibles: 10,
    totalTVL: 1_000_000,
    totalUsers: 500,
    averageAPR: 0.08,
  }

  // Debug logging
  console.log('Demo - protocolStats:', protocolStats)
  return (
    <>
      <Head>
        <title>Forge Protocol - Demo</title>
        <meta name="description" content="Forge Protocol Demo - DeFi on Solana" />
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
              
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => setMainTab('dashboard')}
                  className={`transition-colors ${mainTab === 'dashboard' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setMainTab('crucibles')}
                  className={`transition-colors ${mainTab === 'crucibles' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Crucibles
                </button>
                <button
                  onClick={() => setMainTab('governance')}
                  className={`transition-colors ${mainTab === 'governance' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Governance
                </button>
                <button
                  onClick={() => setMainTab('analytics')}
                  className={`transition-colors ${mainTab === 'analytics' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Analytics
                </button>
              </nav>

              <div className="flex items-center space-x-4">
                <FogoSessionsButton />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
                  {/* Network Status */}
                  <div className="card mb-8 bg-gray-800 border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-4">🌐 Network Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Current Network:</span>
                        <span className="ml-2 text-orange-400">FOGO Testnet</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Wallet:</span>
                        <span className={`ml-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
                          {connected ? 'Connected' : 'Disconnected'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">FOGO Crucibles:</span>
                        <span className="ml-2 text-green-400">5 Active</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className="ml-2 text-green-400">Ready</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-orange-900/30 rounded-lg">
                      <p className="text-sm text-orange-300">
                        🔥 <strong>FOGO Ecosystem:</strong> Deposit your FOGO tokens into specialized crucibles with APY ranging from 12% to 25%
                      </p>
                    </div>
                  </div>

                  {/* Token balances moved to Analytics dashboard */}

          {/* Tab Content */}
          {mainTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Hero Section - Removed welcome text */}

                      {/* Real-time Stats */}
                      <SimpleStats />

              {/* Quick Actions */}
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => setMainTab('crucibles')}
                    className="p-6 bg-forge-gray rounded-lg border border-gray-700 hover:border-forge-primary transition-colors text-left"
                  >
                    <FireIcon className="h-8 w-8 text-forge-primary mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Deposit Tokens</h3>
                    <p className="text-gray-400">Add liquidity to earn yield</p>
                  </button>
                  <button 
                    onClick={() => setMainTab('analytics')}
                    className="p-6 bg-forge-gray rounded-lg border border-gray-700 hover:border-forge-primary transition-colors text-left"
                  >
                    <ChartBarIcon className="h-8 w-8 text-forge-accent mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">View Analytics</h3>
                    <p className="text-gray-400">Track your performance</p>
                  </button>
                  <button 
                    onClick={() => setMainTab('governance')}
                    className="p-6 bg-forge-gray rounded-lg border border-gray-700 hover:border-forge-primary transition-colors text-left"
                  >
                    <UserGroupIcon className="h-8 w-8 text-green-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Governance</h3>
                    <p className="text-gray-400">Vote on proposals</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mainTab === 'crucibles' && (
            <CrucibleManager />
          )}

          {mainTab === 'governance' && (
            <GovernancePanel />
          )}

                     {mainTab === 'analytics' && (
                       <AnalyticsDashboard />
                     )}

        </main>
      </div>
    </>
  )
}

export default function Demo() {
  return (
    <FogoSessionsProvider>
      <WalletProvider>
        <BalanceProvider>
          <CrucibleProvider>
            <AnalyticsProvider>
              <GovernanceProvider>
                <CrucibleCreationProvider>
                  <DemoContent />
                </CrucibleCreationProvider>
              </GovernanceProvider>
            </AnalyticsProvider>
          </CrucibleProvider>
        </BalanceProvider>
      </WalletProvider>
    </FogoSessionsProvider>
  )
}

