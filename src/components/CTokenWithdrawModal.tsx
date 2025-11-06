import React, { useState, useMemo } from 'react'
import { XMarkIcon, BoltIcon } from '@heroicons/react/24/outline'
import { useCToken } from '../hooks/useCToken'
import { useCrucible } from '../hooks/useCrucible'
import { useBalance } from '../contexts/BalanceContext'
import { useLP } from '../hooks/useLP'
import { useLVFPosition } from '../hooks/useLVFPosition'
import { useSession } from './FogoSessions'

interface CTokenWithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  crucibleAddress: string
  ctokenMint: string
  baseTokenSymbol: string
  ctokenSymbol: string
  currentBalance: bigint | null
  exchangeRate: number
}

export default function CTokenWithdrawModal({
  isOpen,
  onClose,
  crucibleAddress,
  ctokenMint,
  baseTokenSymbol,
  ctokenSymbol,
  currentBalance,
  exchangeRate,
}: CTokenWithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const { withdraw, loading } = useCToken(crucibleAddress, ctokenMint)
  const { unwrapTokens, getCrucible } = useCrucible()
  const { addToBalance, subtractFromBalance } = useBalance()
  const { isEstablished, walletPublicKey } = useSession()
  
  // Check for LP and leveraged positions for this crucible
  const { positions: lpPositions, closePosition: closeLPPosition, loading: lpLoading } = useLP({
    crucibleAddress,
    baseTokenSymbol: baseTokenSymbol as 'FOGO' | 'FORGE',
    baseAPY: 0, // Not needed for closing
  })
  
  const { positions: lvfPositions, closePosition: closeLVFPosition, loading: lvfLoading } = useLVFPosition({
    crucibleAddress,
    baseTokenSymbol: baseTokenSymbol as 'FOGO' | 'FORGE',
  })
  
  // Check if user has any LP positions for this crucible
  const hasLPPositions = useMemo(() => {
    if (!isEstablished || !walletPublicKey) return false
    const hasLP = lpPositions.some(p => p.isOpen && p.owner === walletPublicKey.toBase58())
    const hasLVF = lvfPositions.some(p => p.isOpen && p.owner === walletPublicKey.toBase58())
    return hasLP || hasLVF
  }, [lpPositions, lvfPositions, isEstablished, walletPublicKey])
  
  const allPositions = useMemo(() => {
    return [
      ...lpPositions.filter(p => p.isOpen && p.owner === (walletPublicKey?.toBase58() || '')).map(p => ({ ...p, type: 'lp' as const })),
      ...lvfPositions.filter(p => p.isOpen && p.owner === (walletPublicKey?.toBase58() || '')).map(p => ({ ...p, type: 'lvf' as const })),
    ]
  }, [lpPositions, lvfPositions, walletPublicKey])
  
  const handleCloseLPPosition = async (positionId: string, positionType: 'lp' | 'lvf') => {
    try {
      if (positionType === 'lp') {
        const result = await closeLPPosition(positionId)
        if (result && result.success) {
          // Update wallet balances
          // When closing LP position: return base tokens (with APY) + USDC
          addToBalance(baseTokenSymbol, result.baseAmount) // Includes APY earnings
          addToBalance('USDC', result.usdcAmount) // Return deposited USDC
          
          // Remove LP tokens
          const crucible = getCrucible(crucibleAddress)
          const lpTokenSymbol = crucible ? `${crucible.ptokenSymbol}/USDC LP` : `${baseTokenSymbol}/USDC LP`
          const cTokenAmount = result.baseAmount * 1.045
          const lpTokenAmount = Math.sqrt(cTokenAmount * result.usdcAmount)
          subtractFromBalance(lpTokenSymbol, lpTokenAmount)
          
          // Show closing information with APY earnings
          const apyMessage = result.apyEarned ? `\nYield Earned: ${result.apyEarned.toFixed(4)} ${baseTokenSymbol}` : ''
          alert(`✅ LP Position closed!\n\nReceived: ${result.baseAmount.toFixed(2)} ${baseTokenSymbol} + ${result.usdcAmount.toFixed(2)} USDC${apyMessage}`)
        }
      } else {
        const result = await closeLVFPosition(positionId)
        if (result && result.success) {
          // Update wallet balances
          // When closing a leveraged position:
          // 1. Redeem cTOKENS → base tokens (unwrap) + APY earnings
          // 2. Repay borrowed USDC
          addToBalance(baseTokenSymbol, result.baseAmount)
          
          // Repay borrowed USDC (if any) - subtract from USDC balance
          if (result.repaidUSDC > 0) {
            subtractFromBalance('USDC', result.repaidUSDC)
          }
          
          // Remove LP tokens from wallet (if they were added when opening)
          const crucible = getCrucible(crucibleAddress)
          const lpTokenSymbol = crucible ? `${crucible.ptokenSymbol}/USDC LP` : `${baseTokenSymbol}/USDC LP`
          const baseTokenPrice = baseTokenSymbol === 'FOGO' ? 0.5 : 0.002
          const position = lvfPositions.find(p => p.id === positionId)
          if (position) {
            const collateralValue = position.collateral * baseTokenPrice
            const cTokenAmount = position.collateral * 1.045 // Exchange rate
            
            // Calculate total USDC used in the LP position
            let totalUSDC = position.borrowedUSDC
            if (position.leverageFactor === 1.5) {
              totalUSDC = collateralValue
            } else if (position.leverageFactor === 2.0) {
              totalUSDC = position.borrowedUSDC
            }
            
            const lpTokenAmount = Math.sqrt(cTokenAmount * totalUSDC)
            subtractFromBalance(lpTokenSymbol, lpTokenAmount)
          }
          
          // Show closing information with APY earnings
          const apyMessage = result.apyEarned ? `\nYield Earned: ${result.apyEarned.toFixed(4)} ${baseTokenSymbol}` : ''
          const usdcMessage = result.repaidUSDC > 0 ? `\nRepaid: ${result.repaidUSDC.toFixed(2)} USDC` : ''
          alert(`✅ Leveraged Position closed!\n\nReceived: ${result.baseAmount.toFixed(2)} ${baseTokenSymbol}${apyMessage}${usdcMessage}`)
        }
      }
      
      // Refresh portfolio
      window.dispatchEvent(new CustomEvent(positionType === 'lp' ? 'lpPositionClosed' : 'lvfPositionClosed'))
    } catch (error: any) {
      console.error('Error closing LP position:', error)
      alert(error.message || 'Failed to close LP position')
    }
  }

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return

    try {
      // Call unwrapTokens which handles the unwrapping, fee calculation, APY earnings, and updates
      const result = await unwrapTokens(crucibleAddress, amount)
      
      // Update wallet balances - add base tokens received
      // Note: unwrapTokens already updates Crucible userBalances internally,
      // so we only need to update the wallet's base token balance
      if (result && result.baseAmount) {
        addToBalance(baseTokenSymbol, result.baseAmount)
        
        // Show success message with APY earnings
        const apyMessage = result.apyEarned ? `\nAPY Earned: ${result.apyEarned.toFixed(4)} ${baseTokenSymbol}` : ''
        alert(`✅ Position closed successfully!\n\nReceived: ${result.baseAmount.toFixed(4)} ${baseTokenSymbol}${apyMessage}`)
      } else {
        // Fallback calculation if result is null
        const ctokenAmount = parseFloat(amount)
        const baseAmountBeforeFee = ctokenAmount * exchangeRate
        const feeAmount = baseAmountBeforeFee * 0.015
        const netAmount = baseAmountBeforeFee - feeAmount
        addToBalance(baseTokenSymbol, netAmount)
      }
      
      // Dispatch event to refresh portfolio
      window.dispatchEvent(new CustomEvent('wrapPositionClosed', { 
        detail: { crucibleAddress, baseTokenSymbol } 
      }))
      
      onClose()
      setAmount('')
    } catch (error) {
      console.error('Withdraw error:', error)
      alert('Withdraw failed. Please try again.')
    }
  }

  const handleMax = () => {
    if (currentBalance) {
      setAmount((Number(currentBalance) / 1e9).toString())
    }
  }
  
  // Calculate available balance (use 1e9 scale for userBalances from useCrucible)
  const availableBalance = currentBalance ? Number(currentBalance) / 1e9 : 0

  // Calculate amounts with fee
  const baseAmountBeforeFee = amount ? parseFloat(amount) * exchangeRate : 0
  const withdrawalFee = baseAmountBeforeFee * 0.015 // 1.5% fee
  const estimatedBaseAmount = amount 
    ? (baseAmountBeforeFee - withdrawalFee).toFixed(2)
    : '0.00'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-fogo-gray-900 rounded-xl border border-fogo-gray-700 shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-fogo-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Close Position</h2>
        <p className="text-fogo-gray-400 text-sm mb-6">
          Burn {ctokenSymbol} to withdraw {baseTokenSymbol}. You'll receive the current exchange rate value.
        </p>

        {/* Amount Input */}
        <div className="mb-4">
            <label className="block text-sm font-medium text-fogo-gray-300 mb-2">
              Withdraw Amount ({ctokenSymbol})
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  max={availableBalance > 0 ? availableBalance.toString() : undefined}
                  className="w-full px-4 py-3 pr-12 bg-fogo-gray-800 border border-fogo-gray-700 rounded-lg text-white placeholder-fogo-gray-500 focus:outline-none focus:ring-2 focus:ring-fogo-primary"
                />
              </div>
              <button
                onClick={handleMax}
                className="px-4 py-3 bg-fogo-gray-700 hover:bg-fogo-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                MAX
              </button>
            </div>
            {availableBalance > 0 && (
              <p className="text-xs text-fogo-gray-500 mt-1">
                Available: {availableBalance.toFixed(2)} {ctokenSymbol}
              </p>
            )}
        </div>

        {/* LP Positions Section */}
        {hasLPPositions && allPositions.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <BoltIcon className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-semibold text-orange-400">Active LP Positions</h3>
            </div>
            <div className="space-y-2">
              {allPositions.map((position) => {
                const isLeveraged = position.type === 'lvf'
                const leverage = isLeveraged ? (position as any).leverageFactor : 1
                const baseAmount = isLeveraged ? (position as any).collateral : (position as any).baseAmount
                const usdcAmount = isLeveraged ? (position as any).borrowedUSDC : (position as any).usdcAmount
                const positionId = position.id
                
                return (
                  <div key={positionId} className="bg-fogo-gray-800/50 rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">
                        {ctokenSymbol}/USDC {isLeveraged && leverage && `${leverage}x`}
                      </div>
                      <div className="text-xs text-fogo-gray-400 mt-1">
                        {baseAmount?.toFixed(2) || '0.00'} {baseTokenSymbol} + {usdcAmount?.toFixed(2) || '0.00'} USDC
                      </div>
                    </div>
                    <button
                      onClick={() => handleCloseLPPosition(positionId, position.type)}
                      disabled={lpLoading || lvfLoading}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
                    >
                      {lpLoading || lvfLoading ? 'Closing...' : 'Close'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="bg-fogo-gray-800/50 rounded-lg p-4 mb-4 border border-fogo-gray-700">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-fogo-gray-400">You'll receive</span>
              <span className="text-white font-medium">
                {estimatedBaseAmount} {baseTokenSymbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fogo-gray-400">Exchange Rate</span>
              <span className="text-white font-medium">
                1 {ctokenSymbol} = {exchangeRate.toFixed(2)} {baseTokenSymbol}
              </span>
            </div>
            <div className="flex justify-between text-xs pt-2 border-t border-fogo-gray-700">
              <span className="text-fogo-gray-500">Withdrawal Fee (1.5%)</span>
              <span className="text-red-400">
                -{withdrawalFee.toFixed(2)} {baseTokenSymbol}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-fogo-gray-500">Yield Earned</span>
              <span className="text-green-400">
                +{((exchangeRate - 1.045) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-fogo-gray-700 hover:bg-fogo-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleWithdraw}
            disabled={!amount || loading || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance}
            className="flex-1 px-4 py-3 bg-fogo-primary hover:bg-fogo-secondary text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Close Position'}
          </button>
        </div>
      </div>
    </div>
  )
}

