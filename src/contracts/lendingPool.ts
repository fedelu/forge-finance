/**
 * Mock Lending Pool for USDC borrowing
 * In production, this would interact with an on-chain lending protocol
 */

interface LendingPoolState {
  totalLiquidity: number
  borrowed: number
  interestRate: number // APY as decimal (0.10 = 10%)
}

class LendingPool {
  private state: LendingPoolState = {
    totalLiquidity: 1000000, // Mock: 1M USDC available
    borrowed: 0,
    interestRate: 0.05, // 5% APY
  }

  /**
   * Borrow USDC from the pool
   * @param amount Amount to borrow in USDC
   * @returns Borrow result with amount and rate
   */
  borrow(amount: number): { borrowed: number; rate: number; success: boolean; error?: string } {
    if (amount <= 0) {
      return { borrowed: 0, rate: this.state.interestRate, success: false, error: 'Amount must be greater than 0' }
    }

    if (amount > this.state.totalLiquidity) {
      return {
        borrowed: 0,
        rate: this.state.interestRate,
        success: false,
        error: `Insufficient liquidity. Available: ${this.state.totalLiquidity.toFixed(2)} USDC`,
      }
    }

    this.state.borrowed += amount
    this.state.totalLiquidity -= amount

    return {
      borrowed: amount,
      rate: this.state.interestRate,
      success: true,
    }
  }

  /**
   * Repay borrowed USDC to the pool
   * @param amount Amount to repay in USDC
   */
  repay(amount: number): { success: boolean; error?: string } {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0' }
    }

    if (amount > this.state.borrowed) {
      return {
        success: false,
        error: `Cannot repay more than borrowed. Borrowed: ${this.state.borrowed.toFixed(2)} USDC`,
      }
    }

    this.state.borrowed -= amount
    this.state.totalLiquidity += amount

    return { success: true }
  }

  /**
   * Get current pool state
   */
  getState(): LendingPoolState {
    return { ...this.state }
  }

  /**
   * Get available liquidity
   */
  getAvailableLiquidity(): number {
    return this.state.totalLiquidity
  }

  /**
   * Calculate borrow interest (annual)
   */
  getBorrowRate(): number {
    return this.state.interestRate
  }

  /**
   * Reset pool state (for testing)
   */
  reset(): void {
    this.state = {
      totalLiquidity: 1000000,
      borrowed: 0,
      interestRate: 0.10,
    }
  }
}

// Export singleton instance
export const lendingPool = new LendingPool()

// Export type for TypeScript
export type { LendingPoolState }

