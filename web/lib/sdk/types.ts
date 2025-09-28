import {
  Rpc,
  Address,
  TransactionSigner,
  Instruction,
  GetAccountInfoApi,
} from "@solana/kit";
import { ChanceCardDrawn, CommunityChestCardDrawn } from "./generated";

export interface CreatePlatformParams {
  rpc: Rpc<GetAccountInfoApi>;
  creator: TransactionSigner;
  platformId: Address;
}

export interface CreateGameParams {
  rpc: Rpc<GetAccountInfoApi>;
  creator: TransactionSigner;
  platformId: Address;
}

export interface CreateGameIxs {
  instruction: Instruction;
  gameAccountAddress: Address;
}

export interface JoinGameParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface JoinGameIxs {
  instruction: Instruction;
  playerStateAddress: Address;
}

export interface StartGameParams {
  authority: TransactionSigner;
  gameAddress: Address;
  players: Address[];
}

export interface RollDiceParams {
  player: TransactionSigner;
  gameAddress: Address;
  diceRoll: number[] | null;
}

export interface EndTurnParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface PayJailFineParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

// Property-related instruction parameters
export interface BuyPropertyParams {
  rpc: Rpc<GetAccountInfoApi>;
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
  buildingType: number;
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

// Card-related instruction parameters
export interface DrawChanceCardParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface DrawCommunityChestCardParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

// Tax instruction parameters
export interface PayMevTaxParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export interface PayPriorityFeeTaxParams {
  rpc: Rpc<GetAccountInfoApi>;
  player: TransactionSigner;
  gameAddress: Address;
}

export type GameEvent =
  | {
      type: "ChanceCardDrawn";
      data: ChanceCardDrawn;
    }
  | {
      type: "CommunityChestCardDrawn";
      data: CommunityChestCardDrawn;
    };
