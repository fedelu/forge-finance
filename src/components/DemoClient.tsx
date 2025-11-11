import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { FireIcon, BoltIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import SimpleStats from '../components/SimpleStats'
import CrucibleManager from '../components/CrucibleManager'
import MobileNav from '../components/MobileNav'
import { FogoSessionsButton, useSession } from '../components/FogoSessions'
import { WalletProvider, useWallet } from '../contexts/WalletContext'
import { BalanceProvider, useBalance } from '../contexts/BalanceContext'
import { CrucibleProvider } from '../hooks/useCrucible'
import { AnalyticsProvider } from '../contexts/AnalyticsContext'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'
import { useLending, MarketInfo } from '../hooks/useLending'
import { LENDING_YIELD_FEE_RATE } from '../config/fees'

// Lending Supply Modal Component
function LendingSupplyModal({ 
  isOpen, 
  onClose, 
  marketPubkey, 
  markets, 
  onSupply, 
  loading 
}: { 
  isOpen: boolean
  onClose: () => void
  marketPubkey: string
  markets: MarketInfo[]
  onSupply: (market: string, amount: string) => Promise<{ success: boolean; tx: string }>
  loading: boolean
}) {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { getBalance, subtractFromBalance } = useBalance()
  
  if (!isOpen) return null
  
  const market = markets.find(m => m.marketPubkey === marketPubkey)
  if (!market) return null
  
  const balance = getBalance(market.baseMint)
  const baseApy = market.supplyApyBps / 100
  const feeOnInterest = baseApy * LENDING_YIELD_FEE_RATE
  const effectiveApy = baseApy - feeOnInterest
  
  const handleSupply = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    if (parseFloat(amount) > balance) {
      alert(`Insufficient ${market.baseMint} balance`)
      return
    }
    
    setSubmitting(true)
    try {
      await onSupply(marketPubkey, amount)
      subtractFromBalance(market.baseMint, parseFloat(amount))
      onClose()
      setAmount('')
    } catch (error: any) {
      alert(error.message || 'Supply failed')
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-gradient-to-br from-fogo-gray-900 via-fogo-gray-900 to-fogo-gray-800 rounded-3xl border border-fogo-gray-700/50 shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-fogo-gray-400 hover:text-white">
          ✕
        </button>
        <h3 className="text-2xl font-inter-bold text-white mb-6">Supply {market.baseMint}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-fogo-gray-400 mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-fogo-gray-900 border border-fogo-gray-700 rounded-lg text-white placeholder-fogo-gray-500"
              placeholder="0.00"
              disabled={submitting}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-fogo-gray-500">Balance: {balance.toFixed(2)} {market.baseMint}</span>
              <button onClick={() => setAmount(balance.toString())} className="text-xs text-fogo-primary hover:underline">
                Max
              </button>
            </div>
          </div>
          <div className="bg-fogo-gray-900/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-fogo-gray-400 text-sm">Supply APY</span>
              <span className="text-green-400 font-semibold">{baseApy.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fogo-gray-400 text-sm">Fee on Interest (10%)</span>
              <span className="text-red-400 font-semibold">-{feeOnInterest.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-fogo-gray-700">
              <span className="text-white font-medium">Effective APY</span>
              <span className="text-fogo-primary font-bold text-lg">{effectiveApy.toFixed(2)}%</span>
            </div>
          </div>
          <button
            onClick={handleSupply}
            disabled={!amount || loading || submitting}
            className="w-full px-6 py-4 bg-fogo-primary hover:bg-fogo-primary-dark disabled:bg-fogo-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
          >
            {submitting ? 'Supplying...' : 'Supply'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DemoContent() {
  const [mainTab, setMainTab] = useState('crucibles')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { connected } = useWallet()
  const { isEstablished, connect } = useSession()
  const { markets, supply, loading: lendingLoading } = useLending()
  const [supplyModal, setSupplyModal] = useState<{open: boolean, market: string | null}>({ open: false, market: null })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
          setShowMobileMenu(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMobileMenu])

  const protocolStats = {
    totalCrucibles: 10,
    totalTVL: 1_000_000,
    totalUsers: 500,
    averageAPR: 0.08,
  }

  return (
    <>
      <Head>
        <title>Forge Protocol - DeFi on Fogo</title>
        <meta name="description" content="Forge Protocol - Institutional-grade DeFi on Fogo blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-fogo-dark via-fogo-secondary to-fogo-dark flex flex-col">
        <header className="bg-gradient-to-r from-fogo-dark via-fogo-secondary to-fogo-dark border-b border-fogo-primary/30 shadow-2xl backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex-shrink-0 flex items-center">
                <img src="/forge protocol transparent.png" alt="Forge Protocol" className="header-logo" />
              </div>
              <nav className="hidden md:flex items-center space-x-2">
                <button onClick={() => setMainTab('crucibles')} className={`px-4 py-2 rounded-lg font-inter font-medium transition-all duration-200 ${
                  mainTab === 'crucibles' ? 'bg-fogo-primary text-white shadow-lg' : 'text-fogo-gray-300 hover:text-white hover:bg-fogo-gray-800/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <FireIcon className="w-4 h-4" />
                    <span>Crucibles</span>
                  </div>
                </button>
                <button onClick={() => setMainTab('analytics')} className={`px-4 py-2 rounded-lg font-inter font-medium transition-all duration-200 ${
                  mainTab === 'analytics' ? 'bg-fogo-primary text-white shadow-lg' : 'text-fogo-gray-300 hover:text-white hover:bg-fogo-gray-800/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <BoltIcon className="w-4 h-4" />
                    <span>Portfolio</span>
                  </div>
                </button>
                <button onClick={() => setMainTab('lending')} className={`px-4 py-2 rounded-lg font-inter font-medium transition-all duration-200 ${
                  mainTab === 'lending' ? 'bg-fogo-primary text-white shadow-lg' : 'text-fogo-gray-300 hover:text-white hover:bg-fogo-gray-800/50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-4 h-4" />
                    <span>Lending</span>
                  </div>
                </button>
              </nav>
              <div className="flex items-center space-x-4">
                {!isEstablished ? (
                  <button onClick={connect} className="hidden md:flex items-center space-x-3 bg-fogo-gray-800 hover:bg-fogo-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-fogo-gray-600 hover:border-fogo-primary/50">
                    <div className="w-6 h-6 bg-gradient-to-r from-fogo-primary to-fogo-secondary rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Z"/></svg>
                    </div>
                    <span>Log in with FOGO</span>
                  </button>
                ) : (
                  <div className="hidden md:block">
                    <FogoSessionsButton />
                  </div>
                )}
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="mobile-menu-button md:hidden p-2 rounded-lg text-fogo-gray-300 hover:text-white hover:bg-fogo-gray-800/50 transition-all duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {showMobileMenu && (
          <div className="mobile-menu md:hidden bg-fogo-gray-900 border-b border-fogo-gray-700 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <button onClick={() => { setMainTab('crucibles'); setShowMobileMenu(false) }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${
                mainTab === 'crucibles' ? 'bg-fogo-primary text-white shadow-lg' : 'text-fogo-gray-300 hover:text-white hover:bg-fogo-gray-800/50'
              }`}>
                <FireIcon className="w-5 h-5" />
                <span>Crucibles</span>
              </button>
              <button onClick={() => { setMainTab('analytics'); setShowMobileMenu(false) }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${
                mainTab === 'analytics' ? 'bg-fogo-primary text-white shadow-lg' : 'text-fogo-gray-300 hover:text-white hover:bg-fogo-gray-800/50'
              }`}>
                <BoltIcon className="w-5 h-5" />
                <span>Portfolio</span>
              </button>
              <button onClick={() => { setMainTab('lending'); setShowMobileMenu(false) }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-inter font-medium transition-all duration-200 ${
                mainTab === 'lending' ? 'bg-fogo-primary text-white shadow-lg' : 'text-fogo-gray-300 hover:text-white hover:bg-fogo-gray-800/50'
              }`}>
                <CurrencyDollarIcon className="w-5 h-5" />
                <span>Lending</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 min-h-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {mainTab === 'crucibles' && (
              <div className="space-y-4">
                <CrucibleManager />
              </div>
            )}
            {mainTab === 'analytics' && <AnalyticsDashboard />}
            {mainTab === 'lending' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-fogo-gray-900 via-fogo-gray-900 to-fogo-gray-800 rounded-3xl border border-fogo-gray-700/50 shadow-2xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fogo-primary/30 to-fogo-primary/10 border border-fogo-primary/20 flex items-center justify-center">
                      <CurrencyDollarIcon className="w-8 h-8 text-fogo-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-inter-bold text-white">Lending Markets</h2>
                      <p className="text-fogo-gray-400 text-sm">Earn yield by supplying liquidity to isolated lending markets</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {markets.map((market) => (
                      <div key={market.marketPubkey} className="bg-fogo-gray-900/50 rounded-2xl p-6 border border-fogo-gray-700/50 hover:border-fogo-primary/30 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-white font-inter-bold text-xl">{market.baseMint}</div>
                          <div className="text-fogo-gray-400 text-sm">TVL: ${market.tvl}</div>
                        </div>
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-fogo-gray-400 text-sm">Utilization</span>
                            <span className="text-fogo-primary font-semibold">{(market.utilizationBps/100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-fogo-gray-400 text-sm">Supply APY</span>
                            <span className="text-green-400 font-semibold">{(market.supplyApyBps/100).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-fogo-gray-400 text-sm">Borrow APY</span>
                            <span className="text-orange-400 font-semibold">{(market.borrowApyBps/100).toFixed(2)}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSupplyModal({ open: true, market: market.marketPubkey })}
                            className="flex-1 px-4 py-3 bg-fogo-primary hover:bg-fogo-primary-dark text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                          >
                            Supply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Supply Modal */}
        {supplyModal.open && supplyModal.market && (
          <LendingSupplyModal
            isOpen={supplyModal.open}
            onClose={() => setSupplyModal({ open: false, market: null })}
            marketPubkey={supplyModal.market}
            markets={markets}
            onSupply={supply}
            loading={lendingLoading}
          />
        )}

        <footer className="bg-fogo-gray-900 border-t border-fogo-gray-700 py-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-fogo-gray-400 text-sm">© 2025 Forge. Real Yield, Reinvented.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default function DemoClient() {
  return (
    <WalletProvider>
      <BalanceProvider>
        <CrucibleProvider>
          <AnalyticsProvider>
            <DemoContent />
          </AnalyticsProvider>
        </CrucibleProvider>
      </BalanceProvider>
    </WalletProvider>
  )
}


