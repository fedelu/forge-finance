Summary
-------
This document describes Forge as a single, unified product. Crucibles (cTokens), Lending markets, and LVF operate as features of one system, sharing branding, treasury PDAs, and a common indexing/analytics layer.

Components (unified)
--------------------
- Savings (Crucibles/cTokens): wrap base assets into cTokens; exchange_rate grows with fees/yield.
- Lending (per pair markets): supply/withdraw with interest accrual; borrow against collateral.
- LVF (leveraged exposure): uses cTokens + borrowed asset to synthesize leveraged volatility exposure; health and liquidation managed consistently.
- Shared Treasury & Fees: protocol fees route to a single treasury PDA; yield flows to cToken exchange_rate per policy.

Key Formulas
------------
- RATE_SCALE = 1e9 fixed point across modules.
- Utilization u = total_borrowed / total_supply (scaled by RATE_SCALE).
- Piecewise rate: if u ≤ kink: base + u * slope1 else: base + slope1*kink + (u-kink)*slope2.
- Index accrual: index_t = index_{t-1} * (1 + rate_per_sec * Δt).
- LVF max borrowable = collateral_value * collateral_factor.

State
-----
- Market: authority, base_mint, vault, receipt_mint, totals, index, interest model, liquidation_threshold_bps, paused.
- LvfConfig: admin, max_leverage_bps, liquidation thresholds/bounty, paused.
- LvfPosition: owner, crucible, c_token_mint, pair_market, lp_pool(optional), shares, borrowed, entry_exchange_rate, leverage.

Security & Admin
----------------
- PDAs own vaults, mints, and treasury across all features (single authority tree).
- Admin-only with has_one authority; pause disables opening/borrowing but allows withdrawals.
- Hooks for multisig/timelock integration (same multisig references for all features).

Fee Flow (unified)
------------------
- Lending interest accrues to suppliers via index increase (receipt token redemption value).
- Crucible fees: 80% to cToken exchange_rate; 20% to the shared treasury PDA.
- LVF fees (where applicable) route via the same distributor hooks to the shared treasury/Yield.

Events
------
- Supply, Withdraw, Borrow, Repay, OpenLVF, CloseLVF, Liquidate for off-chain indexing (single indexer writes a unified metrics JSON used by the app).

Unified UX
----------
- Single navigation with sections: Savings, Lending, LVF, Portfolio, Analytics.
- Wallet flows and toasts are consistent across features; values shown in both cToken exchange_rate and USD.
- Tooltips and risk copy are standardized (liquidation, utilization, interest compounding).


