use anchor_lang::prelude::*;

#[account]
pub struct LvfConfig {
    pub authority: Pubkey,
    pub max_leverage_bps: u64,
    pub liquidation_threshold_bps: u64,
    pub liquidation_bounty_bps: u64,
    pub paused: bool,
    pub bump: u8,
}

impl LvfConfig {
    pub const SIZE: usize = 8 + 32 + 8 * 3 + 1 + 1;
}

#[account]
pub struct LvfPosition {
    pub owner: Pubkey,
    pub crucible: Pubkey,
    pub p_token_mint: Pubkey,
    pub pair_market: Pubkey,
    pub lp_pool: Pubkey,
    pub position_shares: u128,
    pub borrowed_amount: u128,
    pub entry_exchange_rate: u128,
    pub leverage_bps: u64,
    pub bump: u8,
}

impl LvfPosition {
    pub const SIZE: usize = 8 + 32*5 + 16*3 + 8 + 1;
}


