/**
 * Log Parsing Utilities
 *
 * Contains specialized functions for parsing blockchain transaction logs
 * and converting them into typed database record objects.
 *
 * Each parser function handles a specific entity type (Game, Player, Property, Trade)
 * with proper type safety, validation, and default value handling.
 *
 * @author Senior Engineer - Following Google Code Standards
 */

import type { ParsedTransactionWithMeta } from '@solana/web3.js'
import type {
  NewPlatformConfig,
  NewGameState,
  NewPlayerState,
  NewPropertyState,
  NewTradeState,
  GameStatus,
  TradeStatus,
  TradeType
} from '#infra/db/schema'
import {
  getPropertyPrice,
  getPropertyColorGroup,
  getPropertyType,
  getBaseRent,
  getMonopolyRent,
  getRentWithHouses,
  getHouseCost
} from './property.utils'

// ==================== TRANSACTION UTILITY FUNCTIONS ====================

/**
 * Extract signature from transaction
 */
export function getTransactionSignature(tx: ParsedTransactionWithMeta): string {
  return tx.transaction.signatures[0]
}

/**
 * Extract slot from transaction with fallback
 */
export function getTransactionSlot(tx: ParsedTransactionWithMeta): number {
  return (tx as any).slot ?? 0
}

/**
 * Extract block time in seconds with fallback to current time
 */
export function getTransactionBlockTimeSec(tx: ParsedTransactionWithMeta): number {
  return tx.blockTime ?? Math.floor(Date.now() / 1000)
}

/**
 * Extract block time in milliseconds
 */
export function getTransactionBlockTimeMs(tx: ParsedTransactionWithMeta): number {
  return getTransactionBlockTimeSec(tx) * 1000
}

// ==================== ACCOUNT KEY UTILITIES ====================

/**
 * Extract PDA pubkey by account index from transaction
 *
 * @param tx - Parsed transaction metadata
 * @param idx - Account index to extract
 * @returns Pubkey string or undefined if not found
 */
export function extractPdaByIndex(tx: ParsedTransactionWithMeta, idx: number): string | undefined {
  const accountKey = tx.transaction.message.accountKeys?.[idx]
  if (!accountKey) return undefined

  // Handle different pubkey formats (v0 vs legacy transactions)
  const pubkeyString = (accountKey as any)?.pubkey?.toBase58?.()
  return pubkeyString ?? String(accountKey)
}

// ==================== LOG PARSING UTILITIES ====================

/**
 * Parse key-value pairs from blockchain log line
 *
 * Expected format: "prefix key1=value1 key2=value2 key3=value3"
 *
 * @param logLine - Raw log line from blockchain
 * @returns Object with parsed key-value pairs
 */
export function parseKeyValueFromLog(logLine: string): Record<string, string> {
  const keyValueMap: Record<string, string> = {}

  // Skip the first part (log prefix) and parse remaining key=value pairs
  const parts = logLine.split(/\s+/).slice(1)

  for (const part of parts) {
    const match = part.match(/([^=]+)=(.*)/)
    if (match) {
      keyValueMap[match[1]] = match[2]
    }
  }

  return keyValueMap
}

// ==================== ENTITY BUILDERS FROM LOGS ====================

/**
 * Build Game record from transaction log data
 *
 * @param tx - Transaction metadata
 * @param kv - Parsed key-value data from log
 * @returns NewGame object for database insertion
 */
export function buildGameStateFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewGameState {
  const pubkey = kv.pubkey ?? extractPdaByIndex(tx, 0) ?? 'UNKNOWN'
  const blockTimeMs = getTransactionBlockTimeMs(tx)
  const slot = getTransactionSlot(tx)
  const signature = getTransactionSignature(tx)

  // Validate platform config relationship
  if (!kv.config_id) {
    console.warn('Game state missing config_id - platform config relationship not established:', pubkey)
  }

  return {
    pubkey,
    gameId: Number(kv.game_id ?? 0),
    configId: kv.config_id ?? 'UNKNOWN',
    authority: kv.authority ?? 'UNKNOWN',
    bump: Number(kv.bump ?? 0),
    maxPlayers: Number(kv.max_players ?? 4),
    currentPlayers: Number(kv.current_players ?? 0),
    currentTurn: Number(kv.current_turn ?? 0),
    nextTradeId: Number(kv.next_trade_id ?? 0),
    players: kv.players ? JSON.parse(kv.players) : [],
    createdAt: kv.created_at ? Number(kv.created_at) : blockTimeMs,
    gameStatus: (kv.game_status as GameStatus) ?? 'WaitingForPlayers',
    bankBalance: Number(kv.bank_balance ?? 0),
    freeParkingPool: Number(kv.free_parking_pool ?? 0),
    housesRemaining: Number(kv.houses_remaining ?? 32),
    hotelsRemaining: Number(kv.hotels_remaining ?? 12),
    timeLimit: kv.time_limit ? Number(kv.time_limit) : null,
    turnStartedAt: Number(kv.turn_started_at ?? slot),
    winner: kv.winner ?? null,
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: slot,
    updatedSlot: slot,
    lastSignature: signature
  }
}

/**
 * Build PlayerState record from transaction log data
 *
 * @param tx - Transaction metadata
 * @param kv - Parsed key-value data from log
 * @returns NewPlayerState object for database insertion
 */
export function buildPlayerStateFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewPlayerState {
  const pubkey = kv.pubkey ?? extractPdaByIndex(tx, 1) ?? 'UNKNOWN'
  const slot = getTransactionSlot(tx)
  const signature = getTransactionSignature(tx)

  return {
    pubkey,
    wallet: kv.wallet ?? 'UNKNOWN',
    game: kv.game ?? 'UNKNOWN',
    cashBalance: Number(kv.cash_balance ?? 1500),
    netWorth: Number(kv.net_worth ?? 1500),
    position: Number(kv.position ?? 0),
    inJail: kv.in_jail === 'true',
    jailTurns: Number(kv.jail_turns ?? 0),
    doublesCount: Number(kv.doubles_count ?? 0),
    isBankrupt: kv.is_bankrupt === 'true',
    propertiesOwned: kv.properties_owned ? JSON.parse(kv.properties_owned) : [],
    getOutOfJailCards: Number(kv.get_out_of_jail_cards ?? 0),
    hasRolledDice: kv.has_rolled_dice === 'true',
    lastDiceRoll: kv.last_dice_roll ? JSON.parse(kv.last_dice_roll) : [0, 0],
    lastRentCollected: Number(kv.last_rent_collected ?? slot),
    festivalBoostTurns: Number(kv.festival_boost_turns ?? 0),
    cardDrawnAt: kv.card_drawn_at ? Number(kv.card_drawn_at) : null,
    needsPropertyAction: kv.needs_property_action === 'true',
    pendingPropertyPosition: kv.pending_property_position ? Number(kv.pending_property_position) : null,
    needsChanceCard: kv.needs_chance_card === 'true',
    needsCommunityChestCard: kv.needs_community_chest_card === 'true',
    needsBankruptcyCheck: kv.needs_bankruptcy_check === 'true',
    needsSpecialSpaceAction: kv.needs_special_space_action === 'true',
    pendingSpecialSpacePosition: kv.pending_special_space_position ? Number(kv.pending_special_space_position) : null,
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: slot,
    updatedSlot: slot,
    lastSignature: signature
  }
}

/**
 * Build PropertyState record from transaction log data
 *
 * Uses intelligent defaults based on board position when blockchain data is missing.
 *
 * @param tx - Transaction metadata
 * @param kv - Parsed key-value data from log
 * @returns NewPropertyState object for database insertion
 */
export function buildPropertyStateFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewPropertyState {
  const pubkey = kv.pubkey ?? extractPdaByIndex(tx, 2) ?? 'UNKNOWN'
  const slot = getTransactionSlot(tx)
  const signature = getTransactionSignature(tx)
  const position = Number(kv.position ?? 0)

  // Parse rent with houses from blockchain or use position-based defaults
  const rentWithHousesRaw = kv.rent_with_houses
  const rentWithHouses = rentWithHousesRaw ? JSON.parse(rentWithHousesRaw) : getRentWithHouses(position)

  return {
    pubkey,
    game: kv.game ?? 'UNKNOWN',
    position,
    init: kv.init === 'true',
    owner: kv.owner ?? null,
    price: Number(kv.price ?? getPropertyPrice(position)),
    colorGroup: (kv.color_group as any) ?? getPropertyColorGroup(position),
    propertyType: (kv.property_type as any) ?? getPropertyType(position),
    houses: Number(kv.houses ?? 0),
    hasHotel: kv.has_hotel === 'true',
    isMortgaged: kv.is_mortgaged === 'true',
    rentBase: Number(kv.rent_base ?? getBaseRent(position)),
    rentWithColorGroup: Number(kv.rent_with_color_group ?? getMonopolyRent(position)),
    rentWithHouses,
    rentWithHotel: Number(kv.rent_with_hotel ?? rentWithHouses[3] ?? 0),
    houseCost: Number(kv.house_cost ?? getHouseCost(position)),
    mortgageValue: Number(kv.mortgage_value ?? Math.floor(getPropertyPrice(position) / 2)),
    lastRentPaid: Number(kv.last_rent_paid ?? slot),
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: slot,
    updatedSlot: slot,
    lastSignature: signature
  }
}

/**
 * Build TradeState record from transaction log data
 *
 * @param tx - Transaction metadata
 * @param kv - Parsed key-value data from log
 * @returns NewTradeState object for database insertion
 */
export function buildTradeStateFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewTradeState {
  const pubkey = kv.pubkey ?? extractPdaByIndex(tx, 3) ?? 'UNKNOWN'
  const slot = getTransactionSlot(tx)
  const blockTimeSec = getTransactionBlockTimeSec(tx)
  const signature = getTransactionSignature(tx)

  return {
    pubkey,
    game: kv.game ?? 'UNKNOWN',
    proposer: kv.proposer ?? 'UNKNOWN',
    receiver: kv.receiver ?? 'UNKNOWN',
    tradeType: (kv.trade_type as TradeType) ?? 'MoneyOnly',
    proposerMoney: Number(kv.proposer_money ?? 0),
    receiverMoney: Number(kv.receiver_money ?? 0),
    proposerProperty: kv.proposer_property ? Number(kv.proposer_property) : null,
    receiverProperty: kv.receiver_property ? Number(kv.receiver_property) : null,
    status: (kv.status as TradeStatus) ?? 'Pending',
    createdAt: Number(kv.created_at ?? slot),
    expiresAt: Number(kv.expires_at ?? blockTimeSec + 3600),
    bump: Number(kv.bump ?? 0),
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: slot,
    updatedSlot: slot,
    lastSignature: signature
  }
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate that required fields are present in log data
 *
 * @param kv - Parsed key-value data
 * @param requiredFields - Array of required field names
 * @returns Array of missing field names (empty if all present)
 */
export function validateRequiredLogFields(kv: Record<string, string>, requiredFields: string[]): string[] {
  return requiredFields.filter((field) => !kv[field])
}

/**
 * Sanitize and validate pubkey from log data
 *
 * @param rawPubkey - Raw pubkey string from log
 * @returns Validated pubkey or 'UNKNOWN' if invalid
 */
export function sanitizePubkey(rawPubkey: string | undefined): string {
  if (!rawPubkey || rawPubkey.length !== 44) {
    return 'UNKNOWN'
  }

  // Basic base58 validation - should contain only valid base58 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
  return base58Regex.test(rawPubkey) ? rawPubkey : 'UNKNOWN'
}

// ==================== PLATFORM CONFIG BUILDER ====================

/**
 * Build platform config record from parsed log data
 *
 * Maps blockchain log key-value pairs to NewPlatformConfig database record.
 * Handles both platform creation and updates with proper validation.
 *
 * @param tx - Transaction metadata for blockchain fields
 * @param kv - Parsed key-value data from log
 * @returns Validated NewPlatformConfig record or null if parsing fails
 */
export function buildPlatformConfigFromLog(
  tx: ParsedTransactionWithMeta,
  kv: Record<string, string>
): NewPlatformConfig | null {
  try {
    // Validate required fields for platform config
    const requiredFields = ['pubkey', 'id', 'authority', 'fee_vault', 'fee_basis_points', 'bump']
    const missingFields = validateRequiredLogFields(kv, requiredFields)

    if (missingFields.length > 0) {
      console.error('Missing required platform config fields:', missingFields)
      return null
    }

    const blockTimeMs = getTransactionBlockTimeMs(tx)

    return {
      // Primary key
      pubkey: sanitizePubkey(kv.pubkey),

      // Core platform config fields
      id: sanitizePubkey(kv.id),
      feeBasisPoints: parseInt(kv.fee_basis_points) || 500, // Default 5%
      authority: sanitizePubkey(kv.authority),
      feeVault: sanitizePubkey(kv.fee_vault),
      totalGamesCreated: parseInt(kv.total_games_created) || 0,
      nextGameId: parseInt(kv.next_game_id) || 0,
      bump: parseInt(kv.bump) || 0,

      // Blockchain metadata
      accountCreatedAt: new Date(blockTimeMs),
      accountUpdatedAt: new Date(blockTimeMs),
      createdSlot: getTransactionSlot(tx),
      updatedSlot: getTransactionSlot(tx),
      lastSignature: getTransactionSignature(tx)
    }
  } catch (error) {
    console.error('Failed to build platform config from log:', error)
    return null
  }
}
