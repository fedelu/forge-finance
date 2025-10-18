import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { WalletAdapter, ProgramModule } from '../types';
import { getProgram } from '../utils';

interface ForgeSmeltersIdl extends Idl {
  // Define types specific to forge_smelters IDL if needed
}

export class SmeltersClient implements ProgramModule<ForgeSmeltersIdl> {
  program: Program<ForgeSmeltersIdl>;
  connection: Connection;
  wallet: WalletAdapter;

  constructor(connection: Connection, wallet: WalletAdapter, programId: PublicKey) {
    this.connection = connection;
    this.wallet = wallet;
    this.program = {} as Program<ForgeSmeltersIdl>;
  }

  async mintSparks(
    sparkMint: PublicKey,
    toAccount: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }

  async burnSparks(
    sparkMint: PublicKey,
    fromAccount: PublicKey,
    amount: number
  ): Promise<TransactionInstruction> {
    return {} as TransactionInstruction;
  }
}