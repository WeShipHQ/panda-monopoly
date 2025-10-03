import { env } from '#config'
import { Connection, PublicKey } from '@solana/web3.js'
import Bottleneck from 'bottleneck'

export const programId = new PublicKey(env.solana.programId)

// Rate limiter: max 50 requests per second (adjust based on your RPC limits)
const rateLimiter = new Bottleneck({
  minTime: 1000 / env.solana.rateLimit, // milliseconds between requests
  maxConcurrent: 5 // max concurrent requests
})

// Shared connections (singleton pattern)
let httpConnection: Connection | null = null
let wsConnection: Connection | null = null

export function makeConnection(kind: 'http' | 'ws' = 'http') {
  if (kind === 'http') {
    if (!httpConnection) {
      httpConnection = new Connection(env.solana.rpcUrl, {
        commitment: env.solana.commitment as any
      })
    }
    return httpConnection
  } else {
    if (!wsConnection) {
      wsConnection = new Connection(env.solana.rpcUrl, {
        commitment: env.solana.commitment as any,
        wsEndpoint: env.solana.wsUrl
      })
    }
    return wsConnection
  }
}

// Rate-limited RPC methods
export const rateLimitedRPC = {
  getParsedTransaction: (connection: Connection, signature: string, options?: any) => {
    return rateLimiter.schedule(() => connection.getParsedTransaction(signature, options))
  },

  getTransaction: (connection: Connection, signature: string, options?: any) => {
    return rateLimiter.schedule(() => connection.getTransaction(signature, options))
  },

  getAccountInfo: (connection: Connection, pubkey: PublicKey, options?: any) => {
    return rateLimiter.schedule(() => connection.getAccountInfo(pubkey, options))
  }
}
