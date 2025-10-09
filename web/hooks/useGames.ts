import { useRpcContext } from "@/components/providers/rpc-provider";
import { sdk } from "@/lib/sdk/sdk";
import { GameAccount } from "@/types/schema";
import useSWR from "swr";

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
  const { rpc, erRpc } = useRpcContext();

  const cacheKey = enabled ? ["game-list"] : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      const allGames = await Promise.all([
        sdk.getGameAccounts(rpc),
        sdk.getGameAccounts(erRpc),
      ]);
      console.log(allGames);
      return allGames.flat().sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
        if (b.createdAt > a.createdAt) {
          return 1;
        }
        return 0;
      });
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
