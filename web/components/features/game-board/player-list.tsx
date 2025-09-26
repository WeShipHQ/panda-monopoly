"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  cn,
  formatAddress,
  formatPrice,
  generatePlayerIcon,
} from "@/lib/utils";
import { useGameContext } from "@/components/game-provider";

export function PlayerList() {
  const { gameState, players, gameLoading } = useGameContext();

  if (gameLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Players</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!gameState || !players.length) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-4">Players</h2>
        <p className="text-gray-500">No players found</p>
      </div>
    );
  }

  const currentPlayerIndex = gameState.currentTurn;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Players</h2>
      <div className="space-y-3">
        {players.map((player, index) => {
          const playerInfo = generatePlayerIcon(player.wallet);
          const isCurrentTurn = index === currentPlayerIndex;

          return (
            <Card
              key={player.wallet}
              className={cn("py-3 relative", isCurrentTurn ? "bg-chart-3" : "")}
            >
              <CardContent className="px-3">
                <div className="flex items-center gap-3 justify-stretch">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={playerInfo.avatar}
                        alt={`Player ${index + 1}`}
                      />
                      <AvatarFallback
                        style={{ backgroundColor: playerInfo.color }}
                        className="text-white font-semibold"
                      >
                        {(index + 1).toString()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {formatAddress(player.wallet)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatPrice(Number(player.cashBalance), {
                        compact: true,
                      })}
                    </p>

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 mt-1">
                      {player.inJail && (
                        <Badge variant="default" className="text-xs">
                          Jail
                        </Badge>
                      )}
                      {player.isBankrupt && (
                        <Badge className="text-xs bg-red-100 text-red-800">
                          Bankrupt
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
