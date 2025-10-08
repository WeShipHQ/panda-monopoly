/**
 * Monopoly Mapper - Refactored Entry Point
 *
 * This file has been completely refactored for better maintainability:
 *
 * NEW MODULAR ARCHITECTURE:
 * - /shared/config/board.config.ts - Board configuration and constants
 * - /shared/mappers/property.utils.ts - Property-related utilities
 * - /shared/mappers/log-parsers.ts - Log parsing functions
 * - /shared/mappers/monopoly.mapper.ts - Main mapping logic
 *
 * BENEFITS:
 * ✅ Clean separation of concerns
 * ✅ High reusability across components
 * ✅ Better testability and maintainability
 * ✅ Clear naming conventions following Google senior dev standards
 *
 * @author Senior Engineer - Following Google Code Standards
 */

// Re-export the new modular mapper
export { mapTxToMonopolyRecords } from '#shared/mappers/monopoly.mapper'

// Re-export utilities for external use
export * from '#shared/config/board.config'
export * from '#shared/mappers/property.utils'
export * from '#shared/mappers/log-parsers'
