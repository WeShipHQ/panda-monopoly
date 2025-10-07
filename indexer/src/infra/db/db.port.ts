// Database port interface with type-safe methods
import {
  NewGame,
  NewPlayer,
  NewProperty,
  NewTrade,
  Game,
  Player,
  Property,
  Trade,
  GameLog,
  NewGameLog,
  GameLogEntry
} from './schema'

// Filter and pagination types
export interface QueryFilters {
  [key: string]: unknown
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page?: number
  limit?: number
}

export interface DatabasePort {
  init(): Promise<void>

  // Raw query execution (for health checks only)
  query(sql: string, params?: unknown[]): Promise<unknown[]>

  // Core upserts (idempotent by pubkey)
  upsertGame(row: NewGame): Promise<void>
  upsertPlayer(row: NewPlayer): Promise<void>
  upsertProperty(row: NewProperty): Promise<void>
  upsertTrade(row: NewTrade): Promise<void>

  // Single entity reads
  getGame(pubkey: string): Promise<Game | null>
  getPlayer(pubkey: string): Promise<Player | null>
  getProperty(pubkey: string): Promise<Property | null>
  getTrade(pubkey: string): Promise<Trade | null>

  // Paginated queries for API endpoints
  getGames(filters?: QueryFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Game>>
  getPlayers(filters?: QueryFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Player>>
  getProperties(filters?: QueryFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Property>>
  getTrades(filters?: QueryFilters, pagination?: PaginationOptions): Promise<PaginatedResult<Trade>>

  // Game Logs CRUD operations
  createGameLog(log: Omit<NewGameLog, 'id' | 'createdAt' | 'accountCreatedAt' | 'accountUpdatedAt'>): Promise<GameLog>
  getGameLogs(gameId: string, filters?: QueryFilters, pagination?: PaginationOptions): Promise<PaginatedResult<GameLog>>
  getGameLogsAsEntries(
    gameId: string,
    filters?: QueryFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<GameLogEntry>>
  deleteGameLogs(gameId: string): Promise<void>
}
