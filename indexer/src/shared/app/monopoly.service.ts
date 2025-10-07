import { DatabasePort, PaginatedResult } from '#infra/db/db.port'
import { GameFilters, PlayerFilters, PropertyFilters, TradeFilters } from '../api/monopoly-types.dto'
import { GameLog, NewGameLog, GameLogEntry } from '#infra/db/schema'
import { PaginationOptions } from '#shared/utils'

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
    let query = ''
    if (rankBy === 'balance') {
      query = `
        SELECT pubkey, wallet, game, cash_balance, net_worth, properties_owned, 
               account_created_at, 0 as game_count
        FROM players
        ORDER BY cash_balance DESC 
        LIMIT $1
      `
    } else {
      query = `
        SELECT pubkey, wallet, game, cash_balance, net_worth, properties_owned, 
               account_created_at, 0 as game_count,
               CASE WHEN properties_owned IS NULL THEN 0 
                    ELSE json_array_length(properties_owned) END as property_count
        FROM players
        ORDER BY property_count DESC 
        LIMIT $1
      `
    }

    const results = await this.db.query(query, [limit])

    return results.map((player, index) => ({
      rank: index + 1,
      player,
      value: rankBy === 'balance' ? (player as any).cash_balance : (player as any).properties_owned?.length || 0,
      gameCount: parseInt((player as any).game_count || '0')
    }))
  }

  // Get top winners (most games won) - simplified for now
  async getTopWinners(pagination?: PaginationOptions) {
    const limit = pagination?.limit || 10
    const page = pagination?.page || 1
    const offset = (page - 1) * limit

    const results = await this.db.query(
      `
      SELECT p.pubkey, p.wallet, p.game, p.cash_balance, p.net_worth,
             1 as wins, 1 as total_games, 100.0 as win_rate
      FROM players p
      ORDER BY p.net_worth DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    )

    const countResult = await this.db.query('SELECT COUNT(*) as total FROM players')
    const total = parseInt((countResult[0] as any)?.total || '0')

    const data = results.map((player, index) => ({
      rank: offset + index + 1,
      player: {
        pubkey: (player as any).pubkey,
        wallet: (player as any).wallet,
        wins: parseInt((player as any).wins),
        totalGames: parseInt((player as any).total_games),
        winRate: parseFloat((player as any).win_rate)
      },
      value: parseInt((player as any).wins),
      winRate: parseFloat((player as any).win_rate)
    }))

    return {
      data,
      total,
      page,
      limit
    }
  }

  // Get richest players by net worth
  async getRichestPlayers(pagination?: PaginationOptions) {
    const limit = pagination?.limit || 10
    const page = pagination?.page || 1
    const offset = (page - 1) * limit
    const results = await this.db.query(
      `
      SELECT p.pubkey, p.wallet, p.game, p.cash_balance, p.net_worth, p.properties_owned,
             CASE WHEN p.properties_owned IS NULL THEN 0 
                  ELSE json_array_length(p.properties_owned) END as properties_count
      FROM players p
      WHERE p.net_worth > 0
      ORDER BY p.net_worth DESC, p.cash_balance DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    )

    const countResult = await this.db.query('SELECT COUNT(*) as total FROM players WHERE net_worth > 0')
    const total = parseInt((countResult[0] as any)?.total || '0')

    const data = results.map((player, index) => ({
      rank: offset + index + 1,
      player: {
        pubkey: (player as any).pubkey,
        wallet: (player as any).wallet,
        netWorth: (player as any).net_worth,
        cashBalance: (player as any).cash_balance,
        propertiesValue: (player as any).net_worth - (player as any).cash_balance,
        propertiesCount: parseInt((player as any).properties_count || '0')
      },
      value: (player as any).net_worth
    }))

    return {
      data,
      total,
      page,
      limit
    }
  }

  // Get property moguls (most properties)
  async getPropertyMoguls(pagination?: PaginationOptions) {
    const limit = pagination?.limit || 10
    const page = pagination?.page || 1
    const offset = (page - 1) * limit

    const results = await this.db.query(
      `
      SELECT p.pubkey, p.wallet, p.game, p.cash_balance, p.net_worth, p.properties_owned,
             CASE WHEN p.properties_owned IS NULL THEN 0 
                  ELSE json_array_length(p.properties_owned) END as properties_count
      FROM players p
      ORDER BY properties_count DESC, p.net_worth DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    )

    const countResult = await this.db.query('SELECT COUNT(*) as total FROM players')
    const total = parseInt((countResult[0] as any)?.total || '0')

    const data = results.map((player, index) => ({
      rank: offset + index + 1,
      player: {
        pubkey: (player as any).pubkey,
        wallet: (player as any).wallet,
        propertiesCount: parseInt((player as any).properties_count || '0'),
        monopolies: 0, // Mock data for now
        totalHouses: 0,
        totalHotels: 0
      },
      value: parseInt((player as any).properties_count || '0')
    }))

    return {
      data,
      total,
      page,
      limit
    }
  }

  // Get global game statistics
  async getGlobalStats() {
    const [playerStats, gameStats, moneyStats] = await Promise.all([
      this.db.query('SELECT COUNT(*) as total_players FROM (SELECT DISTINCT wallet FROM players) as unique_players'),
      this.db.query(`
        SELECT 
          COUNT(*) as total_games,
          COUNT(CASE WHEN game_status = 'InProgress' THEN 1 END) as active_games,
          AVG(EXTRACT(EPOCH FROM (account_updated_at - account_created_at))) as avg_duration
        FROM games
      `),
      this.db.query(`
        SELECT 
          SUM(cash_balance) as total_money,
          MAX(net_worth) as biggest_win,
          MAX(EXTRACT(EPOCH FROM (account_updated_at - account_created_at))) as longest_game
        FROM players
      `)
    ])

    const playerCount = parseInt((playerStats[0] as any)?.total_players || '0')
    const gameCount = parseInt((gameStats[0] as any)?.total_games || '0')
    const activeGames = parseInt((gameStats[0] as any)?.active_games || '0')
    const avgDuration = parseInt((gameStats[0] as any)?.avg_duration || '0')
    const totalMoney = (moneyStats[0] as any)?.total_money || '0'
    const biggestWin = (moneyStats[0] as any)?.biggest_win || '0'
    const longestGame = parseInt((moneyStats[0] as any)?.longest_game || '0')

    return {
      totalPlayers: playerCount,
      totalGames: gameCount,
      activeGames: activeGames,
      totalMoneyInCirculation: totalMoney,
      averageGameDuration: avgDuration,
      mostPopularProperty: 'Boardwalk', // TODO: Calculate from game logs
      biggestWin: biggestWin,
      longestGame: longestGame
    }
  }

  // Get recent game winners
  async getRecentWinners(pagination?: PaginationOptions) {
    const limit = pagination?.limit || 5
    const page = pagination?.page || 1
    const offset = (page - 1) * limit

    const results = await this.db.query(
      `
      SELECT g.pubkey as game_id, g.winner, g.game_status, g.account_updated_at as finished_at,
             g.max_players, g.bank_balance,
             p.pubkey as player_pubkey, p.wallet, p.net_worth,
             EXTRACT(EPOCH FROM (g.account_updated_at - g.account_created_at)) as duration
      FROM games g
      JOIN players p ON g.winner = p.wallet
      WHERE g.game_status = 'Finished' AND g.winner IS NOT NULL
      ORDER BY g.account_updated_at DESC
      LIMIT $1 OFFSET $2
    `,
      [limit, offset]
    )

    const countResult = await this.db.query(
      `SELECT COUNT(*) as total FROM games 
       WHERE game_status = 'Finished' AND winner IS NOT NULL`
    )
    const total = parseInt((countResult[0] as any)?.total || '0')

    const data = results.map((game, index) => ({
      rank: offset + index + 1,
      player: {
        pubkey: (game as any).player_pubkey,
        wallet: (game as any).wallet,
        gameId: (game as any).game_id,
        winAmount: (game as any).net_worth,
        gameDuration: parseInt((game as any).duration || '0'),
        winnersCount: (game as any).max_players
      },
      wonAt: (game as any).finished_at,
      timeAgo: this.calculateTimeAgo((game as any).finished_at)
    }))

    return {
      data,
      total,
      page,
      limit
    }
  }

  // Helper method to calculate time ago
  private calculateTimeAgo(date: string): string {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
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

// Game Log service with business logic
export class GameLogService {
  constructor(private db: DatabasePort) {}

  async createLog(
    logData: Omit<NewGameLog, 'id' | 'createdAt' | 'accountCreatedAt' | 'accountUpdatedAt'>
  ): Promise<GameLog> {
    return this.db.createGameLog({
      ...logData,
      timestamp: logData.timestamp || Date.now()
    })
  }

  async getGameLogs(gameId: string, filters?: any, pagination?: PaginationOptions): Promise<PaginatedResult<GameLog>> {
    return this.db.getGameLogs(gameId, filters, pagination)
  }

  async getGameLogsAsEntries(
    gameId: string,
    filters?: any,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<GameLogEntry>> {
    return this.db.getGameLogsAsEntries(gameId, filters, pagination)
  }

  async deleteGameLogs(gameId: string): Promise<void> {
    return this.db.deleteGameLogs(gameId)
  }

  // Helper methods for creating specific log types
  async logPlayerMove(
    gameId: string,
    playerId: string,
    playerName: string,
    fromPos: number,
    toPos: number,
    diceRoll: [number, number],
    passedGo?: boolean
  ): Promise<GameLog> {
    return this.createLog({
      gameId,
      playerId,
      playerName,
      type: 'move',
      message: `${playerName} rolled ${diceRoll[0]}+${diceRoll[1]} and moved from position ${fromPos} to ${toPos}${passedGo ? ' (passed GO!)' : ''}`,
      fromPosition: fromPos,
      toPosition: toPos,
      diceRoll,
      passedGo,
      timestamp: Date.now()
    })
  }

  async logPropertyPurchase(
    gameId: string,
    playerId: string,
    playerName: string,
    position: number,
    propertyName: string,
    price: number
  ): Promise<GameLog> {
    return this.createLog({
      gameId,
      playerId,
      playerName,
      type: 'purchase',
      message: `${playerName} purchased ${propertyName} for $${price}`,
      position,
      propertyName,
      price,
      timestamp: Date.now()
    })
  }

  async logRentPayment(
    gameId: string,
    payerId: string,
    payerName: string,
    ownerId: string,
    ownerName: string,
    position: number,
    propertyName: string,
    amount: number
  ): Promise<GameLog> {
    return this.createLog({
      gameId,
      playerId: payerId,
      playerName: payerName,
      type: 'rent',
      message: `${payerName} paid $${amount} rent to ${ownerName} for ${propertyName}`,
      position,
      propertyName,
      owner: ownerId,
      targetPlayerName: ownerName,
      amount,
      timestamp: Date.now()
    })
  }

  async logCardDraw(
    gameId: string,
    playerId: string,
    playerName: string,
    cardType: 'chance' | 'community-chest',
    cardTitle: string,
    cardDescription: string,
    cardIndex: number,
    effectType?: number,
    amount?: number
  ): Promise<GameLog> {
    return this.createLog({
      gameId,
      playerId,
      playerName,
      type: 'card',
      message: `${playerName} drew a ${cardType} card: ${cardTitle}`,
      cardType,
      cardTitle,
      cardDescription,
      cardIndex,
      effectType,
      amount,
      timestamp: Date.now()
    })
  }

  async logJailEvent(
    gameId: string,
    playerId: string,
    playerName: string,
    action: 'enter' | 'exit' | 'pay_fine',
    reason?: 'doubles' | 'go_to_jail' | 'card',
    fineAmount?: number
  ): Promise<GameLog> {
    let message: string
    if (action === 'enter') {
      message = `${playerName} was sent to jail${reason ? ` (${reason})` : ''}`
    } else if (action === 'exit') {
      message = `${playerName} was released from jail`
    } else {
      message = `${playerName} paid $${fineAmount} to get out of jail`
    }

    return this.createLog({
      gameId,
      playerId,
      playerName,
      type: 'jail',
      message,
      jailReason: reason,
      fineAmount,
      timestamp: Date.now()
    })
  }

  async logBuildingAction(
    gameId: string,
    playerId: string,
    playerName: string,
    action: 'build' | 'sell',
    buildingType: 'house' | 'hotel',
    position: number,
    propertyName: string,
    cost?: number
  ): Promise<GameLog> {
    const message =
      action === 'build'
        ? `${playerName} built a ${buildingType} on ${propertyName}${cost ? ` for $${cost}` : ''}`
        : `${playerName} sold a ${buildingType} on ${propertyName}${cost ? ` for $${cost}` : ''}`

    return this.createLog({
      gameId,
      playerId,
      playerName,
      type: 'building',
      message,
      position,
      propertyName,
      buildingType,
      price: cost,
      timestamp: Date.now()
    })
  }

  async logGameEvent(
    gameId: string,
    playerId: string,
    playerName: string,
    event: 'start' | 'end' | 'join' | 'leave' | 'bankruptcy',
    details?: string
  ): Promise<GameLog> {
    const messages = {
      start: `Game started by ${playerName}`,
      end: `Game ended - Winner: ${playerName}`,
      join: `${playerName} joined the game`,
      leave: `${playerName} left the game`,
      bankruptcy: `${playerName} declared bankruptcy${details ? ` - ${details}` : ''}`
    }

    return this.createLog({
      gameId,
      playerId,
      playerName,
      type: event === 'start' || event === 'end' ? 'game' : event === 'bankruptcy' ? 'bankruptcy' : 'join',
      message: messages[event],
      error: event === 'bankruptcy' ? details : undefined,
      timestamp: Date.now()
    })
  }
}
