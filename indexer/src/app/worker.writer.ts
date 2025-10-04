// Bull worker: upsert into DB
import { Worker, writerDlq, writerEvents, connection } from '#infra/queue/bull'
import type { MonopolyRecord, WriterJob } from '#infra/queue/types'
import type { DatabasePort } from '#infra/db/db.port'
import { logger } from '#utils/logger'
import { metrics } from '#infra/metrics/metrics'

export function startWriterWorker(db: DatabasePort) {
  const worker = new Worker<WriterJob>(
    'writer',
    async (job) => {
      const { record } = job.data

      const handle = async (r: MonopolyRecord) => {
        switch (r.kind) {
          case 'game':
            return db.upsertGame(r.data)
          case 'player':
            return db.upsertPlayer(r.data)
          case 'property':
            return db.upsertProperty(r.data)
          case 'trade':
            return db.upsertTrade(r.data)
        }
      }

      try {
        await handle(record)
        await metrics.incr('writer:processed')
      } catch (err: any) {
        await metrics.incr('writer:failed')
        // Push to DLQ with the same jobId for traceability
        await writerDlq.add('dlq', job.data, { jobId: job.id ?? undefined })
        throw err
      }
    },
    { connection }
  )

  writerEvents.on('completed', async () => metrics.incr('writer:completed'))
  writerEvents.on('failed', async () => metrics.incr('writer:failed:event'))

  logger.info('Writer worker (Monopoly) started')
  return worker
}
