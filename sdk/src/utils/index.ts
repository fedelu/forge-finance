// Utility functions for Forge Protocol SDK

import { PublicKey, Connection, Commitment } from '@solana/web3.js';
import { AnchorProvider, Wallet, Program, Idl } from '@coral-xyz/anchor';
import { WalletAdapter } from '../types';

export class ForgeUtils {
  /**
   * Create a connection to Solana cluster
   */
  static createConnection(
    cluster: 'localnet' | 'devnet' | 'mainnet-beta',
    commitment: Commitment = 'confirmed'
  ): Connection {
    const endpoint = this.getClusterEndpoint(cluster);
    return new Connection(endpoint, commitment);
  }

  /**
   * Get cluster endpoint URL
   */
  static getClusterEndpoint(cluster: 'localnet' | 'devnet' | 'mainnet-beta'): string {
    switch (cluster) {
      case 'localnet':
        return 'http://127.0.0.1:8899';
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'mainnet-beta':
        return 'https://api.mainnet-beta.solana.com';
      default:
        throw new Error(`Unknown cluster: ${cluster}`);
    }
  }

  /**
   * Create Anchor provider
   */
  static createProvider(
    connection: Connection,
    wallet: Wallet
  ): AnchorProvider {
    return new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });
  }

  /**
   * Convert lamports to SOL
   */
  static lamportsToSol(lamports: number): number {
    return lamports / 1_000_000_000;
  }

  /**
   * Convert SOL to lamports
   */
  static solToLamports(sol: number): number {
    return Math.floor(sol * 1_000_000_000);
  }

  /**
   * Calculate basis points
   */
  static toBasisPoints(percentage: number): number {
    return Math.floor(percentage * 100);
  }

  /**
   * Calculate percentage from basis points
   */
  static fromBasisPoints(basisPoints: number): number {
    return basisPoints / 100;
  }

  /**
   * Validate public key
   */
  static isValidPublicKey(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate PDA seeds
   */
  static generatePDA(seeds: (Buffer | Uint8Array)[]): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(seeds, this.getProgramId());
  }

  /**
   * Get program ID for Forge Core
   */
  static getProgramId(): PublicKey {
    return new PublicKey('Fg81502134629458228979442866117380252661569231764');
  }

  /**
   * Format number with decimals
   */
  static formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }

  /**
   * Calculate APR
   */
  static calculateAPR(
    emissionRate: number,
    totalDeposited: number,
    timePeriod: number = 365 * 24 * 60 * 60 // seconds in a year
  ): number {
    if (totalDeposited === 0) return 0;
    
    const annualEmission = emissionRate * timePeriod;
    return (annualEmission / totalDeposited) * 100;
  }

  /**
   * Calculate compound interest
   */
  static calculateCompoundInterest(
    principal: number,
    rate: number,
    time: number,
    compoundingFrequency: number = 365
  ): number {
    return principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * time);
  }

  /**
   * Sleep utility
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i === maxRetries - 1) throw lastError;
        
        const delay = baseDelay * Math.pow(2, i);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }
}

// Additional utility functions for SDK modules
export const getProgram = <T extends Idl>(
  idl: T,
  programId: PublicKey,
  connection: Connection,
  wallet: WalletAdapter
): Program<T> => {
  const provider = new AnchorProvider(
    connection,
    wallet as any, // WalletAdapter needs to be compatible with Anchor's Wallet interface
    { commitment: 'confirmed' }
  );
  return new Program<T>(idl, provider);
};

export const getPda = async (seeds: (Buffer | Uint8Array)[], programId: PublicKey): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(seeds, programId);
};

export const toU64 = (amount: number, decimals: number): number => {
  return amount * (10 ** decimals);
};

export const fromU64 = (amount: number, decimals: number): number => {
  return amount / (10 ** decimals);
};
