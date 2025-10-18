use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo, Burn};

declare_id!("FsWCUFEPYNv6d4b6woJqH11Vp6P6zFdSQ9HSQp9CYEYf");

#[program]
pub mod forge_sparks {
    use super::*;

    /// Initialize a new Spark token with governance capabilities
    pub fn initialize_spark(
        ctx: Context<InitializeSpark>,
        params: SparkParams,
    ) -> Result<()> {
        let spark = &mut ctx.accounts.spark;
        let clock = Clock::get()?;

        spark.authority = ctx.accounts.authority.key();
        spark.crucible = ctx.accounts.crucible.key();
        spark.mint = ctx.accounts.mint.key();
        spark.total_supply = 0;
        spark.max_supply = params.max_supply;
        spark.decimals = params.decimals;
        spark.name = params.name;
        spark.symbol = params.symbol;
        spark.uri = params.uri;
        spark.is_transferable = params.is_transferable;
        spark.is_burnable = params.is_burnable;
        spark.voting_power_multiplier = params.voting_power_multiplier;
        spark.created_at = clock.unix_timestamp;
        spark.is_active = true;
        spark.bump = ctx.bumps.spark;

        msg!("Spark token initialized: {} ({})", params.name, params.symbol);
        Ok(())
    }

    /// Transfer Sparks between accounts (if transferable)
    pub fn transfer_sparks(
        ctx: Context<TransferSparks>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, SparkError::InvalidAmount);
        require!(ctx.accounts.spark.is_active, SparkError::SparkInactive);
        require!(ctx.accounts.spark.is_transferable, SparkError::NotTransferable);

        let cpi_accounts = Transfer {
            from: ctx.accounts.from_account.to_account_info(),
            to: ctx.accounts.to_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            amount,
        )?;

        msg!("Transferred {} Sparks from {} to {}", 
             amount, 
             ctx.accounts.from_account.key(), 
             ctx.accounts.to_account.key());
        Ok(())
    }

    /// Burn Sparks (if burnable)
    pub fn burn_sparks(
        ctx: Context<BurnSparks>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, SparkError::InvalidAmount);
        require!(ctx.accounts.spark.is_active, SparkError::SparkInactive);
        require!(ctx.accounts.spark.is_burnable, SparkError::NotBurnable);

        let spark = &mut ctx.accounts.spark;

        // Burn tokens
        let burn_cpi_accounts = Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.from_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        token::burn(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_cpi_accounts),
            amount,
        )?;

        // Update total supply
        spark.total_supply = spark.total_supply.saturating_sub(amount);

        msg!("Burned {} Sparks", amount);
        Ok(())
    }

    /// Mint new Sparks (only authority)
    pub fn mint_sparks(
        ctx: Context<MintSparks>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, SparkError::InvalidAmount);
        require!(ctx.accounts.spark.is_active, SparkError::SparkInactive);

        let spark = &mut ctx.accounts.spark;

        // Check max supply limit
        require!(
            spark.total_supply + amount <= spark.max_supply,
            SparkError::MaxSupplyExceeded
        );

        // Mint tokens
        let mint_cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        token::mint_to(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_cpi_accounts),
            amount,
        )?;

        // Update total supply
        spark.total_supply += amount;

        msg!("Minted {} Sparks to {}", amount, ctx.accounts.to_account.key());
        Ok(())
    }

    /// Calculate voting power for governance
    pub fn get_voting_power(
        ctx: Context<GetVotingPower>,
        account: Pubkey,
    ) -> Result<u64> {
        let spark = &ctx.accounts.spark;
        
        // Get token account balance
        let token_account = &ctx.accounts.token_account;
        let balance = token_account.amount;

        // Calculate voting power with multiplier
        let voting_power = balance
            .checked_mul(spark.voting_power_multiplier)
            .unwrap_or(balance);

        msg!("Voting power for {}: {}", account, voting_power);
        Ok(voting_power)
    }

    /// Update Spark parameters (only authority)
    pub fn update_spark_params(
        ctx: Context<UpdateSparkParams>,
        new_params: SparkParams,
    ) -> Result<()> {
        let spark = &mut ctx.accounts.spark;

        spark.max_supply = new_params.max_supply;
        spark.is_transferable = new_params.is_transferable;
        spark.is_burnable = new_params.is_burnable;
        spark.voting_power_multiplier = new_params.voting_power_multiplier;

        msg!("Spark parameters updated");
        Ok(())
    }

    /// Pause/Resume Spark operations (only authority)
    pub fn set_spark_status(
        ctx: Context<SetSparkStatus>,
        is_active: bool,
    ) -> Result<()> {
        let spark = &mut ctx.accounts.spark;
        spark.is_active = is_active;

        msg!("Spark status set to: {}", is_active);
        Ok(())
    }

    /// Delegate voting power to another account
    pub fn delegate_voting_power(
        ctx: Context<DelegateVotingPower>,
        delegate: Pubkey,
    ) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        let clock = Clock::get()?;

        delegation.delegator = ctx.accounts.delegator.key();
        delegation.delegate = delegate;
        delegation.amount = ctx.accounts.token_account.amount;
        delegation.delegated_at = clock.unix_timestamp;
        delegation.bump = ctx.bumps.delegation;

        msg!("Delegated voting power to {}", delegate);
        Ok(())
    }

    /// Revoke voting power delegation
    pub fn revoke_voting_power(
        ctx: Context<RevokeVotingPower>,
    ) -> Result<()> {
        let delegation = &mut ctx.accounts.delegation;
        delegation.amount = 0;

        msg!("Revoked voting power delegation");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeSpark<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32*2 + 8*3 + 1 + 1 + 1 + 1 + 8 + 32 + 8 + 64 + 1,
        seeds = [b"spark", crucible.key().as_ref()],
        bump
    )]
    pub spark: Account<'info, Spark>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Crucible account this Spark belongs to
    pub crucible: UncheckedAccount<'info>,
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = spark
    )]
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct TransferSparks<'info> {
    #[account(mut)]
    pub spark: Account<'info, Spark>,
    #[account(mut)]
    pub from_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to_account: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BurnSparks<'info> {
    #[account(mut)]
    pub spark: Account<'info, Spark>,
    #[account(mut)]
    pub from_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct MintSparks<'info> {
    #[account(mut)]
    pub spark: Account<'info, Spark>,
    #[account(mut)]
    pub to_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct GetVotingPower<'info> {
    pub spark: Account<'info, Spark>,
    pub token_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct UpdateSparkParams<'info> {
    #[account(mut, has_one = authority)]
    pub spark: Account<'info, Spark>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetSparkStatus<'info> {
    #[account(mut, has_one = authority)]
    pub spark: Account<'info, Spark>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DelegateVotingPower<'info> {
    #[account(
        init_if_needed,
        payer = delegator,
        space = 8 + 32*2 + 8*2 + 1,
        seeds = [b"delegation", spark.key().as_ref(), delegator.key().as_ref()],
        bump
    )]
    pub delegation: Account<'info, VotingDelegation>,
    #[account(mut)]
    pub spark: Account<'info, Spark>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub delegator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeVotingPower<'info> {
    #[account(
        mut,
        has_one = delegator
    )]
    pub delegation: Account<'info, VotingDelegation>,
    pub delegator: Signer<'info>,
}

#[account]
pub struct Spark {
    pub authority: Pubkey,
    pub crucible: Pubkey,
    pub mint: Pubkey,
    pub total_supply: u64,
    pub max_supply: u64,
    pub decimals: u8,
    pub name: [u8; 32],
    pub symbol: [u8; 8],
    pub uri: [u8; 64],
    pub is_transferable: bool,
    pub is_burnable: bool,
    pub voting_power_multiplier: u64, // multiplier for governance voting power
    pub created_at: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct VotingDelegation {
    pub delegator: Pubkey,
    pub delegate: Pubkey,
    pub amount: u64,
    pub delegated_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SparkParams {
    pub max_supply: u64,
    pub decimals: u8,
    pub name: [u8; 32],
    pub symbol: [u8; 8],
    pub uri: [u8; 64],
    pub is_transferable: bool,
    pub is_burnable: bool,
    pub voting_power_multiplier: u64,
}

#[error_code]
pub enum SparkError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Spark is not active")]
    SparkInactive,
    #[msg("Maximum supply exceeded")]
    MaxSupplyExceeded,
    #[msg("Sparks are not transferable")]
    NotTransferable,
    #[msg("Sparks are not burnable")]
    NotBurnable,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid delegation")]
    InvalidDelegation,
}
