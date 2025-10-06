import { backfillQueue, realtimeQueue, writerDlq, writerQueue, connection } from '#infra/queue/bull'
import { startRealtimeListener } from '#app/listener.realtime'
import { DrizzleAdapter } from '#infra/db/drizzle.adapter'
import { startParserWorkers } from '#app/worker.parser'
import { startWriterWorker } from '#app/worker.writer'
import { startDlqReplayer } from '#app/worker.dlq'
import { runBackfill } from '#app/worker.backfill'
import { logger } from '#utils/logger'
import createServer from '#server'
import env from '#config/env'
import { startQueueMetricsPoller } from '#infra/metrics/metrics'
import { startRedisHousekeeping } from '#app/maintenance.cleanup'

async function main() {
  const db = new DrizzleAdapter()
  await db.init()

  const { fastify, graceful } = await createServer(db)

  const writerWorker = startWriterWorker(db)
  const { realtimeWorker, backfillWorker } = startParserWorkers()
  const dlqWorker = startDlqReplayer()

  const stopQueuePoller = startQueueMetricsPoller({
    realtime: realtimeQueue,
    backfill: backfillQueue,
    writer: writerQueue,
    writerDlq: writerDlq
  })

  const stopCleanup = startRedisHousekeeping([realtimeQueue, backfillQueue, writerQueue, writerDlq])

  let unsubscribe: (() => Promise<void>) | undefined

  if (env.indexer.realtimeEnabled) {
    unsubscribe = await startRealtimeListener()
  }

  if (env.indexer.backfillEnabled) {
    await runBackfill(env.solana.programId)
  }

  await fastify.listen({ port: env.server.port, host: env.server.host })
  graceful.setReady()

  logger.info('Indexer + API up (Drizzle + Monopoly)')

  const shutdown = async (signal: string) => {
    try {
      logger.info({ signal }, 'Shutting down indexer...')

      // 1. Stop incoming data flow
      if (unsubscribe) await unsubscribe()

      // 2. Stop cleanup processes and queue polling
      try {
        stopCleanup?.()
        stopQueuePoller?.()
      } catch (err) {
        logger.warn(err, 'Error stopping cleanup processes')
      }

      // 3. Close all workers
      await Promise.allSettled([
        writerWorker.close(),
        realtimeWorker.close(),
        backfillWorker.close(),
        dlqWorker.close()
      ])

      await Promise.allSettled([writerQueue.close(), writerDlq.close(), realtimeQueue.close(), backfillQueue.close()])

      await db.pool.end()
      await connection.quit()
      process.exit(0)
    } catch (e) {
      logger.error(e, 'Error during shutdown')
      process.exit(1)
    }
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  logger.error(err)
  process.exit(1)
})
