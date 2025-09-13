use anchor_lang::prelude::*;
use crate::state::*;
use crate::constants::*;
use crate::error::GameError;

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GameState::INIT_SPACE,
        seeds = [b"game", authority.key().as_ref()],
        bump
    )]
    pub game: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(ctx: Context<InitializeGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let clock = &ctx.accounts.clock;
    
    // Initialize game state
    game.authority = ctx.accounts.authority.key();
    game.game_status = GameStatus::WaitingForPlayers;
    game.current_turn = 0;
    game.current_players = 0;
    game.max_players = MAX_PLAYERS;
    game.players = Vec::new();
    game.houses_remaining = TOTAL_HOUSES;
    game.hotels_remaining = TOTAL_HOTELS;
    game.created_at = clock.unix_timestamp;
    game.is_active = true;
    game.dice_result = [0, 0];
    game.bank_balance = 1_000_000; // Initial bank balance
    game.time_limit = None;
    game.winner = None;
    game.turn_started_at = clock.unix_timestamp;
    
    // Players will be added when they join the game
    // Properties will be initialized as separate accounts when needed
    
    msg!("Game initialized by authority: {}", ctx.accounts.authority.key());
    msg!("Game account: {}", game.key());
    msg!("Game created at timestamp: {}", game.created_at);
    
    Ok(())
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
        constraint = game.game_status == GameStatus::WaitingForPlayers @ GameError::GameNotInProgress,
        constraint = game.current_players < MAX_PLAYERS @ GameError::MaxPlayersReached
    )]
    pub game: Account<'info, GameState>,
    
    #[account(
        init,
        payer = player,
        space = 8 + PlayerState::INIT_SPACE,
        seeds = [b"player", game.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,
    
    #[account(mut)]
    pub player: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn join_game_handler(ctx: Context<JoinGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;
    
    // Check if player already exists in game
    for existing_player in &game.players {
        if *existing_player == player_pubkey {
            return Err(GameError::PlayerAlreadyExists.into());
        }
    }
    
    // Initialize player state
    player_state.wallet = player_pubkey;
    player_state.game = game.key();
    player_state.cash_balance = STARTING_MONEY as u64;
    player_state.position = 0; // GO position
    player_state.in_jail = false;
    player_state.jail_turns = 0;
    player_state.doubles_count = 0;
    player_state.is_bankrupt = false;
    player_state.properties_owned = Vec::new();
    player_state.get_out_of_jail_cards = 0;
    player_state.net_worth = STARTING_MONEY as u64;
    player_state.last_rent_collected = clock.unix_timestamp;
    player_state.festival_boost_turns = 0;
    
    // Add player to game
    game.players.push(player_pubkey);
    game.current_players += 1;
    
    msg!("Player {} joined game. Total players: {}", player_pubkey, game.current_players);
    
    // Auto-start game if we have minimum players and all slots filled
    if game.current_players >= MIN_PLAYERS {
        msg!("Minimum players reached. Game can be started.");
    }
    
    Ok(())
}

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
        constraint = game.game_status == GameStatus::WaitingForPlayers @ GameError::GameNotInProgress,
        constraint = game.current_players >= MIN_PLAYERS @ GameError::MinPlayersNotMet,
        constraint = authority.key() == game.authority @ GameError::Unauthorized
    )]
    pub game: Account<'info, GameState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub clock: Sysvar<'info, Clock>,
}

pub fn start_game_handler(ctx: Context<StartGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let clock = &ctx.accounts.clock;
    
    // Change game status to in progress
    game.game_status = GameStatus::InProgress;
    game.current_turn = 0; // First player starts
    game.turn_started_at = clock.unix_timestamp;
    
    msg!("Game started! Player {} goes first.", game.players[0]);
    msg!("Total players in game: {}", game.current_players);
    
    Ok(())
}
