use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo, Burn};

declare_id!("B4HQzxJXq2ynfSJYBC7pX7KU5ugD19QeHXLtLyqhGtwg");

#[program]
pub mod forge_smelters {
    use super::*;

    /// Initialize a smelter for a specific crucible
    pub fn initialize_smelter(
        ctx: Context<InitializeSmelter>,
        params: SmelterParams,
    ) -> Result<()> {
        let smelter = &mut ctx.accounts.smelter;
        let clock = Clock::get()?;

        smelter.crucible = ctx.accounts.crucible.key();
        smelter.spark_mint = ctx.accounts.spark_mint.key();
        smelter.base_mint = ctx.accounts.base_mint.key();
        smelter.authority = ctx.accounts.authority.key();
        smelter.mint_ratio = params.mint_ratio; // 1:1 by default
        smelter.burn_ratio = params.burn_ratio; // 1:1 by default
        smelter.is_active = true;
        smelter.total_minted = 0;
        smelter.total_burned = 0;
        smelter.created_at = clock.unix_timestamp;
        smelter.bump = ctx.bumps.smelter;

        msg!("Smelter initialized for crucible: {}", ctx.accounts.crucible.key());
        Ok(())
    }

    /// Mint Sparks by depositing base tokens
    pub fn mint_sparks(
        ctx: Context<MintSparks>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, SmelterError::InvalidAmount);
        require!(ctx.accounts.smelter.is_active, SmelterError::SmelterInactive);

        let smelter = &mut ctx.accounts.smelter;

        // Calculate Sparks to mint based on ratio
        let sparks_to_mint = (amount as u128)
            .checked_mul(smelter.mint_ratio as u128)
            .unwrap()
            .checked_div(10000) // Convert basis points to percentage
            .unwrap() as u64;

        require!(sparks_to_mint > 0, SmelterError::InvalidMintAmount);

        // Transfer base tokens from user to crucible vault
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.user_base_account.to_account_info(),
            to: ctx.accounts.crucible_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_cpi_accounts),
            amount,
        )?;

        // Mint Sparks to user
        let mint_cpi_accounts = MintTo {
            mint: ctx.accounts.spark_mint.to_account_info(),
            to: ctx.accounts.user_spark_account.to_account_info(),
            authority: smelter.to_account_info(),
        };

        let seeds = &[
            b"smelter",
            ctx.accounts.crucible.key().as_ref(),
            &[smelter.bump],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                mint_cpi_accounts,
                signer,
            ),
            sparks_to_mint,
        )?;

        // Update smelter state
        smelter.total_minted += sparks_to_mint;

        msg!("Minted {} Sparks for {} base tokens", sparks_to_mint, amount);
        Ok(())
    }

    /// Burn Sparks to withdraw base tokens
    pub fn burn_sparks(
        ctx: Context<BurnSparks>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, SmelterError::InvalidAmount);
        require!(ctx.accounts.smelter.is_active, SmelterError::SmelterInactive);

        let smelter = &mut ctx.accounts.smelter;

        // Calculate base tokens to withdraw based on ratio
        let base_to_withdraw = (amount as u128)
            .checked_mul(smelter.burn_ratio as u128)
            .unwrap()
            .checked_div(10000) // Convert basis points to percentage
            .unwrap() as u64;

        require!(base_to_withdraw > 0, SmelterError::InvalidBurnAmount);

        // Burn Sparks
        let burn_cpi_accounts = Burn {
            mint: ctx.accounts.spark_mint.to_account_info(),
            from: ctx.accounts.user_spark_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::burn(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_cpi_accounts),
            amount,
        )?;

        // Transfer base tokens from crucible vault to user
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.crucible_vault.to_account_info(),
            to: ctx.accounts.user_base_account.to_account_info(),
            authority: smelter.to_account_info(),
        };

        let seeds = &[
            b"smelter",
            ctx.accounts.crucible.key().as_ref(),
            &[smelter.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_cpi_accounts,
                signer,
            ),
            base_to_withdraw,
        )?;

        // Update smelter state
        smelter.total_burned += amount;

        msg!("Burned {} Sparks for {} base tokens", amount, base_to_withdraw);
        Ok(())
    }

    /// Update smelter parameters (only authority)
    pub fn update_smelter_params(
        ctx: Context<UpdateSmelterParams>,
        new_params: SmelterParams,
    ) -> Result<()> {
        let smelter = &mut ctx.accounts.smelter;

        smelter.mint_ratio = new_params.mint_ratio;
        smelter.burn_ratio = new_params.burn_ratio;

        msg!("Smelter parameters updated");
        Ok(())
    }

    /// Pause/Resume smelter (only authority)
    pub fn set_smelter_status(
        ctx: Context<SetSmelterStatus>,
        is_active: bool,
    ) -> Result<()> {
        let smelter = &mut ctx.accounts.smelter;
        smelter.is_active = is_active;

        msg!("Smelter status set to: {}", is_active);
        Ok(())
    }

    /// Emergency withdrawal of all base tokens (only authority)
    pub fn emergency_withdraw(
        ctx: Context<EmergencyWithdraw>,
    ) -> Result<()> {
        let smelter = &ctx.accounts.smelter;
        let vault_balance = ctx.accounts.crucible_vault.amount;

        if vault_balance > 0 {
            let transfer_cpi_accounts = Transfer {
                from: ctx.accounts.crucible_vault.to_account_info(),
                to: ctx.accounts.emergency_account.to_account_info(),
                authority: smelter.to_account_info(),
            };

            let seeds = &[
                b"smelter",
                ctx.accounts.crucible.key().as_ref(),
                &[smelter.bump],
            ];
            let signer = &[&seeds[..]];

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    transfer_cpi_accounts,
                    signer,
                ),
                vault_balance,
            )?;

            msg!("Emergency withdrawal of {} base tokens", vault_balance);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeSmelter<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32*3 + 8*3 + 1 + 8 + 1,
        seeds = [b"smelter", crucible.key().as_ref()],
        bump
    )]
    pub smelter: Account<'info, Smelter>,
    /// CHECK: Crucible account
    pub crucible: UncheckedAccount<'info>,
    /// CHECK: Spark mint account
    pub spark_mint: UncheckedAccount<'info>,
    /// CHECK: Base mint account
    pub base_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintSparks<'info> {
    #[account(mut)]
    pub smelter: Account<'info, Smelter>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_base_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_spark_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub crucible_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub spark_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnSparks<'info> {
    #[account(mut)]
    pub smelter: Account<'info, Smelter>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_base_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_spark_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub crucible_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub spark_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateSmelterParams<'info> {
    #[account(mut, has_one = authority)]
    pub smelter: Account<'info, Smelter>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetSmelterStatus<'info> {
    #[account(mut, has_one = authority)]
    pub smelter: Account<'info, Smelter>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct EmergencyWithdraw<'info> {
    #[account(has_one = authority)]
    pub smelter: Account<'info, Smelter>,
    #[account(mut)]
    pub crucible_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub emergency_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Smelter {
    pub crucible: Pubkey,
    pub spark_mint: Pubkey,
    pub base_mint: Pubkey,
    pub authority: Pubkey,
    pub mint_ratio: u64, // basis points (10000 = 100%)
    pub burn_ratio: u64, // basis points (10000 = 100%)
    pub is_active: bool,
    pub total_minted: u64,
    pub total_burned: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SmelterParams {
    pub mint_ratio: u64,
    pub burn_ratio: u64,
}

#[error_code]
pub enum SmelterError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Smelter is not active")]
    SmelterInactive,
    #[msg("Invalid mint amount")]
    InvalidMintAmount,
    #[msg("Invalid burn amount")]
    InvalidBurnAmount,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Insufficient vault balance")]
    InsufficientVaultBalance,
}
