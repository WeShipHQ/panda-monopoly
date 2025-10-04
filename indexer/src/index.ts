import { startRealtimeListener } from '#app/listener.realtime'
import { runBackfill } from '#app/worker.backfill'
import { startParserWorkers } from '#app/worker.parser'
import { startWriterWorker } from '#app/worker.writer'
import env from '#config/env'
import { DrizzleAdapter } from '#infra/db/drizzle.adapter'
import { startApi } from '#infra/http/api'
import { backfillQueue, realtimeQueue, writerDlq, writerQueue, connection } from '#infra/queue/bull'
import { logger } from '#utils/logger'

async function main() {
  const db = new DrizzleAdapter()
  await db.init()

  startApi(db)

  const writerWorker = startWriterWorker(db)
  const { realtimeWorker, backfillWorker } = startParserWorkers()

  let unsubscribe: (() => Promise<void>) | undefined

  if (env.indexer.realtimeEnabled) {
    await startRealtimeListener()
  }

  if (env.indexer.backfillEnabled) {
    await runBackfill(env.solana.programId)
  }

  logger.info('Indexer up (Drizzle + Monopoly)')

  const shutdown = async (signal: string) => {
    try {
      logger.info({ signal }, 'Shutting down...')
      if (unsubscribe) {
        await unsubscribe()
      }
      await Promise.allSettled([writerWorker.close(), realtimeWorker.close(), backfillWorker.close()])
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
