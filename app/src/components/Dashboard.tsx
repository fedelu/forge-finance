import React, { useState } from 'react'
import { useForge } from '../contexts/ForgeContext'
import { 
  PlusIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  FireIcon 
} from '@heroicons/react/24/outline'

export const Dashboard: React.FC = () => {
  const { forgeSDK, isConnected } = useForge()
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'claim'>('deposit')
  const [amount, setAmount] = useState('')

  if (!isConnected || !forgeSDK) {
    return null
  }

  const handleDeposit = async () => {
    if (!amount) return
    // Implementation would call forgeSDK.crucibles.deposit()
    console.log('Depositing:', amount)
  }

  const handleWithdraw = async () => {
    if (!amount) return
    // Implementation would call forgeSDK.crucibles.withdraw()
    console.log('Withdrawing:', amount)
  }

  const handleClaim = async () => {
    // Implementation would call forgeSDK.heat.claimRewards()
    console.log('Claiming rewards')
  }

  return (
    <div className="card mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Your Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action Panel */}
        <div>
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'deposit', label: 'Deposit', icon: ArrowUpIcon },
              { id: 'withdraw', label: 'Withdraw', icon: ArrowDownIcon },
              { id: 'claim', label: 'Claim', icon: FireIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-forge-primary text-white'
                    : 'text-gray-400 hover:text-white hover:bg-forge-gray'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeTab !== 'claim' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="input"
                />
              </div>
            )}

            <button
              onClick={activeTab === 'deposit' ? handleDeposit : activeTab === 'withdraw' ? handleWithdraw : handleClaim}
              className="btn-primary w-full"
            >
              {activeTab === 'deposit' && 'Deposit Tokens'}
              {activeTab === 'withdraw' && 'Withdraw Tokens'}
              {activeTab === 'claim' && 'Claim Rewards'}
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-400">Total Deposited</span>
              <span className="text-white font-semibold">$0.00</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-400">Sparks Balance</span>
              <span className="text-white font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-700">
              <span className="text-gray-400">Pending Heat</span>
              <span className="text-forge-accent font-semibold">0</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">Total Earned</span>
              <span className="text-green-400 font-semibold">$0.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
