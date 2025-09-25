import { GameState } from "@/lib/sdk/generated";
import { sdk } from "@/lib/sdk/sdk";
import { GameAccount } from "@/types/schema";
import useSWR from "swr";
// import { GameAccount } from "@checkmate/sdk";
// import { useSdk } from "./use-sdk";

interface UseGamesConfig {
  enabled?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: number) => void;
}

interface UseGamesResult {
  data: GameAccount[] | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<GameAccount[] | undefined>;
}

export function useGames(config: UseGamesConfig = {}): UseGamesResult {
  const { enabled = true } = config;

  const cacheKey = enabled ? ["game-list"] : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    () => {
      return sdk.getGames();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  const refetch = async (): Promise<GameAccount[] | undefined> => {
    return await mutate();
  };

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    refetch,
  };
}
