import { env } from '#config'
import IORedis from 'ioredis'

class Metrics {
  private r = new IORedis(env.redis.url)
  private ns(key: string) {
    return `metrics:${key}`
  }

  async incr(key: string, by = 1) {
    await this.r.incrby(this.ns(key), by)
  }
  async get(key: string) {
    const v = await this.r.get(this.ns(key))
    return Number(v ?? 0)
  }
  async dump() {
    const keys = await this.r.keys(this.ns('*'))
    const out: Record<string, number> = {}
    for (const k of keys) {
      const v = await this.r.get(k)
      out[k.replace(/^metrics:/, '')] = Number(v ?? 0)
    }
    return out
  }
}
export const metrics = new Metrics()
