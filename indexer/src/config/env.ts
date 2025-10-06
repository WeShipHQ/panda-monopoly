import { Static, Type } from '@sinclair/typebox'
import envSchema from 'env-schema'

enum NodeEnv {
  development = 'development',
  production = 'production'
}

export enum LogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error'
}

enum QueueProfile {
  tiny = 'tiny',
  small = 'small',
  standard = 'standard',
  large = 'large'
}

const schema = Type.Object({
  // Database
  DATABASE_URL: Type.String(),

  // Redis
  REDIS_URL: Type.String({ default: 'redis://localhost:6379' }),

  // Server
  LOG_LEVEL: Type.Enum(LogLevel),
  NODE_ENV: Type.Enum(NodeEnv),
  HOST: Type.String({ default: 'localhost' }),
  PORT: Type.Number({ default: 8080 }),

  // Indexer
  BACKFILL_ENABLED: Type.Boolean({ default: false }),
  REALTIME_ENABLED: Type.Boolean({ default: true }),
  BACKFILL_START_SLOT: Type.Number({ default: 0 }),

  // DLQ replayer
  DLQ_MAX_REPLAYS: Type.Number({ default: 3 }),
  DLQ_REPLAY_DELAY_MS: Type.Number({ default: 30000 }),

  // Backfill throttling (optional)
  BACKFILL_BATCH_LIMIT: Type.Number({ default: 150 }),
  BACKFILL_QUEUE_THRESHOLD: Type.Number({ default: 20000 }),
  BACKFILL_BATCH_SLEEP_MS: Type.Number({ default: 400 }),

  // Solana RPC
  SOLANA_PROGRAM_ID: Type.String(),
  SOLANA_RPC: Type.String(),
  SOLANA_WS: Type.Optional(Type.String()),
  SOLANA_ER_RPCL: Type.Optional(Type.String()),
  SOLANA_ER_WSL: Type.Optional(Type.String()),
  SOLANA_COMMITMENT: Type.String({ default: 'confirmed' }),
  SOLANA_BACKUP_RPC_URLS: Type.Optional(Type.String()),
  SOLANA_RATE_LIMIT: Type.Optional(Type.Number({ default: 100 })),

  // BullMQ (Redis-based job queue)
  // Memory profiles: tiny/small/standard/large
  QUEUE_MEMORY_PROFILE: Type.Enum(QueueProfile, { default: QueueProfile.tiny }),
  BULLMQ_PREFIX: Type.String({ default: 'monopoly' }),
  BULLMQ_LIMITER_MAX: Type.Optional(Type.Number()),
  BULLMQ_LIMITER_DURATION: Type.Optional(Type.Number()),
  BULLMQ_ATTEMPTS: Type.Optional(Type.Number()),
  BULLMQ_BACKOFF_MS: Type.Optional(Type.Number()),
  BULLMQ_REMOVE_ON_COMPLETE: Type.Optional(Type.Number()),
  BULLMQ_REMOVE_ON_FAIL: Type.Optional(Type.Number()),
  PARSER_CONCURRENCY: Type.Optional(Type.Number()),
  BACKFILL_LIMIT: Type.Optional(Type.Number())
})

const raw = envSchema<Static<typeof schema>>({
  dotenv: true,
  schema
})

const preset = tuneByProfile(raw.QUEUE_MEMORY_PROFILE)

function tuneByProfile(profile: QueueProfile) {
  switch (profile) {
    case QueueProfile.tiny:
      return {
        attempts: 3,
        backoffMs: 1000,
        removeOnComplete: 200,
        removeOnFail: 50,
        concurrency: 1,
        backfillLimit: 300,
        backfillSleep: 300,
        limiterMax: undefined,
        limiterDuration: undefined
      }
    case QueueProfile.small:
      return {
        attempts: 3,
        backoffMs: 800,
        removeOnComplete: 1000,
        removeOnFail: 100,
        concurrency: 2,
        backfillLimit: 800,
        backfillSleep: 200,
        limiterMax: 30,
        limiterDuration: 1000
      }
    case QueueProfile.standard:
      return {
        attempts: 5,
        backoffMs: 500,
        removeOnComplete: 5000,
        removeOnFail: 500,
        concurrency: 4,
        backfillLimit: 1500,
        backfillSleep: 100,
        limiterMax: 60,
        limiterDuration: 1000
      }
    case QueueProfile.large:
      return {
        attempts: 5,
        backoffMs: 400,
        removeOnComplete: 20000,
        removeOnFail: 1000,
        concurrency: 8,
        backfillLimit: 2000,
        backfillSleep: 60,
        limiterMax: 120,
        limiterDuration: 1000
      }
  }
}

// Apply presets with override from environment variables
const tune = {
  attempts: raw.BULLMQ_ATTEMPTS ?? preset.attempts,
  backoffMs: raw.BULLMQ_BACKOFF_MS ?? preset.backoffMs,
  removeOnComplete: raw.BULLMQ_REMOVE_ON_COMPLETE ?? preset.removeOnComplete,
  removeOnFail: raw.BULLMQ_REMOVE_ON_FAIL ?? preset.removeOnFail,
  concurrency: raw.PARSER_CONCURRENCY ?? preset.concurrency,
  backfillLimit: raw.BACKFILL_LIMIT ?? preset.backfillLimit,
  backfillSleep: raw.BACKFILL_BATCH_SLEEP_MS ?? preset.backfillSleep,
  limiterMax: raw.BULLMQ_LIMITER_MAX ?? preset.limiterMax,
  limiterDuration: raw.BULLMQ_LIMITER_DURATION ?? preset.limiterDuration
}

export const bullJobDefaults = {
  attempts: tune.attempts,
  backoff: { type: 'exponential' as const, delay: tune.backoffMs },
  removeOnComplete: tune.removeOnComplete,
  removeOnFail: tune.removeOnFail
}

// Limiter cho Queue (nếu có)
export const bullLimiter =
  tune.limiterMax && tune.limiterDuration ? { max: tune.limiterMax, duration: tune.limiterDuration } : undefined

export default {
  nodeEnv: raw.NODE_ENV,
  isDevelopment: raw.NODE_ENV === NodeEnv.development,

  log: {
    level: raw.LOG_LEVEL
  },

  server: {
    host: raw.HOST,
    port: raw.PORT
  },

  db: {
    url: raw.DATABASE_URL
  },

  redis: {
    url: raw.REDIS_URL
  },

  indexer: {
    backfillEnabled: raw.BACKFILL_ENABLED,
    realtimeEnabled: raw.REALTIME_ENABLED,
    backfillStartSlot: raw.BACKFILL_START_SLOT
  },

  dlq: {
    maxReplays: raw.DLQ_MAX_REPLAYS,
    replayDelayMs: raw.DLQ_REPLAY_DELAY_MS
  },

  backfill: {
    batchLimit: raw.BACKFILL_BATCH_LIMIT,
    queueThreshold: raw.BACKFILL_QUEUE_THRESHOLD,
    batchSleepMs: raw.BACKFILL_BATCH_SLEEP_MS
  },

  solana: {
    rpcUrl: raw.SOLANA_RPC,
    wsUrl: raw.SOLANA_WS || raw.SOLANA_RPC.replace('https://', 'wss://'),
    erRpcUrl: raw.SOLANA_ER_RPCL,
    erWsUrl: raw.SOLANA_ER_WSL || (raw.SOLANA_ER_RPCL ? raw.SOLANA_ER_RPCL.replace('https://', 'wss://') : undefined),
    commitment: raw.SOLANA_COMMITMENT,
    programId: raw.SOLANA_PROGRAM_ID,
    backupRpcUrls: raw.SOLANA_BACKUP_RPC_URLS ? raw.SOLANA_BACKUP_RPC_URLS.split(',') : [],
    rateLimit: raw.SOLANA_RATE_LIMIT || 100,
    batchSize: 100
  },

  // BullMQ configuration
  bullmq: {
    prefix: raw.BULLMQ_PREFIX,
    jobDefaults: bullJobDefaults,
    limiter: bullLimiter
  },

  // Tuning configuration
  tune: tune
}
