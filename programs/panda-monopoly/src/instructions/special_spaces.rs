use crate::error::GameError;
use crate::{generate_random_seed, state::*};
use crate::{constants::*, generate_card_index};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct GoToJail<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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

pub fn go_to_jail_handler(ctx: Context<GoToJail>) -> Result<()> {
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

    // Check if player has rolled dice this turn
    if !player_state.has_rolled_dice {
        return Err(GameError::HasNotRolledDice.into());
    }

    // Send player to jail
    player_state.in_jail = true;
    player_state.position = JAIL_POSITION;
    player_state.jail_turns = 0;
    player_state.doubles_count = 0; // Reset doubles count when going to jail

    // Clear any pending actions since player is going to jail
    player_state.needs_property_action = false;
    player_state.pending_property_position = None;
    player_state.needs_special_space_action = false;
    player_state.pending_special_space_position = None;

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} has been sent to jail at position {}!",
        player_pubkey,
        JAIL_POSITION
    );

    Ok(())
}

// -----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct PayTax<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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

pub fn pay_income_tax_handler(ctx: Context<PayTax>) -> Result<()> {
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

    // Verify player is at the income tax position
    if player_state.position != INCOME_TAX_POSITION {
        return Err(GameError::InvalidBoardPosition.into());
    }

    // Check if player has sufficient funds to pay income tax
    if player_state.cash_balance >= INCOME_TAX as u64 {
        // Deduct income tax from player's cash balance
        player_state.cash_balance = player_state
            .cash_balance
            .checked_sub(INCOME_TAX as u64)
            .ok_or(GameError::ArithmeticUnderflow)?;

        // Clear any pending special space action
        player_state.needs_special_space_action = false;
        player_state.pending_special_space_position = None;

        msg!(
            "Player {} paid income tax of ${}",
            player_pubkey,
            INCOME_TAX
        );
    } else {
        // Player doesn't have enough money - trigger bankruptcy check
        player_state.needs_bankruptcy_check = true;

        msg!(
            "Player {} cannot afford income tax of ${}. Bankruptcy check required.",
            player_pubkey,
            INCOME_TAX
        );

        return Err(GameError::InsufficientFunds.into());
    }

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    Ok(())
}

// -----------------------------------------------------------------------------

pub fn pay_luxury_tax_handler(ctx: Context<PayTax>) -> Result<()> {
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

    // Verify player is at the luxury tax position
    if player_state.position != LUXURY_TAX_POSITION {
        return Err(GameError::InvalidBoardPosition.into());
    }

    // Check if player has sufficient funds to pay luxury tax
    if player_state.cash_balance >= LUXURY_TAX as u64 {
        // Deduct luxury tax from player's cash balance
        player_state.cash_balance = player_state
            .cash_balance
            .checked_sub(LUXURY_TAX as u64)
            .ok_or(GameError::ArithmeticUnderflow)?;

        // Clear any pending special space action
        player_state.needs_special_space_action = false;
        player_state.pending_special_space_position = None;

        msg!(
            "Player {} paid luxury tax of ${}",
            player_pubkey,
            LUXURY_TAX
        );
    } else {
        // Player doesn't have enough money - trigger bankruptcy check
        player_state.needs_bankruptcy_check = true;

        msg!(
            "Player {} cannot afford luxury tax of ${}. Bankruptcy check required.",
            player_pubkey,
            LUXURY_TAX
        );

        return Err(GameError::InsufficientFunds.into());
    }

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    Ok(())
}

// -----------------------------------------------------------------------------
#[derive(Accounts)]
pub struct DrawChanceCard<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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
}

pub fn draw_chance_card_handler(ctx: Context<DrawChanceCard>) -> Result<()> {
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

    // Check if player needs to draw a chance card
    if !player_state.needs_chance_card {
        return Err(GameError::InvalidSpecialSpaceAction.into());
    }

    // Generate random card index using recent blockhash
    let card_index = generate_card_index(
        &ctx.accounts.recent_blockhashes,
        clock.unix_timestamp,
        CHANCE_CARDS.len(),
    )?;
    let card = &CHANCE_CARDS[card_index];

    // Execute card effect
    execute_chance_card_effect(game, player_state, card)?;

    // Clear the chance card requirement
    player_state.needs_chance_card = false;

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} drew Chance card: {}",
        player_pubkey,
        card.description
    );

    Ok(())
}

#[derive(Accounts)]
pub struct DrawCommunityChestCard<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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
}

pub fn draw_community_chest_card_handler(ctx: Context<DrawCommunityChestCard>) -> Result<()> {
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

    // Check if player needs to draw a community chest card
    if !player_state.needs_community_chest_card {
        return Err(GameError::InvalidSpecialSpaceAction.into());
    }

    // Generate random card index using recent blockhash
    let card_index = generate_card_index(
        &ctx.accounts.recent_blockhashes,
        clock.unix_timestamp,
        COMMUNITY_CHEST_CARDS.len(),
    )?;
    let card = &COMMUNITY_CHEST_CARDS[card_index];

    // Execute card effect
    execute_community_chest_card_effect(game, player_state, card)?;

    // Clear the community chest card requirement
    player_state.needs_community_chest_card = false;

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} drew Community Chest card: {}",
        player_pubkey,
        card.description
    );

    Ok(())
}

// Helper function to execute chance card effects
fn execute_chance_card_effect(
    game: &mut GameState,
    player_state: &mut PlayerState,
    card: &ChanceCard,
) -> Result<()> {
    match card.effect_type {
        CardEffectType::Money => {
            if card.amount > 0 {
                player_state.cash_balance += card.amount as u64;
            } else {
                let deduction = (-card.amount) as u64;
                if player_state.cash_balance >= deduction {
                    player_state.cash_balance -= deduction;
                } else {
                    player_state.cash_balance = 0;
                    player_state.needs_bankruptcy_check = true;
                }
            }
        }
        CardEffectType::Move => {
            let new_position = if card.amount < 0 {
                // Handle "Go Back 3 Spaces" type cards
                let current_pos = player_state.position as i32;
                let new_pos = current_pos + card.amount;
                if new_pos < 0 {
                    (40 + new_pos) as u8
                } else {
                    new_pos as u8
                }
            } else {
                card.amount as u8
            };

            let old_position = player_state.position;

            // Check if passing GO (only for forward movement)
            if card.amount >= 0 && (new_position < old_position || new_position == 0) {
                player_state.cash_balance += GO_SALARY as u64;
            }

            player_state.position = new_position;

            // Set flags for handling the new space
            if is_property_purchasable(new_position) {
                player_state.needs_property_action = true;
                player_state.pending_property_position = Some(new_position);
            } else {
                player_state.needs_special_space_action = true;
                player_state.pending_special_space_position = Some(new_position);
            }
        }
        CardEffectType::GoToJail => {
            player_state.position = JAIL_POSITION;
            player_state.in_jail = true;
            player_state.jail_turns = 0;
            player_state.doubles_count = 0;

            // Clear any pending actions since player is going to jail
            player_state.needs_property_action = false;
            player_state.pending_property_position = None;
            player_state.needs_special_space_action = false;
            player_state.pending_special_space_position = None;
        }
        CardEffectType::GetOutOfJailFree => {
            player_state.get_out_of_jail_cards += 1;
        }
        CardEffectType::PayPerProperty => {
            // Calculate repair costs: $25 per house, $100 per hotel
            let mut total_cost = 0u64;

            // Count houses and hotels owned by player
            for &property_pos in &player_state.properties_owned {
                if let Some(property_data) = get_property_data(property_pos) {
                    if property_data.property_type == 0 {
                        // Street property
                        // This would need access to PropertyState to count actual houses/hotels
                        // For now, we'll use a simplified calculation
                        total_cost += 25; // Assume 1 house per property for simplification
                    }
                }
            }

            if player_state.cash_balance >= total_cost {
                player_state.cash_balance -= total_cost;
            } else {
                player_state.cash_balance = 0;
                player_state.needs_bankruptcy_check = true;
            }
        }
        CardEffectType::CollectFromPlayers => {
            // Collect money from all other players
            let amount_per_player = card.amount as u64;
            let total_players = game.players.len() as u64;
            let total_collected = amount_per_player * (total_players - 1); // Exclude current player

            player_state.cash_balance += total_collected;

            // Note: In a full implementation, you'd need to deduct from other players
            // This would require iterating through all player states
        }
    }

    Ok(())
}

// Helper function to execute community chest card effects
fn execute_community_chest_card_effect(
    game: &mut GameState,
    player_state: &mut PlayerState,
    card: &CommunityChestCard,
) -> Result<()> {
    match card.effect_type {
        CardEffectType::Money => {
            if card.amount > 0 {
                player_state.cash_balance += card.amount as u64;
            } else {
                let deduction = (-card.amount) as u64;
                if player_state.cash_balance >= deduction {
                    player_state.cash_balance -= deduction;
                } else {
                    player_state.cash_balance = 0;
                    player_state.needs_bankruptcy_check = true;
                }
            }
        }
        CardEffectType::Move => {
            let new_position = card.amount as u8;
            let old_position = player_state.position;

            // Check if passing GO
            if new_position < old_position || new_position == 0 {
                player_state.cash_balance += GO_SALARY as u64;
            }

            player_state.position = new_position;

            // Set flags for handling the new space
            if is_property_purchasable(new_position) {
                player_state.needs_property_action = true;
                player_state.pending_property_position = Some(new_position);
            } else {
                player_state.needs_special_space_action = true;
                player_state.pending_special_space_position = Some(new_position);
            }
        }
        CardEffectType::GoToJail => {
            player_state.position = JAIL_POSITION;
            player_state.in_jail = true;
            player_state.jail_turns = 0;
            player_state.doubles_count = 0;

            // Clear any pending actions since player is going to jail
            player_state.needs_property_action = false;
            player_state.pending_property_position = None;
            player_state.needs_special_space_action = false;
            player_state.pending_special_space_position = None;
        }
        CardEffectType::GetOutOfJailFree => {
            player_state.get_out_of_jail_cards += 1;
        }
        CardEffectType::PayPerProperty => {
            // Calculate street repair costs: $40 per house, $115 per hotel
            let mut total_cost = 0u64;

            // Count houses and hotels owned by player
            for &property_pos in &player_state.properties_owned {
                if let Some(property_data) = get_property_data(property_pos) {
                    if property_data.property_type == 0 {
                        // Street property
                        // This would need access to PropertyState to count actual houses/hotels
                        // For now, we'll use a simplified calculation
                        total_cost += 40; // Assume 1 house per property for simplification
                    }
                }
            }

            if player_state.cash_balance >= total_cost {
                player_state.cash_balance -= total_cost;
            } else {
                player_state.cash_balance = 0;
                player_state.needs_bankruptcy_check = true;
            }
        }
        CardEffectType::CollectFromPlayers => {
            // Collect money from all other players (birthday card)
            let amount_per_player = card.amount as u64;
            let total_players = game.players.len() as u64;
            let total_collected = amount_per_player * (total_players - 1); // Exclude current player

            player_state.cash_balance += total_collected;

            // Note: In a full implementation, you'd need to deduct from other players
            // This would require iterating through all player states
        }
    }

    Ok(())
}

// -----------------------------------------------------------------------------
#[derive(Accounts)]
pub struct CollectFreeParking<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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

pub fn collect_free_parking_handler(ctx: Context<CollectFreeParking>) -> Result<()> {
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

    // Check if player has rolled dice this turn
    if !player_state.has_rolled_dice {
        return Err(GameError::HasNotRolledDice.into());
    }

    // Verify player is at Free Parking position
    if player_state.position != FREE_PARKING_POSITION {
        return Err(GameError::InvalidBoardPosition.into());
    }

    // Collect the free parking bonus (accumulated taxes and fees)
    let bonus_amount = game.free_parking_pool;
    player_state.cash_balance = player_state
        .cash_balance
        .checked_add(bonus_amount as u64)
        .ok_or(GameError::ArithmeticOverflow)?;

    // Reset the free parking pool
    game.free_parking_pool = 0;

    // Clear pending special space action
    player_state.needs_special_space_action = false;
    player_state.pending_special_space_position = None;

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} collected ${} from Free Parking!",
        player_pubkey,
        bonus_amount
    );

    Ok(())
}

// -------------------------------------------------------------
#[derive(Accounts)]
pub struct VisitBeachResort<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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

pub fn visit_beach_resort_handler(ctx: Context<VisitBeachResort>) -> Result<()> {
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

    // Check if player has rolled dice this turn
    if !player_state.has_rolled_dice {
        return Err(GameError::HasNotRolledDice.into());
    }

    // Verify player is at Beach Resort position
    if player_state.position != BEACH_RESORT_POSITION {
        return Err(GameError::InvalidBoardPosition.into());
    }

    // Calculate bonus based on properties owned
    let properties_owned = player_state.properties_owned.len() as u32;
    let bonus_amount = properties_owned * BEACH_RESORT_BONUS_PER_PROPERTY;

    player_state.cash_balance = player_state
        .cash_balance
        .checked_add(bonus_amount as u64)
        .ok_or(GameError::ArithmeticOverflow)?;

    // Clear pending special space action
    player_state.needs_special_space_action = false;
    player_state.pending_special_space_position = None;

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} visited Beach Resort and earned ${} (${} per property x {} properties)!",
        player_pubkey,
        bonus_amount,
        BEACH_RESORT_BONUS_PER_PROPERTY,
        properties_owned
    );

    Ok(())
}

// -----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct AttendFestival<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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
}

pub fn attend_festival_handler(ctx: Context<AttendFestival>) -> Result<()> {
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

    // Check if player has rolled dice this turn
    if !player_state.has_rolled_dice {
        return Err(GameError::HasNotRolledDice.into());
    }

    // Verify player is at Festival position
    if player_state.position != FESTIVAL_POSITION {
        return Err(GameError::InvalidBoardPosition.into());
    }

    // Generate random festival effect
    let random_seed = generate_random_seed(&ctx.accounts.recent_blockhashes, clock.unix_timestamp)?;
    let effect_index = (random_seed % FESTIVAL_EFFECTS.len() as u64) as usize;
    let festival_effect = &FESTIVAL_EFFECTS[effect_index];
    
    // Apply the festival effect
    if festival_effect.is_positive {
        player_state.cash_balance = player_state.cash_balance
            .checked_add(festival_effect.amount as u64)
            .ok_or(GameError::ArithmeticOverflow)?;
    } else {
        if player_state.cash_balance >= festival_effect.amount as u64 {
            player_state.cash_balance -= festival_effect.amount as u64;
        } else {
            player_state.cash_balance = 0;
        }
    }
    
    // Clear pending special space action
    player_state.needs_special_space_action = false;
    player_state.pending_special_space_position = None;
    
    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} attended festival: {} - ${}{}",
        player_pubkey,
        festival_effect.description,
        if festival_effect.is_positive { "+" } else { "-" },
        festival_effect.amount
    );

    Ok(())
}

// -----------------------------------------------------------------------------

#[derive(Accounts)]
pub struct CollectGo<'info> {
    #[account(
        mut,
        seeds = [b"game", game.authority.as_ref()],
        bump,
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

pub fn collect_go_handler(ctx: Context<CollectGo>) -> Result<()> {
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

    // Check if player has rolled dice this turn
    if !player_state.has_rolled_dice {
        return Err(GameError::HasNotRolledDice.into());
    }

    // Verify player is at GO position
    if player_state.position != GO_POSITION {
        return Err(GameError::InvalidBoardPosition.into());
    }

    // Collect GO salary
    player_state.cash_balance = player_state.cash_balance
        .checked_add(GO_SALARY as u64)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    // Clear pending special space action
    player_state.needs_special_space_action = false;
    player_state.pending_special_space_position = None;
    
    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} collected ${} from landing on GO!",
        player_pubkey,
        GO_SALARY
    );

    Ok(())
}
