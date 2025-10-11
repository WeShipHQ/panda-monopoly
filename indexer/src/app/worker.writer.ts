// Bull worker: upsert into DB
import { Worker, writerDlq, writerEvents, workerBaseOpts } from '#infra/queue/bull'
import type { MonopolyRecord, WriterJob } from '#infra/queue/types'
import type { DatabasePort } from '#infra/db/db.port'
import { logger } from '#utils/logger'
import { metrics } from '#infra/metrics/metrics'
import { BlockchainAccountFetcher } from '#infra/rpc/account-fetcher'

/**
 * Enrich monopoly record with actual blockchain account data
 */
async function enrichRecordWithBlockchainData(record: MonopolyRecord): Promise<MonopolyRecord> {
  const fetcher = new BlockchainAccountFetcher()

  try {
    // Enrich gameState records with enhanced blockchain data
    if (record.kind === 'gameState' && record.data.gameId === -1) {
      logger.info(`🔍 Fetching enhanced game data for: ${record.data.pubkey}`)

      const enhancedData = await fetcher.fetchEnhancedGameData(record.data.pubkey)
      if (enhancedData) {
        // Update with all enhanced blockchain data
        record.data.gameId = enhancedData.gameId
        record.data.configId = enhancedData.configId !== 'UNKNOWN' ? enhancedData.configId : record.data.configId
        record.data.authority = enhancedData.authority !== 'UNKNOWN' ? enhancedData.authority : record.data.authority
        record.data.currentPlayers = enhancedData.currentPlayers
        record.data.currentTurn = enhancedData.currentTurn
        record.data.housesRemaining = enhancedData.housesRemaining
        record.data.hotelsRemaining = enhancedData.hotelsRemaining
        record.data.nextTradeId = enhancedData.nextTradeId
        record.data.activeTrades = enhancedData.activeTrades

        logger.info(
          `🎮 Enhanced gameState: gameId=${enhancedData.gameId}, players=${enhancedData.currentPlayers}, houses=${enhancedData.housesRemaining}`
        )
      } else {
        logger.warn(`⚠️ Could not fetch enhanced game data for ${record.data.pubkey}`)
      }
    }

    // Enrich platformConfig records with enhanced data
    if (record.kind === 'platformConfig') {
      logger.info(`⚙️ Fetching enhanced platform config: ${record.data.pubkey}`)

      const enhancedPlatformData = await fetcher.fetchEnhancedPlatformData(record.data.pubkey)
      if (enhancedPlatformData) {
        // Update with all enhanced platform data
        record.data.authority =
          enhancedPlatformData.authority !== 'UNKNOWN' ? enhancedPlatformData.authority : record.data.authority
        record.data.totalGamesCreated = enhancedPlatformData.totalGamesCreated
        record.data.nextGameId = enhancedPlatformData.nextGameId
        record.data.feeBasisPoints = enhancedPlatformData.feeBasisPoints

        logger.info(
          `⚙️ Enhanced platform config: totalGames=${enhancedPlatformData.totalGamesCreated}, nextGameId=${enhancedPlatformData.nextGameId}, fee=${enhancedPlatformData.feeBasisPoints}`
        )
      } else {
        logger.warn(`⚠️ Could not fetch enhanced platform data for ${record.data.pubkey}`)
      }
    }

    // Enrich playerState records with enhanced data
    if (record.kind === 'playerState') {
      logger.info(`👤 Fetching enhanced player data: ${record.data.pubkey}`)

      const enhancedPlayerData = await fetcher.fetchEnhancedPlayerData(record.data.pubkey)
      if (enhancedPlayerData) {
        // Update with enhanced player data
        record.data.wallet = enhancedPlayerData.wallet !== 'UNKNOWN' ? enhancedPlayerData.wallet : record.data.wallet
        record.data.game = enhancedPlayerData.game !== 'UNKNOWN' ? enhancedPlayerData.game : record.data.game
        record.data.cashBalance = enhancedPlayerData.cashBalance
        record.data.position = enhancedPlayerData.position
        record.data.inJail = enhancedPlayerData.inJail
        record.data.jailTurns = enhancedPlayerData.jailTurns
        record.data.doublesCount = enhancedPlayerData.doublesCount
        record.data.isBankrupt = enhancedPlayerData.isBankrupt
        record.data.netWorth = enhancedPlayerData.netWorth
        record.data.propertiesOwned = enhancedPlayerData.propertiesOwned
        record.data.lastRentCollected = enhancedPlayerData.lastRentCollected

        logger.info(
          `👤 Enhanced player: cash=${enhancedPlayerData.cashBalance}, position=${enhancedPlayerData.position}, netWorth=${enhancedPlayerData.netWorth}`
        )
      } else {
        logger.warn(`⚠️ Could not fetch enhanced player data for ${record.data.pubkey}`)
      }
    }

    // Enrich propertyState records with enhanced data
    if (record.kind === 'propertyState') {
      logger.info(`🏠 Fetching enhanced property data: ${record.data.pubkey}`)

      const enhancedPropertyData = await fetcher.fetchEnhancedPropertyData(record.data.pubkey)
      if (enhancedPropertyData) {
        // Update with enhanced property data
        record.data.position = enhancedPropertyData.position
        record.data.game = enhancedPropertyData.game !== 'UNKNOWN' ? enhancedPropertyData.game : record.data.game
        record.data.owner = enhancedPropertyData.owner
        record.data.price = enhancedPropertyData.price
        record.data.houses = enhancedPropertyData.houses
        record.data.hasHotel = enhancedPropertyData.hasHotel
        record.data.isMortgaged = enhancedPropertyData.isMortgaged
        record.data.rentBase = enhancedPropertyData.rentBase
        record.data.rentWithColorGroup = enhancedPropertyData.rentWithColorGroup
        record.data.rentWithHouses = enhancedPropertyData.rentWithHouses.slice(0, 4) as [number, number, number, number]
        record.data.rentWithHotel = enhancedPropertyData.rentWithHotel
        record.data.houseCost = enhancedPropertyData.houseCost
        record.data.mortgageValue = enhancedPropertyData.mortgageValue
        record.data.lastRentPaid = enhancedPropertyData.lastRentPaid

        logger.info(
          `🏠 Enhanced property: pos=${enhancedPropertyData.position}, price=${enhancedPropertyData.price}, owner=${enhancedPropertyData.owner ? 'owned' : 'available'}`
        )
      } else {
        logger.warn(`⚠️ Could not fetch enhanced property data for ${record.data.pubkey}`)
      }
    }
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        recordKind: record.kind,
        recordPubkey: record.data.pubkey
      },
      `❌ Error enriching record with blockchain data`
    )
    // Continue with original record if blockchain fetch fails
  }

  return record
}

export function startWriterWorker(db: DatabasePort) {
  const worker = new Worker<WriterJob>(
    'writer',
    async (job) => {
      const { record } = job.data

      const handle = async (record: MonopolyRecord) => {
        // Fetch actual blockchain data for records with placeholder values
        const enrichedRecord = await enrichRecordWithBlockchainData(record)

        switch (enrichedRecord.kind) {
          case 'gameState':
            return db.upsertGameState(enrichedRecord.data)
          case 'platformConfig':
            return db.upsertPlatformConfig(enrichedRecord.data)
          case 'playerState':
            return db.upsertPlayerState(enrichedRecord.data)
          case 'propertyState':
            return db.upsertPropertyState(enrichedRecord.data)
          case 'tradeState':
            return db.upsertTradeState(enrichedRecord.data)
          case 'auctionState':
            return db.upsertAuctionState(enrichedRecord.data)
        }
      }

      logger.info(`Processing ${record.kind} record in writer worker`)
      const stopTimer = metrics.startTimer('writer:duration')
      try {
        const recordData = record.data as { pubkey?: string } | undefined
        logger.info(
          {
            kind: record.kind,
            pubkey: recordData?.pubkey,
            hasValidData: !!record.data
          },
          `About to call handle for record`
        )
        await handle(record)
        await metrics.incr('writer:processed')
        logger.info(
          {
            kind: record.kind,
            pubkey: recordData?.pubkey
          },
          `✅ Successfully processed record in database`
        )
      } catch (err: unknown) {
        const error = err as { message?: string; stack?: string }
        const recordData = record.data as { pubkey?: string } | undefined
        logger.error(
          {
            kind: record.kind,
            error: error.message,
            stack: error.stack,
            pubkey: recordData?.pubkey
          },
          `❌ Failed to process record`
        )
        metrics.incr('writer:failed')
        // đẩy vào DLQ, kèm lý do và đếm số lần replay
        await writerDlq.add('dlq', job.data, { jobId: job.id ?? undefined })
        throw err // để BullMQ mark failed
      } finally {
        stopTimer() // histogram
      }
    },
    workerBaseOpts
  )

  writerEvents.on('completed', async () => metrics.incr('writer:completed'))
  writerEvents.on('failed', async () => metrics.incr('writer:failed:event'))

  logger.info('Writer worker (Monopoly) started')
  return worker
}
