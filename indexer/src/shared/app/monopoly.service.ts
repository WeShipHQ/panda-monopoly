import { DatabasePort } from '#infra/db/db.port'
import { PaginationOptions, PaginationResult, FilterBuilder, SortBuilder } from '../utils/query-builders.util'
import { GameFilters, PlayerFilters, PropertyFilters, TradeFilters } from '../api/monopoly-types.dto'

// Base service with common CRUD operations
export abstract class BaseService<T, F> {
  constructor(protected db: DatabasePort) {}

  abstract getAll(filters?: F, pagination?: PaginationOptions): Promise<{ data: T[]; total: number }>
  abstract getById(id: string): Promise<T | null>
}

// Game service with business logic
export class GameService extends BaseService<any, GameFilters> {
  async getAll(filters?: GameFilters, pagination?: PaginationOptions) {
    return this.db.getGames(filters, pagination)
  }

  async getById(pubkey: string) {
    return this.db.getGame(pubkey)
  }

  async getActiveGames(pagination?: PaginationOptions) {
    return this.db.getGames({ gameStatus: 'InProgress' }, pagination)
  }

  async getGamesByPlayer(playerWallet: string, pagination?: PaginationOptions) {
    return this.db.getGames({ player: playerWallet }, pagination)
  }

  async getGameStatistics() {
    const [totalResult, activeResult, finishedResult] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM games'),
      this.db.query('SELECT COUNT(*) as count FROM games WHERE game_status = $1', ['InProgress']),
      this.db.query('SELECT COUNT(*) as count FROM games WHERE game_status = $1', ['Finished'])
    ])

    return {
      total: parseInt((totalResult[0] as any)?.count || '0'),
      active: parseInt((activeResult[0] as any)?.count || '0'),
      finished: parseInt((finishedResult[0] as any)?.count || '0')
    }
  }
}

// Player service with business logic
export class PlayerService extends BaseService<any, PlayerFilters> {
  async getAll(filters?: PlayerFilters, pagination?: PaginationOptions) {
    return this.db.getPlayers(filters, pagination)
  }

  async getById(pubkey: string) {
    return this.db.getPlayer(pubkey)
  }

  async getPlayersByGame(gameId: string, pagination?: PaginationOptions) {
    return this.db.getPlayers({ gameId }, pagination)
  }

  async getPlayerByWallet(wallet: string) {
    const players = await this.db.getPlayers({ wallet }, { page: 1, limit: 1 })
    return players.data.length > 0 ? players.data[0] : null
  }

  async getPlayerStatistics() {
    const [totalResult, activeResult, avgBalanceResult] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM players'),
      this.db.query(
        'SELECT COUNT(DISTINCT p.wallet) as count FROM players p JOIN games g ON p.game = g.pubkey WHERE g.game_status = $1',
        ['InProgress']
      ),
      this.db.query('SELECT AVG(cash_balance) as avg FROM players')
    ])

    return {
      totalPlayers: parseInt((totalResult[0] as any)?.count || '0'),
      activePlayers: parseInt((activeResult[0] as any)?.count || '0'),
      averageBalance: parseFloat((avgBalanceResult[0] as any)?.avg || '0'),
      topPlayerByBalance: null,
      topPlayerByProperties: null
    }
  }

  async getLeaderboard(rankBy: string = 'balance', limit: number = 10) {
    const orderBy = rankBy === 'balance' ? 'cash_balance' : 'array_length(properties_owned, 1)'
    const results = await this.db.query(
      `
      SELECT p.*, COUNT(g.*) as game_count
      FROM players p 
      LEFT JOIN games g ON p.wallet = g.winner
      ORDER BY ${orderBy} DESC 
      LIMIT $1
    `,
      [limit]
    )

    return results.map((player, index) => ({
      rank: index + 1,
      player,
      value: rankBy === 'balance' ? (player as any).cash_balance : (player as any).properties_owned?.length || 0,
      gameCount: parseInt((player as any).game_count || '0')
    }))
  }
}

// Property service with business logic
export class PropertyService extends BaseService<any, PropertyFilters> {
  async getAll(filters?: PropertyFilters, pagination?: PaginationOptions) {
    return this.db.getProperties(filters, pagination)
  }

  async getById(pubkey: string) {
    return this.db.getProperty(pubkey)
  }

  async getPropertiesByGame(gameId: string, pagination?: PaginationOptions) {
    return this.db.getProperties({ gameId }, pagination)
  }

  async getPropertiesByOwner(ownerId: string, pagination?: PaginationOptions) {
    return this.db.getProperties({ ownerId }, pagination)
  }

  async getAvailableProperties(gameId: string, pagination?: PaginationOptions) {
    return this.db.getProperties({ gameId, isOwned: false }, pagination)
  }

  async getPropertyStatistics() {
    const [totalResult, ownedResult, avgPriceResult] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM properties'),
      this.db.query('SELECT COUNT(*) as count FROM properties WHERE owner IS NOT NULL'),
      this.db.query('SELECT AVG(price) as avg FROM properties WHERE owner IS NOT NULL')
    ])

    return {
      totalProperties: parseInt((totalResult[0] as any)?.count || '0'),
      ownedProperties: parseInt((ownedResult[0] as any)?.count || '0'),
      averagePrice: parseFloat((avgPriceResult[0] as any)?.avg || '0'),
      averageRent: 0,
      mostExpensiveProperty: null,
      mostPopularLocation: null
    }
  }
}

// Trade service with business logic
export class TradeService extends BaseService<any, TradeFilters> {
  async getAll(filters?: TradeFilters, pagination?: PaginationOptions) {
    return this.db.getTrades(filters, pagination)
  }

  async getById(pubkey: string) {
    return this.db.getTrade(pubkey)
  }

  async getTradesByGame(gameId: string, pagination?: PaginationOptions) {
    return this.db.getTrades({ gameId }, pagination)
  }

  async getTradesByPlayer(playerId: string, pagination?: PaginationOptions) {
    const filters = { fromPlayer: playerId }
    return this.db.getTrades(filters, pagination)
  }

  async getPendingTrades(playerId: string, pagination?: PaginationOptions) {
    return this.db.getTrades({ toPlayer: playerId, status: 'Pending' }, pagination)
  }

  async getPropertyTradeHistory(propertyId: string, pagination?: PaginationOptions) {
    return this.db.getTrades({ propertyOffered: propertyId }, pagination)
  }

  async getTradeStatistics() {
    const [totalResult, pendingResult, completedResult, cancelledResult] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM trades'),
      this.db.query('SELECT COUNT(*) as count FROM trades WHERE status = $1', ['Pending']),
      this.db.query('SELECT COUNT(*) as count FROM trades WHERE status = $1', ['Accepted']),
      this.db.query('SELECT COUNT(*) as count FROM trades WHERE status = $1', ['Cancelled'])
    ])

    return {
      totalTrades: parseInt((totalResult[0] as any)?.count || '0'),
      pendingTrades: parseInt((pendingResult[0] as any)?.count || '0'),
      completedTrades: parseInt((completedResult[0] as any)?.count || '0'),
      cancelledTrades: parseInt((cancelledResult[0] as any)?.count || '0'),
      averageTradeValue: 0,
      totalVolume: 0
    }
  }
}
