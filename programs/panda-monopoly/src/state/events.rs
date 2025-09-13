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
