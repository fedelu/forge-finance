import React, { useState } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  FireIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useGovernance } from '../contexts/GovernanceContext'
import { useWallet } from '../contexts/WalletContext'
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
  const [activeTab, setActiveTab] = useState<'proposals' | 'voting' | 'delegation'>('proposals')
  const [showProposalCreationModal, setShowProposalCreationModal] = useState(false)
  const userVotingPower = getUserVotingPower()
  
  // Use wallet connection status instead of prop
  const isWalletConnected = connected

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
      case 'active': return 'bg-blue-900 text-blue-300'
      case 'passed': return 'bg-green-900 text-green-300'
      case 'rejected': return 'bg-red-900 text-red-300'
      case 'pending': return 'bg-yellow-900 text-yellow-300'
      default: return 'bg-gray-900 text-gray-300'
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
      case 'protocol': return 'bg-purple-900 text-purple-300'
      case 'crucible': return 'bg-orange-900 text-orange-300'
      case 'governance': return 'bg-blue-900 text-blue-300'
      default: return 'bg-gray-900 text-gray-300'
    }
  }

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    if (!isWalletConnected) {
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
        <h2 className="text-2xl font-bold text-white">Governance</h2>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Voting Power</p>
            <p className="text-lg font-semibold text-white">{userVotingPower.toLocaleString()} SPARKS</p>
          </div>
          <button 
            onClick={() => setShowProposalCreationModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Proposal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('proposals')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'proposals' ? 'bg-forge-primary text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ChartBarIcon className="h-5 w-5" />
          <span>Proposals</span>
        </button>
        <button
          onClick={() => setActiveTab('voting')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'voting' ? 'bg-forge-primary text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <CheckCircleIcon className="h-5 w-5" />
          <span>Voting</span>
        </button>
        <button
          onClick={() => setActiveTab('delegation')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'delegation' ? 'bg-forge-primary text-white' : 'text-gray-400 hover:text-white'
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
            <div key={proposal.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      <span className="ml-1">{proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                      {proposal.category.charAt(0).toUpperCase() + proposal.category.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{proposal.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{proposal.description}</p>
                  <p className="text-xs text-gray-500">Proposed by {proposal.proposer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Time Remaining</p>
                  <p className="text-lg font-semibold text-white">{formatTimeRemaining(proposal.endTime)}</p>
                </div>
              </div>

              {/* Voting Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">For</p>
                  <p className="text-lg font-semibold text-green-400">{proposal.votesFor.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Against</p>
                  <p className="text-lg font-semibold text-red-400">{proposal.votesAgainst.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-lg font-semibold text-white">{proposal.totalVotes.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-1">
                  <span>Votes For</span>
                  <span>{((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(proposal.votesFor / proposal.totalVotes) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              {proposal.status === 'active' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleVote(proposal.id, 'for')}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Vote For</span>
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'against')}
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2"
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
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Your Voting History</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Increase USDC Crucible APR</span>
              <span className="text-green-400 font-semibold">Voted For</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Add ETH Crucible</span>
              <span className="text-green-400 font-semibold">Voted For</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300">Reduce Protocol Fees</span>
              <span className="text-red-400 font-semibold">Voted Against</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'delegation' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Delegate Voting Power</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="delegate-address" className="block text-sm font-medium text-gray-300 mb-2">
                Delegate Address
              </label>
              <input
                type="text"
                id="delegate-address"
                placeholder="Enter delegate address"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="delegate-amount" className="block text-sm font-medium text-gray-300 mb-2">
                Amount to Delegate
              </label>
              <input
                type="number"
                id="delegate-amount"
                placeholder="0"
                className="input"
              />
            </div>
            <button className="btn-primary w-full">Delegate Voting Power</button>
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
