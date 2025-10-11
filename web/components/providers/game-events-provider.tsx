"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Address } from "@solana/kit";
import { GameEvent } from "@/lib/sdk/types";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useWallet } from "@/hooks/use-wallet";
import { playSound } from "@/lib/soundUtil";
import { useGameContext } from "./game-provider";
import {
  showTaxPaidToast,
  showPlayerPassedGoToast,
  showPlayerJoinedToast,
  showGameStartedToast,
  showChanceCardDrawnToast,
  showCommunityChestCardDrawnToast,
  showGoToJailToast,
} from "@/lib/toast-utils";

type EventHandler<T = any> = (event: T, context: GameEventContext) => void;

interface GameEventContext {
  gameAddress: Address | null;
  currentPlayerAddress: string | null;
  isCurrentPlayer: (playerAddress: Address) => boolean;
}

interface GameEventsContextType {
  isSubscribed: boolean;
  lastEvent: GameEvent | null;
  eventHistory: GameEvent[];

  registerEventHandler: <T extends GameEvent["type"]>(
    eventType: T,
    handler: EventHandler<Extract<GameEvent, { type: T }>["data"]>
  ) => () => void;

  clearEventHistory: () => void;
}

const GameEventsContext = createContext<GameEventsContextType | null>(null);

export const useGameEventsContext = () => {
  const context = useContext(GameEventsContext);
  if (!context) {
    throw new Error(
      "useGameEventsContext must be used within GameEventsProvider"
    );
  }
  return context;
};

interface GameEventsProviderProps {
  children: ReactNode;
}

export const GameEventsProvider: React.FC<GameEventsProviderProps> = ({
  children,
}) => {
  const { gameAddress, gameState } = useGameContext();
  const { wallet } = useWallet();
  const [eventHandlers, setEventHandlers] = useState<
    Map<string, Set<EventHandler>>
  >(new Map());
  const [lastEvent, setLastEvent] = useState<GameEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<GameEvent[]>([]);

  const { isSubscribed } = useGameEvents(gameAddress, {
    gameData: gameState,
    onEvent: useCallback(
      (event: GameEvent) => {
        console.log("GameEventsProvider received event:", event);
        setLastEvent(event);
        setEventHistory((prev) => [...prev, event].slice(-100)); // Keep last 100 events

        const handlers = eventHandlers.get(event.type);

        if (handlers) {
          console.log("CHECK XXXX heheheh", event.type, wallet?.address);
          const context: GameEventContext = {
            gameAddress: gameAddress || null,
            currentPlayerAddress: wallet?.address || null,
            isCurrentPlayer: (playerAddress: Address) =>
              wallet?.address === playerAddress.toString(),
          };

          handlers.forEach((handler) => {
            try {
              handler(event.data, context);
            } catch (error) {
              console.error(`Error in event handler for ${event.type}:`, error);
            }
          });
        }
      },
      [eventHandlers, gameAddress, wallet?.address]
    ),
  });

  const registerEventHandler = useCallback(
    <T extends GameEvent["type"]>(
      eventType: T,
      handler: EventHandler<Extract<GameEvent, { type: T }>["data"]>
    ) => {
      setEventHandlers((prev) => {
        const newMap = new Map(prev);
        if (!newMap.has(eventType)) {
          newMap.set(eventType, new Set());
        }
        newMap.get(eventType)!.add(handler as EventHandler);
        return newMap;
      });

      return () => {
        setEventHandlers((prev) => {
          const newMap = new Map(prev);
          const handlers = newMap.get(eventType);
          if (handlers) {
            handlers.delete(handler as EventHandler);
            if (handlers.size === 0) {
              newMap.delete(eventType);
            }
          }
          return newMap;
        });
      };
    },
    []
  );

  const clearEventHistory = useCallback(() => {
    setEventHistory([]);
    setLastEvent(null);
  }, []);

  useEffect(() => {
    const unsubscribeTaxPaid = registerEventHandler(
      "TaxPaid",
      (data, context) => {
        if (!context.isCurrentPlayer(data.player)) {
          showTaxPaidToast({
            taxType: data.taxType,
            amount: data.amount,
            position: data.position,
          });
        }
      }
    );

    const unsubscribePlayerPassedGo = registerEventHandler(
      "PlayerPassedGo",
      (data, context) => {
        if (context.isCurrentPlayer(data.player)) {
          showPlayerPassedGoToast({
            salaryCollected: data.salaryCollected,
          });

          playSound("money-receive");
        }
      }
    );

    const unsubscribePlayerJoined = registerEventHandler(
      "PlayerJoined",
      (data, context) => {
        if (!context.isCurrentPlayer(data.player)) {
          showPlayerJoinedToast({
            playerAddress: data.player,
            playerIndex: data.playerIndex,
            totalPlayers: data.totalPlayers,
          });
        }
      }
    );

    const unsubscribeGameStarted = registerEventHandler(
      "GameStarted",
      (data) => {
        showGameStartedToast({
          totalPlayers: data.totalPlayers,
          firstPlayer: data.firstPlayer,
        });
      }
    );

    const unsubscribeChanceCard = registerEventHandler(
      "ChanceCardDrawn",
      (data, context) => {
        if (!context.isCurrentPlayer(data.player)) {
          showChanceCardDrawnToast({
            playerAddress: data.player,
            cardIndex: data.cardIndex,
            isCurrentPlayer: context.isCurrentPlayer(data.player),
          });
        }
      }
    );

    const unsubscribeCommunityChestCard = registerEventHandler(
      "CommunityChestCardDrawn",
      (data, context) => {
        if (!context.isCurrentPlayer(data.player)) {
          showCommunityChestCardDrawnToast({
            playerAddress: data.player,
            cardIndex: data.cardIndex,
            isCurrentPlayer: context.isCurrentPlayer(data.player),
          });
        }
      }
    );

    const unsubscribeSpecialSpaceAction = registerEventHandler(
      "SpecialSpaceAction",
      (data, context) => {
        console.log("CHECK XXXX SpecialSpaceAction", data, context);
        if (data.spaceType === 2) {
          showGoToJailToast({
            playerAddress: data.player,
            isCurrentPlayer: context.isCurrentPlayer(data.player),
          });
        }
      }
    );

    return () => {
      unsubscribeTaxPaid();
      unsubscribePlayerPassedGo();
      unsubscribePlayerJoined();
      unsubscribeGameStarted();
      unsubscribeChanceCard();
      unsubscribeCommunityChestCard();
      unsubscribeSpecialSpaceAction();
    };
  }, [registerEventHandler]);

  const contextValue: GameEventsContextType = {
    isSubscribed,
    lastEvent,
    eventHistory,
    // @ts-expect-error
    registerEventHandler,
    clearEventHistory,
  };

  return (
    <GameEventsContext.Provider value={contextValue}>
      {children}
    </GameEventsContext.Provider>
  );
};
