import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { DatabasePort } from '#infra/db/db.port'
import { GameService, GameLogService, ResponseFormatter } from '#shared'
import { getRequestId } from '../plugins/request-context'
import {
  gameSchema,
  gameFilterSchema,
  paginatedQueryRequestDtoSchema,
  responseWrapperSchema,
  errorResponseWrapperSchema
} from '#shared'

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

// Error response schema for games
const errorResponseSchema = errorResponseWrapperSchema

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
  const db = fastify.db
  const gameService = new GameService(db)

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
        return reply.code(500).send({
          success: false,
          error: {
            message: 'Failed to retrieve games',
            statusCode: 500
          },
          requestId: getRequestId()
        })
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

        // Handle database connection issues gracefully
        let game = null
        try {
          game = await gameService.getById(pubkey)
        } catch (dbError) {
          fastify.log.error(dbError, 'Database connection failed in getGame')
          return reply.code(500).send(ResponseFormatter.error('Database temporarily unavailable', 500, getRequestId()))
        }

        if (!game) {
          return reply.code(404).send(ResponseFormatter.error('Game not found', 404, getRequestId()))
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
        return reply.code(500).send({
          success: false,
          error: {
            message: 'Failed to retrieve active games',
            statusCode: 500
          },
          requestId: getRequestId()
        })
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

  // === GAME LOGS NESTED ROUTES ===
  const gameLogService = new GameLogService(db)

  // Game Log schemas
  const gameLogTypeSchema = Type.Union([
    Type.Literal('move'),
    Type.Literal('purchase'),
    Type.Literal('rent'),
    Type.Literal('card'),
    Type.Literal('jail'),
    Type.Literal('bankruptcy'),
    Type.Literal('turn'),
    Type.Literal('dice'),
    Type.Literal('building'),
    Type.Literal('trade'),
    Type.Literal('game'),
    Type.Literal('skip'),
    Type.Literal('join')
  ])

  const gameLogDetailsSchema = Type.Optional(
    Type.Object({
      propertyName: Type.Optional(Type.String()),
      position: Type.Optional(Type.Number()),
      price: Type.Optional(Type.Number()),
      owner: Type.Optional(Type.String()),
      cardType: Type.Optional(Type.Union([Type.Literal('chance'), Type.Literal('community-chest')])),
      cardTitle: Type.Optional(Type.String()),
      cardDescription: Type.Optional(Type.String()),
      cardIndex: Type.Optional(Type.Number()),
      effectType: Type.Optional(Type.Number()),
      amount: Type.Optional(Type.Number()),
      tradeId: Type.Optional(Type.String()),
      action: Type.Optional(Type.String()),
      targetPlayer: Type.Optional(Type.String()),
      targetPlayerName: Type.Optional(Type.String()),
      offeredProperties: Type.Optional(Type.Array(Type.Number())),
      requestedProperties: Type.Optional(Type.Array(Type.Number())),
      offeredMoney: Type.Optional(Type.Number()),
      requestedMoney: Type.Optional(Type.Number()),
      fromPosition: Type.Optional(Type.Number()),
      toPosition: Type.Optional(Type.Number()),
      diceRoll: Type.Optional(Type.Tuple([Type.Number(), Type.Number()])),
      doublesCount: Type.Optional(Type.Number()),
      passedGo: Type.Optional(Type.Boolean()),
      jailReason: Type.Optional(
        Type.Union([Type.Literal('doubles'), Type.Literal('go_to_jail'), Type.Literal('card')])
      ),
      fineAmount: Type.Optional(Type.Number()),
      buildingType: Type.Optional(Type.Union([Type.Literal('house'), Type.Literal('hotel')])),
      taxType: Type.Optional(Type.String()),
      signature: Type.Optional(Type.String()),
      error: Type.Optional(Type.String())
    })
  )

  const gameLogEntrySchema = Type.Object({
    id: Type.String(),
    timestamp: Type.Number(),
    type: gameLogTypeSchema,
    playerId: Type.String(),
    playerName: Type.Optional(Type.String()),
    message: Type.String(),
    details: gameLogDetailsSchema
  })

  const createGameLogSchema = Type.Object({
    playerId: Type.String(),
    playerName: Type.Optional(Type.String()),
    type: gameLogTypeSchema,
    message: Type.String(),
    timestamp: Type.Optional(Type.Number()),
    // All detail fields as optional
    propertyName: Type.Optional(Type.String()),
    position: Type.Optional(Type.Number()),
    price: Type.Optional(Type.Number()),
    owner: Type.Optional(Type.String()),
    cardType: Type.Optional(Type.Union([Type.Literal('chance'), Type.Literal('community-chest')])),
    cardTitle: Type.Optional(Type.String()),
    cardDescription: Type.Optional(Type.String()),
    cardIndex: Type.Optional(Type.Number()),
    effectType: Type.Optional(Type.Number()),
    amount: Type.Optional(Type.Number()),
    tradeId: Type.Optional(Type.String()),
    action: Type.Optional(Type.String()),
    targetPlayer: Type.Optional(Type.String()),
    targetPlayerName: Type.Optional(Type.String()),
    offeredProperties: Type.Optional(Type.Array(Type.Number())),
    requestedProperties: Type.Optional(Type.Array(Type.Number())),
    offeredMoney: Type.Optional(Type.Number()),
    requestedMoney: Type.Optional(Type.Number()),
    fromPosition: Type.Optional(Type.Number()),
    toPosition: Type.Optional(Type.Number()),
    diceRoll: Type.Optional(Type.Tuple([Type.Number(), Type.Number()])),
    doublesCount: Type.Optional(Type.Number()),
    passedGo: Type.Optional(Type.Boolean()),
    jailReason: Type.Optional(Type.Union([Type.Literal('doubles'), Type.Literal('go_to_jail'), Type.Literal('card')])),
    fineAmount: Type.Optional(Type.Number()),
    buildingType: Type.Optional(Type.Union([Type.Literal('house'), Type.Literal('hotel')])),
    taxType: Type.Optional(Type.String()),
    signature: Type.Optional(Type.String()),
    error: Type.Optional(Type.String()),
    slot: Type.Optional(Type.Number())
  })

  const gameLogFilterSchema = Type.Object({
    playerId: Type.Optional(Type.String()),
    type: Type.Optional(gameLogTypeSchema),
    position: Type.Optional(Type.Number()),
    startTime: Type.Optional(Type.Number()),
    endTime: Type.Optional(Type.Number())
  })

  const gameLogListResponseSchema = responseWrapperSchema(
    Type.Object({
      data: Type.Array(gameLogEntrySchema),
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

  const gameLogResponseSchema = responseWrapperSchema(gameLogEntrySchema)

  // GET /:pubkey/game-logs - Get game logs for a specific game
  fastify.get<{
    Params: { pubkey: string }
    Querystring: typeof gameLogFilterSchema.static & typeof paginatedQueryRequestDtoSchema.static
  }>(
    '/games/:pubkey/game-logs',
    {
      schema: {
        tags: ['games'],
        summary: 'Get game logs for a specific game',
        description: 'Get paginated game logs for a specific game with optional filtering',
        params: Type.Object({
          pubkey: Type.String({ description: 'Game public key' })
        }),
        querystring: Type.Intersect([gameLogFilterSchema, paginatedQueryRequestDtoSchema]),
        response: {
          // Disable schema validation temporarily
        }
      }
    },
    async (request, reply) => {
      try {
        const { pubkey: gameId } = request.params
        const { page = 1, limit = 50, ...filters } = request.query
        const sortOrder = 'desc'
        const requestId = getRequestId()

        const result = await gameLogService.getGameLogsAsEntries(gameId, filters, { page, limit, sortOrder })

        const totalPages = Math.ceil(result.total / limit)
        const hasNext = page < totalPages
        const hasPrev = page > 1

        const response = ResponseFormatter.success(
          {
            data: result.data,
            pagination: {
              page,
              limit,
              total: result.total,
              totalPages,
              hasNext,
              hasPrev
            }
          },
          requestId
        )

        reply.code(200).send(response)
      } catch (error) {
        fastify.log.error({ err: error }, 'Failed to fetch game logs')
        const requestId = getRequestId()
        const response = ResponseFormatter.error('Failed to fetch game logs', 500, requestId)
        reply.code(500).send(response)
      }
    }
  )

  // POST /:pubkey/game-logs - Create a new game log entry for a specific game
  fastify.post<{
    Params: { pubkey: string }
    Body: typeof createGameLogSchema.static
  }>(
    '/games/:pubkey/game-logs',
    {
      schema: {
        tags: ['games'],
        summary: 'Create a new game log entry',
        description: 'Create a new game log entry for a specific game',
        params: Type.Object({
          pubkey: Type.String({ description: 'Game public key' })
        }),
        body: createGameLogSchema,
        response: {
          // Disable schema validation temporarily
        }
      }
    },
    async (request, reply) => {
      try {
        const { pubkey: gameId } = request.params
        const logData = request.body
        const requestId = getRequestId()

        const createdLog = await gameLogService.createLog({
          ...logData,
          gameId,
          timestamp: logData.timestamp || Date.now()
        })

        // Convert to GameLogEntry format for response
        const logEntry = {
          id: createdLog.id,
          timestamp: Number(createdLog.timestamp),
          type: createdLog.type,
          playerId: createdLog.playerId,
          playerName: createdLog.playerName || undefined,
          message: createdLog.message,
          details: {
            propertyName: createdLog.propertyName || undefined,
            position: createdLog.position || undefined,
            price: createdLog.price ? Number(createdLog.price) : undefined,
            owner: createdLog.owner || undefined,
            cardType: createdLog.cardType as 'chance' | 'community-chest' | undefined,
            cardTitle: createdLog.cardTitle || undefined,
            cardDescription: createdLog.cardDescription || undefined,
            cardIndex: createdLog.cardIndex || undefined,
            effectType: createdLog.effectType || undefined,
            amount: createdLog.amount ? Number(createdLog.amount) : undefined,
            tradeId: createdLog.tradeId || undefined,
            action: createdLog.action || undefined,
            targetPlayer: createdLog.targetPlayer || undefined,
            targetPlayerName: createdLog.targetPlayerName || undefined,
            offeredProperties: createdLog.offeredProperties || undefined,
            requestedProperties: createdLog.requestedProperties || undefined,
            offeredMoney: createdLog.offeredMoney ? Number(createdLog.offeredMoney) : undefined,
            requestedMoney: createdLog.requestedMoney ? Number(createdLog.requestedMoney) : undefined,
            fromPosition: createdLog.fromPosition || undefined,
            toPosition: createdLog.toPosition || undefined,
            diceRoll: createdLog.diceRoll || undefined,
            doublesCount: createdLog.doublesCount || undefined,
            passedGo: createdLog.passedGo || undefined,
            jailReason: createdLog.jailReason as 'doubles' | 'go_to_jail' | 'card' | undefined,
            fineAmount: createdLog.fineAmount ? Number(createdLog.fineAmount) : undefined,
            buildingType: createdLog.buildingType as 'house' | 'hotel' | undefined,
            taxType: createdLog.taxType || undefined,
            signature: createdLog.signature || undefined,
            error: createdLog.error || undefined
          }
        }

        const response = ResponseFormatter.success(logEntry, requestId)
        reply.code(201).send(response)
      } catch (error) {
        fastify.log.error({ err: error }, 'Failed to create game log')
        const requestId = getRequestId()
        const response = ResponseFormatter.error('Failed to create game log', 500, requestId)
        reply.code(500).send(response)
      }
    }
  )

  // DELETE /:pubkey/game-logs - Delete all logs for a game
  fastify.delete<{
    Params: { pubkey: string }
  }>(
    '/games/:pubkey/game-logs',
    {
      schema: {
        tags: ['games'], // ✅ Keep under games section
        summary: 'Delete game logs for a specific game',
        description: 'Delete all game logs for a specific game',
        params: Type.Object({
          pubkey: Type.String({ description: 'Game public key' })
        }),
        response: {
          200: responseWrapperSchema(Type.Object({ message: Type.String() })),
          500: responseWrapperSchema(Type.Object({ error: Type.String() }))
        }
      }
    },
    async (request, reply) => {
      try {
        const { pubkey: gameId } = request.params
        const requestId = getRequestId()

        await gameLogService.deleteGameLogs(gameId)

        const response = ResponseFormatter.success(
          { message: `All logs for game ${gameId} have been deleted` },
          requestId
        )
        reply.code(200).send(response)
      } catch (error) {
        fastify.log.error({ err: error }, 'Failed to delete game logs')
        const requestId = getRequestId()
        const response = ResponseFormatter.error('Failed to delete game logs', 500, requestId)
        reply.code(500).send(response)
      }
    }
  )
}
