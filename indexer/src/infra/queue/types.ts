export type RealtimeJob = { signature: string }
export type BackfillJob = { signature: string }
export type WriterJob = { event: import('#domain/types').SwapEvent }
