import { writerQueue, Worker, opts } from '#infra/queue/bull'
import { BackfillJob, RealtimeJob } from '#infra/queue/types'
import { makeConnection } from '#infra/rpc/solana'
import { JupiterSwapParser } from '#parsers/jupiter.swap'
import { logger } from '#utils/logger'

const parser = new JupiterSwapParser()

export function startParserWorkers() {
  const http = makeConnection('http')

  new Worker<RealtimeJob>('realtime', async (job) => {
    const sig = job.data.signature
    const tx = await http.getTransaction(sig, { maxSupportedTransactionVersion: 0 })
    if (!tx) return
    const evt = parser.parse(tx)
    if (evt) await writerQueue.add('write', { event: evt }, opts)
  })

  new Worker<BackfillJob>('backfill', async (job) => {
    const sig = job.data.signature
    const tx = await http.getTransaction(sig, { maxSupportedTransactionVersion: 0 })
    if (!tx) return
    const evt = parser.parse(tx)
    if (evt) await writerQueue.add('write', { event: evt }, opts)
  })

  logger.info('Parser workers started')
}
