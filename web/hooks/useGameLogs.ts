import { GameLogEntry } from "@/types/space-types";
import { useState, useCallback, useEffect } from "react";

export function useGameLogs() {
  const STORAGE_KEY = "gameLogs";

  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);

  const loadLogs = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const logs = stored ? (JSON.parse(stored) as GameLogEntry[]) : [];
      setGameLogs(logs);
      return logs;
    } catch {
      setGameLogs([]);
      return [];
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    // loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadLogs();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [STORAGE_KEY, loadLogs]);

  const addGameLog = useCallback(
    (entry: Omit<GameLogEntry, "id" | "timestamp">) => {
      // const newLog: GameLogEntry = {
      //   ...entry,
      //   id: crypto.randomUUID(),
      //   timestamp: Date.now(),
      // };

      // setGameLogs((currentLogs) => {
      //   const updatedLogs = [...currentLogs, newLog].slice(-100);
      //   localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
      //   return updatedLogs;
      // });
    },
    [STORAGE_KEY]
  );

  const clearLogs = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setGameLogs([]);
  }, [STORAGE_KEY]);

  return { gameLogs, addGameLog, clearLogs, refreshLogs: loadLogs };
}
