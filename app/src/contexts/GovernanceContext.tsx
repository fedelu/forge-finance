import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  creator: string;
  createdAt: number;
  endTime: number;
  category: 'protocol' | 'treasury' | 'governance' | 'technical';
  options?: string[];
}

interface GovernanceContextType {
  proposals: Proposal[];
  createProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'votesFor' | 'votesAgainst' | 'totalVotes'>) => void;
  voteOnProposal: (proposalId: string, vote: 'for' | 'against', votingPower: number) => void;
  getActiveProposals: () => Proposal[];
  getProposalById: (id: string) => Proposal | undefined;
  getUserVotingPower: () => number;
}

const GovernanceContext = createContext<GovernanceContextType | undefined>(undefined);

export const useGovernance = () => {
  const context = useContext(GovernanceContext);
  if (!context) {
    throw new Error('useGovernance must be used within a GovernanceProvider');
  }
  return context;
};

interface GovernanceProviderProps {
  children: ReactNode;
}

export const GovernanceProvider: React.FC<GovernanceProviderProps> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 'prop_1',
      title: 'Increase SPARK rewards for SOL crucible',
      description: 'This proposal suggests increasing SPARK token rewards for SOL crucible deposits from 10x to 15x to incentivize more SOL liquidity.',
      status: 'active',
      votesFor: 1250,
      votesAgainst: 320,
      totalVotes: 1570,
      creator: '0x1234...5678',
      createdAt: Date.now() - 86400000, // 1 day ago
      endTime: Date.now() + 604800000, // 7 days from now
      category: 'protocol',
      options: ['Increase to 15x', 'Keep at 10x', 'Increase to 12x']
    },
    {
      id: 'prop_2',
      title: 'Add new ETH crucible with 8% APR',
      description: 'Proposal to create a new ETH crucible with competitive 8% APR to attract more ETH holders to the protocol.',
      status: 'active',
      votesFor: 890,
      votesAgainst: 150,
      totalVotes: 1040,
      creator: '0x9876...5432',
      createdAt: Date.now() - 172800000, // 2 days ago
      endTime: Date.now() + 432000000, // 5 days from now
      category: 'protocol',
      options: ['Create ETH crucible', 'Reject proposal', 'Modify APR to 6%']
    },
    {
      id: 'prop_3',
      title: 'Treasury allocation for marketing campaign',
      description: 'Allocate 50,000 USDC from treasury for a 3-month marketing campaign to increase protocol adoption.',
      status: 'passed',
      votesFor: 2100,
      votesAgainst: 400,
      totalVotes: 2500,
      creator: '0x4567...8901',
      createdAt: Date.now() - 259200000, // 3 days ago
      endTime: Date.now() - 86400000, // 1 day ago
      category: 'treasury',
      options: ['Approve allocation', 'Reject allocation', 'Reduce to 30,000 USDC']
    }
  ]);

  const createProposal = useCallback((proposal: Omit<Proposal, 'id' | 'createdAt' | 'votesFor' | 'votesAgainst' | 'totalVotes'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0
    };

    setProposals(prev => [newProposal, ...prev]);
    console.log('New proposal created:', newProposal);
  }, []);

  const voteOnProposal = useCallback((proposalId: string, vote: 'for' | 'against', votingPower: number) => {
    setProposals(prev => {
      return prev.map(proposal => {
        if (proposal.id === proposalId) {
          const newVotesFor = vote === 'for' 
            ? proposal.votesFor + votingPower 
            : proposal.votesFor;
          const newVotesAgainst = vote === 'against' 
            ? proposal.votesAgainst + votingPower 
            : proposal.votesAgainst;
          
          return {
            ...proposal,
            votesFor: newVotesFor,
            votesAgainst: newVotesAgainst,
            totalVotes: newVotesFor + newVotesAgainst
          };
        }
        return proposal;
      });
    });
    console.log(`Voted ${vote} on proposal ${proposalId} with ${votingPower} voting power`);
  }, []);

  const getActiveProposals = useCallback(() => {
    return proposals.filter(p => p.status === 'active' && p.endTime > Date.now());
  }, [proposals]);

  const getProposalById = useCallback((id: string) => {
    return proposals.find(p => p.id === id);
  }, [proposals]);

  const getUserVotingPower = useCallback(() => {
    // Mock voting power based on SPARK balance
    // In a real app, this would come from the user's SPARK balance
    return 100; // Mock value
  }, []);

  const value = {
    proposals,
    createProposal,
    voteOnProposal,
    getActiveProposals,
    getProposalById,
    getUserVotingPower
  };

  return (
    <GovernanceContext.Provider value={value}>
      {children}
    </GovernanceContext.Provider>
  );
};
