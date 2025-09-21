"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import ConnectWalletBtn from "@/components/connect-wallet/connect-wallet-button";
import { formatAddress } from "@/lib/utils";
import { Play, Users, Clock, Trophy } from "lucide-react";

// Mock room data - replace with actual data from your game state
interface GameRoom {
  id: string;
  name: string;
  status: "waiting" | "in-progress" | "ended";
  players: number;
  maxPlayers: number;
  createdAt: Date;
  winner?: string;
}

// Mock data - replace with actual API calls
const mockRooms: GameRoom[] = [
  {
    id: "1",
    name: "Solana Legends",
    status: "waiting",
    players: 2,
    maxPlayers: 4,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "2",
    name: "DeFi Masters",
    status: "in-progress",
    players: 4,
    maxPlayers: 4,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: "3",
    name: "NFT Tycoons",
    status: "waiting",
    players: 1,
    maxPlayers: 4,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "4",
    name: "Crypto Empire",
    status: "ended",
    players: 4,
    maxPlayers: 4,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    winner: "0x1234...5678",
  },
  {
    id: "5",
    name: "Web3 Warriors",
    status: "in-progress",
    players: 3,
    maxPlayers: 4,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
];

const statusColors = {
  waiting: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
  "in-progress": "bg-green-500/20 text-green-500 border-green-500/30",
  ended: "bg-gray-500/20 text-gray-500 border-gray-500/30",
};

const statusIcons = {
  waiting: Clock,
  "in-progress": Play,
  ended: Trophy,
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "waiting" | "in-progress" | "ended"
  >("all");
  const [rooms, setRooms] = useState<GameRoom[]>(mockRooms);

  const filteredRooms = rooms.filter(
    (room) => selectedFilter === "all" || room.status === selectedFilter
  );

  const handlePlayNow = () => {
    // TODO: Implement create new game logic
    console.log("Creating new game...");
  };

  const handleJoinRoom = (roomId: string) => {
    // TODO: Implement join room logic
    console.log("Joining room:", roomId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Connect Wallet */}
      <header className="flex justify-end p-6">
        {/* <ConnectWalletBtn /> */}
        <Button>Connect Wallet</Button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left Section - Logo and Play Button */}
          <div className="lg:col-span-1 flex flex-col items-center space-y-8">
            {/* App Logo */}
            <div className="text-center space-y-4">
              <div className="relative">
                <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-light-primary to-primary bg-clip-text text-transparent font-cherry-bomb">
                  PANDA
                </h1>
                <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-light-primary to-primary bg-clip-text text-transparent font-cherry-bomb">
                  MONOPOLY
                </h2>
              </div>
              <p className="text-muted-foreground text-lg max-w-md">
                The ultimate blockchain monopoly experience on Solana
              </p>
            </div>

            {/* Play Now Button */}
            <Button
              onClick={handlePlayNow}
              size="lg"
              className="text-xl px-12 py-6 h-auto bg-gradient-to-r from-primary to-light-primary hover:from-dark-primary hover:to-primary transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Play className="mr-3 h-6 w-6" />
              Play Now
            </Button>
          </div>

          {/* Right Section - Room List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Game Rooms</h3>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                {(["all", "waiting", "in-progress", "ended"] as const).map(
                  (filter) => (
                    <Button
                      key={filter}
                      variant={
                        selectedFilter === filter ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                      className="capitalize"
                    >
                      {filter === "all"
                        ? "All Rooms"
                        : filter.replace("-", " ")}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* Room Cards */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredRooms.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No rooms found for the selected filter.
                  </p>
                </Card>
              ) : (
                filteredRooms.map((room) => {
                  const StatusIcon = statusIcons[room.status];
                  return (
                    <Card
                      key={room.id}
                      className="hover:shadow-md transition-shadow duration-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-lg">
                                {room.name}
                              </h4>
                              <Badge className={statusColors[room.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {room.status.replace("-", " ")}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>
                                  {room.players}/{room.maxPlayers} players
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTimeAgo(room.createdAt)}</span>
                              </div>
                              {room.winner && (
                                <div className="flex items-center gap-1">
                                  <Trophy className="w-4 h-4" />
                                  <span>
                                    Winner: {formatAddress(room.winner)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {room.status === "waiting" && (
                              <Button
                                onClick={() => handleJoinRoom(room.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Join
                              </Button>
                            )}
                            {room.status === "in-progress" && (
                              <Button
                                onClick={() => handleJoinRoom(room.id)}
                                size="sm"
                                variant="outline"
                              >
                                Spectate
                              </Button>
                            )}
                            {room.status === "ended" && (
                              <Button
                                onClick={() => handleJoinRoom(room.id)}
                                size="sm"
                                variant="outline"
                              >
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
