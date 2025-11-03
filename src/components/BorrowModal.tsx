// Summary: Modal for borrow flow (UI-only placeholder with max borrow display).
import React, { useMemo, useState } from 'react'

export function BorrowModal(props: { open: boolean; onClose: () => void; onConfirm: (amount: string, collateral: string) => void }) {
  const [amount, setAmount] = useState('')
  const [collateral, setCollateral] = useState<'cFOGO' | 'cUSDC'>('cFOGO')
  const maxBorrow = useMemo(() => '100.00', [])
  if (!props.open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 w-full max-w-md">
        <div className="text-white font-medium mb-1">Borrow</div>
        <div className="text-xs text-gray-400 mb-3">Max Borrowable: {maxBorrow}</div>
        <div className="mb-3">
          <label className="text-gray-400 text-xs">Collateral (cToken)</label>
          <select value={collateral} onChange={(e) => setCollateral(e.target.value as any)} className="w-full bg-gray-800 text-white rounded p-2">
            <option value="cFOGO">cFOGO</option>
            <option value="cUSDC">cUSDC</option>
          </select>
        </div>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="w-full bg-gray-800 text-white rounded p-2 mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={props.onClose} className="px-3 py-2 bg-gray-800 text-white rounded">Cancel</button>
          <button onClick={() => props.onConfirm(amount, collateral)} className="px-3 py-2 bg-orange-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  )
}


