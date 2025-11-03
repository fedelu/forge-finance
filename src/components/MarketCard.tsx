// Summary: Reusable card for a lending market row.
import React from 'react'

export function MarketCard(props: {
  base: string
  tvl: string
  utilizationBps: number
  supplyApyBps: number
  borrowApyBps: number
  onSupply?: () => void
}) {
  return (
    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <div className="text-white font-medium">{props.base}</div>
        <div className="text-gray-400 text-sm">TVL: {props.tvl}</div>
      </div>
      <div className="text-sm text-gray-400">Utilization: {(props.utilizationBps/100).toFixed(2)}%</div>
      <div className="text-sm text-gray-400">Supply APY: {(props.supplyApyBps/100).toFixed(2)}%</div>
      <div className="flex gap-2">
        <button onClick={props.onSupply} className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded">Supply</button>
      </div>
    </div>
  )
}


