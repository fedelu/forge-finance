use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("HurGQkPBHqc68txHvHwpxKhEpjHNR3ChNALAw9RMmsSc");

#[program]
pub mod forge_reactors {
    use super::*;

    /// Initialize a new reactor (AMM pool) for two crucible tokens
    pub fn initialize_reactor(
        ctx: Context<InitializeReactor>,
        params: ReactorParams,
    ) -> Result<()> {
        let reactor = &mut ctx.accounts.reactor;
        let clock = Clock::get()?;

        reactor.authority = ctx.accounts.authority.key();
        reactor.token_a_mint = ctx.accounts.token_a_mint.key();
        reactor.token_b_mint = ctx.accounts.token_b_mint.key();
        reactor.token_a_vault = ctx.accounts.token_a_vault.key();
        reactor.token_b_vault = ctx.accounts.token_b_vault.key();
        reactor.fee_rate = params.fee_rate; // basis points
        reactor.protocol_fee_rate = params.protocol_fee_rate; // basis points
        reactor.reserve_a = 0;
        reactor.reserve_b = 0;
        reactor.total_liquidity = 0;
        reactor.is_active = true;
        reactor.created_at = clock.unix_timestamp;
        reactor.bump = ctx.bumps.reactor;

        msg!("Reactor initialized for tokens {} and {}", 
             ctx.accounts.token_a_mint.key(), 
             ctx.accounts.token_b_mint.key());
        Ok(())
    }

    /// Add liquidity to the reactor
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
    ) -> Result<()> {
        require!(amount_a > 0 && amount_b > 0, ReactorError::InvalidAmount);
        require!(ctx.accounts.reactor.is_active, ReactorError::ReactorInactive);

        let reactor = &mut ctx.accounts.reactor;

        // Transfer tokens from user to reactor vaults
        let transfer_a_cpi_accounts = Transfer {
            from: ctx.accounts.user_token_a_account.to_account_info(),
            to: ctx.accounts.token_a_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_a_cpi_accounts),
            amount_a,
        )?;

        let transfer_b_cpi_accounts = Transfer {
            from: ctx.accounts.user_token_b_account.to_account_info(),
            to: ctx.accounts.token_b_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_b_cpi_accounts),
            amount_b,
        )?;

        // Calculate liquidity tokens to mint
        let liquidity_to_mint = if reactor.total_liquidity == 0 {
            // First liquidity provision
            (amount_a as u128)
                .checked_mul(amount_b as u128)
                .unwrap()
                .checked_div(1000000) // Initial liquidity calculation
                .unwrap() as u64
        } else {
            // Calculate based on existing reserves
            let liquidity_a = (amount_a as u128)
                .checked_mul(reactor.total_liquidity as u128)
                .unwrap()
                .checked_div(reactor.reserve_a as u128)
                .unwrap() as u64;

            let liquidity_b = (amount_b as u128)
                .checked_mul(reactor.total_liquidity as u128)
                .unwrap()
                .checked_div(reactor.reserve_b as u128)
                .unwrap() as u64;

            liquidity_a.min(liquidity_b)
        };

        // Mint liquidity tokens to user
        let mint_cpi_accounts = token::MintTo {
            mint: ctx.accounts.liquidity_mint.to_account_info(),
            to: ctx.accounts.user_liquidity_account.to_account_info(),
            authority: reactor.to_account_info(),
        };

        let seeds = &[
            b"reactor",
            ctx.accounts.token_a_mint.key().as_ref(),
            ctx.accounts.token_b_mint.key().as_ref(),
            &[reactor.bump],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                mint_cpi_accounts,
                signer,
            ),
            liquidity_to_mint,
        )?;

        // Update reactor state
        reactor.reserve_a += amount_a;
        reactor.reserve_b += amount_b;
        reactor.total_liquidity += liquidity_to_mint;

        msg!("Added liquidity: {} token A, {} token B, minted {} liquidity tokens", 
             amount_a, amount_b, liquidity_to_mint);
        Ok(())
    }

    /// Remove liquidity from the reactor
    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        liquidity_amount: u64,
    ) -> Result<()> {
        require!(liquidity_amount > 0, ReactorError::InvalidAmount);
        require!(ctx.accounts.reactor.is_active, ReactorError::ReactorInactive);

        let reactor = &mut ctx.accounts.reactor;

        // Calculate amounts to withdraw
        let amount_a = (liquidity_amount as u128)
            .checked_mul(reactor.reserve_a as u128)
            .unwrap()
            .checked_div(reactor.total_liquidity as u128)
            .unwrap() as u64;

        let amount_b = (liquidity_amount as u128)
            .checked_mul(reactor.reserve_b as u128)
            .unwrap()
            .checked_div(reactor.total_liquidity as u128)
            .unwrap() as u64;

        // Burn liquidity tokens
        let burn_cpi_accounts = token::Burn {
            mint: ctx.accounts.liquidity_mint.to_account_info(),
            from: ctx.accounts.user_liquidity_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::burn(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_cpi_accounts),
            liquidity_amount,
        )?;

        // Transfer tokens from reactor vaults to user
        let transfer_a_cpi_accounts = Transfer {
            from: ctx.accounts.token_a_vault.to_account_info(),
            to: ctx.accounts.user_token_a_account.to_account_info(),
            authority: reactor.to_account_info(),
        };

        let seeds = &[
            b"reactor",
            ctx.accounts.token_a_mint.key().as_ref(),
            ctx.accounts.token_b_mint.key().as_ref(),
            &[reactor.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_a_cpi_accounts,
                signer,
            ),
            amount_a,
        )?;

        let transfer_b_cpi_accounts = Transfer {
            from: ctx.accounts.token_b_vault.to_account_info(),
            to: ctx.accounts.user_token_b_account.to_account_info(),
            authority: reactor.to_account_info(),
        };

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_b_cpi_accounts,
                signer,
            ),
            amount_b,
        )?;

        // Update reactor state
        reactor.reserve_a -= amount_a;
        reactor.reserve_b -= amount_b;
        reactor.total_liquidity -= liquidity_amount;

        msg!("Removed liquidity: {} token A, {} token B, burned {} liquidity tokens", 
             amount_a, amount_b, liquidity_amount);
        Ok(())
    }

    /// Swap token A for token B
    pub fn swap_a_to_b(
        ctx: Context<SwapAtoB>,
        amount_in: u64,
        min_amount_out: u64,
    ) -> Result<()> {
        require!(amount_in > 0, ReactorError::InvalidAmount);
        require!(ctx.accounts.reactor.is_active, ReactorError::ReactorInactive);

        let reactor = &mut ctx.accounts.reactor;

        // Calculate output amount using constant product formula
        let amount_out = calculate_swap_output(
            amount_in,
            reactor.reserve_a,
            reactor.reserve_b,
            reactor.fee_rate,
        )?;

        require!(amount_out >= min_amount_out, ReactorError::SlippageExceeded);

        // Transfer input tokens from user to reactor
        let transfer_in_cpi_accounts = Transfer {
            from: ctx.accounts.user_token_a_account.to_account_info(),
            to: ctx.accounts.token_a_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_in_cpi_accounts),
            amount_in,
        )?;

        // Transfer output tokens from reactor to user
        let transfer_out_cpi_accounts = Transfer {
            from: ctx.accounts.token_b_vault.to_account_info(),
            to: ctx.accounts.user_token_b_account.to_account_info(),
            authority: reactor.to_account_info(),
        };

        let seeds = &[
            b"reactor",
            ctx.accounts.token_a_mint.key().as_ref(),
            ctx.accounts.token_b_mint.key().as_ref(),
            &[reactor.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_out_cpi_accounts,
                signer,
            ),
            amount_out,
        )?;

        // Update reserves
        reactor.reserve_a += amount_in;
        reactor.reserve_b -= amount_out;

        msg!("Swapped {} token A for {} token B", amount_in, amount_out);
        Ok(())
    }

    /// Swap token B for token A
    pub fn swap_b_to_a(
        ctx: Context<SwapBtoA>,
        amount_in: u64,
        min_amount_out: u64,
    ) -> Result<()> {
        require!(amount_in > 0, ReactorError::InvalidAmount);
        require!(ctx.accounts.reactor.is_active, ReactorError::ReactorInactive);

        let reactor = &mut ctx.accounts.reactor;

        // Calculate output amount using constant product formula
        let amount_out = calculate_swap_output(
            amount_in,
            reactor.reserve_b,
            reactor.reserve_a,
            reactor.fee_rate,
        )?;

        require!(amount_out >= min_amount_out, ReactorError::SlippageExceeded);

        // Transfer input tokens from user to reactor
        let transfer_in_cpi_accounts = Transfer {
            from: ctx.accounts.user_token_b_account.to_account_info(),
            to: ctx.accounts.token_b_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };

        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_in_cpi_accounts),
            amount_in,
        )?;

        // Transfer output tokens from reactor to user
        let transfer_out_cpi_accounts = Transfer {
            from: ctx.accounts.token_a_vault.to_account_info(),
            to: ctx.accounts.user_token_a_account.to_account_info(),
            authority: reactor.to_account_info(),
        };

        let seeds = &[
            b"reactor",
            ctx.accounts.token_a_mint.key().as_ref(),
            ctx.accounts.token_b_mint.key().as_ref(),
            &[reactor.bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_out_cpi_accounts,
                signer,
            ),
            amount_out,
        )?;

        // Update reserves
        reactor.reserve_b += amount_in;
        reactor.reserve_a -= amount_out;

        msg!("Swapped {} token B for {} token A", amount_in, amount_out);
        Ok(())
    }

    /// Update reactor parameters (only authority)
    pub fn update_reactor_params(
        ctx: Context<UpdateReactorParams>,
        new_params: ReactorParams,
    ) -> Result<()> {
        let reactor = &mut ctx.accounts.reactor;

        reactor.fee_rate = new_params.fee_rate;
        reactor.protocol_fee_rate = new_params.protocol_fee_rate;

        msg!("Reactor parameters updated");
        Ok(())
    }

    /// Pause/Resume reactor (only authority)
    pub fn set_reactor_status(
        ctx: Context<SetReactorStatus>,
        is_active: bool,
    ) -> Result<()> {
        let reactor = &mut ctx.accounts.reactor;
        reactor.is_active = is_active;

        msg!("Reactor status set to: {}", is_active);
        Ok(())
    }
}

/// Calculate swap output using constant product formula: x * y = k
fn calculate_swap_output(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
    fee_rate: u64,
) -> Result<u64> {
    require!(reserve_in > 0 && reserve_out > 0, ReactorError::InsufficientLiquidity);

    // Apply fee
    let amount_in_with_fee = (amount_in as u128)
        .checked_mul(10000 - fee_rate)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;

    // Calculate output using constant product formula
    let numerator = (amount_in_with_fee as u128)
        .checked_mul(reserve_out as u128)
        .unwrap();

    let denominator = (reserve_in as u128)
        .checked_add(amount_in_with_fee as u128)
        .unwrap();

    let amount_out = numerator
        .checked_div(denominator)
        .unwrap() as u64;

    Ok(amount_out)
}

#[derive(Accounts)]
pub struct InitializeReactor<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32*4 + 8*3 + 1 + 8 + 1,
        seeds = [b"reactor", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub reactor: Account<'info, Reactor>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = authority,
        token::mint = token_a_mint,
        token::authority = reactor
    )]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = authority,
        token::mint = token_b_mint,
        token::authority = reactor
    )]
    pub token_b_vault: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = reactor
    )]
    pub liquidity_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub reactor: Account<'info, Reactor>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_liquidity_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub liquidity_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    #[account(mut)]
    pub reactor: Account<'info, Reactor>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_liquidity_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub liquidity_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SwapAtoB<'info> {
    #[account(mut)]
    pub reactor: Account<'info, Reactor>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SwapBtoA<'info> {
    #[account(mut)]
    pub reactor: Account<'info, Reactor>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub user_token_a_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_b_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_a_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub token_b_vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateReactorParams<'info> {
    #[account(mut, has_one = authority)]
    pub reactor: Account<'info, Reactor>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetReactorStatus<'info> {
    #[account(mut, has_one = authority)]
    pub reactor: Account<'info, Reactor>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Reactor {
    pub authority: Pubkey,
    pub token_a_mint: Pubkey,
    pub token_b_mint: Pubkey,
    pub token_a_vault: Pubkey,
    pub token_b_vault: Pubkey,
    pub fee_rate: u64, // basis points
    pub protocol_fee_rate: u64, // basis points
    pub reserve_a: u64,
    pub reserve_b: u64,
    pub total_liquidity: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ReactorParams {
    pub fee_rate: u64,
    pub protocol_fee_rate: u64,
}

#[error_code]
pub enum ReactorError {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Reactor is not active")]
    ReactorInactive,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
    #[msg("Slippage exceeded")]
    SlippageExceeded,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid fee rate")]
    InvalidFeeRate,
}
