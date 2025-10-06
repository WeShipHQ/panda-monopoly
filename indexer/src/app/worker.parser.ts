// Queue → RPC getTransaction → decode → Queue writer
import env from '#config/env'
import { writerQueue, Worker, workerBaseOpts } from '#infra/queue/bull'
import { BackfillJob, RealtimeJob } from '#infra/queue/types'
import { rateLimitedRPC } from '#infra/rpc/solana'
import { logger } from '#utils/logger'
import { mapTxToMonopolyRecords } from './monopoly.mapper'

export function startParserWorkers() {
  const handle = async (signature: string) => {
    try {
      const tx = await rateLimitedRPC.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: env.solana.commitment
      })

      if (!tx) {
        logger.warn(`No transaction found for signature: ${signature}`)
        return
      }

      logger.info(`Processing transaction: ${signature}`)
      const records = mapTxToMonopolyRecords(tx)
      logger.info(`Transaction ${signature} produced ${records.length} records`)

      if (records.length > 0) {
        logger.info(
          {
            signature,
            recordSummary: records.map((r) => ({ kind: r.kind, hasData: !!r.data }))
          },
          `Records from transaction`
        )
      }

      for (const record of records) {
        // idempotent by pubkey if provided in data
        const id = (record as any)?.data?.pubkey ?? `${signature}-${record.kind}`
        await writerQueue.add('write', { record }, { jobId: id })
        logger.info(`Added ${record.kind} record to writer queue with id: ${id}`)
      }
    } catch (error: any) {
      logger.error(`Failed to process transaction ${signature}:`, error)
      throw error // Let the job queue handle retries
    }
  }

  const commonOpts = { ...workerBaseOpts, concurrency: env.tune.concurrency }

  const realtimeWorker = new Worker<RealtimeJob>(
    'realtime',
    async (job) => {
      await handle(job.data.signature)
    },
    commonOpts
  )

  const backfillWorker = new Worker<BackfillJob>(
    'backfill',
    async (job) => {
      await handle(job.data.signature)
    },
    commonOpts
  )

  logger.info('Parser workers (Monopoly) started')
  return { realtimeWorker, backfillWorker }
}
