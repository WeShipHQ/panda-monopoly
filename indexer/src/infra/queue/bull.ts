import { env } from '#config'
import { Queue, Worker, JobsOptions, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'

export const connection = new IORedis(env.redis.url, {
  maxRetriesPerRequest: null
})

export const opts: JobsOptions = { attempts: 5, backoff: { type: 'exponential', delay: 1000 } }

export const realtimeQueue = new Queue('realtime', { connection })
export const backfillQueue = new Queue('backfill', { connection })
export const writerQueue = new Queue('writer', { connection })
export const writerDlq = new Queue('writer-dlq', { connection })

export const writerEvents = new QueueEvents('writer', { connection })
export const writerDlqEvents = new QueueEvents('writer-dlq', { connection })

export { Worker }
