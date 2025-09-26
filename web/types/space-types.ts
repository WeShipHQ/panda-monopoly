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
  onChainProperty?: PropertyAccount | null; // Unified property prop
}

export type TaxSpaceProps = BaseSpaceProps & TaxSpace;

export interface CornerSpaceProps extends BaseSpaceProps {
  name: string;
  type: "go" | "jail" | "free-parking" | "go-to-jail";
  instructions?: string;
}

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
