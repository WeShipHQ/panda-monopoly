import { Type, Static } from '@sinclair/typebox'
import {
  pubKeySchema,
  signatureSchema,
  cashAmountSchema,
  tradeStatusSchema,
  colorGroupSchema,
  propertyTypeSchema,
  tradeTypeSchema
} from './monopoly-types.dto'

// Property DTOs
export const propertySchema = Type.Object({
  pubkey: pubKeySchema,
  position: Type.Number({ minimum: 0, maximum: 39 }),
  owner: Type.Optional(pubKeySchema),
  price: Type.Number({ minimum: 0 }),
  colorGroup: colorGroupSchema,
  propertyType: propertyTypeSchema,
  houses: Type.Number({ minimum: 0, maximum: 4 }),
  hasHotel: Type.Boolean(),
  isMortgaged: Type.Boolean(),
  rentBase: Type.Number({ minimum: 0 }),
  rentWithColorGroup: Type.Number({ minimum: 0 }),
  rentWithHouses: Type.Tuple([
    Type.Number({ minimum: 0 }),
    Type.Number({ minimum: 0 }),
    Type.Number({ minimum: 0 }),
    Type.Number({ minimum: 0 })
  ]),
  rentWithHotel: Type.Number({ minimum: 0 }),
  houseCost: Type.Number({ minimum: 0 }),
  mortgageValue: Type.Number({ minimum: 0 }),
  lastRentPaid: Type.Number(),
  accountCreatedAt: Type.String({ format: 'date-time' }),
  accountUpdatedAt: Type.String({ format: 'date-time' }),
  createdSlot: Type.Number(),
  updatedSlot: Type.Number(),
  lastSignature: Type.Optional(signatureSchema)
})

export const propertyFilterSchema = Type.Object({
  owner: Type.Optional(pubKeySchema),
  colorGroup: Type.Optional(colorGroupSchema),
  propertyType: Type.Optional(propertyTypeSchema),
  isMortgaged: Type.Optional(Type.Boolean()),
  hasBuildings: Type.Optional(Type.Boolean()),
  priceRange: Type.Optional(
    Type.Object({
      min: Type.Number({ minimum: 0 }),
      max: Type.Number({ minimum: 0 })
    })
  )
})

export const buildPropertyRequestSchema = Type.Object({
  propertyPosition: Type.Number({ minimum: 0, maximum: 39 }),
  buildingType: Type.Union([Type.Literal('house'), Type.Literal('hotel')]),
  quantity: Type.Number({ minimum: 1, maximum: 4 })
})

export const mortgagePropertyRequestSchema = Type.Object({
  propertyPosition: Type.Number({ minimum: 0, maximum: 39 }),
  action: Type.Union([Type.Literal('mortgage'), Type.Literal('unmortgage')])
})

// Trade DTOs
export const tradeSchema = Type.Object({
  pubkey: pubKeySchema,
  game: pubKeySchema,
  proposer: pubKeySchema,
  receiver: pubKeySchema,
  tradeType: tradeTypeSchema,
  proposerMoney: cashAmountSchema,
  receiverMoney: cashAmountSchema,
  proposerProperty: Type.Optional(Type.Number({ minimum: 0, maximum: 39 })),
  receiverProperty: Type.Optional(Type.Number({ minimum: 0, maximum: 39 })),
  status: tradeStatusSchema,
  createdAt: Type.Number(),
  expiresAt: Type.Number(),
  bump: Type.Number(),
  accountCreatedAt: Type.String({ format: 'date-time' }),
  accountUpdatedAt: Type.String({ format: 'date-time' }),
  createdSlot: Type.Number(),
  updatedSlot: Type.Number(),
  lastSignature: Type.Optional(signatureSchema)
})

export const createTradeRequestSchema = Type.Object({
  gameId: Type.Number(),
  receiverWallet: pubKeySchema,
  tradeType: tradeTypeSchema,
  proposerMoney: Type.Optional(cashAmountSchema),
  receiverMoney: Type.Optional(cashAmountSchema),
  proposerPropertyPosition: Type.Optional(Type.Number({ minimum: 0, maximum: 39 })),
  receiverPropertyPosition: Type.Optional(Type.Number({ minimum: 0, maximum: 39 })),
  expirationHours: Type.Optional(Type.Number({ minimum: 1, maximum: 168 })) // Max 1 week
})

export const tradeActionRequestSchema = Type.Object({
  tradeId: pubKeySchema,
  action: Type.Union([Type.Literal('accept'), Type.Literal('reject'), Type.Literal('cancel')])
})

export const tradeFilterSchema = Type.Object({
  gameId: Type.Optional(Type.Number()),
  proposer: Type.Optional(pubKeySchema),
  receiver: Type.Optional(pubKeySchema),
  status: Type.Optional(tradeStatusSchema),
  tradeType: Type.Optional(tradeTypeSchema),
  createdAfter: Type.Optional(Type.String({ format: 'date-time' })),
  expiringBefore: Type.Optional(Type.String({ format: 'date-time' }))
})

// Auction DTOs
export const auctionSchema = Type.Object({
  pubkey: pubKeySchema,
  game: pubKeySchema,
  propertyPosition: Type.Number({ minimum: 0, maximum: 39 }),
  currentBid: cashAmountSchema,
  highestBidder: Type.Optional(pubKeySchema),
  startedAt: Type.Number(),
  endsAt: Type.Number(),
  isActive: Type.Boolean(),
  bump: Type.Number(),
  accountCreatedAt: Type.String({ format: 'date-time' }),
  accountUpdatedAt: Type.String({ format: 'date-time' }),
  createdSlot: Type.Number(),
  updatedSlot: Type.Number(),
  lastSignature: Type.Optional(signatureSchema)
})

export const placeBidRequestSchema = Type.Object({
  auctionId: pubKeySchema,
  bidAmount: cashAmountSchema,
  bidderWallet: pubKeySchema
})

export const auctionFilterSchema = Type.Object({
  gameId: Type.Optional(Type.Number()),
  propertyPosition: Type.Optional(Type.Number({ minimum: 0, maximum: 39 })),
  isActive: Type.Optional(Type.Boolean()),
  endingBefore: Type.Optional(Type.String({ format: 'date-time' }))
})

// Export types
export type Property = Static<typeof propertySchema>
export type PropertyFilter = Static<typeof propertyFilterSchema>
export type BuildPropertyRequest = Static<typeof buildPropertyRequestSchema>
export type MortgagePropertyRequest = Static<typeof mortgagePropertyRequestSchema>

export type Trade = Static<typeof tradeSchema>
export type CreateTradeRequest = Static<typeof createTradeRequestSchema>
export type TradeActionRequest = Static<typeof tradeActionRequestSchema>
export type TradeFilter = Static<typeof tradeFilterSchema>

export type Auction = Static<typeof auctionSchema>
export type PlaceBidRequest = Static<typeof placeBidRequestSchema>
export type AuctionFilter = Static<typeof auctionFilterSchema>
