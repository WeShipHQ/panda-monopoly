import { address } from "@solana/kit";
import envConfig from "./env";

export const DELEGATION_PROGRAM_ID = address(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);

export const DEFAULT_EPHEMERAL_QUEUE = address(
  "5hBR571xnXppuCPveTrctfTU7tJLSN94nq7kv7FRK5Tc"
);

export const VRF_PROGRAM_IDENTITY = address(
  "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw"
);

export const PLATFORM_ID = address(
  // "8woHMJSrVW3nEbv19PCnMkenVyyLpgoS6XGeDeTBhLpb"
  "GgUmA1zccSggfKxPsxmEAjzTrHekFeShobfFKNvqAS6n"
);

export const MEV_TAX_POSITION = 4;
export const PRIORITY_FEE_TAX_POSITION = 38;
export const JAIL_FINE = 50;

export const USE_VRF = false;

export const API_CONFIG = {
  BASE_URL: envConfig.NEXT_PUBLIC_INDEXER_API_URL,
  ENDPOINTS: {
    GAME_LOGS: "/game-logs",
    GAMES: "/games", 
    HEALTH: "/health",
    LEADERBOARD: "/leaderboard",
  },
  DEFAULT_QUERY_OPTIONS: {
    PAGE: 1,
    LIMIT: 100,
    SORT_BY: "timestamp",
    SORT_ORDER: "asc" as const,
  },
  TIMEOUTS: {
    DEFAULT: 10000,
    HEALTH_CHECK: 5000,
    UPLOAD: 30000,
  },
} as const;


export const GAME_LOG_CONFIG = {
  MAX_EVENTS_IN_MEMORY: 50,
  DEFAULT_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,  
  MAX_RETRY_DELAY: 10000,
  BATCH_SIZE: 20,
  AUTO_REFRESH_INTERVAL: 30000,
} as const;


export const ERROR_MESSAGES = {
  GAME_ID_REQUIRED: "Game ID is required",
  FAILED_TO_CREATE_LOG: "Failed to create game log",
  FAILED_TO_LOAD_LOGS: "Failed to load logs",
  NO_DATA_RETURNED: "No data returned from API",
  NETWORK_ERROR: "Network error occurred", 
  INVALID_RESPONSE: "Invalid response from server",
  TIMEOUT_ERROR: "Request timed out",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "Internal server error",
} as const;
