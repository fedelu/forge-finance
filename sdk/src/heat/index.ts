import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { WalletAdapter, ProgramModule } from '../types';
import { getProgram } from '../utils';

interface ForgeHeatIdl extends Idl {
  // Define types specific to forge_heat IDL if needed
}

export class HeatClient implements ProgramModule<ForgeHeatIdl> {
  program: Program<ForgeHeatIdl>;
  connection: Connection;
  wallet: WalletAdapter;

  constructor(connection: Connection, wallet: WalletAdapter, programId: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.program = {} as Program<ForgeHeatIdl>;
  }

  async initializeHeatDistributor(
    heatMint: PublicKey,
    heatRate: number
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }

  async distributeHeat(
    recipientHeatAccount: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }

  async updateHeatRate(
    newHeatRate: number
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }
}