import { Player } from "@/components/player-tokens";

export interface PropertyOwnership {
  [propertyIndex: number]: number; // propertyIndex -> playerId
}

export interface PropertyBuildings {
  [propertyIndex: number]: {
    houses: number;
    hasHotel: boolean;
    hasFlag: boolean;
  };
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  gamePhase:
    | "waiting"
    | "rolling"
    | "moving"
    | "property-action"
    | "special-action"
    | "finished";
  propertyOwnership: PropertyOwnership;
  propertyBuildings: PropertyBuildings;
  mortgagedProperties: number[];
  gameLog: string[];
  doublesCount: number; // Track consecutive doubles
  hasRolledDoubles: boolean; // Track if current turn rolled doubles
  currentMessage?: {
    text: string;
    type: "info" | "warning" | "success" | "error";
    duration?: number;
  };
  currentAction?: {
    type:
      | "buy-property"
      | "pay-rent"
      | "chance"
      | "community-chest"
      | "tax"
      | "go-to-jail"
      | "jail-options";
    data?: any;
  };
  cardDrawModal?: {
    isOpen: boolean;
    cardType: "chance" | "community-chest";
  };
}

export interface GameManagerProps {
  onPlayerMove: (playerId: number, newPosition: number) => void;
  onGameStateChange: (state: GameState) => void;
}

export interface Card {
  type:
    | "move"
    | "money"
    | "jail"
    | "get-out-jail"
    | "repairs"
    | "collect-from-players"
    | "tax";
  message: string;
  position?: number | string;
  amount?: number;
  collectGo?: boolean;
  housePrice?: number;
  hotelPrice?: number;
}

export interface DrawnCards {
  chanceIndex: number;
  communityChestIndex: number;
  playerJailCards: { [playerId: number]: number };
}
