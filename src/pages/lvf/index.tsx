// Summary: LVF dashboard listing positions and CTA to open new positions.
import React from 'react'
import { useLVF } from '../../hooks/useLVF'

export default function LVFPage() {
  const { positions } = useLVF()
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Leveraged Volatility Farming</h1>
        <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded">Open Position</button>
      </div>
      <div className="space-y-3">
        {positions.length === 0 && (
          <div className="text-gray-400">No positions yet.</div>
        )}
        {positions.map((p) => (
          <div key={p.positionPubkey} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-white">{p.leverageX.toFixed(2)}x</div>
              <div className="text-gray-400 text-sm">Health: {(p.healthBps/100).toFixed(2)}%</div>
            </div>
            <div className="text-sm text-gray-400">LTV: {(p.ltvBps/100).toFixed(2)}%</div>
            <div className="text-sm text-gray-400">Borrowed: {p.borrowed}</div>
            <div className="text-sm text-gray-400">Collateral: {p.collateral}</div>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded">Increase</button>
              <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded">Decrease</button>
              <button className="px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded">Close</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


