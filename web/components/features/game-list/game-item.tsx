"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";
import { GameAccount } from "@/types/schema";
import { GameStatus } from "@/lib/sdk/generated";

// export interface GameData {
//   id: string;
//   players: string[];
//   maxPlayers: number;
//   currentPlayers: number;
//   bankBalance: number;
//   gameStatus: GameStatus;
//   gameId: number;
//   timeLimit?: number;
//   createdAt: number;
// }

interface GameItemProps {
  game: GameAccount;
  onJoinGame: (gameId: string) => void;
  onSpectateGame: (gameId: string) => void;
  joining: boolean;
}

export function GameItem({
  game,
  onJoinGame,
  onSpectateGame,
  joining,
}: GameItemProps) {
  const formatEntryFee = (bankBalance: number) => {
    const sol = bankBalance / 1e9;
    return sol.toFixed(4);
  };

  const getGameStatusBadge = (status: GameStatus) => {
    switch (status) {
      case GameStatus.WaitingForPlayers:
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            JOINABLE
          </Badge>
        );
      case GameStatus.InProgress:
        return (
          <Badge variant="neutral" className="bg-gray-500 text-white">
            IN-PLAY
          </Badge>
        );
      case GameStatus.Finished:
        return (
          <Badge variant="neutral" className="bg-red-500 text-white">
            FINISHED
          </Badge>
        );
      default:
        return <Badge variant="neutral">UNKNOWN</Badge>;
    }
  };

  const getPlayerAvatars = (players: string[], maxPlayers: number) => {
    const avatars = [];

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      avatars.push(
        <Avatar
          key={player}
          className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white"
        >
          <AvatarImage walletAddress={player} />
          <AvatarFallback
            walletAddress={player}
            className="bg-blue-500 text-white text-xs sm:text-sm"
          >
            {player.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    for (let i = players.length; i < maxPlayers; i++) {
      avatars.push(
        <Avatar
          key={`empty-${i}`}
          className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 bg-gray-100"
        >
          <AvatarFallback className="bg-gray-200 text-gray-400 text-xs sm:text-sm">
            ?
          </AvatarFallback>
        </Avatar>
      );
    }

    return avatars;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow bg-chart-3">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Player avatars and game info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1">
            {/* Player avatars */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {getPlayerAvatars(game.players, game.maxPlayers)}
              </div>
              <span className="text-sm font-medium">VS</span>
            </div>

            {/* Entry fee and status */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Entry fee */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">◎</span>
                </div>
                <span className="text-base sm:text-lg font-semibold text-foreground">
                  {formatEntryFee(Number(game.bankBalance))}
                </span>
              </div>

              {/* Game status */}
              {getGameStatusBadge(game.gameStatus)}
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {game.gameStatus === GameStatus.WaitingForPlayers && (
              <Button
                onClick={() => onJoinGame(game.address)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 flex-1 sm:flex-none"
                loading={joining}
              >
                Join
              </Button>
            )}

            {game.gameStatus === GameStatus.InProgress && (
              <Button
                variant="neutral"
                onClick={() => onSpectateGame(game.address)}
                className="px-4 sm:px-6 flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline mr-2">IN-PLAY</span>
                <span className="sm:hidden">PLAY</span>
              </Button>
            )}

            {game.gameStatus === GameStatus.Finished && (
              <Button
                variant="neutral"
                onClick={() => onSpectateGame(game.address)}
                className="px-4 sm:px-6 flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline mr-2">FINISHED</span>
                <span className="sm:hidden">DONE</span>
              </Button>
            )}

            <Button
              variant="neutral"
              size="icon"
              onClick={() => onSpectateGame(game.address)}
              className="w-10 h-10 flex-shrink-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm">
            <div className="flex flex-row xs:items-center gap-2 xs:gap-4">
              <span className="font-medium">
                Players: {game.currentPlayers}/{game.maxPlayers}
              </span>
              <span className="text-muted-foreground">
                Game ID: {game.gameId}
              </span>
              {game.timeLimit && (
                <span className="text-muted-foreground">
                  Time Limit: {Number(game.timeLimit) / 60}min
                </span>
              )}
            </div>
            <div>
              Created:{" "}
              {new Date(Number(game.createdAt) * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
