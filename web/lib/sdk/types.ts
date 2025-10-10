import {
  Rpc,
  Address,
  TransactionSigner,
  Instruction,
  GetAccountInfoApi,
  SolanaRpcApi,
} from "@solana/kit";
import {
  BuildingType,
  ChanceCardDrawn,
  CommunityChestCardDrawn,
  TradeType,
} from "./generated";

export interface CreatePlatformParams {
  rpc: Rpc<GetAccountInfoApi>;
  creator: TransactionSigner;
  platformId: Address;
}

export interface CreateGameParams {
  rpc: Rpc<SolanaRpcApi>;
  creator: TransactionSigner;
  platformId: Address;
}

export interface CreateGameIxs {
  instructions: Instruction[];
  gameAccountAddress: Address;
}

export interface JoinGameParams {
  rpc: Rpc<SolanaRpcApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface JoinGameIxs {
  instructions: Instruction[];
  playerStateAddress: Address;
}

export interface StartGameParams {
  rpc: Rpc<SolanaRpcApi>;
  authority: TransactionSigner;
  gameAddress: Address;
  players: Address[];
}

export interface RollDiceParams {
  player: TransactionSigner;
  gameAddress: Address;
  useVrf: boolean;
  diceRoll: number[] | null;
}

export interface EndTurnParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface PayJailFineParams {
  player: TransactionSigner;
  gameAddress: Address;
}

export interface UseGetOutOfJailCardParams {
  player: TransactionSigner;
  gameAddress: Address;
}

// Property-related instruction parameters
export interface BuyPropertyParams {
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
}

export interface DeclinePropertyParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
}

export interface MortgagePropertyParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
}

export interface UnmortgagePropertyParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
}

export interface PayRentParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
  propertyOwner: Address;
}

// Building-related instruction parameters
export interface BuildHouseParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
}

export interface BuildHotelParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
}

export interface SellBuildingParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
  position: number;
  buildingType: BuildingType;
}

// Special space instruction parameters
export interface CollectGoParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface CollectFreeParkingParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface GoToJailParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface AttendFestivalParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface DrawChanceCardParams {
  player: TransactionSigner;
  gameAddress: Address;
  useVrf: boolean;
  index?: number;
}

export interface DrawChanceCardVrfParams {
  player: TransactionSigner;
  gameAddress: Address;
  index?: number;
}

export interface DrawCommunityChestCardParams {
  player: TransactionSigner;
  gameAddress: Address;
  useVrf: boolean;
  index?: number;
}

// Tax instruction parameters
export interface PayMevTaxParams {
  player: TransactionSigner;
  gameAddress: Address;
}

export interface PayPriorityFeeTaxParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

// Enhanced GameEvent type to include all possible events
export type GameEvent =
  | {
      type: "ChanceCardDrawn";
      data: ChanceCardDrawn;
    }
  | {
      type: "CommunityChestCardDrawn";
      data: CommunityChestCardDrawn;
    }
  | {
      type: "PlayerPassedGo";
      data: {
        player: Address;
        gameId: bigint;
        salaryCollected: bigint;
        newPosition: number;
        timestamp: bigint;
      };
    }
  | {
      type: "GameEnded";
      data: {
        gameId: bigint;
        winner: Address | null;
        endedAt: bigint;
      };
    }
  | {
      type: "TradeCreated";
      data: {
        game: Address;
        tradeId: number;
        proposer: Address;
        receiver: Address;
        tradeType: TradeType;
        proposerMoney: bigint;
        receiverMoney: bigint;
        proposerProperty: number | null;
        receiverProperty: number | null;
        expiresAt: bigint;
      };
    }
  | {
      type: "TradeAccepted";
      data: {
        game: Address;
        tradeId: number;
        proposer: Address;
        receiver: Address;
        accepter: Address;
      };
    }
  | {
      type: "TradeRejected";
      data: {
        game: Address;
        tradeId: number;
        proposer: Address;
        receiver: Address;
        rejecter: Address;
      };
    }
  | {
      type: "TradeCancelled";
      data: {
        game: Address;
        tradeId: number;
        proposer: Address;
        receiver: Address;
        canceller: Address;
      };
    }
  | {
      type: "TradesCleanedUp";
      data: {
        game: Address;
        tradesRemoved: number;
        remainingTrades: number;
      };
    };

// trading
export interface CreateTradeParams {
  proposer: TransactionSigner;
  receiver: Address;
  gameAddress: Address;
  tradeType: TradeType;
  proposerMoney: number;
  receiverMoney: number;
  proposerProperty?: number;
  receiverProperty?: number;
}

export interface AcceptTradeParams {
  accepter: TransactionSigner;
  gameAddress: Address;
  proposer: Address;
  tradeId: number;
}

export interface RejectTradeParams {
  rejecter: TransactionSigner;
  gameAddress: Address;
  tradeId: number;
}

export interface CancelTradeParams {
  canceller: TransactionSigner;
  gameAddress: Address;
  tradeId: number;
}

export interface DeclareBankruptcyParams {
  player: TransactionSigner;
  gameAddress: Address;
  propertiesOwned: number[];
}
