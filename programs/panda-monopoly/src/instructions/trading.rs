// use anchor_lang::prelude::*;
// use crate::state::*;
// use crate::constants::*;
// use crate::error::GameError;

// #[derive(Accounts)]
// pub struct CreateTrade<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,
    
//     #[account(
//         init,
//         payer = proposer,
//         space = TradeState::LEN,
//         seeds = [b"trade", game.key().as_ref(), proposer.key().as_ref()],
//         bump
//     )]
//     pub trade: Account<'info, TradeState>,
    
//     #[account(mut)]
//     pub proposer: Signer<'info>,
    
//     pub system_program: Program<'info, System>,
    
//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn create_trade_handler(
//     ctx: Context<CreateTrade>,
//     target_player: Pubkey,
//     offered_properties: Vec<u8>,
//     requested_properties: Vec<u8>,
//     offered_money: u32,
//     requested_money: u32,
// ) -> Result<()> {
//     let game = &ctx.accounts.game;
//     let trade = &mut ctx.accounts.trade;
//     let proposer_pubkey = ctx.accounts.proposer.key();
//     let clock = &ctx.accounts.clock;
    
//     // Validate trade limits
//     if offered_properties.len() > MAX_PROPERTIES_IN_TRADE {
//         return Err(GameError::TooManyPropertiesInTrade.into());
//     }
//     if requested_properties.len() > MAX_PROPERTIES_IN_TRADE {
//         return Err(GameError::TooManyPropertiesInTrade.into());
//     }
    
//     // Find proposer and target player indices
//     let proposer_index = game.players.iter().position(|&p| p == proposer_pubkey)
//         .ok_or(GameError::PlayerNotFound)?;
//     let target_index = game.players.iter().position(|&p| p == target_player)
//         .ok_or(GameError::PlayerNotFound)?;
    
//     // Cannot trade with yourself
//     if proposer_index == target_index {
//         return Err(GameError::CannotTradeWithSelf.into());
//     }
    
//     // Property and money validation will be handled by account-level constraints
//     // and PlayerState accounts in the actual implementation
    
//     // Initialize trade
//     trade.proposer = proposer_pubkey;
//     trade.target = target_player;
//     trade.game = game.key();
//     trade.status = TradeStatus::Pending;
//     trade.offered_money = offered_money;
//     trade.requested_money = requested_money;
//     trade.created_at = clock.unix_timestamp;
//     trade.expires_at = clock.unix_timestamp + TRADE_EXPIRY_SECONDS;
//     trade.bump = ctx.bumps.trade;
    
//     // Set offered properties
//     for (i, &position) in offered_properties.iter().enumerate() {
//         if i < MAX_PROPERTIES_IN_TRADE {
//             trade.offered_properties[i] = position;
//         }
//     }
//     trade.offered_properties_count = offered_properties.len() as u8;
    
//     // Set requested properties
//     for (i, &position) in requested_properties.iter().enumerate() {
//         if i < MAX_PROPERTIES_IN_TRADE {
//             trade.requested_properties[i] = position;
//         }
//     }
//     trade.requested_properties_count = requested_properties.len() as u8;
    
//     msg!("Trade created by {} for player {}", proposer_pubkey, target_player);
//     msg!("Offering {} properties and ${}", offered_properties.len(), offered_money);
//     msg!("Requesting {} properties and ${}", requested_properties.len(), requested_money);
    
//     Ok(())
// }

// #[derive(Accounts)]
// pub struct AcceptTrade<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,
    
//     #[account(
//         mut,
//         seeds = [b"trade", trade.game.as_ref(), trade.proposer.as_ref()],
//         bump = trade.bump,
//         constraint = trade.status == TradeStatus::Pending @ GameError::TradeNotPending,
//         constraint = trade.target == accepter.key() @ GameError::NotTradeTarget,
//         close = accepter
//     )]
//     pub trade: Account<'info, TradeState>,
    
//     #[account(mut)]
//     pub accepter: Signer<'info>,
    
//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn accept_trade_handler(ctx: Context<AcceptTrade>) -> Result<()> {
//     let game = &mut ctx.accounts.game;
//     let trade = &mut ctx.accounts.trade;
//     let accepter_pubkey = ctx.accounts.accepter.key();
//     let clock = &ctx.accounts.clock;
    
//     // Check if trade has expired
//     if clock.unix_timestamp > trade.expires_at {
//         return Err(GameError::TradeExpired.into());
//     }
    
//     // Find proposer and accepter indices
//     let proposer_index = game.players.iter().position(|&p| p == trade.proposer)
//         .ok_or(GameError::PlayerNotFound)?;
//     let accepter_index = game.players.iter().position(|&p| p == accepter_pubkey)
//         .ok_or(GameError::PlayerNotFound)?;
    
//     // Money validation will be handled by PlayerState accounts in the actual implementation
    
//     // Property validation will be handled by PropertyState accounts in the actual implementation
    
//     // Execute the trade
    
//     // Money transfers will be handled by PlayerState accounts in the actual implementation
    
//     // Property transfers will be handled by PropertyState accounts in the actual implementation
    
//     trade.status = TradeStatus::Accepted;
//     game.turn_started_at = clock.unix_timestamp;
    
//     msg!("Trade accepted! Properties and money exchanged between {} and {}", 
//          trade.proposer, accepter_pubkey);
    
//     Ok(())
// }

// #[derive(Accounts)]
// pub struct CancelTrade<'info> {
//     #[account(
//         mut,
//         seeds = [b"trade", trade.game.as_ref(), trade.proposer.as_ref()],
//         bump = trade.bump,
//         constraint = trade.status == TradeStatus::Pending @ GameError::TradeNotPending,
//         constraint = trade.proposer == canceller.key() @ GameError::NotTradeProposer,
//         close = canceller
//     )]
//     pub trade: Account<'info, TradeState>,
    
//     #[account(mut)]
//     pub canceller: Signer<'info>,
    
//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn cancel_trade_handler(ctx: Context<CancelTrade>) -> Result<()> {
//     let trade = &mut ctx.accounts.trade;
//     let canceller_pubkey = ctx.accounts.canceller.key();
    
//     trade.status = TradeStatus::Cancelled;
    
//     msg!("Trade cancelled by proposer {}", canceller_pubkey);
    
//     Ok(())
// }

// #[derive(Accounts)]
// pub struct RejectTrade<'info> {
//     #[account(
//         mut,
//         seeds = [b"trade", trade.game.as_ref(), trade.proposer.as_ref()],
//         bump = trade.bump,
//         constraint = trade.status == TradeStatus::Pending @ GameError::TradeNotPending,
//         constraint = trade.target == rejecter.key() @ GameError::NotTradeTarget,
//         close = rejecter
//     )]
//     pub trade: Account<'info, TradeState>,
    
//     #[account(mut)]
//     pub rejecter: Signer<'info>,
    
//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn reject_trade_handler(ctx: Context<RejectTrade>) -> Result<()> {
//     let trade = &mut ctx.accounts.trade;
//     let rejecter_pubkey = ctx.accounts.rejecter.key();
    
//     trade.status = TradeStatus::Rejected;
    
//     msg!("Trade rejected by target player {}", rejecter_pubkey);
    
//     Ok(())
// }

// // Helper function to recalculate player net worth
// // This will be handled by PlayerState accounts in the actual implementation
// fn recalculate_net_worth(_game: &mut GameState, _player_index: usize) {
//     msg!("Net worth recalculation will be handled by PlayerState accounts");
// }

// // Auction system for properties
// #[derive(Accounts)]
// pub struct StartAuction<'info> {
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump,
//         constraint = game.game_status == GameStatus::InProgress @ GameError::GameNotInProgress
//     )]
//     pub game: Account<'info, GameState>,
    
//     #[account(
//         init,
//         payer = initiator,
//         space = AuctionState::LEN,
//         seeds = [b"auction", game.key().as_ref(), &position.to_le_bytes()],
//         bump
//     )]
//     pub auction: Account<'info, AuctionState>,
    
//     #[account(mut)]
//     pub initiator: Signer<'info>,
    
//     pub system_program: Program<'info, System>,
    
//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn start_auction_handler(ctx: Context<StartAuction>, position: u8) -> Result<()> {
//     let game = &ctx.accounts.game;
//     let auction = &mut ctx.accounts.auction;
//     let clock = &ctx.accounts.clock;
    
//     // Validate property is unowned
//     if game.properties[position as usize].owner != Pubkey::default() {
//         return Err(GameError::PropertyAlreadyOwned.into());
//     }
    
//     // Validate position is purchasable
//     if !is_purchasable_property(position) {
//         return Err(GameError::PropertyNotPurchasable.into());
//     }
    
//     // Initialize auction
//     auction.game = game.key();
//     auction.property_position = position;
//     auction.current_bid = 0;
//     auction.highest_bidder = Pubkey::default();
//     auction.started_at = clock.unix_timestamp;
//     auction.ends_at = clock.unix_timestamp + AUCTION_DURATION_SECONDS;
//     auction.is_active = true;
//     auction.bump = ctx.bumps.auction;
    
//     msg!("Auction started for property at position {}", position);
    
//     Ok(())
// }

// #[derive(Accounts)]
// pub struct PlaceBid<'info> {
//     #[account(
//         mut,
//         seeds = [b"auction", auction.game.as_ref(), &auction.property_position.to_le_bytes()],
//         bump = auction.bump,
//         constraint = auction.is_active @ GameError::AuctionNotActive
//     )]
//     pub auction: Account<'info, AuctionState>,
    
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump
//     )]
//     pub game: Account<'info, GameState>,
    
//     #[account(mut)]
//     pub bidder: Signer<'info>,
    
//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn place_bid_handler(ctx: Context<PlaceBid>, bid_amount: u32) -> Result<()> {
//     let auction = &mut ctx.accounts.auction;
//     let game = &ctx.accounts.game;
//     let bidder_pubkey = ctx.accounts.bidder.key();
//     let clock = &ctx.accounts.clock;
    
//     // Check if auction has ended
//     if clock.unix_timestamp > auction.ends_at {
//         return Err(GameError::AuctionEnded.into());
//     }
    
//     // Find bidder in game
//     let mut bidder_index = None;
//     for i in 0..game.player_count as usize {
//         if game.players[i].pubkey == bidder_pubkey {
//             bidder_index = Some(i);
//             break;
//         }
//     }
    
//     let bidder_index = bidder_index.ok_or(GameError::PlayerNotFound)?;
    
//     // Validate bid amount
//     if bid_amount <= auction.current_bid {
//         return Err(GameError::BidTooLow.into());
//     }
    
//     // Check if bidder has enough money
//     if game.players[bidder_index].money < bid_amount {
//         return Err(GameError::InsufficientFunds.into());
//     }
    
//     // Update auction
//     auction.current_bid = bid_amount;
//     auction.highest_bidder = bidder_pubkey;
    
//     msg!("New bid of ${} placed by {}", bid_amount, bidder_pubkey);
    
//     Ok(())
// }

// #[derive(Accounts)]
// pub struct EndAuction<'info> {
//     #[account(
//         mut,
//         seeds = [b"auction", auction.game.as_ref(), &auction.property_position.to_le_bytes()],
//         bump = auction.bump,
//         constraint = auction.is_active @ GameError::AuctionNotActive,
//         close = closer
//     )]
//     pub auction: Account<'info, AuctionState>,
    
//     #[account(
//         mut,
//         seeds = [b"game", game.authority.as_ref()],
//         bump = game.bump
//     )]
//     pub game: Account<'info, GameState>,
    
//     #[account(mut)]
//     pub closer: Signer<'info>,
    
//     pub clock: Sysvar<'info, Clock>,
// }

// pub fn end_auction_handler(ctx: Context<EndAuction>) -> Result<()> {
//     let auction = &mut ctx.accounts.auction;
//     let game = &mut ctx.accounts.game;
//     let clock = &ctx.accounts.clock;
    
//     // Check if auction time has ended
//     if clock.unix_timestamp <= auction.ends_at {
//         return Err(GameError::AuctionStillActive.into());
//     }
    
//     auction.is_active = false;
    
//     if auction.highest_bidder != Pubkey::default() {
//         // Find winner and complete purchase
//         let mut winner_index = None;
//         for i in 0..game.player_count as usize {
//             if game.players[i].pubkey == auction.highest_bidder {
//                 winner_index = Some(i);
//                 break;
//             }
//         }
        
//         if let Some(winner_index) = winner_index {
//             // Transfer property
//             game.players[winner_index].money -= auction.current_bid;
//             game.properties[auction.property_position as usize].owner = auction.highest_bidder;
//             game.players[winner_index].properties_owned[auction.property_position as usize] = true;
            
//             // Update property counts
//             if let Some(property_data) = get_property_data(auction.property_position) {
//                 match property_data.property_type {
//                     PropertyType::Railroad => {
//                         game.players[winner_index].railroads_owned += 1;
//                     },
//                     PropertyType::Utility => {
//                         game.players[winner_index].utilities_owned += 1;
//                     },
//                     PropertyType::Street => {}
//                 }
//             }
            
//             msg!("Auction won by {} for ${}", auction.highest_bidder, auction.current_bid);
//         }
//     } else {
//         msg!("Auction ended with no bids");
//     }
    
//     Ok(())
// }