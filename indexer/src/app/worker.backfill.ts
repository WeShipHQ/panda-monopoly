// Historical fetcher -> enqueue backfill
import { rateLimitedRPC } from '#infra/rpc/solana'
import { backfillQueue } from '#infra/queue/bull'
import { PublicKey } from '@solana/web3.js'
import env from '#config/env'
import { logger } from '#utils/logger'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function runBackfill(programIdStr: string, startBeforeSig?: string) {
  const programKey = new PublicKey(programIdStr)

  let before: string | undefined = startBeforeSig

  while (true) {
    try {
      const limit = Math.min(env.tune.backfillLimit, 1000)
      const batch = await rateLimitedRPC.getSignaturesForAddress(programKey, { limit, before })
      if (batch.length === 0) break

      for (const s of batch) {
        await backfillQueue.add('bf', { signature: s.signature }, { jobId: s.signature })
      }

      before = batch[batch.length - 1].signature
      logger.info(`Backfill enqueued ${batch.length} sigs, before=${before}`)
      // NEW: nhịp backfill theo profile
      // await sleep(env.tune.backfillSleep)
      // if (fetched >= env.tune.backfillLimit) break
    } catch (e: any) {
      // NEW: Solana JSON RPC long-term storage (-32019) → dừng nhã
      const error = e as { code?: number; message?: string }
      if (error?.code === -32019 || /long-term storage/i.test(String(error?.message))) {
        logger.warn('Backfill reached long-term storage boundary; stopping gracefully.')
        break
      }
      logger.error({ err: e }, 'Backfill error; retry after short sleep...')
      await sleep(1000)
    } finally {
      logger.info(`Backfill process completed for programId: ${programIdStr}`)
    }
  }
}
