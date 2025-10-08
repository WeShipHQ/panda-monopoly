use anchor_lang::prelude::*;
use crate::state::TradeType;

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
