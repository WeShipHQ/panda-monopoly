// định nghĩa interface chung mà mọi adapter (pg/drizzle/…) phải implement.
import { NewGame, NewPlayer, NewProperty, NewTrade } from './schema'

export interface DatabasePort {
  init(): Promise<void>

  // Monopoly core upserts (idempotent by pubkey)
  upsertGame(row: NewGame): Promise<void>
  upsertPlayer(row: NewPlayer): Promise<void>
  upsertProperty(row: NewProperty): Promise<void>
  upsertTrade(row: NewTrade): Promise<void>

  // Checkpoints (used by checkpoint.ts)
  getCheckpoint(id: string): Promise<{ last_slot: number | null; last_signature: string | null } | null>
  setCheckpoint(id: string, data: { last_slot?: number; last_signature?: string }): Promise<void>

  // Convenience reads (optional)
  getGame(pubkey: string): Promise<any | null>
  getPlayer(pubkey: string): Promise<any | null>
  getProperty(pubkey: string): Promise<any | null>
  getTrade(pubkey: string): Promise<any | null>
}

export interface DatabasePort {
  init(): Promise<void>

  upsertGame(row: NewGame): Promise<void>
  upsertPlayer(row: NewPlayer): Promise<void>
  upsertProperty(row: NewProperty): Promise<void>
  upsertTrade(row: NewTrade): Promise<void>

  getGame(pubkey: string): Promise<any | null>
  getPlayer(pubkey: string): Promise<any | null>
  getProperty(pubkey: string): Promise<any | null>
  getTrade(pubkey: string): Promise<any | null>
}
