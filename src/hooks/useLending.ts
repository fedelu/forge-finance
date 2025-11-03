// Summary: Hook to fetch lending markets and expose simple supply/withdraw placeholders.
// Integrates later with on-chain IDLs via Anchor provider used elsewhere in app.

import { useCallback, useEffect, useMemo, useState } from 'react'

export interface MarketInfo {
  marketPubkey: string
  baseMint: string
  tvl: string
  utilizationBps: number
  supplyApyBps: number
  borrowApyBps: number
}

export interface LendingPosition {
  marketPubkey: string
  baseMint: string
  suppliedAmount: number
  interestEarned: number
  effectiveApy: number // After 1.5% fee
}

export function useLending() {
  const [markets, setMarkets] = useState<MarketInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [positions, setPositions] = useState<LendingPosition[]>([])

  useEffect(() => {
    // TODO: Replace with on-chain fetch via IDL
    setMarkets([
      { marketPubkey: 'MARKET_FOGO', baseMint: 'FOGO', tvl: '120,000', utilizationBps: 4200, supplyApyBps: 800, borrowApyBps: 1120 },
      { marketPubkey: 'MARKET_USDC', baseMint: 'USDC', tvl: '310,000', utilizationBps: 5600, supplyApyBps: 800, borrowApyBps: 1540 },
    ])
  }, [])

  const supply = useCallback(async (market: string, amount: string) => {
    const marketInfo = markets.find(m => m.marketPubkey === market)
    if (!marketInfo) throw new Error('Market not found')
    
    const suppliedAmount = parseFloat(amount)
    // Calculate effective APY after 1.5% fee on interest
    const baseApy = marketInfo.supplyApyBps / 100
    const feeOnInterest = baseApy * 0.015
    const effectiveApy = baseApy - feeOnInterest
    
    const existingPosition = positions.find(p => p.marketPubkey === market)
    if (existingPosition) {
      // Add to existing position
      setPositions(prev => prev.map(p => 
        p.marketPubkey === market
          ? { ...p, suppliedAmount: p.suppliedAmount + suppliedAmount }
          : p
      ))
    } else {
      // Create new position
      setPositions(prev => [...prev, {
        marketPubkey: market,
        baseMint: marketInfo.baseMint,
        suppliedAmount,
        interestEarned: 0,
        effectiveApy
      }])
    }
    
    return { success: true, tx: `supply_${Date.now()}` }
  }, [markets, positions])

  const withdraw = useCallback(async (_market: string, _amount: string) => {
    return { success: true, tx: `withdraw_${Date.now()}` }
  }, [])

  const value = useMemo(() => ({ markets, loading, error, supply, withdraw, positions }), [markets, loading, error, supply, withdraw, positions])
  return value
}


