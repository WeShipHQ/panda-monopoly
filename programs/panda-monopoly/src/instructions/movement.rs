// use crate::constants::*;
// use crate::error::GameError;
// use crate::state::*;
// use anchor_lang::prelude::*;

// #[derive(Accounts)]
// pub struct MovePlayer<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(
//         mut,
//         seeds = [b"player", game.key().as_ref(), player.key().as_ref()],
//         bump
//     )]
//     pub player_state: Account<'info, PlayerState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn move_player_handler(ctx: Context<MovePlayer>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_state = &mut ctx.accounts.player_state;
//     let player_pubkey = ctx.accounts.player.key();

//     // Verify player has rolled dice
//     if !player_state.has_rolled_dice {
//         return Err(GameError::HasNotRolledDice.into());
//     }

//     // Calculate movement
//     let dice_sum = player_state.last_dice_roll[0] + player_state.last_dice_roll[1];
//     let old_position = player_state.position;
//     let new_position = (old_position + dice_sum) % BOARD_SIZE;

//     // Check if player passed GO
//     if new_position < old_position {
//         player_state.cash_balance += GO_SALARY as u64;
//         msg!(
//             "Player {} passed GO and collected ${}",
//             player_pubkey,
//             GO_SALARY
//         );
//     }

//     // Update player position
//     player_state.position = new_position;

//     // Process space action based on landing position
//     handle_space_landing(game, player_state, new_position)?;

//     msg!(
//         "Player {} moved from {} to {}",
//         player_pubkey,
//         old_position,
//         new_position
//     );
//     Ok(())
// }

// // Space landing logic will be handled by separate instructions
// // This function is simplified for now
// fn handle_space_landing(
//     game: &mut GameState,
//     player_state: &mut PlayerState,
//     position: u8,
// ) -> Result<()> {
//     let property_data = get_property_data(position);

//     match property_data {
//         Some(data) => {
//             match data.property_type {
//                 0 => {
//                     // Street property
//                     // Set flag for property interaction needed
//                     player_state.needs_property_action = true;
//                     player_state.pending_property_position = Some(position);
//                 }
//                 1 => {
//                     // Railroad
//                     player_state.needs_property_action = true;
//                     player_state.pending_property_position = Some(position);
//                 }
//                 2 => {
//                     // Utility
//                     player_state.needs_property_action = true;
//                     player_state.pending_property_position = Some(position);
//                 }
//                 3 => {
//                     // Special space
//                     handle_special_space(game, player_state, position)?;
//                 }
//                 _ => {}
//             }
//         }
//         None => return Err(GameError::InvalidBoardPosition.into()),
//     }

//     Ok(())
// }

// fn handle_special_space(
//     game: &mut GameState,
//     player_state: &mut PlayerState,
//     position: u8,
// ) -> Result<()> {
//     match position {
//         GO_POSITION => {
//             // Already handled in movement
//         }
//         JAIL_POSITION => {
//             // Just visiting jail, no action needed
//         }
//         GO_TO_JAIL_POSITION => {
//             // send_player_to_jail(player_state);
//         }
//         INCOME_TAX_POSITION => {
//             // Deduct income tax
//             if player_state.cash_balance >= INCOME_TAX as u64 {
//                 player_state.cash_balance -= INCOME_TAX as u64;
//             } else {
//                 // Handle insufficient funds - bankruptcy check needed
//                 player_state.needs_bankruptcy_check = true;
//             }
//         }
//         LUXURY_TAX_POSITION => {
//             if player_state.cash_balance >= LUXURY_TAX as u64 {
//                 player_state.cash_balance -= LUXURY_TAX as u64;
//             } else {
//                 player_state.needs_bankruptcy_check = true;
//             }
//         }
//         pos if CHANCE_POSITIONS.contains(&pos) => {
//             player_state.needs_chance_card = true;
//         }
//         pos if COMMUNITY_CHEST_POSITIONS.contains(&pos) => {
//             player_state.needs_community_chest_card = true;
//         }
//         FREE_PARKING_POSITION => {
//             // Free parking - no action
//         }
//         _ => {}
//     }
//     Ok(())
// }

// // Property landing logic will be handled by PropertyState accounts
// fn handle_property_landing(
//     _game: &mut GameState,
//     _player_index: usize,
//     position: u8,
// ) -> Result<()> {
//     msg!("Player landed on property at position {}", position);
//     Ok(())
// }

// fn is_property_space(position: u8) -> bool {
//     // Check if position is a purchasable property
//     match position {
//         1..=3 | 6..=9 | 11..=14 | 16..=19 | 21..=24 | 26..=29 | 31..=34 | 37..=39 => true,
//         _ => false,
//     }
// }

// fn is_chance_space(position: u8) -> bool {
//     matches!(position, 7 | 22 | 36)
// }

// fn is_community_chest_space(position: u8) -> bool {
//     matches!(position, 2 | 17 | 33)
// }

// #[derive(Accounts)]
// pub struct EndTurn<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn end_turn_handler(ctx: Context<EndTurn>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player index in game.players vector
//     let player_index = game
//         .players
//         .iter()
//         .position(|&p| p == player_pubkey)
//         .ok_or(GameError::PlayerNotFound)?;

//     // Verify it's the current player's turn
//     if game.current_turn != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Turn ending logic will be handled by PlayerState accounts
//     // For now, we'll advance to the next player
//     let next_turn = (game.current_turn + 1) % game.current_players;
//     game.current_turn = next_turn;
//     game.turn_started_at = clock.unix_timestamp;

//     msg!("Turn ended. Next turn: {}", next_turn);

//     Ok(())
// }

// // Bankruptcy logic will be handled by PlayerState accounts
// // This function is simplified for now
// pub fn check_bankruptcy(_game: &mut GameState, _player_index: usize) -> Result<()> {
//     msg!("Bankruptcy check processed");
//     Ok(())
// }
