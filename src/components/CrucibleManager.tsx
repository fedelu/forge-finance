import React, { useState } from 'react'
import { 
  FireIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '../contexts/WalletContext'
import { useCrucible } from '../contexts/CrucibleContext'
import { useSession } from './FogoSessions'
import { DepositModal } from './DepositModal'
import { UltraSimpleModal } from './UltraSimpleModal'
import { RealSolModal } from './RealSolModal'
import { FogoDepositModal } from './FogoDepositModal'
import { WorkingWithdrawModal } from './WorkingWithdrawModal'
import { FogoWithdrawModal } from './FogoWithdrawModal'
import { CrucibleCreationModal } from './CrucibleCreationModal'

interface Crucible {
  id: string
  name: string
  symbol: string
  tvl: number
  apr: number
  status: 'active' | 'paused' | 'maintenance'
  userDeposit: number
  userShares: number
  icon: string
}

interface CrucibleManagerProps {
  className?: string
  onDeposit?: (crucibleId: string, amount: number) => void
  onWithdraw?: (crucibleId: string, amount: number) => void
  isConnected?: boolean
}

export default function CrucibleManager({ className = '', onDeposit, onWithdraw, isConnected = false }: CrucibleManagerProps) {
  const { connected } = useWallet()
  const { crucibles } = useCrucible()
  const { isEstablished } = useSession()
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'manage'>('deposit')
  const [selectedCrucible, setSelectedCrucible] = useState<string | null>(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showUltraSimpleModal, setShowUltraSimpleModal] = useState(false)
  const [showRealSolModal, setShowRealSolModal] = useState(false)
  const [showFogoDepositModal, setShowFogoDepositModal] = useState(false)
  const [showWorkingWithdrawModal, setShowWorkingWithdrawModal] = useState(false)
  const [showFogoWithdrawModal, setShowFogoWithdrawModal] = useState(false)
  const [showCrucibleCreationModal, setShowCrucibleCreationModal] = useState(false)

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
             alert('⚠️ Please connect your FOGO wallet first!\n\nClick "Log in with FOGO" to start using the protocol.')
             return
           }

           if (action === 'deposit') {
             setSelectedCrucible(crucibleId);
             // All deposits now use FOGO through Phantom wallet
             setShowFogoDepositModal(true);
           } else if (action === 'withdraw') {
             setSelectedCrucible(crucibleId);
             // All withdrawals now use FOGO through Phantom wallet
             setShowFogoWithdrawModal(true);
           }
         }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">🔥 Crucible Management</h2>
          <p className="text-fogo-gray-400 text-sm mt-1">Manage your FOGO token deposits and earn rewards</p>
        </div>
        <button 
          onClick={() => setShowCrucibleCreationModal(true)}
          className="bg-fogo-gray-700 hover:bg-fogo-gray-600 text-fogo-gray-300 hover:text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 border border-fogo-gray-600 hover:border-fogo-gray-500"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Crucible</span>
        </button>
      </div>

      {/* Action tabs removed - actions are now directly on crucible cards */}

      {/* Crucibles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crucibles.map((crucible) => (
          <div key={crucible.id} className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700 shadow-fogo hover:shadow-fogo-lg transition-all duration-300 hover:border-fogo-primary/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-fogo-primary/20 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-fogo-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">{crucible.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(crucible.status)}`}>
                {crucible.status}
              </span>
            </div>
            <div className="space-y-3 text-sm text-fogo-gray-300 mb-6">
              <div className="flex justify-between">
                <span>TVL:</span>
                <span className="font-medium text-white">{formatCurrency(crucible.tvl)}</span>
              </div>
              <div className="flex justify-between">
                <span>APY:</span>
                <span className="font-medium text-fogo-accent">{formatPercentage(crucible.apr)}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Deposit:</span>
                <span className="font-medium text-white">{crucible.userDeposit.toLocaleString()} {crucible.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Shares:</span>
                <span className="font-medium text-white">{crucible.userShares.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleAction('deposit', crucible.id)}
                className="flex-1 bg-gradient-to-r from-fogo-primary to-fogo-secondary hover:from-fogo-primary-dark hover:to-fogo-secondary-dark text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-fogo hover:shadow-flame"
              >
                <ArrowUpIcon className="h-4 w-4" />
                <span>Deposit</span>
              </button>
              <button
                onClick={() => handleAction('withdraw', crucible.id)}
                className="flex-1 bg-fogo-gray-700 hover:bg-fogo-gray-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 border border-fogo-gray-600 hover:border-fogo-primary/30"
              >
                <ArrowDownIcon className="h-4 w-4" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Stats */}
      <div className="bg-fogo-gray-900 rounded-2xl p-6 border border-fogo-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Your Overall Crucible Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-fogo-gray-800 rounded-xl">
            <p className="text-fogo-gray-400 text-sm mb-2">Total Deposited</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(crucibles.reduce((sum, c) => sum + c.userDeposit, 0))}
            </p>
          </div>
          <div className="text-center p-4 bg-fogo-gray-800 rounded-xl">
            <p className="text-fogo-gray-400 text-sm mb-2">Total Shares</p>
            <p className="text-2xl font-bold text-white">
              {crucibles.reduce((sum, c) => sum + c.userShares, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-fogo-gray-800 rounded-xl">
            <p className="text-fogo-gray-400 text-sm mb-2">Estimated APY</p>
            <p className="text-2xl font-bold text-fogo-primary">
              {formatPercentage(crucibles.reduce((sum, c) => sum + c.apr, 0) / crucibles.length)}
            </p>
          </div>
        </div>
      </div>

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

      {/* Crucible Creation Modal */}
      <CrucibleCreationModal
        isOpen={showCrucibleCreationModal}
        onClose={() => setShowCrucibleCreationModal(false)}
      />
    </div>
  )
}