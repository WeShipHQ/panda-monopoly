import env from './env'

export default {
  config: {
    commitment: env.solana.commitment,
    wsEndpoint: env.solana.wsUrl,
    rateLimit: env.solana.rateLimit
  }
}
