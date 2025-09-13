use crate::error::GameError;
use crate::state::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct EndTurn<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        bump = game.bump,
        constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
    )]
    pub game: Account<'info, GameState>,

    #[account(
        mut,
        seeds = [b"player", game.key().as_ref(), player.key().as_ref()],
        bump
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn end_turn_handler(ctx: Context<EndTurn>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Find player index in game.players vector
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    // Verify it's the current player's turn
    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Verify player has rolled dice
    if !player_state.has_rolled_dice {
        return Err(GameError::HasNotRolledDice.into());
    }

    // Check if player has pending actions that must be completed
    if player_state.needs_property_action {
        return Err(GameError::MustHandleSpecialSpace.into());
    }

    if player_state.needs_chance_card {
        return Err(GameError::MustHandleSpecialSpace.into());
    }

    if player_state.needs_community_chest_card {
        return Err(GameError::MustHandleSpecialSpace.into());
    }

    if player_state.needs_bankruptcy_check {
        return Err(GameError::MustDeclareBankruptcy.into());
    }

    // Check if player rolled doubles and should get another turn
    let is_doubles = player_state.last_dice_roll[0] == player_state.last_dice_roll[1];

    // Reset turn-specific flags
    player_state.has_rolled_dice = false;
    player_state.needs_property_action = false;
    player_state.pending_property_position = None;
    player_state.needs_chance_card = false;
    player_state.needs_community_chest_card = false;
    player_state.needs_bankruptcy_check = false;

    if is_doubles && player_state.doubles_count < 3 && !player_state.in_jail {
        // Player gets another turn due to doubles
        msg!("Player {} gets another turn due to doubles!", player_pubkey);
        game.turn_started_at = clock.unix_timestamp;
    } else {
        // Advance to next player
        player_state.doubles_count = 0; // Reset doubles count
        let next_turn = (game.current_turn + 1) % game.current_players;
        game.current_turn = next_turn;
        game.turn_started_at = clock.unix_timestamp;

        msg!("Turn ended. Next turn: Player {}", next_turn);
    }

    Ok(())
}

// Bankruptcy logic will be handled by PlayerState accounts
// This function is simplified for now
// pub fn check_bankruptcy(_game: &mut GameState, _player_index: usize) -> Result<()> {
//     msg!("Bankruptcy check processed");
//     Ok(())
// }
