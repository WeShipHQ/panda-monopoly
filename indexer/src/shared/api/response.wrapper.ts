import { Type, TSchema } from '@sinclair/typebox'

// Generic response wrapper that adds success flag and request ID
export const responseWrapperSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Boolean({ default: true }),
    data: dataSchema,
    requestId: Type.String()
  })

// Error response wrapper
export const errorResponseWrapperSchema = Type.Object({
  success: Type.Boolean({ default: false }),
  error: Type.Object({
    message: Type.String(),
    statusCode: Type.Number(),
    details: Type.Optional(Type.Any())
  }),
  requestId: Type.String()
})

// Paginated response wrapper
export const paginatedResponseWrapperSchema = <T extends TSchema>(dataSchema: T) =>
  responseWrapperSchema(
    Type.Object({
      data: Type.Array(dataSchema),
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
