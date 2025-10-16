use pinocchio::program_error::ProgramError;

#[repr(u32)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum GameError {
    // Game State Errors (6000+)
    GameNotInitialized = 6000,
    GameAlreadyInitialized = 6001,
    GameAlreadyStarted = 6002,
    GameNotInProgress = 6003,
    GameAlreadyEnded = 6004,
    GameCannotEnd = 6005,
    MaxPlayersReached = 6006,
    MinPlayersNotMet = 6007,
    CannotStartGame = 6008,
    CreatorCannotLeaveGame = 6009,
    MissingPlayerAccount = 6010,
    MissingPlayerTokenAccount = 6011,
    InvalidPlayerAccount = 6012,

    // Player Errors (6013+)
    PlayerNotFound = 6013,
    PlayerAlreadyExists = 6014,
    NotPlayerTurn = 6015,
    PlayerInJail = 6016,
    PlayerNotInJail = 6017,
    PlayerBankrupt = 6018,
    InsufficientFunds = 6019,
    AlreadyRolledDice = 6020,
    HasNotRolledDice = 6021,
    MustPayRent = 6022,
    MustHandleSpecialSpace = 6023,

    // Property Errors (6024+)
    PropertyNotFound = 6024,
    PropertyNotPurchasable = 6025,
    PropertyAlreadyOwned = 6026,
    PropertyNotOwnedByPlayer = 6027,
    PropertyMortgaged = 6028,
    PropertyNotMortgaged = 6029,
    CannotMortgageWithBuildings = 6030,
    DoesNotOwnColorGroup = 6031,
    CannotBuildOnPropertyType = 6032,
    MaxHousesReached = 6033,
    PropertyHasHotel = 6034,
    MustBuildEvenly = 6035,
    MustSellEvenly = 6036,
    NoHousesToSell = 6037,
    NoHotelToSell = 6038,
    NotEnoughHousesInBank = 6039,
    NotEnoughHotelsInBank = 6040,

    // Movement and Dice Errors (6041+)
    InvalidDiceRoll = 6041,
    InvalidBoardPosition = 6042,
    InvalidPropertyPosition = 6043,
    TooManyDoubles = 6044,

    // Trade Errors (6045+)
    TradeNotFound = 6045,
    TradeAlreadyExists = 6046,
    CannotTradeWithSelf = 6047,
    TradeExpired = 6048,
    TradeAlreadyAccepted = 6049,
    TradeAlreadyRejected = 6050,
    NotAuthorizedForTrade = 6051,
    CannotTradeMortgagedProperties = 6052,
    InvalidTradeProposal = 6053,

    // Auction Errors (6054+)
    AuctionNotFound = 6054,
    AuctionAlreadyExists = 6055,
    AuctionExpired = 6056,
    AuctionAlreadyEnded = 6057,
    BidTooLow = 6058,
    CannotBidOnOwnAuction = 6059,
    AlreadyHighestBidder = 6060,

    // Rent Errors (6061+)
    NoRentOwed = 6061,
    RentAlreadyPaid = 6062,
    CannotCollectRentFromOwnProperty = 6063,
    CannotCollectRentOnMortgagedProperty = 6064,

    // Jail Errors (6065+)
    CannotPayJailFineWhenNotInJail = 6065,
    MaxJailTurnsExceeded = 6066,
    MustRollDoublesOrPayFine = 6067,
    NoGetOutOfJailCards = 6068,

    // Special Space Errors (6069+)
    InvalidSpecialSpaceAction = 6069,
    ChanceCardNotImplemented = 6070,
    CommunityChestCardNotImplemented = 6071,

    // Tax Errors (6072+)
    TaxCalculationError = 6072,
    CannotPayTax = 6073,

    // Bankruptcy Errors (6074+)
    MustDeclareBankruptcy = 6074,
    CannotDeclareBankruptcyWithAssets = 6075,
    BankruptcyAlreadyStarted = 6076,
    BankruptcyNotRequired = 6077,

    // Account and Authorization Errors (6078+)
    Unauthorized = 6078,
    InvalidAccount = 6079,
    AccountAlreadyInitialized = 6080,
    AccountNotInitialized = 6081,
    InvalidSigner = 6082,

    // Math Errors (6083+)
    ArithmeticOverflow = 6083,
    ArithmeticUnderflow = 6084,
    DivisionByZero = 6085,
    InvalidParameter = 6086,
    InvalidGameConfiguration = 6087,

    // Randomness Errors (6088+)
    RandomnessGenerationFailed = 6088,
    InvalidRandomnessSource = 6089,
    RandomnessUnavailable = 6090,

    // Time Errors (6091+)
    InvalidTimestamp = 6091,
    ClockNotAvailable = 6092,
    ActionTimeoutExceeded = 6093,

    // General Errors (6094+)
    OperationNotAllowed = 6094,
    FeatureNotImplemented = 6095,
    InternalError = 6096,
    InvalidInputData = 6097,
    ResourceNotAvailable = 6098,
    PropertyNotOwned = 6099,
    InvalidPropertyOwner = 6100,
    InvalidHouseCount = 6101,
    PropertyAlreadyMortgaged = 6102,
    DiceRollError = 6103,
    TradeNotPending = 6104,
    NotTradeTarget = 6105,
    NotTradeProposer = 6106,
    InvalidTradeType = 6107,
    AuctionNotActive = 6108,
    AuctionEnded = 6109,
    AuctionStillActive = 6110,
    TooManyActiveTrades = 6111,

    // Token and Fee Errors (6112+)
    MissingTokenAccounts = 6112,
    InvalidGameAuthority = 6113,
    InvalidTokenVault = 6114,
    InvalidTokenAccount = 6115,
    EntryFeeTransferFailed = 6116,
    UnexpectedTokenAccounts = 6117,
    GameAlreadyEnding = 6118,
    GameNotFinished = 6119,
    PrizeAlreadyClaimed = 6120,
    NoWinnerDeclared = 6121,
    NotWinner = 6122,
    NoPrizeToClaim = 6123,
    NoActivePlayers = 6124,

    // Timeout errors (6125+)
    TimeoutNotReached = 6125,
    GracePeriodNotExpired = 6126,
    InsufficientTimeoutPenalties = 6127,
    TimeoutEnforcementDisabled = 6128,
    PlayerHasRecentActivity = 6129,
    InsufficientBountyFunds = 6130,
    PlayerAlreadyBankrupt = 6131,
    NoActivePlayersRemaining = 6132,
}

impl From<GameError> for ProgramError {
    fn from(e: GameError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl From<GameError> for u64 {
    fn from(e: GameError) -> Self {
        e as u64
    }
}

#[inline(always)]
pub fn error_code(error: GameError) -> u64 {
    error as u64
}
