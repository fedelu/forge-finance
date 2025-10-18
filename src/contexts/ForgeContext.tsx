import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'

// Mock types for demo
interface ForgeSDK {
  getProtocolStats(): Promise<ProtocolStats>
  isProtocolActive(): Promise<boolean>
}

interface ForgeConfig {
  cluster: 'localnet' | 'devnet' | 'mainnet-beta'
  commitment: 'processed' | 'confirmed' | 'finalized'
  coreProgramId: PublicKey
  cruciblesProgramId: PublicKey
  sparksProgramId: PublicKey
  smeltersProgramId: PublicKey
  heatProgramId: PublicKey
  reactorsProgramId: PublicKey
  firewallProgramId: PublicKey
  engineersProgramId: PublicKey
}

interface ProtocolStats {
  totalCrucibles: number
  totalTVL: number
  totalUsers: number
  averageAPR: number
}

interface ForgeContextType {
  forgeSDK: ForgeSDK | null
  isConnected: boolean
  protocolStats: ProtocolStats | null
  loading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
}

const ForgeContext = createContext<ForgeContextType>({
  forgeSDK: null,
  isConnected: false,
  protocolStats: null,
  loading: true,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
})

interface ForgeProviderProps {
  children: ReactNode
}

export const ForgeProvider: React.FC<ForgeProviderProps> = ({ children }) => {
  const { publicKey, connected, connect, disconnect } = useWallet()
  const [forgeSDK, setForgeSDK] = useState<ForgeSDK | null>(null)
  const [protocolStats, setProtocolStats] = useState<ProtocolStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemoConnected, setIsDemoConnected] = useState(false)

  // Mock SDK that always works
  const mockSDK: ForgeSDK = {
    getProtocolStats: async () => ({
      totalCrucibles: 10,
      totalTVL: 1_000_000,
      totalUsers: 500,
      averageAPR: 0.08,
    }),
    isProtocolActive: async () => true,
  }

  useEffect(() => {
    console.log('🔥 ForgeContext: Starting initialization...')
    
    // Set all state immediately
    setLoading(false)
    setError(null)
    setForgeSDK(mockSDK)
    setProtocolStats({
      totalCrucibles: 10,
      totalTVL: 1_000_000,
      totalUsers: 500,
      averageAPR: 0.08,
    })
    
    console.log('🔥 ForgeContext: Initialization complete!')
  }, [])

  // Separate effect to handle wallet connection state changes
  useEffect(() => {
    console.log('Wallet state changed - connected:', connected, 'publicKey:', publicKey?.toString())
  }, [connected, publicKey])

  const connectWallet = async () => {
    try {
      console.log('🔥 Attempting to connect Fogo testnet wallet...')
      console.log('Connect function available:', !!connect)
      console.log('Connected status:', connected)
      
      // Try real wallet connection first
      if (connect) {
        try {
          console.log('Attempting real wallet connect...')
          await connect()
          console.log('✅ Real wallet connected to Fogo testnet!')
          return
        } catch (err) {
          console.log('Real wallet failed, trying Fogo demo mode:', err)
        }
      }
      
      // Fallback to Fogo demo mode
      console.log('🔥 Using Fogo testnet demo mode for wallet connection...')
      setIsDemoConnected(true)
      console.log('✅ Fogo testnet demo wallet connected!')
      
    } catch (err) {
      console.error('Failed to connect Fogo testnet wallet:', err)
      // Fallback to demo mode
      setIsDemoConnected(true)
      console.log('🔥 Fell back to Fogo demo mode due to error')
    }
  }

  const disconnectWallet = async () => {
    try {
      console.log('🔥 Attempting to disconnect Fogo testnet wallet...')
      
      // Always disconnect demo mode first
      setIsDemoConnected(false)
      console.log('✅ Fogo testnet demo wallet disconnected!')
      
      // Try real wallet disconnect as well
      if (disconnect) {
        try {
          await disconnect()
          console.log('✅ Real wallet disconnected from Fogo testnet!')
        } catch (err) {
          console.log('Real wallet disconnect failed, but Fogo demo mode disconnected:', err)
        }
      }
    } catch (err) {
      console.error('Failed to disconnect Fogo testnet wallet:', err)
      // Ensure demo mode is disconnected
      setIsDemoConnected(false)
    }
  }

  // Debug logging
  console.log('ForgeContext - connected:', connected)
  console.log('ForgeContext - publicKey:', publicKey?.toString())
  console.log('ForgeContext - protocolStats:', protocolStats)
  console.log('ForgeContext - loading:', loading)
  console.log('ForgeContext - isDemoConnected:', isDemoConnected)
  console.log('ForgeContext - connect function:', !!connect)
  console.log('ForgeContext - disconnect function:', !!disconnect)

  const value: ForgeContextType = {
    forgeSDK,
    isConnected: isDemoConnected || connected,
    protocolStats,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  }

  return (
    <ForgeContext.Provider value={value}>
      {children}
    </ForgeContext.Provider>
  )
}

export const useForge = () => {
  const context = useContext(ForgeContext)
  if (!context) {
    throw new Error('useForge must be used within a ForgeProvider')
  }
  return context
}
