import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { DatabasePort } from '#infra/db/db.port'
import { TradeService, ResponseFormatter } from '#shared'
import { getRequestId } from '../plugins/request-context'
import { tradeSchema, tradeFilterSchema, paginatedQueryRequestDtoSchema, responseWrapperSchema } from '#shared'

// Response schemas
const tradeListResponseSchema = responseWrapperSchema(
  Type.Object({
    data: Type.Array(tradeSchema),
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

const singleTradeResponseSchema = responseWrapperSchema(tradeSchema)

const tradeStatsResponseSchema = responseWrapperSchema(
  Type.Object({
    totalTrades: Type.Number(),
    pendingTrades: Type.Number(),
    completedTrades: Type.Number(),
    cancelledTrades: Type.Number(),
    averageTradeValue: Type.Number(),
    totalVolume: Type.Number()
  })
)

// Query schema with trade-specific filters
const tradeQuerySchema = Type.Object({
  ...paginatedQueryRequestDtoSchema.properties,
  ...tradeFilterSchema.properties
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

export default async function tradesRoutes(fastify: FastifyInstance) {
  const tradeService = new TradeService(fastify.db)

  // GET /api/trades - List trades with filtering and pagination
  fastify.get(
    '/trades',
    {
      schema: {
        tags: ['trades'],
        summary: 'List trades',
        description: 'Get a paginated list of monopoly trades with optional filtering',
        querystring: tradeQuerySchema,
        response: {
          200: tradeListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const filters = {
          gameId: query.gameId,
          fromPlayer: query.fromPlayer,
          toPlayer: query.toPlayer,
          status: query.status,
          propertyOffered: query.propertyOffered,
          propertyRequested: query.propertyRequested,
          minValue: query.minValue,
          maxValue: query.maxValue,
          createdAfter: query.createdAfter,
          createdBefore: query.createdBefore
        }

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await tradeService.getAll(filters, pagination)
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
        fastify.log.error(error, 'Failed to get trades')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve trades', 500, getRequestId()))
      }
    }
  )

  // GET /api/trades/:pubkey - Get single trade by pubkey
  fastify.get(
    '/trades/:pubkey',
    {
      schema: {
        tags: ['trades'],
        summary: 'Get trade by ID',
        description: 'Get a single trade by its public key',
        params: Type.Object({
          pubkey: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Trade public key'
          })
        }),
        response: {
          200: singleTradeResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { pubkey } = request.params as { pubkey: string }
        const trade = await tradeService.getById(pubkey)

        if (!trade) {
          reply.code(404)
          return ResponseFormatter.error('Trade not found', 404, getRequestId())
        }

        return ResponseFormatter.success(trade, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get trade')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve trade', 500, getRequestId()))
      }
    }
  )

  // GET /api/trades/game/:gameId - Get trades in a specific game
  fastify.get(
    '/trades/game/:gameId',
    {
      schema: {
        tags: ['trades'],
        summary: 'Get trades by game',
        description: 'Get all trades in a specific game',
        params: Type.Object({
          gameId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Game public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: tradeListResponseSchema,
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

        const { data, total } = await tradeService.getTradesByGame(gameId, pagination)
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
        fastify.log.error(error, 'Failed to get trades for game')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve game trades', 500, getRequestId()))
      }
    }
  )

  // GET /api/trades/player/:playerId - Get trades for a specific player
  fastify.get(
    '/trades/player/:playerId',
    {
      schema: {
        tags: ['trades'],
        summary: 'Get trades by player',
        description: 'Get all trades involving a specific player (as sender or receiver)',
        params: Type.Object({
          playerId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Player public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: tradeListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { playerId } = request.params as { playerId: string }
        const query = request.query as any

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await tradeService.getTradesByPlayer(playerId, pagination)
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
        fastify.log.error(error, 'Failed to get trades for player')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve player trades', 500, getRequestId()))
      }
    }
  )

  // GET /api/trades/pending/:playerId - Get pending trades for a specific player
  fastify.get(
    '/trades/pending/:playerId',
    {
      schema: {
        tags: ['trades'],
        summary: 'Get pending trades by player',
        description: 'Get all pending trades that require action from a specific player',
        params: Type.Object({
          playerId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Player public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: tradeListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { playerId } = request.params as { playerId: string }
        const query = request.query as any

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await tradeService.getPendingTrades(playerId, pagination)
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
        fastify.log.error(error, 'Failed to get pending trades')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve pending trades', 500, getRequestId()))
      }
    }
  )

  // GET /api/trades/stats - Get trade statistics
  fastify.get(
    '/trades/stats',
    {
      schema: {
        tags: ['trades'],
        summary: 'Get trade statistics',
        description: 'Get overall trade statistics and metrics',
        response: {
          200: tradeStatsResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const stats = await tradeService.getTradeStatistics()
        return ResponseFormatter.success(stats, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get trade statistics')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve trade statistics', 500, getRequestId()))
      }
    }
  )

  // GET /api/trades/history/:propertyId - Get trade history for a specific property
  fastify.get(
    '/trades/history/:propertyId',
    {
      schema: {
        tags: ['trades'],
        summary: 'Get property trade history',
        description: 'Get the trade history for a specific property',
        params: Type.Object({
          propertyId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Property public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: tradeListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { propertyId } = request.params as { propertyId: string }
        const query = request.query as any

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await tradeService.getPropertyTradeHistory(propertyId, pagination)
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
        fastify.log.error(error, 'Failed to get property trade history')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve trade history', 500, getRequestId()))
      }
    }
  )
}
