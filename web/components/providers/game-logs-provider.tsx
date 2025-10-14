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
    throw new Error(
      "useGameLogsContext must be used within GameLogsProvider"
    );
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
  const { registerEventHandler, lastEvent } = useGameEventsContext();

  // Load logs from localStorage on mount
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

  // Save logs to localStorage
  const saveLogs = useCallback((logs: GameLogEntry[]) => {
    if (!persistToStorage) return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error("Failed to save logs to localStorage:", error);
    }
  }, [STORAGE_KEY, persistToStorage]);

  // Add a new log entry
  const addGameLog = useCallback(
    (entry: Omit<GameLogEntry, "id" | "timestamp">) => {
      const newLog: GameLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setGameLogs((currentLogs) => {
        const updatedLogs = [...currentLogs, newLog].slice(-maxLogs);
        saveLogs(updatedLogs);
        return updatedLogs;
      });
    },
    [maxLogs, saveLogs]
  );

  // Clear all logs
  const clearLogs = useCallback(() => {
    setGameLogs([]);
    if (persistToStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [STORAGE_KEY, persistToStorage]);

  // Load logs on mount
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

  // Register event handlers to automatically convert events to logs
  useEffect(() => {
    const unsubscribeHandlers: (() => void)[] = [];

    // Register handlers for all event types
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
      const unsubscribe = registerEventHandler(eventType, (eventData, context) => {
        try {
          // Reconstruct the full event object
          const fullEvent = {
            type: eventType,
            data: eventData,
          };

          // Map event to log entry
          const logEntry = mapEventToLogEntry(fullEvent as any);
          
          // Add the log entry
          addGameLog({
            type: logEntry.type,
            playerId: logEntry.playerId,
            playerName: logEntry.playerName,
            message: logEntry.message,
            details: logEntry.details,
          });
        } catch (error) {
          console.error(`Error processing ${eventType} event for logs:`, error);
        }
      });

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