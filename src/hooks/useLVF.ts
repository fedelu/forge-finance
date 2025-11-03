// Summary: Hook to read LVF positions and expose open/close placeholders.
import { useEffect, useMemo, useState, useCallback } from 'react'

export interface LvfPositionUI {
  positionPubkey: string
  leverageX: number
  ltvBps: number
  healthBps: number
  borrowed: string
  collateral: string
}

export function useLVF() {
  const [positions, setPositions] = useState<LvfPositionUI[]>([])

  useEffect(() => {
    setPositions([])
  }, [])

  const openPosition = useCallback(async (_params: { leverageX: number }) => {
    return { tx: 'placeholder' }
  }, [])

  const closePosition = useCallback(async (_position: string) => {
    return { tx: 'placeholder' }
  }, [])

  return useMemo(() => ({ positions, openPosition, closePosition }), [positions, openPosition, closePosition])
}


