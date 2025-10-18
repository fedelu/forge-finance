import React, { useState, useEffect } from 'react'
import { useForge } from '../contexts/ForgeContext'
import { 
  FireIcon, 
  ChartBarIcon, 
  BanknotesIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

interface Crucible {
  id: string
  name: string
  symbol: string
  tvl: number
  apr: number
  isActive: boolean
  baseMint: string
}

export const CrucibleList: React.FC = () => {
  const { forgeSDK, isConnected } = useForge()
  const [crucibles, setCrucibles] = useState<Crucible[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCrucibles = async () => {
      if (!forgeSDK) return

      try {
        setLoading(true)
        // Mock data for now - in real implementation, this would call forgeSDK.getAllCrucibles()
        const mockCrucibles: Crucible[] = [
          {
            id: '1',
            name: 'USDC Crucible',
            symbol: 'USDC',
            tvl: 1250000,
            apr: 8.5,
            isActive: true,
            baseMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          },
          {
            id: '2',
            name: 'SOL Crucible',
            symbol: 'SOL',
            tvl: 890000,
            apr: 12.3,
            isActive: true,
            baseMint: 'So11111111111111111111111111111111111111112',
          },
          {
            id: '3',
            name: 'ETH Crucible',
            symbol: 'ETH',
            tvl: 2100000,
            apr: 6.7,
            isActive: true,
            baseMint: '2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk',
          },
        ]
        setCrucibles(mockCrucibles)
      } catch (error) {
        console.error('Failed to load crucibles:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCrucibles()
  }, [forgeSDK])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(0)
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Available Crucibles</h2>
        <button className="btn-primary flex items-center space-x-2">
          <FireIcon className="h-5 w-5" />
          <span>Create Crucible</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-600 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {crucibles.map((crucible) => (
            <div
              key={crucible.id}
              className="flex items-center justify-between p-6 bg-forge-gray rounded-lg border border-gray-700 hover:border-forge-primary transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-forge-primary rounded-full flex items-center justify-center">
                  <FireIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{crucible.name}</h3>
                  <p className="text-gray-400">{crucible.symbol}</p>
                </div>
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <p className="text-sm text-gray-400">TVL</p>
                  <p className="text-lg font-semibold text-white">
                    ${formatNumber(crucible.tvl)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">APR</p>
                  <p className="text-lg font-semibold text-forge-accent">
                    {crucible.apr}%
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    crucible.isActive 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {crucible.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
