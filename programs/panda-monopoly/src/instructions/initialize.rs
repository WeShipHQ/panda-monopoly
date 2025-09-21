use crate::constants::*;
use crate::error::GameError;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GameState::INIT_SPACE,
        seeds = [
            // b"game", authority.key().as_ref(),  &game_id.to_le_bytes()
            b"game",
            config.id.as_ref(),
            &game_id.to_le_bytes()
            ],
        bump
    )]
    pub game: Account<'info, GameState>,

    #[account(
        init,
        payer = authority,
        space = 8 + PlayerState::INIT_SPACE,
        seeds = [b"player", game.key().as_ref(), authority.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [b"platform", config.id.as_ref()],
        bump = config.bump,
    )]
    pub config: Account<'info, PlatformConfig>,

    pub system_program: Program<'info, System>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn initialize_game_handler(ctx: Context<InitializeGame>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let clock = &ctx.accounts.clock;

    let game_id = config.next_game_id;
    config.next_game_id += 1;
    config.total_games_created += 1;

    // Initialize game state
    game.game_id = game_id;
    game.config_id = config.id;
    game.authority = ctx.accounts.authority.key();
    game.bump = ctx.bumps.game;
    game.game_status = GameStatus::WaitingForPlayers;
    game.current_turn = 0;
    game.current_players = 0; // Initial player count
    game.max_players = MAX_PLAYERS;
    game.players = vec![];
    game.houses_remaining = TOTAL_HOUSES;
    game.hotels_remaining = TOTAL_HOTELS;
    game.created_at = clock.unix_timestamp;
    game.bank_balance = 1_000_000; // Initial bank balance
    game.time_limit = None;
    game.winner = None;
    game.turn_started_at = clock.unix_timestamp;

    // Initialize player state
    player_state.initialize_player_state(ctx.accounts.authority.key(), game.key(), clock);

    // Add player to game
    game.players.push(player_state.wallet);
    game.current_players = game.players.len() as u8;

    msg!(
        "Game initialized by authority: {}",
        ctx.accounts.authority.key()
    );
    msg!("Game account: {}", game.key());
    msg!("Game created at timestamp: {}", game.created_at);

    Ok(())
}

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(
        mut,
        // seeds = [b"game", game.authority.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
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

    msg!("Join game: {}", game.key());
    msg!("Player: {}", player_pubkey);

    // Check if player already exists in game
    for existing_player in &game.players {
        msg!("Existing player: {}", existing_player);
        if *existing_player == player_pubkey {
            return Err(GameError::PlayerAlreadyExists.into());
        }
    }

    // Initialize player state
    player_state.initialize_player_state(player_pubkey, game.key(), clock);

    // Add player to game
    game.players.push(player_pubkey);
    game.current_players = game.players.len() as u8;

    msg!(
        "Player {} joined game. Total players: {}",
        player_pubkey,
        game.current_players
    );

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
        // seeds = [b"game", game.authority.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
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
