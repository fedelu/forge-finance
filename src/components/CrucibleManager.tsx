import React, { useState } from 'react'
import { 
  FireIcon, 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon
} from '@heroicons/react/24/outline'
import { useWallet } from '../contexts/WalletContext'
import { useCrucible } from '../contexts/CrucibleContext'
import { DepositModal } from './DepositModal'
import { UltraSimpleModal } from './UltraSimpleModal'
import { RealSolModal } from './RealSolModal'
import { FogoDepositModal } from './FogoDepositModal'
import { WorkingWithdrawModal } from './WorkingWithdrawModal'
import { RealFogoWithdrawModal } from './RealFogoWithdrawModal'
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
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'manage'>('deposit')
  const [selectedCrucible, setSelectedCrucible] = useState<string | null>(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showUltraSimpleModal, setShowUltraSimpleModal] = useState(false)
  const [showRealSolModal, setShowRealSolModal] = useState(false)
  const [showFogoDepositModal, setShowFogoDepositModal] = useState(false)
  const [showWorkingWithdrawModal, setShowWorkingWithdrawModal] = useState(false)
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
      case 'active': return 'bg-green-900 text-green-300'
      case 'paused': return 'bg-yellow-900 text-yellow-300'
      case 'maintenance': return 'bg-red-900 text-red-300'
      default: return 'bg-gray-900 text-gray-300'
    }
  }

  const handleAction = (action: string, crucibleId: string) => {
    if (!connected) {
      alert('⚠️ Please connect your wallet first!\n\nClick "Connect Wallet" to start using the protocol.')
      return
    }

    if (action === 'deposit') {
      setSelectedCrucible(crucibleId);
      
      // Check if this is a FOGO crucible
      const isFogoCrucible = crucibleId.toLowerCase().includes('fogo');
      
      if (isFogoCrucible) {
        // For FOGO crucible, show FOGO deposit option
        setShowFogoDepositModal(true);
      } else {
        // For other crucibles, show the existing options
        const choice = prompt('Choose transaction type:\n\n1 = Basic simulation\n2 = Ultra simple (no errors, no real SOL)\n3 = Real SOL transaction (uses your SOL)\n\nEnter 1, 2, or 3:');
        
        if (choice === '1') {
          setShowDepositModal(true);
        } else if (choice === '2') {
          setShowUltraSimpleModal(true);
        } else if (choice === '3') {
          setShowRealSolModal(true);
        } else {
          alert('Invalid choice. Please try again.');
        }
      }
    } else if (action === 'withdraw') {
      setSelectedCrucible(crucibleId);
      setShowWorkingWithdrawModal(true);
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Crucible Management</h2>
        <button 
          onClick={() => setShowCrucibleCreationModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Crucible</span>
        </button>
      </div>

      {/* Action tabs removed - actions are now directly on crucible cards */}

      {/* Crucibles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crucibles.map((crucible) => (
          <div key={crucible.id} className="card bg-forge-gray border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">{crucible.icon}</div>
              <h3 className="text-xl font-semibold text-white">{crucible.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(crucible.status)}`}>
                {crucible.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <div className="flex justify-between">
                <span>TVL:</span>
                <span className="font-medium text-white">{formatCurrency(crucible.tvl)}</span>
              </div>
              <div className="flex justify-between">
                <span>APR:</span>
                <span className="font-medium text-forge-accent">{formatPercentage(crucible.apr)}</span>
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
            <div className="flex space-x-4">
              <button
                onClick={() => handleAction('deposit', crucible.id)}
                className="btn-sm btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                <ArrowUpIcon className="h-4 w-4" />
                <span>Deposit</span>
              </button>
              <button
                onClick={() => handleAction('withdraw', crucible.id)}
                className="btn-sm btn-secondary flex-1 flex items-center justify-center space-x-2"
              >
                <ArrowDownIcon className="h-4 w-4" />
                <span>Withdraw</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Stats */}
      <div className="card bg-gray-800 border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Your Overall Crucible Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Deposited</p>
            <p className="text-2xl font-bold text-white mt-1">
              {formatCurrency(crucibles.reduce((sum, c) => sum + c.userDeposit, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Total Shares</p>
            <p className="text-2xl font-bold text-white mt-1">
              {crucibles.reduce((sum, c) => sum + c.userShares, 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Estimated APR</p>
            <p className="text-2xl font-bold text-forge-accent mt-1">
              {formatPercentage(crucibles.reduce((sum, c) => sum + c.apr, 0) / crucibles.length)}
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedCrucible && (
        <>
          <DepositModal
            isOpen={showDepositModal}
            onClose={() => setShowDepositModal(false)}
            crucibleId={selectedCrucible}
          />
          <UltraSimpleModal
            isOpen={showUltraSimpleModal}
            onClose={() => setShowUltraSimpleModal(false)}
            crucibleId={selectedCrucible}
          />
          <RealSolModal
            isOpen={showRealSolModal}
            onClose={() => setShowRealSolModal(false)}
            crucibleId={selectedCrucible}
          />
          <FogoDepositModal
            isOpen={showFogoDepositModal}
            onClose={() => setShowFogoDepositModal(false)}
            crucibleId={selectedCrucible}
          />
          <WorkingWithdrawModal
            isOpen={showWorkingWithdrawModal}
            onClose={() => setShowWorkingWithdrawModal(false)}
            crucibleId={selectedCrucible}
            maxAmount={crucibles.find(c => c.id === selectedCrucible)?.userDeposit || 0}
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