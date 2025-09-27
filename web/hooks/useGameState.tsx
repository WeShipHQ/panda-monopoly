import { Address } from "@solana/kit";
import { useGameState as useRealGameState } from "./useGameStatev2";
import { useFakeGameState } from "./useFakeGameState";

const USE_FAKE_DATA = true; // Set to false when smart contract is ready

interface UseGameStateConfig {
  enabled?: boolean;
  subscribeToUpdates?: boolean;
  onCardDrawEvent?: (event: any) => void;
}

interface UseGameStateResult {
  gameData: any;
  players: any[];
  properties: any[];
  error: any;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  playerCount: number;
  isSubscribed: boolean;
}

export function useGameState(
  gameAddress: Address | null | undefined,
  config: UseGameStateConfig = {}
): UseGameStateResult {
  if (USE_FAKE_DATA) {
    return useFakeGameState(gameAddress, config);
  } else {
    return useRealGameState(gameAddress, config);
  }
}