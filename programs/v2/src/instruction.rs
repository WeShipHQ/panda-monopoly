use crate::{BuildingType, TradeType};

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MonopolyInstruction {
    // Platform instructions (0-1)
    CreatePlatformConfig = 0,
    UpdatePlatformConfig = 1,

    // Game management instructions (2-7)
    InitializeGame = 2,
    JoinGame = 3,
    LeaveGame = 4,
    StartGame = 5,
    CancelGame = 6,
    EndGame = 7,

    // Dice and movement instructions (8-12)
    RollDice = 8,
    CallbackRollDice = 9,
    EndTurn = 10,
    CallbackDrawChanceCard = 11,
    CallbackDrawCommunityChestCard = 12,

    // Jail instructions (13-14)
    PayJailFine = 13,
    UseGetOutOfJailCard = 14,

    // Bankruptcy instruction (15)
    DeclareBankruptcy = 15,

    // Tax instructions (16-17)
    PayMevTax = 16,
    PayPriorityFeeTax = 17,

    // Card drawing instructions (18-19)
    DrawChanceCard = 18,
    DrawCommunityChestCard = 19,

    // Property instructions (20-27)
    BuyPropertyV2 = 20,
    DeclinePropertyV2 = 21,
    PayRentV2 = 22,
    BuildHouseV2 = 23,
    BuildHotelV2 = 24,
    SellBuildingV2 = 25,
    MortgagePropertyV2 = 26,
    UnmortgagePropertyV2 = 27,

    // Trading instructions (28-32)
    CreateTrade = 28,
    AcceptTrade = 29,
    RejectTrade = 30,
    CancelTrade = 31,
    CleanupExpiredTrades = 32,

    // Reward instruction (33)
    ClaimReward = 33,

    // Permissionless instructions (34-35)
    ForceEndTurn = 34,
    ForceBankruptcyForTimeout = 35,

    // Test instructions (36-38)
    ResetGame = 36,
    UndelegateGame = 37,
    CloseGame = 38,
}

// Instruction data structures
#[repr(C)]
pub struct CreatePlatformConfigData {
    pub platform_id: [u8; 32],
    pub fee_basis_points: u16,
    pub fee_vault: [u8; 32],
}

#[repr(C)]
pub struct UpdatePlatformConfigData {
    pub fee_basis_points_flag: u8,
    pub fee_basis_points: u16,
    pub fee_vault_flag: u8,
    pub fee_vault: [u8; 32],
}

#[repr(C)]
pub struct InitializeGameData {
    pub entry_fee: u64,
    pub time_limit_seconds_flag: u8,
    pub time_limit_seconds: i64,
}

#[repr(C)]
pub struct RollDiceData {
    pub use_vrf: u8,
    pub client_seed: u8,
    pub dice_roll_flag: u8,
    pub dice_roll: [u8; 2],
}

#[repr(C)]
pub struct CallbackRollDiceData {
    pub randomness: [u8; 32],
}

#[repr(C)]
pub struct DrawChanceCardData {
    pub use_vrf: u8,
    pub client_seed: u8,
    pub card_index_flag: u8,
    pub card_index: u8,
}

#[repr(C)]
pub struct DrawCommunityChestCardData {
    pub use_vrf: u8,
    pub client_seed: u8,
    pub card_index_flag: u8,
    pub card_index: u8,
}

#[repr(C)]
pub struct BuyPropertyV2Data {
    pub position: u8,
}

#[repr(C)]
pub struct DeclinePropertyV2Data {
    pub position: u8,
}

#[repr(C)]
pub struct PayRentV2Data {
    pub position: u8,
}

#[repr(C)]
pub struct BuildHouseV2Data {
    pub position: u8,
}

#[repr(C)]
pub struct BuildHotelV2Data {
    pub position: u8,
}

#[repr(C)]
pub struct SellBuildingV2Data {
    pub position: u8,
    pub building_type: u8, // BuildingType enum
}

#[repr(C)]
pub struct MortgagePropertyV2Data {
    pub position: u8,
}

#[repr(C)]
pub struct CreateTradeData {
    pub trade_type: u8, // TradeType enum
    pub proposer_money: u64,
    pub receiver_money: u64,
    pub proposer_property_flag: u8,
    pub proposer_property: u8,
    pub receiver_property_flag: u8,
    pub receiver_property: u8,
}

#[repr(C)]
pub struct AcceptTradeData {
    pub trade_id: u8,
}

#[repr(C)]
pub struct RejectTradeData {
    pub trade_id: u8,
}

#[repr(C)]
pub struct CancelTradeData {
    pub trade_id: u8,
}

// Instruction parsing functions
impl MonopolyInstruction {
    pub fn unpack(input: &[u8]) -> Result<(Self, &[u8]), pinocchio::ProgramError> {
        if input.is_empty() {
            return Err(pinocchio::ProgramError::InvalidInstructionData);
        }

        let (&tag, rest) = input.split_first().ok_or(pinocchio::ProgramError::InvalidInstructionData)?;

        let instruction = match tag {
            0 => Self::CreatePlatformConfig,
            1 => Self::UpdatePlatformConfig,
            2 => Self::InitializeGame,
            3 => Self::JoinGame,
            4 => Self::LeaveGame,
            5 => Self::StartGame,
            6 => Self::CancelGame,
            7 => Self::EndGame,
            8 => Self::RollDice,
            9 => Self::CallbackRollDice,
            10 => Self::EndTurn,
            11 => Self::CallbackDrawChanceCard,
            12 => Self::CallbackDrawCommunityChestCard,
            13 => Self::PayJailFine,
            14 => Self::UseGetOutOfJailCard,
            15 => Self::DeclareBankruptcy,
            16 => Self::PayMevTax,
            17 => Self::PayPriorityFeeTax,
            18 => Self::DrawChanceCard,
            19 => Self::DrawCommunityChestCard,
            20 => Self::BuyPropertyV2,
            21 => Self::DeclinePropertyV2,
            22 => Self::PayRentV2,
            23 => Self::BuildHouseV2,
            24 => Self::BuildHotelV2,
            25 => Self::SellBuildingV2,
            26 => Self::MortgagePropertyV2,
            27 => Self::UnmortgagePropertyV2,
            28 => Self::CreateTrade,
            29 => Self::AcceptTrade,
            30 => Self::RejectTrade,
            31 => Self::CancelTrade,
            32 => Self::CleanupExpiredTrades,
            33 => Self::ClaimReward,
            34 => Self::ForceEndTurn,
            35 => Self::ForceBankruptcyForTimeout,
            36 => Self::ResetGame,
            37 => Self::UndelegateGame,
            38 => Self::CloseGame,
            _ => return Err(pinocchio::ProgramError::InvalidInstructionData),
        };

        Ok((instruction, rest))
    }
}
