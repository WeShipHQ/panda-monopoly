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
import { logger } from '#utils/logger'

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

// ==================== UTILITY FUNCTIONS ====================

/**
 * Safely parse JSON with fallback value
 */
function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T
  } catch (error) {
    logger.debug(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to parse JSON, using fallback'
    )
    return fallback
  }
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
    logger.debug({ pubkey }, 'Game state missing config_id - platform config relationship not established')
  }

  // Log missing critical fields
  const missingFields: string[] = []
  if (!kv.game_id) missingFields.push('game_id')
  if (!kv.config_id) missingFields.push('config_id')
  if (!kv.authority) missingFields.push('authority')
  if (!kv.max_players) missingFields.push('max_players')
  if (!kv.current_players) missingFields.push('current_players')
  if (!kv.current_turn) missingFields.push('current_turn')
  if (!kv.bump) missingFields.push('bump')
  if (!kv.bank_balance) missingFields.push('bank_balance')
  if (!kv.free_parking_pool) missingFields.push('free_parking_pool')
  if (!kv.houses_remaining) missingFields.push('houses_remaining')
  if (!kv.hotels_remaining) missingFields.push('hotels_remaining')
  if (!kv.next_trade_id) missingFields.push('next_trade_id')
  if (!kv.active_trades) missingFields.push('active_trades')
  if (!kv.players) missingFields.push('players')

  if (missingFields.length > 0) {
    logger.debug({ missingFields, pubkey }, '⚠️ Missing GameState fields from blockchain logs')
  }

  return {
    pubkey,
    gameId: kv.game_id !== undefined ? Number(kv.game_id) : -1, // gameId 0 is valid, -1 = needs enrichment
    configId: kv.config_id ?? 'UNKNOWN', // UNKNOWN = needs blockchain enrichment
    authority: kv.authority ?? 'UNKNOWN', // UNKNOWN = needs blockchain enrichment
    bump: kv.bump ? Number(kv.bump) : -1, // -1 = needs blockchain enrichment
    maxPlayers: kv.max_players ? Number(kv.max_players) : -1, // -1 = needs blockchain enrichment
    currentPlayers: kv.current_players ? Number(kv.current_players) : -1, // -1 = needs blockchain enrichment
    currentTurn: kv.current_turn ? Number(kv.current_turn) : -1, // -1 = needs blockchain enrichment
    nextTradeId: kv.next_trade_id ? Number(kv.next_trade_id) : -1, // -1 = needs blockchain enrichment
    activeTrades: kv.active_trades ? safeJsonParse(kv.active_trades, []) : [], // Empty array = needs blockchain enrichment
    players: kv.players ? safeJsonParse(kv.players, []) : [], // Empty array = needs blockchain enrichment
    createdAt: kv.created_at ? Number(kv.created_at) : blockTimeMs,
    gameStatus: (kv.game_status as GameStatus) ?? ('WaitingForPlayers' as GameStatus), // Default status = needs blockchain enrichment
    bankBalance: kv.bank_balance ? Number(kv.bank_balance) : -1, // -1 = needs blockchain enrichment
    freeParkingPool: kv.free_parking_pool ? Number(kv.free_parking_pool) : -1, // -1 = needs blockchain enrichment
    housesRemaining: kv.houses_remaining ? Number(kv.houses_remaining) : -1, // -1 = needs blockchain enrichment
    hotelsRemaining: kv.hotels_remaining ? Number(kv.hotels_remaining) : -1, // -1 = needs blockchain enrichment
    timeLimit: kv.time_limit ? Number(kv.time_limit) : null,
    turnStartedAt: kv.turn_started_at ? Number(kv.turn_started_at) : slot,
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
    wallet: kv.wallet ?? 'UNKNOWN', // UNKNOWN = needs blockchain enrichment
    game: kv.game ?? 'UNKNOWN', // UNKNOWN = needs blockchain enrichment
    cashBalance: kv.cash_balance ? Number(kv.cash_balance) : -1, // -1 = needs blockchain enrichment
    netWorth: kv.net_worth ? Number(kv.net_worth) : -1, // -1 = needs blockchain enrichment
    position: kv.position ? Number(kv.position) : -1, // -1 = needs blockchain enrichment
    inJail: kv.in_jail === 'true',
    jailTurns: Number(kv.jail_turns ?? 0),
    doublesCount: Number(kv.doubles_count ?? 0),
    isBankrupt: kv.is_bankrupt === 'true',
    propertiesOwned: kv.properties_owned ? safeJsonParse(kv.properties_owned, []) : [],
    getOutOfJailCards: Number(kv.get_out_of_jail_cards ?? 0),
    hasRolledDice: kv.has_rolled_dice === 'true',
    lastDiceRoll: kv.last_dice_roll ? safeJsonParse(kv.last_dice_roll, [0, 0]) : [0, 0],
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
    const pubkey = sanitizePubkey(kv.pubkey)
    if (pubkey === 'UNKNOWN') {
      console.error('Invalid platform config pubkey - skipping record', kv.pubkey)
      return null
    }

    const parsedId = sanitizePubkey(kv.id)
    const id = parsedId !== 'UNKNOWN' ? parsedId : pubkey

    const parsedAuthority = sanitizePubkey(kv.authority)
    const authority = parsedAuthority !== 'UNKNOWN' ? parsedAuthority : id

    const parsedFeeVault = sanitizePubkey(kv.fee_vault)
    const feeVault = parsedFeeVault !== 'UNKNOWN' ? parsedFeeVault : authority !== 'UNKNOWN' ? authority : id

    return {
      // Primary key
      pubkey,

      // Core platform config fields
      id,
      feeBasisPoints: parseInt(kv.fee_basis_points) || 500, // Default 5%
      authority,
      feeVault,
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
