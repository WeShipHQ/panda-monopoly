import { env } from '#config'
import { bullJobDefaults, bullLimiter } from '#config/env'
import { Queue, Worker, QueueEvents, QueueOptions, WorkerOptions } from 'bullmq'
import IORedis from 'ioredis'

export const connection = new IORedis(env.redis.url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: false
})

const baseQueueOpts: Omit<QueueOptions, 'connection'> = {
  prefix: env.bullmq.prefix
}

const queueOpts = {
  connection,
  prefix: env.bullmq.prefix,
  defaultJobOptions: bullJobDefaults,
  ...(bullLimiter ? { limiter: bullLimiter } : {})
}

export function createQueue(name: string) {
  return new Queue(name, { connection, ...baseQueueOpts })
}
export function createQueueEvents(name: string) {
  return new QueueEvents(name, { connection, ...baseQueueOpts })
}
const baseWorkerOpts = {
  connection,
  prefix: env.bullmq.prefix
}

export function createWorker<Name extends string, Data = any>(
  name: Name,
  processor: (job: any) => Promise<any> | any,
  opts: Partial<WorkerOptions> = {}
) {
  return new Worker<Data>(name, processor, { ...baseWorkerOpts, ...opts })
}

export const realtimeQueue = new Queue('realtime', queueOpts)
export const backfillQueue = new Queue('backfill', queueOpts)
export const writerQueue = new Queue('writer', queueOpts)
export const writerDlq = new Queue('writer-dlq', queueOpts)

export const writerEvents = new QueueEvents('writer', { connection, prefix: env.bullmq.prefix })
export const writerDlqEvents = new QueueEvents('writer-dlq', { connection, prefix: env.bullmq.prefix })

export const workerBaseOpts = baseWorkerOpts

export { Worker }
