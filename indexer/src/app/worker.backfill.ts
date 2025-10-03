// Historical fetcher -> enqueue backfill
import { makeConnection } from '../infra/rpc/solana'
import { backfillQueue, opts } from '../infra/queue/bull'
import { logger } from '#utils/logger'
import { PublicKey } from '@solana/web3.js'

export async function runBackfill(programIdStr: string, startBeforeSig?: string) {
  const conn = makeConnection('http')
  const programKey = new PublicKey(programIdStr)

  // Try resume via checkpoints (by last_signature)
  let before: string | undefined = startBeforeSig

  while (true) {
    const batch = await conn.getSignaturesForAddress(programKey, { limit: 1000, before })
    if (batch.length === 0) break

    for (const s of batch) {
      await backfillQueue.add('bf', { signature: s.signature }, { ...opts, jobId: s.signature })
    }

    before = batch[batch.length - 1].signature
  }
}
