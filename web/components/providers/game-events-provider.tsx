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
import { toast } from "sonner";
import { formatAddress } from "@/lib/utils";
import { playSound } from "@/lib/soundUtil";

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
  gameAddress?: Address;
}

export const GameEventsProvider: React.FC<GameEventsProviderProps> = ({
  children,
  gameAddress,
}) => {
  const { wallet } = useWallet();
  const [eventHandlers, setEventHandlers] = useState<
    Map<string, Set<EventHandler>>
  >(new Map());
  const [lastEvent, setLastEvent] = useState<GameEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<GameEvent[]>([]);

  // Use the events hook
  const { isSubscribed } = useGameEvents(gameAddress, {
    onEvent: useCallback(
      (event: GameEvent) => {
        console.log("GameEventsProvider received event:", event);
        setLastEvent(event);
        setEventHistory((prev) => [...prev, event].slice(-100)); // Keep last 100 events

        // Execute registered handlers for this event type
        const handlers = eventHandlers.get(event.type);

        if (handlers) {
          const context: GameEventContext = {
            gameAddress: gameAddress || null,
            currentPlayerAddress: wallet?.address || null,
            isCurrentPlayer: (playerAddress: Address) =>
              wallet?.address === playerAddress,
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

  // Register event handler function
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

      // Return cleanup function
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

  // Built-in event handlers
  useEffect(() => {
    // Handler for ChanceCardDrawn events
    const unsubscribeChance = registerEventHandler(
      "ChanceCardDrawn",
      (data, context) => {
        const playerName = context.isCurrentPlayer(data.player)
          ? "You"
          : formatAddress(data.player);

        toast.success(`${playerName} drew a Chance card!`, {
          description: `Card effect: ${getCardEffectDescription(
            data.effectType,
            data.amount
          )}`,
        });

        playSound("button-click");
      }
    );

    // Handler for CommunityChestCardDrawn events
    const unsubscribeCommunity = registerEventHandler(
      "CommunityChestCardDrawn",
      (data, context) => {
        const playerName = context.isCurrentPlayer(data.player)
          ? "You"
          : formatAddress(data.player);

        toast.success(`${playerName} drew a Community Chest card!`, {
          description: `Card effect: ${getCardEffectDescription(
            data.effectType,
            data.amount
          )}`,
        });

        playSound("button-click");
      }
    );

    return () => {
      unsubscribeChance();
      unsubscribeCommunity();
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

// Helper function to describe card effects
function getCardEffectDescription(effectType: number, amount: number): string {
  switch (effectType) {
    case 0: // Money
      return amount > 0 ? `Gain $${amount}` : `Pay $${Math.abs(amount)}`;
    case 1: // Move
      return `Move ${amount} spaces`;
    case 2: // GoToJail
      return "Go to Jail";
    case 3: // GetOutOfJailFree
      return "Get Out of Jail Free card";
    case 4: // PayPerProperty
      return `Pay $${amount} per property`;
    case 5: // CollectFromPlayers
      return `Collect $${amount} from each player`;
    default:
      return "Unknown effect";
  }
}
