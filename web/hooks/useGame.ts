import { GameState, PlayerState } from "@/lib/sdk/generated";
import { sdk } from "@/lib/sdk/sdk";
import { GameAccount, PlayerAccount, PropertyAccount } from "@/types/types";
import { Address, createSolanaRpc, Rpc, SolanaRpcApi } from "@solana/kit";
import { useEffect, useRef, useCallback } from "react";
import useSWR from "swr";

interface UseGameConfig {
  enabled?: boolean;
  subscribeToUpdates?: boolean;
}

interface UseGameResult {
  data: GameAccount | null | undefined;
  error: any;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<GameAccount | null | undefined>;
  isSubscribed: boolean;
}

export function useGame(
  gameAddress: Address | null | undefined,
  config: UseGameConfig = {}
): UseGameResult {
  const { enabled = true, subscribeToUpdates = true } = config;

  const subscriptionRef = useRef<(() => void) | null>(null);
  const isSubscribedRef = useRef(false);
  const currentGameIdRef = useRef<string | number | null>(null);

  const cacheKey =
    enabled && gameAddress ? ["game", gameAddress.toString()] : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async ([_, id]) => {
      try {
        const rpc = createSolanaRpc("http://127.0.0.1:8899");
        const gameAccount = await sdk.getGameAccount(rpc, gameAddress!);

        if (!gameAccount) {
          return null;
        }

        return {
          ...gameAccount.data,
          address: gameAddress!,
        };

        // if (game?.gameStatus === GameStatus.InProgress) {
        //   try {
        //     return await sdk.getGameAccount(Number(id), true);
        //   } catch (_error) {
        //     return game;
        //   }
        // }
      } catch (error) {
        console.error("Error fetching game account:", error);
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

  const refetch = async (): Promise<GameAccount | null | undefined> => {
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

// --------------------------------------------------
interface UseGamePlayersConfig {
  enabled?: boolean;
  subscribeToUpdates?: boolean;
}

interface UseGamePlayersResult {
  data:
    | {
        players: PlayerAccount[];
        properties: PropertyAccount[];
      }
    | null
    | undefined;
  error: any;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<
    | {
        players: PlayerAccount[];
        properties: PropertyAccount[];
      }
    | null
    | undefined
  >;
  playerCount: number;
  gameData: any;
}

export function useGamePlayers(
  gameAddress: Address | null | undefined,
  config: UseGamePlayersConfig = {}
): UseGamePlayersResult {
  const { enabled = true, subscribeToUpdates = true } = config;

  const {
    data: gameData,
    isLoading: gameLoading,
    error: gameError,
    refetch: refetchGame,
  } = useGame(gameAddress, { enabled });

  const playerAddresses = gameData?.players || [];
  const playerCount = playerAddresses.length;

  // Create cache key based on game address and player addresses
  const cacheKey =
    enabled && gameAddress && playerAddresses.length > 0
      ? [
          "game-players",
          gameAddress.toString(),
          playerAddresses.map((addr) => addr.toString()).join(","),
        ]
      : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      if (!gameAddress || playerAddresses.length === 0) {
        return { players: [], properties: [] };
      }

      try {
        const rpc = createSolanaRpc("http://127.0.0.1:8899");

        const playerPromises = playerAddresses.map(
          async (playerAddress: Address) => {
            try {
              const pa = await sdk.getPlayerAccount(
                rpc,
                gameAddress,
                playerAddress
              );

              if (!pa) {
                return null;
              }

              return {
                ...pa.data,
                address: pa.address,
              };
            } catch (error) {
              console.error(
                `Error fetching player account for ${playerAddress}:`,
                error
              );
              return null;
            }
          }
        );

        const playerAccounts = await Promise.all(playerPromises);

        const players = playerAccounts.filter(
          (player): player is PlayerAccount => player !== null
        );

        const positions = players
          .map((player) => Array.from(player.propertiesOwned))
          .flatMap((item) => item);

        const propertyStates = await sdk.getPropertyStateAccounts(
          rpc,
          gameAddress,
          positions
        );

        const properties = (propertyStates || []).map(
          (propertyState) =>
            ({
              ...propertyState.data,
              address: propertyState.address,
            } as PropertyAccount)
        );

        return { players, properties };
      } catch (error) {
        console.error("Error fetching game players:", error);
        return { players: [], properties: [] };
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      refreshInterval: subscribeToUpdates ? 5_000 : 0, // Poll every 5 seconds if subscription is enabled
    }
  );

  const refetch = useCallback(async (): Promise<
    | {
        players: PlayerAccount[];
        properties: PropertyAccount[];
      }
    | null
    | undefined
  > => {
    await refetchGame();
    return await mutate();
  }, [mutate, refetchGame]);

  useEffect(() => {
    if (gameData && subscribeToUpdates) {
      mutate();
    }
  }, [
    gameData?.currentPlayers,
    gameData?.players?.length,
    mutate,
    subscribeToUpdates,
  ]);

  return {
    data: data,
    error: error || gameError,
    isLoading: isLoading || gameLoading,
    isError: !!(error || gameError),
    refetch,
    playerCount,
    gameData,
  };
}
