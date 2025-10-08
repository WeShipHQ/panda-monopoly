import { env } from '#config'
import { Connection } from '@solana/web3.js'
import { CircuitBreaker } from '#utils/circuit-breaker'
import { logger } from '#utils/logger'

interface RpcEndpoint {
  url: string
  connection: Connection
  circuitBreaker: CircuitBreaker
  priority: number
  lastUsed: number
  totalRequests: number
  totalErrors: number
}

export class RpcPool {
  private endpoints: RpcEndpoint[] = []

  constructor() {
    this.initializeEndpoints()
  }

  private initializeEndpoints() {
    // Primary RPC (highest priority)
    this.addEndpoint(env.solana.rpcUrl, 1)

    // Backup RPCs (lower priority)
    env.solana.backupRpcUrls.forEach((url, index) => {
      this.addEndpoint(url, 2 + index)
    })

    logger.info(`RPC Pool initialized with ${this.endpoints.length} endpoints`)
  }

  private addEndpoint(url: string, priority: number) {
    const connection = new Connection(url, {
      commitment: env.solana.commitment as any,
      confirmTransactionInitialTimeout: 30000, // 30s timeout
      httpHeaders: {
        'User-Agent': 'monopoly-indexer/1.0'
      }
    })

    const circuitBreaker = new CircuitBreaker({
      name: `rpc-${this.endpoints.length}`,
      failureThreshold: 5, // Open after 5 failures
      resetTimeout: 30000, // Try again after 30 seconds
      successThreshold: 2 // Need 2 successes to close
    })

    this.endpoints.push({
      url,
      connection,
      circuitBreaker,
      priority,
      lastUsed: 0,
      totalRequests: 0,
      totalErrors: 0
    })
  }

  /**
   * Get the best available RPC endpoint
   */
  getHealthyEndpoint(): { connection: Connection; endpoint: RpcEndpoint } | null {
    // Sort by priority and health
    const availableEndpoints = this.endpoints
      .filter((endpoint) => endpoint.circuitBreaker.getState() !== 'OPEN')
      .sort((a, b) => {
        // First by priority (lower number = higher priority)
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        // Then by least recently used
        return a.lastUsed - b.lastUsed
      })

    if (availableEndpoints.length === 0) {
      logger.error('No healthy RPC endpoints available!')
      return null
    }

    const endpoint = availableEndpoints[0]
    endpoint.lastUsed = Date.now()
    endpoint.totalRequests++

    return { connection: endpoint.connection, endpoint }
  }

  /**
   * Execute a function with automatic RPC failover
   */
  async executeWithFailover<T>(
    fn: (connection: Connection) => Promise<T>,
    operation: string,
    maxRetries = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const rpcData = this.getHealthyEndpoint()
      if (!rpcData) throw new Error('No healthy RPC endpoints available')

      const { connection, endpoint } = rpcData
      try {
        const result = await endpoint.circuitBreaker.execute(() => fn(connection))
        logger.debug(`RPC ${operation} success via ${endpoint.url} (attempt ${attempt + 1})`)
        return result
      } catch (error: any) {
        lastError = error
        endpoint.totalErrors++

        const msg = String(error?.message ?? '')
        const isRateLimit = error?.code === 429 || msg.includes('429') || msg.includes('Too Many Requests')
        const isRetryable =
          isRateLimit ||
          msg.includes('Failed to query long-term storage') || // -32019 (backfill hay gặp)
          msg.includes('ETIMEDOUT') ||
          msg.includes('ECONNRESET')

        if (isRateLimit) {
          logger.warn(`RPC ${operation} rate limited on ${endpoint.url} (attempt ${attempt + 1}/${maxRetries})`)
          await this.sleep(Math.min(1000 * Math.pow(2, attempt), 5000))
        } else if (isRetryable) {
          logger.warn(
            `RPC ${operation} transient error on ${endpoint.url}: ${msg} (attempt ${attempt + 1}/${maxRetries})`
          )
          await this.sleep(Math.min(500 * Math.pow(2, attempt), 3000))
        } else {
          logger.warn(`RPC ${operation} failed on ${endpoint.url}: ${msg} (attempt ${attempt + 1}/${maxRetries})`)
        }
      }
    }

    logger.error(`RPC ${operation} failed on all endpoints after ${maxRetries} attempts`)
    throw lastError || new Error(`RPC ${operation} failed on all endpoints`)
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return this.endpoints.map((endpoint) => ({
      url: endpoint.url,
      priority: endpoint.priority,
      state: endpoint.circuitBreaker.getState(),
      totalRequests: endpoint.totalRequests,
      totalErrors: endpoint.totalErrors,
      errorRate:
        endpoint.totalRequests > 0 ? ((endpoint.totalErrors / endpoint.totalRequests) * 100).toFixed(2) + '%' : '0%',
      lastUsed: endpoint.lastUsed ? new Date(endpoint.lastUsed).toISOString() : 'never'
    }))
  }

  /**
   * Reset all circuit breakers (useful for manual recovery)
   */
  resetAllCircuitBreakers() {
    this.endpoints.forEach((endpoint) => {
      endpoint.circuitBreaker.reset()
    })
    logger.info('All RPC circuit breakers reset')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const rpcPool = new RpcPool()
