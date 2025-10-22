"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchTopPlayers, fetchAnalytics, type RankingBy, type TimeRange, type TopPlayerItem, type GameAnalytics } from "@/services/leaderboard";

interface UseRealtimeLeaderboardOptions {
  rankingBy: RankingBy;
  timeRange: TimeRange;
  enabled?: boolean;
  pollingInterval?: number; 
}

interface UseRealtimeLeaderboardReturn {
  players: TopPlayerItem[];
  analytics: GameAnalytics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
  refresh: () => Promise<void>;
}

export function useRealtimeLeaderboard({
  rankingBy,
  timeRange,
  enabled = true,
  pollingInterval = 30000, // 30 seconds default
}: UseRealtimeLeaderboardOptions): UseRealtimeLeaderboardReturn {
  const [players, setPlayers] = useState<TopPlayerItem[]>([]);
  const [analytics, setAnalytics] = useState<GameAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    if (!enabled) return;

    try {
      if (isInitial) {
        setLoading(true);
      }
      setError(null);

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const [playersResponse, analyticsResponse] = await Promise.all([
        fetchTopPlayers({ rankingBy, timeRange }),
        fetchAnalytics({ timeRange })
      ]);

      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      setPlayers(playersResponse.data.data);
      setAnalytics(analyticsResponse);
      setLastUpdated(new Date());
      setIsConnected(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      
      console.error("Failed to fetch leaderboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setIsConnected(false);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [rankingBy, timeRange, enabled]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData(true);
    }
  }, [fetchData, enabled]);

  // Setup polling
  useEffect(() => {
    if (!enabled || pollingInterval <= 0) {
      return;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      fetchData(false);
    }, pollingInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchData, enabled, pollingInterval]);

  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
    
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsConnected(false);
      } else {
    
        setIsConnected(true);
        fetchData(false);
        
        if (pollingInterval > 0) {
          intervalRef.current = setInterval(() => {
            fetchData(false);
          }, pollingInterval);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, pollingInterval, fetchData]);

  return {
    players,
    analytics,
    loading,
    error,
    lastUpdated,
    isConnected,
    refresh,
  };
}