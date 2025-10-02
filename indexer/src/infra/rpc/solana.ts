import { env } from '#config'
import { Connection, PublicKey } from '@solana/web3.js'

export const programId = new PublicKey(env.solana.programId)

export function makeConnection(kind: 'http' | 'ws' = 'http') {
  const endpoint = kind === 'http' ? env.solana.rpcUrl : (env.solana.wsUrl ?? env.solana.rpcUrl)
  return new Connection(endpoint, {
    commitment: 'confirmed',
    wsEndpoint: env.solana.wsUrl
  })
}
