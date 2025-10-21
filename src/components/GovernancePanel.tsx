import React, { useState } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  BanknotesIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useGovernance } from '../contexts/GovernanceContext'
import { useWallet } from '../contexts/WalletContext'
import { useBalance } from '../contexts/BalanceContext'
import { ProposalCreationModal } from './ProposalCreationModal'

interface Proposal {
  id: string
  title: string
  description: string
  status: 'active' | 'passed' | 'rejected' | 'pending' | 'executed'
  votesFor: number
  votesAgainst: number
  totalVotes: number
  endTime: Date
  proposer: string
  category: 'protocol' | 'crucible' | 'governance'
}

interface GovernancePanelProps {
  className?: string
  onVote?: (proposalId: string, vote: 'yes' | 'no') => void
  isConnected?: boolean
}

export default function GovernancePanel({ className = '', onVote, isConnected = false }: GovernancePanelProps) {
  const { proposals, voteOnProposal, getUserVotingPower } = useGovernance()
  const { connected } = useWallet()
  const { balances } = useBalance()
  const [activeTab, setActiveTab] = useState<'proposals' | 'voting' | 'delegation'>('proposals')
  const [showProposalCreationModal, setShowProposalCreationModal] = useState(false)
  
  // Get actual SPARK balance from balances context
  const sparkBalance = balances.find(b => b.symbol === 'SPARK')?.amount || 0
  const userVotingPower = sparkBalance // Use actual SPARK balance as voting power

  // Convert governance context proposals to match the interface
  const convertedProposals: Proposal[] = proposals.map(proposal => ({
    id: proposal.id,
    title: proposal.title,
    description: proposal.description,
    status: proposal.status,
    votesFor: proposal.votesFor,
    votesAgainst: proposal.votesAgainst,
    totalVotes: proposal.totalVotes,
    endTime: new Date(proposal.endTime),
    proposer: proposal.creator,
    category: proposal.category as 'protocol' | 'crucible' | 'governance'
  }))

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-forge-primary/10 text-forge-primary border border-forge-primary/20'
      case 'passed': return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
      case 'rejected': return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
      case 'pending': return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
      default: return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <ClockIcon className="h-4 w-4" />
      case 'passed': return <CheckCircleIcon className="h-4 w-4" />
      case 'rejected': return <XCircleIcon className="h-4 w-4" />
      case 'pending': return <ClockIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protocol': return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
      case 'crucible': return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
      case 'governance': return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
      default: return 'bg-forge-gray-800 text-forge-gray-300 border border-forge-gray-600'
    }
  }

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    if (!connected) {
      alert('⚠️ Please connect your wallet first!\n\nClick "Connect Wallet" to start using the protocol.')
      return
    }

    // Use governance context to vote
    voteOnProposal(proposalId, vote, userVotingPower)
    alert(`Vote ${vote} recorded for proposal ${proposalId}`)

    const voteType = vote === 'for' ? 'yes' : 'no'
    onVote?.(proposalId, voteType)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-inter-bold text-white mb-2">Forge Governance</h2>
          <p className="text-forge-gray-400 font-inter-light">Shape the future of the Forge ecosystem</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right p-4 bg-forge-gray-800 rounded-xl">
            <p className="text-sm text-forge-gray-400 mb-1">Voting Power</p>
            <p className="text-lg font-semibold text-white">{userVotingPower.toLocaleString()} SPARKS</p>
            <p className="text-xs text-forge-gray-500">1 SPARK = 1 Vote</p>
          </div>
          <button 
            onClick={() => setShowProposalCreationModal(true)}
            className="bg-forge-gray-700 hover:bg-forge-gray-600 text-forge-gray-300 hover:text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center space-x-2 border border-forge-gray-600 hover:border-forge-gray-500"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Proposal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-forge-gray-800 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'proposals' ? 'bg-forge-primary text-white shadow-fogo' : 'text-forge-gray-400 hover:text-white hover:bg-forge-gray-700'
          }`}
        >
          <ChartBarIcon className="h-5 w-5" />
          <span>Proposals</span>
        </button>
        <button
          onClick={() => setActiveTab('voting')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'voting' ? 'bg-forge-primary text-white shadow-fogo' : 'text-forge-gray-400 hover:text-white hover:bg-forge-gray-700'
          }`}
        >
          <CheckCircleIcon className="h-5 w-5" />
          <span>Voting</span>
        </button>
        <button
          onClick={() => setActiveTab('delegation')}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
            activeTab === 'delegation' ? 'bg-forge-primary text-white shadow-fogo' : 'text-forge-gray-400 hover:text-white hover:bg-forge-gray-700'
          }`}
        >
          <UserGroupIcon className="h-5 w-5" />
          <span>Delegation</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          {convertedProposals.map((proposal) => (
            <div key={proposal.id} className="bg-forge-gray-900 rounded-2xl p-6 border border-forge-gray-700 shadow-fogo hover:shadow-forge-lg transition-all duration-300 hover:border-forge-primary/30">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      <span>{proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                      {proposal.category.charAt(0).toUpperCase() + proposal.category.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{proposal.title}</h3>
                  <p className="text-forge-gray-300 text-sm mb-4">{proposal.description}</p>
                  <p className="text-xs text-forge-gray-500">Proposed by {proposal.proposer}</p>
                </div>
                <div className="text-right p-3 bg-forge-gray-800 rounded-xl">
                  <p className="text-sm text-forge-gray-400 mb-1">Time Remaining</p>
                  <p className="text-lg font-semibold text-forge-primary">{formatTimeRemaining(proposal.endTime)}</p>
                </div>
              </div>

              {/* Voting Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-forge-gray-800 rounded-xl border border-forge-gray-700">
                  <p className="text-sm text-forge-gray-400 mb-1">For</p>
                  <p className="text-lg font-semibold text-white">{proposal.votesFor.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-forge-gray-800 rounded-xl border border-forge-gray-700">
                  <p className="text-sm text-forge-gray-400 mb-1">Against</p>
                  <p className="text-lg font-semibold text-white">{proposal.votesAgainst.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-forge-gray-800 rounded-xl border border-forge-gray-700">
                  <p className="text-sm text-forge-gray-400 mb-1">Total</p>
                  <p className="text-lg font-semibold text-forge-primary">{proposal.totalVotes.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-forge-gray-400 mb-2">
                  <span>Votes For</span>
                  <span>{((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-forge-gray-700 rounded-full h-2">
                  <div 
                    className="bg-forge-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              {proposal.status === 'active' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleVote(proposal.id, 'for')}
                    className="flex-1 bg-forge-primary hover:bg-forge-primary-dark text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-fogo hover:shadow-flame"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Vote For</span>
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'against')}
                    className="flex-1 bg-forge-primary hover:bg-forge-primary-dark text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-fogo hover:shadow-flame"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    <span>Vote Against</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'voting' && (
        <div className="bg-forge-gray-900 rounded-2xl p-6 border border-forge-gray-700 shadow-fogo">
          <h3 className="text-lg font-semibold text-white mb-4">Your Voting History</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-forge-gray-800 rounded-xl border border-forge-gray-700">
              <span className="text-forge-gray-300">Increase USDC Crucible APR</span>
              <span className="text-forge-primary font-semibold">Voted For</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-forge-gray-800 rounded-xl border border-forge-gray-700">
              <span className="text-forge-gray-300">Add ETH Crucible</span>
              <span className="text-forge-primary font-semibold">Voted For</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-forge-gray-800 rounded-xl border border-forge-gray-700">
              <span className="text-forge-gray-300">Reduce Protocol Fees</span>
              <span className="text-forge-gray-400 font-semibold">Voted Against</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'delegation' && (
        <div className="bg-forge-gray-900 rounded-2xl p-6 border border-forge-gray-700 shadow-fogo">
          <h3 className="text-lg font-semibold text-white mb-4">Delegate Voting Power</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="delegate-address" className="block text-sm font-medium text-forge-gray-300 mb-2">
                Delegate Address
              </label>
              <input
                type="text"
                id="delegate-address"
                placeholder="Enter delegate address"
                className="w-full px-4 py-3 bg-forge-gray-800 border border-forge-gray-600 rounded-xl text-white focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="delegate-amount" className="block text-sm font-medium text-forge-gray-300 mb-2">
                Amount to Delegate
              </label>
              <input
                type="number"
                id="delegate-amount"
                placeholder="0"
                className="w-full px-4 py-3 bg-forge-gray-800 border border-forge-gray-600 rounded-xl text-white focus:outline-none focus:border-forge-primary focus:ring-2 focus:ring-forge-primary/20 transition-all duration-200"
              />
            </div>
            <button className="w-full bg-forge-primary hover:bg-forge-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-fogo hover:shadow-flame">
              Delegate Voting Power
            </button>
          </div>
        </div>
      )}

      {/* Proposal Creation Modal */}
      <ProposalCreationModal
        isOpen={showProposalCreationModal}
        onClose={() => setShowProposalCreationModal(false)}
      />
    </div>
  )
}
