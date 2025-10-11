/**
 * Queue job types for Panda Monopoly Indexer
 *
 * Defines the data structures for different types of background processing jobs.
 * Each job type corresponds to a specific blockchain account type that needs indexing.
 *
 * Architecture:
 * - RealtimeJob: Processes live blockchain events as they occur
 * - BackfillJob: Processes historical blockchain data during sync
 * - WriterJob: Persists processed data to the database
 * - MonopolyRecord: Union type for all supported blockchain account types
 *
 * @author Senior Engineer - Following Google Code Standards
 */

import type {
  NewGameState,
  NewPlayerState,
  NewPropertyState,
  NewTradeState,
  NewAuctionState,
  NewPlatformConfig
} from '#infra/db/schema'

/**
 * Real-time processing job for live blockchain event streaming
 */
export interface RealtimeJob {
  readonly signature: string
}

/**
 * Backfill processing job for historical data synchronization
 */
export interface BackfillJob {
  readonly signature: string
}

/**
 * Discriminated union for all supported blockchain account types
 * Each variant maps to exactly one database table and Rust struct
 */
export type MonopolyRecord =
  | { readonly kind: 'platformConfig'; readonly data: NewPlatformConfig }
  | { readonly kind: 'gameState'; readonly data: NewGameState }
  | { readonly kind: 'playerState'; readonly data: NewPlayerState }
  | { readonly kind: 'propertyState'; readonly data: NewPropertyState }
  | { readonly kind: 'tradeState'; readonly data: NewTradeState }
  | { readonly kind: 'auctionState'; readonly data: NewAuctionState }

/**
 * Database writer job containing a processed blockchain record
 * Used by the writer worker to persist data to PostgreSQL
 */
export interface WriterJob {
  readonly record: MonopolyRecord
}
