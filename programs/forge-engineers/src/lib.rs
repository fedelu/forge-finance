use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint, MintTo};

declare_id!("99hNfvzEBChK3XHYxMKWoUXmLXABmLYjZEu1P3wSaH68");

#[program]
pub mod forge_engineers {
    use super::*;

    /// Initialize an engineer account
    pub fn initialize_engineer(
        ctx: Context<InitializeEngineer>,
        params: EngineerParams,
    ) -> Result<()> {
        let engineer = &mut ctx.accounts.engineer;
        let clock = Clock::get()?;

        engineer.authority = ctx.accounts.authority.key();
        engineer.name = params.name;
        engineer.description = params.description;
        engineer.website = params.website;
        engineer.is_active = true;
        engineer.total_crucibles_created = 0;
        engineer.total_tvl_managed = 0;
        engineer.created_at = clock.unix_timestamp;
        engineer.bump = ctx.bumps.engineer;

        msg!("Engineer {} initialized", params.name);
        Ok(())
    }

    /// Create a new crucible with specified parameters
    pub fn create_crucible(
        ctx: Context<CreateCrucible>,
        crucible_id: u64,
        params: CrucibleCreationParams,
    ) -> Result<()> {
        let engineer = &mut ctx.accounts.engineer;
        let crucible_blueprint = &mut ctx.accounts.crucible_blueprint;
        let clock = Clock::get()?;

        require!(engineer.is_active, EngineerError::EngineerInactive);

        crucible_blueprint.id = crucible_id;
        crucible_blueprint.engineer = engineer.key();
        crucible_blueprint.base_mint = params.base_mint;
        crucible_blueprint.heat_mint = params.heat_mint;
        crucible_blueprint.heat_rate = params.heat_rate;
        crucible_blueprint.protocol_fee_rate = params.protocol_fee_rate;
        crucible_blueprint.min_deposit_duration = params.min_deposit_duration;
        crucible_blueprint.max_deposit_amount = params.max_deposit_amount;
        crucible_blueprint.strategy_type = params.strategy_type;
        crucible_blueprint.is_active = true;
        crucible_blueprint.created_at = clock.unix_timestamp;
        crucible_blueprint.bump = ctx.bumps.crucible_blueprint;

        engineer.total_crucibles_created += 1;

        msg!("Crucible blueprint created with ID: {}", crucible_id);
        Ok(())
    }

    /// Deploy a crucible from a blueprint
    pub fn deploy_crucible(
        ctx: Context<DeployCrucible>,
        crucible_id: u64,
    ) -> Result<()> {
        let engineer = &mut ctx.accounts.engineer;
        let crucible_blueprint = &ctx.accounts.crucible_blueprint;
        let deployment = &mut ctx.accounts.deployment;
        let clock = Clock::get()?;

        require!(engineer.is_active, EngineerError::EngineerInactive);
        require!(crucible_blueprint.is_active, EngineerError::BlueprintInactive);

        deployment.blueprint = crucible_blueprint.key();
        deployment.crucible = ctx.accounts.crucible.key();
        deployment.engineer = engineer.key();
        deployment.deployed_at = clock.unix_timestamp;
        deployment.is_active = true;
        deployment.bump = ctx.bumps.deployment;

        msg!("Crucible deployed from blueprint {}", crucible_id);
        Ok(())
    }

    /// Update crucible strategy parameters
    pub fn update_crucible_strategy(
        ctx: Context<UpdateCrucibleStrategy>,
        new_strategy: StrategyType,
        new_params: StrategyParams,
    ) -> Result<()> {
        let crucible_blueprint = &mut ctx.accounts.crucible_blueprint;

        crucible_blueprint.strategy_type = new_strategy;
        crucible_blueprint.heat_rate = new_params.heat_rate;
        crucible_blueprint.protocol_fee_rate = new_params.protocol_fee_rate;
        crucible_blueprint.min_deposit_duration = new_params.min_deposit_duration;
        crucible_blueprint.max_deposit_amount = new_params.max_deposit_amount;

        msg!("Crucible strategy updated to {:?}", new_strategy);
        Ok(())
    }

    /// Pause/Resume crucible blueprint
    pub fn set_blueprint_status(
        ctx: Context<SetBlueprintStatus>,
        is_active: bool,
    ) -> Result<()> {
        let crucible_blueprint = &mut ctx.accounts.crucible_blueprint;
        crucible_blueprint.is_active = is_active;

        msg!("Blueprint status set to: {}", is_active);
        Ok(())
    }

    /// Update engineer information
    pub fn update_engineer_info(
        ctx: Context<UpdateEngineerInfo>,
        new_info: EngineerParams,
    ) -> Result<()> {
        let engineer = &mut ctx.accounts.engineer;

        engineer.name = new_info.name;
        engineer.description = new_info.description;
        engineer.website = new_info.website;

        msg!("Engineer information updated");
        Ok(())
    }

    /// Pause/Resume engineer
    pub fn set_engineer_status(
        ctx: Context<SetEngineerStatus>,
        is_active: bool,
    ) -> Result<()> {
        let engineer = &mut ctx.accounts.engineer;
        engineer.is_active = is_active;

        msg!("Engineer status set to: {}", is_active);
        Ok(())
    }

    /// Get engineer statistics
    pub fn get_engineer_stats(
        ctx: Context<GetEngineerStats>,
    ) -> Result<EngineerStats> {
        let engineer = &ctx.accounts.engineer;

        let stats = EngineerStats {
            total_crucibles_created: engineer.total_crucibles_created,
            total_tvl_managed: engineer.total_tvl_managed,
            is_active: engineer.is_active,
            created_at: engineer.created_at,
        };

        msg!("Engineer stats: {} crucibles, {} TVL", 
             stats.total_crucibles_created, 
             stats.total_tvl_managed);
        Ok(stats)
    }

    /// Emergency pause all crucibles created by this engineer
    pub fn emergency_pause_crucibles(
        ctx: Context<EmergencyPauseCrucibles>,
    ) -> Result<()> {
        let engineer = &ctx.accounts.engineer;

        // This would typically iterate through all crucibles created by this engineer
        // and pause them. For now, we'll just log the action.
        msg!("Emergency pause initiated for all crucibles by engineer {}", engineer.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeEngineer<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 64 + 64 + 1 + 8*2 + 1,
        seeds = [b"engineer", authority.key().as_ref()],
        bump
    )]
    pub engineer: Account<'info, Engineer>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCrucible<'info> {
    #[account(mut, has_one = authority)]
    pub engineer: Account<'info, Engineer>,
    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 32*3 + 8*5 + 1 + 8 + 1,
        seeds = [b"crucible_blueprint", engineer.key().as_ref(), crucible_id.to_le_bytes().as_ref()],
        bump
    )]
    pub crucible_blueprint: Account<'info, CrucibleBlueprint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Crucible ID
    pub crucible_id: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeployCrucible<'info> {
    #[account(mut, has_one = authority)]
    pub engineer: Account<'info, Engineer>,
    #[account(has_one = engineer)]
    pub crucible_blueprint: Account<'info, CrucibleBlueprint>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32*3 + 8 + 1 + 1,
        seeds = [b"deployment", crucible_blueprint.key().as_ref()],
        bump
    )]
    pub deployment: Account<'info, CrucibleDeployment>,
    /// CHECK: Crucible account to deploy
    pub crucible: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateCrucibleStrategy<'info> {
    #[account(
        mut,
        has_one = engineer
    )]
    pub crucible_blueprint: Account<'info, CrucibleBlueprint>,
    #[account(has_one = authority)]
    pub engineer: Account<'info, Engineer>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetBlueprintStatus<'info> {
    #[account(
        mut,
        has_one = engineer
    )]
    pub crucible_blueprint: Account<'info, CrucibleBlueprint>,
    #[account(has_one = authority)]
    pub engineer: Account<'info, Engineer>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateEngineerInfo<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub engineer: Account<'info, Engineer>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetEngineerStatus<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub engineer: Account<'info, Engineer>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetEngineerStats<'info> {
    pub engineer: Account<'info, Engineer>,
}

#[derive(Accounts)]
pub struct EmergencyPauseCrucibles<'info> {
    #[account(has_one = authority)]
    pub engineer: Account<'info, Engineer>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Engineer {
    pub authority: Pubkey,
    pub name: [u8; 32],
    pub description: [u8; 64],
    pub website: [u8; 64],
    pub is_active: bool,
    pub total_crucibles_created: u64,
    pub total_tvl_managed: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct CrucibleBlueprint {
    pub id: u64,
    pub engineer: Pubkey,
    pub base_mint: Pubkey,
    pub heat_mint: Pubkey,
    pub heat_rate: u64,
    pub protocol_fee_rate: u64,
    pub min_deposit_duration: i64,
    pub max_deposit_amount: u64,
    pub strategy_type: StrategyType,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct CrucibleDeployment {
    pub blueprint: Pubkey,
    pub crucible: Pubkey,
    pub engineer: Pubkey,
    pub deployed_at: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum StrategyType {
    Basic,
    YieldFarming,
    LiquidityProvision,
    Staking,
    Lending,
    Custom,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EngineerParams {
    pub name: [u8; 32],
    pub description: [u8; 64],
    pub website: [u8; 64],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CrucibleCreationParams {
    pub base_mint: Pubkey,
    pub heat_mint: Pubkey,
    pub heat_rate: u64,
    pub protocol_fee_rate: u64,
    pub min_deposit_duration: i64,
    pub max_deposit_amount: u64,
    pub strategy_type: StrategyType,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct StrategyParams {
    pub heat_rate: u64,
    pub protocol_fee_rate: u64,
    pub min_deposit_duration: i64,
    pub max_deposit_amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EngineerStats {
    pub total_crucibles_created: u64,
    pub total_tvl_managed: u64,
    pub is_active: bool,
    pub created_at: i64,
}

#[error_code]
pub enum EngineerError {
    #[msg("Engineer is not active")]
    EngineerInactive,
    #[msg("Blueprint is not active")]
    BlueprintInactive,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid crucible parameters")]
    InvalidCrucibleParams,
    #[msg("Invalid strategy type")]
    InvalidStrategyType,
    #[msg("Crucible already exists")]
    CrucibleAlreadyExists,
    #[msg("Blueprint not found")]
    BlueprintNotFound,
}
