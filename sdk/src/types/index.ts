// Common types used across Forge Protocol
import { Program, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

export interface ForgeConfig {
  cluster: 'localnet' | 'devnet' | 'mainnet-beta';
  commitment: 'processed' | 'confirmed' | 'finalized';
  coreProgramId: PublicKey;
  cruciblesProgramId: PublicKey;
  sparksProgramId: PublicKey;
  smeltersProgramId: PublicKey;
  heatProgramId: PublicKey;
  reactorsProgramId: PublicKey;
  firewallProgramId: PublicKey;
  engineersProgramId: PublicKey;
}

export interface ProtocolStats {
  totalCrucibles: number;
  totalTVL: number;
  totalUsers: number;
  averageAPR: number;
}

export interface WalletAdapter {
  publicKey: PublicKey | null;
  signTransaction: ((transaction: any) => Promise<any>) | undefined;
  signAllTransactions: ((transactions: any[]) => Promise<any[]>) | undefined;
}

export interface ProgramModule<T extends Idl> {
  program: Program<T>;
  connection: Connection;
  wallet: WalletAdapter;
}

export interface ProtocolConfig {
  cruciblesProgram: string;
  sparksProgram: string;
  smeltersProgram: string;
  heatProgram: string;
  reactorsProgram: string;
  firewallProgram: string;
  engineersProgram: string;
  protocolFeeRate: number;
  maxCrucibles: number;
}

export interface CrucibleParams {
  heatRate: number;
  protocolFeeRate: number;
  minDepositDuration: number;
  maxDepositAmount: number;
}

export interface SparkParams {
  maxSupply: number;
  decimals: number;
  name: string;
  symbol: string;
  uri: string;
  isTransferable: boolean;
  isBurnable: boolean;
  votingPowerMultiplier: number;
}

export interface SmelterParams {
  mintRatio: number;
  burnRatio: number;
}

export interface HeatParams {
  emissionRate: number;
}

export interface ReactorParams {
  feeRate: number;
  protocolFeeRate: number;
}

export interface FirewallParams {
  guardian: string;
  emergencyPauseAuthority: string;
  maxRoles: number;
}

export interface EngineerParams {
  name: string;
  description: string;
  website: string;
}

export interface CrucibleCreationParams {
  baseMint: string;
  heatMint: string;
  heatRate: number;
  protocolFeeRate: number;
  minDepositDuration: number;
  maxDepositAmount: number;
  strategyType: StrategyType;
}

export interface StrategyParams {
  heatRate: number;
  protocolFeeRate: number;
  minDepositDuration: number;
  maxDepositAmount: number;
}

export enum StrategyType {
  Basic = 'Basic',
  YieldFarming = 'YieldFarming',
  LiquidityProvision = 'LiquidityProvision',
  Staking = 'Staking',
  Lending = 'Lending',
  Custom = 'Custom',
}

export enum Role {
  Admin = 'Admin',
  Guardian = 'Guardian',
  Engineer = 'Engineer',
  User = 'User',
  SuperAdmin = 'SuperAdmin',
}

export interface EngineerStats {
  totalCruciblesCreated: number;
  totalTvlManaged: number;
  isActive: boolean;
  createdAt: number;
}

export interface UserPosition {
  owner: string;
  crucible: string;
  depositedAmount: number;
  sparkBalance: number;
  depositedAt: number;
  lastHeatClaim: number;
  pendingHeat: number;
}

export interface UserRewards {
  user: string;
  heatSystem: string;
  pendingRewards: number;
  totalEarned: number;
  totalClaimed: number;
  lastUpdateTime: number;
}

export interface VotingDelegation {
  delegator: string;
  delegate: string;
  amount: number;
  delegatedAt: number;
}
