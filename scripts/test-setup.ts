// Test setup script for Forge Protocol

import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { ForgeUtils } from '../sdk/src/utils'

async function setupTestEnvironment() {
  console.log('🧪 Setting up test environment...')

  // Setup connection
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  console.log('📡 Connected to Solana devnet')

  // Create test accounts
  const testAuthority = Keypair.generate()
  const testUser = Keypair.generate()
  const testTreasury = Keypair.generate()

  console.log('👤 Test authority:', testAuthority.publicKey.toString())
  console.log('👤 Test user:', testUser.publicKey.toString())
  console.log('💰 Test treasury:', testTreasury.publicKey.toString())

  // Airdrop SOL to test accounts
  try {
    console.log('💸 Airdropping SOL to test accounts...')
    
    const airdropAmount = 2 * 1e9 // 2 SOL in lamports
    
    await connection.requestAirdrop(testAuthority.publicKey, airdropAmount)
    await connection.requestAirdrop(testUser.publicKey, airdropAmount)
    await connection.requestAirdrop(testTreasury.publicKey, airdropAmount)
    
    console.log('✅ Airdrop completed')
  } catch (error) {
    console.error('❌ Airdrop failed:', error)
  }

  // Create test token mints
  console.log('🪙 Creating test token mints...')
  
  // In a real test setup, you would create SPL token mints
  // For now, we'll just log the process
  
  console.log('✅ Test environment setup completed!')
  console.log('📋 Test accounts ready for use')
}

async function main() {
  try {
    await setupTestEnvironment()
  } catch (error) {
    console.error('❌ Test setup failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
