import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { DatabasePort } from '#infra/db/db.port'
import {
  PlayerService,
  ResponseFormatter,
  responseWrapperSchema,
  errorResponseWrapperSchema,
  paginatedResponseWrapperSchema,
  paginatedQueryRequestDtoSchema
} from '#shared'
import { getRequestId } from '../plugins/request-context'

// Leaderboard item schemas
const balanceLeaderboardItemSchema = Type.Object({
  rank: Type.Number({ example: 1 }),
  player: Type.Object({
    pubkey: Type.String({ example: 'player-crH7JXBm-CtDZwaSy' }),
    wallet: Type.String({ example: 'BD8S7kHhcpQgvyNp66AQYb97WzTRrUDyxZvWCtDZwaSy' }),
    cash_balance: Type.String({ example: '1500' }),
    net_worth: Type.String({ example: '1500' })
  }),
  value: Type.String({ example: '1500' }),
  gameCount: Type.Number({ example: 0 })
})

const winnersLeaderboardItemSchema = Type.Object({
  rank: Type.Number({ example: 1 }),
  player: Type.Object({
    pubkey: Type.String({ example: 'player-xyz123' }),
    wallet: Type.String({ example: 'BD8S7kHhcpQgvyNp66AQYb97WzTRrUDyxZvWCtDZwaSy' }),
    wins: Type.Number({ example: 15 }),
    totalGames: Type.Number({ example: 20 }),
    winRate: Type.Number({ example: 75.0 })
  }),
  value: Type.Number({ example: 15 }),
  winRate: Type.Number({ example: 75.0 })
})

const richestPlayersItemSchema = Type.Object({
  rank: Type.Number({ example: 1 }),
  player: Type.Object({
    pubkey: Type.String({ example: 'player-xyz123' }),
    wallet: Type.String({ example: 'BD8S7kHhcpQgvyNp66AQYb97WzTRrUDyxZvWCtDZwaSy' }),
    netWorth: Type.String({ example: '5500000' }),
    cashBalance: Type.String({ example: '1200000' }),
    propertiesValue: Type.String({ example: '4300000' }),
    propertiesCount: Type.Number({ example: 8 })
  }),
  value: Type.String({ example: '5500000' })
})

const propertyMogulsItemSchema = Type.Object({
  rank: Type.Number({ example: 1 }),
  player: Type.Object({
    pubkey: Type.String({ example: 'player-xyz123' }),
    wallet: Type.String({ example: 'BD8S7kHhcpQgvyNp66AQYb97WzTRrUDyxZvWCtDZwaSy' }),
    propertiesCount: Type.Number({ example: 12 }),
    monopolies: Type.Number({ example: 2 }),
    totalHouses: Type.Number({ example: 20 }),
    totalHotels: Type.Number({ example: 3 })
  }),
  value: Type.Number({ example: 12 })
})

const recentWinnersItemSchema = Type.Object({
  rank: Type.Number({ example: 1 }),
  player: Type.Object({
    pubkey: Type.String({ example: 'player-xyz123' }),
    wallet: Type.String({ example: 'BD8S7kHhcpQgvyNp66AQYb97WzTRrUDyxZvWCtDZwaSy' }),
    gameId: Type.String({ example: 'game-abc123' }),
    winAmount: Type.String({ example: '3500000' }),
    gameDuration: Type.Number({ example: 1800 }),
    winnersCount: Type.Number({ example: 4 })
  }),
  wonAt: Type.String({ example: '2025-10-07T10:30:00Z' }),
  timeAgo: Type.String({ example: '2 hours ago' })
})

// Paginated response schemas
const balanceLeaderboardSchema = paginatedResponseWrapperSchema(balanceLeaderboardItemSchema)
const winnersLeaderboardSchema = paginatedResponseWrapperSchema(winnersLeaderboardItemSchema)
const richestPlayersSchema = paginatedResponseWrapperSchema(richestPlayersItemSchema)
const propertyMogulsSchema = paginatedResponseWrapperSchema(propertyMogulsItemSchema)
const recentWinnersSchema = paginatedResponseWrapperSchema(recentWinnersItemSchema)

const globalStatsSchema = responseWrapperSchema(
  Type.Object({
    totalPlayers: Type.Number({ example: 1250 }),
    totalGames: Type.Number({ example: 450 }),
    activeGames: Type.Number({ example: 23 }),
    totalMoneyInCirculation: Type.String({ example: '15750000000' }),
    averageGameDuration: Type.Number({ example: 2340 }),
    mostPopularProperty: Type.String({ example: 'Boardwalk' }),
    biggestWin: Type.String({ example: '8500000' }),
    longestGame: Type.Number({ example: 4800 })
  })
)

// Declare Fastify instance type
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabasePort
  }
}

export default async function leaderboardRoutes(fastify: FastifyInstance) {
  const db = fastify.db
  const playerService = new PlayerService(db)

  // GET /api/leaderboard/balance - Top players by balance
  fastify.get(
    '/leaderboard/balance',
    {
      schema: {
        tags: ['leaderboard'],
        summary: 'Get players ranked by balance',
        description: 'Get top players ranked by cash balance',
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: balanceLeaderboardSchema,
          500: errorResponseWrapperSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const pagination = {
          page: query.page || 1,
          limit: query.limit || 10
        }

        const leaderboard = await playerService.getLeaderboard('balance', pagination.limit)

        const paginationResult = {
          data: leaderboard,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: leaderboard.length, // For now, since getLeaderboard doesn't return total
            totalPages: Math.ceil(leaderboard.length / pagination.limit),
            hasNext: false,
            hasPrev: pagination.page > 1
          }
        }

        return ResponseFormatter.success(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get balance leaderboard')
        reply.statusCode = 500
        return ResponseFormatter.error('Failed to retrieve balance leaderboard', 500, getRequestId())
      }
    }
  )

  // GET /api/leaderboard/properties - Top players by properties
  fastify.get(
    '/leaderboard/properties',
    {
      schema: {
        tags: ['leaderboard'],
        summary: 'Get players ranked by properties',
        description: 'Get top players ranked by number of properties owned',
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: balanceLeaderboardSchema,
          500: errorResponseWrapperSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const pagination = {
          page: query.page || 1,
          limit: query.limit || 10
        }

        const leaderboard = await playerService.getLeaderboard('properties', pagination.limit)

        const paginationResult = {
          data: leaderboard,
          pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: leaderboard.length,
            totalPages: Math.ceil(leaderboard.length / pagination.limit),
            hasNext: false,
            hasPrev: pagination.page > 1
          }
        }

        return ResponseFormatter.success(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get properties leaderboard')
        reply.statusCode = 500
        return ResponseFormatter.error('Failed to retrieve properties leaderboard', 500, getRequestId())
      }
    }
  )

  // GET /api/leaderboard/winners - Top game winners
  fastify.get(
    '/leaderboard/winners',
    {
      schema: {
        tags: ['leaderboard'],
        summary: 'Get top game winners',
        description: 'Get players with the most game wins',
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: winnersLeaderboardSchema,
          500: errorResponseWrapperSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const pagination = {
          page: query.page || 1,
          limit: query.limit || 10
        }

        const result = await playerService.getTopWinners(pagination)

        const paginationResult = {
          data: result.data,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / result.limit),
            hasNext: result.page * result.limit < result.total,
            hasPrev: result.page > 1
          }
        }

        return ResponseFormatter.success(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get top winners')
        reply.statusCode = 500
        return ResponseFormatter.error('Failed to retrieve top winners', 500, getRequestId())
      }
    }
  )

  // GET /api/leaderboard/richest - Richest players by net worth
  fastify.get(
    '/leaderboard/richest',
    {
      schema: {
        tags: ['leaderboard'],
        summary: 'Get richest players',
        description: 'Get players with highest net worth including properties',
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: richestPlayersSchema,
          500: errorResponseWrapperSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const pagination = {
          page: query.page || 1,
          limit: query.limit || 10
        }

        const result = await playerService.getRichestPlayers(pagination)

        const paginationResult = {
          data: result.data,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / result.limit),
            hasNext: result.page * result.limit < result.total,
            hasPrev: result.page > 1
          }
        }

        return ResponseFormatter.success(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get richest players')
        reply.statusCode = 500
        return ResponseFormatter.error('Failed to retrieve richest players', 500, getRequestId())
      }
    }
  )

  // GET /api/leaderboard/property-moguls - Property moguls (most properties)
  fastify.get(
    '/leaderboard/property-moguls',
    {
      schema: {
        tags: ['leaderboard'],
        summary: 'Get property moguls',
        description: 'Get players with the most properties owned',
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: propertyMogulsSchema,
          500: errorResponseWrapperSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const pagination = {
          page: query.page || 1,
          limit: query.limit || 10
        }

        const result = await playerService.getPropertyMoguls(pagination)

        const paginationResult = {
          data: result.data,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / result.limit),
            hasNext: result.page * result.limit < result.total,
            hasPrev: result.page > 1
          }
        }

        return ResponseFormatter.success(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get property moguls')
        reply.statusCode = 500
        return ResponseFormatter.error('Failed to retrieve property moguls', 500, getRequestId())
      }
    }
  )

  // GET /api/leaderboard/recent-winners - Recent game winners
  fastify.get(
    '/leaderboard/recent-winners',
    {
      schema: {
        tags: ['leaderboard'],
        summary: 'Get recent game winners',
        description: 'Get players who won games recently',
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: recentWinnersSchema,
          500: errorResponseWrapperSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const pagination = {
          page: query.page || 1,
          limit: query.limit || 5
        }

        const result = await playerService.getRecentWinners(pagination)

        const paginationResult = {
          data: result.data,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: Math.ceil(result.total / result.limit),
            hasNext: result.page * result.limit < result.total,
            hasPrev: result.page > 1
          }
        }

        return ResponseFormatter.success(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get recent winners')
        reply.statusCode = 500
        return ResponseFormatter.error('Failed to retrieve recent winners', 500, getRequestId())
      }
    }
  )

  // GET /api/leaderboard/stats - Global game statistics
  fastify.get(
    '/leaderboard/stats',
    {
      schema: {
        tags: ['leaderboard'],
        summary: 'Get global game statistics',
        description: 'Get overall game statistics for homepage and leaderboard',
        response: {
          200: globalStatsSchema,
          500: errorResponseWrapperSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const stats = await playerService.getGlobalStats()
        return ResponseFormatter.success(stats, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get global stats')
        reply.statusCode = 500
        return ResponseFormatter.error('Failed to retrieve global stats', 500, getRequestId())
      }
    }
  )
}
