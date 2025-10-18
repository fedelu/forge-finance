import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { WalletAdapter, ProgramModule } from '../types';
import { getProgram } from '../utils';

interface ForgeSparksIdl extends Idl {
  // Define types specific to forge_sparks IDL if needed
}

export class SparksClient implements ProgramModule<ForgeSparksIdl> {
  program: Program<ForgeSparksIdl>;
  connection: Connection;
  wallet: WalletAdapter;

  constructor(connection: Connection, wallet: WalletAdapter, programId: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.program = {} as Program<ForgeSparksIdl>;
  }

  async initializeSpark(
    crucible: PublicKey,
    params: {
      maxSupply: number;
      decimals: number;
      name: string;
      symbol: string;
      uri: string;
      isTransferable: boolean;
      isBurnable: boolean;
      votingPowerMultiplier: number;
    }
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }

  async stakeSparks(
    spark: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }

  async unstakeSparks(
    spark: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }
}