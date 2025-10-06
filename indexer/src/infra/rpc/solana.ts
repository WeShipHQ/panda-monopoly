import { env } from '#config'
import { Connection, PublicKey, type Commitment, type ConnectionConfig } from '@solana/web3.js'
import Bottleneck from 'bottleneck'
import { rpcPool } from './rpc-pool'
import { logger } from '#utils/logger'

export const programId = new PublicKey(env.solana.programId)

// Global rate limiter across all RPC endpoints
const globalRateLimiter = new Bottleneck({
  reservoir: env.solana.rateLimit, // quota/s
  reservoirRefreshAmount: env.solana.rateLimit,
  reservoirRefreshInterval: 1000, // refill mỗi giây
  maxConcurrent: 5,
  minTime: Math.max(10, Math.floor(1000 / Math.max(1, env.solana.rateLimit)))
})

export function makeConnection(kind: 'http' | 'ws' = 'http') {
  const httpEndpoint = env.solana.rpcUrl
  if (!httpEndpoint || !httpEndpoint.startsWith('http')) {
    throw new TypeError('SOLANA_RPC must start with http:// or https://')
  }

  // Dùng ConnectionConfig typed để tránh "any"
  const config: ConnectionConfig = { commitment: env.solana.commitment as Commitment }

  if (kind === 'ws') {
    // ✅ Chỉ override wsEndpoint nếu hợp lệ; vẫn truyền HTTP vào constructor
    if (env.solana.wsUrl) {
      if (!env.solana.wsUrl.startsWith('ws')) {
        logger.warn('SOLANA_WEBSOCKET is set but does not start with ws:// or wss://. Ignoring it.')
      } else {
        config.wsEndpoint = env.solana.wsUrl
      }
    } else {
      logger.warn('SOLANA_WEBSOCKET not set. Using derived ws endpoint from SOLANA_RPC.')
    }

    // ❗️ĐIỂM SỬA CHÍNH: luôn truyền httpEndpoint vào đây
    return new Connection(httpEndpoint, config)
  }

  // HTTP branch: dùng connection trong pool (ưu tiên failover + reuse)
  const rpcData = rpcPool.getHealthyEndpoint()
  if (!rpcData) throw new Error('No healthy RPC endpoints available')

  logger.warn('makeConnection(http) is deprecated, use rateLimitedRPC instead.')
  return rpcData.connection
}

// Rate-limited RPC methods with automatic failover via RPC pool
export const rateLimitedRPC = {
  getParsedTransaction: (signature: string, options?: any) =>
    globalRateLimiter.schedule(() =>
      rpcPool.executeWithFailover(
        (conn) =>
          conn.getParsedTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: env.solana.commitment,
            ...options
          }),
        'getParsedTransaction'
      )
    ),

  getTransaction: (signature: string, options?: any) =>
    globalRateLimiter.schedule(() =>
      rpcPool.executeWithFailover(
        (conn) =>
          conn.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
            commitment: env.solana.commitment,
            ...options
          }),
        'getTransaction'
      )
    ),

  getAccountInfo: (pubkey: PublicKey, options?: any) =>
    globalRateLimiter.schedule(() =>
      rpcPool.executeWithFailover(
        (conn) =>
          conn.getAccountInfo(pubkey, {
            commitment: env.solana.commitment,
            ...options
          }),
        'getAccountInfo'
      )
    ),

  getSlot: (options?: any) =>
    globalRateLimiter.schedule(() =>
      rpcPool.executeWithFailover(
        (conn) =>
          conn.getSlot({
            commitment: env.solana.commitment,
            ...options
          }),
        'getSlot'
      )
    ),

  // Có thể dùng rateLimitedRPC thay vì Connection trực tiếp trong backfill
  getSignaturesForAddress: (addr: PublicKey, cfg: { limit?: number; before?: string; until?: string } = {}) =>
    globalRateLimiter.schedule(() =>
      rpcPool.executeWithFailover(
        (conn) => conn.getSignaturesForAddress(addr, { limit: 1000, ...cfg }),
        'getSignaturesForAddress'
      )
    ),

  // Stats helpers
  getRpcPoolStats: () => rpcPool.getStats(),
  resetAllCircuitBreakers: () => rpcPool.resetAllCircuitBreakers(),
  getRateLimiterStats: async () => {
    const [queued, running] = await Promise.all([
      Promise.resolve(globalRateLimiter.queued()),
      Promise.resolve(globalRateLimiter.running())
    ])

    return {
      queued: typeof queued === 'number' ? queued : 0,
      running: typeof running === 'number' ? running : 0,
      reservoir: (globalRateLimiter as any).reservoir || 0
    }
  }
}
