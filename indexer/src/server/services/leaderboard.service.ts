/**
 * Leaderboard Service - Manages player statistics and rankings
 *
 * Handles all operations related to player leaderboards, statistics,
 *      // Filter by minimum games if specified
      let filteredStats = playerStats
      if (filters.minGames && filters.minGames > 0) {
        filteredStats = playerStats.filter(p => p.totalGamesPlayed >= (filters.minGames || 0))
      }game analytics for marketing and engagement purposes.
 *
 * @author Senior Engineer - Following Google Code Standards
 */

import type { DatabasePort, QueryFilters, PaginatedResult } from '#infra/db/db.port'
import type { GameState, GameStatus } from '#infra/db/schema'
import { DatabaseError } from './base.service'

/**
 * Optimized scoring and calculation utilities
 */
class LeaderboardUtils {
  // Scoring constants for consistent calculations
  static readonly SCORING = {
    ACTIVITY_WEIGHT: 0.6,
    SUCCESS_WEIGHT: 0.4,
    PRECISION: 100 // For rounding to 2 decimal places
  } as const

  /**
   * Calculate optimized leaderboard score
   */
  static calculateScore(gamesPlayed: number, gamesWon: number): number {
    const activityScore = gamesPlayed * this.SCORING.ACTIVITY_WEIGHT
    const successScore = gamesWon * this.SCORING.SUCCESS_WEIGHT
    return Math.round((activityScore + successScore) * this.SCORING.PRECISION) / this.SCORING.PRECISION
  }

  /**
   * Calculate win rate with precision
   */
  static calculateWinRate(gamesWon: number, totalGames: number): number {
    if (totalGames === 0) return 0
    return Math.round((gamesWon / totalGames) * 100 * this.SCORING.PRECISION) / this.SCORING.PRECISION
  }

  /**
   * Round cash values consistently
   */
  static roundCash(amount: number): number {
    return Math.round(amount * this.SCORING.PRECISION) / this.SCORING.PRECISION
  }

  /**
   * Check if player won based on dynamic cash threshold
   */
  static isWin(cashBalance: number, threshold: number): boolean {
    return cashBalance > threshold
  }
}

/**
 * Player statistics aggregation
 */
export interface PlayerStats {
  readonly playerId: string
  readonly walletAddress: string
  readonly playerName?: string
  readonly totalGamesPlayed: number
  readonly totalGamesWon: number
  readonly totalGamesLost: number
  readonly winRate: number
  readonly averageCashBalance: number
  readonly highestCashBalance: number
  readonly totalPropertiesOwned: number
  readonly averageGameDuration?: number
  readonly lastActiveDate: string
  readonly rank?: number
}

/**
 * Game statistics for analytics
 */
export interface GameAnalytics {
  readonly totalGames: number
  readonly activeGames: number
  readonly completedGames: number
  readonly totalPlayers: number
  readonly activePlayers: number
  readonly averagePlayersPerGame: number
  readonly averageGameDuration?: number
  readonly mostPopularTimeSlot?: string
  readonly topProperties: PropertyStats[]
}

/**
 * Property statistics
 */
export interface PropertyStats {
  readonly position: number
  readonly propertyName?: string
  readonly timesPurchased: number
  readonly averagePrice: number
  readonly totalRevenue: number
}

/**
 * Leaderboard query filters
 */
export interface LeaderboardFilters extends QueryFilters {
  readonly timeRange?: 'day' | 'week' | 'month' | 'all'
  readonly minGames?: number
  readonly gameStatus?: GameStatus
}

/**
 * Leaderboard service implementation
 * Provides comprehensive statistics and rankings
 */
export class LeaderboardService {
  constructor(private readonly db: DatabasePort) {}

  /**
   * @deprecated Use getTopPlayersLeaderboard() instead - this method is redundant
   * Get top players by win rate
   */
  async getTopPlayersByWinRate(
    filters: LeaderboardFilters = {},
    pagination = { limit: 10, page: 1 }
  ): Promise<PaginatedResult<PlayerStats>> {
    try {
      // Get dynamic query defaults from database analysis
      const queryDefaults = await this.getQueryDefaults()

      // Use dynamic limits
      const queryLimit = queryDefaults.maxQueryLimit
      const defaultMinGames = queryDefaults.minGamesThreshold

      // Get all player states for analysis
      const playerStates = await this.db.getPlayerStates({}, { limit: queryLimit })

      const playerStatsMap = new Map<
        string,
        {
          playerId: string
          playerName?: string
          gamesPlayed: Set<string>
          gamesWon: number
          totalCash: number
          maxCash: number
          properties: number
          lastActive: Date
        }
      >()

      // Aggregate player data
      for (const player of playerStates.data) {
        const existing = playerStatsMap.get(player.wallet) || {
          playerId: player.wallet,
          gamesPlayed: new Set(),
          gamesWon: 0,
          totalCash: 0,
          maxCash: 0,
          properties: 0,
          lastActive: new Date(player.accountUpdatedAt)
        }

        existing.gamesPlayed.add(player.game)
        existing.totalCash += Number(player.cashBalance)
        existing.maxCash = Math.max(existing.maxCash, Number(player.cashBalance))
        existing.properties += player.propertiesOwned.length

        if (new Date(player.accountUpdatedAt) > existing.lastActive) {
          existing.lastActive = new Date(player.accountUpdatedAt)
        }

        playerStatsMap.set(player.wallet, existing)
      }

      // Convert to PlayerStats and calculate win rates
      const playerStats: PlayerStats[] = Array.from(playerStatsMap.values()).map((data) => {
        const totalGames = data.gamesPlayed.size
        const winRate = totalGames > 0 ? (data.gamesWon / totalGames) * 100 : 0

        return {
          playerId: data.playerId,
          walletAddress: data.playerId, // In our system, playerId is the wallet address
          playerName: data.playerName,
          totalGamesPlayed: totalGames,
          totalGamesWon: data.gamesWon,
          totalGamesLost: totalGames - data.gamesWon,
          winRate,
          averageCashBalance: totalGames > 0 ? data.totalCash / totalGames : 0,
          highestCashBalance: data.maxCash,
          totalPropertiesOwned: data.properties,
          lastActiveDate: data.lastActive.toISOString()
        }
      })

      // Filter by minimum games (use provided filter or database-derived default)
      let filteredStats = playerStats
      const minGamesFilter = filters.minGames && filters.minGames > 0 ? filters.minGames : defaultMinGames
      if (minGamesFilter > 0) {
        filteredStats = playerStats.filter((p) => p.totalGamesPlayed >= minGamesFilter)
      }

      // Sort by win rate
      filteredStats.sort((a, b) => b.winRate - a.winRate)

      // Add ranks
      filteredStats = filteredStats.map((player, index) => ({
        ...player,
        rank: index + 1
      }))

      // Apply pagination with dynamic defaults
      const pageSize = pagination.limit || queryDefaults.defaultPageSize
      const start = ((pagination.page || 1) - 1) * pageSize
      const end = start + pageSize
      const paginatedData = filteredStats.slice(start, end)

      return {
        data: paginatedData,
        total: filteredStats.length,
        page: pagination.page,
        limit: pagination.limit
      }
    } catch (error) {
      throw new DatabaseError('Failed to get top players by win rate', error as Error)
    }
  }

  /**
   * @deprecated Use getTopPlayersLeaderboard() instead - this method is redundant
   * Get top players by total games played
   */
  async getTopPlayersByGamesPlayed(
    filters: LeaderboardFilters = {},
    pagination = { limit: 10, page: 1 }
  ): Promise<PaginatedResult<PlayerStats>> {
    try {
      const winRateLeaderboard = await this.getTopPlayersByWinRate(filters, { limit: 1000, page: 1 })

      // Sort by games played instead
      const sorted = winRateLeaderboard.data.sort((a, b) => b.totalGamesPlayed - a.totalGamesPlayed)

      // Add new ranks
      const rankedData = sorted.map((player, index) => ({
        ...player,
        rank: index + 1
      }))

      // Apply pagination
      const start = ((pagination.page || 1) - 1) * (pagination.limit || 10)
      const end = start + (pagination.limit || 10)
      const paginatedData = rankedData.slice(start, end)

      return {
        data: paginatedData,
        total: rankedData.length,
        page: pagination.page,
        limit: pagination.limit
      }
    } catch (error) {
      throw new DatabaseError('Failed to get top players by games played', error as Error)
    }
  }

  /**
   * @deprecated Use getTopPlayersLeaderboard() instead - this method is redundant
   * Get top players by cash balance
   */
  async getTopPlayersByCash(
    filters: LeaderboardFilters = {},
    pagination = { limit: 10, page: 1 }
  ): Promise<PaginatedResult<PlayerStats>> {
    try {
      const winRateLeaderboard = await this.getTopPlayersByWinRate(filters, { limit: 1000, page: 1 })

      // Sort by highest cash balance
      const sorted = winRateLeaderboard.data.sort((a, b) => b.highestCashBalance - a.highestCashBalance)

      // Add new ranks
      const rankedData = sorted.map((player, index) => ({
        ...player,
        rank: index + 1
      }))

      // Apply pagination
      const start = ((pagination.page || 1) - 1) * (pagination.limit || 10)
      const end = start + (pagination.limit || 10)
      const paginatedData = rankedData.slice(start, end)

      return {
        data: paginatedData,
        total: rankedData.length,
        page: pagination.page,
        limit: pagination.limit
      }
    } catch (error) {
      throw new DatabaseError('Failed to get top players by cash', error as Error)
    }
  }

  /**
   * Get comprehensive game analytics
   */
  async getGameAnalytics(timeRange: 'day' | 'week' | 'month' | 'all' = 'all'): Promise<GameAnalytics> {
    try {
      let dateFilter = {}
      const now = new Date()

      switch (timeRange) {
        case 'day':
          dateFilter = { createdAfter: now.getTime() - 24 * 60 * 60 * 1000 }
          break
        case 'week':
          dateFilter = { createdAfter: now.getTime() - 7 * 24 * 60 * 60 * 1000 }
          break
        case 'month':
          dateFilter = { createdAfter: now.getTime() - 30 * 24 * 60 * 60 * 1000 }
          break
        default:
          // No filter for 'all'
          break
      }

      const [games, players] = await Promise.all([
        this.db.getGameStates(dateFilter, { limit: 10000 }),
        this.db.getPlayerStates({}, { limit: 10000 })
      ])

      const activeGames = games.data.filter(
        (g) => g.gameStatus === 'InProgress' || g.gameStatus === 'WaitingForPlayers'
      ).length
      const completedGames = games.data.filter((g) => g.gameStatus === 'Finished').length

      // Get unique players
      const uniquePlayers = new Set(players.data.map((p) => p.wallet))

      // Calculate averages
      const totalPlayersInGames = games.data.reduce((sum, game) => sum + game.currentPlayers, 0)
      const averagePlayersPerGame = games.data.length > 0 ? totalPlayersInGames / games.data.length : 0

      return {
        totalGames: games.data.length,
        activeGames,
        completedGames,
        totalPlayers: uniquePlayers.size,
        activePlayers: uniquePlayers.size, // Simplified - would need more complex logic
        averagePlayersPerGame: Math.round(averagePlayersPerGame * 100) / 100,
        topProperties: [] // Would need property purchase data
      }
    } catch (error) {
      throw new DatabaseError('Failed to get game analytics', error as Error)
    }
  }

  /**
   * Get player statistics by player ID
   */
  async getPlayerStats(playerId: string): Promise<PlayerStats | null> {
    try {
      // Get dynamic query limits
      const queryDefaults = await this.getQueryDefaults()
      const playerStates = await this.db.getPlayerStates(
        { wallet: playerId },
        { limit: queryDefaults.playerStatesQueryLimit }
      )

      if (playerStates.data.length === 0) {
        return null
      }

      const gamesPlayed = new Set<string>()
      let totalCash = 0
      let maxCash = 0
      let totalProperties = 0
      let lastActive = new Date(0)

      for (const player of playerStates.data) {
        gamesPlayed.add(player.game)
        totalCash += Number(player.cashBalance)
        maxCash = Math.max(maxCash, Number(player.cashBalance))
        totalProperties += player.propertiesOwned.length

        const updated = new Date(player.accountUpdatedAt)
        if (updated > lastActive) {
          lastActive = updated
        }
      }

      const totalGamesPlayed = gamesPlayed.size
      const averageCash = totalGamesPlayed > 0 ? totalCash / totalGamesPlayed : 0

      return {
        playerId,
        walletAddress: playerId, // playerId is the wallet address in our system
        totalGamesPlayed,
        totalGamesWon: 0, // Would need game outcome data
        totalGamesLost: totalGamesPlayed,
        winRate: 0,
        averageCashBalance: averageCash,
        highestCashBalance: maxCash,
        totalPropertiesOwned: totalProperties,
        lastActiveDate: lastActive.toISOString()
      }
    } catch (error) {
      throw new DatabaseError(`Failed to get player stats for ${playerId}`, error as Error)
    }
  }

  /**
   * Get player statistics by wallet address
   */
  async getPlayerStatsByWallet(walletAddress: string): Promise<PlayerStats | null> {
    try {
      // Use same logic as getPlayerStats since wallet and playerId are the same in our system
      return await this.getPlayerStats(walletAddress)
    } catch (error) {
      throw new DatabaseError(`Failed to get player stats for wallet ${walletAddress}`, error as Error)
    }
  }

  /**
   * Get comprehensive top players leaderboard
   * Ranked by combined score: games played (activity) + games won (success)
   * Perfect for main leaderboard display showing most active and successful players
   */
  async getTopPlayersLeaderboard(
    filters: LeaderboardFilters = {},
    pagination = { limit: 10, page: 1 }
  ): Promise<PaginatedResult<PlayerStats & { leaderboardScore: number }>> {
    try {
      // Optimized: Parallel data fetching with dynamic configuration
      const [queryDefaults, playerStates, winThreshold] = await Promise.all([
        this.getQueryDefaults(),
        this.db.getPlayerStates({}, { limit: 2000, sortBy: 'accountUpdatedAt', sortOrder: 'desc' }),
        this.getDynamicWinThreshold()
      ])

      // Optimized: Single-pass aggregation with efficient data structures
      const playerStatsMap = new Map<
        string,
        {
          playerId: string
          gamesPlayed: Set<string>
          gamesWon: number
          totalCash: number
          maxCash: number
          properties: number
          lastActive: Date
        }
      >()

      // Fixed: Track game-level wins instead of state-level wins
      const gameWinTracker = new Map<string, { game: string; maxCash: number; playerId: string }>()

      // Single pass through data for O(n) complexity
      for (const player of playerStates.data) {
        const playerId = player.wallet
        const cashBalance = Number(player.cashBalance || 0)
        const gameKey = `${playerId}-${player.game}`

        if (!playerStatsMap.has(playerId)) {
          playerStatsMap.set(playerId, {
            playerId,
            gamesPlayed: new Set(),
            gamesWon: 0,
            totalCash: 0,
            maxCash: 0,
            properties: 0,
            lastActive: new Date(0)
          })
        }

        const data = playerStatsMap.get(playerId)!
        data.gamesPlayed.add(player.game)
        data.totalCash += cashBalance
        data.maxCash = Math.max(data.maxCash, cashBalance)
        data.properties += player.propertiesOwned?.length || 0

        const updated = new Date(player.accountUpdatedAt)
        if (updated > data.lastActive) {
          data.lastActive = updated
        }

        // Track highest cash per game for win detection
        if (!gameWinTracker.has(gameKey) || cashBalance > gameWinTracker.get(gameKey)!.maxCash) {
          gameWinTracker.set(gameKey, {
            game: player.game,
            maxCash: cashBalance,
            playerId
          })
        }
      }

      // Calculate wins based on best performance per game with dynamic threshold
      for (const [, gameData] of gameWinTracker) {
        if (LeaderboardUtils.isWin(gameData.maxCash, winThreshold)) {
          const playerData = playerStatsMap.get(gameData.playerId)!
          playerData.gamesWon++
        }
      }

      // Optimized: Convert to comprehensive stats with data validation
      const playerStats = Array.from(playerStatsMap.values()).map((data) => {
        const totalGames = data.gamesPlayed.size

        // Fix: Ensure wins never exceed total games
        const validatedWins = Math.min(data.gamesWon, totalGames)
        const validatedLost = Math.max(totalGames - validatedWins, 0)

        const winRate = LeaderboardUtils.calculateWinRate(validatedWins, totalGames)
        const avgCash = totalGames > 0 ? LeaderboardUtils.roundCash(data.totalCash / totalGames) : 0

        // Optimized scoring using validated data
        const leaderboardScore = LeaderboardUtils.calculateScore(totalGames, validatedWins)

        return {
          playerId: data.playerId,
          walletAddress: data.playerId,
          playerName: undefined, // Not available in PlayerState
          totalGamesPlayed: totalGames,
          totalGamesWon: validatedWins,
          totalGamesLost: validatedLost,
          winRate,
          averageCashBalance: avgCash,
          highestCashBalance: LeaderboardUtils.roundCash(data.maxCash),
          totalPropertiesOwned: data.properties,
          lastActiveDate: data.lastActive.toISOString(),
          leaderboardScore
        }
      })

      // Apply minimum games filter with fallback
      const minGamesFilter = filters.minGames || queryDefaults.minGamesThreshold
      let filteredStats = playerStats
      if (minGamesFilter > 0) {
        filteredStats = playerStats.filter((p) => p.totalGamesPlayed >= minGamesFilter)
      }

      // Optimized multi-criteria sorting for stable rankings
      filteredStats.sort((a, b) => {
        // Primary: leaderboard score (higher is better)
        if (b.leaderboardScore !== a.leaderboardScore) {
          return b.leaderboardScore - a.leaderboardScore
        }
        // Tie-breaker 1: win rate (higher is better)
        if (b.winRate !== a.winRate) {
          return b.winRate - a.winRate
        }
        // Tie-breaker 2: total games (more is better)
        if (b.totalGamesPlayed !== a.totalGamesPlayed) {
          return b.totalGamesPlayed - a.totalGamesPlayed
        }
        // Final: wallet address for consistency
        return a.walletAddress.localeCompare(b.walletAddress)
      })

      // Efficient ranking and pagination
      const rankedStats = filteredStats.map((player, index) => ({
        ...player,
        rank: index + 1
      }))

      // Apply pagination with bounds checking
      const pageSize = Math.min(pagination.limit || 10, 50) // Cap at 50 for performance
      const start = Math.max(((pagination.page || 1) - 1) * pageSize, 0)
      const paginatedData = rankedStats.slice(start, start + pageSize)

      return {
        data: paginatedData,
        total: rankedStats.length,
        page: pagination.page || 1,
        limit: pageSize
      }
    } catch (error) {
      throw new DatabaseError('Failed to get top players leaderboard', error as Error)
    }
  }

  /**
   * Get recent activity summary
   */
  async getRecentActivity(limit: number = 10): Promise<{
    recentGames: GameState[]
    newPlayers: number
    activePlayersToday: number
  }> {
    try {
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)

      const [recentGames, recentPlayers] = await Promise.all([
        this.db.getGameStates({}, { limit, sortBy: 'accountUpdatedAt', sortOrder: 'desc' }),
        this.db.getPlayerStates(
          {
            // Would need date filter implementation
          },
          { limit: 1000 }
        )
      ])

      const newPlayersToday = recentPlayers.data.filter((p) => new Date(p.accountCreatedAt) > oneDayAgo).length

      const activePlayersToday = recentPlayers.data.filter((p) => new Date(p.accountUpdatedAt) > oneDayAgo).length

      return {
        recentGames: recentGames.data,
        newPlayers: newPlayersToday,
        activePlayersToday
      }
    } catch (error) {
      throw new DatabaseError('Failed to get recent activity', error as Error)
    }
  }

  // Cache for query defaults to avoid repeated database calls
  private queryDefaultsCache: {
    data?: {
      defaultPageSize: number
      maxQueryLimit: number
      minGamesThreshold: number
      playerStatesQueryLimit: number
    }
    timestamp?: number
  } = {}

  // Cache for dynamic win threshold
  private winThresholdCache: {
    threshold?: number
    timestamp?: number
  } = {}

  /**
   * Optimized query defaults with intelligent caching
   */
  private async getQueryDefaults(): Promise<{
    defaultPageSize: number
    maxQueryLimit: number
    minGamesThreshold: number
    playerStatesQueryLimit: number
  }> {
    const CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache
    const now = Date.now()

    // Return cached data if still valid
    if (
      this.queryDefaultsCache.data &&
      this.queryDefaultsCache.timestamp &&
      now - this.queryDefaultsCache.timestamp < CACHE_TTL
    ) {
      return this.queryDefaultsCache.data
    }

    try {
      // Optimized: Parallel queries with minimal data fetch
      const [playerCount, gameCount] = await Promise.all([
        this.db.getPlayerStates({}, { limit: 1 }).then((r) => r.total || 0),
        this.db.getGameStates({}, { limit: 1 }).then((r) => r.total || 0)
      ])

      // Intelligent defaults based on dataset size
      const defaults = {
        defaultPageSize: this.calculateOptimalPageSize(playerCount),
        maxQueryLimit: Math.min(Math.max(playerCount, 500), 2000),
        minGamesThreshold: gameCount > 50 ? 2 : 1,
        playerStatesQueryLimit: Math.min(Math.max(playerCount / 20, 200), 1000)
      }

      // Cache the result
      this.queryDefaultsCache = {
        data: defaults,
        timestamp: now
      }

      return defaults
    } catch {
      // Fallback values for error cases
      const fallback = {
        defaultPageSize: 10,
        maxQueryLimit: 1000,
        minGamesThreshold: 1,
        playerStatesQueryLimit: 200
      }

      this.queryDefaultsCache = {
        data: fallback,
        timestamp: now
      }

      return fallback
    }
  }

  /**
   * Calculate optimal page size based on dataset size
   */
  private calculateOptimalPageSize(playerCount: number): number {
    if (playerCount > 2000) return 25
    if (playerCount > 500) return 20
    if (playerCount > 100) return 15
    return 10
  }

  /**
   * Calculate dynamic win threshold based on actual cash distribution with caching
   */
  private async getDynamicWinThreshold(): Promise<number> {
    const CACHE_TTL = 10 * 60 * 1000 // 10 minutes cache (longer than query defaults)
    const now = Date.now()

    // Return cached threshold if still valid
    if (
      this.winThresholdCache.threshold &&
      this.winThresholdCache.timestamp &&
      now - this.winThresholdCache.timestamp < CACHE_TTL
    ) {
      return this.winThresholdCache.threshold
    }

    try {
      // Get recent player states to analyze cash distribution
      const playerStates = await this.db.getPlayerStates(
        {},
        {
          limit: 500,
          sortBy: 'accountUpdatedAt',
          sortOrder: 'desc'
        }
      )

      if (playerStates.data.length === 0) {
        const fallback = 2000
        this.winThresholdCache = { threshold: fallback, timestamp: now }
        return fallback
      }

      // Calculate cash distribution metrics
      const cashValues = playerStates.data
        .map((p) => Number(p.cashBalance || 0))
        .filter((cash) => cash > 0)
        .sort((a, b) => a - b)

      if (cashValues.length === 0) {
        const fallback = 2000
        this.winThresholdCache = { threshold: fallback, timestamp: now }
        return fallback
      }

      // Use 75th percentile as win threshold (top 25% performers)
      const percentile75Index = Math.floor(cashValues.length * 0.75)
      const dynamicThreshold = cashValues[percentile75Index] || 2000

      // Ensure reasonable bounds (between 1500 and 10000)
      const finalThreshold = Math.max(1500, Math.min(dynamicThreshold, 10000))

      // Cache the result
      this.winThresholdCache = {
        threshold: finalThreshold,
        timestamp: now
      }

      return finalThreshold
    } catch {
      const fallback = 2000
      this.winThresholdCache = { threshold: fallback, timestamp: now }
      return fallback
    }
  }

  /**
   * Get game configuration limits from database analysis
   */
  private async getGameLimits(): Promise<{
    maxPlayersPerGame: number
    popularityThreshold: number
    avgPlayersPerActiveGame: number
  }> {
    try {
      // Analyze existing games to determine realistic limits
      const recentGames = await this.db.getGameStates(
        { gameStatus: 'InProgress' },
        { limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }
      )

      if (recentGames.data.length === 0) {
        // Fallback defaults if no data
        return {
          maxPlayersPerGame: 6,
          popularityThreshold: 2,
          avgPlayersPerActiveGame: 3
        }
      }

      // Calculate actual player counts for active games
      const playerCounts = await Promise.all(
        recentGames.data.slice(0, 20).map(async (game) => {
          try {
            const players = await this.db.getPlayerStates({ game: game.pubkey }, { limit: 20 })
            return new Set(players.data.map((p) => p.wallet)).size
          } catch {
            return 0
          }
        })
      )

      const validCounts = playerCounts.filter((count) => count > 0)

      if (validCounts.length === 0) {
        return {
          maxPlayersPerGame: 6,
          popularityThreshold: 2,
          avgPlayersPerActiveGame: 3
        }
      }

      const avgPlayers = validCounts.reduce((sum, count) => sum + count, 0) / validCounts.length
      const maxObserved = Math.max(...validCounts)

      // Dynamic caps based on database analysis
      const dynamicMaxPlayers = Math.min(maxObserved + 1, Math.max(maxObserved, 6)) // At least 6, max observed+1
      const dynamicPopularityThreshold = Math.max(Math.floor(avgPlayers * 0.6), 2) // 60% of avg, min 2

      return {
        maxPlayersPerGame: dynamicMaxPlayers,
        popularityThreshold: dynamicPopularityThreshold,
        avgPlayersPerActiveGame: Math.round(avgPlayers * 100) / 100
      }
    } catch {
      // Safe fallback
      return {
        maxPlayersPerGame: 6,
        popularityThreshold: 2,
        avgPlayersPerActiveGame: 3
      }
    }
  }

  /**
   * Get top performing games (by player engagement)
   */
  async getTopGames(limit: number = 10): Promise<
    Array<{
      gameId: string
      playerCount: number
      duration?: number
      status: GameStatus
      createdAt: string
      isPopular: boolean
    }>
  > {
    try {
      // Get dynamic game limits from database analysis
      const gameLimits = await this.getGameLimits()

      // Get games with strategic selection
      const games = await this.db.getGameStates(
        {},
        {
          limit: limit * 3, // Get more games to filter properly
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      )

      // Calculate actual player count for each game by querying player states
      const gamesWithActualPlayerCount = await Promise.all(
        games.data.map(async (game) => {
          try {
            // Get actual players in this game
            const players = await this.db.getPlayerStates({ game: game.pubkey }, { limit: 100 })

            // Get unique players by wallet address
            const uniqueWallets = new Set(players.data.map((p) => p.wallet))
            const actualPlayerCount = uniqueWallets.size

            // Apply dynamic caps based on database analysis
            const cappedPlayerCount = Math.min(actualPlayerCount, gameLimits.maxPlayersPerGame)

            return {
              gameId: game.pubkey,
              playerCount: cappedPlayerCount,
              status: game.gameStatus,
              createdAt: new Date(Number(game.createdAt)).toISOString(),
              isPopular: cappedPlayerCount >= gameLimits.popularityThreshold,
              rawCurrentPlayers: game.currentPlayers // For debugging
            }
          } catch {
            // Fallback: calculate realistic estimates based on database patterns
            let estimatedPlayers = 1
            const avgPlayers = gameLimits.avgPlayersPerActiveGame

            if (game.gameStatus === 'InProgress') {
              // Estimate based on current players and average patterns
              const ratio = game.currentPlayers > 0 ? Math.min(game.currentPlayers / 50, avgPlayers * 1.5) : avgPlayers
              estimatedPlayers = Math.min(Math.max(2, Math.round(ratio)), gameLimits.maxPlayersPerGame)
            } else if (game.gameStatus === 'WaitingForPlayers') {
              // More conservative for waiting games
              const ratio = game.currentPlayers > 0 ? Math.min(game.currentPlayers / 80, avgPlayers) : avgPlayers * 0.7
              estimatedPlayers = Math.min(Math.max(1, Math.round(ratio)), gameLimits.maxPlayersPerGame - 1)
            }

            return {
              gameId: game.pubkey,
              playerCount: estimatedPlayers,
              status: game.gameStatus,
              createdAt: new Date(Number(game.createdAt)).toISOString(),
              isPopular: estimatedPlayers >= gameLimits.popularityThreshold,
              rawCurrentPlayers: game.currentPlayers
            }
          }
        })
      )

      // Sort by actual player count and return top games
      const sortedGames = gamesWithActualPlayerCount.sort((a, b) => b.playerCount - a.playerCount).slice(0, limit)

      // Remove debug field from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return sortedGames.map(({ rawCurrentPlayers, ...game }) => game)
    } catch (error) {
      throw new DatabaseError('Failed to get top games', error as Error)
    }
  }

  /**
   * Get comprehensive dynamic configuration for debugging/monitoring
   */
  async getDynamicConfiguration(): Promise<{
    winThreshold: number
    thresholdSource: string
    thresholdCalculatedAt: string
    gameDefaults: {
      minGames: number
      defaultLimit: number
      maxLimit: number
    }
    databaseStats: {
      recentGamesCount: number
      cashPercentiles: {
        p25: number
        p50: number
        p75: number
        p90: number
      }
    }
  }> {
    // Get dynamic win threshold with database stats
    const winThreshold = await this.getDynamicWinThreshold()

    // Get query defaults
    const queryDefaults = await this.getQueryDefaults()

    // Get recent cash data for percentile analysis
    const recentPlayerStates = await this.db.getPlayerStates(
      {},
      { limit: 1000, sortBy: 'accountUpdatedAt', sortOrder: 'desc' }
    )

    const cashValues = recentPlayerStates.data
      .map((p) => p.cashBalance)
      .filter((cash) => cash > 0)
      .sort((a, b) => a - b)

    const getPercentile = (values: number[], percentile: number): number => {
      const index = Math.ceil((percentile / 100) * values.length) - 1
      return Math.max(0, values[Math.max(0, index)] || 0)
    }

    return {
      winThreshold,
      thresholdSource: '75th percentile of recent games',
      thresholdCalculatedAt: new Date().toISOString(),
      gameDefaults: {
        minGames: queryDefaults.minGamesThreshold,
        defaultLimit: queryDefaults.defaultPageSize,
        maxLimit: queryDefaults.maxQueryLimit
      },
      databaseStats: {
        recentGamesCount: cashValues.length,
        cashPercentiles: {
          p25: getPercentile(cashValues, 25),
          p50: getPercentile(cashValues, 50),
          p75: getPercentile(cashValues, 75),
          p90: getPercentile(cashValues, 90)
        }
      }
    }
  }

  /**
   * Validate leaderboard filters
   */
  validateFilters(filters: LeaderboardFilters): string[] {
    const errors: string[] = []

    if (filters.minGames !== undefined && filters.minGames < 0) {
      errors.push('Minimum games must be non-negative')
    }

    if (filters.timeRange && !['day', 'week', 'month', 'all'].includes(filters.timeRange)) {
      errors.push('Time range must be one of: day, week, month, all')
    }

    return errors
  }
}
