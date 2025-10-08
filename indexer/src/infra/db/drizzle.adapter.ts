/**
 * Refactored Drizzle Database Adapter Implementation
 *
 * Updated to use proper naming conventions:
 * - players -> playerStates (game-specific player accounts)
 * - properties -> propertyStates (game-specific property accounts)
 * - trades -> tradeStates (game-specific trade accounts)
 * - auctions -> auctionStates (game-specific auction accounts)
 *
 * This allows for future expansion with aggregated tables like:
 * - players (cross-game player profiles)
 * - leaderboards (player statistics)
 *
 * @author Senior Engineer - Following Google Code Standards
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq, count, and, gte, desc, asc } from 'drizzle-orm'
import type { DatabasePort, QueryFilters, PaginationOptions, PaginatedResult } from './db.port'
import {
  platformConfigs,
  gameStates,
  playerStates,
  propertyStates,
  tradeStates,
  auctionStates,
  gameLogs,
  type NewPlatformConfig,
  type NewGameState,
  type NewPlayerState,
  type NewPropertyState,
  type NewTradeState,
  type NewAuctionState,
  type PlatformConfig,
  type GameState,
  type PlayerState,
  type PropertyState,
  type TradeState,
  type AuctionState,
  type GameLog,
  type NewGameLog,
  type GameLogEntry
} from './schema'
import { env } from '#config'

/**
 * PostgreSQL adapter implementation using Drizzle ORM with proper naming
 */
export class DrizzleAdapter implements DatabasePort {
  public readonly pool: Pool
  public readonly db: ReturnType<typeof drizzle>

  constructor() {
    this.pool = new Pool({
      connectionString: env.db.url,
      ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
    this.db = drizzle(this.pool)
  }

  async init(): Promise<void> {
    try {
      await this.pool.query('SELECT 1')
    } catch (error) {
      throw new Error(`Database initialization failed: ${error}`)
    }
  }

  async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    try {
      const result = await this.pool.query(sql, params)
      return result.rows
    } catch (error) {
      throw new Error(`Raw query failed: ${error}`)
    }
  }

  // ==================== PLATFORM CONFIG OPERATIONS ====================

  async upsertPlatformConfig(config: NewPlatformConfig): Promise<void> {
    const processedConfig = this.processDateFields(config)

    try {
      await this.db
        .insert(platformConfigs)
        .values(processedConfig)
        .onConflictDoUpdate({
          target: platformConfigs.pubkey,
          set: {
            ...processedConfig,
            accountUpdatedAt: new Date()
          }
        })
    } catch (error) {
      throw new Error(`Failed to upsert platform config ${config.pubkey}: ${error}`)
    }
  }

  async getPlatformConfig(pubkey: string): Promise<PlatformConfig | null> {
    try {
      const result = await this.db.select().from(platformConfigs).where(eq(platformConfigs.pubkey, pubkey)).limit(1)
      return result[0] ?? null
    } catch (error) {
      throw new Error(`Failed to get platform config ${pubkey}: ${error}`)
    }
  }

  async getPlatformConfigs(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PlatformConfig>> {
    return this.executeFilteredQuery(platformConfigs, filters, pagination, this.buildPlatformConfigFilters)
  }

  // ==================== GAME STATE OPERATIONS ====================

  async upsertGameState(gameState: NewGameState): Promise<void> {
    const processedGameState = this.processDateFields(gameState)

    try {
      // Auto-create platform config if it doesn't exist
      if (gameState.configId && gameState.configId !== 'UNKNOWN') {
        await this.ensurePlatformConfigExists(gameState.configId, gameState.authority)

        // Calculate actual gameId from platform config if placeholder value
        if (processedGameState.gameId === -1) {
          processedGameState.gameId = await this.calculateGameId(gameState.configId)
        }
      }

      await this.db
        .insert(gameStates)
        .values(processedGameState)
        .onConflictDoUpdate({
          target: gameStates.pubkey,
          set: {
            ...processedGameState,
            accountUpdatedAt: new Date()
          }
        })
    } catch (error) {
      throw new Error(`Failed to upsert game state ${gameState.pubkey}: ${error}`)
    }
  }

  private async ensurePlatformConfigExists(configId: string, authority: string): Promise<void> {
    try {
      // Check if platform config already exists
      const existing = await this.db
        .select({ id: platformConfigs.id })
        .from(platformConfigs)
        .where(eq(platformConfigs.id, configId))
        .limit(1)

      if (existing.length === 0) {
        // Create default platform config
        const defaultPlatformConfig = {
          pubkey: configId,
          id: configId,
          feeBasisPoints: 500, // Default 5%
          authority: authority,
          feeVault: authority, // Default to authority
          totalGamesCreated: 0,
          nextGameId: 1,
          bump: 255,
          accountCreatedAt: new Date(),
          accountUpdatedAt: new Date(),
          createdSlot: 0,
          updatedSlot: 0,
          lastSignature: ''
        }

        await this.db.insert(platformConfigs).values(defaultPlatformConfig).onConflictDoNothing()

        console.log(`🏗️ Auto-created platform config: ${configId}`)
      }
    } catch (error) {
      console.warn(`Failed to ensure platform config exists: ${error}`)
      // Don't throw - let gameState insert continue
    }
  }

  private async calculateGameId(configId: string): Promise<number> {
    try {
      // Get current platform config
      const config = await this.db
        .select({ totalGamesCreated: platformConfigs.totalGamesCreated })
        .from(platformConfigs)
        .where(eq(platformConfigs.id, configId))
        .limit(1)

      if (config.length > 0) {
        // Return the current total games as the gameId for this new game
        const gameId = config[0].totalGamesCreated || 0

        // Update platform config to increment games counter
        await this.db
          .update(platformConfigs)
          .set({
            totalGamesCreated: gameId + 1,
            accountUpdatedAt: new Date()
          })
          .where(eq(platformConfigs.id, configId))

        console.log(`🎮 Assigned gameId ${gameId} for config ${configId}`)
        return gameId
      }

      console.warn(`Platform config not found for ${configId}, using gameId 0`)
      return 0
    } catch (error) {
      console.warn(`Failed to calculate gameId for config ${configId}: ${error}`)
      return 0
    }
  }

  async getGameState(pubkey: string): Promise<GameState | null> {
    try {
      const result = await this.db.select().from(gameStates).where(eq(gameStates.pubkey, pubkey)).limit(1)
      return result[0] ?? null
    } catch (error) {
      throw new Error(`Failed to get game state ${pubkey}: ${error}`)
    }
  }

  async getGameStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<GameState>> {
    return this.executeFilteredQuery(gameStates, filters, pagination, this.buildGameStateFilters)
  }

  // ==================== PLAYER STATE OPERATIONS ====================

  async upsertPlayerState(playerState: NewPlayerState): Promise<void> {
    const processedPlayerState = this.processDateFields(playerState)

    try {
      await this.db
        .insert(playerStates)
        .values(processedPlayerState)
        .onConflictDoUpdate({
          target: playerStates.pubkey,
          set: {
            ...processedPlayerState,
            accountUpdatedAt: new Date()
          }
        })
    } catch (error) {
      throw new Error(`Failed to upsert player state ${playerState.pubkey}: ${error}`)
    }
  }

  async getPlayerState(pubkey: string): Promise<PlayerState | null> {
    try {
      const result = await this.db.select().from(playerStates).where(eq(playerStates.pubkey, pubkey)).limit(1)
      return result[0] ?? null
    } catch (error) {
      throw new Error(`Failed to get player state ${pubkey}: ${error}`)
    }
  }

  async getPlayerStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PlayerState>> {
    return this.executeFilteredQuery(playerStates, filters, pagination, this.buildPlayerStateFilters)
  }

  // ==================== PROPERTY STATE OPERATIONS ====================

  async upsertPropertyState(propertyState: NewPropertyState): Promise<void> {
    const processedPropertyState = this.processDateFields(propertyState)

    try {
      await this.db
        .insert(propertyStates)
        .values(processedPropertyState)
        .onConflictDoUpdate({
          target: propertyStates.pubkey,
          set: {
            ...processedPropertyState,
            accountUpdatedAt: new Date()
          }
        })
    } catch (error) {
      throw new Error(`Failed to upsert property state ${propertyState.pubkey}: ${error}`)
    }
  }

  async getPropertyState(pubkey: string): Promise<PropertyState | null> {
    try {
      const result = await this.db.select().from(propertyStates).where(eq(propertyStates.pubkey, pubkey)).limit(1)
      return result[0] ?? null
    } catch (error) {
      throw new Error(`Failed to get property state ${pubkey}: ${error}`)
    }
  }

  async getPropertyStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PropertyState>> {
    return this.executeFilteredQuery(propertyStates, filters, pagination, this.buildPropertyStateFilters)
  }

  // ==================== TRADE STATE OPERATIONS ====================

  async upsertTradeState(tradeState: NewTradeState): Promise<void> {
    const processedTradeState = this.processDateFields(tradeState)

    try {
      await this.db
        .insert(tradeStates)
        .values(processedTradeState)
        .onConflictDoUpdate({
          target: tradeStates.pubkey,
          set: {
            ...processedTradeState,
            accountUpdatedAt: new Date()
          }
        })
    } catch (error) {
      throw new Error(`Failed to upsert trade state ${tradeState.pubkey}: ${error}`)
    }
  }

  async getTradeState(pubkey: string): Promise<TradeState | null> {
    try {
      const result = await this.db.select().from(tradeStates).where(eq(tradeStates.pubkey, pubkey)).limit(1)
      return result[0] ?? null
    } catch (error) {
      throw new Error(`Failed to get trade state ${pubkey}: ${error}`)
    }
  }

  async getTradeStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<TradeState>> {
    return this.executeFilteredQuery(tradeStates, filters, pagination, this.buildTradeStateFilters)
  }

  // ==================== AUCTION STATE OPERATIONS ====================

  async upsertAuctionState(auctionState: NewAuctionState): Promise<void> {
    const processedAuctionState = this.processDateFields(auctionState)

    try {
      await this.db
        .insert(auctionStates)
        .values(processedAuctionState)
        .onConflictDoUpdate({
          target: auctionStates.pubkey,
          set: {
            ...processedAuctionState,
            accountUpdatedAt: new Date()
          }
        })
    } catch (error) {
      throw new Error(`Failed to upsert auction state ${auctionState.pubkey}: ${error}`)
    }
  }

  async getAuctionState(pubkey: string): Promise<AuctionState | null> {
    try {
      const result = await this.db.select().from(auctionStates).where(eq(auctionStates.pubkey, pubkey)).limit(1)
      return result[0] ?? null
    } catch (error) {
      throw new Error(`Failed to get auction state ${pubkey}: ${error}`)
    }
  }

  async getAuctionStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<AuctionState>> {
    return this.executeFilteredQuery(auctionStates, filters, pagination, this.buildAuctionStateFilters)
  }

  // ==================== GAME LOG OPERATIONS ====================

  async createGameLog(
    log: Omit<NewGameLog, 'id' | 'createdAt' | 'accountCreatedAt' | 'accountUpdatedAt'>
  ): Promise<GameLog> {
    const logData = {
      ...log,
      timestamp: log.timestamp || Date.now()
    }

    try {
      const result = await this.db.insert(gameLogs).values(logData).returning()
      return result[0]
    } catch (error) {
      throw new Error(`Failed to create game log: ${error}`)
    }
  }

  async getGameLogs(
    gameId: string,
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<GameLog>> {
    const gameFilters = { ...filters, gameId }
    return this.executeFilteredQuery(gameLogs, gameFilters, pagination, this.buildGameLogFilters)
  }

  async getGameLogsAsEntries(
    gameId: string,
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<GameLogEntry>> {
    const result = await this.getGameLogs(gameId, filters, pagination)

    const entries: GameLogEntry[] = result.data.map((log) => ({
      id: log.id,
      timestamp: Number(log.timestamp),
      type: log.type,
      playerId: log.playerId,
      playerName: log.playerName || undefined,
      message: log.message,
      details: {
        propertyName: log.propertyName || undefined,
        position: log.position || undefined,
        price: log.price ? Number(log.price) : undefined,
        owner: log.owner || undefined,
        cardType: log.cardType as 'chance' | 'community-chest' | undefined,
        cardTitle: log.cardTitle || undefined,
        cardDescription: log.cardDescription || undefined,
        cardIndex: log.cardIndex || undefined,
        effectType: log.effectType || undefined,
        amount: log.amount ? Number(log.amount) : undefined,
        tradeId: log.tradeId || undefined,
        action: log.action || undefined,
        targetPlayer: log.targetPlayer || undefined,
        targetPlayerName: log.targetPlayerName || undefined,
        offeredProperties: log.offeredProperties || undefined,
        requestedProperties: log.requestedProperties || undefined,
        offeredMoney: log.offeredMoney ? Number(log.offeredMoney) : undefined,
        requestedMoney: log.requestedMoney ? Number(log.requestedMoney) : undefined,
        fromPosition: log.fromPosition || undefined,
        toPosition: log.toPosition || undefined,
        diceRoll: log.diceRoll as [number, number] | undefined,
        doublesCount: log.doublesCount || undefined,
        passedGo: log.passedGo || undefined,
        jailReason: log.jailReason as 'doubles' | 'go_to_jail' | 'card' | undefined,
        fineAmount: log.fineAmount ? Number(log.fineAmount) : undefined,
        buildingType: log.buildingType as 'house' | 'hotel' | undefined,
        taxType: log.taxType || undefined,
        signature: log.signature || undefined,
        error: log.error || undefined
      }
    }))

    return {
      data: entries,
      total: result.total,
      page: result.page,
      limit: result.limit
    }
  }

  async deleteGameLogs(gameId: string): Promise<void> {
    try {
      await this.db.delete(gameLogs).where(eq(gameLogs.gameId, gameId))
    } catch (error) {
      throw new Error(`Failed to delete game logs for game ${gameId}: ${error}`)
    }
  }

  // ==================== PRIVATE UTILITY METHODS ====================

  private processDateFields<T extends Record<string, unknown>>(data: T): T {
    const processed = { ...data } as any

    if ('accountCreatedAt' in processed && typeof processed.accountCreatedAt === 'string') {
      processed.accountCreatedAt = new Date(processed.accountCreatedAt)
    }

    if ('accountUpdatedAt' in processed && typeof processed.accountUpdatedAt === 'string') {
      processed.accountUpdatedAt = new Date(processed.accountUpdatedAt)
    }

    if ('createdAt' in processed && typeof processed.createdAt === 'string') {
      processed.createdAt = new Date(processed.createdAt)
    }

    return processed as T
  }

  private async executeFilteredQuery<T extends Record<string, unknown>>(
    table: any,
    filters: QueryFilters,
    pagination: PaginationOptions,
    filterBuilder: (filters: QueryFilters) => any[]
  ): Promise<PaginatedResult<T>> {
    try {
      const page = pagination.page ?? 1
      const limit = Math.min(pagination.limit ?? 20, 100)
      const offset = (page - 1) * limit

      const conditions = filterBuilder.call(this, filters)
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      const sortField = pagination.sortBy || 'accountUpdatedAt'
      const sortDirection = pagination.sortOrder === 'asc' ? asc : desc
      const orderBy = sortDirection((table as any)[sortField])

      const [data, totalResult] = await Promise.all([
        this.db.select().from(table).where(whereClause).orderBy(orderBy).limit(limit).offset(offset),
        this.db.select({ count: count() }).from(table).where(whereClause)
      ])

      return {
        data,
        total: totalResult[0]?.count ?? 0,
        page,
        limit
      }
    } catch (error) {
      throw new Error(`Failed to execute filtered query: ${error}`)
    }
  }

  // ==================== FILTER BUILDERS ====================

  private buildPlatformConfigFilters(filters: QueryFilters) {
    const conditions: any[] = []

    if (filters.authority) {
      conditions.push(eq(platformConfigs.authority, filters.authority as string))
    }
    if (filters.feeVault) {
      conditions.push(eq(platformConfigs.feeVault, filters.feeVault as string))
    }

    return conditions
  }

  private buildGameStateFilters(filters: QueryFilters) {
    const conditions: any[] = []

    if (filters.gameStatus) {
      conditions.push(eq(gameStates.gameStatus, filters.gameStatus as any))
    }
    if (filters.authority) {
      conditions.push(eq(gameStates.authority, filters.authority as string))
    }
    if (filters.maxPlayers) {
      conditions.push(eq(gameStates.maxPlayers, filters.maxPlayers as number))
    }
    if (filters.winner) {
      conditions.push(eq(gameStates.winner, filters.winner as string))
    }
    if (filters.gameId) {
      conditions.push(eq(gameStates.gameId, filters.gameId as number))
    }

    return conditions
  }

  private buildPlayerStateFilters(filters: QueryFilters) {
    const conditions: any[] = []

    if (filters.wallet) {
      conditions.push(eq(playerStates.wallet, filters.wallet as string))
    }
    if (filters.gameId) {
      conditions.push(eq(playerStates.game, filters.gameId as string))
    }
    if (filters.inJail !== undefined) {
      conditions.push(eq(playerStates.inJail, filters.inJail as boolean))
    }
    if (filters.isBankrupt !== undefined) {
      conditions.push(eq(playerStates.isBankrupt, filters.isBankrupt as boolean))
    }
    if (filters.position !== undefined) {
      conditions.push(eq(playerStates.position, filters.position as number))
    }

    return conditions
  }

  private buildPropertyStateFilters(filters: QueryFilters) {
    const conditions: any[] = []

    if (filters.owner) {
      conditions.push(eq(propertyStates.owner, filters.owner as string))
    }
    if (filters.gameId) {
      conditions.push(eq(propertyStates.game, filters.gameId as string))
    }
    if (filters.colorGroup) {
      conditions.push(eq(propertyStates.colorGroup, filters.colorGroup as any))
    }
    if (filters.propertyType) {
      conditions.push(eq(propertyStates.propertyType, filters.propertyType as any))
    }
    if (filters.isMortgaged !== undefined) {
      conditions.push(eq(propertyStates.isMortgaged, filters.isMortgaged as boolean))
    }
    if (filters.position !== undefined) {
      conditions.push(eq(propertyStates.position, filters.position as number))
    }

    return conditions
  }

  private buildTradeStateFilters(filters: QueryFilters) {
    const conditions: any[] = []

    if (filters.gameId) {
      conditions.push(eq(tradeStates.game, filters.gameId as string))
    }
    if (filters.proposer) {
      conditions.push(eq(tradeStates.proposer, filters.proposer as string))
    }
    if (filters.receiver) {
      conditions.push(eq(tradeStates.receiver, filters.receiver as string))
    }
    if (filters.status) {
      conditions.push(eq(tradeStates.status, filters.status as any))
    }
    if (filters.tradeType) {
      conditions.push(eq(tradeStates.tradeType, filters.tradeType as any))
    }

    return conditions
  }

  private buildAuctionStateFilters(filters: QueryFilters) {
    const conditions: any[] = []

    if (filters.gameId) {
      conditions.push(eq(auctionStates.game, filters.gameId as string))
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(auctionStates.isActive, filters.isActive as boolean))
    }
    if (filters.propertyPosition !== undefined) {
      conditions.push(eq(auctionStates.propertyPosition, filters.propertyPosition as number))
    }

    return conditions
  }

  private buildGameLogFilters(filters: QueryFilters) {
    const conditions: any[] = []

    if (filters.gameId) {
      conditions.push(eq(gameLogs.gameId, filters.gameId as string))
    }
    if (filters.playerId) {
      conditions.push(eq(gameLogs.playerId, filters.playerId as string))
    }
    if (filters.type) {
      conditions.push(eq(gameLogs.type, filters.type as any))
    }
    if (filters.position !== undefined) {
      conditions.push(eq(gameLogs.position, filters.position as number))
    }
    if (filters.startTime) {
      conditions.push(gte(gameLogs.timestamp, filters.startTime as number))
    }

    return conditions
  }
}
