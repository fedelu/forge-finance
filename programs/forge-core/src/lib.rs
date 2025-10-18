use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer, MintTo};

declare_id!("DWkDGw5Pvqgh3DN6HZwssn31AUAkuWLtjDnjyEUdgRHU");

#[program]
pub mod forge_core {
    use super::*;

    /// Initialize the Forge Protocol with all module program IDs
    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        protocol_config: ProtocolConfig,
    ) -> Result<()> {
        let forge_protocol = &mut ctx.accounts.forge_protocol;
        let clock = Clock::get()?;

        forge_protocol.authority = ctx.accounts.authority.key();
        forge_protocol.treasury = ctx.accounts.treasury.key();
        forge_protocol.crucibles_program = protocol_config.crucibles_program;
        forge_protocol.sparks_program = protocol_config.sparks_program;
        forge_protocol.smelters_program = protocol_config.smelters_program;
        forge_protocol.heat_program = protocol_config.heat_program;
        forge_protocol.reactors_program = protocol_config.reactors_program;
        forge_protocol.firewall_program = protocol_config.firewall_program;
        forge_protocol.engineers_program = protocol_config.engineers_program;
        forge_protocol.protocol_fee_rate = protocol_config.protocol_fee_rate;
        forge_protocol.max_crucibles = protocol_config.max_crucibles;
        forge_protocol.is_active = true;
        forge_protocol.created_at = clock.unix_timestamp;
        forge_protocol.bump = ctx.bumps.forge_protocol;

        msg!("Forge Protocol initialized with {} max crucibles", protocol_config.max_crucibles);
        Ok(())
    }

    /// Update protocol configuration (only authority)
    pub fn update_protocol_config(
        ctx: Context<UpdateProtocolConfig>,
        new_config: ProtocolConfig,
    ) -> Result<()> {
        let forge_protocol = &mut ctx.accounts.forge_protocol;
        
        forge_protocol.protocol_fee_rate = new_config.protocol_fee_rate;
        forge_protocol.max_crucibles = new_config.max_crucibles;

        msg!("Protocol configuration updated");
        Ok(())
    }

    /// Register a new crucible in the protocol registry
    pub fn register_crucible(
        ctx: Context<RegisterCrucible>,
        crucible_id: u64,
    ) -> Result<()> {
        let crucible_registry = &mut ctx.accounts.crucible_registry;
        let forge_protocol = &mut ctx.accounts.forge_protocol;

        require!(forge_protocol.crucible_count < forge_protocol.max_crucibles, ForgeError::MaxCruciblesReached);

        crucible_registry.id = crucible_id;
        crucible_registry.crucible = ctx.accounts.crucible.key();
        crucible_registry.base_mint = ctx.accounts.base_mint.key();
        crucible_registry.is_active = true;
        crucible_registry.created_at = Clock::get()?.unix_timestamp;
        crucible_registry.bump = ctx.bumps.crucible_registry;

        forge_protocol.crucible_count += 1;

        msg!("Crucible {} registered with ID {}", ctx.accounts.crucible.key(), crucible_id);
        Ok(())
    }

    /// Collect protocol fees to treasury
    pub fn collect_fees(
        ctx: Context<CollectFees>,
        amount: u64,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: ctx.accounts.fee_vault.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                cpi_accounts,
            ),
            amount,
        )?;

        msg!("Collected {} protocol fees", amount);
        Ok(())
    }

    /// Pause/Resume protocol (emergency function)
    pub fn set_protocol_status(
        ctx: Context<SetProtocolStatus>,
        is_active: bool,
    ) -> Result<()> {
        let forge_protocol = &mut ctx.accounts.forge_protocol;
        forge_protocol.is_active = is_active;

        msg!("Protocol status set to: {}", is_active);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 * 8 + 8 * 2 + 1 + 8 + 1,
        seeds = [b"forge_protocol"],
        bump
    )]
    pub forge_protocol: Account<'info, ForgeProtocol>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Treasury account for protocol fees
    pub treasury: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProtocolConfig<'info> {
    #[account(mut, has_one = authority)]
    pub forge_protocol: Account<'info, ForgeProtocol>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct RegisterCrucible<'info> {
    #[account(mut, has_one = authority)]
    pub forge_protocol: Account<'info, ForgeProtocol>,
    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 32 + 32 + 1 + 8 + 1,
        seeds = [b"crucible_registry", crucible.key().as_ref()],
        bump
    )]
    pub crucible_registry: Account<'info, CrucibleRegistry>,
    /// CHECK: Crucible account to register
    pub crucible: UncheckedAccount<'info>,
    /// CHECK: Base mint of the crucible
    pub base_mint: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CollectFees<'info> {
    #[account(mut, has_one = authority)]
    pub forge_protocol: Account<'info, ForgeProtocol>,
    #[account(mut)]
    pub fee_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetProtocolStatus<'info> {
    #[account(mut, has_one = authority)]
    pub forge_protocol: Account<'info, ForgeProtocol>,
    pub authority: Signer<'info>,
}

#[account]
pub struct ForgeProtocol {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub crucibles_program: Pubkey,
    pub sparks_program: Pubkey,
    pub smelters_program: Pubkey,
    pub heat_program: Pubkey,
    pub reactors_program: Pubkey,
    pub firewall_program: Pubkey,
    pub engineers_program: Pubkey,
    pub protocol_fee_rate: u64, // basis points
    pub max_crucibles: u64,
    pub crucible_count: u64,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct CrucibleRegistry {
    pub id: u64,
    pub crucible: Pubkey,
    pub base_mint: Pubkey,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProtocolConfig {
    pub crucibles_program: Pubkey,
    pub sparks_program: Pubkey,
    pub smelters_program: Pubkey,
    pub heat_program: Pubkey,
    pub reactors_program: Pubkey,
    pub firewall_program: Pubkey,
    pub engineers_program: Pubkey,
    pub protocol_fee_rate: u64,
    pub max_crucibles: u64,
}

#[error_code]
pub enum ForgeError {
    #[msg("Maximum number of crucibles reached")]
    MaxCruciblesReached,
    #[msg("Protocol is not active")]
    ProtocolInactive,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid configuration")]
    InvalidConfig,
}
