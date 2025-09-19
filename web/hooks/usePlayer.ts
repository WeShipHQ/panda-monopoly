import { PlayerState } from "@/lib/sdk/generated";
import { sdk } from "@/lib/sdk/sdk";
import { Address, createSolanaRpc, Rpc, SolanaRpcApi } from "@solana/kit";
import { useEffect, useRef, useCallback } from "react";
import useSWR from "swr";
// import { GameAccount, GameStatus, getGameAccountPDA } from "@checkmate/sdk";
// import { useSdk } from "./use-sdk";

interface UsePlayerConfig {
  enabled?: boolean;
  subscribeToUpdates?: boolean;
}

interface UsePlayerResult {
  data: PlayerState | null | undefined;
  error: any;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<PlayerState | null | undefined>;
  isSubscribed: boolean;
}

export function usePlayer(
  gameAddress: Address | null | undefined,
  playerAddress: Address | null | undefined,
  config: UsePlayerConfig = {}
): UsePlayerResult {
  const { enabled = true, subscribeToUpdates = true } = config;
  //   const { sdk } = useSdk();

  const subscriptionRef = useRef<(() => void) | null>(null);
  const isSubscribedRef = useRef(false);
  const currentGameIdRef = useRef<string | number | null>(null);

  const cacheKey =
    enabled && gameAddress && playerAddress
      ? ["player", gameAddress.toString(), playerAddress.toString()]
      : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      try {
        const rpc = createSolanaRpc("http://127.0.0.1:8899");
        const playerAccount = await sdk.getPlayerAccount(
          rpc,
          gameAddress!,
          playerAddress!
        );

        // if (game?.gameStatus === GameStatus.InProgress) {
        //   try {
        //     return await sdk.getGameAccount(Number(id), true);
        //   } catch (_error) {
        //     return game;
        //   }
        // }

        return playerAccount;
      } catch (error) {
        console.error("Error fetching player account:", error);
        return null;
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    }
  );

  //   const cleanupSubscription = useCallback(() => {
  //     if (subscriptionRef.current) {
  //       subscriptionRef.current();
  //       subscriptionRef.current = null;
  //       isSubscribedRef.current = false;
  //     }
  //   }, []);

  //   useEffect(() => {
  //     cleanupSubscription();

  //     // Only subscribe if:
  //     // 1. Subscription is enabled
  //     // 2. We have game data
  //     // 3. Game is in progress
  //     // 4. We have a wallet
  //     if (
  //       !subscribeToUpdates ||
  //       !data ||
  //       data.gameStatus === GameStatus.Finished ||
  //       data.gameStatus === GameStatus.Cancelled ||
  //       data.gameStatus === GameStatus.Disputed ||
  //       data.gameStatus === GameStatus.TimedOut ||
  //       !enabled
  //     ) {
  //       return;
  //     }

  //     console.log(`Setting up subscription for game ${gameId}`);

  //     const unsubscribe = sdk.subscribeToGameAccount(
  //       Number(gameId),
  //       async (gameAccount) => {
  //         if (!gameAccount) {
  //           return;
  //         }
  //         try {
  //           mutate(gameAccount, false); // false = don't revalidate
  //         } catch (error) {
  //           console.error("Error processing subscription update:", error);
  //         }
  //       },
  //       data.gameStatus === GameStatus.InProgress
  //     );

  //     subscriptionRef.current = unsubscribe;
  //     isSubscribedRef.current = true;
  //     currentGameIdRef.current = gameId;

  //     return () => {
  //       cleanupSubscription();
  //     };
  //   }, [
  //     data,
  //     gameId,
  //     subscribeToUpdates,
  //     enabled,
  //     getGameAccountPDA,
  //     mutate,
  //     cleanupSubscription,
  //   ]);

  //   useEffect(() => {
  //     return () => {
  //       cleanupSubscription();
  //     };
  //   }, [cleanupSubscription]);

  //   useEffect(() => {
  //     if (
  //       currentGameIdRef.current !== null &&
  //       currentGameIdRef.current !== gameId
  //     ) {
  //       cleanupSubscription();
  //     }
  //   }, [gameId, cleanupSubscription]);

  const refetch = async (): Promise<PlayerState | null | undefined> => {
    return await mutate();
  };

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    refetch,
    isSubscribed: isSubscribedRef.current,
  };
}
