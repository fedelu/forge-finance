/**
 * FOGO Sessions Example Usage
 * 
 * This file demonstrates how to use FOGO Sessions in a DeFi dApp
 * with various common operations like swaps, deposits, and borrows.
 */

import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  createFogoSession, 
  useFogoSession,
  swapWithFogoSession,
  depositWithFogoSession,
  borrowWithFogoSession,
  revokeFogoSession,
  FogoWallet,
  FogoSession
} from '../utils/fogoSession';

// Mock wallet implementation for testing
class MockWallet implements FogoWallet {
  publicKey: PublicKey | null = null;
  isConnected: boolean = false;
  
  async connect() {
    // Mock connection - in real app this would connect to Phantom, etc.
    this.publicKey = new PublicKey('11111111111111111111111111111111');
    this.isConnected = true;
    return { publicKey: this.publicKey };
  }
  
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    // Mock signature - in real app this would use wallet's signMessage
    console.log('Mock signing message:', Buffer.from(message).toString('hex'));
    return new Uint8Array(64).fill(1); // Mock signature
  }
  
  async signTransaction<T extends any>(tx: T): Promise<T> {
    // Mock transaction signing
    console.log('Mock signing transaction');
    return tx;
  }
}

/**
 * Example: Complete FOGO Sessions workflow
 */
export async function exampleFogoSessionsWorkflow() {
  console.log('🚀 Starting FOGO Sessions Example Workflow...');
  
  try {
    // 1. Initialize wallet
    const wallet = new MockWallet();
    await wallet.connect();
    console.log('✅ Wallet connected:', wallet.publicKey?.toString());
    
    // 2. Define session configuration
    const domain = 'https://forge-finance.vercel.app';
    const allowedTokens = [
      'So11111111111111111111111111111111111111112', // Wrapped SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'  // USDT
    ];
    const limits = {
      'So11111111111111111111111111111111111111112': BigInt(5) * BigInt(LAMPORTS_PER_SOL), // 5 SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': BigInt(1000) * BigInt(1000000), // 1000 USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': BigInt(1000) * BigInt(1000000)  // 1000 USDT
    };
    const expiryMs = 24 * 60 * 60 * 1000; // 24 hours
    
    // 3. Create FOGO Session
    console.log('\n🔥 Creating FOGO Session...');
    const session = await createFogoSession(
      domain,
      allowedTokens,
      limits,
      expiryMs,
      wallet
    );
    
    console.log('✅ FOGO Session created!');
    console.log('Session Key:', session.sessionKey);
    console.log('Session Public Key:', session.sessionPublicKey.toString());
    console.log('Expires:', new Date(session.expiry).toISOString());
    
    // 4. Perform DeFi operations using the session
    
    // Example 1: Swap SOL to USDC
    console.log('\n🔄 Example 1: Swapping 1 SOL to USDC...');
    const swapSignature = await swapWithFogoSession(
      session,
      wallet,
      'So11111111111111111111111111111111111111112',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      BigInt(LAMPORTS_PER_SOL) // 1 SOL
    );
    console.log('✅ Swap transaction:', swapSignature);
    
    // Example 2: Deposit USDC to lending protocol
    console.log('\n💰 Example 2: Depositing 100 USDC to lending protocol...');
    const depositSignature = await depositWithFogoSession(
      session,
      wallet,
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      BigInt(100) * BigInt(1000000) // 100 USDC
    );
    console.log('✅ Deposit transaction:', depositSignature);
    
    // Example 3: Borrow USDT from lending protocol
    console.log('\n💸 Example 3: Borrowing 50 USDT from lending protocol...');
    const borrowSignature = await borrowWithFogoSession(
      session,
      wallet,
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      BigInt(50) * BigInt(1000000) // 50 USDT
    );
    console.log('✅ Borrow transaction:', borrowSignature);
    
    // Example 4: Custom transaction using useFogoSession
    console.log('\n🔧 Example 4: Custom transaction...');
    const customInstruction = SystemProgram.transfer({
      fromPubkey: session.sessionPublicKey,
      toPubkey: new PublicKey('11111111111111111111111111111111'),
      lamports: 1000000 // 0.001 SOL
    });
    
    const customSignature = await useFogoSession(
      session,
      wallet,
      [customInstruction]
    );
    console.log('✅ Custom transaction:', customSignature);
    
    // 5. Session management
    console.log('\n📊 Session Status:');
    console.log('Is Active:', session.isActive);
    console.log('Expiry:', new Date(session.expiry).toISOString());
    console.log('Allowed Tokens:', session.config.allowedTokens);
    console.log('Limits:', session.config.limits);
    
    // 6. Revoke session (optional)
    console.log('\n🔄 Revoking FOGO Session...');
    await revokeFogoSession(session);
    console.log('✅ Session revoked');
    
    console.log('\n🎉 FOGO Sessions workflow completed successfully!');
    
  } catch (error) {
    console.error('❌ FOGO Sessions workflow failed:', error);
    throw error;
  }
}

/**
 * Example: React component using FOGO Sessions
 */
export function ExampleFogoSessionsComponent() {
  // This would be used in a React component
  const sessionConfig = {
    domain: 'https://forge-finance.vercel.app',
    allowedTokens: [
      'So11111111111111111111111111111111111111112', // Wrapped SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'  // USDC
    ],
    limits: {
      'So11111111111111111111111111111111111111112': BigInt(5) * BigInt(LAMPORTS_PER_SOL),
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': BigInt(1000) * BigInt(1000000)
    },
    expiryMs: 24 * 60 * 60 * 1000,
    autoRenew: true,
    storageKey: 'forge-fogo-session'
  };
  
  // In a real React component, you would use:
  // const fogoSession = useFogoSession(sessionConfig);
  
  return {
    config: sessionConfig,
    note: 'This config would be used with useFogoSession hook in React components'
  };
}

/**
 * Example: Integration with existing DeFi protocols
 */
export class FogoSessionsDeFiIntegration {
  private session: FogoSession | null = null;
  private wallet: FogoWallet | null = null;
  
  constructor(session: FogoSession, wallet: FogoWallet) {
    this.session = session;
    this.wallet = wallet;
  }
  
  /**
   * Swap tokens using Jupiter or similar DEX
   */
  async swapTokens(
    fromToken: string,
    toToken: string,
    amount: bigint,
    slippage: number = 0.5
  ): Promise<string> {
    if (!this.session || !this.wallet) {
      throw new Error('Session or wallet not initialized');
    }
    
    console.log(`🔄 Swapping ${amount} ${fromToken} to ${toToken} with ${slippage}% slippage`);
    
    // Mock Jupiter swap instruction
    const swapInstruction = SystemProgram.transfer({
      fromPubkey: this.session.sessionPublicKey,
      toPubkey: new PublicKey('JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB'), // Jupiter program
      lamports: Number(amount)
    });
    
    return await useFogoSession(this.session, this.wallet, [swapInstruction]);
  }
  
  /**
   * Deposit to Solend lending protocol
   */
  async depositToSolend(
    token: string,
    amount: bigint
  ): Promise<string> {
    if (!this.session || !this.wallet) {
      throw new Error('Session or wallet not initialized');
    }
    
    console.log(`💰 Depositing ${amount} ${token} to Solend`);
    
    // Mock Solend deposit instruction
    const depositInstruction = SystemProgram.transfer({
      fromPubkey: this.session.sessionPublicKey,
      toPubkey: new PublicKey('So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'), // Solend program
      lamports: Number(amount)
    });
    
    return await useFogoSession(this.session, this.wallet, [depositInstruction]);
  }
  
  /**
   * Borrow from Solend lending protocol
   */
  async borrowFromSolend(
    token: string,
    amount: bigint
  ): Promise<string> {
    if (!this.session || !this.wallet) {
      throw new Error('Session or wallet not initialized');
    }
    
    console.log(`💸 Borrowing ${amount} ${token} from Solend`);
    
    // Mock Solend borrow instruction
    const borrowInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey('So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'), // Solend program
      toPubkey: this.session.sessionPublicKey,
      lamports: Number(amount)
    });
    
    return await useFogoSession(this.session, this.wallet, [borrowInstruction]);
  }
  
  /**
   * Provide liquidity to Raydium AMM
   */
  async provideLiquidityToRaydium(
    tokenA: string,
    tokenB: string,
    amountA: bigint,
    amountB: bigint
  ): Promise<string> {
    if (!this.session || !this.wallet) {
      throw new Error('Session or wallet not initialized');
    }
    
    console.log(`💧 Providing liquidity: ${amountA} ${tokenA} + ${amountB} ${tokenB}`);
    
    // Mock Raydium liquidity instruction
    const liquidityInstruction = SystemProgram.transfer({
      fromPubkey: this.session.sessionPublicKey,
      toPubkey: new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'), // Raydium program
      lamports: Number(amountA + amountB)
    });
    
    return await useFogoSession(this.session, this.wallet, [liquidityInstruction]);
  }
}

// Run example if this file is executed directly
if (require.main === module) {
  exampleFogoSessionsWorkflow()
    .then(() => {
      console.log('✅ Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Example failed:', error);
      process.exit(1);
    });
}
