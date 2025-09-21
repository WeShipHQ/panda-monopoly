import {
  ColorGroup,
  PropertySpace,
  RailroadSpace,
  TaxSpace,
} from "@/configs/board-data";
import { PropertyAccount } from "@/types/schema";
import type { Address } from "@solana/kit";

// Base interface for common space properties
export interface BaseSpaceProps {
  position: number;
  rotate?: "left" | "top" | "right";
  onClick?: (position: number) => void;
  property?: PropertyAccount | null;
  onChainProperty?: PropertyAccount | null;
  // playerName?: string;
}

// Property space specific props
// export interface PropertySpaceProps extends BaseSpaceProps {
//   name: string;
//   price: number | string;
//   colorGroup: ColorGroup;
//   // longName?: boolean;
//   // threeLines?: boolean;
//   // Property-specific data from unified-monopoly-data
//   baseRent?: string;
//   rentWithColorGroup?: string;
//   rentWith1House?: string;
//   rentWith2Houses?: string;
//   rentWith3Houses?: string;
//   rentWith4Houses?: string;
//   rentWithHotel?: string;
//   houseCost?: string;
//   mortgageValue?: string;
// }

// export type PropertySpaceProps = BaseSpaceProps & PropertySpace;

// export interface RailroadSpaceProps extends BaseSpaceProps {
//   name: string;
//   price: number | string;
//   // longName?: boolean;
//   // Railroad-specific data
//   railroadRent?: [string, string, string, string]; // Rent for 1, 2, 3, 4 railroads
//   mortgageValue?: string;
// }

// Beach space specific props (if used)
// export interface BeachSpaceProps extends BaseSpaceProps {
//   name: string;
//   price: string;
//   longName?: boolean;
//   // Beach-specific data
//   beachRent?: [string, string, string, string]; // Rent for 1, 2, 3, 4 beaches
//   mortgageValue?: string;
// }

// Utility space specific props
// export interface UtilitySpaceProps extends BaseSpaceProps {
//   name: string;
//   price: number | string;
//   type: "electric" | "water";
//   // Utility-specific data
//   utilityMultiplier?: [number, number]; // Multiplier for 1 and 2 utilities
//   mortgageValue?: string;
// }

// Chance space specific props
// export interface ChanceSpaceProps extends BaseSpaceProps {
//   // blueIcon?: boolean;
// }

// Community Chest space specific props
// export interface CommunityChestSpaceProps extends BaseSpaceProps {
// No additional props needed
// }

// Tax space specific props
// export interface TaxSpaceProps extends BaseSpaceProps {
//   name: string;
//   price?: string | number;
//   instructions?: string;
//   type: "income" | "luxury";
//   taxAmount?: string;
// }
export type TaxSpaceProps = BaseSpaceProps & TaxSpace;

// Corner space specific props (GO, Jail, Free Parking, Go To Jail)
export interface CornerSpaceProps extends BaseSpaceProps {
  name: string;
  type: "go" | "jail" | "free-parking" | "go-to-jail";
  instructions?: string;
}

// Union type for all space props
// export type SpaceProps =
//   | PropertySpaceProps
//   | RailroadSpaceProps
//   | BeachSpaceProps
//   | UtilitySpaceProps
//   | ChanceSpaceProps
//   | CommunityChestSpaceProps
//   | TaxSpaceProps
//   | CornerSpaceProps;

export interface CardData {
  id: number;
  title: string;
  description: string;
  action: string;
  value: number;
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  type:
    | "move"
    | "purchase"
    | "rent"
    | "card"
    | "jail"
    | "bankruptcy"
    | "turn"
    | "dice"
    | "building"
    | "trade"
    | "game"
    | "skip"
    | "join";
  playerId: Address;
  playerName?: string;
  message: string;
  details?: {
    // Property-related
    propertyName?: string;
    position?: number;
    price?: number;

    // payRent
    owner?: Address;

    // Card-related
    cardType?: "chance" | "community-chest";
    cardTitle?: string;
    cardDescription?: string;
    cardIndex?: number;
    effectType?: number;
    amount?: number;

    // Trade-related
    tradeId?: string;
    targetPlayer?: Address;
    targetPlayerName?: string;
    offeredProperties?: number[];
    requestedProperties?: number[];
    offeredMoney?: number;
    requestedMoney?: number;

    // Movement-related
    fromPosition?: number;
    toPosition?: number;
    diceRoll?: [number, number];
    doublesCount?: number;
    passedGo?: boolean;

    // Jail-related
    jailReason?: "doubles" | "go_to_jail" | "card";
    fineAmount?: number;

    // Building-related
    buildingType?: "house" | "hotel";

    // Tax-related
    taxType?: string;

    // Other
    signature?: string;
    error?: string;
  };
}
