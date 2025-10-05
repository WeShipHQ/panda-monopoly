import { ColorGroup } from "@/configs/board-data";
import type {
  GameState,
  PlayerState,
  PropertyState,
  GameStatus,
  PropertyType,
  TradeStatus,
  TradeType,
  TradeInfo as GeneratedTradeInfo,
} from "@/lib/sdk/generated";
import { ColorGroup as GeneratedColorGroup } from "@/lib/sdk/generated";
import {
  isSome,
  type Address,
  type Option,
  type ReadonlyUint8Array,
} from "@solana/kit";

export interface GameAccount {
  address: string;
  gameId: number | string;
  configId: string;
  authority: string;
  bump: number;
  maxPlayers: number;
  currentPlayers: number;
  currentTurn: number;
  players: string[];
  createdAt: number;
  gameStatus: GameStatus;
  bankBalance: string;
  freeParkingPool: string;
  housesRemaining: number;
  hotelsRemaining: number;
  timeLimit: number | null;
  winner: string | null;
  turnStartedAt: number;
  activeTrades: TradeInfo[];
}

export interface PlayerAccount {
  address: string;
  wallet: string;
  game: string;
  cashBalance: string;
  position: number;
  inJail: boolean;
  jailTurns: number;
  doublesCount: number;
  isBankrupt: boolean;
  propertiesOwned: number[];
  getOutOfJailCards: number;
  netWorth: string;
  lastRentCollected: string;
  festivalBoostTurns: number;
  hasRolledDice: boolean;
  lastDiceRoll: number[];
  needsPropertyAction: boolean;
  pendingPropertyPosition: number | null;
  needsChanceCard: boolean;
  needsCommunityChestCard: boolean;
  needsBankruptcyCheck: boolean;
  needsSpecialSpaceAction: boolean;
  pendingSpecialSpacePosition: number | null;
  cardDrawnAt: number | null;
}

export interface PropertyAccount {
  address: string;
  position: number;
  owner: string | null;
  price: number;
  colorGroup: ColorGroup;
  propertyType: PropertyType;
  houses: number;
  hasHotel: boolean;
  isMortgaged: boolean;
  rentBase: number;
  rentWithColorGroup: number;
  rentWithHouses: number[];
  rentWithHotel: number;
  houseCost: number;
  mortgageValue: number;
  lastRentPaid: string;
}

export interface TradeOffer {
  money: string;
  property: number | null;
}

export type TradeInfo = {
  id: number;
  proposer: string;
  receiver: string;
  tradeType: TradeType;
  proposerMoney: number | string;
  receiverMoney: number | string;
  proposerProperty: number | null;
  receiverProperty: number | null;
  status: TradeStatus;
  createdAt: number | string;
  expiresAt: number | string;
};

function optionToNullable<T>(option: Option<T>): T | null {
  return isSome(option) ? option.value : null;
}

function bigintToString(value: bigint): string {
  return value.toString();
}

function bigintToNumber(value: bigint): number {
  return Number(value);
}

function uint8ArrayToNumbers(uint8Array: ReadonlyUint8Array): number[] {
  return Array.from(uint8Array);
}

function addressToString(address: Address): string {
  return address.toString();
}

export function mapGameStateToAccount(
  gameState: GameState,
  address: Address
): GameAccount {
  return {
    address: addressToString(address),
    gameId: bigintToString(gameState.gameId),
    configId: addressToString(gameState.configId),
    authority: addressToString(gameState.authority),
    bump: gameState.bump,
    maxPlayers: gameState.maxPlayers,
    currentPlayers: gameState.currentPlayers,
    currentTurn: gameState.currentTurn,
    players: gameState.players.map(addressToString),
    createdAt: bigintToNumber(gameState.createdAt),
    gameStatus: gameState.gameStatus,
    bankBalance: bigintToString(gameState.bankBalance),
    freeParkingPool: bigintToString(gameState.freeParkingPool),
    housesRemaining: gameState.housesRemaining,
    hotelsRemaining: gameState.hotelsRemaining,
    timeLimit: optionToNullable(gameState.timeLimit)
      ? bigintToNumber(optionToNullable(gameState.timeLimit)!)
      : null,
    winner: optionToNullable(gameState.winner)
      ? addressToString(optionToNullable(gameState.winner)!)
      : null,
    turnStartedAt: bigintToNumber(gameState.turnStartedAt),
    activeTrades: gameState.activeTrades.map(mapTradeInfoToAccount),
  };
}

export function mapPlayerStateToAccount(
  playerState: PlayerState,
  address: Address
): PlayerAccount {
  return {
    address: addressToString(address),
    wallet: addressToString(playerState.wallet),
    game: addressToString(playerState.game),
    cashBalance: bigintToString(playerState.cashBalance),
    position: playerState.position,
    inJail: playerState.inJail,
    jailTurns: playerState.jailTurns,
    doublesCount: playerState.doublesCount,
    isBankrupt: playerState.isBankrupt,
    propertiesOwned: uint8ArrayToNumbers(playerState.propertiesOwned),
    getOutOfJailCards: playerState.getOutOfJailCards,
    netWorth: bigintToString(playerState.netWorth),
    lastRentCollected: bigintToString(playerState.lastRentCollected),
    festivalBoostTurns: playerState.festivalBoostTurns,
    hasRolledDice: playerState.hasRolledDice,
    lastDiceRoll: uint8ArrayToNumbers(playerState.lastDiceRoll),
    needsPropertyAction: playerState.needsPropertyAction,
    pendingPropertyPosition: optionToNullable(
      playerState.pendingPropertyPosition
    ),
    needsChanceCard: playerState.needsChanceCard,
    needsCommunityChestCard: playerState.needsCommunityChestCard,
    needsBankruptcyCheck: playerState.needsBankruptcyCheck,
    needsSpecialSpaceAction: playerState.needsSpecialSpaceAction,
    pendingSpecialSpacePosition: optionToNullable(
      playerState.pendingSpecialSpacePosition
    ),
    cardDrawnAt: optionToNullable(playerState.cardDrawnAt)
      ? bigintToNumber(optionToNullable(playerState.cardDrawnAt)!)
      : null,
  };
}

function mapGeneratedColorGroupToFrontend(
  colorGroup: GeneratedColorGroup
): ColorGroup {
  switch (colorGroup) {
    case GeneratedColorGroup.Brown:
      return "brown";
    case GeneratedColorGroup.LightBlue:
      return "lightBlue";
    case GeneratedColorGroup.Pink:
      return "pink";
    case GeneratedColorGroup.Orange:
      return "orange";
    case GeneratedColorGroup.Red:
      return "red";
    case GeneratedColorGroup.Yellow:
      return "yellow";
    case GeneratedColorGroup.Green:
      return "green";
    case GeneratedColorGroup.DarkBlue:
      return "darkBlue";
    // Note: Railroad, Utility, and Special don't have direct mappings in frontend ColorGroup
    // You may need to handle these cases based on your business logic
    case GeneratedColorGroup.Railroad:
    case GeneratedColorGroup.Utility:
    case GeneratedColorGroup.Special:
    default:
      // Fallback to brown for unmapped cases
      return "brown";
  }
}

export function mapPropertyStateToAccount(
  propertyState: PropertyState,
  address: Address
): PropertyAccount {
  return {
    address: addressToString(address),
    position: propertyState.position,
    owner: optionToNullable(propertyState.owner)
      ? addressToString(optionToNullable(propertyState.owner)!)
      : null,
    price: propertyState.price,
    colorGroup: mapGeneratedColorGroupToFrontend(propertyState.colorGroup),
    propertyType: propertyState.propertyType,
    houses: propertyState.houses,
    hasHotel: propertyState.hasHotel,
    isMortgaged: propertyState.isMortgaged,
    rentBase: propertyState.rentBase,
    rentWithColorGroup: propertyState.rentWithColorGroup,
    rentWithHouses: propertyState.rentWithHouses,
    rentWithHotel: propertyState.rentWithHotel,
    houseCost: propertyState.houseCost,
    mortgageValue: propertyState.mortgageValue,
    lastRentPaid: bigintToString(propertyState.lastRentPaid),
  };
}

export function mapTradeInfoToAccount(
  tradeInfo: GeneratedTradeInfo
): TradeInfo {
  return {
    ...tradeInfo,
    proposer: addressToString(tradeInfo.proposer),
    receiver: addressToString(tradeInfo.receiver),
    proposerMoney: bigintToString(tradeInfo.proposerMoney),
    receiverMoney: bigintToString(tradeInfo.receiverMoney),
    proposerProperty: optionToNullable(tradeInfo.proposerProperty),
    receiverProperty: optionToNullable(tradeInfo.receiverProperty),
    createdAt: bigintToNumber(tradeInfo.createdAt),
    expiresAt: bigintToNumber(tradeInfo.expiresAt),
  };
}
