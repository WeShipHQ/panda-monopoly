import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq, count, and, or, gte, desc, asc } from 'drizzle-orm'
import type { DatabasePort, QueryFilters, PaginationOptions, PaginatedResult } from './db.port'
import {
  games,
  players,
  properties,
  trades,
  type NewGame,
  type NewPlayer,
  type NewProperty,
  type NewTrade,
  type Game,
  type Player,
  type Property,
  type Trade
} from './schema'
import { env } from '#config'

export class DrizzleAdapter implements DatabasePort {
  public pool = new Pool({
    connectionString: env.db.url,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  })
  public db = drizzle(this.pool)

  async init() {
    await this.pool.query('select 1')
  }

  async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    const result = await this.pool.query(sql, params)
    return result.rows
  }

  async upsertGame(row: NewGame) {
    // Convert string dates to Date objects if needed
    const processedGameRow = {
      ...row,
      createdAt: typeof row.createdAt === 'string' ? new Date(row.createdAt) : row.createdAt,
      accountCreatedAt:
        typeof row.accountCreatedAt === 'string' ? new Date(row.accountCreatedAt) : row.accountCreatedAt,
      accountUpdatedAt: typeof row.accountUpdatedAt === 'string' ? new Date(row.accountUpdatedAt) : row.accountUpdatedAt
    }

    try {
      const result = await this.db
        .insert(games)
        .values(processedGameRow)
        .onConflictDoUpdate({
          target: games.pubkey,
          set: {
            gameId: processedGameRow.gameId,
            configId: processedGameRow.configId,
            authority: processedGameRow.authority,
            bump: processedGameRow.bump,
            maxPlayers: processedGameRow.maxPlayers,
            currentPlayers: processedGameRow.currentPlayers,
            currentTurn: processedGameRow.currentTurn,
            players: processedGameRow.players,
            createdAt: processedGameRow.createdAt,
            gameStatus: processedGameRow.gameStatus,
            bankBalance: processedGameRow.bankBalance,
            freeParkingPool: processedGameRow.freeParkingPool,
            housesRemaining: processedGameRow.housesRemaining,
            hotelsRemaining: processedGameRow.hotelsRemaining,
            timeLimit: processedGameRow.timeLimit,
            turnStartedAt: processedGameRow.turnStartedAt,
            winner: processedGameRow.winner,
            accountUpdatedAt: processedGameRow.accountUpdatedAt ?? new Date(),
            createdSlot: processedGameRow.createdSlot,
            updatedSlot: processedGameRow.updatedSlot,
            lastSignature: processedGameRow.lastSignature
          }
        })

      console.log('Game upserted:', row.pubkey.slice(0, 8) + '...')
    } catch (error) {
      console.error('[DrizzleAdapter] ❌ Failed to upsert game:', row.pubkey)
      console.error('[DrizzleAdapter] Error details:', error)
      throw error
    }
  }

  async upsertPlayer(row: NewPlayer) {
    // Convert string dates to Date objects if needed
    const processedPlayerRow = {
      ...row,
      accountCreatedAt:
        typeof row.accountCreatedAt === 'string' ? new Date(row.accountCreatedAt) : row.accountCreatedAt,
      accountUpdatedAt: typeof row.accountUpdatedAt === 'string' ? new Date(row.accountUpdatedAt) : row.accountUpdatedAt
    }

    try {
      const result = await this.db
        .insert(players)
        .values(processedPlayerRow)
        .onConflictDoUpdate({
          target: players.pubkey,
          set: {
            wallet: processedPlayerRow.wallet,
            game: processedPlayerRow.game,
            cashBalance: processedPlayerRow.cashBalance,
            netWorth: processedPlayerRow.netWorth,
            position: processedPlayerRow.position,
            inJail: processedPlayerRow.inJail,
            jailTurns: processedPlayerRow.jailTurns,
            doublesCount: processedPlayerRow.doublesCount,
            isBankrupt: processedPlayerRow.isBankrupt,
            propertiesOwned: processedPlayerRow.propertiesOwned,
            getOutOfJailCards: processedPlayerRow.getOutOfJailCards,
            hasRolledDice: processedPlayerRow.hasRolledDice,
            lastDiceRoll: processedPlayerRow.lastDiceRoll,
            lastRentCollected: processedPlayerRow.lastRentCollected,
            festivalBoostTurns: processedPlayerRow.festivalBoostTurns,
            cardDrawnAt: processedPlayerRow.cardDrawnAt,
            needsPropertyAction: processedPlayerRow.needsPropertyAction,
            pendingPropertyPosition: processedPlayerRow.pendingPropertyPosition,
            needsChanceCard: processedPlayerRow.needsChanceCard,
            needsCommunityChestCard: processedPlayerRow.needsCommunityChestCard,
            needsBankruptcyCheck: processedPlayerRow.needsBankruptcyCheck,
            needsSpecialSpaceAction: processedPlayerRow.needsSpecialSpaceAction,
            pendingSpecialSpacePosition: processedPlayerRow.pendingSpecialSpacePosition,
            accountUpdatedAt: processedPlayerRow.accountUpdatedAt ?? new Date(),
            createdSlot: processedPlayerRow.createdSlot,
            updatedSlot: processedPlayerRow.updatedSlot,
            lastSignature: processedPlayerRow.lastSignature
          }
        })

      console.log('Player upserted:', row.wallet.slice(0, 8) + '...')
    } catch (error) {
      console.error('[DrizzleAdapter] ❌ Failed to upsert player:', row.pubkey)
      console.error('[DrizzleAdapter] Error details:', error)
      throw error
    }
  }

  async upsertProperty(row: NewProperty) {
    // Convert string dates to Date objects if needed
    const processedRow = {
      ...row,
      accountCreatedAt:
        typeof row.accountCreatedAt === 'string' ? new Date(row.accountCreatedAt) : row.accountCreatedAt,
      accountUpdatedAt: typeof row.accountUpdatedAt === 'string' ? new Date(row.accountUpdatedAt) : row.accountUpdatedAt
    }

    try {
      const result = await this.db
        .insert(properties)
        .values(processedRow)
        .onConflictDoUpdate({
          target: properties.pubkey,
          set: {
            position: processedRow.position,
            owner: processedRow.owner,
            price: processedRow.price,
            colorGroup: processedRow.colorGroup,
            propertyType: processedRow.propertyType,
            houses: processedRow.houses,
            hasHotel: processedRow.hasHotel,
            isMortgaged: processedRow.isMortgaged,
            rentBase: processedRow.rentBase,
            rentWithColorGroup: processedRow.rentWithColorGroup,
            rentWithHouses: processedRow.rentWithHouses,
            rentWithHotel: processedRow.rentWithHotel,
            houseCost: processedRow.houseCost,
            mortgageValue: processedRow.mortgageValue,
            lastRentPaid: processedRow.lastRentPaid,
            accountUpdatedAt: processedRow.accountUpdatedAt ?? new Date(),
            createdSlot: processedRow.createdSlot,
            updatedSlot: processedRow.updatedSlot,
            lastSignature: processedRow.lastSignature
          }
        })

      console.log('Property upserted: Position', row.position, '→', row.pubkey.slice(0, 8) + '...')
    } catch (error) {
      console.error('[DrizzleAdapter] ❌ Failed to upsert property:', row.pubkey)
      console.error('[DrizzleAdapter] Error details:', error)
      throw error
    }
  }

  async upsertTrade(row: NewTrade) {
    // Convert string dates to Date objects if needed
    const processedTradeRow = {
      ...row,
      accountCreatedAt:
        typeof row.accountCreatedAt === 'string' ? new Date(row.accountCreatedAt) : row.accountCreatedAt,
      accountUpdatedAt: typeof row.accountUpdatedAt === 'string' ? new Date(row.accountUpdatedAt) : row.accountUpdatedAt
    }

    try {
      const result = await this.db
        .insert(trades)
        .values(processedTradeRow)
        .onConflictDoUpdate({
          target: trades.pubkey,
          set: {
            game: processedTradeRow.game,
            proposer: processedTradeRow.proposer,
            receiver: processedTradeRow.receiver,
            tradeType: processedTradeRow.tradeType,
            proposerMoney: processedTradeRow.proposerMoney,
            receiverMoney: processedTradeRow.receiverMoney,
            proposerProperty: processedTradeRow.proposerProperty,
            receiverProperty: processedTradeRow.receiverProperty,
            status: processedTradeRow.status,
            createdAt: processedTradeRow.createdAt,
            expiresAt: processedTradeRow.expiresAt,
            bump: processedTradeRow.bump,
            accountUpdatedAt: processedTradeRow.accountUpdatedAt ?? new Date(),
            createdSlot: processedTradeRow.createdSlot,
            updatedSlot: processedTradeRow.updatedSlot,
            lastSignature: processedTradeRow.lastSignature
          }
        })

      console.log(
        'Trade upserted:',
        row.proposer.slice(0, 8) + '... →',
        row.receiver.slice(0, 8) + '... (',
        row.tradeType,
        ')'
      )
    } catch (error) {
      console.error('[DrizzleAdapter] ❌ Failed to upsert trade:', row.pubkey)
      console.error('[DrizzleAdapter] Error details:', error)
      throw error
    }
  }

  // Single entity reads
  async getGame(pubkey: string): Promise<Game | null> {
    const result = await this.db.select().from(games).where(eq(games.pubkey, pubkey)).limit(1)
    return result[0] ?? null
  }

  async getPlayer(pubkey: string): Promise<Player | null> {
    const result = await this.db.select().from(players).where(eq(players.pubkey, pubkey)).limit(1)
    return result[0] ?? null
  }

  async getProperty(pubkey: string): Promise<Property | null> {
    const result = await this.db.select().from(properties).where(eq(properties.pubkey, pubkey)).limit(1)
    return result[0] ?? null
  }

  async getTrade(pubkey: string): Promise<Trade | null> {
    const result = await this.db.select().from(trades).where(eq(trades.pubkey, pubkey)).limit(1)
    return result[0] ?? null
  }

  // Simplified paginated query methods
  async getGames(filters: QueryFilters = {}, pagination: PaginationOptions = {}): Promise<PaginatedResult<Game>> {
    // Simple pagination
    const page = pagination.page ?? 1
    const limit = Math.min(pagination.limit ?? 20, 100) // Max 100 items
    const offset = (page - 1) * limit

    // Basic filters
    const conditions = []
    if (filters.gameStatus) conditions.push(eq(games.gameStatus, filters.gameStatus as any))
    if (filters.authority) conditions.push(eq(games.authority, filters.authority as string))
    if (filters.maxPlayers) conditions.push(eq(games.maxPlayers, filters.maxPlayers as number))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // Simple sorting
    const orderBy = pagination.sortOrder === 'asc' ? asc(games.accountUpdatedAt) : desc(games.accountUpdatedAt)

    // Execute queries
    const [data, totalResult] = await Promise.all([
      this.db.select().from(games).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
      this.db.select({ count: count() }).from(games).where(whereClause)
    ])

    const total = totalResult[0]?.count ?? 0
    return {
      data,
      total,
      page,
      limit
    }
  }

  async getPlayers(filters: QueryFilters = {}, pagination: PaginationOptions = {}): Promise<PaginatedResult<Player>> {
    const page = pagination.page ?? 1
    const limit = Math.min(pagination.limit ?? 20, 100)
    const offset = (page - 1) * limit

    const conditions = []
    if (filters.wallet) conditions.push(eq(players.wallet, filters.wallet as string))
    if (filters.gameId) conditions.push(eq(players.game, filters.gameId as string))
    if (filters.inJail !== undefined) conditions.push(eq(players.inJail, filters.inJail as boolean))
    if (filters.isBankrupt !== undefined) conditions.push(eq(players.isBankrupt, filters.isBankrupt as boolean))
    if (filters.position !== undefined) conditions.push(eq(players.position, filters.position as number))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const orderBy = pagination.sortOrder === 'asc' ? asc(players.accountUpdatedAt) : desc(players.accountUpdatedAt)

    const [data, totalResult] = await Promise.all([
      this.db.select().from(players).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
      this.db.select({ count: count() }).from(players).where(whereClause)
    ])

    return {
      data,
      total: totalResult[0]?.count ?? 0,
      page,
      limit
    }
  }

  async getProperties(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<Property>> {
    const page = pagination.page ?? 1
    const limit = Math.min(pagination.limit ?? 20, 100)
    const offset = (page - 1) * limit

    const conditions = []
    if (filters.owner) conditions.push(eq(properties.owner, filters.owner as string))
    if (filters.colorGroup) conditions.push(eq(properties.colorGroup, filters.colorGroup as any))
    if (filters.propertyType) conditions.push(eq(properties.propertyType, filters.propertyType as any))
    if (filters.isMortgaged !== undefined) conditions.push(eq(properties.isMortgaged, filters.isMortgaged as boolean))
    if (filters.position !== undefined) conditions.push(eq(properties.position, filters.position as number))

    // Buildings filter
    if (filters.hasBuildings !== undefined) {
      if (filters.hasBuildings) {
        conditions.push(or(gte(properties.houses, 1), eq(properties.hasHotel, true)))
      } else {
        conditions.push(and(eq(properties.houses, 0), eq(properties.hasHotel, false)))
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const orderBy = pagination.sortOrder === 'asc' ? asc(properties.position) : desc(properties.position)

    const [data, totalResult] = await Promise.all([
      this.db.select().from(properties).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
      this.db.select({ count: count() }).from(properties).where(whereClause)
    ])

    return {
      data,
      total: totalResult[0]?.count ?? 0,
      page,
      limit
    }
  }

  async getTrades(filters: QueryFilters = {}, pagination: PaginationOptions = {}): Promise<PaginatedResult<Trade>> {
    const page = pagination.page ?? 1
    const limit = Math.min(pagination.limit ?? 20, 100)
    const offset = (page - 1) * limit

    const conditions = []
    if (filters.gameId) conditions.push(eq(trades.game, filters.gameId as string))
    if (filters.proposer) conditions.push(eq(trades.proposer, filters.proposer as string))
    if (filters.receiver) conditions.push(eq(trades.receiver, filters.receiver as string))
    if (filters.status) conditions.push(eq(trades.status, filters.status as any))
    if (filters.tradeType) conditions.push(eq(trades.tradeType, filters.tradeType as any))

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined
    const orderBy = pagination.sortOrder === 'asc' ? asc(trades.createdAt) : desc(trades.createdAt)

    const [data, totalResult] = await Promise.all([
      this.db.select().from(trades).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
      this.db.select({ count: count() }).from(trades).where(whereClause)
    ])

    return {
      data,
      total: totalResult[0]?.count ?? 0,
      page,
      limit
    }
  }
}
