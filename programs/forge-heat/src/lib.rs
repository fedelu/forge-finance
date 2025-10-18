use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo};

declare_id!("Bg3eqdWPYdjYGzVSuFFLcYBYfcY1KJgHSPaHs8qfxmb7");

#[program]
pub mod forge_heat {
    use super::*;

    /// Initialize the heat reward system for a crucible
    pub fn initialize_heat_system(
        ctx: Context<InitializeHeatSystem>,
        params: HeatParams,
    ) -> Result<()> {
        let heat_system = &mut ctx.accounts.heat_system;
        let clock = Clock::get()?;

        heat_system.crucible = ctx.accounts.crucible.key();
        heat_system.heat_mint = ctx.accounts.heat_mint.key();
        heat_system.heat_vault = ctx.accounts.heat_vault.key();
        heat_system.authority = ctx.accounts.authority.key();
        heat_system.emission_rate = params.emission_rate; // tokens per second
        heat_system.total_emitted = 0;
        heat_system.total_claimed = 0;
        heat_system.is_active = true;
        heat_system.last_emission_time = clock.unix_timestamp;
        heat_system.created_at = clock.unix_timestamp;
        heat_system.bump = ctx.bumps.heat_system;

        msg!("Heat system initialized with emission rate: {} per second", params.emission_rate);
        Ok(())
    }

    /// Calculate and update pending rewards for a user
    pub fn update_pending_rewards(
        ctx: Context<UpdatePendingRewards>,
    ) -> Result<()> {
        let heat_system = &ctx.accounts.heat_system;
        let user_rewards = &mut ctx.accounts.user_rewards;
        let clock = Clock::get()?;

        require!(heat_system.is_active, HeatError::HeatSystemInactive);

        // Calculate time elapsed since last update
        let time_elapsed = clock.unix_timestamp - user_rewards.last_update_time;
        
        if time_elapsed > 0 {
            // Calculate rewards based on user's spark balance and time
            let spark_balance = ctx.accounts.user_spark_account.amount;
            let rewards_earned = (spark_balance as u128)
                .checked_mul(heat_system.emission_rate as u128)
                .unwrap()
                .checked_mul(time_elapsed as u128)
                .unwrap()
                .checked_div(1000000000) // Convert to token units
                .unwrap() as u64;

            // Update user rewards
            user_rewards.pending_rewards += rewards_earned;
            user_rewards.last_update_time = clock.unix_timestamp;
            user_rewards.total_earned += rewards_earned;

            msg!("Updated pending rewards: {} heat tokens", rewards_earned);
        }

        Ok(())
    }

    /// Claim accumulated heat rewards
    pub fn claim_rewards(
        ctx: Context<ClaimRewards>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, HeatError::InvalidAmount);
        require!(ctx.accounts.heat_system.is_active, HeatError::HeatSystemInactive);

        let heat_system = &mut ctx.accounts.heat_system;
        let user_rewards = &mut ctx.accounts.user_rewards;

        // Update pending rewards first
        let clock = Clock::get()?;
        let time_elapsed = clock.unix_timestamp - user_rewards.last_update_time;
        
        if time_elapsed > 0 {
            let spark_balance = ctx.accounts.user_spark_account.amount;
            let rewards_earned = (spark_balance as u128)
                .checked_mul(heat_system.emission_rate as u128)
                .unwrap()
                .checked_mul(time_elapsed as u128)
                .unwrap()
                .checked_div(1000000000)
                .unwrap() as u64;

            user_rewards.pending_rewards += rewards_earned;
            user_rewards.last_update_time = clock.unix_timestamp;
            user_rewards.total_earned += rewards_earned;
        }

        // Check if user has enough pending rewards
        require!(
            amount <= user_rewards.pending_rewards,
            HeatError::InsufficientRewards
        );

        // Transfer heat tokens to user
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.heat_vault.to_account_info(),
            to: ctx.accounts.user_heat_account.to_account_info(),
            authority: heat_system.to_account_info(),
        };

        let seeds = &[
            b"heat_system",
            ctx.accounts.crucible.key().as_ref(),
            &[heat_system.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_cpi_accounts,
                signer,
            ),
            amount,
        )?;

        // Update state
        user_rewards.pending_rewards -= amount;
        user_rewards.total_claimed += amount;
        heat_system.total_claimed += amount;

        msg!("User claimed {} heat tokens", amount);
        Ok(())
    }

    /// Fund the heat vault with reward tokens
    pub fn fund_heat_vault(
        ctx: Context<FundHeatVault>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, HeatError::InvalidAmount);

        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.funder_account.to_account_info(),
            to: ctx.accounts.heat_vault.to_account_info(),
            authority: ctx.accounts.funder.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_cpi_accounts),
            amount,
        )?;

        msg!("Funded heat vault with {} tokens", amount);
        Ok(())
    }

    /// Update emission rate (only authority)
    pub fn update_emission_rate(
        ctx: Context<UpdateEmissionRate>,
        new_rate: u64,
    ) -> Result<()> {
        let heat_system = &mut ctx.accounts.heat_system;
        heat_system.emission_rate = new_rate;

        msg!("Emission rate updated to: {} per second", new_rate);
        Ok(())
    }

    /// Pause/Resume heat system (only authority)
    pub fn set_heat_system_status(
        ctx: Context<SetHeatSystemStatus>,
        is_active: bool,
    ) -> Result<()> {
        let heat_system = &mut ctx.accounts.heat_system;
        heat_system.is_active = is_active;

        msg!("Heat system status set to: {}", is_active);
        Ok(())
    }

    /// Get current APR for a crucible
    pub fn get_current_apr(
        ctx: Context<GetCurrentApr>,
    ) -> Result<u64> {
        let heat_system = &ctx.accounts.heat_system;
        let crucible = &ctx.accounts.crucible;

        // Calculate APR based on emission rate and total deposited
        let total_deposited = crucible.total_deposited;
        if total_deposited == 0 {
            return Ok(0);
        }

        let annual_emission = heat_system.emission_rate
            .checked_mul(365 * 24 * 60 * 60) // seconds in a year
            .unwrap();

        let apr = (annual_emission as u128)
            .checked_mul(10000) // Convert to basis points
            .unwrap()
            .checked_div(total_deposited as u128)
            .unwrap() as u64;

        msg!("Current APR: {} basis points", apr);
        Ok(apr)
    }
}

#[derive(Accounts)]
pub struct InitializeHeatSystem<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32*3 + 8*3 + 1 + 8 + 1,
        seeds = [b"heat_system", crucible.key().as_ref()],
        bump
    )]
    pub heat_system: Account<'info, HeatSystem>,
    /// CHECK: Crucible account
    pub crucible: UncheckedAccount<'info>,
    /// CHECK: Heat mint account
    pub heat_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub heat_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePendingRewards<'info> {
    #[account(mut)]
    pub heat_system: Account<'info, HeatSystem>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32*2 + 8*3 + 1,
        seeds = [b"user_rewards", heat_system.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_rewards: Account<'info, UserRewards>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub user_spark_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub heat_system: Account<'info, HeatSystem>,
    #[account(
        mut,
        has_one = user,
        has_one = heat_system
    )]
    pub user_rewards: Account<'info, UserRewards>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_heat_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub heat_vault: Account<'info, TokenAccount>,
    pub user_spark_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct FundHeatVault<'info> {
    #[account(mut)]
    pub heat_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub funder_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub funder: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateEmissionRate<'info> {
    #[account(mut, has_one = authority)]
    pub heat_system: Account<'info, HeatSystem>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetHeatSystemStatus<'info> {
    #[account(mut, has_one = authority)]
    pub heat_system: Account<'info, HeatSystem>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetCurrentApr<'info> {
    pub heat_system: Account<'info, HeatSystem>,
    /// CHECK: Crucible account
    pub crucible: UncheckedAccount<'info>,
}

#[account]
pub struct HeatSystem {
    pub crucible: Pubkey,
    pub heat_mint: Pubkey,
    pub heat_vault: Pubkey,
    pub authority: Pubkey,
    pub emission_rate: u64, // tokens per second
    pub total_emitted: u64,
    pub total_claimed: u64,
    pub is_active: bool,
    pub last_emission_time: i64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct UserRewards {
    pub user: Pubkey,
    pub heat_system: Pubkey,
    pub pending_rewards: u64,
    pub total_earned: u64,
    pub total_claimed: u64,
    pub last_update_time: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct HeatParams {
    pub emission_rate: u64,
}

#[error_code]
pub enum HeatError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Heat system is not active")]
    HeatSystemInactive,
    #[msg("Insufficient rewards")]
    InsufficientRewards,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid emission rate")]
    InvalidEmissionRate,
}
