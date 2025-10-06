import { Type, Static } from '@sinclair/typebox'
import { QueryFilters } from '#infra/db/db.port'

// Base Solana types
export const pubKeySchema = Type.String({
  pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
  description: 'Solana public key'
})

export const signatureSchema = Type.String({
  pattern: '^[1-9A-HJ-NP-Za-km-z]{87,88}$',
  description: 'Solana transaction signature'
})

// Enums from database schema
export const gameStatusSchema = Type.Union([
  Type.Literal('WaitingForPlayers'),
  Type.Literal('InProgress'),
  Type.Literal('Finished')
])

export const tradeStatusSchema = Type.Union([
  Type.Literal('Pending'),
  Type.Literal('Accepted'),
  Type.Literal('Rejected'),
  Type.Literal('Cancelled'),
  Type.Literal('Expired')
])

export const colorGroupSchema = Type.Union([
  Type.Literal('Brown'),
  Type.Literal('LightBlue'),
  Type.Literal('Pink'),
  Type.Literal('Orange'),
  Type.Literal('Red'),
  Type.Literal('Yellow'),
  Type.Literal('Green'),
  Type.Literal('DarkBlue'),
  Type.Literal('Railroad'),
  Type.Literal('Utility'),
  Type.Literal('Special')
])

export const propertyTypeSchema = Type.Union([
  Type.Literal('Property'),
  Type.Literal('Street'),
  Type.Literal('Railroad'),
  Type.Literal('Utility'),
  Type.Literal('Corner'),
  Type.Literal('Chance'),
  Type.Literal('CommunityChest'),
  Type.Literal('Tax'),
  Type.Literal('Beach'),
  Type.Literal('Festival')
])

export const buildingTypeSchema = Type.Union([Type.Literal('House'), Type.Literal('Hotel')])

export const tradeTypeSchema = Type.Union([
  Type.Literal('MoneyOnly'),
  Type.Literal('PropertyOnly'),
  Type.Literal('MoneyForProperty'),
  Type.Literal('PropertyForMoney')
])

// Infer types
export type PubKey = Static<typeof pubKeySchema>
export type Signature = Static<typeof signatureSchema>
export type GameStatus = Static<typeof gameStatusSchema>
export type TradeStatus = Static<typeof tradeStatusSchema>
export type ColorGroup = Static<typeof colorGroupSchema>
export type PropertyType = Static<typeof propertyTypeSchema>
export type BuildingType = Static<typeof buildingTypeSchema>
export type TradeType = Static<typeof tradeTypeSchema>

// Common validation schemas
export const boardPositionSchema = Type.Number({
  minimum: 0,
  maximum: 39,
  description: 'Board position (0-39)'
})

export const diceValueSchema = Type.Number({
  minimum: 1,
  maximum: 6,
  description: 'Dice value (1-6)'
})

export const diceRollSchema = Type.Tuple([diceValueSchema, diceValueSchema], {
  description: 'Dice roll result [die1, die2]'
})

export const cashAmountSchema = Type.Number({
  minimum: 0,
  description: 'Cash amount in game currency'
})

export const playerCountSchema = Type.Number({
  minimum: 2,
  maximum: 6,
  description: 'Number of players (2-6)'
})

// Alias for compatibility
export const propertyPositionSchema = boardPositionSchema

export type BoardPosition = Static<typeof boardPositionSchema>
export type DiceValue = Static<typeof diceValueSchema>
export type DiceRoll = Static<typeof diceRollSchema>
export type CashAmount = Static<typeof cashAmountSchema>
export type PlayerCount = Static<typeof playerCountSchema>
export type PropertyPosition = Static<typeof propertyPositionSchema>

export interface GameFilters extends QueryFilters {
  gameStatus?: GameStatus
  player?: PubKey
  maxPlayers?: PlayerCount
  createdAfter?: string
  createdBefore?: string
}

export interface PlayerFilters extends QueryFilters {
  gameId?: PubKey
  minBalance?: CashAmount
  maxBalance?: CashAmount
  minProperties?: number
  maxProperties?: number
  isActive?: boolean
}

export interface PropertyFilters extends QueryFilters {
  gameId?: PubKey
  ownerId?: PubKey
  minPrice?: CashAmount
  maxPrice?: CashAmount
  minRent?: CashAmount
  maxRent?: CashAmount
  position?: PropertyPosition
  isOwned?: boolean
  colorGroup?: ColorGroup
}

export interface TradeFilters extends QueryFilters {
  gameId?: PubKey
  fromPlayer?: PubKey
  toPlayer?: PubKey
  status?: TradeStatus
  propertyOffered?: PubKey
  propertyRequested?: PubKey
  minValue?: CashAmount
  maxValue?: CashAmount
  createdAfter?: string
  createdBefore?: string
}
