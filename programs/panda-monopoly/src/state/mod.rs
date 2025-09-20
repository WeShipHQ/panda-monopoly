use anchor_lang::prelude::*;

mod events;
pub use events::*;

#[derive(Debug, InitSpace, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum GameStatus {
    WaitingForPlayers,
    InProgress,
    Finished,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, InitSpace, Clone, PartialEq, Eq)]
pub enum TradeStatus {
    Pending,
    Accepted,
    Rejected,
    Cancelled,
    Expired,
}

#[derive(Debug, InitSpace, AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ColorGroup {
    Brown,
    LightBlue,
    Pink,
    Orange,
    Red,
    Yellow,
    Green,
    DarkBlue,
    Railroad,
    Utility,
    Special,
}

#[derive(Debug, InitSpace, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PropertyType {
    Property,
    Street,
    Railroad,
    Utility,
    Corner,
    Chance,
    CommunityChest,
    Tax,
    Beach,
    Festival,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum BuildingType {
    House,
    Hotel,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct GameState {
    pub game_id: u64,
    pub authority: Pubkey,   // 32 bytes - game creator
    pub bump: u8,            // 1 byte - PDA bump seed
    pub max_players: u8,     // 1 byte - maximum players (2-8)
    pub current_players: u8, // 1 byte - current player count
    pub current_turn: u8,    // 1 byte - whose turn (player index)
    #[max_len(4)]
    pub players: Vec<Pubkey>, // 32 * 8 = 256 bytes max
    pub created_at: i64,     // 8 bytes - game creation timestamp
    pub is_active: bool,     // 1 byte - game active status
    pub game_status: GameStatus, // 1 byte - current game status
    pub dice_result: [u8; 2], // 2 bytes - last dice roll
    pub bank_balance: u64,   // 8 bytes - bank's money
    pub free_parking_pool: u64, // 8 bytes - parking pool
    pub houses_remaining: u8, // 1 byte - houses left in bank (32 total)
    pub hotels_remaining: u8, // 1 byte - hotels left in bank (12 total)
    pub time_limit: Option<i64>, // 9 bytes - optional time limit
    pub winner: Option<Pubkey>, // 33 bytes - game winner
    pub turn_started_at: i64, // 8 bytes - when current turn started
}

impl GameState {}

#[account]
#[derive(Debug, InitSpace)]
pub struct PlayerState {
    pub wallet: Pubkey,    // 32 bytes - player's wallet
    pub game: Pubkey,      // 32 bytes - game account
    pub cash_balance: u64, // 8 bytes - player's cash
    pub position: u8,      // 1 byte - board position (0-39)
    pub in_jail: bool,     // 1 byte - jail status
    pub jail_turns: u8,    // 1 byte - turns in jail
    pub doubles_count: u8, // 1 byte - consecutive doubles
    pub is_bankrupt: bool, // 1 byte - bankruptcy status
    #[max_len(50)]
    pub properties_owned: Vec<u8>, // variable - owned property positions
    pub get_out_of_jail_cards: u8, // 1 byte - jail cards owned
    pub net_worth: u64,    // 8 bytes - total asset value
    pub last_rent_collected: i64, // 8 bytes - last rent collection time
    pub festival_boost_turns: u8, // 1 byte - remaining festival boost turns

    pub has_rolled_dice: bool,       // 1 byte - has rolled dice this turn
    pub last_dice_roll: [u8; 2],     // 2 bytes - last dice roll
    pub needs_property_action: bool, // Player landed on property
    pub pending_property_position: Option<u8>, // Which property
    pub needs_chance_card: bool,     // Needs to draw chance card
    pub needs_community_chest_card: bool, // Needs to draw community chest
    pub needs_bankruptcy_check: bool, // Insufficient funds detected
    pub can_end_turn: bool,          // All actions completed

    pub needs_special_space_action: bool, // Player landed on special space
    pub pending_special_space_position: Option<u8>, // Which special space

    pub card_drawn_at: Option<i64>, // Timestamp when card was drawn
}

impl PlayerState {}

#[account]
#[derive(Debug, InitSpace)]
pub struct PropertyState {
    pub position: u8,                // 1 byte - board position (0-39)
    pub owner: Option<Pubkey>,       // 33 bytes - property owner
    pub price: u16,                  // 2 bytes - purchase price
    pub color_group: ColorGroup,     // 1 byte - property color group
    pub property_type: PropertyType, // 1 byte - type of space
    pub houses: u8,                  // 1 byte - number of houses (0-4)
    pub has_hotel: bool,             // 1 byte - hotel status
    pub is_mortgaged: bool,          // 1 byte - mortgage status
    pub rent_base: u16,              // 2 bytes - base rent
    pub rent_with_color_group: u16,  // 2 bytes - rent with monopoly
    pub rent_with_houses: [u16; 4],  // 8 bytes - rent with 1-4 houses
    pub rent_with_hotel: u16,        // 2 bytes - rent with hotel
    pub house_cost: u16,             // 2 bytes - cost to build house
    pub mortgage_value: u16,         // 2 bytes - mortgage value
    pub last_rent_paid: i64,         // 8 bytes - last rent payment time
}

impl PropertyState {}

#[account]
#[derive(Debug, InitSpace)]
pub struct TradeState {
    pub game: Pubkey,
    pub proposer: Pubkey,
    pub receiver: Pubkey,
    pub proposer_money: u64,
    pub receiver_money: u64,
    // pub proposer_properties: Vec<u8>,
    // pub receiver_properties: Vec<u8>,
    pub status: TradeStatus,
    pub created_at: i64,
    pub expires_at: i64,
}

impl TradeState {}

#[account]
pub struct AuctionState {
    pub game: Pubkey,
    pub property_index: u8,
    pub current_bid: u64,
    pub current_bidder: Option<Pubkey>,
    pub end_time: i64,
    pub is_active: bool,
}

impl AuctionState {
    pub const LEN: usize = 8 + // discriminator
        32 + // game
        1 + // property_index
        8 + // current_bid
        33 + // current_bidder (1 + 32)
        8 + // end_time
        1; // is_active
}
