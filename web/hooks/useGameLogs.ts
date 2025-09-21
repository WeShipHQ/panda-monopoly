import { GameLogEntry } from "@/types/space-types";
import { useState, useCallback, useEffect } from "react";

export function useGameLogs() {
  const STORAGE_KEY = "gameLogs";

  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as GameLogEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameLogs));
  }, [gameLogs]);

  const addGameLog = useCallback(
    (entry: Omit<GameLogEntry, "id" | "timestamp">) => {
      const newLog: GameLogEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setGameLogs((prev) => {
        const updated = [...prev, newLog].slice(-100);
        return updated;
      });
    },
    []
  );

  const clearLogs = useCallback(() => {
    setGameLogs([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { gameLogs, addGameLog, clearLogs };
}
