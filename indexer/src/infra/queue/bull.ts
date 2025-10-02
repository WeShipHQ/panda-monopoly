import { env } from '#config'
import { Queue, Worker, JobsOptions } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(env.redis.url)
export const opts: JobsOptions = { attempts: 5, backoff: { type: 'exponential', delay: 1000 } }

export const realtimeQueue = new Queue('realtime', { connection })
export const backfillQueue = new Queue('backfill', { connection })
export const writerQueue = new Queue('writer', { connection })

export { Worker }
