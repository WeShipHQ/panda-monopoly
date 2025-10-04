// Queue → RPC getTransaction → decode → Queue writer
import { writerQueue, Worker, opts, connection } from '#infra/queue/bull'
import { BackfillJob, RealtimeJob } from '#infra/queue/types'
import { makeConnection, rateLimitedRPC } from '#infra/rpc/solana'
import { logger } from '#utils/logger'
import { mapTxToMonopolyRecords } from './monopoly.mapper'

export function startParserWorkers() {
  const http = makeConnection('http')

  const handle = async (signature: string) => {
    const tx = await rateLimitedRPC.getParsedTransaction(http, signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    })
    if (!tx) return
    const records = mapTxToMonopolyRecords(tx)
    for (const rec of records) {
      // idempotent by pubkey if provided in data
      const id = (rec as any)?.data?.pubkey ?? `${signature}-${rec.kind}`
      await writerQueue.add('write', { record: rec }, { ...opts, jobId: id })
    }
  }

  const realtimeWorker = new Worker<RealtimeJob>(
    'realtime',
    async (job) => {
      await handle(job.data.signature)
    },
    {
      connection,
      concurrency: 2 // Limit concurrent jobs per worker
    }
  )

  const backfillWorker = new Worker<BackfillJob>(
    'backfill',
    async (job) => {
      await handle(job.data.signature)
    },
    {
      connection,
      concurrency: 3 // Limit concurrent jobs per worker
    }
  )

  logger.info('Parser workers (Monopoly) started')
  return { realtimeWorker, backfillWorker }
}
