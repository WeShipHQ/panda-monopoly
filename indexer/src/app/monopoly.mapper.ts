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

type AnyIx = PartiallyDecodedInstruction | ParsedInstruction

function guessPdaByIndex(tx: ParsedTransactionWithMeta, idx: number): string | undefined {
  const ak = tx.transaction.message.accountKeys?.[idx]
  if (!ak) return undefined
  const v0 = (ak as any)?.pubkey?.toBase58?.()
  return v0 ?? String(ak)
}

function kvFromLog(line: string): Record<string, string> {
  const out: Record<string, string> = {}
  const parts = line.split(/\s+/).slice(1)
  for (const p of parts) {
    const m = p.match(/([^=]+)=(.*)/)
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
    rentWithHouses: kv.rent_with_houses ? JSON.parse(kv.rent_with_houses) : [0, 0, 0, 0],
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
  for (const line of logs) {
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
    if (line.startsWith(LOGS.TRADE_OPEN) || line.startsWith(LOGS.TRADE_UPDATE)) {
      const kv = kvFromLog(line)
      out.push({ kind: 'trade', data: buildTradeFromLog(tx, kv) })
    }
  }
  return out
}
