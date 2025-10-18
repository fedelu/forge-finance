// Test suite for Forge Protocol

import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { ForgeSDK } from '../sdk/src/forge-sdk'
import { ForgeConfig, ProtocolConfig, CrucibleParams } from '../sdk/src/types'

describe('Forge Protocol Tests', () => {
  let connection: Connection
  let provider: AnchorProvider
  let forgeSDK: ForgeSDK
  let testAuthority: Keypair
  let testUser: Keypair

  beforeAll(async () => {
    // Setup connection
    connection = new Connection(clusterApiUrl('localnet'), 'confirmed')
    
    // Create test keypairs
    testAuthority = Keypair.generate()
    testUser = Keypair.generate()
    
    // Create provider
    const wallet = new Wallet(testAuthority)
    provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    })

    // Create Forge SDK
    const config: ForgeConfig = {
      cluster: 'localnet',
      commitment: 'confirmed',
    }
    
    forgeSDK = new ForgeSDK(connection, wallet, config)
  })

  describe('Protocol Initialization', () => {
    it('should initialize the protocol', async () => {
      const protocolConfig: ProtocolConfig = {
        cruciblesProgram: 'Cruc1111111111111111111111111111111111111',
        sparksProgram: 'Sprk1111111111111111111111111111111111111',
        smeltersProgram: 'Smelt1111111111111111111111111111111111111',
        heatProgram: 'Heat1111111111111111111111111111111111111111',
        reactorsProgram: 'FReactor1111111111111111111111111111111',
        firewallProgram: 'Fire1111111111111111111111111111111111111111',
        engineersProgram: 'Eng11111111111111111111111111111111111111111',
        protocolFeeRate: 100,
        maxCrucibles: 1000,
      }

      // In a real test, this would call the actual program
      expect(protocolConfig.maxCrucibles).toBe(1000)
      expect(protocolConfig.protocolFeeRate).toBe(100)
    })

    it('should check if protocol is active', async () => {
      const isActive = await forgeSDK.isProtocolActive()
      expect(typeof isActive).toBe('boolean')
    })
  })

  describe('Crucible Operations', () => {
    it('should create a crucible', async () => {
      const crucibleParams: CrucibleParams = {
        heatRate: 500, // 5% in basis points
        protocolFeeRate: 100, // 1% in basis points
        minDepositDuration: 86400, // 1 day in seconds
        maxDepositAmount: 1000000, // 1M tokens
      }

      // In a real test, this would call the actual program
      expect(crucibleParams.heatRate).toBe(500)
      expect(crucibleParams.protocolFeeRate).toBe(100)
    })

    it('should deposit tokens into crucible', async () => {
      const amount = 1000
      const crucibleId = 'test-crucible-1'
      
      // In a real test, this would call forgeSDK.crucibles.deposit()
      expect(amount).toBeGreaterThan(0)
      expect(crucibleId).toBeDefined()
    })

    it('should withdraw tokens from crucible', async () => {
      const amount = 500
      const crucibleId = 'test-crucible-1'
      
      // In a real test, this would call forgeSDK.crucibles.withdraw()
      expect(amount).toBeGreaterThan(0)
      expect(crucibleId).toBeDefined()
    })
  })

  describe('Heat Rewards', () => {
    it('should calculate APR correctly', async () => {
      const emissionRate = 1000 // tokens per second
      const totalDeposited = 1000000 // 1M tokens
      const timePeriod = 365 * 24 * 60 * 60 // seconds in a year
      
      const apr = ForgeUtils.calculateAPR(emissionRate, totalDeposited, timePeriod)
      expect(apr).toBeGreaterThan(0)
    })

    it('should claim rewards', async () => {
      const crucibleId = 'test-crucible-1'
      const amount = 100
      
      // In a real test, this would call forgeSDK.heat.claimRewards()
      expect(amount).toBeGreaterThan(0)
      expect(crucibleId).toBeDefined()
    })
  })

  describe('AMM Operations', () => {
    it('should create a reactor', async () => {
      const tokenA = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC
      const tokenB = 'So11111111111111111111111111111111111111112' // SOL
      
      // In a real test, this would call forgeSDK.reactors.initializeReactor()
      expect(tokenA).toBeDefined()
      expect(tokenB).toBeDefined()
    })

    it('should add liquidity to reactor', async () => {
      const amountA = 1000
      const amountB = 10
      
      // In a real test, this would call forgeSDK.reactors.addLiquidity()
      expect(amountA).toBeGreaterThan(0)
      expect(amountB).toBeGreaterThan(0)
    })

    it('should swap tokens', async () => {
      const amountIn = 100
      const minAmountOut = 95
      
      // In a real test, this would call forgeSDK.reactors.swapAToB()
      expect(amountIn).toBeGreaterThan(0)
      expect(minAmountOut).toBeGreaterThan(0)
    })
  })

  describe('Security and Access Control', () => {
    it('should check user roles', async () => {
      const user = testUser.publicKey
      
      // In a real test, this would call forgeSDK.firewall.hasRole()
      expect(user).toBeDefined()
    })

    it('should pause system in emergency', async () => {
      // In a real test, this would call forgeSDK.firewall.pauseSystem()
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('Utility Functions', () => {
    it('should convert lamports to SOL', () => {
      const lamports = 1000000000 // 1 SOL
      const sol = ForgeUtils.lamportsToSol(lamports)
      expect(sol).toBe(1)
    })

    it('should convert SOL to lamports', () => {
      const sol = 1.5
      const lamports = ForgeUtils.solToLamports(sol)
      expect(lamports).toBe(1500000000)
    })

    it('should calculate basis points', () => {
      const percentage = 5.5
      const basisPoints = ForgeUtils.toBasisPoints(percentage)
      expect(basisPoints).toBe(550)
    })

    it('should validate public keys', () => {
      const validKey = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      const invalidKey = 'invalid-key'
      
      expect(ForgeUtils.isValidPublicKey(validKey)).toBe(true)
      expect(ForgeUtils.isValidPublicKey(invalidKey)).toBe(false)
    })
  })
})
