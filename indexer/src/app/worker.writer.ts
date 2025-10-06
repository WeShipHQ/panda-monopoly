// Bull worker: upsert into DB
import { Worker, writerDlq, writerEvents, workerBaseOpts } from '#infra/queue/bull'
import type { MonopolyRecord, WriterJob } from '#infra/queue/types'
import type { DatabasePort } from '#infra/db/db.port'
import { logger } from '#utils/logger'
import { metrics } from '#infra/metrics/metrics'

export function startWriterWorker(db: DatabasePort) {
  const worker = new Worker<WriterJob>(
    'writer',
    async (job) => {
      const { record } = job.data

      const handle = async (record: MonopolyRecord) => {
        switch (record.kind) {
          case 'game':
            return db.upsertGame(record.data)
          case 'player':
            return db.upsertPlayer(record.data)
          case 'property':
            return db.upsertProperty(record.data)
          case 'trade':
            return db.upsertTrade(record.data)
        }
      }

      logger.info(`Processing ${record.kind} record in writer worker`)
      const stopTimer = metrics.startTimer('writer:duration')
      try {
        logger.info(
          {
            kind: record.kind,
            pubkey: (record.data as any)?.pubkey,
            hasValidData: !!record.data
          },
          `About to call handle for record`
        )
        const result = await handle(record)
        await metrics.incr('writer:processed')
        logger.info(
          {
            kind: record.kind,
            pubkey: (record.data as any)?.pubkey
          },
          `✅ Successfully processed record in database`
        )
      } catch (err: any) {
        logger.error(
          {
            kind: record.kind,
            error: err.message,
            stack: err.stack,
            pubkey: (record.data as any)?.pubkey
          },
          `❌ Failed to process record`
        )
        metrics.incr('writer:failed')
        // đẩy vào DLQ, kèm lý do và đếm số lần replay
        await writerDlq.add('dlq', job.data, { jobId: job.id ?? undefined })
        throw err // để BullMQ mark failed
      } finally {
        stopTimer() // histogram
      }
    },
    workerBaseOpts
  )

  writerEvents.on('completed', async () => metrics.incr('writer:completed'))
  writerEvents.on('failed', async () => metrics.incr('writer:failed:event'))

  logger.info('Writer worker (Monopoly) started')
  return worker
}
