
// -----------------------------------------------------------------------------

// #[derive(Accounts)]
// pub struct CollectGo<'info> {
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

// pub fn collect_go_handler(ctx: Context<CollectGo>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_state = &mut ctx.accounts.player_state;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player index in game.players vector
//     let player_index = game.players.iter().position(|&p| p == player_pubkey)
//         .ok_or(GameError::PlayerNotFound)?;

//     // Validate it's player's turn
//     if game.current_turn != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Collect GO money
//     player_state.cash_balance += GO_SALARY as u64;
//     game.turn_started_at = clock.unix_timestamp;

//     msg!("Player {} collected ${} from GO", player_pubkey, GO_SALARY);

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct GoToJail<'info> {
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

// pub fn go_to_jail_handler(ctx: Context<GoToJail>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_state = &mut ctx.accounts.player_state;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player index in game.players vector
//     let player_index = game.players.iter().position(|&p| p == player_pubkey)
//         .ok_or(GameError::PlayerNotFound)?;

//     // Send player to jail
//     player_state.position = JAIL_POSITION;
//     player_state.in_jail = true;
//     player_state.jail_turns = 0;
//     player_state.doubles_count = 0; // Reset doubles
//     game.turn_started_at = clock.unix_timestamp;

//     msg!("Player {} sent to jail", player_pubkey);

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct DrawChanceCard<'info> {
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
//     pub recent_blockhashes: Sysvar<'info, RecentBlockhashes>,
// }

// pub fn draw_chance_card_handler(ctx: Context<DrawChanceCard>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_state = &mut ctx.accounts.player_state;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;
//     let recent_blockhashes = &ctx.accounts.recent_blockhashes;

//     // Find player index in game.players vector
//     let player_index = game.players.iter().position(|&p| p == player_pubkey)
//         .ok_or(GameError::PlayerNotFound)?;

//     // Validate it's player's turn
//     if game.current_turn != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Generate random card using recent blockhash
//     let recent_blockhash = recent_blockhashes.get(0).ok_or(GameError::RandomnessUnavailable)?;
//     let seed = recent_blockhash.blockhash.to_bytes();
//     let random_value = u32::from_le_bytes([
//         seed[0], seed[1], seed[2], seed[3]
//     ]);

//     let card_index = (random_value % CHANCE_CARDS.len() as u32) as usize;
//     let card = &CHANCE_CARDS[card_index];

//     // Execute card effect
//     execute_chance_card_effect(player_state, card, clock.unix_timestamp)?;

//     msg!("Player {} drew Chance card: {}", player_pubkey, card.description);

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct DrawCommunityChestCard<'info> {
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
//     pub recent_blockhashes: Sysvar<'info, RecentBlockhashes>,
// }

// pub fn draw_community_chest_card_handler(ctx: Context<DrawCommunityChestCard>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_state = &mut ctx.accounts.player_state;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;
//     let recent_blockhashes = &ctx.accounts.recent_blockhashes;

//     // Find player index in game.players vector
//     let player_index = game.players.iter().position(|&p| p == player_pubkey)
//         .ok_or(GameError::PlayerNotFound)?;

//     // Validate it's player's turn
//     if game.current_turn != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Generate random card using recent blockhash
//     let recent_blockhash = recent_blockhashes.get(0).ok_or(GameError::RandomnessUnavailable)?;
//     let seed = recent_blockhash.blockhash.to_bytes();
//     let random_value = u32::from_le_bytes([
//         seed[0], seed[1], seed[2], seed[3]
//     ]);

//     let card_index = (random_value % COMMUNITY_CHEST_CARDS.len() as u32) as usize;
//     let card = &COMMUNITY_CHEST_CARDS[card_index];

//     // Execute card effect
//     execute_community_chest_card_effect(player_state, card, clock.unix_timestamp)?;

//     msg!("Player {} drew Community Chest card: {}", player_pubkey, card.description);

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct PayTax<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn pay_tax_handler(ctx: Context<PayTax>, tax_amount: u32) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player
//     let mut player_index = None;
//     for i in 0..game.player_count as usize {
//         if game.players[i].pubkey == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Validate it's player's turn
//     if game.current_player != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Check if player has enough money
//     if game.players[player_index].money < tax_amount {
//         return Err(GameError::InsufficientFunds.into());
//     }

//     // Pay tax
//     game.players[player_index].money -= tax_amount;
//     game.free_parking_pool += tax_amount;
//     game.last_updated = clock.unix_timestamp;

//     msg!("Player {} paid ${} in taxes", player_pubkey, tax_amount);

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct CollectFreeParking<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn collect_free_parking_handler(ctx: Context<CollectFreeParking>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player
//     let mut player_index = None;
//     for i in 0..game.player_count as usize {
//         if game.players[i].pubkey == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Validate it's player's turn
//     if game.current_player != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Validate player is on Free Parking
//     if game.players[player_index].position != FREE_PARKING_POSITION {
//         return Err(GameError::NotOnFreeParking.into());
//     }

//     // Collect free parking pool
//     let pool_amount = game.free_parking_pool;
//     game.players[player_index].money += pool_amount;
//     game.free_parking_pool = 0;
//     game.last_updated = clock.unix_timestamp;

//     msg!("Player {} collected ${} from Free Parking", player_pubkey, pool_amount);

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct VisitBeachResort<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn visit_beach_resort_handler(ctx: Context<VisitBeachResort>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player
//     let mut player_index = None;
//     for i in 0..game.player_count as usize {
//         if game.players[i].pubkey == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Validate it's player's turn
//     if game.current_player != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Beach Resort effect: Gain money based on properties owned
//     let properties_owned = game.players[player_index].properties_owned.iter()
//         .filter(|&&owned| owned)
//         .count() as u32;

//     let bonus = properties_owned * BEACH_RESORT_BONUS_PER_PROPERTY;
//     game.players[player_index].money += bonus;
//     game.last_updated = clock.unix_timestamp;

//     msg!("Player {} visited Beach Resort and earned ${} bonus", player_pubkey, bonus);

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct AttendFestival<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
//     pub recent_blockhashes: Sysvar<'info, RecentBlockhashes>,
// }

// pub fn attend_festival_handler(ctx: Context<AttendFestival>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;
//     let recent_blockhashes = &ctx.accounts.recent_blockhashes;

//     // Find player
//     let mut player_index = None;
//     for i in 0..game.player_count as usize {
//         if game.players[i].pubkey == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Validate it's player's turn
//     if game.current_player != player_index as u8 {
//         return Err(GameError::NotPlayerTurn.into());
//     }

//     // Festival effect: Random bonus or penalty
//     let recent_blockhash = recent_blockhashes.get(0).ok_or(GameError::RandomnessUnavailable)?;
//     let seed = recent_blockhash.blockhash.to_bytes();
//     let random_value = u32::from_le_bytes([
//         seed[0], seed[1], seed[2], seed[3]
//     ]);

//     let effect_index = (random_value % FESTIVAL_EFFECTS.len() as u32) as usize;
//     let effect = &FESTIVAL_EFFECTS[effect_index];

//     // Apply effect
//     if effect.is_positive {
//         game.players[player_index].money += effect.amount;
//         msg!("Player {} attended Festival and gained ${}: {}",
//              player_pubkey, effect.amount, effect.description);
//     } else {
//         if game.players[player_index].money >= effect.amount {
//             game.players[player_index].money -= effect.amount;
//         } else {
//             game.players[player_index].money = 0;
//         }
//         msg!("Player {} attended Festival and lost ${}: {}",
//              player_pubkey, effect.amount, effect.description);
//     }

//     game.last_updated = clock.unix_timestamp;

//     Ok(())
// }

// // Helper functions for card effects
// fn execute_chance_card_effect(
//     player_state: &mut PlayerState,
//     card: &ChanceCard,
//     timestamp: i64,
// ) -> Result<()> {
//     match card.effect_type {
//         CardEffectType::Money => {
//             if card.amount > 0 {
//                 player_state.cash_balance += card.amount as u64;
//             } else {
//                 let deduction = (-card.amount) as u64;
//                 if player_state.cash_balance >= deduction {
//                     player_state.cash_balance -= deduction;
//                 } else {
//                     player_state.cash_balance = 0;
//                 }
//             }
//         },
//         CardEffectType::Move => {
//             let new_position = card.amount as u8;
//             let old_position = player_state.position;

//             // Check if passing GO
//             if new_position < old_position || new_position == 0 {
//                 player_state.cash_balance += GO_SALARY as u64;
//             }

//             player_state.position = new_position;
//         },
//         CardEffectType::GoToJail => {
//             player_state.position = JAIL_POSITION;
//             player_state.in_jail = true;
//             player_state.jail_turns = 0;
//             player_state.doubles_count = 0;
//         },
//         CardEffectType::GetOutOfJailFree => {
//             player_state.get_out_of_jail_free_cards += 1;
//         },
//         CardEffectType::PayPerProperty => {
//             // Note: This would need access to game state for property counting
//             // For now, we'll skip this implementation
//         },
//         CardEffectType::CollectFromPlayers => {
//             // Note: This would need access to other players
//             // For now, we'll skip this implementation
//         },
//     }

//     Ok(())
// }

// fn execute_community_chest_card_effect(
//     player_state: &mut PlayerState,
//     card: &CommunityChestCard,
//     timestamp: i64,
// ) -> Result<()> {
//     match card.effect_type {
//         CardEffectType::Money => {
//             if card.amount > 0 {
//                 player_state.cash_balance += card.amount as u64;
//             } else {
//                 let deduction = (-card.amount) as u64;
//                 if player_state.cash_balance >= deduction {
//                     player_state.cash_balance -= deduction;
//                 } else {
//                     player_state.cash_balance = 0;
//                 }
//             }
//         },
//         CardEffectType::Move => {
//             let new_position = card.amount as u8;
//             let old_position = player_state.position;

//             // Check if passing GO
//             if new_position < old_position || new_position == 0 {
//                 player_state.cash_balance += GO_SALARY as u64;
//             }

//             player_state.position = new_position;
//         },
//         CardEffectType::GoToJail => {
//             player_state.position = JAIL_POSITION;
//             player_state.in_jail = true;
//             player_state.jail_turns = 0;
//             player_state.doubles_count = 0;
//         },
//         CardEffectType::GetOutOfJailFree => {
//             player_state.get_out_of_jail_free_cards += 1;
//         },
//         CardEffectType::PayPerProperty => {
//             // Note: This would need access to game state for property counting
//             // For now, we'll skip this implementation
//         },
//         CardEffectType::CollectFromPlayers => {
//             // Note: This would need access to other players
//             // For now, we'll skip this implementation
//         },
//     }

//     Ok(())
// }

// // Note: Property counting functions would need to be implemented
// // with access to PropertyState accounts when needed for card effects




// -------------------------------------------------


// ---------------------------------------------

// #[derive(Accounts)]
// pub struct BuildHouse<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn build_house_handler(ctx: Context<BuildHouse>, position: u8) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player in game
//     let mut player_index = None;
//     for i in 0..game.current_players as usize {
//         if game.players[i] == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Property ownership and mortgage validation will be handled by PropertyState account
//     // For now, we'll assume this validation happens at the account level

//     // Get property data
//     let property_data = get_property_data(position).ok_or(GameError::InvalidPropertyPosition)?;

//     // // Only street properties can have houses
//     // if property_data.property_type != PropertyType::Street {
//     //     return Err(GameError::CannotBuildOnThisProperty.into());
//     // }

//     // // Property building validation will be handled by PropertyState account
//     // // For now, we'll assume this validation happens at the account level

//     // // Check monopoly requirement
//     // if !has_monopoly(game, player_index, property_data.color_group) {
//     //     return Err(GameError::MonopolyRequired.into());
//     // }

//     // // Check even building rule
//     // if !can_build_evenly(game, player_index, property_data.color_group, position) {
//     //     return Err(GameError::MustBuildEvenly.into());
//     // }

//     // // Check if enough houses available
//     // if game.houses_remaining == 0 {
//     //     return Err(GameError::NoHousesAvailable.into());
//     // }

//     // Building house logic will be handled by PropertyState and PlayerState accounts
//     // Update game state
//     game.houses_remaining -= 1;
//     game.turn_started_at = clock.unix_timestamp;

//     msg!(
//         "Player {} built a house on property {} for ${}",
//         player_pubkey,
//         position,
//         property_data.house_cost
//     );

//     Ok(())
// }


// #[derive(Accounts)]
// pub struct BuildHotel<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn build_hotel_handler(ctx: Context<BuildHotel>, position: u8) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player in game
//     let mut player_index = None;
//     for i in 0..game.current_players as usize {
//         if game.players[i] == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Property ownership and mortgage validation will be handled by PropertyState account
//     // For now, we'll assume this validation happens at the account level

//     // Get property data
//     let property_data = get_property_data(position).ok_or(GameError::InvalidPropertyPosition)?;

//     // Only street properties can have hotels
//     // if property_data.property_type != PropertyType::Street {
//     //     return Err(GameError::CannotBuildOnThisProperty.into());
//     // }

//     // Property building validation will be handled by PropertyState account
//     // For now, we'll assume this validation happens at the account level

//     // Check if enough hotels available
//     // if game.hotels_remaining == 0 {
//     //     return Err(GameError::NoHotelsAvailable.into());
//     // }

//     // Building hotel logic will be handled by PropertyState and PlayerState accounts
//     // Update game state
//     game.houses_remaining += 4; // Return houses to bank
//     game.hotels_remaining -= 1;
//     game.turn_started_at = clock.unix_timestamp;

//     msg!(
//         "Player {} built a hotel on property {} for ${}",
//         player_pubkey,
//         position,
//         property_data.house_cost
//     );

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct PayRent<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub payer: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn pay_rent_handler(ctx: Context<PayRent>, position: u8) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let payer_pubkey = ctx.accounts.payer.key();
//     let clock = &ctx.accounts.clock;

//     // Find payer index
//     let mut payer_index = None;

//     for i in 0..game.current_players as usize {
//         if game.players[i] == payer_pubkey {
//             payer_index = Some(i);
//             break;
//         }
//     }

//     let payer_index = payer_index.ok_or(GameError::PlayerNotFound)?;

//     // Property ownership and mortgage validation will be handled by PropertyState account
//     // Rent calculation and payment will be handled by PlayerState accounts

//     // Rent calculation and payment will be handled by PropertyState and PlayerState accounts
//     game.turn_started_at = clock.unix_timestamp;

//     msg!(
//         "Player {} paid rent for property at position {}",
//         payer_pubkey,
//         position
//     );

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct MortgageProperty<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn mortgage_property_handler(ctx: Context<MortgageProperty>, position: u8) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player in game
//     let mut player_index = None;
//     for i in 0..game.current_players as usize {
//         if game.players[i] == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Property ownership and mortgage validation will be handled by PropertyState account
//     // For now, we'll assume this validation happens at the account level

//     // Get property data
//     let property_data = get_property_data(position).ok_or(GameError::InvalidPropertyPosition)?;
//     let mortgage_value = property_data.price / 2; // Mortgage for half the purchase price

//     // Mortgage property logic will be handled by PropertyState and PlayerState accounts
//     game.turn_started_at = clock.unix_timestamp;

//     msg!(
//         "Player {} mortgaged property at position {} for ${}",
//         player_pubkey,
//         position,
//         mortgage_value
//     );

//     Ok(())
// }

// #[derive(Accounts)]
// pub struct UnmortgageProperty<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,

//     #[account(mut)]
//     pub player: Signer<'info>,

//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn unmortgage_property_handler(ctx: Context<UnmortgageProperty>, position: u8) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let player_pubkey = ctx.accounts.player.key();
//     let clock = &ctx.accounts.clock;

//     // Find player in game
//     let mut player_index = None;
//     for i in 0..game.player_count as usize {
//         if game.players[i].pubkey == player_pubkey {
//             player_index = Some(i);
//             break;
//         }
//     }

//     let player_index = player_index.ok_or(GameError::PlayerNotFound)?;

//     // Validate property ownership
//     if game.properties[position as usize].owner != player_pubkey {
//         return Err(GameError::PropertyNotOwned.into());
//     }

//     // Check if property is mortgaged
//     if !game.properties[position as usize].is_mortgaged {
//         return Err(GameError::PropertyNotMortgaged.into());
//     }

//     // Calculate unmortgage cost (mortgage value + 10% interest)
//     let mortgage_value = game.properties[position as usize].mortgage_price;
//     let unmortgage_cost = mortgage_value + (mortgage_value / 10);

//     // Check if player has enough money
//     if game.players[player_index].money < unmortgage_cost {
//         return Err(GameError::InsufficientFunds.into());
//     }

//     // Unmortgage property
//     game.properties[position as usize].is_mortgaged = false;
//     game.properties[position as usize].mortgage_price = 0;
//     game.players[player_index].money -= unmortgage_cost;
//     game.players[player_index].net_worth += mortgage_value; // Restore net worth
//     game.last_updated = clock.unix_timestamp;

//     msg!(
//         "Player {} unmortgaged property at position {} for ${}",
//         player_pubkey,
//         position,
//         unmortgage_cost
//     );

//     Ok(())
// }

// Helper functions

// fn has_monopoly(game: &GameState, player_index: usize, color_group: ColorGroup) -> bool {
//     let player_pubkey = game.players[player_index].pubkey;
//     let properties_in_group = crate::constants::get_color_group_properties_enum(color_group);

//     properties_in_group
//         .iter()
//         .all(|&pos| game.properties[pos as usize].owner == player_pubkey)
// }

// fn can_build_evenly(
//     game: &GameState,
//     player_index: usize,
//     color_group: ColorGroup,
//     target_position: u8,
// ) -> bool {
//     let properties_in_group = crate::constants::get_color_group_properties_enum(color_group);
//     let target_houses = game.properties[target_position as usize].houses;

//     // Check that we're not building more than 1 house ahead of others in the group
//     for &pos in properties_in_group.iter() {
//         if pos != target_position {
//             let other_houses = game.properties[pos as usize].houses;
//             if target_houses >= other_houses + 1 {
//                 return false;
//             }
//         }
//     }

//     true
// }

// fn calculate_rent(game: &GameState, position: u8, _payer_index: usize) -> Result<u32> {
//     let property = &game.properties[position as usize];
//     let property_data = get_property_data(position).ok_or(GameError::InvalidPropertyPosition)?;

//     match property_data.property_type {
//         PropertyType::Street => {
//             if property.has_hotel {
//                 Ok(property_data.rent_with_hotel)
//             } else if property.houses > 0 {
//                 Ok(property_data.rent_with_houses[property.houses as usize - 1])
//             } else {
//                 // Check for monopoly to double rent
//                 let owner_index = game
//                     .players
//                     .iter()
//                     .position(|p| p.pubkey == property.owner)
//                     .ok_or(GameError::PropertyOwnerNotFound)?;

//                 if has_monopoly(game, owner_index, property_data.color_group) {
//                     Ok(property_data.base_rent * 2)
//                 } else {
//                     Ok(property_data.base_rent)
//                 }
//             }
//         }
//         PropertyType::Railroad => {
//             let owner_index = game
//                 .players
//                 .iter()
//                 .position(|p| p.pubkey == property.owner)
//                 .ok_or(GameError::PropertyOwnerNotFound)?;
//             let railroads_owned = game.players[owner_index].railroads_owned;
//             Ok(RAILROAD_BASE_RENT * (2_u32.pow(railroads_owned as u32 - 1)))
//         }
//         PropertyType::Utility => {
//             let owner_index = game
//                 .players
//                 .iter()
//                 .position(|p| p.pubkey == property.owner)
//                 .ok_or(GameError::PropertyOwnerNotFound)?;
//             let utilities_owned = game.players[owner_index].utilities_owned;

//             // For utilities, rent is based on dice roll (would need to pass dice roll)
//             // For now, use a fixed multiplier
//             let multiplier = if utilities_owned == 1 { 4 } else { 10 };
//             Ok(multiplier * 10) // Placeholder - should use actual dice roll
//         }
//     }
// }
