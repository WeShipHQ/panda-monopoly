#!/usr/bin/env node

/**
 * Script to cleanup old "bull" prefixed queues from Redis
 * Run with: node scripts/cleanup-old-queues.js
 */

const IORedis = require('ioredis')

const redis = new IORedis(
  process.env.REDIS_URL ||
    'redis://default:OEI0ChHz56kWMd7wmAeY7WVBZ19sLmUW@redis-13183.c270.us-east-1-3.ec2.redns.redis-cloud.com:13183'
)

async function cleanupOldQueues() {
  try {
    console.log('🔍 Scanning for old "bull:*" keys...')

    const keys = await redis.keys('bull:*')

    if (keys.length === 0) {
      console.log('✅ No old "bull:*" keys found')
      return
    }

    console.log(`🗑️  Found ${keys.length} old keys to delete:`)
    keys.forEach((key) => console.log(`   - ${key}`))

    console.log('🧹 Deleting old keys...')
    await redis.del(...keys)

    console.log('✅ Cleanup completed!')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    redis.disconnect()
  }
}

cleanupOldQueues()
