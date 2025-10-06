import { FastifyInstance } from 'fastify'
import { Type } from '@sinclair/typebox'
import { DatabasePort } from '#infra/db/db.port'
import { PropertyService, ResponseFormatter } from '#shared'
import { getRequestId } from '../plugins/request-context'
import { propertySchema, propertyFilterSchema, paginatedQueryRequestDtoSchema, responseWrapperSchema } from '#shared'

// Response schemas
const propertyListResponseSchema = responseWrapperSchema(
  Type.Object({
    data: Type.Array(propertySchema),
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

const singlePropertyResponseSchema = responseWrapperSchema(propertySchema)

const propertyStatsResponseSchema = responseWrapperSchema(
  Type.Object({
    totalProperties: Type.Number(),
    ownedProperties: Type.Number(),
    averagePrice: Type.Number(),
    averageRent: Type.Number(),
    mostExpensiveProperty: Type.Optional(propertySchema),
    mostPopularLocation: Type.Optional(
      Type.Object({
        position: Type.Number(),
        count: Type.Number()
      })
    )
  })
)

// Query schema with property-specific filters
const propertyQuerySchema = Type.Object({
  ...paginatedQueryRequestDtoSchema.properties,
  ...propertyFilterSchema.properties
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

export default async function propertiesRoutes(fastify: FastifyInstance) {
  const propertyService = new PropertyService(fastify.db)

  // GET /api/properties - List properties with filtering and pagination
  fastify.get(
    '/properties',
    {
      schema: {
        tags: ['properties'],
        summary: 'List properties',
        description: 'Get a paginated list of monopoly properties with optional filtering',
        querystring: propertyQuerySchema,
        response: {
          200: propertyListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const query = request.query as any
        const filters = {
          gameId: query.gameId,
          ownerId: query.ownerId,
          minPrice: query.minPrice,
          maxPrice: query.maxPrice,
          minRent: query.minRent,
          maxRent: query.maxRent,
          position: query.position,
          isOwned: query.isOwned,
          colorGroup: query.colorGroup
        }

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await propertyService.getAll(filters, pagination)
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
        fastify.log.error(error, 'Failed to get properties')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve properties', 500, getRequestId()))
      }
    }
  )

  // GET /api/properties/:pubkey - Get single property by pubkey
  fastify.get(
    '/properties/:pubkey',
    {
      schema: {
        tags: ['properties'],
        summary: 'Get property by ID',
        description: 'Get a single property by its public key',
        params: Type.Object({
          pubkey: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Property public key'
          })
        }),
        response: {
          200: singlePropertyResponseSchema,
          404: errorResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { pubkey } = request.params as { pubkey: string }
        const property = await propertyService.getById(pubkey)

        if (!property) {
          reply.code(404)
          return ResponseFormatter.error('Property not found', 404, getRequestId())
        }

        return ResponseFormatter.success(property, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get property')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve property', 500, getRequestId()))
      }
    }
  )

  // GET /api/properties/game/:gameId - Get properties in a specific game
  fastify.get(
    '/properties/game/:gameId',
    {
      schema: {
        tags: ['properties'],
        summary: 'Get properties by game',
        description: 'Get all properties in a specific game',
        params: Type.Object({
          gameId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Game public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: propertyListResponseSchema,
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

        const { data, total } = await propertyService.getPropertiesByGame(gameId, pagination)
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
        fastify.log.error(error, 'Failed to get properties for game')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve game properties', 500, getRequestId()))
      }
    }
  )

  // GET /api/properties/owner/:ownerId - Get properties owned by a specific player
  fastify.get(
    '/properties/owner/:ownerId',
    {
      schema: {
        tags: ['properties'],
        summary: 'Get properties by owner',
        description: 'Get all properties owned by a specific player',
        params: Type.Object({
          ownerId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Owner public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: propertyListResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const { ownerId } = request.params as { ownerId: string }
        const query = request.query as any

        const pagination = {
          page: query.page,
          limit: query.limit,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder
        }

        const { data, total } = await propertyService.getPropertiesByOwner(ownerId, pagination)
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
        fastify.log.error(error, 'Failed to get properties for owner')
        return reply.code(500).send(ResponseFormatter.error('Failed to retrieve owner properties', 500, getRequestId()))
      }
    }
  )

  // GET /api/properties/stats - Get property statistics
  fastify.get(
    '/properties/stats',
    {
      schema: {
        tags: ['properties'],
        summary: 'Get property statistics',
        description: 'Get overall property statistics and metrics',
        response: {
          200: propertyStatsResponseSchema,
          500: errorResponseSchema
        }
      }
    },
    async (request, reply) => {
      try {
        const stats = await propertyService.getPropertyStatistics()
        return ResponseFormatter.success(stats, getRequestId())
      } catch (error) {
        fastify.log.error(error, 'Failed to get property statistics')
        return reply
          .code(500)
          .send(ResponseFormatter.error('Failed to retrieve property statistics', 500, getRequestId()))
      }
    }
  )

  // GET /api/properties/available/:gameId - Get available properties for purchase
  fastify.get(
    '/properties/available/:gameId',
    {
      schema: {
        tags: ['properties'],
        summary: 'Get available properties',
        description: 'Get properties available for purchase in a specific game',
        params: Type.Object({
          gameId: Type.String({
            pattern: '^[1-9A-HJ-NP-Za-km-z]{32,44}$',
            description: 'Game public key'
          })
        }),
        querystring: paginatedQueryRequestDtoSchema,
        response: {
          200: propertyListResponseSchema,
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

        const { data, total } = await propertyService.getAvailableProperties(gameId, pagination)
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
        fastify.log.error(error, 'Failed to get available properties')
        return reply
          .code(500)
          .send(ResponseFormatter.error('Failed to retrieve available properties', 500, getRequestId()))
      }
    }
  )
}
