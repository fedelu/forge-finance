use anchor_lang::prelude::*;

declare_id!("6CtfUiqzkUJub4dZzMmbtwBgcfHgNjTHKesdX39SZaTS");

#[program]
pub mod forge_firewall {
    use super::*;

    /// Initialize the firewall system
    pub fn initialize_firewall(
        ctx: Context<InitializeFirewall>,
        params: FirewallParams,
    ) -> Result<()> {
        let firewall = &mut ctx.accounts.firewall;
        let clock = Clock::get()?;

        firewall.authority = ctx.accounts.authority.key();
        firewall.guardian = params.guardian;
        firewall.emergency_pause_authority = params.emergency_pause_authority;
        firewall.is_paused = false;
        firewall.max_roles = params.max_roles;
        firewall.role_count = 0;
        firewall.created_at = clock.unix_timestamp;
        firewall.bump = ctx.bumps.firewall;

        msg!("Firewall initialized with guardian: {}", params.guardian);
        Ok(())
    }

    /// Grant a role to a user
    pub fn grant_role(
        ctx: Context<GrantRole>,
        role: Role,
        user: Pubkey,
    ) -> Result<()> {
        let firewall = &mut ctx.accounts.firewall;
        let user_role = &mut ctx.accounts.user_role;

        require!(!firewall.is_paused, FirewallError::SystemPaused);
        require!(firewall.role_count < firewall.max_roles, FirewallError::MaxRolesReached);

        user_role.user = user;
        user_role.role = role;
        user_role.granted_at = Clock::get()?.unix_timestamp;
        user_role.is_active = true;
        user_role.bump = ctx.bumps.user_role;

        firewall.role_count += 1;

        msg!("Granted role {:?} to {}", role, user);
        Ok(())
    }

    /// Revoke a role from a user
    pub fn revoke_role(
        ctx: Context<RevokeRole>,
    ) -> Result<()> {
        let firewall = &mut ctx.accounts.firewall;
        let user_role = &mut ctx.accounts.user_role;

        require!(!firewall.is_paused, FirewallError::SystemPaused);

        user_role.is_active = false;
        firewall.role_count = firewall.role_count.saturating_sub(1);

        msg!("Revoked role from {}", user_role.user);
        Ok(())
    }

    /// Pause the entire system (emergency function)
    pub fn pause_system(
        ctx: Context<PauseSystem>,
    ) -> Result<()> {
        let firewall = &mut ctx.accounts.firewall;
        firewall.is_paused = true;

        msg!("System paused by emergency authority");
        Ok(())
    }

    /// Resume the system
    pub fn resume_system(
        ctx: Context<ResumeSystem>,
    ) -> Result<()> {
        let firewall = &mut ctx.accounts.firewall;
        firewall.is_paused = false;

        msg!("System resumed");
        Ok(())
    }

    /// Update firewall parameters (only authority)
    pub fn update_firewall_params(
        ctx: Context<UpdateFirewallParams>,
        new_params: FirewallParams,
    ) -> Result<()> {
        let firewall = &mut ctx.accounts.firewall;

        firewall.guardian = new_params.guardian;
        firewall.emergency_pause_authority = new_params.emergency_pause_authority;
        firewall.max_roles = new_params.max_roles;

        msg!("Firewall parameters updated");
        Ok(())
    }

    /// Check if a user has a specific role
    pub fn has_role(
        ctx: Context<HasRole>,
        role: Role,
    ) -> Result<bool> {
        let user_role = &ctx.accounts.user_role;
        let has_role = user_role.is_active && user_role.role == role;

        msg!("User {} has role {:?}: {}", user_role.user, role, has_role);
        Ok(has_role)
    }

    /// Check if a user has admin privileges
    pub fn is_admin(
        ctx: Context<IsAdmin>,
    ) -> Result<bool> {
        let user_role = &ctx.accounts.user_role;
        let is_admin = user_role.is_active && 
                      (user_role.role == Role::Admin || user_role.role == Role::SuperAdmin);

        msg!("User {} is admin: {}", user_role.user, is_admin);
        Ok(is_admin)
    }

    /// Check if a user has guardian privileges
    pub fn is_guardian(
        ctx: Context<IsGuardian>,
    ) -> Result<bool> {
        let user_role = &ctx.accounts.user_role;
        let is_guardian = user_role.is_active && 
                         (user_role.role == Role::Guardian || user_role.role == Role::SuperAdmin);

        msg!("User {} is guardian: {}", user_role.user, is_guardian);
        Ok(is_guardian)
    }

    /// Emergency transfer of authority
    pub fn emergency_transfer_authority(
        ctx: Context<EmergencyTransferAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let firewall = &mut ctx.accounts.firewall;
        firewall.authority = new_authority;

        msg!("Authority transferred to {}", new_authority);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeFirewall<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32*3 + 1 + 8*2 + 1,
        seeds = [b"firewall"],
        bump
    )]
    pub firewall: Account<'info, Firewall>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GrantRole<'info> {
    #[account(mut)]
    pub firewall: Account<'info, Firewall>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 1 + 1,
        seeds = [b"user_role", firewall.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_role: Account<'info, UserRole>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: User to grant role to
    pub user: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeRole<'info> {
    #[account(mut)]
    pub firewall: Account<'info, Firewall>,
    #[account(
        mut,
        has_one = user
    )]
    pub user_role: Account<'info, UserRole>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct PauseSystem<'info> {
    #[account(
        mut,
        has_one = emergency_pause_authority
    )]
    pub firewall: Account<'info, Firewall>,
    pub emergency_pause_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResumeSystem<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub firewall: Account<'info, Firewall>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateFirewallParams<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub firewall: Account<'info, Firewall>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct HasRole<'info> {
    pub firewall: Account<'info, Firewall>,
    pub user_role: Account<'info, UserRole>,
}

#[derive(Accounts)]
pub struct IsAdmin<'info> {
    pub firewall: Account<'info, Firewall>,
    pub user_role: Account<'info, UserRole>,
}

#[derive(Accounts)]
pub struct IsGuardian<'info> {
    pub firewall: Account<'info, Firewall>,
    pub user_role: Account<'info, UserRole>,
}

#[derive(Accounts)]
pub struct EmergencyTransferAuthority<'info> {
    #[account(
        mut,
        has_one = emergency_pause_authority
    )]
    pub firewall: Account<'info, Firewall>,
    pub emergency_pause_authority: Signer<'info>,
}

#[account]
pub struct Firewall {
    pub authority: Pubkey,
    pub guardian: Pubkey,
    pub emergency_pause_authority: Pubkey,
    pub is_paused: bool,
    pub max_roles: u64,
    pub role_count: u64,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct UserRole {
    pub user: Pubkey,
    pub role: Role,
    pub granted_at: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum Role {
    Admin,
    Guardian,
    Engineer,
    User,
    SuperAdmin,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct FirewallParams {
    pub guardian: Pubkey,
    pub emergency_pause_authority: Pubkey,
    pub max_roles: u64,
}

#[error_code]
pub enum FirewallError {
    #[msg("System is paused")]
    SystemPaused,
    #[msg("Maximum roles reached")]
    MaxRolesReached,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Role already exists")]
    RoleAlreadyExists,
    #[msg("Role does not exist")]
    RoleDoesNotExist,
    #[msg("Invalid role")]
    InvalidRole,
}
