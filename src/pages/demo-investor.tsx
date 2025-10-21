// Investor Demo Page - Fogo Sessions Integration
import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { 
  FireIcon, 
  BoltIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  WalletIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { createFogoSessionClientDemo } from '../lib/fogoSessionDemo'
import { DemoSessionProvider, DemoSessionButton, useDemoSession } from '../components/FogoSessionsDemo'
import { DEMO_CONFIG } from '../config/demo-config'

function InvestorDemoContent() {
  const [mainTab, setMainTab] = useState('dashboard')
  const [fogoClient, setFogoClient] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  
  const { 
    isEstablished, 
    sessionWalletAddress,
    balances,
    depositToCrucible,
    withdrawFromCrucible,
    refreshBalances,
    error 
  } = useDemoSession()

  // Initialize Fogo client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🔥 Initializing Demo Fogo Sessions client...')
      try {
        const client = createFogoSessionClientDemo()
        setFogoClient(client)
        setIsInitialized(true)
        console.log('✅ Demo Fogo client initialized:', client)
      } catch (error) {
        console.error('❌ Failed to initialize demo client:', error)
      }
    }
  }, [])

  // Demo transaction handlers
  const handleDemoDeposit = async () => {
    try {
      const result = await depositToCrucible(100)
      if (result.success) {
        console.log('✅ Demo deposit successful:', result.transactionId)
        alert(`Demo deposit successful!\nTransaction ID: ${result.transactionId}`)
      }
    } catch (error) {
      console.error('❌ Demo deposit failed:', error)
      alert('Demo deposit failed')
    }
  }

  const handleDemoWithdraw = async () => {
    try {
      const result = await withdrawFromCrucible(50)
      if (result.success) {
        console.log('✅ Demo withdraw successful:', result.transactionId)
        alert(`Demo withdraw successful!\nTransaction ID: ${result.transactionId}`)
      }
    } catch (error) {
      console.error('❌ Demo withdraw failed:', error)
      alert('Demo withdraw failed')
    }
  }

  const handleRefreshBalances = async () => {
    try {
      await refreshBalances()
      console.log('✅ Balances refreshed')
    } catch (error) {
      console.error('❌ Failed to refresh balances:', error)
    }
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-forge-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Initializing Demo Environment...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Forge Protocol - Investor Demo</title>
        <meta name="description" content="Forge Protocol Investor Demo - Fogo Sessions Integration" />
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
                <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">INVESTOR DEMO</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => setMainTab('dashboard')}
                  className={`transition-colors ${mainTab === 'dashboard' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setMainTab('sessions')}
                  className={`transition-colors ${mainTab === 'sessions' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Fogo Sessions
                </button>
                <button
                  onClick={() => setMainTab('transactions')}
                  className={`transition-colors ${mainTab === 'transactions' ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                >
                  Transactions
                </button>
              </nav>

              <div className="flex items-center space-x-4">
                <DemoSessionButton />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Demo Status Banner */}
          <div className="mb-8 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-300">Demo Mode Active</h3>
                <p className="text-sm text-yellow-200">
                  This is a demonstration of Fogo Sessions integration. All transactions are simulated for investor presentation.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {mainTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Network Status */}
              <div className="card mb-8 bg-gray-800 border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4">🌐 Demo Environment Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Network:</span>
                    <span className="ml-2 text-orange-400">FOGO Testnet</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Mode:</span>
                    <span className="ml-2 text-yellow-400">Demo</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Paymaster:</span>
                    <span className="ml-2 text-red-400">Mocked</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span className="ml-2 text-green-400">Ready</span>
                  </div>
                </div>
              </div>

              {/* Session Status */}
              <div className="card bg-gray-800 border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4">🔥 Fogo Sessions Status</h3>
                {isEstablished ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 font-semibold">Session Active</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Session Wallet:</span>
                      <div className="font-mono text-sm bg-gray-700 p-2 rounded mt-1 break-all">
                        {sessionWalletAddress}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-700 p-3 rounded">
                        <div className="text-orange-400 text-sm">FOGO Balance</div>
                        <div className="text-white font-bold text-lg">{balances.fogo.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-700 p-3 rounded">
                        <div className="text-blue-400 text-sm">USDC Balance</div>
                        <div className="text-white font-bold text-lg">{balances.usdc.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-700 p-3 rounded">
                        <div className="text-purple-400 text-sm">SOL Balance</div>
                        <div className="text-white font-bold text-lg">{balances.sol.toFixed(4)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No active session. Connect to start the demo.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {mainTab === 'sessions' && (
            <div className="space-y-8">
              <div className="card bg-gray-800 border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4">🔥 Fogo Sessions Demo</h3>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h4 className="font-semibold text-white mb-2">What are Fogo Sessions?</h4>
                    <p className="text-gray-300 text-sm">
                      Fogo Sessions enable gasless transactions on Solana by creating a session wallet that can sign transactions 
                      without requiring user approval for each transaction. This provides a seamless DeFi experience.
                    </p>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded">
                    <h4 className="font-semibold text-white mb-2">Demo Features</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Session wallet creation and management</li>
                      <li>• Mock token balances (FOGO, USDC, SOL)</li>
                      <li>• Simulated transactions without gas fees</li>
                      <li>• Real-time balance updates</li>
                      <li>• Session expiration and renewal</li>
                    </ul>
                  </div>

                  {isEstablished && (
                    <div className="bg-green-900/30 border border-green-500/50 p-4 rounded">
                      <h4 className="font-semibold text-green-300 mb-2">Current Session Details</h4>
                      <div className="text-sm text-green-200 space-y-1">
                        <div>Session Wallet: {sessionWalletAddress}</div>
                        <div>Status: Active</div>
                        <div>Mode: Demo (No paymaster validation required)</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {mainTab === 'transactions' && (
            <div className="space-y-8">
              <div className="card bg-gray-800 border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-4">💸 Demo Transactions</h3>
                
                {isEstablished ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={handleDemoDeposit}
                        className="p-4 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-left"
                      >
                        <CurrencyDollarIcon className="h-6 w-6 text-white mb-2" />
                        <h4 className="font-semibold text-white">Demo Deposit</h4>
                        <p className="text-orange-200 text-sm">Deposit 100 FOGO to crucible</p>
                      </button>
                      
                      <button
                        onClick={handleDemoWithdraw}
                        className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-left"
                      >
                        <ArrowPathIcon className="h-6 w-6 text-white mb-2" />
                        <h4 className="font-semibold text-white">Demo Withdraw</h4>
                        <p className="text-blue-200 text-sm">Withdraw 50 FOGO from crucible</p>
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleRefreshBalances}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors text-white"
                      >
                        Refresh Balances
                      </button>
                      <span className="text-gray-400 text-sm">
                        All transactions are simulated for demo purposes
                      </span>
                    </div>

                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="font-semibold text-white mb-2">Transaction History</h4>
                      <div className="space-y-2 text-sm">
                        {DEMO_CONFIG.DEMO_TRANSACTION_IDS.map((txId, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-600 last:border-b-0">
                            <span className="text-gray-300">{txId}</span>
                            <span className="text-green-400">Success</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Connect a session to test transactions</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-red-900 border border-red-500 text-red-200 p-4 rounded-lg max-w-md">
              <h4 className="font-semibold mb-2">Error</h4>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default function InvestorDemo() {
  return (
    <DemoSessionProvider fogoClient={null}>
      <InvestorDemoContent />
    </DemoSessionProvider>
  )
}
