// Fastify read-only API
import Fastify from 'fastify'
import { env } from '#config'
import { DatabasePort } from '#infra/db/db.port'
import { metrics } from '#infra/metrics/metrics'

export function startApi(db: DatabasePort) {
  const app = Fastify({ logger: false })

  app.get('/health', async () => ({ ok: true }))

  app.get('/game/:pubkey', async (req) => {
    const pubkey = (req.params as any).pubkey as string
    return db.getGame(pubkey)
  })
  app.get('/player/:pubkey', async (req) => {
    const pubkey = (req.params as any).pubkey as string
    return db.getPlayer(pubkey)
  })
  app.get('/property/:pubkey', async (req) => {
    const pubkey = (req.params as any).pubkey as string
    return db.getProperty(pubkey)
  })
  app.get('/trade/:pubkey', async (req) => {
    const pubkey = (req.params as any).pubkey as string
    return db.getTrade(pubkey)
  })

  app.get('/metrics', async () => metrics.dump())

  app.listen({ port: env.server.port, host: '0.0.0.0' })
}
