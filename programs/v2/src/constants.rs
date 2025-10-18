use crate::error::GameError;
use crate::state::{ColorGroup, PropertyType};

// Entry fee and vault constants
pub const GAME_AUTHORITY_SEED: &[u8] = b"game_authority";
pub const TOKEN_VAULT_SEED: &[u8] = b"token_vault";
pub const WINNER_PERCENTAGE: u16 = 9500; // 95%
pub const PLATFORM_PERCENTAGE: u16 = 100; // 1%

// Game configuration constants
pub const MAX_PLAYERS: u8 = 4;
pub const MIN_PLAYERS: u8 = 2;
pub const BOARD_SIZE: u8 = 40;
pub const STARTING_MONEY: u32 = 1500;
pub const GO_SALARY: u32 = 200;
pub const JAIL_FINE: u32 = 50;
pub const MAX_JAIL_TURNS: u8 = 3;

pub const MEV_TAX: u32 = 200;
pub const PRIORITY_FEE_TAX: u32 = 75;

pub const MEV_TAX_POSITION: u8 = 4;
pub const PRIORITY_FEE_TAX_POSITION: u8 = 38;

// Update existing constants
pub const BANKRUPTCY_THRESHOLD: u32 = 0;

// Railroad rent
pub const RAILROAD_BASE_RENT: u32 = 25;
pub const MAX_HOUSES_PER_PROPERTY: u8 = 4;
pub const TOTAL_HOUSES: u8 = 32;
pub const TOTAL_HOTELS: u8 = 12;

// Trading and auction constants
pub const MAX_PROPERTIES_IN_TRADE: usize = 10;
pub const TRADE_EXPIRY_SECONDS: i64 = 3600; // 1 hour
pub const MAX_ACTIVE_TRADES: usize = 20; // Maximum trades stored in GameState vector
pub const AUCTION_DURATION_SECONDS: i64 = 300; // 5 minutes

// Special space positions
pub const GO_POSITION: u8 = 0; // Solana Genesis
pub const JAIL_POSITION: u8 = 10; // Validator Jail
pub const GO_TO_JAIL_POSITION: u8 = 30; // Go To Validator Jail
pub const FREE_PARKING_POSITION: u8 = 20; // Free Airdrop Parking
pub const FESTIVAL_POSITION: u8 = 10; // Additional special space

// Chance and Community Chest positions
pub const CHANCE_POSITIONS: [u8; 3] = [7, 22, 36]; // Pump.fun Surprise
pub const COMMUNITY_CHEST_POSITIONS: [u8; 3] = [2, 17, 33]; // Airdrop Chest

// timeout
pub const DEFAULT_TURN_TIMEOUT_SECONDS: u64 = 30;
pub const DEFAULT_GRACE_PERIOD_SECONDS: u64 = 10;
pub const MAX_TIMEOUT_PENALTIES: u8 = 3;

// Seed for randomness
pub const RANDOMNESS_SEED: &[u8] = b"panda_monopoly_v1";
pub const BEACH_RESORT_BONUS_PER_PROPERTY: u32 = 10;

// Property Group Colors
pub const BROWN_GROUP: [u8; 2] = [1, 3];
pub const LIGHT_BLUE_GROUP: [u8; 3] = [6, 8, 9];
pub const PINK_GROUP: [u8; 3] = [11, 13, 14];
pub const ORANGE_GROUP: [u8; 3] = [16, 18, 19];
pub const RED_GROUP: [u8; 3] = [21, 23, 24];
pub const YELLOW_GROUP: [u8; 3] = [26, 27, 29];
pub const GREEN_GROUP: [u8; 3] = [31, 32, 34];
pub const DARK_BLUE_GROUP: [u8; 2] = [37, 39];
pub const RAILROAD_GROUP: [u8; 4] = [5, 15, 25, 35];
pub const UTILITY_GROUP: [u8; 2] = [12, 28];

// Property Data Structure
#[derive(Clone, Copy, Debug, PartialEq)]
#[repr(C)]
pub struct PropertyData {
    pub position: u8,
    pub price: u64,
    pub rent: [u64; 6], // Base rent, 1 house, 2 houses, 3 houses, 4 houses, hotel
    pub house_cost: u64,
    pub mortgage_value: u64,
    pub color_group: ColorGroup,
    pub property_type: PropertyType,
}

// Board Layout - All 40 spaces
pub const BOARD_SPACES: [PropertyData; 40] = [
    // Position 0 - Solana Genesis (GO)
    PropertyData {
        position: 0,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Corner,
    },
    // Position 1 - BONK Avenue (Brown Property)
    PropertyData {
        position: 1,
        price: 60,
        rent: [2, 10, 30, 90, 160, 250],
        house_cost: 50,
        mortgage_value: 30,
        color_group: ColorGroup::Brown,
        property_type: PropertyType::Street,
    },
    // Position 2 - Airdrop Chest
    PropertyData {
        position: 2,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::CommunityChest,
    },
    // Position 3 - WIF Lane (Brown Property)
    PropertyData {
        position: 3,
        price: 60,
        rent: [4, 20, 60, 180, 320, 450],
        house_cost: 50,
        mortgage_value: 30,
        color_group: ColorGroup::Brown,
        property_type: PropertyType::Street,
    },
    // Position 4 - MEV Tax
    PropertyData {
        position: 4,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Tax,
    },
    // Position 5 - Wormhole Bridge (Railroad)
    PropertyData {
        position: 5,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: ColorGroup::Railroad,
        property_type: PropertyType::Railroad,
    },
    // Position 6 - JUP Street (Light Blue Property)
    PropertyData {
        position: 6,
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        house_cost: 50,
        mortgage_value: 50,
        color_group: ColorGroup::LightBlue,
        property_type: PropertyType::Street,
    },
    // Position 7 - Pump.fun Surprise
    PropertyData {
        position: 7,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Chance,
    },
    // Position 8 - RAY Boulevard (Light Blue Property)
    PropertyData {
        position: 8,
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        house_cost: 50,
        mortgage_value: 50,
        color_group: ColorGroup::LightBlue,
        property_type: PropertyType::Street,
    },
    // Position 9 - ORCA Way (Light Blue Property)
    PropertyData {
        position: 9,
        price: 120,
        rent: [8, 40, 100, 300, 450, 600],
        house_cost: 50,
        mortgage_value: 60,
        color_group: ColorGroup::LightBlue,
        property_type: PropertyType::Street,
    },
    // Position 10 - Validator Jail
    PropertyData {
        position: 10,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Corner,
    },
    // Position 11 - SAGA Place (Pink Property)
    PropertyData {
        position: 11,
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        house_cost: 50,
        mortgage_value: 70,
        color_group: ColorGroup::Pink,
        property_type: PropertyType::Street,
    },
    // Position 12 - Pyth Oracle (Utility)
    PropertyData {
        position: 12,
        price: 150,
        rent: [4, 10, 0, 0, 0, 0],
        house_cost: 0,
        mortgage_value: 75,
        color_group: ColorGroup::Utility,
        property_type: PropertyType::Utility,
    },
    // Position 13 - TENSOR Avenue (Pink Property)
    PropertyData {
        position: 13,
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        house_cost: 100,
        mortgage_value: 70,
        color_group: ColorGroup::Pink,
        property_type: PropertyType::Street,
    },
    // Position 14 - MAGIC EDEN Street (Pink Property)
    PropertyData {
        position: 14,
        price: 160,
        rent: [12, 60, 180, 500, 700, 900],
        house_cost: 100,
        mortgage_value: 80,
        color_group: ColorGroup::Pink,
        property_type: PropertyType::Street,
    },
    // Position 15 - Allbridge (Railroad)
    PropertyData {
        position: 15,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: ColorGroup::Railroad,
        property_type: PropertyType::Railroad,
    },
    // Position 16 - HELIO Place (Orange Property)
    PropertyData {
        position: 16,
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        house_cost: 100,
        mortgage_value: 90,
        color_group: ColorGroup::Orange,
        property_type: PropertyType::Street,
    },
    // Position 17 - Airdrop Chest
    PropertyData {
        position: 17,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::CommunityChest,
    },
    // Position 18 - KAMINO Avenue (Orange Property)
    PropertyData {
        position: 18,
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        house_cost: 100,
        mortgage_value: 90,
        color_group: ColorGroup::Orange,
        property_type: PropertyType::Street,
    },
    // Position 19 - DRIFT Street (Orange Property)
    PropertyData {
        position: 19,
        price: 200,
        rent: [16, 80, 240, 600, 800, 1000],
        house_cost: 100,
        mortgage_value: 100,
        color_group: ColorGroup::Orange,
        property_type: PropertyType::Street,
    },
    // Position 20 - Free Airdrop Parking
    PropertyData {
        position: 20,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Corner,
    },
    // Position 21 - MANGO Markets (Red Property)
    PropertyData {
        position: 21,
        price: 220,
        rent: [18, 90, 270, 650, 850, 1050],
        house_cost: 150,
        mortgage_value: 110,
        color_group: ColorGroup::Red,
        property_type: PropertyType::Street,
    },
    // Position 22 - Pump.fun Surprise
    PropertyData {
        position: 22,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Chance,
    },
    // Position 23 - HUBBLE Avenue (Red Property)
    PropertyData {
        position: 23,
        price: 220,
        rent: [18, 90, 270, 650, 850, 1050],
        house_cost: 150,
        mortgage_value: 110,
        color_group: ColorGroup::Red,
        property_type: PropertyType::Street,
    },
    // Position 24 - MARINADE Street (Red Property)
    PropertyData {
        position: 24,
        price: 240,
        rent: [20, 100, 300, 750, 950, 1100],
        house_cost: 150,
        mortgage_value: 120,
        color_group: ColorGroup::Red,
        property_type: PropertyType::Street,
    },
    // Position 25 - LayerZero Bridge (Railroad)
    PropertyData {
        position: 25,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: ColorGroup::Railroad,
        property_type: PropertyType::Railroad,
    },
    // Position 26 - BACKPACK Avenue (Yellow Property)
    PropertyData {
        position: 26,
        price: 260,
        rent: [22, 110, 330, 850, 1050, 1200],
        house_cost: 150,
        mortgage_value: 120,
        color_group: ColorGroup::Yellow,
        property_type: PropertyType::Street,
    },
    // Position 27 - PHANTOM Street (Yellow Property)
    PropertyData {
        position: 27,
        price: 260,
        rent: [22, 110, 330, 850, 1050, 1200],
        house_cost: 150,
        mortgage_value: 130,
        color_group: ColorGroup::Yellow,
        property_type: PropertyType::Street,
    },
    // Position 28 - Switchboard Oracle (Utility)
    PropertyData {
        position: 28,
        price: 150,
        rent: [4, 10, 0, 0, 0, 0],
        house_cost: 0,
        mortgage_value: 75,
        color_group: ColorGroup::Utility,
        property_type: PropertyType::Utility,
    },
    // Position 29 - SOLFLARE Gardens (Yellow Property)
    PropertyData {
        position: 29,
        price: 280,
        rent: [24, 120, 360, 900, 1100, 1300],
        house_cost: 150,
        mortgage_value: 140,
        color_group: ColorGroup::Yellow,
        property_type: PropertyType::Street,
    },
    // Position 30 - Go To Validator Jail
    PropertyData {
        position: 30,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Corner,
    },
    // Position 31 - ANATOLY Avenue (Green Property)
    PropertyData {
        position: 31,
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1300],
        house_cost: 200,
        mortgage_value: 150,
        color_group: ColorGroup::Green,
        property_type: PropertyType::Street,
    },
    // Position 32 - RAJ Street (Green Property)
    PropertyData {
        position: 32,
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1300],
        house_cost: 200,
        mortgage_value: 150,
        color_group: ColorGroup::Green,
        property_type: PropertyType::Street,
    },
    // Position 33 - Airdrop Chest
    PropertyData {
        position: 33,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::CommunityChest,
    },
    // Position 34 - FIREDANCER Avenue (Green Property)
    PropertyData {
        position: 34,
        price: 320,
        rent: [28, 150, 450, 1000, 1200, 1400],
        house_cost: 200,
        mortgage_value: 160,
        color_group: ColorGroup::Green,
        property_type: PropertyType::Street,
    },
    // Position 35 - deBridge (Railroad)
    PropertyData {
        position: 35,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: ColorGroup::Railroad,
        property_type: PropertyType::Railroad,
    },
    // Position 36 - Pump.fun Surprise
    PropertyData {
        position: 36,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Chance,
    },
    // Position 37 - SVM Place (Dark Blue Property)
    PropertyData {
        position: 37,
        price: 350,
        rent: [35, 175, 500, 1100, 1400, 1500],
        house_cost: 200,
        mortgage_value: 175,
        color_group: ColorGroup::DarkBlue,
        property_type: PropertyType::Street,
    },
    // Position 38 - Priority Fee Tax
    PropertyData {
        position: 38,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: ColorGroup::Special,
        property_type: PropertyType::Tax,
    },
    // Position 39 - SAGA Boardwalk (Dark Blue Property)
    PropertyData {
        position: 39,
        price: 400,
        rent: [50, 200, 600, 1200, 1600, 2000],
        house_cost: 200,
        mortgage_value: 200,
        color_group: ColorGroup::DarkBlue,
        property_type: PropertyType::Street,
    },
];

// Helper functions
#[inline]
pub fn get_property_data(position: u8) -> Result<&'static PropertyData, GameError> {
    if position < BOARD_SIZE {
        Ok(&BOARD_SPACES[position as usize])
    } else {
        Err(GameError::InvalidPropertyPosition)
    }
}

pub fn get_color_group_properties_enum(color_group: ColorGroup) -> &'static [u8] {
    match color_group {
        ColorGroup::Brown => &BROWN_GROUP,
        ColorGroup::LightBlue => &LIGHT_BLUE_GROUP,
        ColorGroup::Pink => &PINK_GROUP,
        ColorGroup::Orange => &ORANGE_GROUP,
        ColorGroup::Red => &RED_GROUP,
        ColorGroup::Yellow => &YELLOW_GROUP,
        ColorGroup::Green => &GREEN_GROUP,
        ColorGroup::DarkBlue => &DARK_BLUE_GROUP,
        ColorGroup::Railroad => &RAILROAD_GROUP,
        ColorGroup::Utility => &UTILITY_GROUP,
        ColorGroup::Special => &[],
    }
}

// Anchor account discriminators (sha256 hash of "account:<AccountName>")
pub const PLATFORM_CONFIG_DISCRIMINATOR: [u8; 8] = [155, 234, 147, 216, 16, 213, 139, 133];
pub const GAME_STATE_DISCRIMINATOR: [u8; 8] = [26, 222, 181, 182, 107, 235, 135, 212];
pub const PLAYER_STATE_DISCRIMINATOR: [u8; 8] = [218, 190, 172, 174, 199, 101, 213, 169];
pub const TRADE_STATE_DISCRIMINATOR: [u8; 8] = [187, 124, 210, 158, 155, 112, 123, 191];
pub const AUCTION_STATE_DISCRIMINATOR: [u8; 8] = [18, 203, 187, 155, 109, 220, 124, 216];

// Instruction discriminators (sha256 hash of "global:<instruction_name>")
// Note: This would require sha256 implementation at runtime.
// For now, discriminators should be calculated off-chain and hardcoded.
