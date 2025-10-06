import { FastifyInstance } from 'fastify'
import healthRoutes from './health'
import gamesRoutes from './games'
import playersRoutes from './players'
import propertiesRoutes from './properties'
import tradesRoutes from './trades'
import rpcStatusRoutes from './rpc-status'
import metricsRoutes from './metrics'

export default async function routes(fastify: FastifyInstance) {
  // Root API endpoint
  fastify.get('/', async () => ({
    ok: true,
    message: 'Panda Monopoly Indexer API',
    version: '1.0.0',
    endpoints: {
      games: '/api/games',
      players: '/api/players',
      properties: '/api/properties',
      trades: '/api/trades',
      health: '/api/health',
      metrics: '/api/metrics',
      'rpc-status': '/api/rpc-status',
      docs: '/api-docs'
    }
  }))

  // Register all route modules
  await fastify.register(healthRoutes)
  await fastify.register(gamesRoutes)
  await fastify.register(playersRoutes)
  await fastify.register(propertiesRoutes)
  await fastify.register(tradesRoutes)
  await fastify.register(rpcStatusRoutes)
  await fastify.register(metricsRoutes)
}
