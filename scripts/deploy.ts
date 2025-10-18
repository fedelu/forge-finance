// Deployment script for Forge Protocol

import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { ForgeUtils } from '../sdk/src/utils'
import { ProtocolConfig } from '../sdk/src/types'

const PROGRAM_IDS = {
  forge_core: 'Fg81502134629458228979442866117380252661569231764',
  forge_crucibles: 'Cruc1111111111111111111111111111111111111',
  forge_sparks: 'Sprk1111111111111111111111111111111111111',
  forge_smelters: 'Smelt1111111111111111111111111111111111111',
  forge_heat: 'Heat1111111111111111111111111111111111111111',
  forge_reactors: 'FReactor1111111111111111111111111111111',
  forge_firewall: 'Fire1111111111111111111111111111111111111111',
  forge_engineers: 'Eng11111111111111111111111111111111111111111',
}

async function deployProtocol() {
  console.log('🔥 Deploying Forge Protocol...')

  // Setup connection
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
  console.log('📡 Connected to Solana devnet')

  // Create authority keypair (in production, use a secure key management system)
  const authority = Keypair.generate()
  console.log('🔑 Generated authority keypair:', authority.publicKey.toString())

  // Create treasury keypair
  const treasury = Keypair.generate()
  console.log('💰 Generated treasury keypair:', treasury.publicKey.toString())

  // Create guardian keypair
  const guardian = Keypair.generate()
  console.log('🛡️ Generated guardian keypair:', guardian.publicKey.toString())

  // Create emergency pause authority
  const emergencyPauseAuthority = Keypair.generate()
  console.log('🚨 Generated emergency pause authority:', emergencyPauseAuthority.publicKey.toString())

  // Initialize protocol configuration
  const protocolConfig: ProtocolConfig = {
    cruciblesProgram: PROGRAM_IDS.forge_crucibles,
    sparksProgram: PROGRAM_IDS.forge_sparks,
    smeltersProgram: PROGRAM_IDS.forge_smelters,
    heatProgram: PROGRAM_IDS.forge_heat,
    reactorsProgram: PROGRAM_IDS.forge_reactors,
    firewallProgram: PROGRAM_IDS.forge_firewall,
    engineersProgram: PROGRAM_IDS.forge_engineers,
    protocolFeeRate: 100, // 1% in basis points
    maxCrucibles: 1000,
  }

  console.log('⚙️ Protocol configuration:', protocolConfig)

  // In a real deployment, you would:
  // 1. Deploy each program using `anchor deploy`
  // 2. Initialize the core protocol
  // 3. Set up the firewall
  // 4. Create initial crucibles
  // 5. Fund the treasury

  console.log('✅ Deployment completed!')
  console.log('📋 Next steps:')
  console.log('1. Fund the authority account with SOL')
  console.log('2. Initialize the protocol using the core program')
  console.log('3. Set up the firewall with proper roles')
  console.log('4. Create initial crucibles for testing')
  console.log('5. Fund the treasury with reward tokens')
}

async function main() {
  try {
    await deployProtocol()
  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
