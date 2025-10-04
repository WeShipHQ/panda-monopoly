use crate::constants::*;
use crate::error::GameError;
use crate::state::*;
use crate::utils::*;
use anchor_lang::prelude::*;

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
        constraint = !player_state.is_bankrupt @ GameError::BankruptcyAlreadyStarted
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn declare_bankruptcy_handler<'c: 'info, 'info>(
    ctx: Context<'_, '_, 'c, 'info, DeclareBankruptcy<'info>>,
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    let mut total_liquidation_value = 0u64;
    let mut houses_returned = 0u8;
    let mut hotels_returned = 0u8;

    let remaining_accounts_iter = &mut ctx.remaining_accounts.iter();

    let owned_properties = player_state.properties_owned.clone();

    for &property_position in &owned_properties {
        // Each property should have its PropertyState account in remaining_accounts
        if let Some(property_account_info) = remaining_accounts_iter.next() {
            let mut property_account_data = property_account_info.try_borrow_mut_data()?;
            let mut property_state =
                PropertyState::try_deserialize(&mut property_account_data.as_ref())?;

            if property_state.owner != Some(player_pubkey) {
                continue; // Skip if not owned by this player
            }

            if property_state.position != property_position {
                return Err(GameError::InvalidAccount.into());
            }

            let building_value = calculate_building_liquidation_value(&property_state)?;
            total_liquidation_value = total_liquidation_value
                .checked_add(building_value)
                .ok_or(GameError::ArithmeticOverflow)?;

            houses_returned = houses_returned
                .checked_add(property_state.houses)
                .ok_or(GameError::ArithmeticOverflow)?;

            if property_state.has_hotel {
                hotels_returned = hotels_returned
                    .checked_add(1)
                    .ok_or(GameError::ArithmeticOverflow)?;
            }

            if !property_state.is_mortgaged {
                total_liquidation_value = total_liquidation_value
                    .checked_add(property_state.mortgage_value as u64)
                    .ok_or(GameError::ArithmeticOverflow)?;
            }

            property_state.owner = None;
            property_state.houses = 0;
            property_state.has_hotel = false;
            property_state.is_mortgaged = false;
            property_state.last_rent_paid = 0;

            // Serialize the updated property state back
            let mut updated_data = Vec::new();
            property_state.try_serialize(&mut updated_data)?;

            // Update the account data
            if updated_data.len() <= property_account_data.len() {
                property_account_data[..updated_data.len()].copy_from_slice(&updated_data);
            }

            msg!(
                "Property at position {} liquidated and returned to bank",
                property_position
            );
        } else {
            // If no property account provided for an owned property, just use base mortgage value
            if let Some(property_data) = get_property_data(property_position) {
                total_liquidation_value = total_liquidation_value
                    .checked_add(property_data.mortgage_value as u64)
                    .ok_or(GameError::ArithmeticOverflow)?;
            }
        }
    }

    // Return buildings to bank inventory
    game.houses_remaining = game
        .houses_remaining
        .checked_add(houses_returned)
        .ok_or(GameError::ArithmeticOverflow)?;

    game.hotels_remaining = game
        .hotels_remaining
        .checked_add(hotels_returned)
        .ok_or(GameError::ArithmeticOverflow)?;

    // // Check if player truly needs to declare bankruptcy
    // let total_available_funds = player_state.cash_balance + total_liquidation_value;

    // // For now, we'll allow bankruptcy if they have insufficient funds for any pending obligation
    // if total_available_funds > 0 && !player_state.needs_bankruptcy_check {
    //     return Err(GameError::CannotDeclareBankruptcyWithAssets.into());
    // }

    // Add liquidation proceeds to player's cash
    player_state.cash_balance = player_state
        .cash_balance
        .checked_add(total_liquidation_value)
        .ok_or(GameError::ArithmeticOverflow)?;

    // Mark player as bankrupt
    player_state.is_bankrupt = true;
    player_state.needs_bankruptcy_check = false;

    // Transfer all remaining cash to the bank
    let remaining_cash = player_state.cash_balance;
    game.bank_balance = game
        .bank_balance
        .checked_add(remaining_cash)
        .ok_or(GameError::ArithmeticOverflow)?;

    player_state.cash_balance = 0;
    player_state.net_worth = 0;

    // Clear all properties owned from player state
    player_state.properties_owned.clear();

    // Clear Get Out of Jail Free cards
    player_state.get_out_of_jail_cards = 0;

    // Clear all player flags and reset position
    reset_player_state_for_bankruptcy(player_state);

    // Remove player from active game
    remove_player_from_game(game, player_index as u8)?;

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} declared bankruptcy. Liquidated ${} in assets, ${} cash transferred to bank. {} houses and {} hotels returned to bank.",
        player_pubkey,
        total_liquidation_value,
        remaining_cash,
        houses_returned,
        hotels_returned
    );

    // Check if game should end (only one player remaining)
    if game.current_players <= 1 {
        game.game_status = GameStatus::Finished;
        if game.current_players == 1 {
            // Find the remaining player and declare them winner
            if let Some(&winner_pubkey) = game.players.iter().find(|&&p| p != Pubkey::default()) {
                game.winner = Some(winner_pubkey);
                msg!("Game ended. Winner: {}", winner_pubkey);
            }
        }
    } else {
        // Advance to next player's turn
        if game.current_turn >= game.current_players {
            game.current_turn = 0;
        }
    }

    Ok(())
}

fn calculate_building_liquidation_value(property_state: &PropertyState) -> Result<u64> {
    let mut value = 0u64;

    // Houses sell for half their cost
    if property_state.houses > 0 {
        let house_value = (property_state.house_cost as u64 / 2) * property_state.houses as u64;
        value = value
            .checked_add(house_value)
            .ok_or(GameError::ArithmeticOverflow)?;
    }

    // Hotels sell for half their cost (hotel cost = house_cost * 5)
    if property_state.has_hotel {
        let hotel_value = (property_state.house_cost as u64 * 5) / 2;
        value = value
            .checked_add(hotel_value)
            .ok_or(GameError::ArithmeticOverflow)?;
    }

    Ok(value)
}

fn reset_player_state_for_bankruptcy(player_state: &mut PlayerState) {
    // Clear all pending actions
    player_state.needs_property_action = false;
    player_state.pending_property_position = None;
    player_state.needs_chance_card = false;
    player_state.needs_community_chest_card = false;
    player_state.needs_special_space_action = false;
    player_state.pending_special_space_position = None;
    player_state.needs_bankruptcy_check = false;

    // Reset position and jail status
    player_state.position = 0; // Or move to a "bankrupt" position
    player_state.in_jail = false;
    player_state.jail_turns = 0;
    player_state.doubles_count = 0;
    player_state.has_rolled_dice = false;

    // Reset other tracking fields
    player_state.last_dice_roll = [0, 0];
    player_state.last_rent_collected = 0;
    player_state.festival_boost_turns = 0;
    player_state.card_drawn_at = None;
}

fn remove_player_from_game(game: &mut GameState, player_index: u8) -> Result<()> {
    // Remove player from the players array by setting to default
    if (player_index as usize) < game.players.len() {
        game.players[player_index as usize] = Pubkey::default();
    }

    // Decrease current players count
    game.current_players = game
        .current_players
        .checked_sub(1)
        .ok_or(GameError::ArithmeticUnderflow)?;

    // Adjust current_turn if necessary
    if game.current_turn >= game.current_players && game.current_players > 0 {
        game.current_turn = 0;
    }

    msg!(
        "Player at index {} removed from game. Remaining players: {}",
        player_index,
        game.current_players
    );

    Ok(())
}
