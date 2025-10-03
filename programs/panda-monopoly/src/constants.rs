use anchor_lang::prelude::*;

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
pub const AUCTION_DURATION_SECONDS: i64 = 300; // 5 minutes

// Special space positions
pub const GO_POSITION: u8 = 0; // Solana Genesis
pub const JAIL_POSITION: u8 = 10; // Validator Jail
pub const GO_TO_JAIL_POSITION: u8 = 30; // Go To Validator Jail
pub const FREE_PARKING_POSITION: u8 = 20; // Free Airdrop Parking
                                          // pub const BEACH_RESORT_POSITION: u8 = 20; // Replaces Free Parking
pub const FESTIVAL_POSITION: u8 = 10; // Additional special space

// Chance and Community Chest positions (now themed)
pub const CHANCE_POSITIONS: [u8; 3] = [7, 22, 36]; // Pump.fun Surprise
pub const COMMUNITY_CHEST_POSITIONS: [u8; 3] = [2, 17, 33]; // Airdrop Chest

// Beach Resort and Festival positions (custom spaces)

// Seed for randomness
pub const RANDOMNESS_SEED: &[u8] = b"panda_monopoly_v1";
pub const BEACH_RESORT_BONUS_PER_PROPERTY: u32 = 10;
// pub const FREE_PARKING_POSITION: u8 = 20;
// pub const JAIL_POSITION: u8 = 10;

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
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq)]
pub struct PropertyData {
    pub position: u8,
    pub price: u64,
    pub rent: [u64; 6], // Base rent, 1 house, 2 houses, 3 houses, 4 houses, hotel
    pub house_cost: u64,
    pub mortgage_value: u64,
    pub color_group: u8,
    pub property_type: u8, // 0: Street, 1: Railroad, 2: Utility, 3: Special
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
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 1 - BONK Avenue (Brown Property)
    PropertyData {
        position: 1,
        price: 60,
        rent: [2, 10, 30, 90, 160, 250],
        house_cost: 50,
        mortgage_value: 30,
        color_group: 1,   // Brown
        property_type: 0, // Street
    },
    // Position 2 - Airdrop Chest
    PropertyData {
        position: 2,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 3 - WIF Lane (Brown Property)
    PropertyData {
        position: 3,
        price: 60,
        rent: [4, 20, 60, 180, 320, 450],
        house_cost: 50,
        mortgage_value: 30,
        color_group: 1,   // Brown
        property_type: 0, // Street
    },
    // Position 4 - MEV Tax
    PropertyData {
        position: 4,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 5 - Wormhole Bridge (Railroad)
    PropertyData {
        position: 5,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: 9,   // Railroad
        property_type: 1, // Railroad
    },
    // Position 6 - JUP Street (Light Blue Property)
    PropertyData {
        position: 6,
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        house_cost: 50,
        mortgage_value: 50,
        color_group: 2,   // Light Blue
        property_type: 0, // Street
    },
    // Position 7 - Pump.fun Surprise
    PropertyData {
        position: 7,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 8 - RAY Boulevard (Light Blue Property)
    PropertyData {
        position: 8,
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        house_cost: 50,
        mortgage_value: 50,
        color_group: 2,   // Light Blue
        property_type: 0, // Street
    },
    // Position 9 - ORCA Way (Light Blue Property)
    PropertyData {
        position: 9,
        price: 120,
        rent: [8, 40, 100, 300, 450, 600],
        house_cost: 50,
        mortgage_value: 60,
        color_group: 2,   // Light Blue
        property_type: 0, // Street
    },
    // Position 10 - Validator Jail
    PropertyData {
        position: 10,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 11 - SAGA Place (Pink Property)
    PropertyData {
        position: 11,
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        house_cost: 50,
        mortgage_value: 70,
        color_group: 3,   // Pink
        property_type: 0, // Street
    },
    // Position 12 - Pyth Oracle (Utility)
    PropertyData {
        position: 12,
        price: 150,
        rent: [4, 10, 0, 0, 0, 0],
        house_cost: 0,
        mortgage_value: 75,
        color_group: 10,  // Utility
        property_type: 2, // Utility
    },
    // Position 13 - TENSOR Avenue (Pink Property)
    PropertyData {
        position: 13,
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        house_cost: 100,
        mortgage_value: 70,
        color_group: 3,   // Pink
        property_type: 0, // Street
    },
    // Position 14 - MAGIC EDEN Street (Pink Property)
    PropertyData {
        position: 14,
        price: 160,
        rent: [12, 60, 180, 500, 700, 900],
        house_cost: 100,
        mortgage_value: 80,
        color_group: 3,   // Pink
        property_type: 0, // Street
    },
    // Position 15 - Allbridge (Railroad)
    PropertyData {
        position: 15,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: 9,   // Railroad
        property_type: 1, // Railroad
    },
    // Position 16 - HELIO Place (Orange Property)
    PropertyData {
        position: 16,
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        house_cost: 100,
        mortgage_value: 90,
        color_group: 4,   // Orange
        property_type: 0, // Street
    },
    // Position 17 - Airdrop Chest
    PropertyData {
        position: 17,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 18 - KAMINO Avenue (Orange Property)
    PropertyData {
        position: 18,
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        house_cost: 100,
        mortgage_value: 90,
        color_group: 4,   // Orange
        property_type: 0, // Street
    },
    // Position 19 - DRIFT Street (Orange Property)
    PropertyData {
        position: 19,
        price: 200,
        rent: [16, 80, 240, 600, 800, 1000],
        house_cost: 100,
        mortgage_value: 100,
        color_group: 4,   // Orange
        property_type: 0, // Street
    },
    // Position 20 - Free Airdrop Parking
    PropertyData {
        position: 20,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 21 - MANGO Markets (Red Property)
    PropertyData {
        position: 21,
        price: 220,
        rent: [18, 90, 270, 650, 850, 1050],
        house_cost: 150,
        mortgage_value: 110,
        color_group: 5,   // Red
        property_type: 0, // Street
    },
    // Position 22 - Pump.fun Surprise
    PropertyData {
        position: 22,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 23 - HUBBLE Avenue (Red Property)
    PropertyData {
        position: 23,
        price: 220,
        rent: [18, 90, 270, 650, 850, 1050],
        house_cost: 150,
        mortgage_value: 110,
        color_group: 5,   // Red
        property_type: 0, // Street
    },
    // Position 24 - MARINADE Street (Red Property)
    PropertyData {
        position: 24,
        price: 240,
        rent: [20, 100, 300, 750, 950, 1100],
        house_cost: 150,
        mortgage_value: 120,
        color_group: 5,   // Red
        property_type: 0, // Street
    },
    // Position 25 - LayerZero Bridge (Railroad)
    PropertyData {
        position: 25,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: 9,   // Railroad
        property_type: 1, // Railroad
    },
    // Position 26 - BACKPACK Avenue (Yellow Property)
    PropertyData {
        position: 26,
        price: 260,
        rent: [22, 110, 330, 850, 1050, 1200],
        house_cost: 150,
        mortgage_value: 120,
        color_group: 6,   // Yellow
        property_type: 0, // Street
    },
    // Position 27 - PHANTOM Street (Yellow Property)
    PropertyData {
        position: 27,
        price: 260,
        rent: [22, 110, 330, 850, 1050, 1200],
        house_cost: 150,
        mortgage_value: 130,
        color_group: 6,   // Yellow
        property_type: 0, // Street
    },
    // Position 28 - Switchboard Oracle (Utility)
    PropertyData {
        position: 28,
        price: 150,
        rent: [4, 10, 0, 0, 0, 0],
        house_cost: 0,
        mortgage_value: 75,
        color_group: 10,  // Utility
        property_type: 2, // Utility
    },
    // Position 29 - SOLFLARE Gardens (Yellow Property)
    PropertyData {
        position: 29,
        price: 280,
        rent: [24, 120, 360, 900, 1100, 1300],
        house_cost: 150,
        mortgage_value: 140,
        color_group: 6,   // Yellow
        property_type: 0, // Street
    },
    // Position 30 - Go To Validator Jail
    PropertyData {
        position: 30,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 31 - ANATOLY Avenue (Green Property)
    PropertyData {
        position: 31,
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1300],
        house_cost: 200,
        mortgage_value: 150,
        color_group: 7,   // Green
        property_type: 0, // Street
    },
    // Position 32 - RAJ Street (Green Property)
    PropertyData {
        position: 32,
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1300],
        house_cost: 200,
        mortgage_value: 150,
        color_group: 7,   // Green
        property_type: 0, // Street
    },
    // Position 33 - Airdrop Chest
    PropertyData {
        position: 33,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 34 - FIREDANCER Avenue (Green Property)
    PropertyData {
        position: 34,
        price: 320,
        rent: [28, 150, 450, 1000, 1200, 1400],
        house_cost: 200,
        mortgage_value: 160,
        color_group: 7,   // Green
        property_type: 0, // Street
    },
    // Position 35 - deBridge (Railroad)
    PropertyData {
        position: 35,
        price: 200,
        rent: [25, 50, 100, 200, 0, 0],
        house_cost: 0,
        mortgage_value: 100,
        color_group: 9,   // Railroad
        property_type: 1, // Railroad
    },
    // Position 36 - Pump.fun Surprise
    PropertyData {
        position: 36,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 37 - SVM Place (Dark Blue Property)
    PropertyData {
        position: 37,
        price: 350,
        rent: [35, 175, 500, 1100, 1400, 1500],
        house_cost: 200,
        mortgage_value: 175,
        color_group: 8,   // Dark Blue
        property_type: 0, // Street
    },
    // Position 38 - Priority Fee Tax
    PropertyData {
        position: 38,
        price: 0,
        rent: [0; 6],
        house_cost: 0,
        mortgage_value: 0,
        color_group: 0,
        property_type: 3, // Special
    },
    // Position 39 - SAGA Boardwalk (Dark Blue Property)
    PropertyData {
        position: 39,
        price: 400,
        rent: [50, 200, 600, 1200, 1600, 2000],
        house_cost: 200,
        mortgage_value: 200,
        color_group: 8,   // Dark Blue
        property_type: 0, // Street
    },
];

// Helper functions
pub fn get_property_data(position: u8) -> Option<&'static PropertyData> {
    if position < BOARD_SIZE {
        Some(&BOARD_SPACES[position as usize])
    } else {
        None
    }
}

pub fn is_property_purchasable(position: u8) -> bool {
    if let Some(property) = get_property_data(position) {
        property.price > 0
    } else {
        false
    }
}

pub fn get_color_group_properties_enum(color_group: crate::state::ColorGroup) -> Vec<u8> {
    use crate::state::ColorGroup;
    match color_group {
        ColorGroup::Brown => BROWN_GROUP.to_vec(),
        ColorGroup::LightBlue => LIGHT_BLUE_GROUP.to_vec(),
        ColorGroup::Pink => PINK_GROUP.to_vec(),
        ColorGroup::Orange => ORANGE_GROUP.to_vec(),
        ColorGroup::Red => RED_GROUP.to_vec(),
        ColorGroup::Yellow => YELLOW_GROUP.to_vec(),
        ColorGroup::Green => GREEN_GROUP.to_vec(),
        ColorGroup::DarkBlue => DARK_BLUE_GROUP.to_vec(),
        ColorGroup::Railroad => RAILROAD_GROUP.to_vec(),
        ColorGroup::Utility => UTILITY_GROUP.to_vec(),
        ColorGroup::Special => vec![], // Special spaces don't form groups
    }
}

pub fn get_color_group_properties(color_group: u8) -> Vec<u8> {
    match color_group {
        1 => BROWN_GROUP.to_vec(),
        2 => LIGHT_BLUE_GROUP.to_vec(),
        3 => PINK_GROUP.to_vec(),
        4 => ORANGE_GROUP.to_vec(),
        5 => RED_GROUP.to_vec(),
        6 => YELLOW_GROUP.to_vec(),
        7 => GREEN_GROUP.to_vec(),
        8 => DARK_BLUE_GROUP.to_vec(),
        9 => RAILROAD_GROUP.to_vec(),
        10 => UTILITY_GROUP.to_vec(),
        _ => vec![],
    }
}

pub fn calculate_railroad_rent(railroads_owned: u8) -> u64 {
    match railroads_owned {
        1 => 25,
        2 => 50,
        3 => 100,
        4 => 200,
        _ => 0,
    }
}

pub fn calculate_utility_rent(dice_roll: u8, utilities_owned: u8) -> u64 {
    let multiplier = if utilities_owned == 1 { 4 } else { 10 };
    (dice_roll as u64) * multiplier
}

// Card effect types for Solana-themed cards
#[derive(Clone, Copy, PartialEq)]
pub enum CardEffectType {
    Money,
    Move,
    GoToJail,
    GetOutOfJailFree,
    PayPerProperty,
    CollectFromPlayers,
    MoveToNearest, // For moving to nearest memecoin/railroad/utility
    RepairFree,    // For free repairs
}

impl From<CardEffectType> for u8 {
    fn from(effect_type: CardEffectType) -> Self {
        match effect_type {
            CardEffectType::Money => 0,
            CardEffectType::Move => 1,
            CardEffectType::GoToJail => 2,
            CardEffectType::GetOutOfJailFree => 3,
            CardEffectType::PayPerProperty => 4,
            CardEffectType::CollectFromPlayers => 5,
            CardEffectType::MoveToNearest => 6,
            CardEffectType::RepairFree => 7,
        }
    }
}

// Chance card structure (Pump.fun Surprise)
#[derive(Clone)]
pub struct ChanceCard {
    pub id: u8,
    pub effect_type: CardEffectType,
    pub amount: i32,
}

// Community Chest card structure (Airdrop Chest)
#[derive(Clone)]
pub struct CommunityChestCard {
    pub id: u8,
    pub effect_type: CardEffectType,
    pub amount: i32,
}

// Festival effect structure
#[derive(Clone)]
pub struct FestivalEffect {
    pub id: u8,
    pub amount: u32,
    pub is_positive: bool,
}

// Pump.fun Surprise Cards (Chance cards)
pub const CHANCE_CARDS: [ChanceCard; 5] = [
    ChanceCard {
        id: 1, // "Memecoin Pump!"
        effect_type: CardEffectType::MoveToNearest,
        amount: 1, // Move to nearest memecoin (BONK or WIF)
    },
    ChanceCard {
        id: 2, // "Rug Pull Alert!"
        effect_type: CardEffectType::Money,
        amount: -50,
    },
    ChanceCard {
        id: 3, // "Flash Loan Win"
        effect_type: CardEffectType::Money,
        amount: 100,
    },
    ChanceCard {
        id: 4, // "Congestion Jam"
        effect_type: CardEffectType::Move,
        amount: -3,
    },
    ChanceCard {
        id: 5, // "Dev Unlock"
        effect_type: CardEffectType::GetOutOfJailFree,
        amount: 0,
    },
];

// Airdrop Chest Cards (Community Chest cards)
pub const COMMUNITY_CHEST_CARDS: [CommunityChestCard; 5] = [
    CommunityChestCard {
        id: 1, // "Retroactive Airdrop!"
        effect_type: CardEffectType::CollectFromPlayers,
        amount: 50,
    },
    CommunityChestCard {
        id: 2, // "Staking Rewards"
        effect_type: CardEffectType::Money,
        amount: 100,
    },
    CommunityChestCard {
        id: 3, // "NFT Floor Sweep"
        effect_type: CardEffectType::Move,
        amount: 21, // Move to Free Airdrop Parking (position 21)
    },
    CommunityChestCard {
        id: 4, // "DAO Vote Win"
        effect_type: CardEffectType::RepairFree,
        amount: 0,
    },
    CommunityChestCard {
        id: 5, // "Wallet Drain Fee"
        effect_type: CardEffectType::Money,
        amount: -50,
    },
];

// Festival effects (keeping original structure but updating for Solana theme)
pub const FESTIVAL_EFFECTS: [FestivalEffect; 4] = [
    FestivalEffect {
        id: 1, // "Validator Performance Bonus"
        amount: 100,
        is_positive: true,
    },
    FestivalEffect {
        id: 2, // "Successful DeFi Yield"
        amount: 150,
        is_positive: true,
    },
    FestivalEffect {
        id: 3, // "NFT Royalty Income"
        amount: 75,
        is_positive: true,
    },
    FestivalEffect {
        id: 4, // "Ecosystem Grant Awarded"
        amount: 200,
        is_positive: true,
    },
    //     FestivalEffect {
    //         id: 5, // "Smart Contract Bug"
    //         amount: 50,
    //         is_positive: false,
    //     },
    //     FestivalEffect {
    //         id: 6, // "Network Congestion Fee"
    //         amount: 75,
    //         is_positive: false,
    //     },
    //     FestivalEffect {
    //         id: 7, // "Transaction Failed"
    //         amount: 25,
    //         is_positive: false,
    //     },
    //     FestivalEffect {
    //         id: 8, // "MEV Bot Frontrun"
    //         amount: 100,
    //         is_positive: false,
    //     },
    // ];
    // pub const CHANCE_CARDS: [ChanceCard; 16] = [
    //     ChanceCard {
    //         description: "Advance to GO (Collect $200)",
    //         effect_type: CardEffectType::Move,
    //         amount: 0,
    //     },
    //     ChanceCard {
    //         description: "Advance to Illinois Avenue",
    //         effect_type: CardEffectType::Move,
    //         amount: 24,
    //     },
    //     ChanceCard {
    //         description: "Advance to St. Charles Place",
    //         effect_type: CardEffectType::Move,
    //         amount: 11,
    //     },
    //     ChanceCard {
    //         description: "Advance token to nearest Utility",
    //         effect_type: CardEffectType::Move,
    //         amount: 12, // Electric Company
    //     },
    //     ChanceCard {
    //         description: "Advance token to nearest Railroad",
    //         effect_type: CardEffectType::Move,
    //         amount: 5, // Reading Railroad
    //     },
    //     ChanceCard {
    //         description: "Bank pays you dividend of $50",
    //         effect_type: CardEffectType::Money,
    //         amount: 50,
    //     },
    //     ChanceCard {
    //         description: "Get Out of Jail Free",
    //         effect_type: CardEffectType::GetOutOfJailFree,
    //         amount: 0,
    //     },
    //     ChanceCard {
    //         description: "Go Back 3 Spaces",
    //         effect_type: CardEffectType::Move,
    //         amount: -3,
    //     },
    //     ChanceCard {
    //         description: "Go to Jail",
    //         effect_type: CardEffectType::GoToJail,
    //         amount: 0,
    //     },
    //     ChanceCard {
    //         description: "Make general repairs on all your property",
    //         effect_type: CardEffectType::PayPerProperty,
    //         amount: 25, // $25 per house, $100 per hotel
    //     },
    //     ChanceCard {
    //         description: "Speeding fine $15",
    //         effect_type: CardEffectType::Money,
    //         amount: -15,
    //     },
    //     ChanceCard {
    //         description: "Take a trip to Reading Railroad",
    //         effect_type: CardEffectType::Move,
    //         amount: 5,
    //     },
    //     ChanceCard {
    //         description: "Take a walk on the Boardwalk",
    //         effect_type: CardEffectType::Move,
    //         amount: 39,
    //     },
    //     ChanceCard {
    //         description: "You have been elected Chairman of the Board",
    //         effect_type: CardEffectType::CollectFromPlayers,
    //         amount: 50,
    //     },
    //     ChanceCard {
    //         description: "Your building loan matures",
    //         effect_type: CardEffectType::Money,
    //         amount: 150,
    //     },
    //     ChanceCard {
    //         description: "You have won a crossword competition",
    //         effect_type: CardEffectType::Money,
    //         amount: 100,
    //     },
];

// // Community Chest cards
// pub const COMMUNITY_CHEST_CARDS: [CommunityChestCard; 16] = [
//     CommunityChestCard {
//         description: "Advance to GO (Collect $200)",
//         effect_type: CardEffectType::Move,
//         amount: 0,
//     },
//     CommunityChestCard {
//         description: "Bank error in your favor",
//         effect_type: CardEffectType::Money,
//         amount: 200,
//     },
//     CommunityChestCard {
//         description: "Doctor's fee",
//         effect_type: CardEffectType::Money,
//         amount: -50,
//     },
//     CommunityChestCard {
//         description: "From sale of stock you get $50",
//         effect_type: CardEffectType::Money,
//         amount: 50,
//     },
//     CommunityChestCard {
//         description: "Get Out of Jail Free",
//         effect_type: CardEffectType::GetOutOfJailFree,
//         amount: 0,
//     },
//     CommunityChestCard {
//         description: "Go to Jail",
//         effect_type: CardEffectType::GoToJail,
//         amount: 0,
//     },
//     CommunityChestCard {
//         description: "Holiday fund matures",
//         effect_type: CardEffectType::Money,
//         amount: 100,
//     },
//     CommunityChestCard {
//         description: "Income tax refund",
//         effect_type: CardEffectType::Money,
//         amount: 20,
//     },
//     CommunityChestCard {
//         description: "It is your birthday",
//         effect_type: CardEffectType::CollectFromPlayers,
//         amount: 10,
//     },
//     CommunityChestCard {
//         description: "Life insurance matures",
//         effect_type: CardEffectType::Money,
//         amount: 100,
//     },
//     CommunityChestCard {
//         description: "Pay hospital fees",
//         effect_type: CardEffectType::Money,
//         amount: -100,
//     },
//     CommunityChestCard {
//         description: "Pay school fees",
//         effect_type: CardEffectType::Money,
//         amount: -50,
//     },
//     CommunityChestCard {
//         description: "Receive $25 consultancy fee",
//         effect_type: CardEffectType::Money,
//         amount: 25,
//     },
//     CommunityChestCard {
//         description: "You are assessed for street repair",
//         effect_type: CardEffectType::PayPerProperty,
//         amount: 40, // $40 per house, $115 per hotel
//     },
//     CommunityChestCard {
//         description: "You have won second prize in a beauty contest",
//         effect_type: CardEffectType::Money,
//         amount: 10,
//     },
//     CommunityChestCard {
//         description: "You inherit $100",
//         effect_type: CardEffectType::Money,
//         amount: 100,
//     },
// ];

// // Festival effects
// pub const FESTIVAL_EFFECTS: [FestivalEffect; 8] = [
//     FestivalEffect {
//         description: "Great performance! Earn tips",
//         amount: 100,
//         is_positive: true,
//     },
//     FestivalEffect {
//         description: "Win dance competition",
//         amount: 150,
//         is_positive: true,
//     },
//     FestivalEffect {
//         description: "Food vendor success",
//         amount: 75,
//         is_positive: true,
//     },
//     FestivalEffect {
//         description: "Crowd loves your act",
//         amount: 200,
//         is_positive: true,
//     },
//     FestivalEffect {
//         description: "Equipment malfunction",
//         amount: 50,
//         is_positive: false,
//     },
//     FestivalEffect {
//         description: "Rain ruins your setup",
//         amount: 75,
//         is_positive: false,
//     },
//     FestivalEffect {
//         description: "Permit fees",
//         amount: 25,
//         is_positive: false,
//     },
//     FestivalEffect {
//         description: "Security deposit",
//         amount: 100,
//         is_positive: false,
//     },
// ];
