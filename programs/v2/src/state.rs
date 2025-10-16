use bytemuck::{Pod, Zeroable};
use core::mem::size_of;

use crate::{ColorGroup, GameError, PropertyType};

// Enums must use #[repr(u8)] for byte-level compatibility
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayers = 0,
    InProgress = 1,
    Finished = 2,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TradeStatus {
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    Cancelled = 3,
    Expired = 4,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ColorGroup {
    Brown = 0,
    LightBlue = 1,
    Pink = 2,
    Orange = 3,
    Red = 4,
    Yellow = 5,
    Green = 6,
    DarkBlue = 7,
    Railroad = 8,
    Utility = 9,
    Special = 10,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PropertyType {
    Street = 0,
    Railroad = 1,
    Utility = 2,
    Corner = 3,
    Chance = 4,
    CommunityChest = 5,
    Tax = 6,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BuildingType {
    House = 0,
    Hotel = 1,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum GameEndReason {
    BankruptcyVictory = 0,
    TimeLimit = 1,
    Manual = 2,
}

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TradeType {
    MoneyOnly = 0,
    PropertyOnly = 1,
    MoneyForProperty = 2,
    PropertyForMoney = 3,
}

// PropertyInfo - 36 bytes
#[repr(C)]
#[derive(Clone, Copy, Debug)]
pub struct PropertyInfo {
    pub owner_flag: u8,          // 1 byte: 0 = None, 1 = Some
    pub owner: [u8; 32],         // 32 bytes: pubkey
    pub houses: u8,              // 1 byte
    pub has_hotel: u8,           // 1 byte: boolean as u8
    pub is_mortgaged: u8,        // 1 byte: boolean as u8
}

impl Default for PropertyInfo {
    fn default() -> Self {
        Self {
            owner_flag: 0,
            owner: [0u8; 32],
            houses: 0,
            has_hotel: 0,
            is_mortgaged: 0,
        }
    }
}

impl PropertyInfo {
    pub fn has_owner(&self) -> bool {
        self.owner_flag != 0
    }

    pub fn get_owner(&self) -> Option<&[u8; 32]> {
        if self.has_owner() {
            Some(&self.owner)
        } else {
            None
        }
    }

    pub fn set_owner(&mut self, owner: Option<&[u8; 32]>) {
        match owner {
            Some(pubkey) => {
                self.owner_flag = 1;
                self.owner.copy_from_slice(pubkey);
            }
            None => {
                self.owner_flag = 0;
                self.owner = [0u8; 32];
            }
        }
    }
}

// TradeInfo - Fixed size structure
#[repr(C)]
#[derive(Clone, Copy, Debug)]
pub struct TradeInfo {
    pub id: u8,                              // 1 byte
    pub proposer: [u8; 32],                  // 32 bytes
    pub receiver: [u8; 32],                  // 32 bytes
    pub trade_type: u8,                      // 1 byte (TradeType enum)
    pub proposer_money: u64,                 // 8 bytes
    pub receiver_money: u64,                 // 8 bytes
    pub proposer_property_flag: u8,          // 1 byte: 0 = None, 1 = Some
    pub proposer_property: u8,               // 1 byte
    pub receiver_property_flag: u8,          // 1 byte: 0 = None, 1 = Some
    pub receiver_property: u8,               // 1 byte
    pub status: u8,                          // 1 byte (TradeStatus enum)
    pub created_at: i64,                     // 8 bytes
    pub expires_at: i64,                     // 8 bytes
    pub _padding: [u8; 7],                   // 7 bytes padding for alignment
}

impl Default for TradeInfo {
    fn default() -> Self {
        Self {
            id: 0,
            proposer: [0u8; 32],
            receiver: [0u8; 32],
            trade_type: 0,
            proposer_money: 0,
            receiver_money: 0,
            proposer_property_flag: 0,
            proposer_property: 0,
            receiver_property_flag: 0,
            receiver_property: 0,
            status: 0,
            created_at: 0,
            expires_at: 0,
            _padding: [0u8; 7],
        }
    }
}

// PlatformConfig account
// Size: 8 (discriminator) + 32 (id) + 2 (fee_basis_points) + 32 (authority) + 32 (fee_vault) + 8 (total_games_created) + 8 (next_game_id) + 1 (bump)
#[repr(C)]
#[derive(Clone, Copy)]
pub struct PlatformConfig {
    pub discriminator: [u8; 8],          // 8 bytes
    pub id: [u8; 32],                    // 32 bytes
    pub fee_basis_points: u16,           // 2 bytes
    pub authority: [u8; 32],             // 32 bytes
    pub fee_vault: [u8; 32],             // 32 bytes
    pub total_games_created: u64,        // 8 bytes
    pub next_game_id: u64,               // 8 bytes
    pub bump: u8,                        // 1 byte
    pub _padding: [u8; 7],               // 7 bytes padding for alignment
}

impl PlatformConfig {
    pub const LEN: usize = 8 + 32 + 2 + 32 + 32 + 8 + 8 + 1 + 7;

    pub fn calculate_fee(&self, amount: u64) -> u64 {
        (amount * self.fee_basis_points as u64) / 10000
    }
}

// GameState account - Large struct with fixed-size arrays
#[repr(C)]
pub struct GameState {
    pub discriminator: [u8; 8],              // 8 bytes
    pub game_id: u64,                        // 8 bytes
    pub config_id: [u8; 32],                 // 32 bytes
    pub creator: [u8; 32],                   // 32 bytes
    pub bump: u8,                            // 1 byte
    pub max_players: u8,                     // 1 byte
    pub current_players: u8,                 // 1 byte
    pub current_turn: u8,                    // 1 byte
    pub total_players: u8,                   // 1 byte
    pub active_players: u8,                  // 1 byte
    pub game_status: u8,                     // 1 byte (GameStatus enum)
    pub _padding1: u8,                       // 1 byte padding
    
    pub players: [[u8; 32]; 4],              // 128 bytes (4 players max)
    pub player_eliminated: [u8; 4],          // 4 bytes (booleans as u8)
    
    pub bank_balance: u64,                   // 8 bytes
    pub free_parking_pool: u64,              // 8 bytes
    pub houses_remaining: u8,                // 1 byte
    pub hotels_remaining: u8,                // 1 byte
    pub winner_flag: u8,                     // 1 byte: 0 = None, 1 = Some
    pub winner: [u8; 32],                    // 32 bytes
    pub _padding2: [u8; 5],                  // 5 bytes padding
    
    pub entry_fee: u64,                      // 8 bytes
    pub token_mint_flag: u8,                 // 1 byte
    pub token_mint: [u8; 32],                // 32 bytes
    pub token_vault_flag: u8,                // 1 byte
    pub token_vault: [u8; 32],               // 32 bytes
    pub _padding3: [u8; 6],                  // 6 bytes padding
    pub total_prize_pool: u64,               // 8 bytes
    
    pub prize_claimed: u8,                   // 1 byte (boolean as u8)
    pub end_condition_met: u8,               // 1 byte (boolean as u8)
    pub end_reason_flag: u8,                 // 1 byte: 0 = None, 1 = Some
    pub end_reason: u8,                      // 1 byte (GameEndReason enum)
    
    pub active_trades_count: u8,             // 1 byte
    pub next_trade_id: u8,                   // 1 byte
    pub _padding4: [u8; 2],                  // 2 bytes padding
    pub active_trades: [TradeInfo; 20],      // 20 * 104 = 2080 bytes
    
    pub properties: [PropertyInfo; 40],      // 40 * 36 = 1440 bytes
    
    pub created_at: i64,                     // 8 bytes
    pub started_at_flag: u8,                 // 1 byte
    pub started_at: i64,                     // 8 bytes
    pub ended_at_flag: u8,                   // 1 byte
    pub ended_at: i64,                       // 8 bytes
    pub game_end_time_flag: u8,              // 1 byte
    pub game_end_time: i64,                  // 8 bytes
    pub _padding5: [u8; 7],                  // 7 bytes padding
    pub turn_started_at: i64,                // 8 bytes
    pub time_limit_flag: u8,                 // 1 byte
    pub time_limit: i64,                     // 8 bytes
    pub _padding6: [u8; 7],                  // 7 bytes padding
    
    pub turn_timeout_seconds: u64,           // 8 bytes
    pub turn_grace_period_seconds: u64,      // 8 bytes
    pub timeout_enforcement_enabled: u8,     // 1 byte (boolean as u8)
    pub _padding7: [u8; 7],                  // 7 bytes padding for alignment
}

impl GameState {
    // Approximate size calculation - will need to be adjusted based on actual layout
    pub const LEN: usize = 8192; // Conservative estimate

    pub fn initialize_properties(&mut self) {
        self.properties = [PropertyInfo::default(); 40];
    }
}

// PlayerState account
#[repr(C)]
pub struct PlayerState {
    pub discriminator: [u8; 8],              // 8 bytes
    pub wallet: [u8; 32],                    // 32 bytes
    pub game: [u8; 32],                      // 32 bytes
    pub cash_balance: u64,                   // 8 bytes
    pub position: u8,                        // 1 byte
    pub in_jail: u8,                         // 1 byte (boolean as u8)
    pub jail_turns: u8,                      // 1 byte
    pub doubles_count: u8,                   // 1 byte
    pub is_bankrupt: u8,                     // 1 byte (boolean as u8)
    pub properties_owned_count: u8,          // 1 byte
    pub properties_owned: [u8; 40],          // 40 bytes
    pub get_out_of_jail_cards: u8,           // 1 byte
    pub _padding1: u8,                       // 1 byte padding
    pub net_worth: u64,                      // 8 bytes
    pub last_rent_collected: i64,            // 8 bytes
    pub festival_boost_turns: u8,            // 1 byte
    pub has_rolled_dice: u8,                 // 1 byte (boolean as u8)
    pub last_dice_roll: [u8; 2],             // 2 bytes
    pub needs_property_action: u8,           // 1 byte (boolean as u8)
    pub pending_property_position_flag: u8,  // 1 byte
    pub pending_property_position: u8,       // 1 byte
    pub needs_chance_card: u8,               // 1 byte (boolean as u8)
    pub needs_community_chest_card: u8,      // 1 byte (boolean as u8)
    pub needs_bankruptcy_check: u8,          // 1 byte (boolean as u8)
    pub needs_special_space_action: u8,      // 1 byte (boolean as u8)
    pub pending_special_space_position_flag: u8, // 1 byte
    pub pending_special_space_position: u8,  // 1 byte
    pub card_drawn_at_flag: u8,              // 1 byte
    pub card_drawn_at: i64,                  // 8 bytes
    pub timeout_penalty_count: u8,           // 1 byte
    pub last_action_timestamp: i64,          // 8 bytes
    pub total_timeout_penalties: u8,         // 1 byte
    pub _padding2: [u8; 6],                  // 6 bytes padding for alignment
}

impl PlayerState {
    pub const LEN: usize = 512; // Conservative estimate
}

// TradeState account
#[repr(C)]
pub struct TradeState {
    pub discriminator: [u8; 8],              // 8 bytes
    pub game: [u8; 32],                      // 32 bytes
    pub proposer: [u8; 32],                  // 32 bytes
    pub receiver: [u8; 32],                  // 32 bytes
    pub trade_type: u8,                      // 1 byte
    pub _padding1: [u8; 7],                  // 7 bytes padding
    pub proposer_money: u64,                 // 8 bytes
    pub receiver_money: u64,                 // 8 bytes
    pub proposer_property_flag: u8,          // 1 byte
    pub proposer_property: u8,               // 1 byte
    pub receiver_property_flag: u8,          // 1 byte
    pub receiver_property: u8,               // 1 byte
    pub status: u8,                          // 1 byte
    pub _padding2: [u8; 3],                  // 3 bytes padding
    pub created_at: i64,                     // 8 bytes
    pub expires_at: i64,                     // 8 bytes
    pub bump: u8,                            // 1 byte
    pub _padding3: [u8; 7],                  // 7 bytes padding
}

impl TradeState {
    pub const LEN: usize = 256; // Conservative estimate
}

// AuctionState account
#[repr(C)]
pub struct AuctionState {
    pub discriminator: [u8; 8],              // 8 bytes
    pub game: [u8; 32],                      // 32 bytes
    pub property_position: u8,               // 1 byte
    pub _padding1: [u8; 7],                  // 7 bytes padding
    pub current_bid: u64,                    // 8 bytes
    pub highest_bidder_flag: u8,             // 1 byte
    pub highest_bidder: [u8; 32],            // 32 bytes
    pub _padding2: [u8; 7],                  // 7 bytes padding
    pub started_at: i64,                     // 8 bytes
    pub ends_at: i64,                        // 8 bytes
    pub is_active: u8,                       // 1 byte (boolean as u8)
    pub bump: u8,                            // 1 byte
    pub _padding3: [u8; 6],                  // 6 bytes padding
}

impl AuctionState {
    pub const LEN: usize = 256; // Conservative estimate
}
