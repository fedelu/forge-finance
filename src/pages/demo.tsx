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
import { FogoSessionsProvider, FogoSessionsButton, useSession } from '../components/FogoSessions'
import { WalletProvider, useWallet } from '../contexts/WalletContext'
import { BalanceProvider } from '../contexts/BalanceContext'
import { CrucibleProvider } from '../contexts/CrucibleContext'
import { AnalyticsProvider } from '../contexts/AnalyticsContext'
import { GovernanceProvider } from '../contexts/GovernanceContext'
import { CrucibleCreationProvider } from '../contexts/CrucibleCreationContext'
import { DynamicTokenBalances } from '../components/DynamicTokenBalances'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'

// Connect Wallet Message Component
function ConnectWalletMessage({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="bg-fogo-gray-900 rounded-2xl p-8 max-w-md w-full border border-fogo-gray-700 shadow-fogo">
        <div className="w-16 h-16 bg-fogo-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-fogo-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Sign in with FOGO</h3>
        <p className="text-fogo-gray-300 mb-6 text-sm">
          Connect your FOGO wallet to access institutional-grade DeFi features on the fastest layer 1 blockchain.
        </p>
        <button
          onClick={onConnect}
          className="w-full bg-gradient-to-r from-fogo-primary to-fogo-secondary hover:from-fogo-primary-dark hover:to-fogo-secondary-dark text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-fogo hover:shadow-flame"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
          </svg>
          <span>Sign in with FOGO</span>
        </button>
      </div>
    </div>
  );
}

function DemoContent() {
  const [mainTab, setMainTab] = useState('dashboard')
  const { network, connected } = useWallet()
  const { isEstablished, connect } = useSession()

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
        <title>Forge Protocol - DeFi on Fogo</title>
        <meta name="description" content="Forge Protocol - Institutional-grade DeFi on Fogo blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-fogo-dark">
        {/* Header */}
        <header className="bg-fogo-gray-900 border-b border-fogo-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FireIcon className="h-8 w-8 text-fogo-primary" />
                  <BoltIcon className="h-6 w-6 text-fogo-accent" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-white">Forge Protocol</h1>
                  <p className="text-xs text-fogo-gray-400">Powered by Fogo</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => setMainTab('dashboard')}
                  className={`transition-colors ${mainTab === 'dashboard' ? 'text-fogo-primary' : 'text-fogo-gray-300 hover:text-white'}`}
                >
                  Dashboard
                </button>
                {isEstablished && (
                  <>
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
                      Portfolio
                    </button>
                  </>
                )}
              </nav>

              <div className="flex items-center space-x-4">
                <FogoSessionsButton />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
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
                    onClick={() => {
                      if (isEstablished) {
                        setMainTab('crucibles');
                      } else {
                        alert('Please sign in with FOGO to access crucibles and deposit tokens.');
                      }
                    }}
                    className="p-6 bg-fogo-gray-800 rounded-lg border border-fogo-gray-700 hover:border-fogo-primary transition-colors text-left group"
                  >
                    <FireIcon className="h-8 w-8 text-fogo-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-white mb-2">Deposit Tokens</h3>
                    <p className="text-fogo-gray-400">{isEstablished ? 'Add liquidity to earn yield' : 'Sign in with FOGO to access crucibles'}</p>
                  </button>
                  <button 
                    onClick={() => {
                      if (isEstablished) {
                        setMainTab('analytics');
                      } else {
                        alert('Please sign in with FOGO to view portfolio and track performance.');
                      }
                    }}
                    className="p-6 bg-fogo-gray-800 rounded-lg border border-fogo-gray-700 hover:border-fogo-primary transition-colors text-left group"
                  >
                    <ChartBarIcon className="h-8 w-8 text-fogo-accent mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-white mb-2">View Portfolio</h3>
                    <p className="text-fogo-gray-400">{isEstablished ? 'Track your performance' : 'Sign in with FOGO to view portfolio'}</p>
                  </button>
                  <button 
                    onClick={() => {
                      if (isEstablished) {
                        setMainTab('governance');
                      } else {
                        alert('Please sign in with FOGO to participate in governance and vote on proposals.');
                      }
                    }}
                    className="p-6 bg-fogo-gray-800 rounded-lg border border-fogo-gray-700 hover:border-fogo-primary transition-colors text-left group"
                  >
                    <UserGroupIcon className="h-8 w-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-white mb-2">Governance</h3>
                    <p className="text-fogo-gray-400">{isEstablished ? 'Vote on proposals' : 'Sign in with FOGO to participate in governance'}</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {mainTab === 'crucibles' && (
            isEstablished ? <CrucibleManager /> : <ConnectWalletMessage onConnect={connect} />
          )}

          {mainTab === 'governance' && (
            isEstablished ? <GovernancePanel /> : <ConnectWalletMessage onConnect={connect} />
          )}

          {mainTab === 'analytics' && (
            isEstablished ? <AnalyticsDashboard /> : <ConnectWalletMessage onConnect={connect} />
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

