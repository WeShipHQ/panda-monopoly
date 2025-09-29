import { useRpcContext } from "@/components/providers/rpc-provider";
import { DELEGATION_PROGRAM_ID } from "@/configs/constants";
import { GameStatus } from "@/lib/sdk/generated";
import { sdk } from "@/lib/sdk/sdk";
import { GameEvent } from "@/lib/sdk/types";
import {
  GameAccount,
  mapGameStateToAccount,
  mapPlayerStateToAccount,
  mapPropertyStateToAccount,
  PlayerAccount,
  PropertyAccount,
} from "@/types/schema";
import { address, Address } from "@solana/kit";
import { useCallback, useEffect, useRef } from "react";
import useSWR from "swr";

interface UseGameStateConfig {
  enabled?: boolean;
  subscribeToUpdates?: boolean;
  onCardDrawEvent?: (event: GameEvent) => void;
}

interface UseGameStateResult {
  gameData: GameAccount | null | undefined;
  players: PlayerAccount[];
  properties: PropertyAccount[];
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
  const { enabled = true, subscribeToUpdates = true, onCardDrawEvent } = config;

  // Subscription management refs
  const gameSubscriptionRef = useRef<(() => void) | null>(null);
  const playerSubscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const isSubscribedRef = useRef(false);
  const currentGameAddressRef = useRef<string | null>(null);
  const currentPlayerAddressesRef = useRef<string[]>([]);
  const currentEventSubscriptionRef = useRef<(() => void) | null>(null);

  const { rpc, erRpc, rpcSubscriptions, erRpcSubscriptions } = useRpcContext();

  const cacheKey =
    enabled && gameAddress ? ["game-state", gameAddress.toString()] : null;

  const { data, error, isLoading, mutate } = useSWR(
    cacheKey,
    async () => {
      console.log("fetch game state", gameAddress);
      if (!gameAddress) {
        return { gameData: null, players: [], properties: [] };
      }

      try {
        // Step 1: Fetch game account data
        let gameState = await sdk.getGameAccount(rpc, gameAddress);
        if (gameState?.programAddress === DELEGATION_PROGRAM_ID) {
          try {
            const erState = await sdk.getGameAccount(erRpc, gameAddress);
            gameState = erState || gameState;
          } catch (_error) {
            // Fallback to regular RPC if enhanced RPC fails
          }
        }
        if (!gameState) {
          return { gameData: null, players: [], properties: [] };
        }

        const gameData: GameAccount = mapGameStateToAccount(
          gameState.data,
          gameState.address
        );

        // Step 2: Get player addresses from game data
        const isInProgress = gameData.gameStatus === GameStatus.InProgress;

        const playerAddresses = gameData.players || [];

        if (playerAddresses.length === 0) {
          return { gameData, players: [], properties: [] };
        }

        // Step 3: Fetch all player accounts
        const playerPromises = playerAddresses.map(
          async (playerAddress: string) => {
            try {
              let playerAccount = await sdk.getPlayerAccount(
                isInProgress ? erRpc : rpc,
                gameAddress,
                address(playerAddress)
              );

              if (!playerAccount) {
                playerAccount = await sdk.getPlayerAccount(
                  rpc,
                  gameAddress,
                  address(playerAddress)
                );
              }

              if (!playerAccount) {
                return null;
              }

              return mapPlayerStateToAccount(
                playerAccount.data,
                playerAccount.address
              );
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

        // Step 4: Get all property positions from all players
        const allPropertyPositions = players
          .map((player) => Array.from(player.propertiesOwned))
          .flat();

        // Remove duplicates
        const uniquePropertyPositions = [...new Set(allPropertyPositions)];

        // Step 5: Fetch all property states
        let properties: PropertyAccount[] = [];
        if (uniquePropertyPositions.length > 0) {
          const propertyStates = await sdk.getPropertyStateAccounts(
            isInProgress ? erRpc : rpc,
            gameAddress,
            uniquePropertyPositions
          );

          properties = (propertyStates || []).map((propertyState) =>
            mapPropertyStateToAccount(propertyState.data, propertyState.address)
          );
        }

        return { gameData, players, properties };
      } catch (error) {
        console.error("Error fetching game state:", error);
        return { gameData: null, players: [], properties: [] };
      }
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      // Disable polling when subscriptions are active
      refreshInterval: subscribeToUpdates ? 0 : 5_000,
    }
  );

  const cleanupSubscriptions = useCallback(() => {
    if (gameSubscriptionRef.current) {
      gameSubscriptionRef.current();
      gameSubscriptionRef.current = null;
    }

    playerSubscriptionsRef.current.forEach((unsubscribe) => {
      unsubscribe();
    });
    playerSubscriptionsRef.current.clear();

    if (currentEventSubscriptionRef.current) {
      currentEventSubscriptionRef.current();
      currentEventSubscriptionRef.current = null;
    }

    isSubscribedRef.current = false;
  }, []);

  const setupSubscriptions = useCallback(async () => {
    if (!gameAddress || !data?.gameData || !subscribeToUpdates || !enabled) {
      return;
    }

    try {
      console.log(`Setting up subscriptions for game ${gameAddress}`);
      const isInProgress = data.gameData.gameStatus === GameStatus.InProgress;

      // Subscribe to game account changes
      const gameUnsubscribe = await sdk.subscribeToGameAccount(
        isInProgress ? erRpc : rpc,
        isInProgress ? erRpcSubscriptions : rpcSubscriptions,
        gameAddress,
        async (gameState) => {
          if (!gameState) return;

          console.log("Game account updated, refreshing data...");
          // Trigger a full refetch when game state changes
          await mutate();
        }
      );

      gameSubscriptionRef.current = gameUnsubscribe || null;

      // Subscribe to each player account
      const playerAddresses = data.gameData.players || [];

      for (const playerAddress of playerAddresses) {
        const playerKey = playerAddress.toString();

        const playerUnsubscribe = await sdk.subscribePlayerStateAccount(
          isInProgress ? erRpc : rpc,
          isInProgress ? erRpcSubscriptions : rpcSubscriptions,
          gameAddress,
          address(playerAddress),
          async (playerState) => {
            if (!playerState) return;

            console.log(`Player ${playerAddress} updated, refreshing data...`);
            // Trigger a full refetch when any player state changes
            await mutate();
          }
        );

        if (playerUnsubscribe) {
          playerSubscriptionsRef.current.set(playerKey, playerUnsubscribe);
        }
      }

      const eventUnsubscribe = await sdk.subscribeToEvents(
        // isInProgress ? erRpc : rpc,
        isInProgress ? erRpcSubscriptions : rpcSubscriptions,
        async (event) => {
          console.log(`Event ${event.type} received, refreshing data...`);
          onCardDrawEvent?.(event);
        }
      );

      isSubscribedRef.current = true;
      currentGameAddressRef.current = gameAddress.toString();
      currentPlayerAddressesRef.current = playerAddresses.map((addr) =>
        addr.toString()
      );
      currentEventSubscriptionRef.current = eventUnsubscribe || null;
    } catch (error) {
      console.error("Error setting up subscriptions:", error);
    }
  }, [
    gameAddress,
    data?.gameData,
    subscribeToUpdates,
    enabled,
    onCardDrawEvent,
  ]);

  // Main subscription effect
  useEffect(() => {
    cleanupSubscriptions();

    // Only subscribe if we have data and subscriptions are enabled
    if (!subscribeToUpdates || !data?.gameData || !enabled || !gameAddress) {
      return;
    }

    setupSubscriptions();

    return () => {
      cleanupSubscriptions();
    };
  }, [
    data?.gameData,
    gameAddress?.toString(),
    subscribeToUpdates,
    enabled,
    setupSubscriptions,
    cleanupSubscriptions,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscriptions();
    };
  }, [cleanupSubscriptions]);

  useEffect(() => {
    const currentAddress = gameAddress?.toString() || null;
    if (
      currentGameAddressRef.current !== null &&
      currentGameAddressRef.current !== currentAddress
    ) {
      cleanupSubscriptions();
    }
  }, [gameAddress?.toString(), cleanupSubscriptions]);

  // Handle player list changes
  useEffect(() => {
    if (!data?.gameData?.players) return;

    const newPlayerAddresses = data.gameData.players.map((addr) =>
      addr.toString()
    );
    const currentAddresses = currentPlayerAddressesRef.current;

    const hasChanged =
      newPlayerAddresses.length !== currentAddresses.length ||
      newPlayerAddresses.some((addr) => !currentAddresses.includes(addr));

    if (hasChanged && isSubscribedRef.current) {
      console.log("Player list changed, updating subscriptions...");
      cleanupSubscriptions();
      setupSubscriptions();
    }
  }, [data?.gameData?.players, cleanupSubscriptions, setupSubscriptions]);

  const refetch = useCallback(async (): Promise<void> => {
    await mutate();
  }, [mutate]);

  return {
    gameData: data?.gameData || null,
    players: data?.players || [],
    properties: data?.properties || [],
    error,
    isLoading,
    isError: !!error,
    refetch,
    playerCount: data?.players?.length || 0,
    isSubscribed: isSubscribedRef.current,
  };
}
