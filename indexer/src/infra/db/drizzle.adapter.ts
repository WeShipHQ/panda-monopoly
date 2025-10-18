import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq, count, and, gte, desc, asc } from 'drizzle-orm'
import type { DatabasePort, QueryFilters, PaginationOptions, PaginatedResult } from './db.port'
import {
  platformConfigs,
  gameStates,
  playerStates,
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
  public pool: Pool
  public db: ReturnType<typeof drizzle>
  public isConnected = false

  constructor() {
    // Khởi tạo lại Pool với cấu hình mới để đảm bảo sử dụng DATABASE_URL mới nhất
    const dbUrl = process.env.DATABASE_URL
    console.log(`Connecting to database with URL pattern: ${dbUrl ? dbUrl.substring(0, 10) + '...' : 'undefined'}`)

    this.pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10, // Giảm số lượng kết nối để tránh quá tải
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // Thêm các tùy chọn để tăng độ tin cậy
      application_name: 'monopoly-indexer',
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000
    })

    // Thêm xử lý lỗi cho pool
    this.pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err)
    })

    this.db = drizzle(this.pool)
  }

  private buildDirectSupabaseUrl(url?: string): string | null {
    if (!url) return null
    try {
      const parsed = new URL(url)
      const hostname = parsed.hostname

      const envDirectHost = process.env.SUPABASE_DIRECT_DB_HOST
      const projectRef = process.env.SUPABASE_PROJECT_REF

      let directHost: string | null = null

      // Prefer explicit override via env
      if (envDirectHost && envDirectHost.length > 0) {
        directHost = envDirectHost
      } else if (hostname.includes('pooler.supabase.com') && projectRef && projectRef.length > 0) {
        // Build direct host from project ref when original is region pooler
        directHost = `db.${projectRef}.supabase.co`
      } else if (/^db\.[a-z0-9-]{20,}\.supabase\.co$/.test(hostname)) {
        // Already a direct host
        directHost = hostname
      }

      if (!directHost) return null

      parsed.hostname = directHost
      parsed.port = '5432'
      return parsed.toString()
    } catch {
      return null
    }
  }

  async init(): Promise<void> {
    try {
      // Thử kết nối với timeout ngắn hơn để phát hiện lỗi sớm
      const client = await this.pool.connect()
      try {
        await client.query('SELECT 1 as connection_test')
        console.log('✅ Database connection successful')
        this.isConnected = true
      } finally {
        client.release()
      }
    } catch (error) {
      console.warn(`Database initialization failed: ${this.formatDbError(error)}`)

      // Kiểm tra xem có phải lỗi kết nối không và thử fallback sang direct 5432
      if ((error as any).code === 'ECONNREFUSED') {
        const fallbackUrl = this.buildDirectSupabaseUrl(process.env.DATABASE_URL)
        if (fallbackUrl) {
          console.warn('Primary DB refused; retrying with direct Supabase port 5432')
          try {
            const newPool = new Pool({
              connectionString: fallbackUrl,
              ssl: { rejectUnauthorized: false },
              max: 10,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 10000,
              application_name: 'monopoly-indexer',
              keepAlive: true,
              keepAliveInitialDelayMillis: 10000
            })
            newPool.on('error', (err) => {
              console.error('Unexpected database pool error (fallback):', err)
            })

            const client2 = await newPool.connect()
            try {
              await client2.query('SELECT 1 as connection_test')
              console.log('✅ Fallback database connection successful')
              this.isConnected = true
            } finally {
              client2.release()
            }

            // Đóng pool cũ và hoán đổi sang pool fallback
            try {
              await this.pool.end()
            } catch (e) {
              console.warn('Failed to end old pool:', e)
            }
            this.pool = newPool
            this.db = drizzle(this.pool)
            return
          } catch (fallbackErr) {
            console.warn(`Fallback connection failed: ${this.formatDbError(fallbackErr)}`)
          }
        } else {
          console.warn('Direct Supabase host not resolvable from current DATABASE_URL; skipping fallback to 5432')
        }
      }

      console.warn(`⚠️ Database connection failed, continuing without DB: ${this.formatDbError(error)}`)
      // Keep isConnected=false and allow app to continue
      return
    }
  }

  async query(sql: string, params?: unknown[]): Promise<unknown[]> {
    if (!this.isConnected) {
      console.warn('DB not connected; skipping query execution')
      return []
    }
    try {
      const result = await this.pool.query(sql, params)
      return result.rows
    } catch (error: any) {
      // Nếu lỗi kết nối bị từ chối, thử chuyển sang endpoint direct 5432 và retry
      if (error?.code === 'ECONNREFUSED' || error?.name === 'AggregateError') {
        const fallbackUrl = this.buildDirectSupabaseUrl(process.env.DATABASE_URL)
        if (fallbackUrl) {
          console.warn('Query failed (ECONNREFUSED); switching to direct Supabase 5432 and retrying')
          try {
            const newPool = new Pool({
              connectionString: fallbackUrl,
              ssl: { rejectUnauthorized: false },
              max: 10,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 10000,
              application_name: 'monopoly-indexer',
              keepAlive: true,
              keepAliveInitialDelayMillis: 10000
            })
            newPool.on('error', (err) => {
              console.error('Unexpected database pool error (fallback):', err)
            })

            const client = await newPool.connect()
            try {
              await client.query('SELECT 1')
              this.isConnected = true
            } finally {
              client.release()
            }

            try {
              await this.pool.end()
            } catch (e) {
              console.warn('Failed to end old pool:', e)
            }
            this.pool = newPool
            this.db = drizzle(this.pool)

            const retry = await this.pool.query(sql, params)
            return retry.rows
          } catch (fallbackErr) {
            console.error('Fallback retry failed:', fallbackErr)
          }
        }
      }

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
        await this.ensurePlatformConfigExists(gameState.configId)

        // Calculate actual gameId from platform config if placeholder value
        if (processedGameState.gameId === -1) {
          processedGameState.gameId = await this.calculateGameId(gameState.configId)
        }
      }

      // Xử lý dữ liệu JSON lớn
      // Giới hạn kích thước của các trường JSON
      if (processedGameState.properties && Array.isArray(processedGameState.properties)) {
        // Giữ lại thông tin cần thiết, loại bỏ dữ liệu không cần thiết
        processedGameState.properties = processedGameState.properties.map((prop) => ({
          pubkey: prop.pubkey,
          game: prop.game,
          position: prop.position,
          owner: prop.owner,
          price: prop.price,
          colorGroup: prop.colorGroup,
          propertyType: prop.propertyType,
          houses: prop.houses,
          hasHotel: prop.hasHotel,
          isMortgaged: prop.isMortgaged,
          rentBase: prop.rentBase || 0,
          rentWithColorGroup: prop.rentWithColorGroup || 0,
          rentWithHouses: prop.rentWithHouses || [0, 0, 0, 0],
          rentWithHotel: prop.rentWithHotel || 0,
          houseCost: prop.houseCost || 0,
          mortgageValue: prop.mortgageValue || 0,
          lastRentPaid: prop.lastRentPaid,
          init: prop.init
        }))
      }

      // Sử dụng raw query để tránh lỗi khi dữ liệu quá lớn
      const query = `
        INSERT INTO game_states (
          pubkey, game_id, config_id, authority, bump, max_players, 
          current_players, current_turn, players, created_at, game_status, 
          turn_started_at, time_limit, bank_balance, free_parking_pool, 
          houses_remaining, hotels_remaining, winner, next_trade_id, 
          active_trades, properties, trades, account_created_at, 
          account_updated_at, created_slot, updated_slot, last_signature
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
        ON CONFLICT (pubkey) DO UPDATE SET
          game_id = $2,
          config_id = $3,
          authority = $4,
          bump = $5,
          max_players = $6,
          current_players = $7,
          current_turn = $8,
          players = $9,
          created_at = $10,
          game_status = $11,
          turn_started_at = $12,
          time_limit = $13,
          bank_balance = $14,
          free_parking_pool = $15,
          houses_remaining = $16,
          hotels_remaining = $17,
          winner = $18,
          next_trade_id = $19,
          active_trades = $20,
          properties = $21,
          trades = $22,
          account_created_at = $23,
          account_updated_at = $24,
          created_slot = $25,
          updated_slot = $26,
          last_signature = $27
      `

      // Chuẩn bị các tham số
      const params = [
        processedGameState.pubkey,
        processedGameState.gameId,
        processedGameState.configId,
        processedGameState.authority,
        processedGameState.bump,
        processedGameState.maxPlayers,
        processedGameState.currentPlayers,
        processedGameState.currentTurn,
        JSON.stringify(processedGameState.players || []),
        processedGameState.createdAt,
        processedGameState.gameStatus,
        processedGameState.turnStartedAt,
        processedGameState.timeLimit,
        processedGameState.bankBalance,
        processedGameState.freeParkingPool,
        processedGameState.housesRemaining,
        processedGameState.hotelsRemaining,
        processedGameState.winner,
        processedGameState.nextTradeId,
        JSON.stringify(processedGameState.activeTrades || []),
        JSON.stringify(processedGameState.properties || []),
        JSON.stringify(processedGameState.trades || []),
        processedGameState.accountCreatedAt,
        processedGameState.accountUpdatedAt || new Date(),
        processedGameState.createdSlot,
        processedGameState.updatedSlot,
        processedGameState.lastSignature
      ]

      // Thực hiện truy vấn
      await this.pool.query(query, params)
    } catch (error) {
      console.error(`Error details for game state ${gameState.pubkey}:`, error)
      // Ghi log lỗi nhưng không dừng quá trình xử lý
      console.warn(`⚠️ Failed to upsert game state ${gameState.pubkey}, continuing with processing: ${error}`)
    }
  }

  private async ensurePlatformConfigExists(configId: string): Promise<void> {
    try {
      // Check if platform config already exists
      const existing = await this.db
        .select({ id: platformConfigs.id })
        .from(platformConfigs)
        .where(eq(platformConfigs.id, configId))
        .limit(1)

      if (existing.length === 0) {
        // Create fallback platform config to prevent blocking gameState processing
        console.warn(`⚠️ Platform config ${configId} not found - creating fallback to unblock processing`)

        const fallbackConfig = {
          id: configId,
          pubkey: configId,
          feeBasisPoints: 500, // Default 5% fee
          authority: configId, // Placeholder - will be enriched later
          feeVault: configId, // Placeholder - will be enriched later
          totalGamesCreated: 0,
          nextGameId: 0,
          bump: 255, // Placeholder bump
          accountCreatedAt: new Date(),
          accountUpdatedAt: new Date(),
          createdSlot: 0,
          updatedSlot: 0,
          lastSignature: null
        }

        await this.db.insert(platformConfigs).values(fallbackConfig).onConflictDoNothing()
        console.info(`✅ Created fallback platform config ${configId}`)
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      if (err.message?.includes('RETRYABLE:')) {
        throw error // Re-throw retryable errors
      }
      console.warn(`Failed to check platform config exists: ${error}`)
      // Don't throw non-retryable errors - let gameState insert continue
    }
  }

  private async calculateGameId(configId: string): Promise<number> {
    try {
      // GameId should come from blockchain data, not calculated here
      // This method is only called when gameId is placeholder (-1)
      // In proper implementation, gameId should be extracted from GameState account data

      console.warn(`⚠️ GameId calculation should not be needed - gameId should come from blockchain`)
      console.warn(`⚠️ This indicates incomplete blockchain data parsing for config ${configId}`)

      // Return 0 as fallback, but this should be addressed in account parsing
      return 0
    } catch (error) {
      console.warn(`Failed to process gameId for config ${configId}: ${error}`)
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

  async checkGameExists(pubkey: string): Promise<boolean> {
    try {
      const result = await this.db
        .select({ pubkey: gameStates.pubkey })
        .from(gameStates)
        .where(eq(gameStates.pubkey, pubkey))
        .limit(1)
      return result.length > 0
    } catch (error) {
      throw new Error(`Failed to check game existence ${pubkey}: ${error}`)
    }
  }

  async getGameStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<GameState>> {
    return this.executeFilteredQuery(gameStates, filters, pagination, this.buildGameStateFilters)
  }

  async getAllGameStates(): Promise<GameState[]> {
    try {
      return await this.db.select().from(gameStates)
    } catch (error) {
      throw new Error(`Failed to get all game states: ${error}`)
    }
  }

  async updateGameState(pubkey: string, updates: Partial<NewGameState>): Promise<void> {
    try {
      const processedUpdates = this.processDateFields(updates)
      await this.db
        .update(gameStates)
        .set({
          ...processedUpdates,
          accountUpdatedAt: new Date()
        })
        .where(eq(gameStates.pubkey, pubkey))
    } catch (error) {
      throw new Error(`Failed to update game state ${pubkey}: ${error}`)
    }
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
    const processed = this.processDateFields(propertyState)

    const targetGamePubkey = (processed as any).game as string | undefined
    if (!targetGamePubkey) {
      throw new Error(`Failed to upsert property state ${propertyState.pubkey}: missing game pubkey for embedding`)
    }

    try {
      const games = await this.db.select().from(gameStates).where(eq(gameStates.pubkey, targetGamePubkey)).limit(1)
      const game = games[0] as any
      if (!game) {
        // Log more details for debugging
        console.warn(`⚠️ Target game ${targetGamePubkey} not found for property ${propertyState.pubkey}`)
        console.warn(`⚠️ This might be a race condition - game may not be processed yet`)
        console.warn(`⚠️ Property details:`, {
          property: propertyState.pubkey,
          position: propertyState.position,
          owner: propertyState.owner
        })

        // Throw a retryable error - this will be handled by the worker with exponential backoff
        throw new Error(
          `RETRYABLE: Target game ${targetGamePubkey} not found for property ${propertyState.pubkey} - likely race condition`
        )
      }

      const currentList: PropertyState[] = game.properties ?? []
      const nextList = updateEmbeddedPropertyList(currentList, processed)

      await this.db
        .update(gameStates)
        .set({ properties: nextList as any, accountUpdatedAt: new Date() })
        .where(eq(gameStates.pubkey, targetGamePubkey))
    } catch (error) {
      throw new Error(`Failed to upsert property state ${propertyState.pubkey}: ${error}`)
    }
  }

  async getPropertyState(pubkey: string): Promise<PropertyState | null> {
    try {
      const games = (await this.db.select().from(gameStates)) as any[]
      for (const game of games) {
        const props: PropertyState[] = game.properties ?? []
        const found = props.find((p) => p.pubkey === pubkey)
        if (found) return { ...found, game: game.pubkey }
      }
      return null
    } catch (error) {
      throw new Error(`Failed to get property state ${pubkey}: ${error}`)
    }
  }

  async getPropertyStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PropertyState>> {
    try {
      const page = pagination.page ?? 1
      const limit = Math.min(pagination.limit ?? 20, 100)
      const offset = (page - 1) * limit

      let games: any[]
      if (filters.game) {
        games = (await this.db
          .select()
          .from(gameStates)
          .where(eq(gameStates.pubkey, filters.game as string))) as any[]
      } else {
        games = (await this.db.select().from(gameStates)) as any[]
      }

      let all: PropertyState[] = []
      for (const g of games) {
        const props: PropertyState[] = g.properties ?? []
        all = all.concat(props.map((p) => ({ ...p, game: g.pubkey }) as any))
      }

      const predicates = this.buildEmbeddedPropertyPredicates(filters)
      const filtered = all.filter((p) => predicates.every((fn) => fn(p)))

      const sortBy = (pagination.sortBy as keyof PropertyState) || 'accountUpdatedAt'
      const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1
      filtered.sort((a: any, b: any) => {
        const av = a?.[sortBy]
        const bv = b?.[sortBy]
        if (av === bv) return 0
        return av > bv ? sortOrder : -sortOrder
      })

      const data = filtered.slice(offset, offset + limit)
      return { data, total: filtered.length, page, limit }
    } catch (error) {
      throw new Error(`Failed to get property states: ${error}`)
    }
  }

  // ==================== TRADE STATE OPERATIONS ====================

  async upsertTradeState(tradeState: NewTradeState): Promise<void> {
    const processed = this.processDateFields(tradeState)

    const targetGamePubkey = (processed as any).game as string | undefined
    if (!targetGamePubkey) {
      throw new Error(`Failed to upsert trade state ${tradeState.pubkey}: missing game pubkey for embedding`)
    }

    try {
      const games = await this.db.select().from(gameStates).where(eq(gameStates.pubkey, targetGamePubkey)).limit(1)
      const game = games[0] as any
      if (!game) {
        // Log more details for debugging
        console.warn(`⚠️ Target game ${targetGamePubkey} not found for trade ${tradeState.pubkey}`)
        console.warn(`⚠️ This might be a race condition - game may not be processed yet`)
        console.warn(`⚠️ Trade details:`, {
          trade: tradeState.pubkey,
          proposer: tradeState.proposer,
          receiver: tradeState.receiver,
          status: tradeState.status
        })

        // Throw a retryable error instead of skipping - this will allow the job to be retried
        throw new Error(
          `RETRYABLE: Target game ${targetGamePubkey} not found for trade ${tradeState.pubkey} - likely race condition`
        )
      }

      const currentList: TradeState[] = game.trades ?? []
      const nextList = updateEmbeddedTradeList(currentList, processed)

      await this.db
        .update(gameStates)
        .set({ trades: nextList as any, accountUpdatedAt: new Date() })
        .where(eq(gameStates.pubkey, targetGamePubkey))
    } catch (error) {
      throw new Error(`Failed to upsert trade state ${tradeState.pubkey}: ${error}`)
    }
  }

  async getTradeState(pubkey: string): Promise<TradeState | null> {
    try {
      const games = (await this.db.select().from(gameStates)) as any[]
      for (const game of games) {
        const trades: TradeState[] = game.trades ?? []
        const found = trades.find((t) => t.pubkey === pubkey)
        if (found) return { ...found, game: game.pubkey }
      }
      return null
    } catch (error) {
      throw new Error(`Failed to get trade state ${pubkey}: ${error}`)
    }
  }

  async getTradeStates(
    filters: QueryFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<TradeState>> {
    try {
      const page = pagination.page ?? 1
      const limit = Math.min(pagination.limit ?? 20, 100)
      const offset = (page - 1) * limit

      let games: any[]
      if (filters.game) {
        games = (await this.db
          .select()
          .from(gameStates)
          .where(eq(gameStates.pubkey, filters.game as string))) as any[]
      } else {
        games = (await this.db.select().from(gameStates)) as any[]
      }

      let all: TradeState[] = []
      for (const g of games) {
        const trades: TradeState[] = g.trades ?? []
        all = all.concat(trades.map((t) => ({ ...t, game: g.pubkey }) as any))
      }

      const predicates = this.buildEmbeddedTradePredicates(filters)
      const filtered = all.filter((t) => predicates.every((fn) => fn(t)))

      const sortBy = (pagination.sortBy as keyof TradeState) || 'accountUpdatedAt'
      const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1
      filtered.sort((a: any, b: any) => {
        const av = a?.[sortBy]
        const bv = b?.[sortBy]
        if (av === bv) return 0
        return av > bv ? sortOrder : -sortOrder
      })

      const data = filtered.slice(offset, offset + limit)
      return { data, total: filtered.length, page, limit }
    } catch (error) {
      throw new Error(`Failed to get trade states: ${error}`)
    }
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

  private processDateFields<T extends object>(data: T): T {
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
      const page = Math.max(1, pagination.page ?? 1)
      const limit = Math.min(pagination.limit ?? 20, 100)
      const offset = (page - 1) * limit

      // Nếu DB chưa kết nối, trả về kết quả rỗng an toàn
      if (!this.isConnected) {
        return { data: [], total: 0, page, limit }
      }

      const conditions = filterBuilder.call(this, filters)
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined

      const fallbackSortField = 'accountUpdatedAt'
      const resolvedSortField = this.resolveSortField(table, pagination.sortBy, fallbackSortField)
      const sortDirection = pagination.sortOrder === 'asc' ? asc : desc
      const orderBy = sortDirection((table as any)[resolvedSortField])

      // Kiểm tra nếu đang truy vấn bảng game_states
      if (table === gameStates) {
        // Xây dựng WHERE clause an toàn với các bộ lọc đã biết
        const whereParts: string[] = []
        const params: unknown[] = []
        let idx = 1

        const f = filters || {}

        if (f.gameStatus !== undefined) {
          whereParts.push(`game_status = $${idx++}`)
          params.push(f.gameStatus as string)
        }
        if (f.authority !== undefined) {
          whereParts.push(`authority = $${idx++}`)
          params.push(f.authority as string)
        }
        if (f.maxPlayers !== undefined) {
          whereParts.push(`max_players = $${idx++}`)
          params.push(Number(f.maxPlayers))
        }
        if (f.winner !== undefined) {
          whereParts.push(`winner = $${idx++}`)
          params.push(f.winner as string)
        }
        if (f.gameId !== undefined) {
          whereParts.push(`game_id = $${idx++}`)
          params.push(Number(f.gameId))
        }

        const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''

        // Chuyển sort field về snake_case cột DB và xác thực
        const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase())
        const sortRequested = pagination.sortBy ?? 'accountUpdatedAt'
        const candidate = sortRequested.includes('_') ? sortRequested : toSnake(sortRequested)
        const allowedSortColumns = new Set([
          'pubkey',
          'game_id',
          'config_id',
          'authority',
          'bump',
          'max_players',
          'current_players',
          'current_turn',
          'created_at',
          'game_status',
          'turn_started_at',
          'time_limit',
          'bank_balance',
          'free_parking_pool',
          'houses_remaining',
          'hotels_remaining',
          'winner',
          'next_trade_id',
          'account_created_at',
          'account_updated_at',
          'created_slot',
          'updated_slot',
          'last_signature'
        ])
        const sortColumn = allowedSortColumns.has(candidate) ? candidate : 'account_updated_at'
        const sortDir = pagination.sortOrder === 'asc' ? 'ASC' : 'DESC'
        const orderByClause = `ORDER BY ${sortColumn} ${sortDir}`

        // Truy vấn đếm tổng số bản ghi (có tham số)
        const countQuery = `SELECT COUNT(*) FROM game_states ${whereSql}`
        const countRows = (await this.query(countQuery, params)) as any[]
        const total = parseInt(countRows[0]?.count ?? '0', 10)

        // Truy vấn dữ liệu với các trường cần thiết (bỏ qua các trường JSON lớn)
        const dataQuery = `
          SELECT 
            pubkey, game_id, config_id, authority, bump, max_players, 
            current_players, current_turn, players, created_at, game_status, 
            turn_started_at, time_limit, bank_balance, free_parking_pool, 
            houses_remaining, hotels_remaining, winner, next_trade_id,
            account_created_at, account_updated_at, created_slot, updated_slot, last_signature
          FROM game_states
          ${whereSql}
          ${orderByClause}
          LIMIT ${limit} OFFSET ${offset}
        `
        const dataRows = (await this.query(dataQuery, params)) as any[]

        // Chuyển đổi kết quả từ snake_case sang camelCase
        const data = dataRows.map((row) => {
          const camelCaseRow: any = {}
          for (const [key, value] of Object.entries(row)) {
            const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
            camelCaseRow[camelKey] = value
          }

          // Thêm các trường JSON rỗng để tránh lỗi
          camelCaseRow.activeTrades = []
          camelCaseRow.properties = []
          camelCaseRow.trades = []

          return camelCaseRow
        })

        return {
          data: data as T[],
          total,
          page,
          limit
        }
      } else {
        // Sử dụng Drizzle ORM cho các bảng khác
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
      }
    } catch (error) {
      console.error('Query error details:', error)
      throw new Error(`Failed to execute filtered query: ${error}`)
    }
  }

  private resolveSortField(table: any, requested: string | undefined, fallback: string): string {
    const target = requested ?? fallback
    const camelCase = target.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    if ((table as any)[camelCase]) {
      return camelCase
    }
    if ((table as any)[target]) {
      return target
    }
    return fallback
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

    if (filters.gameStatus != null) {
      conditions.push(eq(gameStates.gameStatus, filters.gameStatus as any))
    }
    if (filters.authority != null) {
      conditions.push(eq(gameStates.authority, filters.authority as string))
    }
    if (filters.maxPlayers != null) {
      conditions.push(eq(gameStates.maxPlayers, Number(filters.maxPlayers)))
    }
    if (filters.winner != null) {
      conditions.push(eq(gameStates.winner, filters.winner as string))
    }
    if (filters.gameId != null) {
      conditions.push(eq(gameStates.gameId, Number(filters.gameId)))
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

  private buildEmbeddedPropertyPredicates(filters: QueryFilters) {
    const conditions: Array<(p: PropertyState) => boolean> = []

    if (filters.owner) {
      const owner = filters.owner as string
      conditions.push((p) => (p.owner ?? undefined) === owner)
    }
    if (filters.colorGroup) {
      const cg = filters.colorGroup as any
      conditions.push((p) => (p as any).colorGroup === cg)
    }
    if (filters.propertyType) {
      const pt = filters.propertyType as any
      conditions.push((p) => (p as any).propertyType === pt)
    }
    if (filters.isMortgaged !== undefined) {
      const m = !!filters.isMortgaged
      conditions.push((p) => !!p.isMortgaged === m)
    }
    if (filters.position !== undefined) {
      const pos = filters.position as number
      conditions.push((p) => (p.position as number) === pos)
    }

    return conditions
  }

  private buildEmbeddedTradePredicates(filters: QueryFilters) {
    const conditions: Array<(t: TradeState) => boolean> = []

    if (filters.proposer) {
      const proposer = filters.proposer as string
      conditions.push((t) => t.proposer === proposer)
    }
    if (filters.receiver) {
      const receiver = filters.receiver as string
      conditions.push((t) => t.receiver === receiver)
    }
    if (filters.status) {
      const status = filters.status as any
      conditions.push((t) => (t as any).status === status)
    }
    if (filters.tradeType) {
      const tt = filters.tradeType as any
      conditions.push((t) => (t as any).tradeType === tt)
    }
    if (filters.expiresBefore !== undefined) {
      const v = filters.expiresBefore as number
      conditions.push((t) => (t.expiresAt ?? Number.MAX_SAFE_INTEGER) < v)
    }
    if (filters.expiresAfter !== undefined) {
      const v = filters.expiresAfter as number
      conditions.push((t) => (t.expiresAt ?? 0) > v)
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

  private formatDbError(error: unknown): string {
    if (error instanceof AggregateError) {
      const collected: unknown[] = []

      // Handle errors array
      if (Array.isArray(error.errors)) {
        collected.push(...error.errors)
      }

      if (collected.length === 0) {
        return error.message || 'AggregateError'
      }

      const formatted = collected.map((err) => this.formatDbError(err)).join('; ')
      return formatted ? `AggregateError(${formatted})` : 'AggregateError'
    }

    if (error instanceof Error) {
      const parts = [error.message]
      const pgError = error as { code?: string; detail?: string }

      if (pgError.code) {
        parts.push(`code=${pgError.code}`)
      }
      if (pgError.detail) {
        parts.push(`detail=${pgError.detail}`)
      }
      if (error.cause) {
        parts.push(`cause=${this.formatDbError(error.cause)}`)
      }
      return parts.join(' | ')
    }

    return typeof error === 'string' ? error : JSON.stringify(error)
  }
}

// ==================== EMBEDDED LIST HELPERS ====================

function updateEmbeddedPropertyList(list: PropertyState[], incoming: NewPropertyState): PropertyState[] {
  const idx = list.findIndex((p) => p.pubkey === (incoming as any).pubkey)
  if (idx >= 0) {
    const next = [...list]
    const merged = { ...next[idx], ...(incoming as any) }
    delete (merged as any).game
    next[idx] = merged as any
    return next
  }

  const item = { ...(incoming as any) }
  delete (item as any).game
  return [...list, item as any]
}

function updateEmbeddedTradeList(list: TradeState[], incoming: NewTradeState): TradeState[] {
  const idx = list.findIndex((t) => t.pubkey === (incoming as any).pubkey)
  if (idx >= 0) {
    const next = [...list]
    const merged = { ...next[idx], ...(incoming as any) }
    delete (merged as any).game
    next[idx] = merged as any
    return next
  }

  const item = { ...(incoming as any) }
  delete (item as any).game
  return [...list, item as any]
}
