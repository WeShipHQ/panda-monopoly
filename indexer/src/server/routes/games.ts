import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { DatabasePort } from '#infra/db/db.port'
import { GameService, ResponseFormatter } from '#shared'
import { getRequestId } from '../plugins/request-context'
import { gameSchema, gameFilterSchema, paginatedQueryRequestDtoSchema, responseWrapperSchema } from '#shared'

// Response schemas
const gameListResponseSchema = responseWrapperSchema(
  Type.Object({
    data: Type.Array(gameSchema),
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

const gameStatsResponseSchema = responseWrapperSchema(
  Type.Object({
    total: Type.Number(),
    active: Type.Number(),
    finished: Type.Number(),
    waiting: Type.Number()
  })
)

const singleGameResponseSchema = responseWrapperSchema(gameSchema)

// Extend query schema with game-specific filters
const gameQuerySchema = Type.Object({
  ...paginatedQueryRequestDtoSchema.properties,
  ...gameFilterSchema.properties
})

// Declare Fastify instance type
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabasePort
  }
}

export default async function gamesRoutes(fastify: FastifyInstance) {
  const gameService = new GameService(fastify.db)

  // GET /api/games - List games with filtering and pagination
  fastify.get(
    '/games',
    {
      schema: {
        tags: ['games'],
        summary: 'List games',
        description: 'Get a paginated list of monopoly games with optional filtering',
        querystring: gameQuerySchema,
        response: {
          200: gameListResponseSchema,
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.Object({
              message: Type.String(),
              statusCode: Type.Number()
            }),
            requestId: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const filters = {
          gameStatus: query.gameStatus,
          player: query.player,
          maxPlayers: query.maxPlayers,
          createdAfter: query.createdAfter,
          createdBefore: query.createdBefore
        }

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await gameService.getAll(filters, pagination)
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
        fastify.log.error(error, 'Failed to get games')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve games', 500, getRequestId()))
      }
    }
  )

  // GET /api/games/:pubkey - Get single game by pubkey
  fastify.get(
    '/games/:pubkey',
    {
      schema: {
        tags: ['games'],
        summary: 'Get game by ID',
        description: 'Get a single monopoly game by its public key',
        params: Type.Object({
          pubkey: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Game public key'
          })
        }),
        response: {
          200: singleGameResponseSchema,
          404: Type.Object({
            success: Type.Boolean(),
            error: Type.Object({
              message: Type.String(),
              statusCode: Type.Number()
            }),
            requestId: Type.String()
          }),
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.Object({
              message: Type.String(),
              statusCode: Type.Number()
            }),
            requestId: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const { pubkey } = request.params as { pubkey: string }
        const game = await gameService.getById(pubkey)

        if (!game) {
          reply.code(404)
          return ResponseFormatter.error('Game not found', 404, getRequestId())
        }

        return ResponseFormatter.success(game, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get game')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve game', 500, getRequestId()))
      }
    }
  )

  // GET /api/games/active - Get active games
  fastify.get(
    '/games/active',
    {
      schema: {
        tags: ['games'],
        summary: 'List active games',
        description: 'Get a paginated list of games currently in progress',
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: gameListResponseSchema,
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.Object({
              message: Type.String(),
              statusCode: Type.Number()
            }),
            requestId: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await gameService.getActiveGames(pagination)
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
        fastify.log.error(error, 'Failed to get active games')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve active games', 500, getRequestId()))
      }
    }
  )

  // GET /api/games/player/:wallet - Get games for a specific player
  fastify.get(
    '/games/player/:wallet',
    {
      schema: {
        tags: ['games'],
        summary: 'Get games by player',
        description: 'Get games where the specified player is participating',
        params: Type.Object({
          wallet: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Player wallet address'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: gameListResponseSchema,
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.Object({
              message: Type.String(),
              statusCode: Type.Number()
            }),
            requestId: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const { wallet } = request.params as { wallet: string }
        const query = request.query as any

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await gameService.getGamesByPlayer(wallet, pagination)
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
        fastify.log.error(error, 'Failed to get games for player')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve player games', 500, getRequestId()))
      }
    }
  )

  // GET /api/games/stats - Get game statistics
  fastify.get(
    '/games/stats',
    {
      schema: {
        tags: ['games'],
        summary: 'Get game statistics',
        description: 'Get overall game statistics and metrics',
        response: {
          200: gameStatsResponseSchema,
          500: Type.Object({
            success: Type.Boolean(),
            error: Type.Object({
              message: Type.String(),
              statusCode: Type.Number()
            }),
            requestId: Type.String()
          })
        }
      }
    },
    async (request, reply) => {
      try {
        const stats = await gameService.getGameStatistics()
        const response = {
          ...stats,
          waiting: stats.total - stats.active - stats.finished
        }
        return ResponseFormatter.success(response, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get game statistics')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve game statistics', 500, getRequestId()))
      }
    }
  )
}
