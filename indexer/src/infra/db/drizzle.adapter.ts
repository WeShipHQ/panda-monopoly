import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq } from 'drizzle-orm'
import type { DatabasePort } from './db.port'
import {
  games,
  players,
  properties,
  trades,
  checkpoints,
  type NewGame,
  type NewPlayer,
  type NewProperty,
  type NewTrade
} from './schema'
import { env } from '#config'

export class DrizzleAdapter implements DatabasePort {
  public pool = new Pool({
    connectionString: env.db.url,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  })
  public db = drizzle(this.pool)

  async init() {
    await this.pool.query('select 1')
  }

  async upsertGame(row: NewGame) {
    await this.db
      .insert(games)
      .values(row)
      .onConflictDoUpdate({
        target: games.pubkey,
        set: {
          gameId: row.gameId,
          configId: row.configId,
          authority: row.authority,
          bump: row.bump,
          maxPlayers: row.maxPlayers,
          currentPlayers: row.currentPlayers,
          currentTurn: row.currentTurn,
          players: row.players,
          createdAt: row.createdAt,
          gameStatus: row.gameStatus,
          bankBalance: row.bankBalance,
          freeParkingPool: row.freeParkingPool,
          housesRemaining: row.housesRemaining,
          hotelsRemaining: row.hotelsRemaining,
          timeLimit: row.timeLimit,
          turnStartedAt: row.turnStartedAt,
          winner: row.winner,
          accountUpdatedAt: row.accountUpdatedAt ?? new Date(),
          createdSlot: row.createdSlot,
          updatedSlot: row.updatedSlot,
          lastSignature: row.lastSignature
        }
      })
  }

  async upsertPlayer(row: NewPlayer) {
    await this.db
      .insert(players)
      .values(row)
      .onConflictDoUpdate({
        target: players.pubkey,
        set: {
          wallet: row.wallet,
          game: row.game,
          cashBalance: row.cashBalance,
          netWorth: row.netWorth,
          position: row.position,
          inJail: row.inJail,
          jailTurns: row.jailTurns,
          doublesCount: row.doublesCount,
          isBankrupt: row.isBankrupt,
          propertiesOwned: row.propertiesOwned,
          getOutOfJailCards: row.getOutOfJailCards,
          hasRolledDice: row.hasRolledDice,
          lastDiceRoll: row.lastDiceRoll,
          lastRentCollected: row.lastRentCollected,
          festivalBoostTurns: row.festivalBoostTurns,
          cardDrawnAt: row.cardDrawnAt,
          needsPropertyAction: row.needsPropertyAction,
          pendingPropertyPosition: row.pendingPropertyPosition,
          needsChanceCard: row.needsChanceCard,
          needsCommunityChestCard: row.needsCommunityChestCard,
          needsBankruptcyCheck: row.needsBankruptcyCheck,
          needsSpecialSpaceAction: row.needsSpecialSpaceAction,
          pendingSpecialSpacePosition: row.pendingSpecialSpacePosition,
          accountUpdatedAt: row.accountUpdatedAt ?? new Date(),
          createdSlot: row.createdSlot,
          updatedSlot: row.updatedSlot,
          lastSignature: row.lastSignature
        }
      })
  }

  async upsertProperty(row: NewProperty) {
    await this.db
      .insert(properties)
      .values(row)
      .onConflictDoUpdate({
        target: properties.pubkey,
        set: {
          position: row.position,
          owner: row.owner,
          price: row.price,
          colorGroup: row.colorGroup,
          propertyType: row.propertyType,
          houses: row.houses,
          hasHotel: row.hasHotel,
          isMortgaged: row.isMortgaged,
          rentBase: row.rentBase,
          rentWithColorGroup: row.rentWithColorGroup,
          rentWithHouses: row.rentWithHouses,
          rentWithHotel: row.rentWithHotel,
          houseCost: row.houseCost,
          mortgageValue: row.mortgageValue,
          lastRentPaid: row.lastRentPaid,
          accountUpdatedAt: row.accountUpdatedAt ?? new Date(),
          createdSlot: row.createdSlot,
          updatedSlot: row.updatedSlot,
          lastSignature: row.lastSignature
        }
      })
  }

  async upsertTrade(row: NewTrade) {
    await this.db
      .insert(trades)
      .values(row)
      .onConflictDoUpdate({
        target: trades.pubkey,
        set: {
          game: row.game,
          proposer: row.proposer,
          receiver: row.receiver,
          tradeType: row.tradeType,
          proposerMoney: row.proposerMoney,
          receiverMoney: row.receiverMoney,
          proposerProperty: row.proposerProperty,
          receiverProperty: row.receiverProperty,
          status: row.status,
          createdAt: row.createdAt,
          expiresAt: row.expiresAt,
          bump: row.bump,
          accountUpdatedAt: row.accountUpdatedAt ?? new Date(),
          createdSlot: row.createdSlot,
          updatedSlot: row.updatedSlot,
          lastSignature: row.lastSignature
        }
      })
  }

  // Checkpoints
  async getCheckpoint(id: string) {
    const r = await this.db.select().from(checkpoints).where(eq(checkpoints.id, id)).limit(1)
    return r[0] ? { last_slot: r[0].lastSlot ?? null, last_signature: r[0].lastSignature ?? null } : null
  }
  async setCheckpoint(id: string, data: { last_slot?: number; last_signature?: string }) {
    await this.db
      .insert(checkpoints)
      .values({
        id,
        lastSlot: data.last_slot ?? null,
        lastSignature: data.last_signature ?? null,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: checkpoints.id,
        set: {
          lastSlot: data.last_slot ?? undefined,
          lastSignature: data.last_signature ?? undefined,
          updatedAt: new Date()
        }
      })
  }

  // Reads
  async getGame(pubkey: string) {
    const r = await this.db.select().from(games).where(eq(games.pubkey, pubkey)).limit(1)
    return r[0] ?? null
  }
  async getPlayer(pubkey: string) {
    const r = await this.db.select().from(players).where(eq(players.pubkey, pubkey)).limit(1)
    return r[0] ?? null
  }
  async getProperty(pubkey: string) {
    const r = await this.db.select().from(properties).where(eq(properties.pubkey, pubkey)).limit(1)
    return r[0] ?? null
  }
  async getTrade(pubkey: string) {
    const r = await this.db.select().from(trades).where(eq(trades.pubkey, pubkey)).limit(1)
    return r[0] ?? null
  }
}
