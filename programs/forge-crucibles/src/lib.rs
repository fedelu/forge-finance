use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo, Burn};

declare_id!("Ab84n2rkgEnDnQmJKfMsr88jbJqYPcgBW7irwoYWwCL2");

pub mod instructions;

use instructions::*;

#[program]
pub mod forge_crucibles {
    use super::*;

    /// Initialize a new crucible (vault) for a specific token
    pub fn initialize_crucible(
        ctx: Context<InitializeCrucible>,
        params: CrucibleParams,
    ) -> Result<()> {
        let crucible = &mut ctx.accounts.crucible;
        let clock = Clock::get()?;

        crucible.engineer = ctx.accounts.engineer.key();
        crucible.base_mint = ctx.accounts.base_mint.key();
        crucible.heat_mint = ctx.accounts.heat_mint.key();
        crucible.spark_mint = ctx.accounts.spark_mint.key();
        crucible.base_vault = ctx.accounts.base_vault.key();
        crucible.heat_vault = ctx.accounts.heat_vault.key();
        crucible.heat_rate = params.heat_rate;
        crucible.protocol_fee_rate = params.protocol_fee_rate;
        crucible.total_deposited = 0;
        crucible.total_sparks_minted = 0;
        crucible.min_deposit_duration = params.min_deposit_duration;
        crucible.max_deposit_amount = params.max_deposit_amount;
        crucible.created_at = clock.unix_timestamp;
        crucible.is_active = true;
        crucible.bump = ctx.bumps.crucible;

        msg!("Crucible initialized with heat rate: {} bps", params.heat_rate);
        Ok(())
    }

    /// Deposit tokens into the crucible and receive Sparks
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, CrucibleError::InvalidAmount);
        require!(ctx.accounts.crucible.is_active, CrucibleError::CrucibleInactive);

        let crucible = &mut ctx.accounts.crucible;
        let user_position = &mut ctx.accounts.user_position;
        let clock = Clock::get()?;

        // Check max deposit limit
        if crucible.max_deposit_amount > 0 {
            require!(
                crucible.total_deposited + amount <= crucible.max_deposit_amount,
                CrucibleError::MaxDepositExceeded
            );
        }

        // Initialize user position if first deposit
        if user_position.deposited_amount == 0 {
            user_position.owner = ctx.accounts.user.key();
            user_position.crucible = crucible.key();
            user_position.deposited_at = clock.unix_timestamp;
            user_position.last_heat_claim = clock.unix_timestamp;
            user_position.pending_heat = 0;
            user_position.bump = ctx.bumps.user_position;
        }

        // Transfer tokens from user to crucible vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_base_account.to_account_info(),
            to: ctx.accounts.base_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            amount,
        )?;

        // Calculate Sparks to mint (1:1 ratio initially)
        let sparks_to_mint = amount;

        // Mint Sparks to user
        let mint_cpi_accounts = MintTo {
            mint: ctx.accounts.spark_mint.to_account_info(),
            to: ctx.accounts.user_spark_account.to_account_info(),
            authority: crucible.to_account_info(),
        };
        let seeds = &[
            b"crucible",
            ctx.accounts.base_mint.key().as_ref(),
            &[crucible.bump],
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

        // Update state
        user_position.deposited_amount += amount;
        user_position.spark_balance += sparks_to_mint;
        crucible.total_deposited += amount;
        crucible.total_sparks_minted += sparks_to_mint;

        msg!("User deposited {} tokens, received {} Sparks", amount, sparks_to_mint);
        Ok(())
    }

    /// Withdraw tokens from the crucible by burning Sparks
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, CrucibleError::InvalidAmount);
        require!(ctx.accounts.crucible.is_active, CrucibleError::CrucibleInactive);

        let crucible = &mut ctx.accounts.crucible;
        let user_position = &mut ctx.accounts.user_position;
        let clock = Clock::get()?;

        // Check minimum deposit duration
        let deposit_duration = clock.unix_timestamp - user_position.deposited_at;
        require!(
            deposit_duration >= crucible.min_deposit_duration,
            CrucibleError::MinDepositDurationNotMet
        );

        // Check user has enough deposited amount
        require!(
            amount <= user_position.deposited_amount,
            CrucibleError::InsufficientDeposit
        );

        // Check user has enough Sparks
        require!(
            amount <= user_position.spark_balance,
            CrucibleError::InsufficientSparks
        );

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

        // Transfer tokens from crucible vault to user
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.base_vault.to_account_info(),
            to: ctx.accounts.user_base_account.to_account_info(),
            authority: crucible.to_account_info(),
        };
        let seeds = &[
            b"crucible",
            ctx.accounts.base_mint.key().as_ref(),
            &[crucible.bump],
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
        user_position.deposited_amount -= amount;
        user_position.spark_balance -= amount;
        crucible.total_deposited -= amount;
        crucible.total_sparks_minted -= amount;

        msg!("User withdrew {} tokens, burned {} Sparks", amount, amount);
        Ok(())
    }

    /// Claim accumulated heat rewards
    pub fn claim_heat(ctx: Context<ClaimHeat>) -> Result<()> {
        let crucible = &mut ctx.accounts.crucible;
        let user_position = &mut ctx.accounts.user_position;
        let clock = Clock::get()?;

        require!(crucible.is_active, CrucibleError::CrucibleInactive);

        // Calculate pending heat based on time and deposited amount
        let time_elapsed = clock.unix_timestamp - user_position.last_heat_claim;
        let heat_earned = (user_position.deposited_amount as u128)
            .checked_mul(crucible.heat_rate as u128)
            .unwrap()
            .checked_mul(time_elapsed as u128)
            .unwrap()
            .checked_div(10000) // Convert basis points to percentage
            .unwrap() as u64;

        let total_heat = user_position.pending_heat + heat_earned;

        if total_heat > 0 {
            // Transfer heat tokens to user
            let transfer_cpi_accounts = Transfer {
                from: ctx.accounts.heat_vault.to_account_info(),
                to: ctx.accounts.user_heat_account.to_account_info(),
                authority: crucible.to_account_info(),
            };
            let seeds = &[
                b"crucible",
                ctx.accounts.base_mint.key().as_ref(),
                &[crucible.bump],
            ];
            let signer = &[&seeds[..]];

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    transfer_cpi_accounts,
                    signer,
                ),
                total_heat,
            )?;

            // Update user position
            user_position.pending_heat = 0;
            user_position.last_heat_claim = clock.unix_timestamp;
        }

        msg!("User claimed {} heat tokens", total_heat);
        Ok(())
    }

    /// Update crucible parameters (only engineer)
    pub fn update_crucible_params(
        ctx: Context<UpdateCrucibleParams>,
        new_params: CrucibleParams,
    ) -> Result<()> {
        let crucible = &mut ctx.accounts.crucible;

        crucible.heat_rate = new_params.heat_rate;
        crucible.protocol_fee_rate = new_params.protocol_fee_rate;
        crucible.min_deposit_duration = new_params.min_deposit_duration;
        crucible.max_deposit_amount = new_params.max_deposit_amount;

        msg!("Crucible parameters updated");
        Ok(())
    }

    /// Pause/Resume crucible (only engineer)
    pub fn set_crucible_status(
        ctx: Context<SetCrucibleStatus>,
        is_active: bool,
    ) -> Result<()> {
        let crucible = &mut ctx.accounts.crucible;
        crucible.is_active = is_active;

        msg!("Crucible status set to: {}", is_active);
        Ok(())
    }
}

#[account]
pub struct Crucible {
    pub engineer: Pubkey,
    pub base_mint: Pubkey,
    pub heat_mint: Pubkey,
    pub spark_mint: Pubkey,
    pub base_vault: Pubkey,
    pub heat_vault: Pubkey,
    pub heat_rate: u64, // basis points
    pub protocol_fee_rate: u64, // basis points
    pub total_deposited: u64,
    pub total_sparks_minted: u64,
    pub min_deposit_duration: i64, // seconds
    pub max_deposit_amount: u64, // 0 = no limit
    pub created_at: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct UserPosition {
    pub owner: Pubkey,
    pub crucible: Pubkey,
    pub deposited_amount: u64,
    pub spark_balance: u64,
    pub deposited_at: i64,
    pub last_heat_claim: i64,
    pub pending_heat: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CrucibleParams {
    pub heat_rate: u64,
    pub protocol_fee_rate: u64,
    pub min_deposit_duration: i64,
    pub max_deposit_amount: u64,
}

pub mod instructions {
    use super::*;

    #[derive(Accounts)]
    pub struct InitializeCrucible<'info> {
        #[account(
            init,
            payer = engineer,
            space = 8 + 32*6 + 8*6 + 1 + 8 + 1,
            seeds = [b"crucible", base_mint.key().as_ref()],
            bump
        )]
        pub crucible: Account<'info, Crucible>,
        #[account(mut)]
        pub engineer: Signer<'info>,
        pub base_mint: Account<'info, Mint>,
        pub heat_mint: Account<'info, Mint>,
        #[account(
            init,
            payer = engineer,
            mint::decimals = 9,
            mint::authority = crucible
        )]
        pub spark_mint: Account<'info, Mint>,
        #[account(
            init,
            payer = engineer,
            token::mint = base_mint,
            token::authority = crucible
        )]
        pub base_vault: Account<'info, TokenAccount>,
        #[account(
            init,
            payer = engineer,
            token::mint = heat_mint,
            token::authority = crucible
        )]
        pub heat_vault: Account<'info, TokenAccount>,
        pub token_program: Program<'info, Token>,
        pub system_program: Program<'info, System>,
        pub rent: Sysvar<'info, Rent>,
    }

    #[derive(Accounts)]
    pub struct Deposit<'info> {
        #[account(mut)]
        pub crucible: Account<'info, Crucible>,
        #[account(
            init_if_needed,
            payer = user,
            space = 8 + 32*2 + 8*5 + 1,
            seeds = [b"user-position", crucible.key().as_ref(), user.key().as_ref()],
            bump
        )]
        pub user_position: Account<'info, UserPosition>,
        #[account(mut)]
        pub user: Signer<'info>,
        #[account(mut)]
        pub user_base_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub user_spark_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub base_vault: Account<'info, TokenAccount>,
        #[account(mut)]
        pub spark_mint: Account<'info, Mint>,
        pub token_program: Program<'info, Token>,
        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    pub struct Withdraw<'info> {
        #[account(mut)]
        pub crucible: Account<'info, Crucible>,
        #[account(
            mut,
            has_one = owner,
            has_one = crucible
        )]
        pub user_position: Account<'info, UserPosition>,
        #[account(mut)]
        pub user: Signer<'info>,
        #[account(mut)]
        pub user_base_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub user_spark_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub base_vault: Account<'info, TokenAccount>,
        #[account(mut)]
        pub spark_mint: Account<'info, Mint>,
        pub token_program: Program<'info, Token>,
    }

    #[derive(Accounts)]
    pub struct ClaimHeat<'info> {
        #[account(mut)]
        pub crucible: Account<'info, Crucible>,
        #[account(
            mut,
            has_one = owner,
            has_one = crucible
        )]
        pub user_position: Account<'info, UserPosition>,
        #[account(mut)]
        pub user: Signer<'info>,
        #[account(mut)]
        pub user_heat_account: Account<'info, TokenAccount>,
        #[account(mut)]
        pub heat_vault: Account<'info, TokenAccount>,
        pub token_program: Program<'info, Token>,
    }

    #[derive(Accounts)]
    pub struct UpdateCrucibleParams<'info> {
        #[account(
            mut,
            has_one = engineer
        )]
        pub crucible: Account<'info, Crucible>,
        pub engineer: Signer<'info>,
    }

    #[derive(Accounts)]
    pub struct SetCrucibleStatus<'info> {
        #[account(
            mut,
            has_one = engineer
        )]
        pub crucible: Account<'info, Crucible>,
        pub engineer: Signer<'info>,
    }
}

#[error_code]
pub enum CrucibleError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Crucible is not active")]
    CrucibleInactive,
    #[msg("Maximum deposit amount exceeded")]
    MaxDepositExceeded,
    #[msg("Minimum deposit duration not met")]
    MinDepositDurationNotMet,
    #[msg("Insufficient deposit amount")]
    InsufficientDeposit,
    #[msg("Insufficient Sparks balance")]
    InsufficientSparks,
    #[msg("Unauthorized access")]
    Unauthorized,
}
