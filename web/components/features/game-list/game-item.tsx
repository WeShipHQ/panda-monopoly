"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye } from "lucide-react";

export enum GameStatus {
  WaitingForPlayers = "WaitingForPlayers",
  InProgress = "InProgress",
  Finished = "Finished",
}

export interface GameData {
  id: string;
  players: string[];
  maxPlayers: number;
  currentPlayers: number;
  bankBalance: number;
  gameStatus: GameStatus;
  gameId: number;
  timeLimit?: number;
  createdAt: number;
}

interface GameItemProps {
  game: GameData;
  onJoinGame: (gameId: string) => void;
  onSpectateGame: (gameId: string) => void;
}

export function GameItem({ game, onJoinGame, onSpectateGame }: GameItemProps) {
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
        <Avatar key={player} className="w-12 h-12 border-2 border-white">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player}`}
          />
          <AvatarFallback className="bg-blue-500 text-white">
            {player.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    for (let i = players.length; i < maxPlayers; i++) {
      avatars.push(
        <Avatar
          key={`empty-${i}`}
          className="w-12 h-12 border-2 border-gray-300 bg-gray-100"
        >
          <AvatarFallback className="bg-gray-200 text-gray-400">
            ?
          </AvatarFallback>
        </Avatar>
      );
    }

    return avatars;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow bg-chart-3">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left side - Player avatars and game info */}
          <div className="flex items-center space-x-6">
            {/* Player avatars */}
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {getPlayerAvatars(game.players, game.maxPlayers)}
              </div>
              <span className="text-sm ml-4">VS</span>
            </div>

            {/* Entry fee */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">◎</span>
              </div>
              <span className="text-lg font-semibold text-foreground">
                {formatEntryFee(game.bankBalance)}
              </span>
            </div>

            {/* Game status */}
            {getGameStatusBadge(game.gameStatus)}
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-3">
            {game.gameStatus === GameStatus.WaitingForPlayers && (
              <Button
                onClick={() => onJoinGame(game.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-6"
              >
                Join
              </Button>
            )}

            {game.gameStatus === GameStatus.InProgress && (
              <Button
                variant="neutral"
                onClick={() => onSpectateGame(game.id)}
                className="px-6"
              >
                <span className="mr-2">IN-PLAY</span>
              </Button>
            )}

            {game.gameStatus === GameStatus.Finished && (
              <Button
                variant="neutral"
                onClick={() => onSpectateGame(game.id)}
                className="px-6"
              >
                <span className="mr-2">FINISHED</span>
              </Button>
            )}

            <Button
              variant="neutral"
              size="icon"
              onClick={() => onSpectateGame(game.id)}
              className="w-10 h-10"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span>
                Players: {game.currentPlayers}/{game.maxPlayers}
              </span>
              <span>Game ID: {game.gameId}</span>
              {game.timeLimit && (
                <span>Time Limit: {game.timeLimit / 60}min</span>
              )}
            </div>
            <div>
              Created: {new Date(game.createdAt * 1000).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
