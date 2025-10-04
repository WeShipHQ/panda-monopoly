// WebSocket logsSubscribe -> enqueue realtime
import { makeConnection, programId } from '#infra/rpc/solana'
import { realtimeQueue, opts } from '#infra/queue/bull'
import { logger } from '#utils/logger'

export async function startRealtimeListener() {
  const conn = makeConnection('ws')
  const subId = await conn.onLogs(
    programId,
    async (logs) => {
      const sig = logs.signature
      // Idempotency: set jobId = signature to avoid duplicates
      await realtimeQueue.add('rt', { signature: sig }, { ...opts, jobId: sig })
    },
    'confirmed'
  )
  logger.info({ subId }, 'Realtime listener subscribed')
  return () => conn.removeOnLogsListener(subId)
}
