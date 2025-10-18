#![cfg_attr(not(feature = "std"), no_std)]

pub mod constants;
pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;

#[cfg(feature = "bpf-entrypoint")]
mod entrypoint;

// Re-export key types
pub use error::GameError;
pub use state::{
    ColorGroup, PropertyType, GameStatus, TradeStatus, BuildingType, GameEndReason, TradeType,
    PropertyInfo, TradeInfo, PlatformConfig, GameState, PlayerState, TradeState, AuctionState,
};
pub use instruction::MonopolyInstruction;
pub use processor::Processor;

// Constants
pub use constants::{
    GAME_AUTHORITY_SEED, TOKEN_VAULT_SEED, MAX_PLAYERS, MIN_PLAYERS, BOARD_SIZE,
    STARTING_MONEY, GO_SALARY, JAIL_FINE, MAX_JAIL_TURNS, MEV_TAX, PRIORITY_FEE_TAX,
    MEV_TAX_POSITION, PRIORITY_FEE_TAX_POSITION, BANKRUPTCY_THRESHOLD,
    RAILROAD_BASE_RENT, MAX_HOUSES_PER_PROPERTY, TOTAL_HOUSES, TOTAL_HOTELS,
    MAX_PROPERTIES_IN_TRADE, TRADE_EXPIRY_SECONDS, MAX_ACTIVE_TRADES,
    AUCTION_DURATION_SECONDS, GO_POSITION, JAIL_POSITION, GO_TO_JAIL_POSITION,
    FREE_PARKING_POSITION, FESTIVAL_POSITION, CHANCE_POSITIONS,
    COMMUNITY_CHEST_POSITIONS, DEFAULT_TURN_TIMEOUT_SECONDS,
    DEFAULT_GRACE_PERIOD_SECONDS, MAX_TIMEOUT_PENALTIES, RANDOMNESS_SEED,
    BEACH_RESORT_BONUS_PER_PROPERTY, PropertyData, BOARD_SPACES,
    get_property_data, get_color_group_properties_enum,
    PLATFORM_CONFIG_DISCRIMINATOR, GAME_STATE_DISCRIMINATOR,
    PLAYER_STATE_DISCRIMINATOR, TRADE_STATE_DISCRIMINATOR, AUCTION_STATE_DISCRIMINATOR,
};

// Utils
pub use utils::*;

// Program ID: 4vucUqMcXN4sgLsgnrXTUC9U7ACZ5DmoRBLbWt4vrnyR
pub const ID: [u8; 32] = [
    0x3a, 0x62, 0x54, 0xf8, 0xf9, 0x94, 0x48, 0x8e, 
    0x5e, 0x18, 0x8e, 0x20, 0xf1, 0xef, 0x1d, 0x2b, 
    0xf6, 0xd2, 0x2b, 0x8e, 0xa3, 0x4a, 0xf1, 0x54, 
    0x1e, 0x45, 0x0b, 0x4c, 0x59, 0x3c, 0x9a, 0x34,
];

#[inline(always)]
pub fn check_id(program_id: &[u8; 32]) -> bool {
    program_id == &ID
}
