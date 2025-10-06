import { Type, Static } from '@sinclair/typebox'
import {
  pubKeySchema,
  signatureSchema,
  gameStatusSchema,
  playerCountSchema,
  cashAmountSchema,
  diceRollSchema
} from './monopoly-types.dto'

// Game DTOs
export const gameSchema = Type.Object({
  pubkey: pubKeySchema,
  gameId: Type.Number(),
  configId: pubKeySchema,
  authority: pubKeySchema,
  bump: Type.Number(),
  maxPlayers: playerCountSchema,
  currentPlayers: Type.Number({ minimum: 0, maximum: 6 }),
  currentTurn: Type.Number({ minimum: 0 }),
  players: Type.Array(pubKeySchema),
  createdAt: Type.String({ format: 'date-time' }),
  gameStatus: gameStatusSchema,
  bankBalance: cashAmountSchema,
  freeParkingPool: cashAmountSchema,
  housesRemaining: Type.Number({ minimum: 0, maximum: 32 }),
  hotelsRemaining: Type.Number({ minimum: 0, maximum: 12 }),
  timeLimit: Type.Optional(Type.Number()),
  turnStartedAt: Type.Number(),
  winner: Type.Optional(pubKeySchema),
  accountCreatedAt: Type.String({ format: 'date-time' }),
  accountUpdatedAt: Type.String({ format: 'date-time' }),
  createdSlot: Type.Number(),
  updatedSlot: Type.Number(),
  lastSignature: Type.Optional(signatureSchema)
})

export const createGameRequestSchema = Type.Object({
  maxPlayers: playerCountSchema,
  timeLimit: Type.Optional(Type.Number({ minimum: 300000 })), // Min 5 minutes
  configId: Type.Optional(pubKeySchema)
})

export const joinGameRequestSchema = Type.Object({
  gameId: Type.Number({ minimum: 0 }),
  playerWallet: pubKeySchema
})

export const gameFilterSchema = Type.Object({
  gameStatus: Type.Optional(gameStatusSchema),
  player: Type.Optional(pubKeySchema),
  maxPlayers: Type.Optional(playerCountSchema),
  createdAfter: Type.Optional(Type.String({ format: 'date-time' })),
  createdBefore: Type.Optional(Type.String({ format: 'date-time' }))
})

// Player DTOs
export const playerSchema = Type.Object({
  pubkey: pubKeySchema,
  wallet: pubKeySchema,
  game: pubKeySchema,
  cashBalance: cashAmountSchema,
  netWorth: cashAmountSchema,
  position: Type.Number({ minimum: 0, maximum: 39 }),
  inJail: Type.Boolean(),
  jailTurns: Type.Number({ minimum: 0, maximum: 3 }),
  doublesCount: Type.Number({ minimum: 0, maximum: 3 }),
  isBankrupt: Type.Boolean(),
  propertiesOwned: Type.Array(Type.Number({ minimum: 0, maximum: 39 })),
  getOutOfJailCards: Type.Number({ minimum: 0 }),
  hasRolledDice: Type.Boolean(),
  lastDiceRoll: diceRollSchema,
  lastRentCollected: Type.Number(),
  festivalBoostTurns: Type.Number({ minimum: 0 }),
  cardDrawnAt: Type.Optional(Type.Number()),
  needsPropertyAction: Type.Boolean(),
  pendingPropertyPosition: Type.Optional(Type.Number({ minimum: 0, maximum: 39 })),
  needsChanceCard: Type.Boolean(),
  needsCommunityChestCard: Type.Boolean(),
  needsBankruptcyCheck: Type.Boolean(),
  needsSpecialSpaceAction: Type.Boolean(),
  pendingSpecialSpacePosition: Type.Optional(Type.Number({ minimum: 0, maximum: 39 })),
  accountCreatedAt: Type.String({ format: 'date-time' }),
  accountUpdatedAt: Type.String({ format: 'date-time' }),
  createdSlot: Type.Number(),
  updatedSlot: Type.Number(),
  lastSignature: Type.Optional(signatureSchema)
})

export const playerStatsSchema = Type.Object({
  wallet: pubKeySchema,
  totalGames: Type.Number(),
  gamesWon: Type.Number(),
  gamesLost: Type.Number(),
  winRate: Type.Number({ minimum: 0, maximum: 1 }),
  averageGameDuration: Type.Number(),
  totalEarnings: cashAmountSchema,
  averageNetWorth: cashAmountSchema,
  propertiesAcquired: Type.Number(),
  tradesCompleted: Type.Number()
})

export const playerActionRequestSchema = Type.Object({
  gameId: Type.Number(),
  playerId: pubKeySchema,
  action: Type.Union([
    Type.Literal('rollDice'),
    Type.Literal('endTurn'),
    Type.Literal('buyProperty'),
    Type.Literal('declineProperty'),
    Type.Literal('payJailFine'),
    Type.Literal('drawChanceCard'),
    Type.Literal('drawCommunityChestCard')
  ]),
  params: Type.Optional(Type.Record(Type.String(), Type.Any()))
})

export const playerFilterSchema = Type.Object({
  gameId: Type.Optional(pubKeySchema),
  minBalance: Type.Optional(cashAmountSchema),
  maxBalance: Type.Optional(cashAmountSchema),
  minProperties: Type.Optional(Type.Number({ minimum: 0 })),
  maxProperties: Type.Optional(Type.Number({ minimum: 0 })),
  isActive: Type.Optional(Type.Boolean())
})

// Export types
export type Game = Static<typeof gameSchema>
export type CreateGameRequest = Static<typeof createGameRequestSchema>
export type JoinGameRequest = Static<typeof joinGameRequestSchema>
export type GameFilter = Static<typeof gameFilterSchema>
export type Player = Static<typeof playerSchema>
export type PlayerStats = Static<typeof playerStatsSchema>
export type PlayerActionRequest = Static<typeof playerActionRequestSchema>
export type PlayerFilter = Static<typeof playerFilterSchema>
