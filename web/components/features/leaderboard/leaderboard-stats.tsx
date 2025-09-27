"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, TrendingUp, Clock } from "lucide-react";
import { PlayerStats } from "./leaderboard";

interface LeaderboardStatsProps {
  players: PlayerStats[];
}

export function LeaderboardStats({ players }: LeaderboardStatsProps) {
  const totalPlayers = players.length;
  const totalGames = players.reduce((sum, player) => sum + player.totalGames, 0);
  const totalEarnings = players.reduce((sum, player) => sum + player.totalEarnings, 0);
  const averageWinRate = players.reduce((sum, player) => sum + player.winRate, 0) / players.length;
  const averageGameTime = players.reduce((sum, player) => sum + player.averageGameTime, 0) / players.length;

  const stats = [
    {
      title: "Total Players",
      value: totalPlayers.toLocaleString(),
      icon: Users,
      description: "Active players",
      color: "text-blue-500",
    },
    {
      title: "Games Played",
      value: totalGames.toLocaleString(),
      icon: Trophy,
      description: "Total games completed",
      color: "text-green-500",
    },
    {
      title: "Total Earnings",
      value: `${totalEarnings.toFixed(2)} SOL`,
      icon: TrendingUp,
      description: "Combined player earnings",
      color: "text-yellow-500",
    },
    {
      title: "Avg Game Time",
      value: `${Math.round(averageGameTime)}m`,
      icon: Clock,
      description: `${averageWinRate.toFixed(1)}% avg win rate`,
      color: "text-purple-500",
    },
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-1">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
          <div className={`absolute top-0 right-0 w-1 h-full ${stat.color.replace('text-', 'bg-')}`} />
        </Card>
      ))}
    </>
  );
}