// Player selection step component
"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { PlayerAccount } from "@/types/schema";

interface PlayerSelectionStepProps {
  players: PlayerAccount[];
  onPlayerSelect: (player: PlayerAccount) => void;
}

// Simple format function for SOL amounts
const formatSolAmount = (amount: string): string => {
  const numAmount = parseFloat(amount) / 1000000000; // Convert lamports to SOL
  return numAmount.toFixed(3);
};

interface PlayerSelectionStepProps {
  players: PlayerAccount[];
  onPlayerSelect: (player: PlayerAccount) => void;
}

export function PlayerSelectionStep({
  players,
  onPlayerSelect,
}: PlayerSelectionStepProps) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-muted-foreground mb-1">No other players available</div>
        <div className="text-xs text-muted-foreground">
          Wait for more players to join the game
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="grid gap-2">
        {players.map((player) => (
          <div
            key={player.wallet}
            className="flex items-center justify-between p-3.5 rounded-md  dark:hover:bg-emerald-900/10 transition-colors cursor-pointer border border-gray-100/50 dark:border-gray-800/20"
            onClick={() => !player.isBankrupt && onPlayerSelect(player)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-emerald-600 text-white font-bold">
                  {player.wallet.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {player.wallet.slice(0, 6)}...
                </div>
                <div className="flex flex-col text-xs mt-0.5 space-y-0.5">
                  <div className="text-emerald-600 dark:text-emerald-400 font-medium">${player.cashBalance} cash</div>
                  <div className="text-emerald-600 dark:text-emerald-400">{player.propertiesOwned.length} properties</div>
                </div>
              </div>
            </div>

            <Button
              variant="default"
              disabled={player.isBankrupt}
              size="sm"
              className={`h-9 px-4 rounded-md ${player.isBankrupt ? 'bg-red-200 text-red-800' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
            >
              {player.isBankrupt ? "Bankrupt" : "Select"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}