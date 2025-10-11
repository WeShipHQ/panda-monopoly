/**
 * Shared Module Exports
 *
 * Centralized exports for all shared utilities, configurations, and mappers.
 * This provides a clean interface for consuming shared code across the indexer.
 *
 * @author Senior Engineer - Following Google Code Standards
 */

// Legacy exports - selective exports to avoid conflicts
export * from './api'
export { ResponseFormatter, ERROR_CODES, type ErrorCode } from './utils/response-formatter'
// export * from './exceptions'  // Removed - using service layer error handling

// NEW: Board configuration and utilities
export * from './config/board.config'

// NEW: Mapping utilities
export * from './mappers/property.utils'
export * from './mappers/log-parsers'
export * from './mappers/monopoly.mapper'
