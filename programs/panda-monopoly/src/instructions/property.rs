use crate::constants::*;
use crate::error::GameError;
use crate::state::*;
use crate::utils::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(position: u8)]
pub struct BuyProperty<'info> {
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

    #[account(
        init_if_needed,
        payer = player,
        space = 8 + PropertyState::INIT_SPACE,
        seeds = [b"property", game.key().as_ref(), position.to_le_bytes().as_ref()],
        bump
    )]
    pub property_state: Account<'info, PropertyState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn buy_property_handler(ctx: Context<BuyProperty>, position: u8) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let property_state = &mut ctx.accounts.property_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the player's turn
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Validate player is at the property position
    if player_state.position != position {
        return Err(GameError::InvalidPropertyPosition.into());
    }

    // Validate position is a purchasable property
    if !is_property_purchasable(position) {
        return Err(GameError::PropertyNotPurchasable.into());
    }

    // Get property data from constants
    let property_data = get_property_data(position).ok_or(GameError::InvalidPropertyPosition)?;

    // Check if property is already owned
    if property_state.owner.is_some() {
        return Err(GameError::PropertyAlreadyOwned.into());
    }

    // Check if player has enough money
    if player_state.cash_balance < property_data.price {
        return Err(GameError::InsufficientFunds.into());
    }

    // Initialize property state if needed
    if property_state.position == 0 {
        // Not initialized
        property_state.position = position;
        property_state.price = property_data.price as u16;
        property_state.color_group = match property_data.color_group {
            1 => ColorGroup::Brown,
            2 => ColorGroup::LightBlue,
            3 => ColorGroup::Pink,
            4 => ColorGroup::Orange,
            5 => ColorGroup::Red,
            6 => ColorGroup::Yellow,
            7 => ColorGroup::Green,
            8 => ColorGroup::DarkBlue,
            9 => ColorGroup::Railroad,
            10 => ColorGroup::Utility,
            _ => ColorGroup::Special,
        };
        property_state.property_type = match property_data.property_type {
            0 => PropertyType::Street,
            1 => PropertyType::Railroad,
            2 => PropertyType::Utility,
            _ => PropertyType::Property,
        };
        property_state.houses = 0;
        property_state.has_hotel = false;
        property_state.is_mortgaged = false;
        property_state.rent_base = property_data.rent[0] as u16;
        property_state.rent_with_color_group = (property_data.rent[0] * 2) as u16;
        property_state.rent_with_houses = [
            property_data.rent[1] as u16,
            property_data.rent[2] as u16,
            property_data.rent[3] as u16,
            property_data.rent[4] as u16,
        ];
        property_state.rent_with_hotel = property_data.rent[5] as u16;
        property_state.house_cost = property_data.house_cost as u16;
        property_state.mortgage_value = property_data.mortgage_value as u16;
        property_state.last_rent_paid = 0;
    }

    // Transfer ownership
    property_state.owner = Some(player_pubkey);

    // Deduct money from player
    player_state.cash_balance = player_state
        .cash_balance
        .checked_sub(property_data.price)
        .ok_or(GameError::ArithmeticUnderflow)?;

    // Add property to player's owned properties
    if !player_state.properties_owned.contains(&position) {
        player_state.properties_owned.push(position);
    }

    // Update player's net worth
    player_state.net_worth = player_state
        .net_worth
        .checked_add(property_data.price)
        .ok_or(GameError::ArithmeticOverflow)?;

    // Clear property action flag
    player_state.needs_property_action = false;
    player_state.pending_property_position = None;

    // Update timestamps
    game.turn_started_at = clock.unix_timestamp;

    // In the buy_property_handler function, remove or update the msg! that references property_data.name:
    msg!(
        "Player {} purchased property at position {} for ${}",
        player_pubkey,
        position,
        property_data.price
    );

    Ok(())
}

// ---------------------------------------------------------------------------

#[derive(Accounts)]
pub struct DeclineProperty<'info> {
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

pub fn decline_property_handler(ctx: Context<DeclineProperty>, position: u8) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the player's turn
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Validate player is at the property position
    if player_state.position != position {
        return Err(GameError::InvalidPropertyPosition.into());
    }

    // Validate player has a pending property action
    if !player_state.needs_property_action {
        return Err(GameError::InvalidSpecialSpaceAction.into());
    }

    // Validate the pending property position matches
    if player_state.pending_property_position != Some(position) {
        return Err(GameError::InvalidPropertyPosition.into());
    }

    // Validate position is a purchasable property
    if !is_property_purchasable(position) {
        return Err(GameError::PropertyNotPurchasable.into());
    }

    // Get property data for logging
    let property_data = get_property_data(position).ok_or(GameError::InvalidPropertyPosition)?;

    // Clear property action flags
    player_state.needs_property_action = false;
    player_state.pending_property_position = None;

    // Allow player to end turn after declining
    // player_state.can_end_turn = true;

    // Update timestamps
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} declined to purchase property at position {} (${}) - property may go to auction",
        player_pubkey,
        position,
        property_data.price
    );

    // Note: In a full implementation, this would trigger an auction
    // The auction system would be implemented separately with its own instruction

    Ok(())
}

// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(position: u8)]
pub struct PayRent<'info> {
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
        seeds = [b"player", game.key().as_ref(), payer.key().as_ref()],
        bump
    )]
    pub payer_state: Account<'info, PlayerState>,

    #[account(
        mut,
        seeds = [b"player", game.key().as_ref(), property_owner.key().as_ref()],
        bump
    )]
    pub owner_state: Account<'info, PlayerState>,

    #[account(
        mut,
        seeds = [b"property", game.key().as_ref(), position.to_le_bytes().as_ref()],
        bump
    )]
    pub property_state: Account<'info, PropertyState>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: Property owner account - validated by property_state.owner
    pub property_owner: UncheckedAccount<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn pay_rent_handler(ctx: Context<PayRent>, position: u8) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let payer_state = &mut ctx.accounts.payer_state;
    let owner_state = &mut ctx.accounts.owner_state;
    let property_state = &mut ctx.accounts.property_state;
    let payer_pubkey = ctx.accounts.payer.key();
    let property_owner_pubkey = ctx.accounts.property_owner.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the payer's turn
    let payer_index = game
        .players
        .iter()
        .position(|&p| p == payer_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != payer_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Validate payer is at the property position
    if payer_state.position != position {
        return Err(GameError::InvalidPropertyPosition.into());
    }

    // Validate property exists and is owned
    let property_owner = property_state.owner.ok_or(GameError::PropertyNotOwned)?;
    if property_owner != property_owner_pubkey {
        return Err(GameError::InvalidPropertyOwner.into());
    }

    // Can't pay rent to yourself
    if payer_pubkey == property_owner {
        return Ok(()); // No rent payment needed
    }

    // Check if property is mortgaged (no rent if mortgaged)
    if property_state.is_mortgaged {
        return Ok(()); // No rent payment needed
    }

    // Calculate rent amount
    let rent_amount =
        calculate_rent_for_property(&property_state, &owner_state, payer_state.last_dice_roll)?;

    // Check if payer has enough money
    if payer_state.cash_balance < rent_amount {
        // Set bankruptcy check flag
        payer_state.needs_bankruptcy_check = true;
        return Err(GameError::InsufficientFunds.into());
    }

    // Transfer rent from payer to owner
    payer_state.cash_balance = payer_state
        .cash_balance
        .checked_sub(rent_amount)
        .ok_or(GameError::ArithmeticUnderflow)?;

    owner_state.cash_balance = owner_state
        .cash_balance
        .checked_add(rent_amount)
        .ok_or(GameError::ArithmeticOverflow)?;

    // Update net worth
    payer_state.net_worth = payer_state
        .net_worth
        .checked_sub(rent_amount)
        .ok_or(GameError::ArithmeticUnderflow)?;

    owner_state.net_worth = owner_state
        .net_worth
        .checked_add(rent_amount)
        .ok_or(GameError::ArithmeticOverflow)?;

    // FIXME
    payer_state.needs_property_action = false;

    // Update property rent tracking
    property_state.last_rent_paid = clock.unix_timestamp;
    owner_state.last_rent_collected = clock.unix_timestamp;

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} paid ${} rent to {} for property at position {}",
        payer_pubkey,
        rent_amount,
        property_owner,
        position
    );

    Ok(())
}

// ---------------------------------------------------------------------------
#[derive(Accounts)]
#[instruction(position: u8)]
pub struct BuildHouse<'info> {
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

    #[account(
        mut,
        seeds = [b"property", game.key().as_ref(), position.to_le_bytes().as_ref()],
        bump,
        constraint = property_state.owner == Some(player.key()) @ GameError::PropertyNotOwnedByPlayer,
        constraint = !property_state.is_mortgaged @ GameError::PropertyMortgaged,
        constraint = property_state.property_type == PropertyType::Street @ GameError::CannotBuildOnPropertyType,
        constraint = property_state.houses < MAX_HOUSES_PER_PROPERTY @ GameError::MaxHousesReached,
        constraint = !property_state.has_hotel @ GameError::PropertyHasHotel
    )]
    pub property_state: Account<'info, PropertyState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn build_house_handler(ctx: Context<BuildHouse>, position: u8) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let property_state = &mut ctx.accounts.property_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the player's turn
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Get property data
    let property_data = get_property_data(position).ok_or(GameError::InvalidPropertyPosition)?;

    // Check monopoly requirement
    if !has_monopoly_for_player(player_state, property_state.color_group) {
        return Err(GameError::DoesNotOwnColorGroup.into());
    }

    // Check even building rule
    if !can_build_evenly_for_player(
        player_state,
        property_state.color_group,
        position,
        property_state.houses + 1,
    ) {
        return Err(GameError::MustBuildEvenly.into());
    }

    // Check if enough houses available
    if game.houses_remaining == 0 {
        return Err(GameError::NotEnoughHousesInBank.into());
    }

    // Check if player has enough money
    if player_state.cash_balance < property_state.house_cost as u64 {
        return Err(GameError::InsufficientFunds.into());
    }

    // Deduct money from player
    player_state.cash_balance = player_state
        .cash_balance
        .checked_sub(property_state.house_cost as u64)
        .ok_or(GameError::ArithmeticUnderflow)?;

    // Add house to property
    property_state.houses += 1;

    // Update game state
    game.houses_remaining -= 1;
    game.turn_started_at = clock.unix_timestamp;

    // Update player's net worth
    player_state.net_worth = player_state
        .net_worth
        .checked_add(property_state.house_cost as u64)
        .ok_or(GameError::ArithmeticOverflow)?;

    msg!(
        "Player {} built a house on property {} for ${}",
        player_pubkey,
        position,
        property_state.house_cost
    );

    Ok(())
}

// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(position: u8)]
pub struct BuildHotel<'info> {
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

    #[account(
        mut,
        seeds = [b"property", game.key().as_ref(), position.to_le_bytes().as_ref()],
        bump,
        constraint = property_state.owner == Some(player.key()) @ GameError::PropertyNotOwnedByPlayer,
        constraint = !property_state.is_mortgaged @ GameError::PropertyMortgaged,
        constraint = property_state.property_type == PropertyType::Street @ GameError::CannotBuildOnPropertyType,
        constraint = property_state.houses == MAX_HOUSES_PER_PROPERTY @ GameError::InvalidHouseCount,
        constraint = !property_state.has_hotel @ GameError::PropertyHasHotel
    )]
    pub property_state: Account<'info, PropertyState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn build_hotel_handler(ctx: Context<BuildHotel>, position: u8) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let property_state = &mut ctx.accounts.property_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the player's turn
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Check monopoly requirement
    if !has_monopoly_for_player(player_state, property_state.color_group) {
        return Err(GameError::DoesNotOwnColorGroup.into());
    }

    // Check if enough hotels available
    if game.hotels_remaining == 0 {
        return Err(GameError::NotEnoughHotelsInBank.into());
    }

    // Check if player has enough money
    if player_state.cash_balance < property_state.house_cost as u64 {
        return Err(GameError::InsufficientFunds.into());
    }

    // Deduct money from player
    player_state.cash_balance = player_state
        .cash_balance
        .checked_sub(property_state.house_cost as u64)
        .ok_or(GameError::ArithmeticUnderflow)?;

    // Convert houses to hotel
    property_state.houses = 0;
    property_state.has_hotel = true;

    // Update game state - return houses to bank and take a hotel
    game.houses_remaining += MAX_HOUSES_PER_PROPERTY;
    game.hotels_remaining -= 1;
    game.turn_started_at = clock.unix_timestamp;

    // Update player's net worth
    player_state.net_worth = player_state
        .net_worth
        .checked_add(property_state.house_cost as u64)
        .ok_or(GameError::ArithmeticOverflow)?;

    msg!(
        "Player {} built a hotel on property {} for ${}",
        player_pubkey,
        position,
        property_state.house_cost
    );

    Ok(())
}

// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(position: u8, building_type: BuildingType)]
pub struct SellBuilding<'info> {
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

    #[account(
        mut,
        seeds = [b"property", game.key().as_ref(), position.to_le_bytes().as_ref()],
        bump,
        constraint = property_state.owner == Some(player.key()) @ GameError::PropertyNotOwnedByPlayer,
        constraint = property_state.property_type == PropertyType::Street @ GameError::CannotBuildOnPropertyType
    )]
    pub property_state: Account<'info, PropertyState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn sell_building_handler(
    ctx: Context<SellBuilding>,
    position: u8,
    building_type: BuildingType,
) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let property_state = &mut ctx.accounts.property_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the player's turn
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    let sale_price = property_state.house_cost as u64 / 2; // Sell at half price

    match building_type {
        BuildingType::House => {
            // Check if property has houses to sell
            if property_state.houses == 0 {
                return Err(GameError::NoHousesToSell.into());
            }

            // Check even selling rule
            if !can_sell_evenly_for_player(
                player_state,
                property_state.color_group,
                position,
                property_state.houses - 1,
            ) {
                return Err(GameError::MustSellEvenly.into());
            }

            // Sell house
            property_state.houses -= 1;
            game.houses_remaining += 1;

            msg!(
                "Player {} sold a house from property {} for ${}",
                player_pubkey,
                position,
                sale_price
            );
        }
        BuildingType::Hotel => {
            // Check if property has hotel to sell
            if !property_state.has_hotel {
                return Err(GameError::NoHotelToSell.into());
            }

            // Check if there are enough houses in bank to convert hotel back
            if game.houses_remaining < MAX_HOUSES_PER_PROPERTY {
                return Err(GameError::NotEnoughHousesInBank.into());
            }

            // Sell hotel and convert back to houses
            property_state.has_hotel = false;
            property_state.houses = MAX_HOUSES_PER_PROPERTY;
            game.hotels_remaining += 1;
            game.houses_remaining -= MAX_HOUSES_PER_PROPERTY;

            msg!(
                "Player {} sold a hotel from property {} for ${}",
                player_pubkey,
                position,
                sale_price
            );
        }
    }

    // Add money to player
    player_state.cash_balance = player_state
        .cash_balance
        .checked_add(sale_price)
        .ok_or(GameError::ArithmeticOverflow)?;

    // Update player's net worth
    player_state.net_worth = player_state
        .net_worth
        .checked_sub(sale_price)
        .ok_or(GameError::ArithmeticUnderflow)?;

    // Update timestamp
    game.turn_started_at = clock.unix_timestamp;

    Ok(())
}

// ---------------------------------------------------------------------------

#[derive(Accounts)]
#[instruction(position: u8)]
pub struct MortgageProperty<'info> {
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

    #[account(
        mut,
        seeds = [b"property", game.key().as_ref(), position.to_le_bytes().as_ref()],
        bump,
        constraint = property_state.owner == Some(player.key()) @ GameError::PropertyNotOwnedByPlayer,
        constraint = !property_state.is_mortgaged @ GameError::PropertyAlreadyMortgaged,
        constraint = property_state.houses == 0 @ GameError::CannotMortgageWithBuildings,
        constraint = !property_state.has_hotel @ GameError::CannotMortgageWithBuildings
    )]
    pub property_state: Account<'info, PropertyState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn mortgage_property_handler(ctx: Context<MortgageProperty>, position: u8) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let property_state = &mut ctx.accounts.property_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the player's turn
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Validate position is a mortgageable property
    if !is_property_purchasable(position) {
        return Err(GameError::PropertyNotPurchasable.into());
    }

    // Calculate mortgage value (half of purchase price)
    let mortgage_value = property_state.mortgage_value as u64;

    // Update property state
    property_state.is_mortgaged = true;
    property_state.last_rent_paid = clock.unix_timestamp;

    // Update player cash balance
    player_state.cash_balance += mortgage_value;
    player_state.net_worth -= mortgage_value; // Reduce net worth by mortgage value

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} mortgaged property at position {} for ${}",
        player_pubkey,
        position,
        mortgage_value
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(position: u8)]
pub struct UnmortgageProperty<'info> {
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

    #[account(
        mut,
        seeds = [b"property", game.key().as_ref(), position.to_le_bytes().as_ref()],
        bump,
        constraint = property_state.owner == Some(player.key()) @ GameError::PropertyNotOwnedByPlayer,
        constraint = property_state.is_mortgaged @ GameError::PropertyNotMortgaged
    )]
    pub property_state: Account<'info, PropertyState>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn unmortgage_property_handler(ctx: Context<UnmortgageProperty>, position: u8) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let property_state = &mut ctx.accounts.property_state;
    let player_pubkey = ctx.accounts.player.key();
    let clock = &ctx.accounts.clock;

    // Validate it's the player's turn
    let player_index = game
        .players
        .iter()
        .position(|&p| p == player_pubkey)
        .ok_or(GameError::PlayerNotFound)?;

    if game.current_turn != player_index as u8 {
        return Err(GameError::NotPlayerTurn.into());
    }

    // Validate position is a mortgageable property
    if !is_property_purchasable(position) {
        return Err(GameError::PropertyNotPurchasable.into());
    }

    // Calculate unmortgage cost (mortgage value + 10% interest)
    let mortgage_value = property_state.mortgage_value as u64;
    let interest = mortgage_value / 10; // 10% interest
    let unmortgage_cost = mortgage_value + interest;

    // Check if player has enough money
    if player_state.cash_balance < unmortgage_cost {
        return Err(GameError::InsufficientFunds.into());
    }

    // Update property state
    property_state.is_mortgaged = false;
    property_state.last_rent_paid = clock.unix_timestamp;

    // Update player cash balance and net worth
    player_state.cash_balance -= unmortgage_cost;
    player_state.net_worth += mortgage_value; // Restore net worth

    // Update game timestamp
    game.turn_started_at = clock.unix_timestamp;

    msg!(
        "Player {} unmortgaged property at position {} for ${} (mortgage: ${}, interest: ${})",
        player_pubkey,
        position,
        unmortgage_cost,
        mortgage_value,
        interest
    );

    Ok(())
}
