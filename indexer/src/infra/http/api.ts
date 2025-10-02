// Fastify read-only API
import Fastify from 'fastify'
import type { DatabasePort } from '../db/db.port'
import { env } from '../../config'

export function startApi(db: DatabasePort) {
  const app = Fastify({ logger: false })

  app.get('/health', async () => ({ ok: true }))

  app.get('/swaps', async (req, reply) => {
    const { user, from, to, limit = 100 } = (req.query as any) ?? {}
    const rows = await (db as any).pool.query(
      `SELECT * FROM swaps
WHERE ($1::text IS NULL OR user_pubkey=$1)
AND ($2::timestamptz IS NULL OR block_time >= $2)
AND ($3::timestamptz IS NULL OR block_time < $3)
ORDER BY block_time DESC
LIMIT $4`,
      [user ?? null, from ?? null, to ?? null, Math.min(Number(limit), 500)]
    )
    return rows.rows
  })

  app.listen({ port: env.server.port, host: '0.0.0.0' })
}
