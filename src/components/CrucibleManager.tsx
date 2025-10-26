import React, { useState } from 'react'
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChartBarIcon,
  BoltIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '../contexts/WalletContext'
import { useCrucible } from '../hooks/useCrucible'
import { useSession } from './FogoSessions'
import { FogoDepositModal } from './FogoDepositModal'
import { FogoWithdrawModal } from './FogoWithdrawModal'
import { formatNumberWithCommas, getCTokenPrice, RATE_SCALE } from '../utils/math'

interface Crucible {
  id: string
  name: string
  symbol: string
  baseToken: 'FOGO' | 'FORGE'
  ptokenSymbol: 'cFOGO' | 'cFORGE'
  tvl: number
  apr: number
  status: 'active' | 'paused' | 'maintenance'
  userDeposit: number
  userShares: number
  icon: string
  // pToken specific fields
  ptokenMint?: string
  exchangeRate?: bigint
  totalWrapped?: bigint
  userPtokenBalance?: bigint
  estimatedBaseValue?: bigint
  currentAPY?: number
  totalFeesCollected?: number
}

interface CrucibleManagerProps {
  className?: string
  onDeposit?: (crucibleId: string, amount: number) => void
  onWithdraw?: (crucibleId: string, amount: number) => void
  isConnected?: boolean
}

export default function CrucibleManager({ className = '', onDeposit, onWithdraw, isConnected = false }: CrucibleManagerProps) {
  const { connected } = useWallet()
  const { crucibles, loading, error } = useCrucible()
  const { isEstablished, getCrucibleAPYEarnings } = useSession()
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'manage'>('deposit')
  const [selectedCrucible, setSelectedCrucible] = useState<string | null>(null)
  const [showFogoDepositModal, setShowFogoDepositModal] = useState(false)
  const [showFogoWithdrawModal, setShowFogoWithdrawModal] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-fogo-gray-800 text-fogo-primary border border-fogo-primary/30'
      case 'paused': return 'bg-fogo-gray-800 text-fogo-gray-300 border border-fogo-gray-600'
      case 'maintenance': return 'bg-fogo-gray-800 text-fogo-gray-400 border border-fogo-gray-600'
      default: return 'bg-fogo-gray-800 text-fogo-gray-300 border border-fogo-gray-600'
    }
  }

  const handleAction = (action: string, crucibleId: string) => {
    if (!isEstablished) {
      alert('⚠️ Please connect your FOGO wallet first!\n\nClick "Sign in with FOGO" to start using the protocol.')
      return
    }

    if (action === 'deposit') {
      setSelectedCrucible(crucibleId);
      // All deposits now use FOGO through Phantom wallet
      setShowFogoDepositModal(true);
    } else if (action === 'withdraw') {
      const crucible = crucibles.find(c => c.id === crucibleId);
      if (crucible && crucible.userPtokenBalance === BigInt(0)) {
        alert('⚠️ No open position to close!\n\nYou need to open a position first before you can close it.')
        return
      }
      setSelectedCrucible(crucibleId);
      // All withdrawals now use FOGO through Phantom wallet
      setShowFogoWithdrawModal(true);
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Crucible Stats - Compact */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
          <div className="bg-gradient-to-br from-fogo-gray-900 via-fogo-gray-800 to-fogo-gray-900 rounded-xl p-4 border border-fogo-primary/20 hover:border-fogo-primary/40 transition-all duration-300 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-fogo-primary/20 to-fogo-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <ChartBarIcon className="h-5 w-5 text-fogo-primary" />
              </div>
              <p className="text-fogo-gray-300 text-xs font-medium mb-1">Total TVL</p>
              <p className="text-2xl font-bold text-white group-hover:text-fogo-primary transition-colors duration-300">
                ${crucibles.reduce((sum, c) => sum + c.tvl, 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-fogo-gray-900 via-fogo-gray-800 to-fogo-gray-900 rounded-xl p-4 border border-fogo-accent/20 hover:border-fogo-accent/40 transition-all duration-300 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-fogo-accent/20 to-fogo-accent/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <BoltIcon className="h-5 w-5 text-fogo-accent" />
              </div>
              <p className="text-fogo-gray-300 text-xs font-medium mb-1">APY Earned</p>
              <p className="text-2xl font-bold text-white group-hover:text-fogo-accent transition-colors duration-300">
                ${crucibles.reduce((sum, c) => sum + (c.apyEarnedByUsers || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-fogo-gray-900 via-fogo-gray-800 to-fogo-gray-900 rounded-xl p-4 border border-fogo-primary/20 hover:border-fogo-primary/40 transition-all duration-300 group">
            <div className="text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-fogo-primary/20 to-fogo-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <FireIcon className="h-5 w-5 text-fogo-primary" />
              </div>
              <p className="text-fogo-gray-300 text-xs font-medium mb-1">Total Fees</p>
              <p className="text-2xl font-bold text-white group-hover:text-fogo-primary transition-colors duration-300">
                ${crucibles.reduce((sum, c) => sum + (c.totalFeesCollected || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fogo-primary mx-auto mb-4"></div>
            <p className="text-fogo-gray-300">Loading crucibles...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Crucibles List */}
      {!loading && !error && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-inter-bold text-white mb-2">Available Crucibles</h2>
            <p className="text-fogo-gray-400 text-sm">Choose your preferred token to start earning yield</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {crucibles.map((crucible) => (
            <div key={crucible.id} className="bg-gradient-to-br from-fogo-gray-900 via-fogo-gray-800 to-fogo-gray-900 rounded-2xl p-5 border border-fogo-gray-600/50 shadow-xl hover:shadow-fogo-primary/20 transition-all duration-500 hover:border-fogo-primary/40 hover:scale-[1.01] group backdrop-blur-sm relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-fogo-primary/5 to-fogo-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-fogo-primary/30 to-fogo-accent/30 rounded-2xl flex items-center justify-center group-hover:from-fogo-primary/40 group-hover:to-fogo-accent/40 transition-all duration-500 shadow-lg group-hover:shadow-fogo-primary/20">
                      {crucible.icon.startsWith('/') ? (
                        <img 
                          src={crucible.icon} 
                          alt={`${crucible.name} icon`} 
                          className="h-9 w-9 object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{crucible.icon}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-satoshi-bold text-white group-hover:text-fogo-primary transition-colors duration-300 mb-1">{crucible.name}</h3>
                      <p className="text-fogo-gray-300 text-sm font-medium">{crucible.baseToken} → {crucible.ptokenSymbol}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(crucible.status)} shadow-lg`}>
                    {crucible.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3 text-sm font-satoshi-light text-fogo-gray-200 mb-6">
                  <div className="flex justify-between items-center py-3 px-3 bg-fogo-gray-800/50 rounded-lg border border-fogo-gray-700/50">
                    <span className="text-fogo-gray-300 font-medium text-sm">TVL:</span>
                    <span className="font-satoshi-bold text-lg text-white">${crucible.tvl.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-3 bg-fogo-gray-800/50 rounded-lg border border-fogo-gray-700/50">
                    <span className="text-fogo-gray-300 font-medium text-sm">APY:</span>
                    <span className="font-satoshi-bold text-lg text-fogo-accent">{(crucible.apr * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-3 bg-fogo-gray-800/50 rounded-lg border border-fogo-gray-700/50">
                    <span className="text-fogo-gray-300 font-medium text-sm">cToken Price:</span>
                    <span className="font-satoshi-bold text-lg text-fogo-accent">
                      ${(() => {
                        // Calculate price from exchange rate
                        // Only show accumulated yield if there are deposits (totalWrapped > 0)
                        const hasDeposits = (crucible.totalWrapped || BigInt(0)) > BigInt(0);
                        const exchangeRate = hasDeposits ? (crucible.exchangeRate || RATE_SCALE) : RATE_SCALE;
                        const baseTokenPrice = crucible.baseToken === 'FOGO' ? 0.5 : 0.002;
                        const currentPrice = getCTokenPrice(baseTokenPrice, exchangeRate);
                        return currentPrice.toFixed(4);
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-3 bg-fogo-gray-800/50 rounded-lg border border-fogo-gray-700/50">
                    <span className="text-fogo-gray-300 font-medium text-sm">Yield Earned:</span>
                    <span className="font-satoshi-bold text-lg text-fogo-primary">
                      ${(crucible.apyEarnedByUsers || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Enhanced CTA Buttons */}
                <div className="space-y-2">
                  {/* Primary Open Position Button */}
                  <button
                    onClick={() => handleAction('deposit', crucible.id)}
                    className="w-full bg-gradient-to-r from-fogo-primary to-fogo-accent hover:from-fogo-primary/90 hover:to-fogo-accent/90 text-white font-satoshi-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-fogo-primary/25 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      <ArrowUpIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-base">Open Position</span>
                    </div>
                  </button>

                  {/* Secondary Close Position Button */}
                  <button
                    onClick={() => handleAction('withdraw', crucible.id)}
                    disabled={crucible.userPtokenBalance === BigInt(0)}
                    className={`w-full py-3 rounded-xl font-satoshi-bold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2 border relative overflow-hidden group ${
                      crucible.userPtokenBalance === BigInt(0)
                        ? 'bg-fogo-gray-900 text-fogo-gray-500 border-fogo-gray-800 cursor-not-allowed'
                        : 'bg-fogo-gray-800 hover:bg-fogo-gray-700 text-fogo-gray-300 hover:text-white border-fogo-gray-600 hover:border-fogo-gray-500'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-fogo-gray-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-2">
                      <ArrowDownIcon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="text-base">Close Position</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedCrucible && (
        <>
          <FogoDepositModal
            isOpen={showFogoDepositModal}
            onClose={() => setShowFogoDepositModal(false)}
            crucibleId={selectedCrucible}
          />
          <FogoWithdrawModal
            isOpen={showFogoWithdrawModal}
            onClose={() => setShowFogoWithdrawModal(false)}
            crucibleId={selectedCrucible}
          />
        </>
      )}
    </div>
  )
}