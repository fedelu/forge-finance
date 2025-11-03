// Summary: Lending markets overview page using existing styling patterns.
import React from 'react'
import { useLending } from '../../hooks/useLending'

export default function LendingPage() {
  const { markets } = useLending()
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-white mb-6">Lending Markets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {markets.map((m) => (
          <div key={m.marketPubkey} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-medium">{m.baseMint}</div>
              <div className="text-gray-400 text-sm">TVL: {m.tvl}</div>
            </div>
            <div className="text-sm text-gray-400">Utilization: {(m.utilizationBps/100).toFixed(2)}%</div>
            <div className="text-sm text-gray-400">Supply APY: {(m.supplyApyBps/100).toFixed(2)}%</div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded">Supply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


