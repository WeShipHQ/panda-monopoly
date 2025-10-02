// concrete Jupiter parser (example/stub)
import type { ParserPort } from '#domain/parser.port'
import type { SwapEvent } from '#domain/types'
import type { ParsedTransactionWithMeta } from '@solana/web3.js'

export class JupiterSwapParser implements ParserPort {
  parse(tx: ParsedTransactionWithMeta): SwapEvent | null {
    // TODO: replace with robust Jupiter decoding (read inner instructions & logs)
    const sig = tx.transaction.signatures[0]
    const slot = tx.slot as unknown as number // slot present if fetched via getTransaction
    const time = tx.blockTime ? new Date(tx.blockTime * 1000) : new Date()

    // naive guard: not a swap => return null
    const isSwap = tx.meta?.logMessages?.some((l) => l.includes('swap')) ?? false
    if (!isSwap) return null

    const signer =
      tx.transaction.message.accountKeys[0].pubkey.toBase58?.() ?? String(tx.transaction.message.accountKeys[0])

    return {
      signature: sig,
      userPubkey: signer,
      tokenIn: 'UNKNOWN_IN',
      tokenOut: 'UNKNOWN_OUT',
      amountIn: 0n,
      amountOut: 0n,
      slot,
      blockTime: time,
      route: 'jupiter',
      raw: tx
    }
  }
}
