// map tx -> MonopolyRecord[] (stub)
import type { ParsedTransactionWithMeta, PartiallyDecodedInstruction, ParsedInstruction } from '@solana/web3.js'
import type { MonopolyRecord } from '#infra/queue/types'
import type { NewGame, NewPlayer, NewProperty, NewTrade, GameStatus, TradeStatus, TradeType } from '#infra/db/schema'

const getSig = (tx: ParsedTransactionWithMeta) => tx.transaction.signatures[0]
const getSlot = (tx: ParsedTransactionWithMeta) => (tx as any).slot ?? 0
const getBlockTimeSec = (tx: ParsedTransactionWithMeta) => tx.blockTime ?? Math.floor(Date.now() / 1000)
const getBlockTimeMs = (tx: ParsedTransactionWithMeta) => getBlockTimeSec(tx) * 1000

const LOGS = {
  GAME_CREATE: 'monopoly:game:create',
  GAME_UPDATE: 'monopoly:game:update',
  PLAYER_UPDATE: 'monopoly:player:update',
  PROPERTY_UPDATE: 'monopoly:property:update',
  TRADE_OPEN: 'monopoly:trade:open',
  TRADE_UPDATE: 'monopoly:trade:update'
} as const

type PropertySpace = {
  type: 'property'
  price: number
  rentWithHouses?: [number, number, number, number]
  rentWith1House?: number
  rentWith2Houses?: number
  rentWith3Houses?: number
  rentWith4Houses?: number
  houseCost?: number
}

type BoardSpace = PropertySpace | { type: string }

// Simplified board data - should import from centralized config later
const boardSpaces: Record<number, BoardSpace> = {
  1: {
    type: 'property',
    price: 60,
    rentWith1House: 10,
    rentWith2Houses: 30,
    rentWith3Houses: 90,
    rentWith4Houses: 160,
    houseCost: 50
  },
  3: {
    type: 'property',
    price: 60,
    rentWith1House: 20,
    rentWith2Houses: 60,
    rentWith3Houses: 180,
    rentWith4Houses: 320,
    houseCost: 50
  },
  6: {
    type: 'property',
    price: 100,
    rentWith1House: 30,
    rentWith2Houses: 90,
    rentWith3Houses: 270,
    rentWith4Houses: 400,
    houseCost: 50
  },
  8: {
    type: 'property',
    price: 100,
    rentWith1House: 30,
    rentWith2Houses: 90,
    rentWith3Houses: 270,
    rentWith4Houses: 400,
    houseCost: 50
  },
  9: {
    type: 'property',
    price: 120,
    rentWith1House: 40,
    rentWith2Houses: 100,
    rentWith3Houses: 300,
    rentWith4Houses: 450,
    houseCost: 50
  },
  11: {
    type: 'property',
    price: 140,
    rentWith1House: 50,
    rentWith2Houses: 150,
    rentWith3Houses: 450,
    rentWith4Houses: 625,
    houseCost: 100
  },
  13: {
    type: 'property',
    price: 140,
    rentWith1House: 50,
    rentWith2Houses: 150,
    rentWith3Houses: 450,
    rentWith4Houses: 625,
    houseCost: 100
  },
  14: {
    type: 'property',
    price: 160,
    rentWith1House: 60,
    rentWith2Houses: 180,
    rentWith3Houses: 500,
    rentWith4Houses: 700,
    houseCost: 100
  },
  16: {
    type: 'property',
    price: 180,
    rentWith1House: 70,
    rentWith2Houses: 200,
    rentWith3Houses: 550,
    rentWith4Houses: 750,
    houseCost: 100
  },
  18: {
    type: 'property',
    price: 180,
    rentWith1House: 70,
    rentWith2Houses: 200,
    rentWith3Houses: 550,
    rentWith4Houses: 750,
    houseCost: 100
  },
  19: {
    type: 'property',
    price: 200,
    rentWith1House: 80,
    rentWith2Houses: 220,
    rentWith3Houses: 600,
    rentWith4Houses: 800,
    houseCost: 100
  },
  21: {
    type: 'property',
    price: 220,
    rentWith1House: 90,
    rentWith2Houses: 250,
    rentWith3Houses: 700,
    rentWith4Houses: 875,
    houseCost: 150
  },
  23: {
    type: 'property',
    price: 220,
    rentWith1House: 90,
    rentWith2Houses: 250,
    rentWith3Houses: 700,
    rentWith4Houses: 875,
    houseCost: 150
  },
  24: {
    type: 'property',
    price: 240,
    rentWith1House: 100,
    rentWith2Houses: 300,
    rentWith3Houses: 750,
    rentWith4Houses: 925,
    houseCost: 150
  },
  26: {
    type: 'property',
    price: 260,
    rentWith1House: 110,
    rentWith2Houses: 330,
    rentWith3Houses: 800,
    rentWith4Houses: 975,
    houseCost: 150
  },
  27: {
    type: 'property',
    price: 260,
    rentWith1House: 110,
    rentWith2Houses: 330,
    rentWith3Houses: 800,
    rentWith4Houses: 975,
    houseCost: 150
  },
  29: {
    type: 'property',
    price: 280,
    rentWith1House: 120,
    rentWith2Houses: 360,
    rentWith3Houses: 850,
    rentWith4Houses: 1025,
    houseCost: 150
  },
  31: {
    type: 'property',
    price: 300,
    rentWith1House: 130,
    rentWith2Houses: 390,
    rentWith3Houses: 900,
    rentWith4Houses: 1100,
    houseCost: 200
  },
  32: {
    type: 'property',
    price: 300,
    rentWith1House: 130,
    rentWith2Houses: 390,
    rentWith3Houses: 900,
    rentWith4Houses: 1100,
    houseCost: 200
  },
  34: {
    type: 'property',
    price: 320,
    rentWith1House: 150,
    rentWith2Houses: 450,
    rentWith3Houses: 1000,
    rentWith4Houses: 1200,
    houseCost: 200
  },
  37: {
    type: 'property',
    price: 350,
    rentWith1House: 175,
    rentWith2Houses: 500,
    rentWith3Houses: 1100,
    rentWith4Houses: 1300,
    houseCost: 200
  },
  39: {
    type: 'property',
    price: 400,
    rentWith1House: 200,
    rentWith2Houses: 600,
    rentWith3Houses: 1400,
    rentWith4Houses: 1700,
    houseCost: 200
  },
  // Utilities and Railroads (no house rent, keep [0,0,0,0])
  5: { type: 'railroad' },
  12: { type: 'utility' },
  15: { type: 'railroad' },
  22: { type: 'utility' },
  25: { type: 'railroad' },
  28: { type: 'utility' },
  35: { type: 'railroad' }
}

// Helper functions for property defaults based on Monopoly board positions
function getDefaultPropertyPrice(position: number): number {
  const prices: Record<number, number> = {
    1: 60,
    3: 60,
    6: 100,
    8: 100,
    9: 120,
    11: 140,
    13: 140,
    14: 160,
    16: 180,
    18: 180,
    19: 200,
    21: 220,
    23: 220,
    24: 240,
    26: 260,
    27: 260,
    29: 280,
    31: 300,
    32: 300,
    34: 320,
    37: 350,
    39: 400
  }
  return prices[position] || 100
}

function getPropertyColorGroup(
  position: number
):
  | 'Brown'
  | 'LightBlue'
  | 'Pink'
  | 'Orange'
  | 'Red'
  | 'Yellow'
  | 'Green'
  | 'DarkBlue'
  | 'Railroad'
  | 'Utility'
  | 'Special' {
  if ([1, 3].includes(position)) return 'Brown'
  if ([6, 8, 9].includes(position)) return 'LightBlue'
  if ([11, 13, 14].includes(position)) return 'Pink'
  if ([16, 18, 19].includes(position)) return 'Orange'
  if ([21, 23, 24].includes(position)) return 'Red'
  if ([26, 27, 29].includes(position)) return 'Yellow'
  if ([31, 32, 34].includes(position)) return 'Green'
  if ([37, 39].includes(position)) return 'DarkBlue'
  if ([5, 15, 25, 35].includes(position)) return 'Railroad'
  if ([12, 28].includes(position)) return 'Utility'
  return 'Special'
}

function getPropertyType(
  position: number
):
  | 'Property'
  | 'Street'
  | 'Railroad'
  | 'Utility'
  | 'Corner'
  | 'Chance'
  | 'CommunityChest'
  | 'Tax'
  | 'Beach'
  | 'Festival' {
  if ([5, 15, 25, 35].includes(position)) return 'Railroad'
  if ([12, 28].includes(position)) return 'Utility'
  if ([0, 10, 20, 30].includes(position)) return 'Corner'
  if ([2, 17, 33].includes(position)) return 'Chance'
  if ([7, 22, 36].includes(position)) return 'CommunityChest'
  if ([4, 38].includes(position)) return 'Tax'
  return 'Street'
}

function getDefaultRent(position: number): number {
  return Math.floor(getDefaultPropertyPrice(position) * 0.1)
}

function getDefaultRentWithColorGroup(position: number): number {
  return getDefaultRent(position) * 2
}

function getDefaultHouseCost(position: number): number {
  const space = boardSpaces[position]
  if (space && space.type === 'property') {
    return (space as PropertySpace).houseCost ?? 0
  }
  return 0
}

function getDefaultRentWithHouses(position: number): [number, number, number, number] {
  const space = boardSpaces[position]

  // For properties that can have houses, return proper rent progression
  if (space && space.type === 'property') {
    const propSpace = space as PropertySpace
    return [
      propSpace.rentWith1House ?? 0,
      propSpace.rentWith2Houses ?? 0,
      propSpace.rentWith3Houses ?? 0,
      propSpace.rentWith4Houses ?? 0
    ]
  }

  // For other space types (utilities, railroads, special), return [0,0,0,0]
  return [0, 0, 0, 0]
}

function guessPdaByIndex(tx: ParsedTransactionWithMeta, idx: number): string | undefined {
  const ak = tx.transaction.message.accountKeys?.[idx]
  if (!ak) return undefined
  const v0 = (ak as any)?.pubkey?.toBase58?.()
  return v0 ?? String(ak)
}

function kvFromLog(line: string): Record<string, string> {
  const out: Record<string, string> = {}
  const parts = line.split(/\s+/).slice(1)
  for (const part of parts) {
    const m = part.match(/([^=]+)=(.*)/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

function buildGameFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewGame {
  const pubkey = kv.pubkey ?? guessPdaByIndex(tx, 0) ?? 'UNKNOWN'
  return {
    pubkey,
    gameId: Number(kv.game_id ?? 0),
    configId: kv.config_id ?? 'UNKNOWN',
    authority: kv.authority ?? 'UNKNOWN',
    bump: Number(kv.bump ?? 0),
    maxPlayers: Number(kv.max_players ?? 4),
    currentPlayers: Number(kv.current_players ?? 0),
    currentTurn: Number(kv.current_turn ?? 0),
    players: kv.players ? JSON.parse(kv.players) : [],
    createdAt: new Date(kv.created_at ? Number(kv.created_at) : getBlockTimeMs(tx)),
    gameStatus: (kv.game_status as GameStatus) ?? 'WaitingForPlayers',
    bankBalance: Number(kv.bank_balance ?? 0),
    freeParkingPool: Number(kv.free_parking_pool ?? 0),
    housesRemaining: Number(kv.houses_remaining ?? 32),
    hotelsRemaining: Number(kv.hotels_remaining ?? 12),
    timeLimit: kv.time_limit ? Number(kv.time_limit) : (null as any),
    turnStartedAt: Number(kv.turn_started_at ?? getSlot(tx)),
    winner: kv.winner,
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: getSlot(tx),
    updatedSlot: getSlot(tx),
    lastSignature: getSig(tx)
  }
}

function buildPlayerFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewPlayer {
  const pubkey = kv.pubkey ?? guessPdaByIndex(tx, 1) ?? 'UNKNOWN'
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
    lastRentCollected: Number(kv.last_rent_collected ?? getSlot(tx)),
    festivalBoostTurns: Number(kv.festival_boost_turns ?? 0),
    cardDrawnAt: kv.card_drawn_at ? Number(kv.card_drawn_at) : (null as any),
    needsPropertyAction: kv.needs_property_action === 'true',
    pendingPropertyPosition: kv.pending_property_position ? Number(kv.pending_property_position) : (null as any),
    needsChanceCard: kv.needs_chance_card === 'true',
    needsCommunityChestCard: kv.needs_community_chest_card === 'true',
    needsBankruptcyCheck: kv.needs_bankruptcy_check === 'true',
    needsSpecialSpaceAction: kv.needs_special_space_action === 'true',
    pendingSpecialSpacePosition: kv.pending_special_space_position
      ? Number(kv.pending_special_space_position)
      : (null as any),
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: getSlot(tx),
    updatedSlot: getSlot(tx),
    lastSignature: getSig(tx)
  }
}

function buildPropertyFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewProperty {
  const pubkey = kv.pubkey ?? guessPdaByIndex(tx, 2) ?? 'UNKNOWN'

  // 🔍 DEBUG: Log blockchain property data
  console.log('🔍 BLOCKCHAIN Property Data:')
  console.log('  - Raw kv object:', JSON.stringify(kv, null, 2))
  console.log('  - rent_with_houses raw:', kv.rent_with_houses)
  console.log('  - rent_with_houses exists:', !!kv.rent_with_houses)

  const rentWithHousesArray = kv.rent_with_houses ? JSON.parse(kv.rent_with_houses) : [0, 0, 0, 0]
  console.log('  - rent_with_houses parsed:', rentWithHousesArray)

  return {
    pubkey,
    position: Number(kv.position ?? 0),
    owner: kv.owner,
    price: Number(kv.price ?? 0),
    colorGroup: kv.color_group as any,
    propertyType: kv.property_type as any,
    houses: Number(kv.houses ?? 0),
    hasHotel: kv.has_hotel === 'true',
    isMortgaged: kv.is_mortgaged === 'true',
    rentBase: Number(kv.rent_base ?? 0),
    rentWithColorGroup: Number(kv.rent_with_color_group ?? 0),
    rentWithHouses: rentWithHousesArray,
    rentWithHotel: Number(kv.rent_with_hotel ?? 0),
    houseCost: Number(kv.house_cost ?? 0),
    mortgageValue: Number(kv.mortgage_value ?? 0),
    lastRentPaid: Number(kv.last_rent_paid ?? getSlot(tx)),
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: getSlot(tx),
    updatedSlot: getSlot(tx),
    lastSignature: getSig(tx)
  }
}

function buildTradeFromLog(tx: ParsedTransactionWithMeta, kv: Record<string, string>): NewTrade {
  const pubkey = kv.pubkey ?? guessPdaByIndex(tx, 3) ?? 'UNKNOWN'
  return {
    pubkey,
    game: kv.game ?? 'UNKNOWN',
    proposer: kv.proposer ?? 'UNKNOWN',
    receiver: kv.receiver ?? 'UNKNOWN',
    tradeType: (kv.trade_type as TradeType) ?? 'MoneyOnly',
    proposerMoney: Number(kv.proposer_money ?? 0),
    receiverMoney: Number(kv.receiver_money ?? 0),
    proposerProperty: kv.proposer_property ? Number(kv.proposer_property) : (null as any),
    receiverProperty: kv.receiver_property ? Number(kv.receiver_property) : (null as any),
    status: (kv.status as TradeStatus) ?? 'Pending',
    createdAt: Number(kv.created_at ?? getSlot(tx)),
    expiresAt: Number(kv.expires_at ?? getBlockTimeSec(tx) + 3600),
    bump: Number(kv.bump ?? 0),
    accountCreatedAt: new Date(),
    accountUpdatedAt: new Date(),
    createdSlot: getSlot(tx),
    updatedSlot: getSlot(tx),
    lastSignature: getSig(tx)
  }
}

export function mapTxToMonopolyRecords(tx: ParsedTransactionWithMeta): MonopolyRecord[] {
  const out: MonopolyRecord[] = []
  const logs = tx.meta?.logMessages ?? []

  // Debug: log all messages to see what's actually in the transaction
  if (logs.length > 0) {
    // 🔍 DEBUG: Check if this transaction has property-related logs
    const hasPropertyLogs = logs.some(
      (log) =>
        log.includes('property') || log.includes('rent') || log.includes('house') || log.includes('Init property')
    )

    if (hasPropertyLogs) {
      console.log('🔍 PROPERTY TRANSACTION FOUND:', tx.transaction.signatures[0])
      console.log('🔍 ALL LOG MESSAGES:')
      logs.forEach((line, i) => console.log(`  ${i}: ${line}`))
    }
  }

  // Parse actual program logs instead of expecting custom format
  let currentGameId: string | undefined
  let currentPropertyPubkey: string | undefined
  let currentPropertyPosition: number | undefined

  for (let i = 0; i < logs.length; i++) {
    const line = logs[i]

    // 1. Parse InitializeGame instruction
    if (line.includes('InitializeGame')) {
      // Look for game details in subsequent lines
      let gameAccount = ''
      let authority = ''
      let timestamp = ''

      for (let j = i + 1; j < Math.min(i + 10, logs.length); j++) {
        const nextLine = logs[j]

        if (nextLine.includes('Game initialized by authority:')) {
          const authMatch = nextLine.match(/authority: ([A-Za-z0-9]+)/)
          if (authMatch) {
            authority = authMatch[1]
          }
        }

        if (nextLine.includes('Game account:')) {
          const accountMatch = nextLine.match(/Game account: ([A-Za-z0-9]+)/)
          if (accountMatch) {
            gameAccount = accountMatch[1]
          }
        }

        if (nextLine.includes('Game created at timestamp:')) {
          const timeMatch = nextLine.match(/timestamp: (\d+)/)
          if (timeMatch) {
            timestamp = timeMatch[1]
          }
        }
      }

      if (gameAccount && authority) {
        const gameRecord: NewGame = {
          pubkey: gameAccount,
          gameId: 0, // We don't have this from logs
          configId: 'UNKNOWN',
          authority,
          bump: 0,
          maxPlayers: 4,
          currentPlayers: 1, // Initial player
          currentTurn: 0,
          players: [authority],
          createdAt: new Date(parseInt(timestamp) * 1000 || getBlockTimeMs(tx)),
          gameStatus: 'WaitingForPlayers' as GameStatus,
          bankBalance: 1000000,
          freeParkingPool: 0,
          housesRemaining: 32,
          hotelsRemaining: 12,
          timeLimit: null,
          turnStartedAt: getSlot(tx),
          winner: null,
          accountCreatedAt: new Date(),
          accountUpdatedAt: new Date(),
          createdSlot: getSlot(tx),
          updatedSlot: getSlot(tx),
          lastSignature: getSig(tx)
        }

        out.push({ kind: 'game', data: gameRecord })
        console.log(`Game created: ${gameAccount} by ${authority}`)
      }
    }

    // 2. Parse CreateTrade instruction
    if (line.includes('Instruction: CreateTrade')) {
      // The trade details will be in subsequent log lines
    }

    // 3. Parse JoinGame instruction
    if (line.includes('JoinGame')) {
      let gameAccount = ''
      let playerWallet = ''
      let totalPlayers = 0

      for (let j = i + 1; j < Math.min(i + 10, logs.length); j++) {
        const nextLine = logs[j]

        if (nextLine.includes('Join game:')) {
          const gameMatch = nextLine.match(/Join game: ([A-Za-z0-9]+)/)
          if (gameMatch) {
            gameAccount = gameMatch[1]
          }
        }

        if (
          nextLine.includes('Player:') &&
          !nextLine.includes('Existing player:') &&
          !nextLine.includes('joined game')
        ) {
          const playerMatch = nextLine.match(/Player: ([A-Za-z0-9]+)/)
          if (playerMatch) {
            playerWallet = playerMatch[1]
          }
        }

        if (nextLine.includes('Total players:')) {
          const totalMatch = nextLine.match(/Total players: (\d+)/)
          if (totalMatch) {
            totalPlayers = parseInt(totalMatch[1])
          }
        }
      }

      if (gameAccount && playerWallet) {
        // Generate player PDA address (approximate)
        const playerPubkey = `player-${gameAccount.slice(-8)}-${playerWallet.slice(-8)}`

        const playerRecord: NewPlayer = {
          pubkey: playerPubkey,
          wallet: playerWallet,
          game: gameAccount,
          cashBalance: 1500,
          netWorth: 1500,
          position: 0,
          inJail: false,
          jailTurns: 0,
          doublesCount: 0,
          isBankrupt: false,
          propertiesOwned: [],
          getOutOfJailCards: 0,
          hasRolledDice: false,
          lastDiceRoll: [0, 0],
          lastRentCollected: getSlot(tx),
          festivalBoostTurns: 0,
          cardDrawnAt: null,
          needsPropertyAction: false,
          pendingPropertyPosition: null,
          needsChanceCard: false,
          needsCommunityChestCard: false,
          needsBankruptcyCheck: false,
          needsSpecialSpaceAction: false,
          pendingSpecialSpacePosition: null,
          accountCreatedAt: new Date(),
          accountUpdatedAt: new Date(),
          createdSlot: getSlot(tx),
          updatedSlot: getSlot(tx),
          lastSignature: getSig(tx)
        }

        out.push({ kind: 'player', data: playerRecord })
        console.log(
          `Player joined: ${playerWallet.slice(0, 8)}... → Game: ${gameAccount.slice(0, 8)}... (${totalPlayers} players)`
        )
      }
    }

    // 3. Parse property initialization: "Program log: Init property 23 for game CziCMQAd..."
    if (line.includes('Init property') && line.includes('for game')) {
      console.log('🔍 PARSING Init property line:', line)

      const gameMatch = line.match(/for game ([A-Za-z0-9]+)/)
      if (gameMatch) {
        currentGameId = gameMatch[1]
      }

      const propertyMatch = line.match(/Init property (\d+)/)
      if (propertyMatch) {
        currentPropertyPosition = parseInt(propertyMatch[1])
      }

      // Look ahead for the property pubkey and ANY additional property data
      console.log('🔍 Looking for property data in next lines:')
      for (let j = i + 1; j < Math.min(i + 10, logs.length); j++) {
        const nextLine = logs[j]
        console.log(`  Line ${j}: ${nextLine}`)

        if (nextLine.includes('property:')) {
          const pubkeyMatch = nextLine.match(/property: ([A-Za-z0-9]+)/)
          if (pubkeyMatch) {
            currentPropertyPubkey = pubkeyMatch[1]
            console.log('  → Found property pubkey:', currentPropertyPubkey)
          }
        }

        // Check for rent_with_houses data
        if (nextLine.includes('rent') || nextLine.includes('house')) {
          console.log('  → Found rent/house related line:', nextLine)
        }
      }

      // Create property record if we have all required data
      if (currentGameId && currentPropertyPubkey && currentPropertyPosition !== undefined) {
        // 🔍 DEBUG: Show default vs blockchain data
        const properRentWithHouses = getDefaultRentWithHouses(currentPropertyPosition)
        console.log('🔍 PROPERTY CREATION:')
        console.log('  - Position:', currentPropertyPosition)
        console.log('  - Using PROPER rent_with_houses:', properRentWithHouses)
        console.log('  - Default price:', getDefaultPropertyPrice(currentPropertyPosition))
        console.log('  - Default rent base:', getDefaultRent(currentPropertyPosition))

        const propertyRecord: NewProperty = {
          pubkey: currentPropertyPubkey,
          position: currentPropertyPosition,
          owner: null,
          price: getDefaultPropertyPrice(currentPropertyPosition),
          colorGroup: getPropertyColorGroup(currentPropertyPosition),
          propertyType: getPropertyType(currentPropertyPosition),
          houses: 0,
          hasHotel: false,
          isMortgaged: false,
          rentBase: getDefaultRent(currentPropertyPosition),
          rentWithColorGroup: getDefaultRentWithColorGroup(currentPropertyPosition),
          rentWithHouses: properRentWithHouses,
          rentWithHotel: 0,
          houseCost: getDefaultHouseCost(currentPropertyPosition),
          mortgageValue: Math.floor(getDefaultPropertyPrice(currentPropertyPosition) / 2),
          lastRentPaid: getSlot(tx),
          accountCreatedAt: new Date(),
          accountUpdatedAt: new Date(),
          createdSlot: getSlot(tx),
          updatedSlot: getSlot(tx),
          lastSignature: getSig(tx)
        }

        out.push({ kind: 'property', data: propertyRecord })
        console.log(`Property initialized: Position ${currentPropertyPosition} → Game: ${currentGameId.slice(0, 8)}...`)

        // Reset for next property
        currentPropertyPubkey = undefined
        currentPropertyPosition = undefined
        currentGameId = undefined
      }
    }

    // Original format checks (keep for backward compatibility)
    if (line.startsWith(LOGS.GAME_CREATE) || line.startsWith(LOGS.GAME_UPDATE)) {
      const kv = kvFromLog(line)
      out.push({ kind: 'game', data: buildGameFromLog(tx, kv) })
    }
    if (line.startsWith(LOGS.PLAYER_UPDATE)) {
      const kv = kvFromLog(line)
      out.push({ kind: 'player', data: buildPlayerFromLog(tx, kv) })
    }
    if (line.startsWith(LOGS.PROPERTY_UPDATE)) {
      const kv = kvFromLog(line)
      out.push({ kind: 'property', data: buildPropertyFromLog(tx, kv) })
    }
    // Parse trade creation from actual Solana program logs
    if (line.includes('Trade created by') && line.includes('for player')) {
      // Extract proposer and receiver from: "Trade created by {proposer} for player {receiver}"
      const tradeMatch = line.match(/Trade created by ([A-Za-z0-9]+) for player ([A-Za-z0-9]+)/)
      if (tradeMatch) {
        const [, proposer, receiver] = tradeMatch

        // Look for trade type in subsequent lines
        let tradeType = 'MoneyOnly'
        for (let j = i + 1; j < Math.min(i + 5, logs.length); j++) {
          const nextLine = logs[j]
          if (nextLine.includes('Trade type:')) {
            const typeMatch = nextLine.match(/Trade type: (\w+)/)
            if (typeMatch) {
              tradeType = typeMatch[1]
              break
            }
          }
        }

        // Create trade record
        const tradeRecord: NewTrade = {
          pubkey: `${proposer}-${receiver}-${getSig(tx).slice(0, 8)}`, // Generate unique trade ID
          game: 'UNKNOWN', // We'll need to extract this from accounts
          proposer,
          receiver,
          tradeType: tradeType as TradeType,
          proposerMoney: 0,
          receiverMoney: 0,
          proposerProperty: null,
          receiverProperty: null,
          status: 'Pending' as TradeStatus,
          createdAt: getSlot(tx),
          expiresAt: getSlot(tx) + 3600, // 1 hour default
          bump: 0,
          accountCreatedAt: new Date(),
          accountUpdatedAt: new Date(),
          createdSlot: getSlot(tx),
          updatedSlot: getSlot(tx),
          lastSignature: getSig(tx)
        }

        out.push({ kind: 'trade', data: tradeRecord })
        console.log(`Trade created: ${proposer.slice(0, 8)}... → ${receiver.slice(0, 8)}... (${tradeType})`)
      }
    }

    // Parse trade status updates for websocket events
    if (line.includes('Trade rejected by target player') || line.includes('Trade cancelled by proposer')) {
      // Keep for future websocket notifications
    }

    // Keep old format for backward compatibility
    if (line.startsWith(LOGS.TRADE_OPEN) || line.startsWith(LOGS.TRADE_UPDATE)) {
      const kv = kvFromLog(line)
      out.push({ kind: 'trade', data: buildTradeFromLog(tx, kv) })
    }
  }

  // Log summary for monitoring and potential websocket events
  if (out.length > 0) {
    const summary = out.reduce(
      (acc, record) => {
        acc[record.kind] = (acc[record.kind] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    console.log(
      `Transaction processed: ${Object.entries(summary)
        .map(([kind, count]) => `${count} ${kind}${count > 1 ? 's' : ''}`)
        .join(', ')}`
    )
  }

  return out
}
