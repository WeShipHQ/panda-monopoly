"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Filter, Plus } from "lucide-react";
import { GameListLoading } from "./game-list-loading";
import { GameItem, GameData, GameStatus } from "./game-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const dummyGames: GameData[] = [
  {
    id: "game-1",
    players: ["player1", "player2"],
    maxPlayers: 4,
    currentPlayers: 2,
    bankBalance: 2100000000, // 2.1 SOL in lamports
    gameStatus: GameStatus.WaitingForPlayers,
    gameId: 1001,
    timeLimit: 3600, // 1 hour
    createdAt: Date.now() / 1000 - 3600, // 1 hour ago
  },
  {
    id: "game-2",
    players: ["player3", "player4"],
    maxPlayers: 4,
    currentPlayers: 2,
    bankBalance: 50000000, // 0.05 SOL in lamports
    gameStatus: GameStatus.WaitingForPlayers,
    gameId: 1002,
    timeLimit: 1800, // 30 minutes
    createdAt: Date.now() / 1000 - 1800, // 30 minutes ago
  },
  {
    id: "game-3",
    players: ["player5", "player6"],
    maxPlayers: 4,
    currentPlayers: 2,
    bankBalance: 420000000, // 0.42 SOL in lamports
    gameStatus: GameStatus.InProgress,
    gameId: 1003,
    timeLimit: 2700, // 45 minutes
    createdAt: Date.now() / 1000 - 2700, // 45 minutes ago
  },
  {
    id: "game-4",
    players: ["player7", "player8"],
    maxPlayers: 4,
    currentPlayers: 2,
    bankBalance: 90000000, // 0.09 SOL in lamports
    gameStatus: GameStatus.InProgress,
    gameId: 1004,
    createdAt: Date.now() / 1000 - 5400, // 1.5 hours ago
  },
  {
    id: "game-5",
    players: ["player9", "player10"],
    maxPlayers: 4,
    currentPlayers: 2,
    bankBalance: 84000000, // 0.084 SOL in lamports
    gameStatus: GameStatus.InProgress,
    gameId: 1005,
    createdAt: Date.now() / 1000 - 7200, // 2 hours ago
  },
  {
    id: "game-6",
    players: ["player11", "player12"],
    maxPlayers: 4,
    currentPlayers: 2,
    bankBalance: 10000000, // 0.01 SOL in lamports
    gameStatus: GameStatus.InProgress,
    gameId: 1006,
    createdAt: Date.now() / 1000 - 9000, // 2.5 hours ago
  },
];

type GameStatusFilter = "all" | GameStatus;

const FILTER_OPTIONS = [
  { value: "all" as const, label: "All Games" },
  { value: GameStatus.WaitingForPlayers, label: "Joinable" },
  { value: GameStatus.InProgress, label: "In Progress" },
  { value: GameStatus.Finished, label: "Finished" },
];

export function GameList() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [games] = useState<GameData[]>(dummyGames);
  const [statusFilter, setStatusFilter] = useState<GameStatusFilter>("all");

  const filteredGames = useMemo(() => {
    if (statusFilter === "all") {
      return games;
    }
    return games.filter((game) => game.gameStatus === statusFilter);
  }, [games, statusFilter]);

  const handleJoinGame = (gameId: string) => {
    console.log("Joining game:", gameId);
    router.push(`/game/1234`);
  };

  const handleSpectateGame = (gameId: string) => {
    console.log("Spectating game:", gameId);
  };

  const handleCreateGame = () => {
    console.log("Creating new game");
    // TODO: Implement create game functionality
  };

  const getFilterLabel = () => {
    const option = FILTER_OPTIONS.find((opt) => opt.value === statusFilter);
    return option?.label || "All Games";
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                All Games
              </h1>
              <p className="text-muted-foreground">
                Join a game or spectate ongoing matches
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleCreateGame} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Game
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="neutral" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {getFilterLabel()}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {FILTER_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={
                        statusFilter === option.value
                          ? "bg-secondary-background"
                          : ""
                      }
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <GameListLoading />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              All Games
            </h1>
            <p className="text-muted-foreground">
              Join a game or spectate ongoing matches
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleCreateGame} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Game
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="neutral" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {getFilterLabel()}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {FILTER_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={
                      statusFilter === option.value
                        ? "bg-secondary-background"
                        : ""
                    }
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {!filteredGames || filteredGames.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {statusFilter === "all"
              ? "No games available"
              : `No ${getFilterLabel().toLowerCase()} games`}
          </div>
          <p className="text-gray-400 mt-2">
            {statusFilter === "all"
              ? "Be the first to create a game!"
              : "Try selecting a different filter or create a new game!"}
          </p>
          <Button onClick={handleCreateGame} className="mt-4 gap-2">
            <Plus className="w-4 h-4" />
            Create Game
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGames.map((game) => (
            <GameItem
              key={game.id}
              game={game}
              onJoinGame={handleJoinGame}
              onSpectateGame={handleSpectateGame}
            />
          ))}
        </div>
      )}
    </div>
  );
}
