"use client";

import { useState } from "react";
import { LeaderboardTable } from "./leaderboard-table";
import { LeaderboardStats } from "./leaderboard-stats";
import { LeaderboardFilters } from "./leaderboard-filters";

export type LeaderboardTimeframe = "all" | "week" | "month";
export type LeaderboardMetric = "wins" | "earnings" | "games_played";

export interface PlayerStats {
  id: string;
  username: string;
  avatar?: string;
  rank: number;
  wins: number;
  losses: number;
  totalGames: number;
  totalEarnings: number; // in SOL
  winRate: number; // percentage
  averageGameTime: number; // in minutes
  longestWinStreak: number;
  currentWinStreak: number;
  favoriteProperty?: string;
  lastActive: number; // timestamp
}

// Dummy data for demonstration
const dummyPlayerStats: PlayerStats[] = [
  {
    id: "player1",
    username: "CryptoKing",
    rank: 1,
    wins: 45,
    losses: 12,
    totalGames: 57,
    totalEarnings: 12.5,
    winRate: 78.9,
    averageGameTime: 35,
    longestWinStreak: 8,
    currentWinStreak: 3,
    favoriteProperty: "Boardwalk",
    lastActive: Date.now() - 3600000, // 1 hour ago
  },
  {
    id: "player2",
    username: "PropertyMogul",
    rank: 2,
    wins: 38,
    losses: 15,
    totalGames: 53,
    totalEarnings: 9.8,
    winRate: 71.7,
    averageGameTime: 42,
    longestWinStreak: 6,
    currentWinStreak: 0,
    favoriteProperty: "Park Place",
    lastActive: Date.now() - 7200000, // 2 hours ago
  },
  {
    id: "player3",
    username: "DiceRoller",
    rank: 3,
    wins: 32,
    losses: 18,
    totalGames: 50,
    totalEarnings: 8.2,
    winRate: 64.0,
    averageGameTime: 38,
    longestWinStreak: 5,
    currentWinStreak: 2,
    favoriteProperty: "Reading Railroad",
    lastActive: Date.now() - 10800000, // 3 hours ago
  },
  {
    id: "player4",
    username: "MonopolyMaster",
    rank: 4,
    wins: 29,
    losses: 16,
    totalGames: 45,
    totalEarnings: 7.6,
    winRate: 64.4,
    averageGameTime: 33,
    longestWinStreak: 4,
    currentWinStreak: 1,
    favoriteProperty: "Electric Company",
    lastActive: Date.now() - 14400000, // 4 hours ago
  },
  {
    id: "player5",
    username: "RealEstateGuru",
    rank: 5,
    wins: 26,
    losses: 19,
    totalGames: 45,
    totalEarnings: 6.9,
    winRate: 57.8,
    averageGameTime: 40,
    longestWinStreak: 3,
    currentWinStreak: 0,
    favoriteProperty: "Marvin Gardens",
    lastActive: Date.now() - 18000000, // 5 hours ago
  },
  {
    id: "player6",
    username: "TokenCollector",
    rank: 6,
    wins: 23,
    losses: 22,
    totalGames: 45,
    totalEarnings: 5.4,
    winRate: 51.1,
    averageGameTime: 45,
    longestWinStreak: 3,
    currentWinStreak: 1,
    favoriteProperty: "St. Charles Place",
    lastActive: Date.now() - 21600000, // 6 hours ago
  },
  {
    id: "player7",
    username: "BoardwalkBoss",
    rank: 7,
    wins: 21,
    losses: 24,
    totalGames: 45,
    totalEarnings: 4.8,
    winRate: 46.7,
    averageGameTime: 48,
    longestWinStreak: 2,
    currentWinStreak: 0,
    favoriteProperty: "Atlantic Avenue",
    lastActive: Date.now() - 25200000, // 7 hours ago
  },
  {
    id: "player8",
    username: "DiceDestiny",
    rank: 8,
    wins: 18,
    losses: 27,
    totalGames: 45,
    totalEarnings: 3.2,
    winRate: 40.0,
    averageGameTime: 52,
    longestWinStreak: 2,
    currentWinStreak: 0,
    favoriteProperty: "Vermont Avenue",
    lastActive: Date.now() - 28800000, // 8 hours ago
  },
];

export function Leaderboard() {
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>("all");
  const [metric, setMetric] = useState<LeaderboardMetric>("wins");
  const [players] = useState<PlayerStats[]>(dummyPlayerStats);

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top players and their achievements in Panda Monopoly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <LeaderboardStats players={players} />
      </div>

      <div className="mb-6">
        <LeaderboardFilters
          timeframe={timeframe}
          metric={metric}
          onTimeframeChange={setTimeframe}
          onMetricChange={setMetric}
        />
      </div>

      <LeaderboardTable
        players={players}
        metric={metric}
        timeframe={timeframe}
      />
    </div>
  );
}
