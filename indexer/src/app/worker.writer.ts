// Bull worker: upsert into DB
import { Worker } from '#infra/queue/bull'
import type { WriterJob } from '#infra/queue/types'
import type { DatabasePort } from '#infra/db/db.port'
import { logger } from '#utils/logger'

export function startWriterWorker(db: DatabasePort) {
  new Worker<WriterJob>('writer', async (job) => {
    await db.upsertSwap(job.data.event)
  })
  logger.info('Writer worker started')
}
