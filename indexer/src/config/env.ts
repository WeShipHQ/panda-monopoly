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

  // Solana RPC
  SOLANA_PROGRAM_ID: Type.String(),
  SOLANA_RPC: Type.String(),
  SOLANA_WS: Type.Optional(Type.String()),
  SOLANA_ER_RPCL: Type.Optional(Type.String()),
  SOLANA_ER_WSL: Type.Optional(Type.String()),
  SOLANA_COMMITMENT: Type.String({ default: 'confirmed' }),
  SOLANA_BACKUP_RPC_URLS: Type.Optional(Type.String()),
  SOLANA_RATE_LIMIT: Type.Optional(Type.Number({ default: 100 }))
})

const env = envSchema<Static<typeof schema>>({
  dotenv: true,
  schema
})

export default {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === NodeEnv.development,

  log: {
    level: env.LOG_LEVEL
  },

  server: {
    host: env.HOST,
    port: env.PORT
  },

  db: {
    url: env.DATABASE_URL
  },

  redis: {
    url: env.REDIS_URL
  },

  indexer: {
    backfillEnabled: env.BACKFILL_ENABLED,
    realtimeEnabled: env.REALTIME_ENABLED,
    backfillStartSlot: env.BACKFILL_START_SLOT
  },

  solana: {
    rpcUrl: env.SOLANA_RPC,
    wsUrl: env.SOLANA_WS || env.SOLANA_RPC.replace('https://', 'wss://'),
    erRpcUrl: env.SOLANA_ER_RPCL,
    erWsUrl: env.SOLANA_ER_WSL || (env.SOLANA_ER_RPCL ? env.SOLANA_ER_RPCL.replace('https://', 'wss://') : undefined),
    commitment: env.SOLANA_COMMITMENT,
    programId: env.SOLANA_PROGRAM_ID,
    backupRpcUrls: env.SOLANA_BACKUP_RPC_URLS ? env.SOLANA_BACKUP_RPC_URLS.split(',') : [],
    rateLimit: env.SOLANA_RATE_LIMIT || 100,
    batchSize: 100
  }
}
