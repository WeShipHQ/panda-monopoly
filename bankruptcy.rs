#[derive(Accounts)]
pub struct DeclareBankruptcy<'info> {
    #[account(
        mut,
        seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
    )]
    pub game: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"player", game.key().as_ref(), player.key().as_ref()],
        bump,
        constraint = player_state.needs_bankruptcy_check == true @ GameError::MustDeclareBankruptcy
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn declare_bankruptcy_handler(
    ctx: Context<DeclareBankruptcy>,
    creditor: Option<Pubkey>, // None if debt is to the bank
) -> Result<()> {
    // Implementation needed for:
    // 1. Liquidate all assets (houses/hotels at half price)
    // 2. Transfer properties to creditor or bank
    // 3. Handle mortgaged properties
    // 4. Mark player as bankrupt
    // 5. Remove player from game
    Ok(())
}