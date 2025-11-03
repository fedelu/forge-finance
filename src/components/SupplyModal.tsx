// Summary: Modal for supply flow (UI-only placeholder).
import React, { useState } from 'react'

export function SupplyModal(props: { open: boolean; onClose: () => void; onConfirm: (amount: string) => void }) {
  const [amount, setAmount] = useState('')
  if (!props.open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 w-full max-w-md">
        <div className="text-white font-medium mb-3">Supply</div>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" className="w-full bg-gray-800 text-white rounded p-2 mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={props.onClose} className="px-3 py-2 bg-gray-800 text-white rounded">Cancel</button>
          <button onClick={() => props.onConfirm(amount)} className="px-3 py-2 bg-orange-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  )
}


