"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { GameLogEntry } from "@/types/space-types";
import { useGameEventsContext } from "./game-events-provider";
import { mapEventToLogEntry } from "@/lib/event-to-log-mapper";
import { GameEvent } from "@/lib/sdk/types";

interface GameLogsContextType {
  gameLogs: GameLogEntry[];
  addGameLog: (entry: Omit<GameLogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
  refreshLogs: () => GameLogEntry[];
}

const GameLogsContext = createContext<GameLogsContextType | null>(null);

export const useGameLogsContext = () => {
  const context = useContext(GameLogsContext);
  if (!context) {
    throw new Error("useGameLogsContext must be used within GameLogsProvider");
  }
  return context;
};

interface GameLogsProviderProps {
  children: ReactNode;
  maxLogs?: number;
  persistToStorage?: boolean;
}

export const GameLogsProvider: React.FC<GameLogsProviderProps> = ({
  children,
  maxLogs = 100,
  persistToStorage = true,
}) => {
  const STORAGE_KEY = "gameLogs";
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);
  const { registerEventHandler } = useGameEventsContext();

  const loadLogs = useCallback(() => {
    if (!persistToStorage) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const logs = stored ? (JSON.parse(stored) as GameLogEntry[]) : [];
      setGameLogs(logs);
      return logs;
    } catch {
      setGameLogs([]);
      return [];
    }
  }, [STORAGE_KEY, persistToStorage]);

  const saveLogs = useCallback(
    (logs: GameLogEntry[]) => {
      if (!persistToStorage) return;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      } catch (error) {
        console.error("Failed to save logs to localStorage:", error);
      }
    },
    [STORAGE_KEY, persistToStorage]
  );

  const addGameLog = useCallback(
    (entry: Omit<GameLogEntry, "id" | "timestamp">) => {
      const newLog: GameLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setGameLogs((currentLogs) => {
        const updatedLogs = [newLog, ...currentLogs].slice(-maxLogs);
        saveLogs(updatedLogs);
        return updatedLogs;
      });
    },
    [maxLogs, saveLogs]
  );

  const clearLogs = useCallback(() => {
    setGameLogs([]);
    if (persistToStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [STORAGE_KEY, persistToStorage]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    if (!persistToStorage) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadLogs();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [STORAGE_KEY, loadLogs, persistToStorage]);

  useEffect(() => {
    const unsubscribeHandlers: (() => void)[] = [];

    const eventTypes = [
      "PlayerJoined",
      "PlayerLeft",
      "GameStarted",
      "GameCancelled",
      "PlayerPassedGo",
      "PropertyPurchased",
      "PropertyDeclined",
      "RentPaid",
      "ChanceCardDrawn",
      "CommunityChestCardDrawn",
      "HouseBuilt",
      "HotelBuilt",
      "BuildingSold",
      "PropertyMortgaged",
      "PropertyUnmortgaged",
      "TaxPaid",
      "SpecialSpaceAction",
      "TradeCreated",
      "TradeAccepted",
      "TradeRejected",
      "TradeCancelled",
      "TradesCleanedUp",
      "PlayerBankrupt",
      "GameEnded",
      "GameEndConditionMet",
      "PrizeClaimed",
    ] as const;

    eventTypes.forEach((eventType) => {
      const unsubscribe = registerEventHandler(
        eventType as GameEvent["type"],
        (eventData) => {
          try {
            const fullEvent = {
              type: eventType,
              data: eventData,
            } as GameEvent;

            const logEntry = mapEventToLogEntry(fullEvent);

            addGameLog({
              gameId: logEntry.gameId,
              type: logEntry.type,
              playerId: logEntry.playerId,
              playerName: logEntry.playerName,
              details: logEntry.details,
            });
          } catch (error) {
            console.error(
              `Error processing ${eventType} event for logs:`,
              error
            );
          }
        }
      );

      unsubscribeHandlers.push(unsubscribe);
    });

    return () => {
      unsubscribeHandlers.forEach((unsubscribe) => unsubscribe());
    };
  }, [registerEventHandler, addGameLog]);

  const contextValue: GameLogsContextType = {
    gameLogs,
    addGameLog,
    clearLogs,
    refreshLogs: loadLogs,
  };

  return (
    <GameLogsContext.Provider value={contextValue}>
      {children}
    </GameLogsContext.Provider>
  );
};
