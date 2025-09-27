// Game constants matching the Rust program

// Basic game configuration
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const BOARD_SIZE = 40;
export const STARTING_MONEY = 1500;
export const GO_SALARY = 200;
export const JAIL_FINE = 50;
export const MAX_JAIL_TURNS = 3;
export const BANKRUPTCY_THRESHOLD = 0;

// Tax amounts
export const MEV_TAX_AMOUNT = 200;
export const PRIORITY_FEE_TAX_AMOUNT = 75;

// Building limits
export const MAX_HOUSES_PER_PROPERTY = 4;
export const TOTAL_HOUSES = 32;
export const TOTAL_HOTELS = 12;

// Trading and auction constants
export const MIN_TRADE_AMOUNT = 1;
export const MAX_TRADE_AMOUNT = 10000;
export const AUCTION_INCREMENT = 10;
export const AUCTION_TIMEOUT_SECONDS = 60;

// Railroad and utility rent
export const RAILROAD_BASE_RENT = 25;
export const UTILITY_MULTIPLIER_ONE = 4;
export const UTILITY_MULTIPLIER_TWO = 10;

// Position constants
export const GO_POSITION = 0;
export const JAIL_POSITION = 10;
export const FREE_PARKING_POSITION = 20;
export const GO_TO_JAIL_POSITION = 30;
export const MEV_TAX_POSITION = 4;
export const PRIORITY_FEE_TAX_POSITION = 38;

// Special space positions
export const CHANCE_POSITIONS = [7, 22, 36];
export const COMMUNITY_CHEST_POSITIONS = [2, 17, 33];
export const RAILROAD_POSITIONS = [5, 15, 25, 35];
export const UTILITY_POSITIONS = [12, 28];

// Property type enums
export enum PropertyType {
  PROPERTY = "property",
  RAILROAD = "railroad", 
  UTILITY = "utility",
  CORNER = "corner",
  CHANCE = "chance",
  COMMUNITY_CHEST = "community-chest",
  TAX = "tax"
}

// Color groups
export enum ColorGroup {
  BROWN = "brown",
  LIGHT_BLUE = "lightBlue", 
  PINK = "pink",
  ORANGE = "orange",
  RED = "red",
  YELLOW = "yellow",
  GREEN = "green",
  DARK_BLUE = "darkBlue"
}

// Game status enum
export enum GameStatus {
  WAITING_FOR_PLAYERS = "waiting_for_players",
  IN_PROGRESS = "in_progress",
  FINISHED = "finished"
}

// Player action flags
export enum PlayerActionFlag {
  NONE = "none",
  PROPERTY_ACTION_REQUIRED = "property_action_required",
  SPECIAL_SPACE_ACTION_REQUIRED = "special_space_action_required",
  CHANCE_CARD_ACTION_REQUIRED = "chance_card_action_required",
  COMMUNITY_CHEST_CARD_ACTION_REQUIRED = "community_chest_card_action_required",
  BANKRUPTCY_REQUIRED = "bankruptcy_required"
}

// Card effect types
export enum CardEffectType {
  MONEY = "money",
  MOVE = "move", 
  MOVE_TO_NEAREST = "move_to_nearest",
  GO_TO_JAIL = "go_to_jail",
  GET_OUT_OF_JAIL_FREE = "get_out_of_jail_free",
  PAY_PER_PROPERTY = "pay_per_property",
  COLLECT_FROM_PLAYERS = "collect_from_players"
}

// Chance cards data
export const CHANCE_CARDS = [
  { id: 0, effect_type: CardEffectType.MONEY, amount: 200 },
  { id: 1, effect_type: CardEffectType.MONEY, amount: -50 },
  { id: 2, effect_type: CardEffectType.MOVE, amount: 0 }, // Go to GO
  { id: 3, effect_type: CardEffectType.MOVE, amount: 24 }, // Go to Illinois Ave
  { id: 4, effect_type: CardEffectType.MOVE, amount: 11 }, // Go to St. Charles Place
  { id: 5, effect_type: CardEffectType.MOVE_TO_NEAREST, amount: 1 }, // Nearest Railroad
  { id: 6, effect_type: CardEffectType.MOVE_TO_NEAREST, amount: 2 }, // Nearest Utility
  { id: 7, effect_type: CardEffectType.GO_TO_JAIL, amount: 0 },
  { id: 8, effect_type: CardEffectType.GET_OUT_OF_JAIL_FREE, amount: 0 },
  { id: 9, effect_type: CardEffectType.MOVE, amount: -3 }, // Go back 3 spaces
  { id: 10, effect_type: CardEffectType.PAY_PER_PROPERTY, amount: 25 }, // Pay $25 per house, $100 per hotel
  { id: 11, effect_type: CardEffectType.MONEY, amount: 150 },
  { id: 12, effect_type: CardEffectType.MONEY, amount: 100 },
  { id: 13, effect_type: CardEffectType.MONEY, amount: 50 },
  { id: 14, effect_type: CardEffectType.COLLECT_FROM_PLAYERS, amount: 50 },
  { id: 15, effect_type: CardEffectType.MONEY, amount: -15 }
];

// Community Chest cards data
export const COMMUNITY_CHEST_CARDS = [
  { id: 0, effect_type: CardEffectType.MONEY, amount: 200 },
  { id: 1, effect_type: CardEffectType.MONEY, amount: 100 },
  { id: 2, effect_type: CardEffectType.MONEY, amount: 50 },
  { id: 3, effect_type: CardEffectType.MONEY, amount: 25 },
  { id: 4, effect_type: CardEffectType.MONEY, amount: 20 },
  { id: 5, effect_type: CardEffectType.MONEY, amount: 10 },
  { id: 6, effect_type: CardEffectType.MONEY, amount: -50 },
  { id: 7, effect_type: CardEffectType.MONEY, amount: -100 },
  { id: 8, effect_type: CardEffectType.MOVE, amount: 0 }, // Go to GO
  { id: 9, effect_type: CardEffectType.GO_TO_JAIL, amount: 0 },
  { id: 10, effect_type: CardEffectType.GET_OUT_OF_JAIL_FREE, amount: 0 },
  { id: 11, effect_type: CardEffectType.PAY_PER_PROPERTY, amount: 40 }, // Pay $40 per house, $115 per hotel
  { id: 12, effect_type: CardEffectType.COLLECT_FROM_PLAYERS, amount: 10 },
  { id: 13, effect_type: CardEffectType.MONEY, amount: 100 },
  { id: 14, effect_type: CardEffectType.MONEY, amount: -150 },
  { id: 15, effect_type: CardEffectType.MONEY, amount: 25 }
];

// Helper functions
export const isPropertyPosition = (position: number): boolean => {
  return ![
    GO_POSITION,
    JAIL_POSITION, 
    FREE_PARKING_POSITION,
    GO_TO_JAIL_POSITION,
    MEV_TAX_POSITION,
    PRIORITY_FEE_TAX_POSITION,
    ...CHANCE_POSITIONS,
    ...COMMUNITY_CHEST_POSITIONS
  ].includes(position);
};

export const isSpecialPosition = (position: number): boolean => {
  return [
    MEV_TAX_POSITION,
    PRIORITY_FEE_TAX_POSITION,
    ...CHANCE_POSITIONS,
    ...COMMUNITY_CHEST_POSITIONS
  ].includes(position);
};

export const isChancePosition = (position: number): boolean => {
  return CHANCE_POSITIONS.includes(position);
};

export const isCommunityChestPosition = (position: number): boolean => {
  return COMMUNITY_CHEST_POSITIONS.includes(position);
};

export const isRailroadPosition = (position: number): boolean => {
  return RAILROAD_POSITIONS.includes(position);
};

export const isUtilityPosition = (position: number): boolean => {
  return UTILITY_POSITIONS.includes(position);
};

export const getNextPosition = (currentPosition: number, steps: number): number => {
  return (currentPosition + steps) % BOARD_SIZE;
};

export const calculateDistanceToPosition = (from: number, to: number): number => {
  if (to >= from) {
    return to - from;
  } else {
    return BOARD_SIZE - from + to;
  }
};

export const passedGo = (oldPosition: number, newPosition: number): boolean => {
  return newPosition < oldPosition;
};