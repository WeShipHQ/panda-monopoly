import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { DatabasePort } from '#infra/db/db.port'
import { PlayerService, ResponseFormatter } from '#shared'
import { getRequestId } from '../plugins/request-context'
import { playerSchema, playerFilterSchema, paginatedQueryRequestDtoSchema, responseWrapperSchema } from '#shared'

// Response schemas
const playerListResponseSchema = responseWrapperSchema(
  Type.Object({
    data: Type.Array(playerSchema),
    pagination: Type.Object({
      page: Type.Number(),
      limit: Type.Number(),
      total: Type.Number(),
      totalPages: Type.Number(),
      hasNext: Type.Boolean(),
      hasPrev: Type.Boolean()
    })
  })
)

const singlePlayerResponseSchema = responseWrapperSchema(playerSchema)

const playerStatsResponseSchema = responseWrapperSchema(
  Type.Object({
    totalPlayers: Type.Number(),
    activePlayers: Type.Number(),
    averageBalance: Type.Number(),
    topPlayerByBalance: Type.Optional(playerSchema),
    topPlayerByProperties: Type.Optional(playerSchema)
  })
)

// Query schema with player-specific filters
const playerQuerySchema = Type.Object({
  ...paginatedQueryRequestDtoSchema.properties,
  ...playerFilterSchema.properties
})

// Error response schema
const errorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.Object({
    message: Type.String(),
    statusCode: Type.Number()
  }),
  requestId: Type.String()
})

// Declare Fastify instance type
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabasePort
  }
}

export default async function playersRoutes(fastify: FastifyInstance) {
  const playerService = new PlayerService(fastify.db)

  // GET /api/players - List players with filtering and pagination
  fastify.get(
    '/players',
    {
      schema: {
        tags: ['players'],
        summary: 'List players',
        description: 'Get a paginated list of monopoly players with optional filtering',
        querystring: playerQuerySchema,
        response: {
          200: playerListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const filters = {
          gameId: query.gameId,
          minBalance: query.minBalance,
          maxBalance: query.maxBalance,
          minProperties: query.minProperties,
          maxProperties: query.maxProperties,
          isActive: query.isActive
        }

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await playerService.getAll(filters, pagination)
        const paginationResult = {
          data,
          pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            total,
            totalPages: Math.ceil(total / (pagination.limit || 20)),
            hasNext: (pagination.page || 1) < Math.ceil(total / (pagination.limit || 20)),
            hasPrev: (pagination.page || 1) > 1
          }
        }
        return ResponseFormatter.paginated(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get players')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve players', 500, getRequestId()))
      }
    }
  )

  // GET /api/players/:pubkey - Get single player by pubkey
  fastify.get(
    '/players/:pubkey',
    {
      schema: {
        tags: ['players'],
        summary: 'Get player by ID',
        description: 'Get a single player by their public key',
        params: Type.Object({
          pubkey: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Player public key'
          })
        }),
        response: {
          200: singlePlayerResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { pubkey } = request.params as { pubkey: string }
        const player = await playerService.getById(pubkey)

        if (!player) {
          reply.code(404)
          return ResponseFormatter.error('Player not found', 404, getRequestId())
        }

        return ResponseFormatter.success(player, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get player')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve player', 500, getRequestId()))
      }
    }
  )

  // GET /api/players/game/:gameId - Get players in a specific game
  fastify.get(
    '/players/game/:gameId',
    {
      schema: {
        tags: ['players'],
        summary: 'Get players by game',
        description: 'Get all players participating in a specific game',
        params: Type.Object({
          gameId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Game public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: playerListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { gameId } = request.params as { gameId: string }
        const query = request.query as any

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await playerService.getPlayersByGame(gameId, pagination)
        const paginationResult = {
          data,
          pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 20,
            total,
            totalPages: Math.ceil(total / (pagination.limit || 20)),
            hasNext: (pagination.page || 1) < Math.ceil(total / (pagination.limit || 20)),
            hasPrev: (pagination.page || 1) > 1
          }
        }
        return ResponseFormatter.paginated(paginationResult, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get players for game')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve game players', 500, getRequestId()))
      }
    }
  )

  // GET /api/players/wallet/:wallet - Get player by wallet address
  fastify.get(
    '/players/wallet/:wallet',
    {
      schema: {
        tags: ['players'],
        summary: 'Get player by wallet',
        description: 'Get player information by wallet address',
        params: Type.Object({
          wallet: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Player wallet address'
          })
        }),
        response: {
          200: singlePlayerResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { wallet } = request.params as { wallet: string }
        const player = await playerService.getPlayerByWallet(wallet)

        if (!player) {
          reply.code(404)
          return ResponseFormatter.error('Player not found', 404, getRequestId())
        }

        return ResponseFormatter.success(player, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get player by wallet')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve player', 500, getRequestId()))
      }
    }
  )

  // GET /api/players/stats - Get player statistics
  fastify.get(
    '/players/stats',
    {
      schema: {
        tags: ['players'],
        summary: 'Get player statistics',
        description: 'Get overall player statistics and metrics',
        response: {
          200: playerStatsResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const stats = await playerService.getPlayerStatistics()
        return ResponseFormatter.success(stats, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get player statistics')
        return reply
          .code(500)
          .send(ResponseFormatter.error('Failed to retrieve player statistics', 500, getRequestId()))
      }
    }
  )

  // GET /api/players/leaderboard - Get player leaderboard
  fastify.get(
    '/players/leaderboard',
    {
      schema: {
        tags: ['players'],
        summary: 'Get player leaderboard',
        description: 'Get top players ranked by balance or properties',
        querystring: Type.Object({
          rankBy: Type.Optional(
            Type.Union([Type.Literal('balance'), Type.Literal('properties')], {
              default: 'balance',
              description: 'Ranking criteria'
            })
          ),
          limit: Type.Optional(
            Type.Number({
              minimum: 1,
              maximum: 100,
              default: 10,
              description: 'Number of top players to return'
            })
          )
        }),
        response: {
          200: responseWrapperSchema(
            Type.Object({
              leaderboard: Type.Array(
                Type.Object({
                  rank: Type.Number(),
                  player: playerSchema,
                  value: Type.Number(),
                  gameCount: Type.Number()
                })
              ),
              rankBy: Type.String()
            })
          ),
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const rankBy = query.rankBy || 'balance'
        const limit = query.limit || 10

        const leaderboard = await playerService.getLeaderboard(rankBy, limit)
        return ResponseFormatter.success({ leaderboard, rankBy }, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get player leaderboard')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve leaderboard', 500, getRequestId()))
      }
    }
  )
}
