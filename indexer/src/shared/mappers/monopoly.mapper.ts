import type { ParsedTransactionWithMeta } from '@solana/web3.js'
import type { MonopolyRecord } from '#infra/queue/types'
import type { GameStatus } from '#infra/db/schema'
import {
  parseKeyValueFromLog,
  buildPlatformConfigFromLog,
  buildGameStateFromLog,
  buildPlayerStateFromLog,
  buildPropertyStateFromLog,
  buildTradeStateFromLog,
  getTransactionSignature,
  getTransactionSlot,
  getTransactionBlockTimeMs
} from './log-parsers'
import { getPropertySpace, isPropertySpace, MONOPOLY_LOGS } from '#shared/config/board.config'

// ==================== MAIN MAPPING FUNCTION ====================

/**
 * Map parsed blockchain transaction to array of monopoly database records
 *
 * This function processes transaction logs and converts them into typed
 * database records based on the detected monopoly events.
 *
 * @param tx - Parsed transaction with metadata
 * @returns Array of monopoly records for queue processing
 */
export function mapTxToMonopolyRecords(tx: ParsedTransactionWithMeta): MonopolyRecord[] {
  const records: MonopolyRecord[] = []
  const logs = tx.meta?.logMessages ?? []

  // Early exit if no logs
  if (logs.length === 0) {
    return records
  }

  // Debug logging for property-related transactions
  if (isPropertyTransaction(logs)) {
    console.log('🔍 PROPERTY TRANSACTION:', getTransactionSignature(tx))
    console.log('🔍 LOG MESSAGES:', logs.slice(0, 10)) // First 10 logs only
  }

  // Process each log message for monopoly events
  for (const logMessage of logs) {
    const processedRecords = processLogMessage(tx, logMessage)
    records.push(...processedRecords)
  }

  // Process instruction-based events (for compatibility with existing logs)
  const instructionRecords = processInstructionLogs(tx, logs)
  records.push(...instructionRecords)

  return records
}

// ==================== LOG MESSAGE PROCESSING ====================

/**
 * Process individual log message and extract monopoly records
 *
 * @param tx - Transaction metadata
 * @param logMessage - Single log message to process
 * @returns Array of monopoly records extracted from this log
 */
function processLogMessage(tx: ParsedTransactionWithMeta, logMessage: string): MonopolyRecord[] {
  const records: MonopolyRecord[] = []

  // Only debug platform and config related logs
  if (
    logMessage.includes('Platform') ||
    logMessage.includes('platform') ||
    logMessage.includes('config') ||
    logMessage.includes('Config')
  ) {
    console.log('🔍 DEBUG LOG FORMAT:', logMessage.substring(0, 200))
  }

  // Process key-value formatted logs (new format)
  if (logMessage.includes('=')) {
    // Determine log type and parse accordingly
    if (logMessage.startsWith(MONOPOLY_LOGS.PLATFORM_CREATE) || logMessage.startsWith(MONOPOLY_LOGS.PLATFORM_UPDATE)) {
      console.log('🏗️ Platform config log detected:', logMessage.substring(0, 100))
      const platformRecord = parsePlatformConfigLog(tx, logMessage)
      if (platformRecord) {
        records.push({ kind: 'platformConfig', data: platformRecord })
        console.log('🏗️ Platform config parsed successfully:', platformRecord.pubkey)
      } else {
        console.log('🏗️ Platform config parsing failed')
      }
    } else if (logMessage.startsWith(MONOPOLY_LOGS.GAME_CREATE) || logMessage.startsWith(MONOPOLY_LOGS.GAME_UPDATE)) {
      const gameStateRecord = parseGameStateLog(tx, logMessage)
      if (gameStateRecord) {
        records.push({ kind: 'gameState', data: gameStateRecord })
      }
    } else if (logMessage.startsWith(MONOPOLY_LOGS.PLAYER_UPDATE)) {
      console.log('👤 Player log detected:', logMessage.substring(0, 100))
      const playerRecord = parsePlayerLog(tx, logMessage)
      if (playerRecord) {
        records.push({ kind: 'playerState', data: playerRecord })
        console.log('👤 Player parsed successfully:', playerRecord.pubkey)
      } else {
        console.log('👤 Player parsing failed')
      }
    } else if (logMessage.startsWith(MONOPOLY_LOGS.PROPERTY_UPDATE)) {
      const propertyRecord = parsePropertyLog(tx, logMessage)
      if (propertyRecord) {
        records.push({ kind: 'propertyState', data: propertyRecord })
      }
    } else if (logMessage.startsWith(MONOPOLY_LOGS.TRADE_OPEN) || logMessage.startsWith(MONOPOLY_LOGS.TRADE_UPDATE)) {
      const tradeRecord = parseTradeLog(tx, logMessage)
      if (tradeRecord) {
        records.push({ kind: 'tradeState', data: tradeRecord })
      }
    }
  }

  return records
}

/**
 * Process instruction-based logs for backward compatibility
 *
 * @param tx - Transaction metadata
 * @param logs - All log messages from transaction
 * @returns Array of monopoly records from instruction parsing
 */
function processInstructionLogs(tx: ParsedTransactionWithMeta, logs: string[]): MonopolyRecord[] {
  const records: MonopolyRecord[] = []

  for (let i = 0; i < logs.length; i++) {
    const logMessage = logs[i]

    // Debug all instruction types
    if (logMessage.includes('Instruction:')) {
      console.log('🔍 INSTRUCTION DETECTED:', logMessage)

      // Check specifically for platform config instructions
      if (logMessage.includes('CreatePlatformConfig') || logMessage.includes('create_platform_config')) {
        console.log('🏗️ PLATFORM CONFIG INSTRUCTION FOUND!', logMessage)
      }
    }

    // Parse InitializePlatform instruction - try various patterns
    if (
      logMessage.includes('InitializePlatform') ||
      logMessage.includes('CreatePlatformConfig') ||
      logMessage.includes('create_platform_config') ||
      logMessage.includes('Platform') ||
      logMessage.includes('platform')
    ) {
      console.log('🏗️ Platform instruction detected:', logMessage.substring(0, 100))
      const platformRecord = parseInitializePlatformInstruction(tx, logs, i)
      if (platformRecord) {
        records.push({ kind: 'platformConfig', data: platformRecord })
        console.log('🏗️ Platform config created via instruction:', platformRecord.pubkey)
      } else {
        console.log('🏗️ Platform config instruction parsing failed')
      }
    }

    // Parse InitializeGame instruction
    else if (logMessage.includes('InitializeGame')) {
      const gameStateRecord = parseInitializeGameInstruction(tx, logs, i)
      if (gameStateRecord) {
        records.push({ kind: 'gameState', data: gameStateRecord })
      }
    }

    // Parse JoinGame instruction
    else if (logMessage.includes('JoinGame') || logMessage.includes('Join game:')) {
      console.log('👤 JoinGame instruction detected:', logMessage.substring(0, 80))
      // Try to parse using player instruction parser since JoinGame creates player
      const playerRecord = parsePlayerInstruction(tx, logs, i)
      if (playerRecord) {
        records.push({ kind: 'playerState', data: playerRecord })
        console.log('👤 Player created via JoinGame:', playerRecord.pubkey)
      } else {
        console.log('👤 JoinGame parsing failed')
      }
    }

    // Parse Property initialization
    else if (logMessage.includes('Init property') || logMessage.includes('PropertyInit')) {
      const propertyRecord = parseInitPropertyInstruction(tx, logs, i)
      if (propertyRecord) {
        records.push({ kind: 'propertyState', data: propertyRecord })
      }
    }

    // Parse Player creation/update - only for specific patterns to avoid duplicates
    else if (logMessage.includes('Player') && (logMessage.includes('joined') || logMessage.includes('delegated'))) {
      const playerRecord = parsePlayerInstruction(tx, logs, i)
      if (playerRecord) {
        records.push({ kind: 'playerState', data: playerRecord })
      }
    }
  }

  return records
}

// ==================== SPECIFIC LOG PARSERS ====================

/**
 * Parse platform config-related log message
 */
function parsePlatformConfigLog(tx: ParsedTransactionWithMeta, logMessage: string) {
  try {
    const keyValueMap = parseKeyValueFromLog(logMessage)
    return buildPlatformConfigFromLog(tx, keyValueMap)
  } catch (error) {
    console.error('Failed to parse platform config log:', error, logMessage)
    return null
  }
}

/**
 * Parse game state-related log message
 */
function parseGameStateLog(tx: ParsedTransactionWithMeta, logMessage: string) {
  try {
    const keyValueMap = parseKeyValueFromLog(logMessage)
    return buildGameStateFromLog(tx, keyValueMap)
  } catch (error) {
    console.error('Failed to parse game state log:', error, logMessage)
    return null
  }
}

/**
 * Parse player-related log message
 */
function parsePlayerLog(tx: ParsedTransactionWithMeta, logMessage: string) {
  try {
    const keyValueMap = parseKeyValueFromLog(logMessage)
    return buildPlayerStateFromLog(tx, keyValueMap)
  } catch (error) {
    console.error('Failed to parse player log:', error, logMessage)
    return null
  }
}

/**
 * Parse property-related log message
 */
function parsePropertyLog(tx: ParsedTransactionWithMeta, logMessage: string) {
  try {
    const keyValueMap = parseKeyValueFromLog(logMessage)
    return buildPropertyStateFromLog(tx, keyValueMap)
  } catch (error) {
    console.error('Failed to parse property log:', error, logMessage)
    return null
  }
}

/**
 * Parse trade-related log message
 */
function parseTradeLog(tx: ParsedTransactionWithMeta, logMessage: string) {
  try {
    const keyValueMap = parseKeyValueFromLog(logMessage)
    return buildTradeStateFromLog(tx, keyValueMap)
  } catch (error) {
    console.error('Failed to parse trade log:', error, logMessage)
    return null
  }
}

// ==================== INSTRUCTION-BASED PARSERS ====================

/**
 * Parse InitializePlatform instruction from multiple log lines
 */
function parseInitializePlatformInstruction(tx: ParsedTransactionWithMeta, logs: string[], startIndex: number) {
  let platformAccount = ''
  let authority = ''
  let feeVault = ''
  let feeBasisPoints = '500' // Default 5%

  // Extract platform account from transaction accounts
  const accounts = tx.transaction.message.accountKeys || []
  console.log('🏗️ Transaction accounts for platform:', accounts.map((acc) => acc.pubkey.toBase58()).slice(0, 6))

  // In CreatePlatformConfig: [admin, config, system_program]
  if (accounts.length >= 2) {
    authority = accounts[0]?.pubkey.toBase58() || ''
    platformAccount = accounts[1]?.pubkey.toBase58() || ''
    console.log('🏗️ Extracted from tx accounts - authority:', authority, 'platform:', platformAccount)
  }

  // Look for platform details in subsequent lines (backup)
  for (let j = startIndex + 1; j < Math.min(startIndex + 5, logs.length); j++) {
    const logLine = logs[j]

    const authMatch = logLine.match(/authority: ([A-Za-z0-9]+)/)
    if (authMatch && !authority) {
      authority = authMatch[1]
    }

    const vaultMatch = logLine.match(/fee_vault: ([A-Za-z0-9]+)/)
    if (vaultMatch) {
      feeVault = vaultMatch[1]
    }

    const feeMatch = logLine.match(/fee_basis_points: (\d+)/)
    if (feeMatch) {
      feeBasisPoints = feeMatch[1]
    }
  }

  if (!platformAccount || !authority) {
    console.log('🏗️ Missing required platform fields:', { platformAccount, authority })
    return null
  }

  const blockTimeMs = getTransactionBlockTimeMs(tx)

  return {
    pubkey: platformAccount,
    id: platformAccount, // Platform config ID same as pubkey
    feeBasisPoints: parseInt(feeBasisPoints),
    authority,
    feeVault: feeVault || authority, // Fallback to authority if no fee vault
    totalGamesCreated: 0,
    nextGameId: 0,
    bump: 255, // Default bump for platform config

    // Blockchain metadata
    accountCreatedAt: new Date(blockTimeMs),
    accountUpdatedAt: new Date(blockTimeMs),
    createdSlot: getTransactionSlot(tx),
    updatedSlot: getTransactionSlot(tx),
    lastSignature: getTransactionSignature(tx)
  }
}

/**
 * Parse InitializeGame instruction from multiple log lines
 */
function parseInitializeGameInstruction(tx: ParsedTransactionWithMeta, logs: string[], startIndex: number) {
  let gameAccount = ''
  let authority = ''
  let timestamp = ''
  let configId = ''

  // Extract config account from transaction accounts
  const accounts = tx.transaction.message.accountKeys || []

  // Look for game details in subsequent lines
  for (let j = startIndex + 1; j < Math.min(startIndex + 10, logs.length); j++) {
    const logLine = logs[j]

    const authMatch = logLine.match(/authority: ([A-Za-z0-9]+)/)
    if (authMatch) {
      authority = authMatch[1]
    }

    const accountMatch = logLine.match(/Game account: ([A-Za-z0-9]+)/)
    if (accountMatch) {
      gameAccount = accountMatch[1]
    }

    const timeMatch = logLine.match(/timestamp: (\d+)/)
    if (timeMatch) {
      timestamp = timeMatch[1]
    }
  }

  // Try to extract configId from transaction accounts
  if (accounts.length > 3) {
    // Typically: [game, player_state, authority, config, system_program, clock]
    configId = accounts[3]?.pubkey.toBase58() || 'ACCOUNT_NOT_FOUND'
  }

  if (!gameAccount || !authority) {
    return null
  }

  // Build game record with blockchain account fetching placeholder
  // GameId will be fetched and updated in post-processing step in the worker
  return {
    pubkey: gameAccount,
    gameId: -1, // Placeholder: Will be fetched from blockchain account
    configId: configId || 'UNKNOWN',
    authority,
    bump: 0,
    maxPlayers: 4,
    currentPlayers: 1,
    currentTurn: 0,
    nextTradeId: 0,
    players: [authority],
    createdAt: timestamp ? parseInt(timestamp) * 1000 : getTransactionBlockTimeMs(tx),
    gameStatus: 'WaitingForPlayers' as GameStatus,
    bankBalance: 1000000,
    freeParkingPool: 0,
    housesRemaining: 32,
    hotelsRemaining: 12,
    timeLimit: null,
    turnStartedAt: getTransactionSlot(tx),
    winner: null,
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: getTransactionSlot(tx),
    updatedSlot: getTransactionSlot(tx),
    lastSignature: getTransactionSignature(tx)
  }
}

/**
 * Parse InitProperty instruction from multiple log lines
 */
function parsePlayerInstruction(tx: ParsedTransactionWithMeta, logs: string[], startIndex: number) {
  let playerAccount = ''
  let wallet = ''
  let gameAccount = ''

  // Try to extract from transaction accounts first
  const accounts = tx.transaction.message.accountKeys || []

  // In JoinGame: [game, player_state, player, system_program, clock]
  if (accounts.length >= 3) {
    gameAccount = accounts[0]?.pubkey.toBase58() || ''
    playerAccount = accounts[1]?.pubkey.toBase58() || ''
    wallet = accounts[2]?.pubkey.toBase58() || ''
    console.log('👤 Extracted from tx accounts - game:', gameAccount, 'player:', playerAccount, 'wallet:', wallet)
  }

  // Extract from starting log as backup - "Player X joined game"
  const startLog = logs[startIndex]

  // Parse "Player [ID] joined game" pattern
  const joinedMatch = startLog.match(/Player ([A-Za-z0-9]+) joined game/)
  if (joinedMatch && !playerAccount) {
    playerAccount = joinedMatch[1]
    wallet = joinedMatch[1] // For now, assume wallet = player ID
  }

  // Look for game ID in other logs that contain "Join game: [ID]"
  for (let j = Math.max(0, startIndex - 5); j < Math.min(startIndex + 5, logs.length); j++) {
    const logLine = logs[j]

    const joinGameMatch = logLine.match(/Join game: ([A-Za-z0-9]+)/)
    if (joinGameMatch) {
      gameAccount = joinGameMatch[1]
    }

    // Also check other patterns
    const playerMatch = logLine.match(/Player account: ([A-Za-z0-9]+)/) || logLine.match(/player: ([A-Za-z0-9]+)/)
    if (playerMatch) {
      playerAccount = playerMatch[1]
    }

    const walletMatch = logLine.match(/wallet: ([A-Za-z0-9]+)/)
    if (walletMatch) {
      wallet = walletMatch[1]
    }

    const gameMatch = logLine.match(/Game account: ([A-Za-z0-9]+)/) || logLine.match(/game: ([A-Za-z0-9]+)/)
    if (gameMatch) {
      gameAccount = gameMatch[1]
    }
  }

  if (!playerAccount || !gameAccount) {
    return null
  }

  if (!wallet) {
    wallet = playerAccount // Default fallback
  }

  const blockTimeMs = getTransactionBlockTimeMs(tx)

  // Return minimal data for instruction-based parsing
  // The writer worker will enrich this with actual blockchain data via enrichRecordWithBlockchainData
  return {
    pubkey: playerAccount,
    wallet,
    game: gameAccount,
    cashBalance: 1500, // Default - will be overridden by blockchain data
    netWorth: 1500, // Default - will be overridden by blockchain data
    position: 0, // Default - will be overridden by blockchain data
    inJail: false, // Will be overridden by blockchain data
    jailTurns: 0, // Will be overridden by blockchain data
    doublesCount: 0, // Will be overridden by blockchain data
    isBankrupt: false, // Will be overridden by blockchain data
    propertiesOwned: [], // Will be overridden by blockchain data
    getOutOfJailCards: 0, // Will be overridden by blockchain data
    lastRentCollected: 0, // Will be overridden by blockchain data
    festivalBoostTurns: 0, // Will be overridden by blockchain data
    hasRolledDice: false, // Will be overridden by blockchain data
    lastDiceRoll: [0, 0] as [number, number], // Will be overridden by blockchain data
    needsPropertyAction: false, // Will be overridden by blockchain data
    pendingPropertyPosition: null, // Will be overridden by blockchain data
    needsChanceCard: false, // Will be overridden by blockchain data
    needsCommunityChestCard: false, // Will be overridden by blockchain data
    needsBankruptcyCheck: false, // Will be overridden by blockchain data
    needsSpecialSpaceAction: false, // Will be overridden by blockchain data
    pendingSpecialSpacePosition: null, // Will be overridden by blockchain data
    cardDrawnAt: null, // Will be overridden by blockchain data
    accountCreatedAt: new Date(blockTimeMs),
    accountUpdatedAt: new Date(blockTimeMs),
    createdSlot: getTransactionSlot(tx),
    updatedSlot: getTransactionSlot(tx),
    lastSignature: getTransactionSignature(tx)
  }
}

function parseInitPropertyInstruction(tx: ParsedTransactionWithMeta, logs: string[], startIndex: number) {
  console.log('🔧 Parsing property instruction starting at:', startIndex, logs[startIndex])

  let propertyAccount = ''
  let position = 0
  let gameAccount = ''

  // Extract data from the starting log line first
  const initLog = logs[startIndex]

  // Parse "Init property X for game Y" pattern
  const initMatch = initLog.match(/Init property (\d+) for game ([A-Za-z0-9]+)/)
  if (initMatch) {
    position = parseInt(initMatch[1])
    gameAccount = initMatch[2]
    console.log('🔧 Extracted from init log - position:', position, 'game:', gameAccount)
  }

  // Look for property details in subsequent lines
  for (let j = startIndex + 1; j < Math.min(startIndex + 10, logs.length); j++) {
    const logLine = logs[j]
    console.log('🔧 Checking subsequent log:', j, logLine)

    const propMatch = logLine.match(/Property account: ([A-Za-z0-9]+)/) || logLine.match(/property: ([A-Za-z0-9]+)/)
    if (propMatch) {
      propertyAccount = propMatch[1]
      console.log('🔧 Found property account:', propertyAccount)
    }

    const posMatch = logLine.match(/position: (\d+)/)
    if (posMatch) {
      position = parseInt(posMatch[1])
      console.log('🔧 Updated position from separate log:', position)
    }

    const gameMatch = logLine.match(/Game account: ([A-Za-z0-9]+)/) || logLine.match(/game: ([A-Za-z0-9]+)/)
    if (gameMatch) {
      gameAccount = gameMatch[1]
      console.log('🔧 Updated game account from separate log:', gameAccount)
    }
  }

  console.log('🔧 Final property data - account:', propertyAccount, 'position:', position, 'game:', gameAccount)

  if (!propertyAccount || !gameAccount) {
    console.log('🔧 Missing required data - returning null')
    return null
  }

  const blockTimeMs = getTransactionBlockTimeMs(tx)

  // Get property configuration from board config based on position
  const propertyConfig = getPropertyConfiguration(position)

  return {
    pubkey: propertyAccount,
    position,
    game: gameAccount,
    owner: null, // Will be enriched from blockchain data
    price: propertyConfig.price,
    colorGroup: propertyConfig.colorGroup,
    propertyType: propertyConfig.propertyType,
    houses: 0, // Will be enriched from blockchain data
    hasHotel: false, // Will be enriched from blockchain data
    isMortgaged: false, // Will be enriched from blockchain data
    rentBase: propertyConfig.rentBase,
    rentWithColorGroup: propertyConfig.rentWithColorGroup,
    rentWithHouses: propertyConfig.rentWithHouses,
    rentWithHotel: propertyConfig.rentWithHotel,
    houseCost: propertyConfig.houseCost,
    mortgageValue: propertyConfig.mortgageValue,
    lastRentPaid: 0, // Will be enriched from blockchain data
    init: true,
    accountCreatedAt: new Date(blockTimeMs),
    accountUpdatedAt: new Date(blockTimeMs),
    createdSlot: getTransactionSlot(tx),
    updatedSlot: getTransactionSlot(tx),
    lastSignature: getTransactionSignature(tx)
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get property configuration based on board position
 */
function getPropertyConfiguration(position: number) {
  const boardSpace = getPropertySpace(position)

  if (!boardSpace || !isPropertySpace(position)) {
    // Default configuration for non-property spaces or missing config
    return {
      price: 0,
      colorGroup: 'Special' as any,
      propertyType: 'Corner' as any,
      rentBase: 0,
      rentWithColorGroup: 0,
      rentWithHouses: [0, 0, 0, 0] as [number, number, number, number],
      rentWithHotel: 0,
      houseCost: 0,
      mortgageValue: 0
    }
  }

  // Calculate rent structure from board config
  const rentBase = Math.floor(boardSpace.price * 0.06) // 6% of property price as base rent
  const rentWithColorGroup = rentBase * 2
  const rentWith1House = boardSpace.rentWith1House || rentBase * 5
  const rentWith2Houses = boardSpace.rentWith2Houses || rentBase * 15
  const rentWith3Houses = boardSpace.rentWith3Houses || rentBase * 45
  const rentWith4Houses = boardSpace.rentWith4Houses || rentBase * 80
  const rentWithHotel = rentBase * 120

  // Determine color group based on position (matching classic Monopoly)
  const getColorGroup = (pos: number): string => {
    if (pos === 1 || pos === 3) return 'Brown'
    if (pos === 6 || pos === 8 || pos === 9) return 'Light Blue'
    if (pos === 11 || pos === 13 || pos === 14) return 'Pink'
    if (pos === 16 || pos === 18 || pos === 19) return 'Orange'
    if (pos === 21 || pos === 23 || pos === 24) return 'Red'
    if (pos === 26 || pos === 27 || pos === 29) return 'Yellow'
    if (pos === 31 || pos === 32 || pos === 34) return 'Green'
    if (pos === 37 || pos === 39) return 'Dark Blue'
    return 'Special'
  }

  return {
    price: boardSpace.price,
    colorGroup: getColorGroup(position),
    propertyType: boardSpace.type,
    rentBase,
    rentWithColorGroup,
    rentWithHouses: [rentWith1House, rentWith2Houses, rentWith3Houses, rentWith4Houses] as [
      number,
      number,
      number,
      number
    ],
    rentWithHotel,
    houseCost: boardSpace.houseCost || 50,
    mortgageValue: Math.floor(boardSpace.price * 0.5)
  }
}

/**
 * Check if transaction contains property-related events
 */
function isPropertyTransaction(logs: string[]): boolean {
  const propertyKeywords = ['property', 'rent', 'house', 'Init property', 'mortgage']

  return logs.some((log) => propertyKeywords.some((keyword) => log.toLowerCase().includes(keyword.toLowerCase())))
}

/**
 * Validate and sanitize transaction data before processing
 */

/**
 * Extract program-specific logs only
 */
