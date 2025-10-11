use crate::state::TradeType;
use anchor_lang::prelude::*;

#[event]
pub struct ChanceCardDrawn {
    pub player: Pubkey,
    pub game: Pubkey,
    pub card_index: u8,
    pub effect_type: u8, // 0=Money, 1=Move, 2=GoToJail, 3=GetOutOfJailFree, 4=PayPerProperty, 5=CollectFromPlayers
    pub amount: i32,
    pub timestamp: i64,
}

#[event]
pub struct CommunityChestCardDrawn {
    pub player: Pubkey,
    pub game: Pubkey,
    pub card_index: u8,
    pub effect_type: u8, // 0=Money, 1=Move, 2=GoToJail, 3=GetOutOfJailFree, 4=PayPerProperty, 5=CollectFromPlayers
    pub amount: i32,
    pub timestamp: i64,
}

#[event]
pub struct PlayerPassedGo {
    pub player: Pubkey,
    pub game_id: u64,
    pub salary_collected: u64,
    pub new_position: u8,
    pub timestamp: i64,
}

// Game ending event
#[event]
pub struct GameEnded {
    pub game_id: u64,
    pub winner: Option<Pubkey>,
    pub ended_at: i64,
}

// New trade events for vector-based trading
#[event]
pub struct TradeCreated {
    pub game: Pubkey,
    pub trade_id: u8,
    pub proposer: Pubkey,
    pub receiver: Pubkey,
    pub trade_type: TradeType,
    pub proposer_money: u64,
    pub receiver_money: u64,
    pub proposer_property: Option<u8>,
    pub receiver_property: Option<u8>,
    pub expires_at: i64,
}

#[event]
pub struct TradeAccepted {
    pub game: Pubkey,
    pub trade_id: u8,
    pub proposer: Pubkey,
    pub receiver: Pubkey,
    pub accepter: Pubkey,
}

#[event]
pub struct TradeRejected {
    pub game: Pubkey,
    pub trade_id: u8,
    pub proposer: Pubkey,
    pub receiver: Pubkey,
    pub rejecter: Pubkey,
}

#[event]
pub struct TradeCancelled {
    pub game: Pubkey,
    pub trade_id: u8,
    pub proposer: Pubkey,
    pub receiver: Pubkey,
    pub canceller: Pubkey,
}

#[event]
pub struct TradesCleanedUp {
    pub game: Pubkey,
    pub trades_removed: u8,
    pub remaining_trades: u8,
}

// news

#[event]
pub struct PropertyPurchased {
    pub game: Pubkey,
    pub player: Pubkey,
    pub property_position: u8,
    pub price: u64,
    pub timestamp: i64,
}

#[event]
pub struct RentPaid {
    pub game: Pubkey,
    pub payer: Pubkey,
    pub owner: Pubkey,
    pub property_position: u8,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct HouseBuilt {
    pub game: Pubkey,
    pub player: Pubkey,
    pub property_position: u8,
    pub house_count: u8,
    pub cost: u64,
    pub timestamp: i64,
}

#[event]
pub struct HotelBuilt {
    pub game: Pubkey,
    pub player: Pubkey,
    pub property_position: u8,
    pub cost: u64,
    pub timestamp: i64,
}

#[event]
pub struct BuildingSold {
    pub game: Pubkey,
    pub player: Pubkey,
    pub property_position: u8,
    pub building_type: String, // "House" or "Hotel"
    pub sale_price: u64,
    pub timestamp: i64,
}

#[event]
pub struct PropertyMortgaged {
    pub game: Pubkey,
    pub player: Pubkey,
    pub property_position: u8,
    pub mortgage_value: u64,
    pub timestamp: i64,
}

#[event]
pub struct PropertyUnmortgaged {
    pub game: Pubkey,
    pub player: Pubkey,
    pub property_position: u8,
    pub unmortgage_cost: u64,
    pub timestamp: i64,
}

// game
#[event]
pub struct PlayerJoined {
    pub game: Pubkey,
    pub player: Pubkey,
    pub player_index: u8,
    pub total_players: u8,
    pub timestamp: i64,
}

#[event]
pub struct GameStarted {
    pub game: Pubkey,
    pub game_id: u64,
    pub total_players: u8,
    pub first_player: Pubkey,
    pub timestamp: i64,
}

// FIXME
#[event]
pub struct SpecialSpaceAction {
    pub game: Pubkey,
    pub player: Pubkey,
    pub space_type: String, // "Go", "Free Parking", "Go To Jail", etc.
    pub position: u8,
    pub timestamp: i64,
}

#[event]
pub struct TaxPaid {
    pub game: Pubkey,
    pub player: Pubkey,
    pub tax_type: u8, // 1=mev Tax, 2=Priority Fee Tax
    pub amount: u64,
    pub position: u8,
    pub timestamp: i64,
}
