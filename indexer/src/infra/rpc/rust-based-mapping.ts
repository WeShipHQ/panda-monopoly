/**
 * Blockchain Data Mapping Functions
 * Based on Solana Rust program structure
 */

import { PublicKey } from '@solana/web3.js'
import type { GameState as DatabaseGameState } from '../db/schema'

export const ACCOUNT_DISCRIMINATORS = {
  GAME_STATE: Buffer.from([]),
  PLAYER_STATE: Buffer.from([]),
  PLATFORM_CONFIG: Buffer.from([]),
  PROPERTY_STATE: Buffer.from([])
}

export interface RustGameState {
  discriminator: Buffer
  gameId: number
  configId: PublicKey
  authority: PublicKey
  bump: number
  maxPlayers: number
  currentPlayers: number
  currentTurn: number
  players: PublicKey[]
  gameStatus: GameStatus
  turnStartedAt: number
  timeLimit: number
  bankBalance: bigint
  freeParkingPool: bigint
  housesRemaining: number
  hotelsRemaining: number
  winner: PublicKey | null
  nextTradeId: number
  activeTrades: TradeInfo[]
  createdAt: number
}

export enum GameStatus {
  WaitingForPlayers = 0,
  InProgress = 1,
  Finished = 2
}

export interface TradeInfo {
  tradeId: number
  proposer: PublicKey
  acceptor: PublicKey
}

export function parseGameStateFromBlockchain(accountData: Buffer, pubkey: string): RustGameState | null {
  if (accountData.length < 8) {
    console.warn(`Account ${pubkey} data too short: ${accountData.length} bytes`)
    return null
  }

  try {
    let offset = 0

    const discriminator = accountData.subarray(0, 8)
    offset += 8

    if (accountData.length < offset + 4) return null
    const gameId = accountData.readUInt32LE(offset)
    offset += 4

    if (accountData.length < offset + 32) return null
    const configId = new PublicKey(accountData.subarray(offset, offset + 32))
    offset += 32

    if (accountData.length < offset + 32) return null
    const authority = new PublicKey(accountData.subarray(offset, offset + 32))
    offset += 32

    if (accountData.length < offset + 1) return null
    const bump = accountData.readUInt8(offset)
    offset += 1

    if (accountData.length < offset + 1) return null
    const maxPlayers = accountData.readUInt8(offset)
    offset += 1

    if (accountData.length < offset + 1) return null
    const currentPlayers = accountData.readUInt8(offset)
    offset += 1

    if (accountData.length < offset + 1) return null
    const currentTurn = accountData.readUInt8(offset)
    offset += 1

    if (accountData.length < offset + 4) return null
    const playersLength = accountData.readUInt32LE(offset)
    offset += 4

    const players: PublicKey[] = []
    for (let i = 0; i < playersLength && i < 8; i++) {
      if (accountData.length < offset + 32) break
      players.push(new PublicKey(accountData.subarray(offset, offset + 32)))
      offset += 32
    }

    if (accountData.length < offset + 1) return null
    const gameStatus = accountData.readUInt8(offset) as GameStatus
    offset += 1

    let turnStartedAt = 0,
      createdAt = 0
    if (accountData.length >= offset + 8) {
      turnStartedAt = Number(accountData.readBigInt64LE(offset))
      offset += 8
    }

    let timeLimit = 300
    if (accountData.length >= offset + 4) {
      timeLimit = accountData.readUInt32LE(offset)
      offset += 4
    }

    let bankBalance = 0n,
      freeParkingPool = 0n
    if (accountData.length >= offset + 16) {
      bankBalance = accountData.readBigUInt64LE(offset)
      freeParkingPool = accountData.readBigUInt64LE(offset + 8)
      offset += 16
    }

    let housesRemaining = 32,
      hotelsRemaining = 12
    if (accountData.length >= offset + 8) {
      housesRemaining = accountData.readUInt32LE(offset)
      hotelsRemaining = accountData.readUInt32LE(offset + 4)
      offset += 8
    }

    let winner: PublicKey | null = null
    if (accountData.length >= offset + 1) {
      const hasWinner = accountData.readUInt8(offset) === 1
      offset += 1
      if (hasWinner && accountData.length >= offset + 32) {
        winner = new PublicKey(accountData.subarray(offset, offset + 32))
        offset += 32
      }
    }

    let nextTradeId = 0
    if (accountData.length >= offset + 4) {
      nextTradeId = accountData.readUInt32LE(offset)
      offset += 4
    }

    const activeTrades: TradeInfo[] = []

    if (accountData.length >= offset + 8) {
      createdAt = Number(accountData.readBigInt64LE(offset))
      offset += 8
    }

    return {
      discriminator,
      gameId,
      configId,
      authority,
      bump,
      maxPlayers,
      currentPlayers,
      currentTurn,
      players,
      gameStatus,
      turnStartedAt,
      timeLimit,
      bankBalance,
      freeParkingPool,
      housesRemaining,
      hotelsRemaining,
      winner,
      nextTradeId,
      activeTrades,
      createdAt
    }
  } catch (error) {
    console.error(`Error parsing GameState ${pubkey}:`, error)
    return null
  }
}

export function mapGameStateToDatabase(blockchainData: RustGameState, pubkey: string): Partial<DatabaseGameState> {
  return {
    pubkey,
    gameId: blockchainData.gameId,
    configId: blockchainData.configId.toString(),
    authority: blockchainData.authority.toString(),
    bump: blockchainData.bump,
    maxPlayers: blockchainData.maxPlayers,
    currentPlayers: blockchainData.currentPlayers,
    currentTurn: blockchainData.currentTurn,
    players: blockchainData.players.map((p) => p.toString()),
    createdAt: blockchainData.createdAt,
    gameStatus: Object.keys(GameStatus)[blockchainData.gameStatus] as any,
    turnStartedAt: blockchainData.turnStartedAt,
    timeLimit: blockchainData.timeLimit,
    bankBalance: Number(blockchainData.bankBalance),
    freeParkingPool: Number(blockchainData.freeParkingPool),
    housesRemaining: blockchainData.housesRemaining,
    hotelsRemaining: blockchainData.hotelsRemaining,
    winner: blockchainData.winner?.toString() || null,
    nextTradeId: blockchainData.nextTradeId,
    activeTrades: [],
    accountUpdatedAt: new Date()
  }
}

export function sanitizeGameState(gameState: any): Partial<DatabaseGameState> {
  return {
    pubkey: gameState.pubkey,
    gameId: gameState.gameId >= 0 ? gameState.gameId : 0,
    configId: gameState.configId !== 'UNKNOWN' ? gameState.configId : null,
    authority: gameState.authority !== 'UNKNOWN' ? gameState.authority : null,
    bump: gameState.bump >= 0 ? gameState.bump : 255,
    maxPlayers: gameState.maxPlayers || 4,
    currentPlayers: gameState.currentPlayers || 0,
    currentTurn: gameState.currentTurn || 0,
    players: Array.isArray(gameState.players) ? gameState.players : [],
    gameStatus: ['WaitingForPlayers', 'InProgress', 'Finished'].includes(gameState.gameStatus)
      ? gameState.gameStatus
      : 'WaitingForPlayers',
    bankBalance: gameState.bankBalance >= 0 ? gameState.bankBalance : 15140000,
    housesRemaining: gameState.housesRemaining >= 0 ? gameState.housesRemaining : 32,
    hotelsRemaining: gameState.hotelsRemaining >= 0 ? gameState.hotelsRemaining : 12,
    freeParkingPool: gameState.freeParkingPool >= 0 ? gameState.freeParkingPool : 0,
    activeTrades: Array.isArray(gameState.activeTrades) ? gameState.activeTrades : [],
    accountUpdatedAt: new Date()
  }
}

export const DEFAULT_GAME_VALUES = {
  BANK_BALANCE: 15140000,
  HOUSES_COUNT: 32,
  HOTELS_COUNT: 12,
  MAX_PLAYERS: 4,
  TIME_LIMIT: 300,
  FREE_PARKING_INITIAL: 0
}
