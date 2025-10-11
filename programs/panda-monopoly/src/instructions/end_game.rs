use crate::error::GameError;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct EndGame<'info> {
    #[account(
        mut,
        seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
    )]
    pub game: Box<Account<'info, GameState>>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn end_game_handler(ctx: Context<EndGame>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let clock = &ctx.accounts.clock;

    // Check if game should end (only one player remaining)
    let active_players = count_active_players(game);
    
    if active_players <= 1 {
        // End the game
        game.game_status = GameStatus::Finished;
        
        if active_players == 1 {
            // Find the remaining active player and declare them winner
            if let Some(winner_pubkey) = find_last_active_player(game) {
                game.winner = Some(winner_pubkey);
                msg!("Game ended. Winner: {}", winner_pubkey);
                
                emit!(GameEnded {
                    game_id: game.game_id,
                    winner: Some(winner_pubkey),
                    ended_at: clock.unix_timestamp,
                });
            }
        } else {
            // No players remaining (shouldn't happen in normal gameplay)
            msg!("Game ended with no remaining players");
            
            emit!(GameEnded {
                game_id: game.game_id,
                winner: None,
                ended_at: clock.unix_timestamp,
            });
        }
        
        msg!("Game {} has ended", game.game_id);
    } else {
        return Err(GameError::GameCannotEnd.into());
    }

    Ok(())
}

/// Count the number of active (non-bankrupt, non-default) players
fn count_active_players(game: &GameState) -> u8 {
    game.players
        .iter()
        .filter(|&&player| player != Pubkey::default())
        .count() as u8
}

/// Find the last remaining active player
fn find_last_active_player(game: &GameState) -> Option<Pubkey> {
    game.players
        .iter()
        .find(|&&player| player != Pubkey::default())
        .copied()
}

/// Check if the game should end based on current state
pub fn check_game_end_condition(game: &GameState) -> bool {
    count_active_players(game) <= 1
}