use crate::error::GameError;
use crate::state::*;
use crate::{constants::*, ID};
use anchor_lang::prelude::*;
// use ephemeral_vrf_sdk::anchor::vrf;
// use ephemeral_vrf_sdk::instructions::create_request_randomness_ix;
// use ephemeral_vrf_sdk::types::SerializableAccountMeta;

// #[vrf]
#[derive(Accounts)]
pub struct RollDice<'info> {
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
        bump
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(mut)]
    pub player: Signer<'info>,

    /// CHECK: This is the recent blockhashes sysvar
    #[account(address = anchor_lang::solana_program::sysvar::recent_blockhashes::ID)]
    pub recent_blockhashes: UncheckedAccount<'info>,

    pub clock: Sysvar<'info, Clock>,
    // /// CHECK: The oracle queue
    // #[account(mut, address = ephemeral_vrf_sdk::consts::DEFAULT_EPHEMERAL_QUEUE)]
    // pub oracle_queue: AccountInfo<'info>,
}

pub fn roll_dice_handler(
    ctx: Context<RollDice>,
    dice_roll: Option<[u8; 2]>,
    seed: u8,
) -> Result<()> {
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

    // Check if player has already rolled dice this turn
    if player_state.has_rolled_dice {
        return Err(GameError::AlreadyRolledDice.into());
    }

    // Check if player is in jail
    if player_state.in_jail {
        return handle_jail_dice_roll(game, player_state, clock);
    }

    // Generate secure random dice roll using recent blockhash
    let dice_roll = dice_roll.unwrap_or_else(|| {
        generate_dice_roll(&ctx.accounts.recent_blockhashes, clock.unix_timestamp).unwrap()
    });

    // Update player state
    player_state.has_rolled_dice = true;
    player_state.last_dice_roll = dice_roll;
    game.turn_started_at = clock.unix_timestamp;

    // Check for doubles
    let is_doubles = dice_roll[0] == dice_roll[1];
    if is_doubles {
        player_state.doubles_count += 1;

        // Three doubles in a row sends player to jail
        if player_state.doubles_count >= 3 {
            send_player_to_jail(player_state);
            msg!(
                "Player {} rolled three doubles and goes to jail!",
                player_pubkey
            );
            return Ok(());
        }

        msg!(
            "Player {} rolled doubles ({}, {})! Gets another turn.",
            player_pubkey,
            dice_roll[0],
            dice_roll[1]
        );
    } else {
        // Reset doubles count if not doubles
        player_state.doubles_count = 0;
    }

    msg!(
        "Player {} rolled: {} and {}",
        player_pubkey,
        dice_roll[0],
        dice_roll[1]
    );

    // Calculate movement
    let dice_sum = dice_roll[0] + dice_roll[1];
    let old_position = player_state.position;
    let new_position = (old_position + dice_sum) % BOARD_SIZE;

    // Check if player passed GO
    if new_position < old_position {
        player_state.cash_balance += GO_SALARY as u64;

        // Emit event for frontend
        emit!(PlayerPassedGo {
            player: player_pubkey,
            game: game.key(),
            salary_collected: GO_SALARY as u64,
            new_position,
            timestamp: clock.unix_timestamp,
        });

        msg!(
            "Player {} passed GO and collected ${}",
            player_pubkey,
            GO_SALARY
        );
    }

    // Update player position
    player_state.position = new_position;

    // Process space action based on landing position
    handle_space_landing(player_state, new_position)?;

    msg!(
        "Player {} rolled: {} and {} - moved from {} to {}",
        player_pubkey,
        dice_roll[0],
        dice_roll[1],
        old_position,
        new_position
    );

    // {
    //     msg!("Requesting randomness...");

    //     let ix = create_request_randomness_ix(
    //         ephemeral_vrf_sdk::instructions::RequestRandomnessParams {
    //             payer: ctx.accounts.player.key(),
    //             oracle_queue: ctx.accounts.oracle_queue.key(),
    //             callback_program_id: ID,
    //             callback_discriminator: crate::instruction::CallbackRollDice::DISCRIMINATOR
    //                 .to_vec(),
    //             caller_seed: [seed; 32],
    //             // Specify any account that is required by the callback
    //             accounts_metas: Some(vec![SerializableAccountMeta {
    //                 pubkey: ctx.accounts.player.key(),
    //                 is_signer: false,
    //                 is_writable: true,
    //             }]),
    //             ..Default::default()
    //         },
    //     );

    //     ctx.accounts
    //         .invoke_signed_vrf(&ctx.accounts.player.to_account_info(), &ix)?;

    //     msg!("Randomness request sent with seed: {}", seed);
    // }

    Ok(())
}

pub fn test_dice_handler(ctx: Context<RollDice>, dice_roll: Option<[u8; 2]>) -> Result<()> {
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

    // Check if player has already rolled dice this turn
    if player_state.has_rolled_dice {
        return Err(GameError::AlreadyRolledDice.into());
    }

    // Check if player is in jail
    if player_state.in_jail {
        return handle_jail_dice_roll(game, player_state, clock);
    }

    // Generate secure random dice roll using recent blockhash
    let dice_roll = dice_roll.unwrap_or_else(|| {
        generate_dice_roll(&ctx.accounts.recent_blockhashes, clock.unix_timestamp).unwrap()
    });

    // Update player state
    // player_state.has_rolled_dice = true;
    player_state.last_dice_roll = dice_roll;
    // game.turn_started_at = clock.unix_timestamp;

    // Check for doubles
    let is_doubles = dice_roll[0] == dice_roll[1];
    if is_doubles {
        player_state.doubles_count += 1;

        // Three doubles in a row sends player to jail
        if player_state.doubles_count >= 3 {
            send_player_to_jail(player_state);
            msg!(
                "Player {} rolled three doubles and goes to jail!",
                player_pubkey
            );
            return Ok(());
        }

        msg!(
            "Player {} rolled doubles ({}, {})! Gets another turn.",
            player_pubkey,
            dice_roll[0],
            dice_roll[1]
        );
    } else {
        // Reset doubles count if not doubles
        player_state.doubles_count = 0;
    }

    msg!(
        "Player {} rolled: {} and {}",
        player_pubkey,
        dice_roll[0],
        dice_roll[1]
    );

    // Calculate movement
    let dice_sum = dice_roll[0] + dice_roll[1];
    let old_position = player_state.position;
    let new_position = (old_position + dice_sum) % BOARD_SIZE;

    // Check if player passed GO
    // if new_position < old_position {
    //     player_state.cash_balance += GO_SALARY as u64;
    //     msg!(
    //         "Player {} passed GO and collected ${}",
    //         player_pubkey,
    //         GO_SALARY
    //     );
    // }

    // // Update player position
    // player_state.position = new_position;

    // // Process space action based on landing position
    // handle_space_landing(player_state, new_position)?;

    msg!(
        "Player {} rolled: {} and {} - moved from {} to {}",
        player_pubkey,
        dice_roll[0],
        dice_roll[1],
        old_position,
        new_position
    );

    Ok(())
}

fn generate_dice_roll(recent_blockhashes: &UncheckedAccount, timestamp: i64) -> Result<[u8; 2]> {
    // Get recent blockhash data for randomness
    let data = recent_blockhashes.try_borrow_data()?;

    // Use a combination of blockhash and timestamp for randomness
    let mut seed_bytes = [0u8; 32];

    // Take first 24 bytes from recent blockhash data
    if data.len() >= 24 {
        seed_bytes[..24].copy_from_slice(&data[..24]);
    }

    // Add timestamp to last 8 bytes
    let timestamp_bytes = timestamp.to_le_bytes();
    seed_bytes[24..].copy_from_slice(&timestamp_bytes);

    // Generate two dice values (1-6)
    let dice1 = ((seed_bytes[0] as u16 + seed_bytes[8] as u16 + seed_bytes[16] as u16) % 6) + 1;
    let dice2 = ((seed_bytes[1] as u16 + seed_bytes[9] as u16 + seed_bytes[17] as u16) % 6) + 1;

    Ok([dice1 as u8, dice2 as u8])
}

fn handle_jail_dice_roll(
    game: &mut GameState,
    player_state: &mut PlayerState,
    clock: &Sysvar<Clock>,
) -> Result<()> {
    // Player has been in jail, increment jail turns
    player_state.jail_turns += 1;

    // Generate dice roll for jail escape attempt
    let dice_roll = [1, 1]; // Placeholder - would use same random generation
    player_state.last_dice_roll = dice_roll;
    player_state.has_rolled_dice = true;

    let is_doubles = dice_roll[0] == dice_roll[1];

    if is_doubles {
        // Doubles gets player out of jail
        player_state.in_jail = false;
        player_state.jail_turns = 0;
        player_state.doubles_count = 1; // Count this as first double

        msg!("Player rolled doubles and escaped jail!");
    } else if player_state.jail_turns >= MAX_JAIL_TURNS {
        // Must pay fine after max turns
        if player_state.cash_balance >= JAIL_FINE as u64 {
            player_state.cash_balance -= JAIL_FINE as u64;
            player_state.in_jail = false;
            player_state.jail_turns = 0;

            msg!("Player paid jail fine and is released!");
        } else {
            return Err(GameError::InsufficientFunds.into());
        }
    } else {
        msg!("Player remains in jail. Turn {}/3", player_state.jail_turns);
    }

    game.turn_started_at = clock.unix_timestamp;
    Ok(())
}

fn send_player_to_jail(player_state: &mut PlayerState) {
    player_state.position = JAIL_POSITION;
    player_state.in_jail = true;
    player_state.jail_turns = 0;
    player_state.doubles_count = 0;
}

// Space landing logic will be handled by separate instructions
// This function is simplified for now
fn handle_space_landing(player_state: &mut PlayerState, position: u8) -> Result<()> {
    let property_data = get_property_data(position);

    match property_data {
        Some(data) => {
            match data.property_type {
                0 | 1 | 2 => {
                    // Street property, Railroad, Utility
                    player_state.needs_property_action = true;
                    player_state.pending_property_position = Some(position);
                }
                // 0 => {
                //     // Street property
                //     // Set flag for property interaction needed
                //     player_state.needs_property_action = true;
                //     player_state.pending_property_position = Some(position);
                // }
                // 1 => {
                //     // Railroad
                //     player_state.needs_property_action = true;
                //     player_state.pending_property_position = Some(position);
                // }
                // 2 => {
                //     // Utility
                //     player_state.needs_property_action = true;
                //     player_state.pending_property_position = Some(position);
                // }
                3 => {
                    // Special space
                    // player_state.needs_special_space_action = true;
                    // player_state.pending_special_space_position = Some(position);
                    // Special space
                    handle_special_space(player_state, position)?;
                }
                _ => {}
            }
        }
        None => return Err(GameError::InvalidBoardPosition.into()),
    }

    Ok(())
}

fn handle_special_space(player_state: &mut PlayerState, position: u8) -> Result<()> {
    match position {
        GO_POSITION => {
            // Already handled in movement
        }
        JAIL_POSITION => {
            // Just visiting jail, no action needed
            // player_state.in_jail = true;
            // player_state.jail_turns = 0;
            // player_state.doubles_count = 0;
        }
        GO_TO_JAIL_POSITION => {
            send_player_to_jail(player_state);
        }
        MEV_TAX_POSITION | PRIORITY_FEE_TAX_POSITION => {
            player_state.needs_special_space_action = true;
            player_state.pending_special_space_position = Some(position);
        }
        // MEV_TAX_POSITION => {
        //     // Deduct MEV tax
        //     if player_state.cash_balance >= MEV_TAX as u64 {
        //         player_state.cash_balance -= MEV_TAX as u64;
        //     } else {
        //         // Handle insufficient funds - bankruptcy check needed
        //         player_state.needs_bankruptcy_check = true;
        //     }
        // }
        // PRIORITY_FEE_TAX_POSITION => {
        //     if player_state.cash_balance >= PRIORITY_FEE_TAX as u64 {
        //         player_state.cash_balance -= PRIORITY_FEE_TAX as u64;
        //     } else {
        //         player_state.needs_bankruptcy_check = true;
        //     }
        // }
        pos if CHANCE_POSITIONS.contains(&pos) => {
            player_state.needs_chance_card = true;
        }
        pos if COMMUNITY_CHEST_POSITIONS.contains(&pos) => {
            player_state.needs_community_chest_card = true;
        }
        FREE_PARKING_POSITION => {
            // Free parking - no action
            // player_state.needs_special_space_action = true;
            // player_state.pending_special_space_position = Some(position);
        }
        _ => {}
    }
    Ok(())
}

#[derive(Accounts)]
pub struct PayJailFine<'info> {
    #[account(
        mut,
        // seeds = [b"game", game.authority.as_ref(), &game.game_id.to_le_bytes().as_ref()],
        seeds = [b"game", game.config_id.as_ref(), &game.game_id.to_le_bytes().as_ref()],
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

pub fn pay_jail_fine_handler(ctx: Context<PayJailFine>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Verify player is in jail
    if !player_state.in_jail {
        return Err(GameError::PlayerNotInJail.into());
    }

    // Check if player has enough money
    if player_state.cash_balance < JAIL_FINE as u64 {
        return Err(GameError::InsufficientFunds.into());
    }

    // Pay fine and release from jail
    player_state.cash_balance -= JAIL_FINE as u64;
    player_state.in_jail = false;
    player_state.jail_turns = 0;

    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} paid ${} jail fine and is released!",
        player_pubkey,
        JAIL_FINE
    );

    Ok(())
}

#[derive(Accounts)]
pub struct CallbackRollDiceCtx<'info> {
    /// This check ensure that the vrf_program_identity (which is a PDA) is a singer
    /// enforcing the callback is executed by the VRF program trough CPI
    #[account(address = ephemeral_vrf_sdk::consts::VRF_PROGRAM_IDENTITY)]
    pub vrf_program_identity: Signer<'info>,

    #[account(mut)]
    pub player: Signer<'info>,
}

pub fn callback_roll_dice(ctx: Context<CallbackRollDiceCtx>, randomness: [u8; 32]) -> Result<()> {
    let roll = ephemeral_vrf_sdk::rnd::random_u8_with_range(&randomness, 1, 101);
    msg!("Roll: {}", roll);

    Ok(())
}
