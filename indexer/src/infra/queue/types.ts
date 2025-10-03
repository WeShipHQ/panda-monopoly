import type { NewGame, NewPlayer, NewProperty, NewTrade } from '#infra/db/schema'

export type RealtimeJob = { signature: string }
export type BackfillJob = { signature: string }

export type MonopolyRecord =
  | { kind: 'game'; data: NewGame }
  | { kind: 'player'; data: NewPlayer }
  | { kind: 'property'; data: NewProperty }
  | { kind: 'trade'; data: NewTrade }

export type WriterJob = { record: MonopolyRecord }
