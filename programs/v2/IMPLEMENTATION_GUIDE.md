# Implementation Guide

This guide shows how to implement instruction handlers in the Pinocchio version.

## General Pattern

Every instruction handler follows this pattern:

```rust
fn process_<instruction_name>(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    // 1. Parse instruction data
    // 2. Get and validate accounts
    // 3. Load account state
    // 4. Validate business logic
    // 5. Update state
    // 6. (Optional) Emit events/logs
    Ok(())
}
```

## Example 1: Simple Instruction (EndTurn)

Let's implement `end_turn` - a relatively simple instruction:

```rust
fn process_end_turn(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _data: &[u8],
) -> ProgramResult {
    // 1. Parse instruction data (none for this instruction)
    
    // 2. Get accounts
    let accounts_iter = &mut accounts.iter();
    let game_account = next_account_info(accounts_iter)?;
    let player_account = next_account_info(accounts_iter)?;
    let player_authority = next_account_info(accounts_iter)?;
    let clock_account = next_account_info(accounts_iter)?;
    
    // 3. Validate accounts
    check_signer(player_authority, GameError::Unauthorized.into())?;
    check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
    check_owner(player_account, program_id, GameError::InvalidAccount.into())?;
    
    // 4. Load state
    let game = read_account_data_mut::<GameState>(game_account)?;
    let player = read_account_data_mut::<PlayerState>(player_account)?;
    
    // 5. Verify discriminators
    if game.discriminator != GAME_STATE_DISCRIMINATOR {
        return Err(GameError::InvalidAccount.into());
    }
    if player.discriminator != PLAYER_STATE_DISCRIMINATOR {
        return Err(GameError::InvalidAccount.into());
    }
    
    // 6. Validate player is in this game
    if !pubkeys_equal(&player.game, &game_account.key().as_ref()) {
        return Err(GameError::PlayerNotFound.into());
    }
    
    // 7. Validate it's the player's turn
    let current_player = &game.players[game.current_turn as usize];
    if !pubkeys_equal(current_player, &player.wallet) {
        return Err(GameError::NotPlayerTurn.into());
    }
    
    // 8. Validate player has completed all required actions
    if player.has_rolled_dice == 0 {
        return Err(GameError::HasNotRolledDice.into());
    }
    if player.needs_property_action != 0 {
        return Err(GameError::MustPayRent.into());
    }
    if player.needs_special_space_action != 0 {
        return Err(GameError::MustHandleSpecialSpace.into());
    }
    
    // 9. Get current time
    let clock = Clock::from_account_info(clock_account)?;
    
    // 10. Reset player turn state
    player.has_rolled_dice = 0;
    player.last_dice_roll = [0, 0];
    player.doubles_count = 0;
    player.needs_property_action = 0;
    player.pending_property_position_flag = 0;
    player.needs_chance_card = 0;
    player.needs_community_chest_card = 0;
    player.needs_special_space_action = 0;
    player.pending_special_space_position_flag = 0;
    
    // 11. Advance turn
    advance_turn(game)?;
    
    // 12. Update turn start time
    game.turn_started_at = clock.unix_timestamp;
    
    // 13. Log
    msg!("Turn ended for player: {:?}", player.wallet);
    
    Ok(())
}

// Helper function to advance turn
fn advance_turn(game: &mut GameState) -> ProgramResult {
    let mut attempts = 0;
    let max_attempts = game.players.len();
    
    loop {
        game.current_turn = (game.current_turn + 1) % game.max_players;
        
        // Skip eliminated players
        if game.player_eliminated[game.current_turn as usize] == 0 {
            break;
        }
        
        attempts += 1;
        if attempts >= max_attempts {
            return Err(GameError::NoActivePlayers.into());
        }
    }
    
    Ok(())
}

// Helper to get next account
fn next_account_info<'a, 'b>(
    iter: &'b mut core::slice::Iter<'a, AccountInfo>,
) -> Result<&'a AccountInfo, ProgramError> {
    iter.next().ok_or(ProgramError::NotEnoughAccountKeys)
}
```

## Example 2: Instruction with Data (BuyPropertyV2)

Now let's implement an instruction that takes parameters:

```rust
fn process_buy_property_v2(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    // 1. Parse instruction data
    if data.len() < 1 {
        return Err(ProgramError::InvalidInstructionData);
    }
    let position = data[0];
    
    // 2. Get accounts
    let accounts_iter = &mut accounts.iter();
    let game_account = next_account_info(accounts_iter)?;
    let player_account = next_account_info(accounts_iter)?;
    let player_authority = next_account_info(accounts_iter)?;
    
    // 3. Validate accounts
    check_signer(player_authority, GameError::Unauthorized.into())?;
    check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
    check_owner(player_account, program_id, GameError::InvalidAccount.into())?;
    
    // 4. Load state
    let game = read_account_data_mut::<GameState>(game_account)?;
    let player = read_account_data_mut::<PlayerState>(player_account)?;
    
    // 5. Verify discriminators
    if game.discriminator != GAME_STATE_DISCRIMINATOR {
        return Err(GameError::InvalidAccount.into());
    }
    if player.discriminator != PLAYER_STATE_DISCRIMINATOR {
        return Err(GameError::InvalidAccount.into());
    }
    
    // 6. Validate it's the player's turn
    let current_player = &game.players[game.current_turn as usize];
    if !pubkeys_equal(current_player, &player.wallet) {
        return Err(GameError::NotPlayerTurn.into());
    }
    
    // 7. Get property data
    let property_data = get_property_data(position)?;
    
    // 8. Validate property can be purchased
    if property_data.property_type != PropertyType::Street &&
       property_data.property_type != PropertyType::Railroad &&
       property_data.property_type != PropertyType::Utility {
        return Err(GameError::PropertyNotPurchasable.into());
    }
    
    // 9. Check property is unowned
    let property = &game.properties[position as usize];
    if property.owner_flag != 0 {
        return Err(GameError::PropertyAlreadyOwned.into());
    }
    
    // 10. Check player has enough money
    if player.cash_balance < property_data.price {
        return Err(GameError::InsufficientFunds.into());
    }
    
    // 11. Deduct money from player
    player.cash_balance = player.cash_balance
        .checked_sub(property_data.price)
        .ok_or(GameError::ArithmeticUnderflow)?;
    
    // 12. Add money to bank
    game.bank_balance = game.bank_balance
        .checked_add(property_data.price)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    // 13. Set property owner
    game.properties[position as usize].set_owner(Some(&player.wallet));
    
    // 14. Add to player's property list
    if (player.properties_owned_count as usize) < player.properties_owned.len() {
        player.properties_owned[player.properties_owned_count as usize] = position;
        player.properties_owned_count += 1;
    }
    
    // 15. Clear pending property action
    player.needs_property_action = 0;
    player.pending_property_position_flag = 0;
    
    // 16. Log
    msg!("Property {} purchased by player", position);
    
    Ok(())
}
```

## Example 3: Complex Instruction (StartGame)

This instruction involves multiple accounts:

```rust
fn process_start_game(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _data: &[u8],
) -> ProgramResult {
    // 1. Get accounts
    let accounts_iter = &mut accounts.iter();
    let game_account = next_account_info(accounts_iter)?;
    let creator = next_account_info(accounts_iter)?;
    let clock_account = next_account_info(accounts_iter)?;
    
    // Creator must be signer
    check_signer(creator, GameError::Unauthorized.into())?;
    check_owner(game_account, program_id, GameError::InvalidAccount.into())?;
    
    // 2. Load game state
    let game = read_account_data_mut::<GameState>(game_account)?;
    
    // 3. Verify discriminator
    if game.discriminator != GAME_STATE_DISCRIMINATOR {
        return Err(GameError::InvalidAccount.into());
    }
    
    // 4. Verify creator
    if !pubkeys_equal(&game.creator, creator.key().as_ref()) {
        return Err(GameError::Unauthorized.into());
    }
    
    // 5. Verify game status
    if game.game_status != GameStatus::WaitingForPlayers as u8 {
        return Err(GameError::GameAlreadyStarted.into());
    }
    
    // 6. Verify minimum players
    if game.current_players < MIN_PLAYERS {
        return Err(GameError::MinPlayersNotMet.into());
    }
    
    // 7. Get remaining player accounts
    // We expect player accounts for all players in the game
    let player_accounts: Vec<&AccountInfo> = accounts_iter
        .take(game.current_players as usize)
        .collect();
    
    if player_accounts.len() != game.current_players as usize {
        return Err(GameError::MissingPlayerAccount.into());
    }
    
    // 8. Initialize each player
    let clock = Clock::from_account_info(clock_account)?;
    
    for (i, player_account) in player_accounts.iter().enumerate() {
        check_owner(player_account, program_id, GameError::InvalidAccount.into())?;
        
        let player = read_account_data_mut::<PlayerState>(player_account)?;
        
        // Verify discriminator
        if player.discriminator != PLAYER_STATE_DISCRIMINATOR {
            return Err(GameError::InvalidPlayerAccount.into());
        }
        
        // Verify player is in this game
        if !pubkeys_equal(&player.game, game_account.key().as_ref()) {
            return Err(GameError::InvalidPlayerAccount.into());
        }
        
        // Initialize player state
        player.cash_balance = STARTING_MONEY as u64;
        player.position = 0;
        player.in_jail = 0;
        player.jail_turns = 0;
        player.doubles_count = 0;
        player.is_bankrupt = 0;
        player.properties_owned_count = 0;
        player.get_out_of_jail_cards = 0;
        player.net_worth = STARTING_MONEY as u64;
        player.last_rent_collected = clock.unix_timestamp;
        player.festival_boost_turns = 0;
        player.has_rolled_dice = 0;
        player.last_dice_roll = [0, 0];
        player.needs_property_action = 0;
        player.pending_property_position_flag = 0;
        player.needs_chance_card = 0;
        player.needs_community_chest_card = 0;
        player.needs_bankruptcy_check = 0;
        player.needs_special_space_action = 0;
        player.pending_special_space_position_flag = 0;
        player.card_drawn_at_flag = 0;
        player.timeout_penalty_count = 0;
        player.last_action_timestamp = clock.unix_timestamp;
        player.total_timeout_penalties = 0;
    }
    
    // 9. Initialize game state
    game.game_status = GameStatus::InProgress as u8;
    game.started_at_flag = 1;
    game.started_at = clock.unix_timestamp;
    game.current_turn = 0;
    game.turn_started_at = clock.unix_timestamp;
    game.active_players = game.current_players;
    game.total_players = game.current_players;
    
    // Initialize bank and resources
    game.bank_balance = 0;
    game.free_parking_pool = 0;
    game.houses_remaining = TOTAL_HOUSES;
    game.hotels_remaining = TOTAL_HOTELS;
    
    // Initialize properties
    game.initialize_properties();
    
    // Set game end time if time limit specified
    if game.time_limit_flag != 0 {
        game.game_end_time_flag = 1;
        game.game_end_time = clock.unix_timestamp
            .checked_add(game.time_limit)
            .ok_or(GameError::ArithmeticOverflow)?;
    }
    
    // 10. Log
    msg!("Game started with {} players", game.current_players);
    
    Ok(())
}
```

## Common Patterns

### 1. Checking if Player is in Jail

```rust
fn is_player_in_jail(player: &PlayerState) -> bool {
    player.in_jail != 0
}
```

### 2. Checking Monopoly Ownership

```rust
fn has_monopoly(
    game: &GameState,
    player_wallet: &[u8; 32],
    color_group: ColorGroup,
) -> bool {
    let group_positions = get_color_group_properties_enum(color_group);
    
    for &pos in group_positions {
        let property = &game.properties[pos as usize];
        if property.owner_flag == 0 {
            return false;
        }
        if !pubkeys_equal(&property.owner, player_wallet) {
            return false;
        }
    }
    
    true
}
```

### 3. Calculating Rent

```rust
fn calculate_rent(
    game: &GameState,
    position: u8,
    property_data: &PropertyData,
) -> Result<u64, GameError> {
    let property = &game.properties[position as usize];
    
    // Property must be owned
    if property.owner_flag == 0 {
        return Err(GameError::PropertyNotOwned);
    }
    
    // Can't collect rent on mortgaged property
    if property.is_mortgaged != 0 {
        return Ok(0);
    }
    
    match property_data.property_type {
        PropertyType::Street => {
            if property.has_hotel != 0 {
                Ok(property_data.rent[5])
            } else if property.houses > 0 {
                Ok(property_data.rent[property.houses as usize])
            } else {
                // Check for monopoly
                let owner = &property.owner;
                let has_mono = has_monopoly(game, owner, property_data.color_group);
                if has_mono {
                    Ok(property_data.rent[0] * 2)
                } else {
                    Ok(property_data.rent[0])
                }
            }
        }
        PropertyType::Railroad => {
            // Count railroads owned
            let owner = &property.owner;
            let railroad_count = count_railroads_owned(game, owner);
            Ok(property_data.rent[railroad_count - 1])
        }
        PropertyType::Utility => {
            // Utility rent depends on dice roll
            // This would need the last dice roll value
            Ok(0) // Placeholder
        }
        _ => Ok(0),
    }
}

fn count_railroads_owned(game: &GameState, owner: &[u8; 32]) -> usize {
    RAILROAD_GROUP
        .iter()
        .filter(|&&pos| {
            let prop = &game.properties[pos as usize];
            prop.owner_flag != 0 && pubkeys_equal(&prop.owner, owner)
        })
        .count()
}
```

### 4. Transfer Money Between Players

```rust
fn transfer_money(
    from_player: &mut PlayerState,
    to_player: &mut PlayerState,
    amount: u64,
) -> ProgramResult {
    if from_player.cash_balance < amount {
        return Err(GameError::InsufficientFunds.into());
    }
    
    from_player.cash_balance = from_player.cash_balance
        .checked_sub(amount)
        .ok_or(GameError::ArithmeticUnderflow)?;
    
    to_player.cash_balance = to_player.cash_balance
        .checked_add(amount)
        .ok_or(GameError::ArithmeticOverflow)?;
    
    Ok(())
}
```

### 5. Moving Player on Board

```rust
fn move_player(
    player: &mut PlayerState,
    game: &mut GameState,
    spaces: u8,
    clock_timestamp: i64,
) -> ProgramResult {
    let old_position = player.position;
    let new_position = (old_position + spaces) % BOARD_SIZE;
    
    // Check if passed GO
    if new_position < old_position {
        player.cash_balance = player.cash_balance
            .checked_add(GO_SALARY as u64)
            .ok_or(GameError::ArithmeticOverflow)?;
        
        msg!("Player passed GO, collected ${}", GO_SALARY);
    }
    
    player.position = new_position;
    
    // Handle landing on specific spaces
    handle_landing(player, game, new_position, clock_timestamp)?;
    
    Ok(())
}

fn handle_landing(
    player: &mut PlayerState,
    game: &mut GameState,
    position: u8,
    clock_timestamp: i64,
) -> ProgramResult {
    let property_data = get_property_data(position)?;
    
    match property_data.property_type {
        PropertyType::Street | PropertyType::Railroad | PropertyType::Utility => {
            // Set pending property action
            player.needs_property_action = 1;
            player.pending_property_position_flag = 1;
            player.pending_property_position = position;
        }
        PropertyType::Chance => {
            player.needs_chance_card = 1;
        }
        PropertyType::CommunityChest => {
            player.needs_community_chest_card = 1;
        }
        PropertyType::Tax => {
            player.needs_special_space_action = 1;
            player.pending_special_space_position_flag = 1;
            player.pending_special_space_position = position;
        }
        PropertyType::Corner => {
            if position == GO_TO_JAIL_POSITION {
                // Send to jail
                player.in_jail = 1;
                player.position = JAIL_POSITION;
                player.jail_turns = 0;
                msg!("Player sent to jail!");
            }
        }
    }
    
    Ok(())
}
```

## Testing Helpers

Create helper functions for testing:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    fn create_test_game_state() -> GameState {
        let mut game = unsafe { core::mem::zeroed() };
        game.discriminator = GAME_STATE_DISCRIMINATOR;
        game.game_status = GameStatus::InProgress as u8;
        game.current_players = 2;
        game.max_players = 4;
        game.current_turn = 0;
        game.initialize_properties();
        game
    }
    
    fn create_test_player_state(wallet: [u8; 32], game: [u8; 32]) -> PlayerState {
        let mut player = unsafe { core::mem::zeroed() };
        player.discriminator = PLAYER_STATE_DISCRIMINATOR;
        player.wallet = wallet;
        player.game = game;
        player.cash_balance = STARTING_MONEY as u64;
        player
    }
    
    #[test]
    fn test_property_purchase() {
        let mut game = create_test_game_state();
        let wallet = [1u8; 32];
        let mut player = create_test_player_state(wallet, [0u8; 32]);
        
        // Test buying property
        let property_data = get_property_data(1).unwrap();
        assert!(player.cash_balance >= property_data.price);
        
        player.cash_balance -= property_data.price;
        game.properties[1].set_owner(Some(&wallet));
        
        assert_eq!(game.properties[1].owner_flag, 1);
        assert_eq!(game.properties[1].owner, wallet);
    }
}
```

## Debugging Tips

1. **Use msg! liberally** during development:
```rust
msg!("Player balance before: {}", player.cash_balance);
msg!("Property price: {}", property_data.price);
msg!("Player balance after: {}", player.cash_balance);
```

2. **Check discriminators early**:
```rust
if game.discriminator != GAME_STATE_DISCRIMINATOR {
    msg!("Invalid game discriminator: {:?}", game.discriminator);
    return Err(GameError::InvalidAccount.into());
}
```

3. **Validate state transitions**:
```rust
msg!("Game status: {}", game.game_status);
msg!("Current turn: {}", game.current_turn);
msg!("Active players: {}", game.active_players);
```

## Next Steps

1. Implement one instruction at a time
2. Write unit tests for each
3. Test on devnet with real transactions
4. Port integration tests from Anchor version
5. Benchmark compute units
6. Audit and review

Good luck! 🎲
